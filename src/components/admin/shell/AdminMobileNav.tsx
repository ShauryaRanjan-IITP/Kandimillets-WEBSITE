"use client";

/**
 * Mobile/tablet navigation — hamburger trigger + slide-out drawer, per
 * this task's "Mobile Navigation" spec. Reuses the exact overlay/backdrop
 * treatment already established for the Sales Register's modals
 * (AddSaleModal/VoidSaleDialog: `fixed inset-0 bg-brown-900/40
 * backdrop-blur-sm`) and the existing `.animate-slide-in-left` keyframe
 * (globals.css) rather than introducing new animation/overlay styles.
 *
 * Accessibility: traps Tab focus within the open panel, closes on
 * Escape, and restores focus to the hamburger button that opened it once
 * closed — never steals focus on initial page load.
 */
import { useEffect, useRef, useState } from "react";
import AdminNavList from "./AdminNavList";
import { CloseIcon, MenuIcon } from "./icons";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface AdminMobileNavProps {
  currentRole?: "SUPER_ADMIN" | "ADMIN";
}

export default function AdminMobileNav({ currentRole }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  // Focus the panel's close button when it opens; restore focus to the
  // hamburger only on a genuine open->close transition, never on mount.
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open]);

  // Escape-to-close + a hand-rolled Tab focus trap while open.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="admin-mobile-nav-panel"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-brown-700 transition-colors duration-150 hover:bg-warm-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 lg:hidden"
      >
        <MenuIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div
            className="fixed inset-0 bg-brown-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="admin-mobile-nav-panel"
            ref={panelRef}
            className="animate-slide-in-left fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-warm-200 px-4">
              <span className="font-heading text-sm font-bold text-brown-900">Kandimillets Admin</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-1.5 text-brown-400 transition-colors duration-150 hover:bg-warm-100 hover:text-brown-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <AdminNavList onNavigate={() => setOpen(false)} currentRole={currentRole} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
