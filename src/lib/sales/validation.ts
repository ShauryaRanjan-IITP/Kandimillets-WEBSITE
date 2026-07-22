/**
 * Server-side validation for the Sales Register — see docs/SALES_REGISTER.md
 * §10 and docs/API.md §10. Client-side hints in the UI are a nicety only;
 * every rule here is re-checked independently, per the sanitize -> validate
 * pattern already established in src/app/(site)/actions.ts's submitInquiry.
 */
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

export interface ValidationError {
  field: string;
  message: string;
}

export interface SaleInput {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  retailerId: string;
  productId: string;
  quantity: string;
  unit: string;
  rate: string;
  gstIncluded: boolean;
  paymentStatus: PaymentStatus;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: PaymentMethod | "";
  remarks: string;
}

export const ALLOWED_UNITS = ["kg", "g", "pack", "box", "litre", "pcs"];
const PAYMENT_STATUS_VALUES: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "CANCELLED"];
const PAYMENT_METHOD_VALUES: PaymentMethod[] = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"];

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export interface SanitizedSaleInput {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  retailerId: string;
  productId: string;
  quantity: number;
  unit: string;
  rate: number;
  gstIncluded: boolean;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  remarks: string | null;
  totalAmount: number;
}

/**
 * Sanitizes and validates a Sale create/update submission. Returns either
 * the sanitized, ready-to-persist fields (with totalAmount already computed
 * server-side, per the "never trust client-computed values" principle in
 * docs/API.md §2) or the list of validation errors.
 */
export function validateSaleInput(raw: SaleInput): { errors: ValidationError[] } | { data: SanitizedSaleInput } {
  const errors: ValidationError[] = [];

  const invoiceNumber = sanitize(raw.invoiceNumber).slice(0, 200);
  const remarks = sanitize(raw.remarks).slice(0, 500);

  if (!raw.invoiceDate || !isValidIsoDate(raw.invoiceDate)) {
    errors.push({ field: "invoiceDate", message: "Invoice Date is required and must be a valid date." });
  } else {
    const invoiceDate = new Date(raw.invoiceDate);
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const earliestBound = new Date("2020-01-01");
    if (invoiceDate.getTime() > oneDayFromNow.getTime()) {
      errors.push({ field: "invoiceDate", message: "Invoice Date cannot be more than one day in the future." });
    }
    if (invoiceDate.getTime() < earliestBound.getTime()) {
      errors.push({ field: "invoiceDate", message: "Invoice Date is too far in the past." });
    }
  }

  const dueDateRaw = raw.dueDate || raw.invoiceDate;
  if (!dueDateRaw || !isValidIsoDate(dueDateRaw)) {
    errors.push({ field: "dueDate", message: "Due Date must be a valid date." });
  } else if (isValidIsoDate(raw.invoiceDate) && dueDateRaw < raw.invoiceDate) {
    errors.push({ field: "dueDate", message: "Due Date cannot be earlier than Invoice Date." });
  }

  if (!raw.retailerId) {
    errors.push({ field: "retailerId", message: "Retailer is required." });
  }
  if (!raw.productId) {
    errors.push({ field: "productId", message: "Product is required." });
  }

  const quantity = Number(raw.quantity);
  if (!raw.quantity || !Number.isFinite(quantity) || quantity <= 0) {
    errors.push({ field: "quantity", message: "Quantity is required and must be greater than zero." });
  }

  const unit = sanitize(raw.unit);
  if (!unit || !ALLOWED_UNITS.includes(unit)) {
    errors.push({ field: "unit", message: `Unit is required and must be one of: ${ALLOWED_UNITS.join(", ")}.` });
  }

  const rate = Number(raw.rate);
  if (!raw.rate || !Number.isFinite(rate) || rate <= 0) {
    errors.push({ field: "rate", message: "Rate is required and must be greater than zero." });
  }

  if (!PAYMENT_STATUS_VALUES.includes(raw.paymentStatus)) {
    errors.push({ field: "paymentStatus", message: "Payment Status must be one of Pending, Partial, Paid, Cancelled." });
  }

  const totalAmount = Number.isFinite(quantity) && Number.isFinite(rate) ? Math.round(quantity * rate * 100) / 100 : 0;

  const amountPaid = raw.amountPaid === "" ? 0 : Number(raw.amountPaid);
  if (!Number.isFinite(amountPaid)) {
    errors.push({ field: "amountPaid", message: "Amount Paid must be a number." });
  } else if (PAYMENT_STATUS_VALUES.includes(raw.paymentStatus)) {
    if ((raw.paymentStatus === "PENDING" || raw.paymentStatus === "CANCELLED") && amountPaid !== 0) {
      errors.push({ field: "amountPaid", message: "Amount Paid must be 0 when Payment Status is Pending or Cancelled." });
    }
    if (raw.paymentStatus === "PARTIAL" && (amountPaid <= 0 || amountPaid >= totalAmount)) {
      errors.push({ field: "amountPaid", message: "Amount Paid must be strictly between 0 and the Total Amount when Payment Status is Partial." });
    }
    if (raw.paymentStatus === "PAID" && Math.abs(amountPaid - totalAmount) > 0.01) {
      errors.push({ field: "amountPaid", message: "Amount Paid must equal the Total Amount when Payment Status is Paid." });
    }
  }

  const paymentDate = raw.paymentDate ? raw.paymentDate : null;
  if (paymentDate && !isValidIsoDate(paymentDate)) {
    errors.push({ field: "paymentDate", message: "Payment Date must be a valid date." });
  } else if (paymentDate && isValidIsoDate(raw.invoiceDate) && paymentDate < raw.invoiceDate) {
    errors.push({ field: "paymentDate", message: "Payment Date cannot be earlier than Invoice Date." });
  }

  let paymentMethod: PaymentMethod | null = raw.paymentMethod || null;
  if (paymentDate && !paymentMethod) {
    errors.push({ field: "paymentMethod", message: "Payment Method is required whenever a Payment Date is set." });
  }
  if (!paymentDate) {
    paymentMethod = null;
  }
  if (paymentMethod && !PAYMENT_METHOD_VALUES.includes(paymentMethod)) {
    errors.push({ field: "paymentMethod", message: "Payment Method must be one of Cash, UPI, Bank Transfer, Cheque, Other." });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      invoiceNumber,
      invoiceDate: raw.invoiceDate,
      dueDate: dueDateRaw,
      retailerId: raw.retailerId,
      productId: raw.productId,
      quantity,
      unit,
      rate,
      gstIncluded: Boolean(raw.gstIncluded),
      paymentStatus: raw.paymentStatus,
      amountPaid,
      paymentDate,
      paymentMethod,
      remarks: remarks || null,
      totalAmount,
    },
  };
}

export function validateVoidReason(raw: string): { error: ValidationError } | { reason: string } {
  const reason = sanitize(raw).slice(0, 500);
  if (!reason) {
    return { error: { field: "voidReason", message: "A void reason is required." } };
  }
  return { reason };
}
