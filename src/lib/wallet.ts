import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Transaction } from "@/lib/models/Transaction";
import { Journey } from "@/lib/models/Journey";
import { Bus } from "@/lib/models/Bus";
import { ROUTES } from "@/lib/routesData";
import { recordTelemetry } from "@/lib/telemetry";

function generateReference(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

/**
 * Adds funds to a user's balance and logs the transaction. Every top-up —
 * Paystack today, any future provider — should go through this, not touch
 * User.balance directly, so the Transaction log stays complete.
 */
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

/**
 * Charges the fare for a specific bus a citizen is boarding, identified by
 * scanning that bus's QR code (or, later, tapping an NFC reader). This is
 * the one path any boarding-payment method writes through — the QR scan
 * page calls it with paymentMethod: "qr"; a future NFC reader calls the
 * exact same function with paymentMethod: "nfc". Neither the fare logic,
 * the balance check, nor the Journey/Transaction logging changes either way.
 */
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

  // One payment per passenger per ride: if this user already has a fare
  // Transaction logged for this exact tripId, they've already boarded and
  // paid — reject a repeat scan instead of charging (and counting) them again.
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

  // Parse "₦800" -> 800
  const fare = parseInt(routeInfo.fare.replace(/[^\d]/g, ""), 10);
  if (!fare) {
    return { ok: false, error: "Could not determine fare for this route" };
  }

  const user = await User.findOne({ email: userEmail });
  if (!user || user.balance < fare) {
    return { ok: false, error: "Insufficient Connect Card balance" };
  }

  // Atomic guard: only debit if balance is still sufficient at write time
  // (protects against a double-scan race — two rapid charges on the same
  // low balance can't both succeed).
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

  // A successful fare payment is a real boarding event — bump the driver's
  // occupancy count through the same telemetry seam the manual count uses.
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