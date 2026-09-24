import { connectDB } from "@/lib/db";
import { Bus } from "@/lib/models/Bus";

export type TelemetrySource = "manual" | "gps_device";

interface TelemetryInput {
  busId: string;        // Mongo _id of the Bus
  progress?: number;
  occupancy?: number;
  etaMinutes?: number | null;
  source: TelemetrySource;
}

/**
 * Every progress/occupancy update — the driver's manual slider today, a
 * real GPS/boarding device tomorrow — goes through this one function.
 * Nothing else in the app should write to Bus.progress, Bus.occupancy,
 * or Bus.etaMinutes directly. Swapping "manual" for "gps_device" later
 * means adding a new caller here, not touching the schema, the rider
 * map, or the admin dashboard.
 */
export async function recordTelemetry(input: TelemetryInput) {
  await connectDB();

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (input.progress !== undefined)   update.progress = input.progress;
  if (input.occupancy !== undefined)  update.occupancy = input.occupancy;
  if (input.etaMinutes !== undefined) update.etaMinutes = input.etaMinutes;

  const bus = await Bus.findByIdAndUpdate(input.busId, update, { new: true });
  return bus;
}