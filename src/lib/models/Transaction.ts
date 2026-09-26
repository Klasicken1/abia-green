import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userEmail:     { type: String, required: true },
  type:          { type: String, enum: ["topup", "fare"], required: true },
  amount:        { type: Number, required: true },
  paymentMethod: { type: String, enum: ["qr", "nfc", "card"], required: true },
  route:         { type: String, default: null },
  busId:         { type: String, default: null },
  tripId:        { type: String, default: null },
  reference:     { type: String, required: true, unique: true },
  balanceAfter:  { type: Number, required: true },
  // Set when the passenger self-reports getting off — closes out this
  // specific paid ride so occupancy can be decremented exactly once.
  disembarkedAt: { type: Date, default: null },
  createdAt:     { type: Date, default: Date.now },
});

export const Transaction = mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);