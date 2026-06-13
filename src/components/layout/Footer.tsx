import Link from 'next/link';
import siteConfig from '@/data/siteConfig';
import { footerQuickLinks, footerBusinessLinks } from '@/data/navigation';

export default function Footer() {
  const firstSentence =
    siteConfig.brand.description.split('. ')[0] + '.';

  return (
    <footer className="bg-brown-900 text-warm-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-bold text-white">
                Kandimillets
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-warm-200">
              {firstSentence}
            </p>


          </div>

          {/* Column 2: Quick Links */}
          <nav aria-label="Quick Links">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold-400">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-200 transition-colors duration-200 hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Business */}
          <nav aria-label="Business Links">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold-400">
              Business
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerBusinessLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-200 transition-colors duration-200 hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold-400">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              {/* Phone */}
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                >
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.49c0 .55-.45 1-1 1C10.07 22 2 13.93 2 3.99 2 3.44 2.45 3 3 3h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
                </svg>
                <a
                  href="tel:+919973453069"
                  className="text-sm text-warm-200 transition-colors duration-200 hover:text-gold-400"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13 2 4" />
                </svg>
                <a
                  href="mailto:millet2024usha@gmail.com"
                  className="text-sm text-warm-200 transition-colors duration-200 hover:text-gold-400"
                >
                  {siteConfig.contact.email}
                </a>
              </li>

              {/* Address */}
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                <address className="text-sm not-italic leading-relaxed text-warm-200">
                  {siteConfig.contact.address.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < siteConfig.contact.address.length - 1 && <br />}
                    </span>
                  ))}
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brown-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-warm-300">
            &copy; {new Date().getFullYear()} {siteConfig.brand.name}. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brown-800 px-3 py-1 text-xs text-warm-200">
            {/* India flag dot */}
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
              🇮🇳
            </span>
            Made in India
          </span>
        </div>
      </div>
    </footer>
  );
}
