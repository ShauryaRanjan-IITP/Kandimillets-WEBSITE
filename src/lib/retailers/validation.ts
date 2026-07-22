/**
 * Server-side validation for Retailer create/update — mirrors the exact
 * sanitize -> validate pattern established in src/lib/sales/validation.ts
 * (itself following src/app/(site)/actions.ts's submitInquiry), reused
 * here rather than reinvented.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface RetailerInput {
  name: string;
  contactPerson: string;
  phone: string;
  alternatePhone: string;
  email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  isActive: boolean;
}

export interface SanitizedRetailerInput {
  name: string;
  contactPerson: string | null;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  gstin: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  notes: string | null;
  isActive: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSTIN_REGEX = /^[0-9A-Z]{15}$/;
const PINCODE_REGEX = /^\d{6}$/;

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

/** Strips everything except digits and a single leading `+`, so "9876
 * 543-210" and "+91 98765 43210" both normalize to a consistent,
 * comparable form before the duplicate check and before saving. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** Uppercase, whitespace-stripped — Indian GSTIN is conventionally
 * written in uppercase with no internal spaces. */
export function normalizeGstin(raw: string): string {
  return raw.replace(/\s/g, "").toUpperCase();
}

export function validateRetailerInput(
  raw: RetailerInput
): { errors: ValidationError[] } | { data: SanitizedRetailerInput } {
  const errors: ValidationError[] = [];

  const name = sanitize(raw.name).slice(0, 200);
  if (!name) {
    errors.push({ field: "name", message: "Business Name is required." });
  }

  const phone = normalizePhone(sanitize(raw.phone));
  if (!phone || phone.replace("+", "").length < 8) {
    errors.push({ field: "phone", message: "A valid phone number is required." });
  }

  const alternatePhoneRaw = sanitize(raw.alternatePhone);
  const alternatePhone = alternatePhoneRaw ? normalizePhone(alternatePhoneRaw) : "";
  if (alternatePhone && alternatePhone.replace("+", "").length < 8) {
    errors.push({ field: "alternatePhone", message: "Alternate Phone must be a valid phone number." });
  }

  const email = sanitize(raw.email);
  if (email && !EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "Email must be a valid email address." });
  }

  const gstin = raw.gstin ? normalizeGstin(sanitize(raw.gstin)) : "";
  if (gstin && !GSTIN_REGEX.test(gstin)) {
    errors.push({ field: "gstin", message: "GST Number must be 15 letters/digits (standard GSTIN format)." });
  }

  const pincode = sanitize(raw.pincode);
  if (pincode && !PINCODE_REGEX.test(pincode)) {
    errors.push({ field: "pincode", message: "Pincode must be exactly 6 digits." });
  }

  const city = sanitize(raw.city).slice(0, 100);
  if (!city) {
    errors.push({ field: "city", message: "City is required." });
  }

  const state = sanitize(raw.state).slice(0, 100);
  if (!state) {
    errors.push({ field: "state", message: "State is required." });
  }

  const contactPerson = sanitize(raw.contactPerson).slice(0, 150);
  const address = sanitize(raw.address).slice(0, 500);
  const notes = sanitize(raw.notes).slice(0, 1000);

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      name,
      contactPerson: contactPerson || null,
      phone,
      alternatePhone: alternatePhone || null,
      email: email || null,
      gstin: gstin || null,
      address: address || null,
      city,
      state,
      pincode: pincode || null,
      notes: notes || null,
      isActive: Boolean(raw.isActive),
    },
  };
}
