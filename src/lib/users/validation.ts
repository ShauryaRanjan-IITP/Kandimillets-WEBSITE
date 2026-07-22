/**
 * Server-side validation for User Management — mirrors the exact
 * sanitize -> validate pattern established throughout this project.
 * "Support only Super Admin, Admin" (this task's explicit §3 scope) —
 * no third role, no permissions matrix.
 */
import type { AdminRole } from "@/generated/prisma/enums";

export interface ValidationError {
  field: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_VALUES: AdminRole[] = ["SUPER_ADMIN", "ADMIN"];
const MIN_PASSWORD_LENGTH = 8;

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

export interface UserInput {
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}

export interface SanitizedUserInput {
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}

export function validateUserInput(raw: UserInput): { errors: ValidationError[] } | { data: SanitizedUserInput } {
  const errors: ValidationError[] = [];

  const name = sanitize(raw.name).slice(0, 150);
  if (!name) {
    errors.push({ field: "name", message: "Name is required." });
  }

  const email = sanitize(raw.email).toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "A valid email address is required." });
  }

  if (!ROLE_VALUES.includes(raw.role)) {
    errors.push({ field: "role", message: "Role must be Super Admin or Admin." });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { data: { name, email, role: raw.role, isActive: Boolean(raw.isActive) } };
}

export interface CreateUserInput extends UserInput {
  password: string;
}

export interface SanitizedCreateUserInput extends SanitizedUserInput {
  password: string;
}

export function validateCreateUserInput(
  raw: CreateUserInput
): { errors: ValidationError[] } | { data: SanitizedCreateUserInput } {
  const base = validateUserInput(raw);
  const errors: ValidationError[] = "errors" in base ? [...base.errors] : [];

  if (!raw.password || raw.password.length < MIN_PASSWORD_LENGTH) {
    errors.push({ field: "password", message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { data: { ...(base as { data: SanitizedUserInput }).data, password: raw.password } };
}

export function validateNewPassword(raw: string): { error: ValidationError } | { password: string } {
  if (!raw || raw.length < MIN_PASSWORD_LENGTH) {
    return { error: { field: "password", message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` } };
  }
  return { password: raw };
}
