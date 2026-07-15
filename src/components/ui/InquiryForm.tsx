"use client";

import { useActionState } from "react";
import { products } from "@/data/products";
import siteConfig from "@/data/siteConfig";
import { submitInquiry, type FormState } from "@/app/(site)/actions";

const initialState: FormState = {
  status: "idle",
  message: "",
};

export default function InquiryForm() {
  const [state, formAction, isPending] = useActionState(submitInquiry, initialState);

  return (
    <form
      action={formAction}
      className="bg-white rounded-2xl shadow-sm border border-warm-200 p-6 md:p-8 space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label
            htmlFor="inquiry-name"
            className="block text-sm font-medium text-brown-700 mb-1.5"
          >
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="inquiry-name"
            name="name"
            required
            minLength={2}
            placeholder="Enter your full name"
            className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
            aria-describedby={state.errors?.find(e => e.field === "name") ? "name-error" : undefined}
          />
          {state.errors?.find(e => e.field === "name") && (
            <p id="name-error" className="mt-1 text-xs text-red-600">
              {state.errors.find(e => e.field === "name")?.message}
            </p>
          )}
        </div>

        {/* Business Name */}
        <div>
          <label
            htmlFor="inquiry-business"
            className="block text-sm font-medium text-brown-700 mb-1.5"
          >
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="inquiry-business"
            name="businessName"
            required
            minLength={2}
            placeholder="Your company or store name"
            className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
            aria-describedby={state.errors?.find(e => e.field === "businessName") ? "business-error" : undefined}
          />
          {state.errors?.find(e => e.field === "businessName") && (
            <p id="business-error" className="mt-1 text-xs text-red-600">
              {state.errors.find(e => e.field === "businessName")?.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="inquiry-email"
            className="block text-sm font-medium text-brown-700 mb-1.5"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="inquiry-email"
            name="email"
            required
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
            aria-describedby={state.errors?.find(e => e.field === "email") ? "email-error" : undefined}
          />
          {state.errors?.find(e => e.field === "email") && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {state.errors.find(e => e.field === "email")?.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="inquiry-location"
            className="block text-sm font-medium text-brown-700 mb-1.5"
          >
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="inquiry-location"
            name="location"
            required
            minLength={2}
            placeholder="City, State"
            className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
            aria-describedby={state.errors?.find(e => e.field === "location") ? "location-error" : undefined}
          />
          {state.errors?.find(e => e.field === "location") && (
            <p id="location-error" className="mt-1 text-xs text-red-600">
              {state.errors.find(e => e.field === "location")?.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="inquiry-phone"
            className="block text-sm font-medium text-brown-700 mb-1.5"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="inquiry-phone"
            name="phone"
            required
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
            aria-describedby={state.errors?.find(e => e.field === "phone") ? "phone-error" : undefined}
          />
          {state.errors?.find(e => e.field === "phone") && (
            <p id="phone-error" className="mt-1 text-xs text-red-600">
              {state.errors.find(e => e.field === "phone")?.message}
            </p>
          )}
        </div>

        {/* Product Interest */}
        <div>
          <label
            htmlFor="inquiry-product"
            className="block text-sm font-medium text-brown-700 mb-1.5"
          >
            Product Interest <span className="text-red-500">*</span>
          </label>
          <select
            id="inquiry-product"
            name="productInterest"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 appearance-none"
            aria-describedby={state.errors?.find(e => e.field === "productInterest") ? "product-error" : undefined}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
            <option value="Multiple Products">Multiple Products</option>
            <option value="All Products">All Products</option>
          </select>
          {state.errors?.find(e => e.field === "productInterest") && (
            <p id="product-error" className="mt-1 text-xs text-red-600">
              {state.errors.find(e => e.field === "productInterest")?.message}
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="inquiry-message"
          className="block text-sm font-medium text-brown-700 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={4}
          placeholder="Tell us about your requirements, expected quantities, or any questions..."
          className="w-full px-4 py-2.5 rounded-xl border border-warm-300 bg-warm-50 text-brown-900 placeholder:text-brown-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 resize-none"
        />
      </div>

      {/* Status message */}
      {state.status !== "idle" && state.message && (
        <div
          role="alert"
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            state.status === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </>
        ) : (
          "Submit Inquiry"
        )}
      </button>

      {/* Alternative contact */}
      <p className="text-center text-sm text-brown-500">
        Or reach us directly:{" "}
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="text-green-600 font-medium hover:underline"
        >
          Call
        </a>
        {" · "}
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="text-green-600 font-medium hover:underline"
        >
          Email
        </a>
      </p>
    </form>
  );
}
