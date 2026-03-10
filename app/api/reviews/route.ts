import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

        const { tutorId, rating, comment, bookingId } = await req.json();

        if (!tutorId || !rating) {
            return NextResponse.json({ error: "Tutor ID and rating are required" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        // 1. Verify connection exists and is ACCEPTED
        const connection = await prisma.connection.findUnique({
            where: {
                studentId_tutorId: {
                    studentId: session.user.id,
                    tutorId: tutorId
                }
            }
        });

        if (!connection || connection.status !== 'ACCEPTED') {
            return NextResponse.json({ error: "You can only rate tutors you are connected with" }, { status: 403 });
        }

        // 2. Create or Update Review
        // Using upsert with the unique studentTutorReview constraint
        await prisma.review.upsert({
            where: {
                studentTutorReview: {
                    studentId: session.user.id,
                    tutorId: tutorId
                }
            },
            update: {
                rating,
                comment,
                bookingId: bookingId || null
            },
            create: {
                studentId: session.user.id,
                tutorId: tutorId,
                rating,
                comment,
                bookingId: bookingId || null
            }
        });

        // 3. Recalculate Tutor Stats
        const allReviews = await prisma.review.findMany({
            where: { tutorId },
            select: { rating: true }
        });

        const totalReviews = allReviews.length;
        const averageRating = allReviews.reduce((acc: number, rev: { rating: number }) => acc + rev.rating, 0) / totalReviews;

        // 4. Update Tutor Model
        await prisma.user.update({
            where: { id: tutorId },
            data: {
                rating: averageRating,
                totalReviews: totalReviews
            }
        });

        return NextResponse.json({
            success: true,
            rating: averageRating,
            totalReviews
        });

    } catch (error) {
        console.error("Review Submission Error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
