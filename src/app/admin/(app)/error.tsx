"use client";

/**
 * Defense-in-depth error boundary for every route under the authenticated
 * admin shell — this task's explicit "Review: Error boundaries" /
 * "Never render protected children when authentication cannot be
 * verified" requirement. Before this file existed, an uncaught error
 * anywhere under `(app)` (including the exact AdminAppLayout session-
 * lookup exception documented in src/lib/auth/session.ts) had no local
 * boundary to catch it and fell through to Next.js's default error
 * handling, with no guarantee of landing on a safe, unauthenticated view.
 *
 * This boundary never renders any protected data — not even the error's
 * own message, which could in principle echo back something sensitive
 * from deeper in the tree. It immediately redirects to `/admin/login`,
 * treating "something went wrong while rendering an authenticated page"
 * the same way as "not authenticated": fail closed, don't guess.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAppError({ error }: { error: Error & { digest?: string } }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Admin app error boundary triggered — redirecting to login.", error);
    router.replace("/admin/login");
  }, [error, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <p className="text-sm text-brown-500">Redirecting…</p>
    </div>
  );
}
