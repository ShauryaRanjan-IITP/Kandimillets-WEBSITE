'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNavLinks } from '@/data/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-warm-50/90 shadow-md backdrop-blur-md'
          : 'bg-warm-50'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-green-700">
            Kandimillets
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-1 md:flex">
          {mainNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-green-600'
                      : 'text-brown-700 hover:text-green-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-green-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA Button */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Subtle staff-only entry point — deliberately understated
              (muted color, no icon/pill) so it blends into the nav rather
              than reading as a customer-facing feature. */}
          <Link
            href="/admin/login"
            className="px-2 py-2 text-xs font-medium text-brown-400 transition-colors duration-200 hover:text-brown-600"
          >
            Portal
          </Link>
          <a
            href="tel:+919973453069"
            aria-label="Call Kandimillets"
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.49c0 .55-.45 1-1 1C10.07 22 2 13.93 2 3.99 2 3.44 2.45 3 3 3h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
            </svg>
            Call Us
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          className="inline-flex items-center justify-center rounded-md p-2 text-brown-700 transition-colors hover:bg-warm-200 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-warm-200 bg-warm-50 px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-1">
            {mainNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-green-50 text-green-600'
                        : 'text-brown-700 hover:bg-warm-100 hover:text-green-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile CTA Button */}
          <div className="mt-4 flex flex-col gap-2 border-t border-warm-200 pt-4">
            <a
              href="tel:+919973453069"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.49c0 .55-.45 1-1 1C10.07 22 2 13.93 2 3.99 2 3.44 2.45 3 3 3h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
              </svg>
              Call Us
            </a>
          </div>

          {/* Same subtle staff-only entry point as the desktop nav. */}
          <div className="mt-3 text-center">
            <Link href="/admin/login" className="text-xs font-medium text-brown-400 hover:text-brown-600">
              Portal
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
