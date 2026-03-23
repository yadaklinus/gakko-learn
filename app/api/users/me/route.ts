// app/api/users/me/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// GET: Fetch User Profile + Dashboard Stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        // --- Core Profile Data (Needed for Profile Page) ---
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        institution: true,
        major: true,
        bio: true,
        hourlyRate: true,
        subjects: true,
        currentRole: true,
        rating: true,
        totalReviews: true, // Useful for profile badges

        // --- Dashboard Data (Upcoming Bookings) ---
        bookingsAsStudent: {
          where: {
            date: { gte: new Date() },
            status: { not: 'CANCELLED' }
          },
          orderBy: { date: 'asc' },
          take: 5,
          select: {
            id: true,
            subject: true,
            topic: true,
            date: true,
            duration: true,
            tutor: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        bookingsAsTutor: {
          where: {
            date: { gte: new Date() },
            status: { not: 'CANCELLED' }
          },
          orderBy: { date: 'asc' },
          take: 10,
          select: {
            id: true,
            subject: true,
            topic: true,
            date: true,
            duration: true,
            status: true,
            student: {
              select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                institution: true,
                major: true
              }
            }
          }
        }
      }
    });

    if (!userData) {
      return new NextResponse('User not found', { status: 404 });
    }

    // --- Fetch Real Top Rated Tutors ---
    const topRatedTutors = await prisma.user.findMany({
      where: {
        role: { in: ['BOTH', 'ADMIN'] },
        id: { not: session.user.id },
        subjects: { not: null },
        rating: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        image: true,
        major: true,
        rating: true,
        totalReviews: true
      },
      orderBy: [
        { rating: 'desc' },
        { totalReviews: 'desc' }
      ],
      take: 3
    });

    return NextResponse.json({
      ...userData,
      topRatedTutors
    });
  } catch (error) {
    console.error('Dashboard/Profile GET Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH: Update User Profile
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();

    // Basic Validation: Ensure Name isn't empty if provided
    if (body.name && body.name.trim().length === 0) {
      return new NextResponse('Name cannot be empty', { status: 400 });
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name,
        institution: body.institution,
        major: body.major,
        bio: body.bio,

        // Convert hourlyRate to float if it exists, otherwise undefined
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : undefined,
        subjects: body.subjects,
        currentRole: body.currentRole, // Allow updating currentRole for switching views
        // Note: We generally don't let users update 'role' or 'email' casually via a simple profile edit
        // validation for those usually happens in specific settings flows.
      },
      // Return the fields the frontend needs to update the UI immediately
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        currentRole: true,
        institution: true,
        major: true,
        bio: true,
        hourlyRate: true,
        subjects: true,
        rating: true,
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile PATCH Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}