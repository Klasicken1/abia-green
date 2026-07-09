import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email:   { type: String, required: true, unique: true },
  role:    { type: String, enum: ["rider", "driver", "admin"], default: null },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User ||
  mongoose.model("User", UserSchema);