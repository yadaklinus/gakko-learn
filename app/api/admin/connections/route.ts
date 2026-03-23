import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [connections, total] = await Promise.all([
      prisma.connection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true, email: true, image: true } },
          tutor: { select: { name: true, email: true, image: true } },
        },
      }),
      prisma.connection.count({ where }),
    ]);

    return NextResponse.json({
      connections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Connections GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: "ID and status are required" }, { status: 400 });
    }

    const connection = await prisma.connection.update({
      where: { id },
      data: { status },
    });

    await logActivity({
      userId: auth.session.user.id ?? undefined,
      action: "ADMIN_CONNECTION_UPDATED",
      entity: "Connection",
      entityId: id,
      metadata: { status },
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Connections PATCH API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
