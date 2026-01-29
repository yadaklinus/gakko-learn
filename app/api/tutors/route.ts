import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    // 1. Fetch Tutors
    const tutorsData = await prisma.user.findMany({
      where: {
        role: { in: ["TUTOR", "BOTH"] },
        
        // FIX: Only apply NOT filter if session.user.id exists
        ...(session?.user?.id ? { NOT: { id: session.user.id } } : {}),

        OR: search ? [
          { name: { contains: search } },
          { major: { contains: search } },
          { subjects: { contains: search } }, 
        ] : undefined
      },
      select: {
        id: true,
        name: true,
        image: true,
        institution: true,
        major: true,
        bio: true,
        hourlyRate: true,
        subjects: true,
        rating: true,
        totalReviews: true,
        // 2. Check connection status ONLY if user is logged in
        // We check if there is a connection where I am the student and THEY are the tutor
        connectionsAsTutor: session?.user?.id ? {
          where: { studentId: session.user.id },
          select: { status: true }
        } : false
      },
      orderBy: { rating: "desc" },
      take: 20 
    });

    // 3. Flatten the structure for the frontend
    const tutors = tutorsData.map((t: any) => ({
      ...t,
      // If array has items, grab the status, otherwise null
      connectionStatus: t.connectionsAsTutor?.[0]?.status || null,
      connectionsAsTutor: undefined // Clean up response to avoid sending the array
    }));

    return NextResponse.json({ tutors });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}