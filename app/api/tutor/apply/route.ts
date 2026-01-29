import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import  prisma  from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Import from the new file
import { z } from "zod";

// Validation Schema
const applicationSchema = z.object({
  major: z.string().min(2, "Major is required"),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  hourlyRate: z.number().min(0).optional().default(0),
});

export async function POST(req: Request) {
  try {
    // 1. Check Session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Body
    const body = await req.json();
    const result = applicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { major, subjects, hourlyRate } = result.data;

    // 3. Update User in DB
    // We convert the subjects array to a comma-separated string for SQLite
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: "TUTOR", // Or "BOTH" depending on your logic
        major,
        // Join array to string for storage (e.g., "Math,Physics")
        subjects: subjects.join(','), 
        hourlyRate,
      },
    });

    return NextResponse.json(
      { message: "Application successful", user: updatedUser },
      { status: 200 }
    );

  } catch (error) {
    console.error("Tutor Application Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}