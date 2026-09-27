import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  trackingId:  { type: String, required: true, unique: true },
  type:        { type: String, required: true },
  lga:         { type: String, required: true },
  severity:    { type: String, required: true },
  description: { type: String, default: "" },
  photoUrl:      { type: String, default: null },
  photoPublicId: { type: String, default: null },

  // Optional — set only when the submitter was signed in at the time of
  // submission. Anonymous submissions (the default, no sign-in required)
  // leave this null: no "My Reports" entry, no push notifications, by design.
  userEmail: { type: String, default: null },

  status: {
    type: String,
    enum: ["pending_review", "pending", "assigned", "in_progress", "resolved", "rejected"],
    default: "pending",
  },

  moderatedBy: { type: String, default: null },
  moderatedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },

  possibleDuplicate: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);