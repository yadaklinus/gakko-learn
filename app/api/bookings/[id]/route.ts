import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const bookingId = params.id;
        const body = await req.json();
        const { status } = body;

        if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        // Ensure the user updating this is the tutor of this booking
        // In a real app, you might allow students to cancel too, but we keep it simple here
        const updatedBooking = await prisma.booking.updateMany({
            where: {
                id: bookingId,
                tutorId: session.user.id
            },
            data: { status }
        });

        if (updatedBooking.count === 0) {
            return NextResponse.json({ message: "Booking not found or unauthorized" }, { status: 404 });
        }

        // If confirmed, create a welcome message in the booking chat
        if (status === 'CONFIRMED') {
            const bookingInfo = await prisma.booking.findUnique({ where: { id: bookingId } });
            if (bookingInfo) {
                await prisma.message.create({
                    data: {
                        bookingId: bookingId,
                        senderId: session.user.id,
                        content: `Hi! I've confirmed our session for ${bookingInfo.subject}. Let me know if you have any questions before we start!`,
                        isRead: false
                    }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("PATCH Booking Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
