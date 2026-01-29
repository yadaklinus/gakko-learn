import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';
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

    // 1. Try fetching messages as if it's a Booking
    let messages = await prisma.message.findMany({
      where: { bookingId: conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // 2. If no messages found (or check if ID exists as connection), try Connection
    if (messages.length === 0) {
        // Double check if it's actually a connection ID to be safe
        const connectionMessages = await prisma.message.findMany({
            where: { connectionId: conversationId },
            orderBy: { createdAt: 'asc' }
        });
        
        if (connectionMessages.length > 0) {
            messages = connectionMessages;
        } else {
            // It might be a new connection with no messages yet.
            // Check if connection exists to confirm valid ID
            const validConnection = await prisma.connection.findUnique({ 
                where: { id: conversationId }
            });
            
            // If valid connection exists, return empty array. If not, it stays empty array (or 404 if you prefer)
            if (validConnection) messages = []; 
        }
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat Load Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}