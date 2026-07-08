import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busId:        { type: String, required: true, unique: true }, // e.g. "BUS-04"
  route:        { type: String, required: true },                // e.g. "umuahia-aba"
  routeLabel:   { type: String, required: true },                // e.g. "Umuahia → Aba"
  driverEmail:  { type: String, required: true },
  status:       { type: String, enum: ["idle", "on_route"], default: "idle" },
  progress:     { type: Number, default: 0 },   // 0–100
  occupancy:    { type: Number, default: 0 },   // passengers boarded this trip
  etaMinutes:   { type: Number, default: null },
  updatedAt:    { type: Date, default: Date.now },
});

export const Bus = mongoose.models.Bus ||
  mongoose.model("Bus", BusSchema);