import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  try {
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Tickets GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { userId, title, description, priority } = (await req.json()) as { 
      userId: string; 
      title: string; 
      description: string; 
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    };

    if (!userId || !title || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        title,
        description,
        priority: priority || "MEDIUM",
      },
    });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_TICKET_CREATED",
      entity: "SupportTicket",
      entityId: ticket.id,
      metadata: { title, userId },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Tickets POST API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
