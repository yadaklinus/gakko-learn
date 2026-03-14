import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from "zod";

// Updated schema to support multiple students
const bookingSchema = z.object({
  tutorId: z.string().optional(), // Used when Student books
  studentIds: z.array(z.string()).optional(), // Used when Tutor schedules (Array of IDs)
  subject: z.string().min(2),
  topic: z.string().optional().nullable(),
  date: z.string().datetime(),
  duration: z.number().min(15).max(180),
  location: z.string().optional().nullable(),
});

// GET: Fetch User's Schedule
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { studentId: session.user.id },
          { tutorId: session.user.id },
          { groupStudents: { some: { id: session.user.id } } }
        ],
        ...(status ? { status: status as any } : {})
      },
      include: {
        student: { select: { id: true, name: true, image: true, email: true } },
        tutor: { select: { id: true, name: true, image: true } },
        groupStudents: { select: { id: true, name: true, image: true, email: true } }
      },
      orderBy: { date: "asc" }
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("GET Bookings Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create Booking(s)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id as string; // Fix: Cast to string

    const body = await req.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { tutorId, studentIds, subject, topic, date, duration, location } = result.data;

    // SCENARIO 1: Tutor Scheduling (Group or Single)
    if (studentIds && studentIds.length > 0) {
      const isGroup = studentIds.length > 1;

      const booking = await prisma.booking.create({
        data: {
          tutorId: currentUserId,
          studentId: isGroup ? null : studentIds[0], // Set studentId for 1-on-1
          subject,
          topic: topic || null,
          date: new Date(date),
          duration,
          location: location || "Online",
          status: "CONFIRMED",
          isGroup: isGroup,
          groupStudents: {
            connect: studentIds.map(id => ({ id }))
          }
        },
        include: {
          groupStudents: { select: { name: true, email: true } },
          tutor: { select: { name: true } }
        }
      });

      return NextResponse.json({
        message: `Scheduled ${isGroup ? 'group class' : 'class'} for ${studentIds.length} student(s)`,
        booking: booking
      }, { status: 201 });
    }

    // SCENARIO 2: Student Booking a Tutor (Single)
    else if (tutorId) {
      const booking = await prisma.booking.create({
        data: {
          tutorId: tutorId,           // Target tutor
          studentId: currentUserId,   // Use the casted ID
          subject,
          topic: topic || null,
          date: new Date(date),
          duration,
          location: location || "Online",
          status: "PENDING", // Needs approval
        },
        include: {
          student: { select: { name: true, email: true } },
          tutor: { select: { name: true } }
        }
      });

      return NextResponse.json({ message: "Request sent", booking }, { status: 201 });
    } else {
      return NextResponse.json({ message: "Must provide either tutorId or studentIds" }, { status: 400 });
    }

  } catch (error) {
    console.error("POST Booking Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}