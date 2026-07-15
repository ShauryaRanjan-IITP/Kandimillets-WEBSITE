"use server";

import type { InquiryFormData } from "@/types";

// ---- Rate Limiter (in-memory) ----
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// ---- Sanitization ----
function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>"'&]/g, "") // strip dangerous chars
    .trim()
    .slice(0, 1000); // cap length
}

// ---- Validation ----
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d[\d\s\-]{7,14}$/;

interface ValidationError {
  field: string;
  message: string;
}

function validateForm(data: InquiryFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: "name", message: "Name is required (minimum 2 characters)." });
  }
  if (!data.businessName || data.businessName.trim().length < 2) {
    errors.push({ field: "businessName", message: "Business name is required." });
  }
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    errors.push({ field: "email", message: "A valid email address is required." });
  }
  if (!data.location || data.location.trim().length < 2) {
    errors.push({ field: "location", message: "Location is required." });
  }
  if (!data.phone || !PHONE_REGEX.test(data.phone.trim())) {
    errors.push({ field: "phone", message: "A valid phone number is required (e.g. +91 9876543210)." });
  }
  if (!data.productInterest) {
    errors.push({ field: "productInterest", message: "Please select a product." });
  }

  return errors;
}

// ---- Server Action ----
export type FormState = {
  status: "idle" | "success" | "error" | "validation_error";
  message: string;
  errors?: ValidationError[];
};

export async function submitInquiry(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract and sanitize
  const data: InquiryFormData = {
    name: sanitize(formData.get("name") as string || ""),
    businessName: sanitize(formData.get("businessName") as string || ""),
    email: sanitize(formData.get("email") as string || ""),
    location: sanitize(formData.get("location") as string || ""),
    phone: sanitize(formData.get("phone") as string || ""),
    productInterest: sanitize(formData.get("productInterest") as string || ""),
    message: sanitize(formData.get("message") as string || ""),
  };

  // Validate
  const errors = validateForm(data);
  if (errors.length > 0) {
    return {
      status: "validation_error",
      message: "Please fix the errors below.",
      errors,
    };
  }

  // Rate limit (use a generic key since headers aren't always available)
  const ip = "server-global"; // In production with middleware, use actual IP
  if (!checkRateLimit(ip)) {
    return {
      status: "error",
      message: "Too many submissions. Please try again later.",
    };
  }

  // Submit to Google Sheets
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("GOOGLE_SHEETS_WEBHOOK_URL is not configured");
    return {
      status: "error",
      message: "Submission failed. Please try again later.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return {
      status: "success",
      message: "Thank you. Our team will contact you within 24 hours.",
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      status: "error",
      message: "Submission failed. Please try again later.",
    };
  }
}
