import type { RouteInfo } from "@/lib/routesData";

// Parses labels like "Departure", "~15 min", "~2 hrs" into minutes from
// departure — an approximation until stops are individually geo/time
// surveyed, good enough to orient a driver or estimate a citizen's wait.
export function parseMinutesLabel(label: string): number {
  if (/departure/i.test(label)) return 0;
  const hrMatch = label.match(/(\d+(?:\.\d+)?)\s*hr/i);
  if (hrMatch) return parseFloat(hrMatch[1]) * 60;
  const minMatch = label.match(/(\d+)/);
  return minMatch ? parseInt(minMatch[1], 10) : 0;
}

// Minutes from now until the bus reaches a given stop, based on how far
// along the trip it currently is. Never negative — a stop already passed
// reads as 0 ("arriving now / already passed").
export function estimateMinutesToStop(
  routeInfo: RouteInfo,
  progress: number,
  stopIndex: number
): number {
  const totalMinutes = parseMinutesLabel(routeInfo.duration);
  const stop = routeInfo.stops[stopIndex];
  if (!stop || totalMinutes <= 0) return 0;
  const stopMinute = parseMinutesLabel(stop.time);
  const elapsedMinutes = totalMinutes * (progress / 100);
  return Math.max(0, Math.round(stopMinute - elapsedMinutes));
}