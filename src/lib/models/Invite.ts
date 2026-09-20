import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["driver", "admin", "superadmin"], required: true },
  invitedBy: { type: String, required: true },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const Invite = mongoose.models.Invite || mongoose.model("Invite", InviteSchema);