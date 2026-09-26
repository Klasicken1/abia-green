import mongoose from "mongoose";

// One document per browser/device subscription. A user can have several
// (phone + desktop), so this isn't keyed uniquely by email alone —
// endpoint is the real unique identifier a push service gives each device.
const PushSubscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  endpoint:  { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth:   { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export const PushSubscription = mongoose.models.PushSubscription
  || mongoose.model("PushSubscription", PushSubscriptionSchema);