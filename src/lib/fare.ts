export function parseNairaFare(fareStr: string): number {
  const n = parseInt(fareStr.replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

// A passenger boarding partway through a trip pays roughly proportional to
// the distance remaining — never less than 30% of the full fare, matching
// how real transit systems handle short hops with a minimum boarding fee.
const MIN_FARE_FRACTION = 0.3;

export function calculateBoardingFare(fullFare: number, progressAtBoarding: number): number {
  const remainingFraction = Math.max(0, 1 - progressAtBoarding / 100);
  const raw = fullFare * remainingFraction;
  const floor = fullFare * MIN_FARE_FRACTION;
  const fare = Math.max(floor, raw);
  return Math.round(fare / 50) * 50; // round to the nearest ₦50
}