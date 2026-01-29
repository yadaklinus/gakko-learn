import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';
// POST: Student sends a "Add Tutor" request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { tutorId } = await req.json();

    if (!tutorId) return new NextResponse("Tutor ID required", { status: 400 });

    // Create pending connection
    const connection = await prisma.connection.create({
      data: {
        studentId: session.user.id,
        tutorId: tutorId,
        status: "PENDING"
      }
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Request already sent" }, { status: 409 });
    }
    console.error("Connection POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Tutor accepts or declines a request
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { connectionId, status } = await req.json();

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
        return new NextResponse("Invalid status", { status: 400 });
    }

    const updated = await prisma.connection.updateMany({
        where: {
            id: connectionId,
            tutorId: session.user.id 
        },
        data: { status }
    });

    if (updated.count === 0) {
        return new NextResponse("Connection not found or unauthorized", { status: 404 });
    }

    if (status === 'ACCEPTED') {
        await prisma.message.create({
            data: {
                connectionId: connectionId,
                senderId: session.user.id,
                content: "Request accepted! You can now begin to chat.",
                isRead: false
            }
        });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Connection PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Fetch Connections (Pending or Accepted)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        // Default to PENDING if not specified to maintain backward compatibility with Requests View
        const status = (searchParams.get("status") as any) || "PENDING";

        const connections = await prisma.connection.findMany({
            where: {
                tutorId: session.user.id,
                status: status 
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        institution: true,
                        major: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Return generic 'connections' key to handle both contexts
        return NextResponse.json({ connections });
    } catch (error) {
        console.error("Connection GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}