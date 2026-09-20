import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  trackingId:  { type: String, required: true, unique: true },
  type:        { type: String, required: true },
  lga:         { type: String, required: true },
  severity:    { type: String, required: true },
  description: { type: String, default: "" },
  photoUrl:    { type: String, default: null },

  // Existing statuses (pending, assigned, in_progress, resolved) are kept
  // exactly as-is so nothing already in the DB or the admin dashboard's
  // filter tabs breaks. Two new values are added for moderation:
  // "pending_review" (not yet visible/actionable — awaiting admin approval)
  // and "rejected" (spam/abuse, moderated out).
  status: {
    type: String,
    enum: ["pending_review", "pending", "assigned", "in_progress", "resolved", "rejected"],
    default: "pending",
  },

  // Moderation audit trail — who approved/rejected a held report, and when
  moderatedBy: { type: String, default: null },
  moderatedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },

  // Cheap duplicate signal: same LGA + type within a short window gets
  // flagged for admin attention, never auto-rejected
  possibleDuplicate: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);