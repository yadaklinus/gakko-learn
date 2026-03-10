import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;
        const tutorId = id;

        if (!tutorId) {
            return NextResponse.json({ error: "Tutor ID is required" }, { status: 400 });
        }

        // 1. Fetch Tutor Details
        const tutor = await prisma.user.findUnique({
            where: {
                id: tutorId,
                role: { in: ["BOTH"] }, // Ensure they are a tutor
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
                // 2. Check connection status for the current user
                connectionsAsTutor: session?.user?.id ? {
                    where: { studentId: session.user.id },
                    select: { status: true }
                } : false
            }
        });

        if (!tutor) {
            return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
        }

        // 3. Flatten connection status
        const flattenedTutor = {
            ...tutor,
            connectionStatus: (tutor.connectionsAsTutor as any)?.[0]?.status || null,
            connectionsAsTutor: undefined
        };

        return NextResponse.json({ tutor: flattenedTutor });
    } catch (error) {
        console.error("Error fetching tutor details:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
