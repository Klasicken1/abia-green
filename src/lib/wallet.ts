import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Transaction } from "@/lib/models/Transaction";
import { Journey } from "@/lib/models/Journey";
import { Bus } from "@/lib/models/Bus";
import { ROUTES } from "@/lib/routesData";
import { recordTelemetry } from "@/lib/telemetry";
import { parseNairaFare, calculateBoardingFare } from "@/lib/fare";

function generateReference(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

export async function topUp(userEmail: string, amount: number, paymentMethod: "card" = "card") {
  await connectDB();

  const user = await User.findOneAndUpdate(
    { email: userEmail },
    { $inc: { balance: amount } },
    { upsert: true, new: true }
  );

  const reference = generateReference("PS");
  await Transaction.create({
    userEmail,
    type: "topup",
    amount,
    paymentMethod,
    reference,
    balanceAfter: user.balance,
  });

  return { balance: user.balance, reference };
}

export type FareChargeResult =
  | { ok: true; balance: number; reference: string; fare: number }
  | { ok: false; error: string };

export async function chargeFare(
  userEmail: string,
  busId: string,
  paymentMethod: "qr" | "nfc"
): Promise<FareChargeResult> {
  await connectDB();

  const bus = await Bus.findById(busId);
  if (!bus) {
    return { ok: false, error: "Bus not found" };
  }
  if (bus.status !== "on_route") {
    return { ok: false, error: "This bus is not currently on a trip" };
  }
  if (!bus.tripId) {
    return { ok: false, error: "This trip isn't ready for payments yet. Try again in a moment." };
  }

  const alreadyPaid = await Transaction.findOne({
    userEmail,
    busId: bus._id.toString(),
    tripId: bus.tripId,
    type: "fare",
  });
  if (alreadyPaid) {
    return { ok: false, error: "You've already paid for this trip on this bus." };
  }

  const routeInfo = ROUTES[bus.route];
  if (!routeInfo) {
    return { ok: false, error: "Route information unavailable" };
  }

  const fullFare = parseNairaFare(routeInfo.fare);
  if (!fullFare) {
    return { ok: false, error: "Could not determine fare for this route" };
  }

  // Prorated by how far along the bus already is when this passenger boards —
  // full fare from the start, less if they're joining partway.
  const fare = calculateBoardingFare(fullFare, bus.progress);

  const user = await User.findOne({ email: userEmail });
  if (!user || user.balance < fare) {
    return { ok: false, error: "Insufficient Connect Card balance" };
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: userEmail, balance: { $gte: fare } },
    { $inc: { balance: -fare } },
    { new: true }
  );

  if (!updatedUser) {
    return { ok: false, error: "Insufficient Connect Card balance" };
  }

  const reference = generateReference("FARE");

  await Transaction.create({
    userEmail,
    type: "fare",
    amount: fare,
    paymentMethod,
    route: bus.route,
    busId: bus._id.toString(),
    tripId: bus.tripId,
    reference,
    balanceAfter: updatedUser.balance,
  });

  await recordTelemetry({
    busId: bus._id.toString(),
    occupancy: bus.occupancy + 1,
    source: "manual",
  });

  await Journey.create({
    userEmail,
    route: bus.route,
    from: routeInfo.origin,
    to: routeInfo.destination,
    fare,
    paymentMethod: "connect_card",
    source: "fare_payment",
  });

  return { ok: true, balance: updatedUser.balance, reference, fare };
}

export type DisembarkResult =
  | { ok: true; occupancy: number }
  | { ok: false; error: string };

// A passenger self-reports getting off — the only realistic mechanism
// without seat sensors or geofencing. Tied to their own unclosed fare
// Transaction for this exact trip, so it can't be spoofed or double-tapped.
export async function disembark(userEmail: string, busId: string): Promise<DisembarkResult> {
  await connectDB();

  const bus = await Bus.findById(busId);
  if (!bus || !bus.tripId) {
    return { ok: false, error: "This trip is no longer active." };
  }

  const txn = await Transaction.findOne({
    userEmail,
    busId: bus._id.toString(),
    tripId: bus.tripId,
    type: "fare",
    disembarkedAt: null,
  });

  if (!txn) {
    return { ok: false, error: "No active ride found for you on this bus." };
  }

  txn.disembarkedAt = new Date();
  await txn.save();

  const newOccupancy = Math.max(0, bus.occupancy - 1);
  const updated = await recordTelemetry({
    busId: bus._id.toString(),
    occupancy: newOccupancy,
    source: "manual",
  });

  return { ok: true, occupancy: updated?.occupancy ?? newOccupancy };
}