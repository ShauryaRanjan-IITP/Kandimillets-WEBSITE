"use server";

/**
 * Business Settings Server Action — follows the exact
 * sanitize -> validate -> business logic -> Prisma chain and response
 * shape already established by every other module's actions.ts (itself
 * mandated by docs/API.md §3/§4).
 */
import { revalidatePath } from "next/cache";
import { getSessionSafe } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { serializeBusinessSettings, type BusinessSettingsDTO } from "@/lib/settings/dto";
import { SETTINGS_ID } from "@/lib/settings/queries";
import {
  validateBusinessSettingsInput,
  type BusinessSettingsInput,
  type ValidationError,
} from "@/lib/settings/validation";
import { writeAuditLog } from "@/lib/audit/log";

export type SettingsActionState =
  | { status: "success"; settings: BusinessSettingsDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "error"; message: string };

export async function updateBusinessSettings(input: BusinessSettingsInput): Promise<SettingsActionState> {
  const session = await getSessionSafe();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to update Business Settings." };
  }

  const result = validateBusinessSettingsInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  try {
    const settings = await prisma.$transaction(async (tx) => {
      const updated = await tx.businessSettings.upsert({
        where: { id: SETTINGS_ID },
        update: { ...data, updatedByUserId: session.user.id },
        create: { id: SETTINGS_ID, ...data, updatedByUserId: session.user.id },
      });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "UPDATE",
          entityType: "BUSINESS_SETTINGS",
          entityId: SETTINGS_ID,
          summary: `${session.user.name} updated Business Settings.`,
        },
        tx
      );
      return updated;
    });

    revalidatePath("/admin/settings");
    return { status: "success", settings: serializeBusinessSettings(settings) };
  } catch (error) {
    console.error("updateBusinessSettings failed:", error);
    return { status: "error", message: "Could not save Business Settings. Please try again." };
  }
}
