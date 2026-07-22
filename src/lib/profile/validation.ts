/**
 * Server-side validation for self-service Profile updates — mirrors the
 * exact sanitize -> validate pattern established throughout this project.
 */
export interface ValidationError {
  field: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

export interface ProfileInput {
  name: string;
  email: string;
}

export interface SanitizedProfileInput {
  name: string;
  email: string;
}

export function validateProfileInput(raw: ProfileInput): { errors: ValidationError[] } | { data: SanitizedProfileInput } {
  const errors: ValidationError[] = [];

  const name = sanitize(raw.name).slice(0, 150);
  if (!name) {
    errors.push({ field: "name", message: "Name is required." });
  }

  const email = sanitize(raw.email).toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "A valid email address is required." });
  }

  if (errors.length > 0) {
    return { errors };
  }
  return { data: { name, email } };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function validateChangePasswordInput(
  raw: ChangePasswordInput
): { errors: ValidationError[] } | { data: ChangePasswordInput } {
  const errors: ValidationError[] = [];

  if (!raw.currentPassword) {
    errors.push({ field: "currentPassword", message: "Current password is required." });
  }
  if (!raw.newPassword || raw.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.push({ field: "newPassword", message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  if (errors.length > 0) {
    return { errors };
  }
  return { data: raw };
}
