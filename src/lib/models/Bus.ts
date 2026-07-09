import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busId:        { type: String, required: true }, // no longer globally unique — display label only
  route:        { type: String, required: true },
  routeLabel:   { type: String, required: true },
  driverEmail:  { type: String, required: true, unique: true },
  status:       { type: String, enum: ["idle", "on_route"], default: "idle" },
  progress:     { type: Number, default: 0 },
  occupancy:    { type: Number, default: 0 },
  etaMinutes:   { type: Number, default: null },
  updatedAt:    { type: Date, default: Date.now },
});

export const Bus = mongoose.models.Bus ||
  mongoose.model("Bus", BusSchema);