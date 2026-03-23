import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activityLogger";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = params;

  try {
    const { status, priority, adminNote } = (await req.json()) as {
      status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      adminNote?: string;
    };

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === "RESOLVED" || status === "CLOSED") {
        data.resolvedAt = new Date();
      }
    }
    if (priority) data.priority = priority;
    if (adminNote !== undefined) data.adminNote = adminNote;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data,
    });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_TICKET_UPDATED",
      entity: "SupportTicket",
      entityId: id,
      metadata: { status, priority },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Ticket Detail PATCH API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
