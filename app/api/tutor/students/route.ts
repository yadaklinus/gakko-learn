import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import  {prisma}  from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Import from the new file


export async function GET(req: Request) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Get URL Search Params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";

    // 3. Fetch Tutor's Current Rate (for calculation)
    const tutor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hourlyRate: true }
    });

    const hourlyRate = tutor?.hourlyRate || 0;

    // 4. Fetch All Relevant Bookings
    // We fetch bookings first, then aggregate in memory because
    // Prisma's distinct/groupBy doesn't easily allow returning relation data (Student Name/Image) in one go.
    const bookings = await prisma.booking.findMany({
      where: {
        tutorId: session.user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        student: {
          OR: [
            { name: { contains: search } }, // SQLite is case-sensitive usually, but Prisma mimics insensitive often.
            // For true SQLite case-insensitive, we handle filtering in JS below if strictly needed, 
            // but contains works for basic cases.
          ]
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true,
            institution: true,
            major: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // 5. Aggregate Data by Student
    const studentMap = new Map();

    for (const booking of bookings) {
      const sId = booking.studentId;

      if (!studentMap.has(sId)) {
        studentMap.set(sId, {
          id: booking.student.id,
          name: booking.student.name,
          image: booking.student.image,
          institution: booking.student.institution,
          major: booking.student.major,
          totalSessions: 0,
          totalDurationMinutes: 0,
          lastSessionDate: booking.date, // First one we hit is the latest due to orderBy
        });
      }

      const entry = studentMap.get(sId);
      entry.totalSessions += 1;
      entry.totalDurationMinutes += booking.duration;
    }

    // 6. Format for Frontend
    const students = Array.from(studentMap.values()).map((s) => {
      // Logic for Active status: If last session was within 30 days
      const daysSinceLastSession = (new Date().getTime() - new Date(s.lastSessionDate).getTime()) / (1000 * 3600 * 24);
      
      return {
        id: s.id,
        name: s.name,
        image: s.image,
        institution: s.institution,
        major: s.major,
        totalSessions: s.totalSessions,
        lastSessionDate: s.lastSessionDate,
        // Estimate spent: (Minutes / 60) * Hourly Rate
        totalSpent: Math.round((s.totalDurationMinutes / 60) * hourlyRate),
        status: daysSinceLastSession <= 30 ? 'ACTIVE' : 'INACTIVE'
      };
    });

    return NextResponse.json({ students }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}