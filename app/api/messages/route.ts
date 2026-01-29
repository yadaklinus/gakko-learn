import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const userId = session.user.id;

    // 1. Fetch Booking Conversations
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ studentId: userId }, { tutorId: userId }]
      },
      include: {
        student: { select: { id: true, name: true, image: true } },
        tutor: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // 2. Fetch Connection Conversations (Mutuals)
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ studentId: userId }, { tutorId: userId }]
      },
      include: {
        student: { select: { id: true, name: true, image: true } },
        tutor: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // 3. Normalize Data Structure
    const bookingConvos = bookings.map(b => ({
      id: b.id,
      type: 'BOOKING',
      otherUser: userId === b.studentId ? b.tutor : b.student,
      lastMessage: b.messages[0]?.content || 'Session Chat',
      lastMessageTime: b.messages[0]?.createdAt || b.createdAt,
      isUnread: b.messages[0] ? (!b.messages[0].isRead && b.messages[0].senderId !== userId) : false,
      contextLabel: b.subject // Extra context for bookings
    }));

    const connectionConvos = connections.map(c => ({
      id: c.id,
      type: 'CONNECTION',
      otherUser: userId === c.studentId ? c.tutor : c.student,
      lastMessage: c.messages[0]?.content || 'Start a conversation',
      lastMessageTime: c.messages[0]?.createdAt || c.updatedAt,
      isUnread: c.messages[0] ? (!c.messages[0].isRead && c.messages[0].senderId !== userId) : false,
      contextLabel: 'General Chat'
    }));

    // 4. Merge and Sort by Date (Newest first)
    const allConversations = [...bookingConvos, ...connectionConvos].sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return NextResponse.json({ conversations: allConversations });
  } catch (error) {
    console.error("Inbox Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const { id, type, content } = await req.json(); // id can be bookingId or connectionId

    if (!content || !id || !type) return new NextResponse('Missing fields', { status: 400 });

    const messageData: any = {
      senderId: session.user.id,
      content,
      isRead: false
    };

    // Dynamically link based on type
    if (type === 'BOOKING') {
        messageData.bookingId = id;
    } else {
        messageData.connectionId = id;
    }

    const message = await prisma.message.create({
      data: messageData
    });
    
    // Update timestamp on parent
    if (type === 'BOOKING') {
       await prisma.booking.update({ where: { id }, data: { updatedAt: new Date() } });
    } else {
       await prisma.connection.update({ where: { id }, data: { updatedAt: new Date() } });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send Message Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}