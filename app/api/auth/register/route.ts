import { NextResponse } from 'next/server';
// import  prisma  from '@/lib/prisma';
import  {prisma}  from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { z } from 'zod';


// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  institution: z.string().min(2, "Institution is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

   

    // 1. Validate Input
    const result = registerSchema.safeParse(body);
    console.log(result)
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.flatten() },
        { status: 400 }
      );
    }



    const { name, email, institution, password } = result.data;

    

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 } // Conflict
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        institution,
        password: hashedPassword,
        role: "STUDENT", // Default role
      },
    });

    // 5. Return success (exclude password from response)
    const { password: _, ...userWithoutPassword } = user;

   

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}