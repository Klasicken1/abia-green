import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { Transaction } from "@/lib/models/Transaction";
import { ROUTES } from "@/lib/routesData";

// Real revenue aggregates from Transaction — fares only (top-ups are
// funds moving onto a card, not revenue earned by the transport system).
export async function GET() {
  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [totalAgg, todayAgg, byRouteAgg, dailyAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: "fare" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "fare", createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "fare" } },
        { $group: { _id: "$route", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { type: "fare", createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const byRoute = byRouteAgg.map(r => ({
      route: r._id,
      routeLabel: r._id ? ROUTES[r._id]?.name ?? r._id : "Unknown",
      total: r.total,
      count: r.count,
    }));

    return NextResponse.json({
      allTime: { total: totalAgg[0]?.total ?? 0, count: totalAgg[0]?.count ?? 0 },
      today: { total: todayAgg[0]?.total ?? 0, count: todayAgg[0]?.count ?? 0 },
      byRoute,
      last7Days: dailyAgg.map(d => ({ date: d._id, total: d.total, count: d.count })),
    });
  } catch (err) {
    console.error("GET /api/admin/revenue failed:", err);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}