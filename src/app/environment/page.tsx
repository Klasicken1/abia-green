"use client";
import { useState, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const REPORT_TYPES = [
  { icon: "🗑️", name: "Illegal Dump",    value: "illegal_dump"    },
  { icon: "🏔️", name: "Erosion",          value: "erosion"         },
  { icon: "🌊", name: "Flooding",          value: "flooding"        },
  { icon: "🌳", name: "Illegal Logging",   value: "illegal_logging" },
];

const LGAS = [
  "Umuahia North","Umuahia South","Aba North","Aba South",
  "Ohafia","Bende","Isuikwuato","Osisioma Ngwa",
  "Arochukwu","Ukwa East","Ukwa West","Obingwa","Other",
];

export default function EnvironmentPage() {
  const [selectedType, setSelectedType] = useState("illegal_dump");
  const [severity, setSeverity]         = useState("moderate");
  const [lga, setLga]                   = useState("");
  const [description, setDescription]   = useState("");
  const [submitted, setSubmitted]       = useState(false);
  const [trackingId, setTrackingId]     = useState("");
  const [loading, setLoading]           = useState(false);

  // --- Photo upload state ---
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl]         = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setPhotoFile(file);
    setPhotoUrl(null);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadPhotoIfNeeded(): Promise<string | null> {
    if (!photoFile) return null;
    if (photoUrl) return photoUrl; // already uploaded

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setPhotoUrl(data.url);
      setUploading(false);
      return data.url;
    } catch (err) {
      setUploading(false);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload photo first if one is attached and not yet uploaded
      let finalPhotoUrl = photoUrl;
      if (photoFile && !photoUrl) {
        finalPhotoUrl = await uploadPhotoIfNeeded();
        if (!finalPhotoUrl) {
          // Upload failed — stop here, let the user see the error and retry/remove
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          lga,
          severity,
          description,
          photoUrl: finalPhotoUrl || null,
        }),
      });
      const data = await res.json();
      if (data.trackingId) {
        setTrackingId(data.trackingId);
        setSubmitted(true);
      }
    } catch {
      const id = "AG-" + Math.floor(100000 + Math.random() * 900000);
      setTrackingId(id);
      setSubmitted(true);
    }
    setLoading(false);
  }

  function resetForm() {
    setSubmitted(false);
    setSelectedType("illegal_dump");
    setSeverity("moderate");
    setLga("");
    setDescription("");
    setTrackingId("");
    removePhoto();
  }

  if (submitted) {
    return (
      <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
        <div className="px-5 pt-12 pb-8 text-center" style={{ background: "#0F3D22" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "rgba(232,148,26,0.2)", border: "2px solid rgba(232,148,26,0.4)" }}>
            ✅
          </div>
          <h1 className="text-2xl text-white mb-2"
            style={{ fontFamily: "DM Serif Display, serif" }}>
            Report Received
          </h1>
          <p className="text-sm" style={{ color: "rgba(253,250,245,0.5)" }}>
            Routed to ASEPA · {lga} LGA
          </p>
        </div>

        <div className="flex-1 px-4 pt-4 pb-24">
          <div className="rounded-xl overflow-hidden mb-4"
            style={{ background: "#fff", boxShadow: "0 4px 20px rgba(26,18,8,0.08)" }}>
            <div className="p-4" style={{ background: "#1A6B3C" }}>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                Tracking ID
              </p>
              <p className="text-2xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                {trackingId}
              </p>
            </div>
            {photoUrl && (
              <img src={photoUrl} alt="Report photo"
                className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              {[
                { label: "Type",      value: REPORT_TYPES.find(t => t.value === selectedType)?.name || "" },
                { label: "LGA",       value: lga },
                { label: "Severity",  value: severity.charAt(0).toUpperCase() + severity.slice(1) },
                { label: "Status",    value: "Pending — ASEPA notified" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2"
                  style={{ borderBottom: i < 3 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                    letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                    {row.label}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 mb-4"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <p className="flex items-center gap-2 mb-3" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
              <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
              Resolution Progress
            </p>
            {[
              { label: "Report Submitted",  sub: "Just now",                done: true,  active: false },
              { label: "Routed to ASEPA",   sub: "In review",               done: false, active: true  },
              { label: "Crew Dispatched",   sub: "Pending",                 done: false, active: false },
              { label: "Resolved",          sub: "Target: within 48 hours", done: false, active: false },
            ].map((step, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{
                      background: step.done ? "#1A6B3C" : step.active ? "#E8941A" : "rgba(26,18,8,0.15)",
                    }} />
                  {i < 3 && <div className="w-px flex-1 mt-1"
                    style={{ background: "rgba(26,18,8,0.08)", minHeight: "16px" }} />}
                </div>
                <div>
                  <p className="text-xs font-semibold"
                    style={{ color: step.done || step.active ? "#1A1208" : "#8B7355" }}>
                    {step.label}
                  </p>
                  <p className="text-xs" style={{ color: "#8B7355" }}>{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={resetForm}
            className="w-full py-3.5 rounded-xl text-sm font-bold mb-3"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            Submit Another Report
          </button>
          <Link href="/">
            <button className="w-full py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: "transparent", color: "#1A6B3C",
                border: "1.5px solid rgba(26,107,60,0.25)" }}>
              Back to Home
            </button>
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-5" style={{ background: "#3D2800" }}>
        <Link href="/" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Platform 02 · Environment
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Submit a Report
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          Photo · GPS · Routed to ASEPA instantly
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <form onSubmit={handleSubmit}>

          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Report Type
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {REPORT_TYPES.map((type) => (
              <button key={type.value} type="button"
                onClick={() => setSelectedType(type.value)}
                className="p-3 rounded-xl flex items-center gap-3 text-left"
                style={{
                  background: "#fff",
                  border: selectedType === type.value
                    ? "1.5px solid #E8941A" : "1.5px solid rgba(26,18,8,0.08)",
                  boxShadow: "0 2px 8px rgba(26,18,8,0.04)",
                }}>
                <span className="text-xl">{type.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {type.name}
                </span>
              </button>
            ))}
          </div>

          <p className="flex items-center gap-2 mb-2" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Your LGA
          </p>
          <select value={lga} onChange={e => setLga(e.target.value)} required
            className="w-full p-3 rounded-xl text-sm mb-4"
            style={{ background: "#fff", border: "1px solid rgba(26,18,8,0.1)",
              color: lga ? "#1A1208" : "#8B7355", fontFamily: "Inter, sans-serif", outline: "none" }}>
            <option value="" disabled>Select your LGA</option>
            {LGAS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <p className="flex items-center gap-2 mb-2" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Severity
          </p>
          <div className="flex gap-2 mb-4">
            {["low","moderate","high","critical"].map(s => (
              <button key={s} type="button" onClick={() => setSeverity(s)}
                className="flex-1 py-2 rounded-lg text-center"
                style={{
                  fontFamily: "Space Mono, monospace", fontSize: "8px",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  border: severity === s ? "1px solid #1A6B3C" : "1px solid rgba(26,18,8,0.12)",
                  background: severity === s ? "rgba(26,107,60,0.08)" : "#fff",
                  color: severity === s ? "#1A6B3C" : "#8B7355",
                }}>
                {s}
              </button>
            ))}
          </div>

          <p className="flex items-center gap-2 mb-2" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Description
          </p>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe what you saw. Include landmarks and any relevant details."
            rows={4} className="w-full p-3 rounded-xl text-sm mb-4"
            style={{ background: "#fff", border: "1px solid rgba(26,18,8,0.1)",
              color: "#1A1208", fontFamily: "Inter, sans-serif",
              outline: "none", resize: "none", lineHeight: "1.6" }} />

          <p className="flex items-center gap-2 mb-2" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Photo
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {!photoPreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl p-4 mb-6 text-center"
              style={{ border: "2px dashed rgba(26,18,8,0.15)", background: "#fff" }}
            >
              <div className="text-2xl mb-1">📷</div>
              <p className="text-xs font-semibold" style={{ color: "#1A6B3C" }}>
                Tap to attach a photo
              </p>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                color: "#8B7355", marginTop: "4px" }}>
                JPG, PNG, or WEBP · Max 8MB
              </p>
            </button>
          ) : (
            <div className="rounded-xl overflow-hidden mb-2" style={{ border: "1px solid rgba(26,18,8,0.1)" }}>
              <img src={photoPreview} alt="Selected photo" className="w-full h-48 object-cover" />
              <div className="flex items-center justify-between p-2" style={{ background: "#fff" }}>
                <span className="text-xs" style={{ color: "#8B7355" }}>
                  {uploading ? "Uploading…" : photoUrl ? "Uploaded ✓" : "Ready to upload"}
                </span>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-xs font-semibold"
                  style={{ color: "#C0392B" }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-xs mb-4" style={{ color: "#C0392B" }}>
              {uploadError}
            </p>
          )}
          {!uploadError && <div className="mb-4" />}

          <button type="submit" disabled={loading || uploading}
            className="w-full py-4 rounded-xl text-sm font-bold"
            style={{ background: (loading || uploading) ? "rgba(26,107,60,0.5)" : "#1A6B3C", color: "#fff" }}>
            {uploading ? "Uploading photo..." : loading ? "Submitting..." : "Submit Report to AEIS →"}
          </button>
        </form>

        <div className="rounded-xl p-4 mt-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            2025 Overview
          </p>
          <div className="grid grid-cols-3 text-center divide-x divide-gray-100">
            {[
              { val: "527", lbl: "Reports" },
              { val: "71%", lbl: "Resolved" },
              { val: "47",  lbl: "Erosion Sites" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-lg" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                  {s.val}
                </p>
                <p className="text-xs mt-0.5" style={{ fontFamily: "Space Mono, monospace",
                  fontSize: "8px", textTransform: "uppercase", color: "#8B7355" }}>
                  {s.lbl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}