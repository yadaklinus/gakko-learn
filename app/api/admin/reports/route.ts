import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // users, bookings, revenue
  const days = parseInt(searchParams.get("days") || "30");

  interface BookingWithTutor {
    createdAt: Date;
    duration: number;
    tutor: { hourlyRate: number | null };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let data: { date: string; count: number }[] = [];

    if (type === "users") {
      const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });
      data = groupDataByDate(users, "createdAt");
    } else if (type === "bookings") {
      const bookings = await prisma.booking.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });
      data = groupDataByDate(bookings, "createdAt");
    } else if (type === "revenue") {
      const revenueBookings = (await prisma.booking.findMany({
        where: { 
          createdAt: { gte: startDate },
          status: "COMPLETED"
        },
        select: { createdAt: true, duration: true, tutor: { select: { hourlyRate: true } } },
        orderBy: { createdAt: "asc" },
      })) as unknown as BookingWithTutor[];
      
      const revenueData = revenueBookings.map((b: BookingWithTutor) => ({
        date: b.createdAt.toISOString().split("T")[0],
        value: (b.duration / 60) * (b.tutor.hourlyRate || 0)
      }));

      const grouped = revenueData.reduce((acc: Record<string, number>, curr: { date: string, value: number }) => {
        acc[curr.date] = (acc[curr.date] || 0) + curr.value;
        return acc;
      }, {});
      
      data = Object.keys(grouped).map(date => ({ date, count: grouped[date] }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reports GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

function groupDataByDate(items: any[], dateField: string) {
  const grouped = items.reduce((acc: any, item) => {
    const date = item[dateField].toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(grouped).map(date => ({
    date,
    count: grouped[date]
  }));
}
