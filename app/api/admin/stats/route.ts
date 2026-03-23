import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const [
      totalUsers,
      userRoles,
      totalBookings,
      bookingStatus,
      totalConnections,
      connectionStatus,
      totalMessages,
      newUsers7d,
      newUsers30d,
      supportTickets,
      topTutors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.connection.count(),
      prisma.connection.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.message.count(),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.supportTicket.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.user.findMany({
        where: { role: { in: ["BOTH"] } }, // Assuming BOTH means a tutor
        orderBy: { rating: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
          totalReviews: true,
        },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        breakdown: userRoles,
        newLast7d: newUsers7d,
        newLast30d: newUsers30d,
      },
      bookings: {
        total: totalBookings,
        breakdown: bookingStatus,
      },
      connections: {
        total: totalConnections,
        breakdown: connectionStatus,
      },
      messages: {
        total: totalMessages,
      },
      tickets: {
        breakdown: supportTickets,
      },
      topTutors,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
