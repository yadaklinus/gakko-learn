import { prisma } from "@/lib/prisma";

interface LogActivityParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
}

/**
 * Utility to log activities across the application.
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  metadata,
  ipAddress,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We don't throw here to avoid breaking the main operation if logging fails
  }
}
