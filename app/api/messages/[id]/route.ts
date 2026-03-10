import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// params is now a Promise in Next.js 15+
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    // FIX: Await params before accessing properties
    const { id: conversationId } = await params;

    // 1. Mark messages from other users as read in this conversation
    if (conversationId) {
      await prisma.message.updateMany({
        where: {
          OR: [
            { bookingId: conversationId },
            { connectionId: conversationId }
          ],
          senderId: { not: session.user.id },
          isRead: false
        },
        data: { isRead: true }
      });
    }

    // 2. Fetch messages with sender info for UI
    let messages = await prisma.message.findMany({
      where: {
        OR: [
          { bookingId: conversationId },
          { connectionId: conversationId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat Load Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}