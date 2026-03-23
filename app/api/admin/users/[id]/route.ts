import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activityLogger";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookingsAsStudent: {
          include: { tutor: { select: { name: true } } },
          orderBy: { date: "desc" },
          take: 10,
        },
        bookingsAsTutor: {
          include: { student: { select: { name: true } } },
          orderBy: { date: "desc" },
          take: 10,
        },
        connectionsAsStudent: {
          include: { tutor: { select: { name: true, image: true } } },
        },
        connectionsAsTutor: {
          include: { student: { select: { name: true, image: true } } },
        },
        reviewsReceived: {
          include: { student: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User Detail GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = params;

  try {
    const body = await req.json();
    const { role, name, email, institution, bio, isSuspended } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
        name,
        email,
        institution,
        bio,
        isSuspended,
      },
    });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_USER_UPDATED",
      entity: "User",
      entityId: id,
      metadata: { 
        updatedFields: Object.keys(body).filter(k => body[k] !== undefined),
        isSuspended: isSuspended !== undefined ? isSuspended : undefined
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User Detail PATCH API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_USER_DELETED",
      entity: "User",
      entityId: id,
      metadata: { deletedEmail: user.email },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User Detail DELETE API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
