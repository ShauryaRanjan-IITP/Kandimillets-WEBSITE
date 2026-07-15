import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // No public registration, ever — admins are provisioned only via the
  // seed script (Phase 1) or, in a later phase, by an existing admin.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    // No `password.hash` / `password.verify` override: Better Auth's
    // own maintained hashing implementation (scrypt) is used as-is.
  },

  // Session defaults (7-day expiry, refreshed on use) already implement
  // the "remember session" behavior requested for this phase.
  session: {},

  advanced: {
    // Cookies are httpOnly by default and become `Secure` automatically
    // in production; this only widens that guarantee to every environment
    // so local/staging behave identically to production.
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  // Required so Server Actions/Route Handlers can set the session cookie.
  // Must be the last plugin per Better Auth's Next.js integration.
  plugins: [nextCookies()],
});
