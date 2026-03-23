import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activityLogger";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        student: { select: { name: true } },
        tutor: { select: { name: true } },
      },
    });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_BOOKING_UPDATED",
      entity: "Booking",
      entityId: id,
      metadata: { 
        status, 
        student: booking.student?.name, 
        tutor: booking.tutor?.name 
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking Detail PATCH API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const booking = await prisma.booking.delete({ where: { id } });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_BOOKING_DELETED",
      entity: "Booking",
      entityId: id,
      metadata: { subject: booking.subject },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Booking Detail DELETE API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
