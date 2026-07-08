import mongoose from "mongoose";

const JourneySchema = new mongoose.Schema({
  userEmail:     { type: String, required: true },
  route:         { type: String, required: true },      // e.g. "umuahia-aba"
  from:          { type: String, required: true },
  to:            { type: String, required: true },
  fare:          { type: Number, required: true },
  paymentMethod: { type: String, default: "connect_card" },
  source:        { type: String, enum: ["fare_payment", "manual"], default: "fare_payment" },
  boardedAt:     { type: Date, default: Date.now },
  createdAt:     { type: Date, default: Date.now },
});

export const Journey = mongoose.models.Journey ||
  mongoose.model("Journey", JourneySchema);