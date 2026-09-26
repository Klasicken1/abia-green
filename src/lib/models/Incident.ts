import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema({
  reporterEmail: { type: String, required: true },
  reporterRole:  { type: String, enum: ["citizen", "driver", "admin", "superadmin"], required: true },
  busId:         { type: String, required: true },
  busLabel:      { type: String, default: null },
  route:         { type: String, default: null },
  category: {
    type: String,
    enum: ["breakdown", "accident", "safety_concern", "driver_conduct", "passenger_conduct", "other"],
    required: true,
  },
  severity:      { type: String, enum: ["low", "moderate", "high", "critical"], default: "moderate" },
  description:   { type: String, default: "" },
  photoUrl:      { type: String, default: null },
  photoPublicId: { type: String, default: null },
  status:        { type: String, enum: ["pending", "in_review", "resolved"], default: "pending" },
  resolvedBy:    { type: String, default: null },
  resolvedAt:    { type: Date, default: null },
  createdAt:     { type: Date, default: Date.now },
});

export const Incident = mongoose.models.Incident || mongoose.model("Incident", IncidentSchema);