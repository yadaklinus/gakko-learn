import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Middleware helper to ensure the user is an ADMIN.
 * Returns the session if authorized, otherwise returns a 403 Forbidden response.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  
  return { session };
}
