# Kandimillets — Architecture Document

> **Purpose:** This document gives an AI assistant (or a new developer) enough context to understand the entire project **without reading every source file**. It documents the architecture *as it exists today*. It is documentation only — it does not propose refactors or improvements.

---

## 1. Project Overview

Kandimillets is a marketing / brand website for a healthy-foods distribution business (Makhana, Sattu, and millet products sourced from India's regional producers). It also markets a secondary "Agriculture AI & IT" technology division. The site is content-driven, statically generated, and optimized for lead generation (calls, emails, and a partner inquiry form).

| Concern | Choice |
|---|---|
| **Tech stack** | Next.js (App Router) + React + TypeScript + Tailwind CSS v4 |
| **Framework versions** | `next@16.2.7`, `react@19.2.4`, `react-dom@19.2.4`, `typescript@^5`, `tailwindcss@^4`, `eslint@^9`, `eslint-config-next@16.2.7` |
| **Rendering strategy** | Static Site Generation (SSG) by default. Product detail pages use `generateStaticParams()` + `dynamicParams = false` (fully pre-rendered, no runtime fallback). Server Actions handle form submission. |
| **Routing** | Next.js **App Router** (`src/app/`), file-system based, with one dynamic segment `products/[slug]`. |
| **Styling system** | Tailwind CSS v4 via `@tailwindcss/postcss`. Theme defined **in CSS** using `@theme inline` in `globals.css` (no `tailwind.config.js`). Custom utility classes and design tokens live in `globals.css`. |
| **State management** | None global. Local component state via React hooks (`useState`, `useEffect`) and `useActionState` for the form. Data is static (imported TS modules). |
| **Forms** | Single inquiry form using React 19 `useActionState` + a Next.js **Server Action** (`submitInquiry`). Server-side validation, sanitization, in-memory rate limiting, and a Google Sheets webhook. |
| **Images** | `next/image` wrapped by a custom `ImageWithFallback` component that renders a gradient placeholder on load error. Assets in `public/images/`. |
| **Icons** | **Inline SVGs** only. No icon library. Icons are hand-written `<svg>` elements or small icon components inside `TrustBadge`, `ContactCard`, `ServiceCard`. |
| **Build system** | Next.js build (`next build`). PostCSS with the `@tailwindcss/postcss` plugin. TypeScript with `@/*` path alias → `./src/*`. |
| **Deployment** | Not committed to the repo (no `next.config`, no CI config, no Vercel config). README references Vercel as the default target. SEO metadata assumes production domain `https://kandimillets.com`. |
| **Fonts** | `next/font/google` — **Inter** (`--font-inter`, body/sans) and **Outfit** (`--font-outfit`, headings). Both `display: swap`. |

**Notable environment facts:**
- There is **no `next.config.(js|ts|mjs)`** file in the repo — the project runs on framework defaults.
- There is **no `src/hooks/` folder** (the CLAUDE.md example folder list is aspirational, not literal).
- `AGENTS.md` warns that this Next.js version may differ from training data; the canonical docs live in `node_modules/next/dist/docs/`. **Consult those before writing framework code.**

---

## 2. Folder Structure

```
src/
├── app/                      # App Router: routes, layout, metadata, server actions
│   ├── layout.tsx            # Root layout (fonts, metadata, Navbar/Footer/FloatingCTA)
│   ├── page.tsx              # Home route "/"
│   ├── globals.css           # Design system: theme tokens, keyframes, utilities
│   ├── actions.ts            # "use server" — submitInquiry Server Action
│   ├── sitemap.ts            # Dynamic sitemap.xml (static routes + product slugs)
│   ├── robots.ts             # robots.txt
│   ├── favicon.ico
│   ├── about/page.tsx        # "/about"
│   ├── products/
│   │   ├── page.tsx          # "/products" (catalog)
│   │   └── [slug]/page.tsx   # "/products/:slug" (product detail, SSG)
│   ├── sourcing/page.tsx     # "/sourcing"
│   ├── partner/page.tsx      # "/partner" (inquiry form)
│   ├── community/page.tsx    # "/community"
│   └── agri-tech/page.tsx    # "/agri-tech" (tech division)
│
├── components/
│   ├── layout/               # Global chrome rendered by root layout
│   │   ├── Navbar.tsx        # 'use client' — sticky nav, mobile menu, scroll state
│   │   ├── Footer.tsx        # Server component — 4-column footer
│   │   └── FloatingCTA.tsx   # 'use client' — floating call button
│   ├── sections/             # Homepage-only composed sections (one per page block)
│   │   ├── HeroSection.tsx
│   │   ├── WhySection.tsx
│   │   ├── ProductsSection.tsx
│   │   ├── SourcingSection.tsx
│   │   ├── TrustSection.tsx
│   │   ├── PartnershipSection.tsx
│   │   ├── OperationsSection.tsx
│   │   ├── LeadershipSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/                   # Reusable presentational components (used across pages)
│       ├── PageHero.tsx
│       ├── SectionHeader.tsx
│       ├── CTASection.tsx
│       ├── ProductCard.tsx
│       ├── ProductGrid.tsx
│       ├── LeadershipCard.tsx
│       ├── SourcingStoryCard.tsx
│       ├── ServiceCard.tsx
│       ├── TrustBadge.tsx
│       ├── ContactCard.tsx
│       ├── PartnershipStepper.tsx
│       ├── WhereWeOperate.tsx
│       ├── ImageWithFallback.tsx   # 'use client'
│       └── InquiryForm.tsx          # 'use client'
│
├── data/                     # Centralized static content (single source of truth)
│   ├── siteConfig.ts         # Brand, contact, SEO, forms config (default export)
│   ├── navigation.ts         # Nav + footer link arrays
│   ├── products.ts           # Product catalog + helper lookups
│   ├── leadership.ts         # Leader profiles
│   ├── sourcing.ts           # Sourcing stories (region → product)
│   ├── services.ts           # Agri-Tech service offerings
│   ├── trust.ts              # Trust/credential badges
│   └── operations.ts         # Operating locations
│
└── types/
    └── index.ts              # All shared TypeScript interfaces

public/
├── images/                   # Product, leadership, sourcing, hero, agri-tech, community images
├── file.svg, globe.svg, next.svg, vercel.svg, window.svg   # default CNA assets (unused)
```

**Responsibility of each folder:**

- **`src/app/`** — Routing surface. Each `page.tsx` is a route. Route files compose `ui/` and `sections/` components and pull content from `data/`. Also holds cross-cutting App Router files: `layout.tsx`, `globals.css`, `actions.ts`, `sitemap.ts`, `robots.ts`.
- **`src/components/layout/`** — Global chrome shared on every page (rendered once in the root layout).
- **`src/components/sections/`** — Large, page-specific composed blocks. **In practice these are used only by the home page** (`app/page.tsx`). They wrap `ui/` primitives and `data/` content. Some sections duplicate content also shown on dedicated pages (e.g. `SourcingSection` ≈ the `/sourcing` page body).
- **`src/components/ui/`** — Small, reusable, mostly presentational components used across multiple routes.
- **`src/data/`** — All site content and configuration as typed TS modules. This is the **data-driven core** of the app.
- **`src/types/`** — Central interface definitions shared by data modules and components.
- **`public/images/`** — Static image assets referenced by absolute `/images/...` paths.

---

## 3. Routing

The App Router maps folders under `src/app/` to routes. All routes are statically rendered.

| Route | File | Page component | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | `HomePage` | Composes 9 section components. |
| `/about` | `app/about/page.tsx` | `AboutPage` | Story, mission/vision, leadership, CTA. |
| `/products` | `app/products/page.tsx` | `ProductsPage` | Catalog grouped by category (makhana / sattu / millet). |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | `ProductDetailPage` | SSG per product; `generateStaticParams` + `dynamicParams = false`; dynamic metadata; related products; `notFound()` for unknown slugs. |
| `/sourcing` | `app/sourcing/page.tsx` | `SourcingPage` | Alternating sourcing story cards + quality philosophy. |
| `/partner` | `app/partner/page.tsx` | `PartnerPage` | Benefits, partnership stepper, inquiry form. |
| `/community` | `app/community/page.tsx` | `CommunityPage` | Event narrative gallery (Nakshatra Anand Mela). |
| `/agri-tech` | `app/agri-tech/page.tsx` | `AgriTechPage` | Tech division; **blue/slate theme** (distinct from the rest of the site). |
| `/sitemap.xml` | `app/sitemap.ts` | `sitemap()` | Static routes + all product slugs. |
| `/robots.txt` | `app/robots.ts` | `robots()` | Allows all; points to sitemap. |

**Product slugs (pre-rendered pages):** `plain-makhana`, `salted-makhana`, `jaggery-makhana`, `chana-sattu`, `ragi-semiya`, `jowar-pasta`.

**Navigation vs. routes:**
- `mainNavLinks` (Navbar) lists: Home, About, Products, Sourcing, Partner, Agri-Tech, Community.
- The **sitemap does NOT include `/community`** (it lists `""`, `/about`, `/products`, `/sourcing`, `/partner`, `/agri-tech` + product routes). This is an existing discrepancy, documented here as-is.
- Footer links are a curated subset (see §9).

---

## 4. Layout Architecture

**`src/app/layout.tsx` (Root Layout — Server Component):**

- Loads two Google fonts via `next/font/google`: `Inter` → `--font-inter`, `Outfit` → `--font-outfit`. Both variables are attached to `<html>`.
- `<html lang="en" className="... h-full antialiased">`.
- `<body className="min-h-full flex flex-col bg-warm-50 text-brown-900">` — global background and text color come from the theme tokens.
- Renders the fixed chrome around every page:
  ```
  <body>
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <FloatingCTA />
  </body>
  ```
- Exports a rich `metadata` object (title template `%s | Kandimillets`, description, keywords, authors, OpenGraph, Twitter card, robots directives). `metadataBase` is derived from `siteConfig.seo.domain`.

**Chrome components:**

- **`Navbar`** (`'use client'`) — Sticky header (`sticky top-0 z-40`). Tracks scroll (`isScrolled` → adds blur + shadow after 10px). Mobile hamburger toggles a collapsible menu; the menu auto-closes on route change via `usePathname()`. Active link is derived from `pathname` and underlined. Contains a "Call Us" CTA (desktop + mobile). Links come from `mainNavLinks`.
- **`Footer`** (Server Component) — 4-column grid: Brand (first sentence of `siteConfig.brand.description`), Quick Links (`footerQuickLinks`), Business (`footerBusinessLinks`), Contact (phone/email/address from `siteConfig`). Bottom bar shows `© {currentYear} Kandimillets` and a "Made in India 🇮🇳" chip. Dark theme (`bg-brown-900`).
- **`FloatingCTA`** (`'use client'`) — Fixed circular call button (`fixed bottom-6 right-6 z-50`). Fades/slides in 1s after mount (`setTimeout`). Links to `tel:+919973453069`.

**Page wrapper / shared layouts:**
- There is a **single** layout (`app/layout.tsx`). No nested route-group layouts, no `template.tsx`, no `loading.tsx`/`error.tsx` files.
- Individual pages vary their own top-level wrapper (`<main>` vs a fragment `<>`); the root layout already provides the outer `<main className="flex-1">`, so pages that add their own `<main>` produce a nested `<main>` (existing pattern in `about`, `sourcing`, `partner`, `community`, `agri-tech`; `home` and `products` use a fragment).

**Providers:** None. No context providers, theme providers, or client stores are used.

---

## 5. Component Hierarchy

### Home — `/` (`app/page.tsx`)
```
HomePage
├── HeroSection            → ImageWithFallback
├── WhySection             → SectionHeader (+ inline value cards w/ inline SVGs)
├── ProductsSection        → SectionHeader, ProductGrid → ProductCard → ImageWithFallback; Link "View All"
├── SourcingSection        → SectionHeader, SourcingStoryCard → ImageWithFallback; Link "Learn More"
├── TrustSection           → SectionHeader, TrustBadge (×4)
├── PartnershipSection     → SectionHeader, PartnershipStepper
├── OperationsSection      → SectionHeader, WhereWeOperate (reads data/operations)
├── LeadershipSection      → SectionHeader, LeadershipCard → ImageWithFallback
└── ContactSection         → SectionHeader, ContactCard (×3), Google Maps <iframe>
```

### About — `/about`
```
AboutPage
├── PageHero (variant="brown")
├── Our Story / Mission / Vision (inline content, siteConfig-driven)
├── Authentic Sourcing Philosophy (inline)
├── SectionHeader "Our Leadership" + LeadershipCard (×N from data/leadership)
└── CTASection (variant="brown")
```

### Products — `/products`
```
ProductsPage
├── PageHero (default green)
├── Makhana Range  → ProductGrid(makhanaProducts)        → ProductCard → ImageWithFallback
├── Traditional Foods → ProductGrid(sattuProducts, cols=2) → ProductCard
├── Millet Products → ProductGrid(milletProducts, cols=2)  → ProductCard
├── Product note (Link → /partner)
└── CTASection (variant="green")
```

### Product Detail — `/products/[slug]`
```
ProductDetailPage
├── Breadcrumb (Home → Products → name)
├── Detail: ImageWithFallback (fill), category badge, availability, longDescription,
│            highlights list, "Contact for Pricing", Call/Email buttons
├── Related Products (same category) → ImageWithFallback thumbnails (Links)
└── CTASection (variant="brown")
```

### Sourcing — `/sourcing`
```
SourcingPage
├── PageHero (variant="green")
├── SourcingStoryCard (×N, alternating reverse) → ImageWithFallback
├── SectionHeader "Quality Philosophy" + inline copy
└── CTASection (variant="green")
```

### Partner — `/partner`
```
PartnerPage
├── PageHero (variant="brown")
├── SectionHeader + 3 benefit cards (inline SVGs)
├── SectionHeader + PartnershipStepper
├── InquiryForm  (client; useActionState → submitInquiry)
└── CTASection (variant="brown")
```

### Community — `/community`
```
CommunityPage
├── PageHero (variant="community")
├── Featured event narrative: 3 ImageWithFallback blocks (staggered 12-col grid)
├── SectionHeader "What We Learned" + 3 glass-card insight tiles (inline SVGs)
└── Looking Ahead (inline)
```

### Agri-Tech — `/agri-tech`
```
AgriTechPage  (blue/slate theme)
├── PageHero (variant="blue")
├── Intro card
├── SectionHeader + ServiceCard (×N from data/services) → ImageWithFallback
└── CTASection (variant="green")
```

---

## 6. Shared Components

> Legend — **Purpose / Props / Used by / Dependencies / Styling / Notes**

### `PageHero` — `ui/PageHero.tsx`
- **Purpose:** Full-width gradient hero banner at the top of interior pages.
- **Props:** `title: string`, `subtitle?: string`, `variant?: 'green' | 'brown' | 'gold' | 'community' | 'blue'` (default `'green'`).
- **Used by:** about, products, sourcing, partner, community, agri-tech.
- **Dependencies:** none (pure presentational).
- **Styling:** `bg-gradient-to-br` from a `gradientMap`; decorative blurred circles at 10% opacity; centered `<h1>` + gradient accent divider (`accentMap`) + subtitle. `blue` variant maps to indigo/purple (used only by agri-tech).
- **Notes:** Server component. Variant maps are the single place to change hero gradients.

### `SectionHeader` — `ui/SectionHeader.tsx`
- **Purpose:** Standard section title + gradient divider + optional subtitle.
- **Props:** `title: string`, `subtitle?: string`, `align?: 'center' | 'left'` (default `'center'`).
- **Used by:** most sections and interior pages.
- **Dependencies:** none.
- **Styling:** Outfit heading `text-3xl md:text-4xl`, `text-brown-900`; 64px green→gold gradient divider (inline style); `brown-600` subtitle capped at `max-w-2xl`.

### `CTASection` — `ui/CTASection.tsx`
- **Purpose:** Rounded call-to-action banner with Call + Email buttons.
- **Props:** `title: string`, `subtitle?: string`, `variant?: 'green' | 'brown' | 'gold'` (default `'green'`).
- **Used by:** about, products, product detail, sourcing, partner, agri-tech.
- **Dependencies:** none (buttons are `tel:`/`mailto:` anchors with **hard-coded** phone/email).
- **Styling:** `variantStyles` map controls gradient background + primary/secondary button classes. Rounded `2xl`, `max-w-6xl` centered. Pages typically wrap it in a padded/colored `<section>`.
- **Notes:** Phone (`tel:+919973453069`) and email (`millet2024usha@gmail.com`) are hard-coded here, not read from `siteConfig`.

### `ProductCard` — `ui/ProductCard.tsx`
- **Purpose:** Catalog card for a single product.
- **Props:** `product: Product`.
- **Used by:** `ProductGrid` (→ products page + home ProductsSection).
- **Dependencies:** `ImageWithFallback`, `next/link` (title links to `/products/{slug}`).
- **Styling:** `premium-card` + `4:3` image with `premium-image-hover` zoom; `line-clamp-3` description; availability pill; Call/Email buttons.
- **Notes:** Call/Email are hard-coded contact values.

### `ProductGrid` — `ui/ProductGrid.tsx`
- **Purpose:** Responsive grid wrapper for product cards.
- **Props:** `products: Product[]`, `columns?: 2 | 3` (default `3`).
- **Used by:** products page (per-category), home `ProductsSection`.
- **Dependencies:** `ProductCard`.
- **Styling:** `grid-cols-1 sm:grid-cols-2` + `lg:grid-cols-3` or `lg:grid-cols-2` based on `columns`.

### `LeadershipCard` — `ui/LeadershipCard.tsx`
- **Purpose:** Portrait card for a leader/team member.
- **Props:** `leader: Leader`.
- **Used by:** about page, home `LeadershipSection`.
- **Dependencies:** `ImageWithFallback` (category `leadership`).
- **Styling:** `premium-card`, `4:5` portrait with zoom hover; name, green designation, bio.

### `SourcingStoryCard` — `ui/SourcingStoryCard.tsx`
- **Purpose:** Alternating image/text row telling a region's sourcing story.
- **Props:** `story: SourcingStory`, `reverse?: boolean` (default `false`).
- **Used by:** sourcing page, home `SourcingSection` (alternate by index parity).
- **Dependencies:** `ImageWithFallback` (category `sourcing`).
- **Styling:** Flex row that reverses on `lg`; `16:10` image; region pill; `region → product` arrow indicator.

### `ServiceCard` — `ui/ServiceCard.tsx`
- **Purpose:** Agri-Tech service offering card.
- **Props:** `service: Service`.
- **Used by:** agri-tech page only.
- **Dependencies:** `ImageWithFallback` (category `service`). Icon via internal `iconMap` keyed by `service.icon` (`brain | sprout | database | monitor`).
- **Styling:** **Slate/indigo palette** (distinct from the brand green/brown) to match the agri-tech blue theme; `16:9` image with hover scale; feature checklist.

### `TrustBadge` — `ui/TrustBadge.tsx`
- **Purpose:** Credential/trust tile (GST, MSME, etc.).
- **Props:** `item: TrustItem`.
- **Used by:** home `TrustSection`.
- **Dependencies:** internal `iconMap` (`shield | building | check | handshake`) → local icon components.
- **Styling:** `premium-card` + `bg-white/80 backdrop-blur`; green icon circle; centered.

### `ContactCard` — `ui/ContactCard.tsx`
- **Purpose:** Single contact row (phone/email/address) with icon.
- **Props:** `icon: 'phone' | 'email' | 'location'`, `title: string`, `value: string`, `href?: string`.
- **Used by:** home `ContactSection`.
- **Dependencies:** internal `iconMap`. If `href` starts with `http`, opens in a new tab (`target=_blank`, `rel=noopener noreferrer`).
- **Styling:** Icon circle + label/value; hover background.

### `PartnershipStepper` — `ui/PartnershipStepper.tsx`
- **Purpose:** 5-step "How to Partner" process visualization.
- **Props:** none (steps are a local constant).
- **Used by:** partner page, home `PartnershipSection`.
- **Dependencies:** none.
- **Styling:** Horizontal stepper on `md+` (with a gradient connector line), vertical stepper on mobile; trailing Call/Email buttons (hard-coded contacts).

### `WhereWeOperate` — `ui/WhereWeOperate.tsx`
- **Purpose:** Operating-location cards (active vs. expanding).
- **Props:** none (reads `data/operations`).
- **Used by:** home `OperationsSection`.
- **Dependencies:** `operationLocations`.
- **Styling:** Green (active) vs. gold (expanding) card treatment; pulsing status dot for active.

### `ImageWithFallback` — `ui/ImageWithFallback.tsx` (`'use client'`)
- **Purpose:** `next/image` wrapper that shows a category-appropriate gradient block if the image fails to load.
- **Props:** `src`, `alt`, `width?`, `height?`, `fill?`, `className?`, `category?: 'product' | 'sourcing' | 'leadership' | 'service' | 'hero'` (default `'product'`), `sizes?`.
- **Used by:** ProductCard, LeadershipCard, SourcingStoryCard, ServiceCard, HeroSection, ProductDetailPage, CommunityPage.
- **Dependencies:** `next/image`, `useState`.
- **Styling:** On error renders a `<div role="img">` with a per-category `linear-gradient` (uses CSS theme vars). Respects `fill` vs. fixed `width/height`.
- **Notes:** Client component solely to handle the `onError` fallback. Gradient map is the single source for placeholder colors.

### `InquiryForm` — `ui/InquiryForm.tsx` (`'use client'`)
- **Purpose:** Partner/wholesale inquiry form.
- **Props:** none.
- **Used by:** partner page.
- **Dependencies:** `useActionState` (React 19), `submitInquiry` Server Action, `products` (for the product-interest `<select>`), `siteConfig` (fallback contact links).
- **Styling:** White `2xl` card; 2-column field grid; inline per-field error messages; success/error alert banner; spinner while `isPending`.
- **Notes:** See §11 for full form behavior.

### Layout components
- **`Navbar`**, **`Footer`**, **`FloatingCTA`** — documented in §4.

---

## 7. Design System

All tokens are defined in `globals.css` (see §8 for the raw definitions). This section summarizes the visual language they encode.

- **Typography:**
  - Headings → **Outfit** (`--font-heading`), applied globally to `h1–h6` and via `font-heading` utility.
  - Body → **Inter** (`--font-sans`), set on `body`.
  - Common heading scale: hero `text-3xl … md:text-5xl`; section titles `text-3xl md:text-4xl`; card titles `text-xl`.
- **Spacing:** Section vertical rhythm is `py-16 md:py-24`. Content padding `px-4 sm:px-6 lg:px-8`. Container widths `max-w-7xl` (wide), `max-w-6xl`, `max-w-5xl`, `max-w-4xl`, `max-w-3xl` (narrow/text).
- **Border radius:** Cards `rounded-2xl`; buttons/pills/inputs `rounded-xl` or `rounded-full`; small elements `rounded-lg`.
- **Shadow system:** `shadow-sm` at rest → `shadow-xl`/`shadow-lg` on hover; hero image uses `shadow-2xl shadow-green-900/20`.
- **Color palette (theme tokens):**
  - **Green** (primary) `--color-green-50…900`, base `#2E8B57` (500), hover `#228B22` (600).
  - **Brown** (secondary/earth) `--color-brown-50…900`, warm gold `#B8860B` (500).
  - **Gold** (accent) `--color-gold-50…600`.
  - **Warm** (backgrounds) `--color-warm-50…300`.
  - Agri-Tech page intentionally uses Tailwind's built-in **slate/indigo/blue/purple** instead of brand tokens.
- **Gradients:** Hero backgrounds (`bg-gradient-to-br` per `PageHero` variant); dividers `green-500 → gold-400`; `.gradient-text` (green 600→400 clipped to text); CTA banners per variant.
- **Buttons:** Primary = solid `green-600` → hover `green-700`, white text, `rounded-xl`, shadow, some with `hover:-translate-y-0.5`. Secondary = bordered `brown-300`, `brown-700` text, hover `brown-50`.
- **Cards:** `.premium-card` (white, `rounded-2xl`, `border-warm-200`, `shadow-sm` → hover `shadow-xl` + lift). `.glass-card` (translucent white + backdrop blur) used on community insight tiles.
- **Icons:** Inline SVGs, typically `w-4/5/6/8`, `strokeWidth 1.5–2`, colored by context (`text-green-*`, `text-gold-*`, `text-indigo-*`).
- **Badges/pills:** `rounded-full`, tinted background + matching text (`bg-green-100 text-green-700`, `bg-gold-100 text-brown-700`, etc.), often with a small dot; some `animate-pulse`.
- **Image treatment:** Rounded containers with `overflow-hidden`; fixed aspect ratios (`4:3`, `4:5`, `16:9`, `16:10`, `21:9`); `.premium-image-hover` zoom on hover.
- **Hover effects:** Card lift (`hover:-translate-y-1`), shadow growth, image zoom, color transitions, FloatingCTA scale.
- **Animations/transitions:** `transition-all duration-200/300/500`; keyframe animations for fade/slide/scale/float (see §8); scroll-reveal utility classes exist but are applied selectively.
- **Glass effects:** `.glass-card` + occasional `backdrop-blur` on Navbar (when scrolled) and TrustBadge.

---

## 8. globals.css

`src/app/globals.css` is the **entire theming layer** (there is no `tailwind.config.js`). Structure:

1. **`@import "tailwindcss";`** — Tailwind v4 entry.

2. **`@theme inline { … }`** — Defines design tokens as CSS custom properties that Tailwind v4 turns into utility classes and `var()`s:
   - **Color scales:** `--color-green-50…900`, `--color-brown-50…900`, `--color-gold-50…600`, `--color-warm-50…300`. These generate utilities like `bg-green-600`, `text-brown-900`, `border-warm-200`, etc.
   - **Font families:** `--font-sans: var(--font-inter)`, `--font-heading: var(--font-outfit)` → enables `font-sans` / `font-heading`.
   - **Animation tokens:** `--animate-fade-in-up`, `--animate-fade-in`, `--animate-slide-in-left`, `--animate-slide-in-right`, `--animate-scale-in`, `--animate-float`.

3. **`@keyframes`** — `fade-in-up`, `fade-in`, `slide-in-left`, `slide-in-right`, `scale-in`, `float`.

4. **Base styles:**
   - `:root` sets `--background: #fffefb`, `--foreground: #271d0e`.
   - Global `scroll-behavior: smooth` (on `*`).
   - `body` background/color/font + font smoothing.
   - `h1–h6` use the Outfit heading font.
   - Custom **scrollbar** styling (webkit) in warm/brown tones.
   - `:focus-visible` outline in `green-500`.

5. **Utility / reusable classes:**
   - `.animate-on-scroll` + `.is-visible` (+ `.delay-100/200/300/400`) — Intersection-Observer-driven reveal helper (opacity 0 → `fade-in-up`). *(The JS observer is not globally wired; classes are available for opt-in use.)*
   - `.section-divider` — 64px green→gold gradient bar.
   - `.gradient-text` — green gradient clipped to text.
   - `.premium-card` — the standard elevated card (uses `@apply`).
   - `.glass-card` — translucent blurred card.
   - `.premium-image-hover` — hover zoom (`scale-[1.03]`) with `@apply`.
   - `.animate-float-slow` — 6s floating loop (used by the hero image).

**Key takeaway for editors:** To change brand colors, fonts, or add an animation, edit `globals.css` `@theme` — **not** a Tailwind config file (there isn't one).

---

## 9. Data Architecture

All content lives in `src/data/*.ts`, typed by `src/types/index.ts`. Pages/components import these modules directly — there is no CMS, database, or fetch layer for content.

- **`siteConfig.ts`** (default export, typed `SiteConfig`):
  - `brand` — `name`, `tagline`, `founded` ("January 2024"), `description`.
  - `contact` — `phone`, `phoneAction`, `email`, `address[]`, `googleMapsUrl`, `googleMapsEmbed`.
  - `seo` — `domain` (`https://kandimillets.com`), `defaultTitle`, `titleTemplate` (`%s | Kandimillets`), `defaultDescription`.
  - `forms.googleSheetsUrl` — from `process.env.GOOGLE_SHEETS_WEBHOOK_URL`.
  - **Consumed by:** `layout.tsx` (metadata), `Footer`, `ContactSection`, `InquiryForm`, product detail, `sitemap.ts`, `robots.ts`, about page copy.

- **`products.ts`** — `products: Product[]` (6 items across `makhana`/`sattu`/`millet`) plus helpers `getProductBySlug(slug)` and `getAllProductSlugs()`.
  - **Consumed by:** products page (filtered by category), product detail (`generateStaticParams`, lookup, related), `InquiryForm` (select options), `ProductsSection`, `sitemap.ts`.

- **`leadership.ts`** — `leaders: Leader[]` (Founding Managing Director + Director).
  - **Consumed by:** about page, `LeadershipSection`.

- **`navigation.ts`** — `mainNavLinks`, `footerQuickLinks`, `footerBusinessLinks` (`NavLink[]`).
  - **Consumed by:** `Navbar`, `Footer`.

- **`sourcing.ts`** — `sourcingStories: SourcingStory[]` (Madhubani/Makhana, Patna/Sattu, Hyderabad/millets).
  - **Consumed by:** sourcing page, `SourcingSection`.

- **`services.ts`** — `services: Service[]` (4 Agri-Tech offerings; each has `features[]` and an `icon` key).
  - **Consumed by:** agri-tech page (`ServiceCard`).

- **`trust.ts`** — `trustItems: TrustItem[]` (GST, MSME, Quality, Partnerships; `icon` key).
  - **Consumed by:** `TrustSection` (`TrustBadge`).

- **`operations.ts`** — `operationLocations: OperationLocation[]` (Hyderabad active, Patna expanding).
  - **Consumed by:** `WhereWeOperate` (home `OperationsSection`).

**How pages consume data:** Pages `import` the named array/object and either `.map()` it into a reusable card component or filter it (e.g. products by `category`). Icon-bearing data (`Service`, `TrustItem`, `ContactCard`) stores an **icon key string**; the rendering component holds an `iconMap` translating that key to an inline SVG. This keeps data serializable and decouples content from markup.

**Centralized constants worth noting:** brand founding date, SEO domain/title template, and the Google Sheets webhook env var all funnel through `siteConfig`. Contact phone/email, however, are **also hard-coded** in several presentational components (see §16/§17).

---

## 10. Assets

- **Location:** `public/images/`. Referenced by absolute path (`/images/<file>`); served from the site root.
- **Categories present:**
  - **Product:** `makhana-placeholder.jpg.png`, `salted-makhana-placeholder.jpg.jpeg`, `jaggery-makhana-placeholder.jpg.png`, `chana-sattu-placeholder.jpg.png`, `ragi-semiya-placeholder.jpg.png`, `jowar-pasta-placeholder.jpg.jpg`.
  - **Leadership:** `founder-placeholder.jpg.jpeg`, `director-placeholder.jpg.jpeg`.
  - **Sourcing:** `madhubani-placeholder.jpg.jpg`, `sattu-placeholder.jpg.jpg`, `hyderabad-placeholder.jpg.jpg`.
  - **Hero:** `hero-products-placeholder.jpg`.
  - **Agri-Tech:** `agri-tech-ai.jpg.png`, `agri-tech-solutions.jpg.png`, `agri-tech-data.jpg.png`, `agri-tech-digital.jpg.png`.
  - **Community (real event photos):** `nakshatra-anand-mela-stall.jpeg`, `nakshatra-anand-mela-consumers-1.jpeg`, `nakshatra-anand-mela-consumers-2.jpeg`.
  - **Default CNA SVGs (unused by the app):** `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.
- **Naming conventions:**
  - Most images use a `<subject>-placeholder.jpg.<realext>` pattern — the literal string `.jpg` is part of the base name, followed by the true extension (`.png`, `.jpeg`, `.jpg`). This means the extension is **not** reliably `.jpg`; always reference the exact filename from the data module.
  - Community photos use descriptive, real (non-placeholder) names.
  - Data modules store the **full path including the double extension**, e.g. `image: "/images/makhana-placeholder.jpg.png"`.
- **Placeholder strategy:** Images are rendered through `ImageWithFallback`. If a file is missing or fails to load, the component swaps in a **category-tinted gradient block** (`product`, `sourcing`, `leadership`, `service`, `hero`) so layouts never break. This is why filenames say "placeholder" — they are meant to be replaced without touching code, as long as the exact path/extension is preserved.

---

## 11. Forms

There is one form: the **partner inquiry form**.

**Client — `ui/InquiryForm.tsx`:**
- Uses React 19 `useActionState(submitInquiry, initialState)` → `[state, formAction, isPending]`.
- Native `<form action={formAction}>` (progressive enhancement; no client fetch).
- Fields: `name`, `businessName`, `email`, `location`, `phone`, `productInterest` (`<select>` populated from `products` + "Multiple Products" / "All Products"), and optional `message`.
- Client-side hints: `required`, `minLength`, `type=email/tel`. Per-field server errors render inline (`state.errors`). A status banner shows success/error; the submit button shows a spinner and disables while `isPending`.
- Alternative contact links fall back to `siteConfig.contact`.

**Server Action — `app/actions.ts` (`"use server"`):**
- `submitInquiry(prevState, formData): Promise<FormState>` where `FormState.status ∈ { idle, success, error, validation_error }`.
- **Sanitization** (`sanitize`): strips HTML tags, strips `< > " ' &`, trims, caps length at 1000 chars — applied to every field.
- **Validation** (`validateForm`): name ≥ 2 chars, businessName ≥ 2, email via `EMAIL_REGEX`, location ≥ 2, phone via `PHONE_REGEX` (`^\+?\d[\d\s\-]{7,14}$`), productInterest required. Returns `ValidationError[]` → `validation_error` state.
- **Rate limiting:** In-memory `Map` keyed by IP, `RATE_LIMIT_MAX = 5` per `RATE_LIMIT_WINDOW_MS = 15 min`. **Note:** the key is currently the constant `"server-global"` (a code comment flags that real per-IP limiting needs middleware/headers), so the limit is effectively global, not per-user. Also, in-memory state does not persist across serverless instances/restarts.
- **Google Sheets integration:** Reads `process.env.GOOGLE_SHEETS_WEBHOOK_URL`. If unset → returns an error state and logs. Otherwise `POST`s JSON `{ ...data, timestamp }` to the webhook; non-2xx or thrown error → error state; success → "Thank you. Our team will contact you within 24 hours."
- **Environment variables:** `GOOGLE_SHEETS_WEBHOOK_URL` is the only runtime secret; consumed both directly in the action and surfaced (optionally) via `siteConfig.forms.googleSheetsUrl`.

**Success/error states:** Communicated entirely through the returned `FormState.status` + `message` (+ `errors`), rendered by the client component. No redirect, toast library, or client router involvement.

---

## 12. Styling Philosophy

The visual language is **premium, warm, organic, and agriculture-inspired**, aimed at conveying trust and authenticity to retail/distribution partners:

- **Agriculture-inspired & organic:** Green (sea/forest green) as primary, earthy brown as secondary, millet gold as accent, on warm off-white backgrounds with subtle green/earth tints. Rounded corners and soft shadows evoke a natural, approachable feel.
- **Premium & modern:** Generous whitespace (`py-16 md:py-24`), large Outfit display headings, elevated `premium-card` surfaces with hover lift, gradient text/dividers, `2xl` radii, and tasteful blur/glass accents.
- **Warm & professional:** Muted, low-saturation warm neutrals; credential badges (GST/MSME) and a structured partnership process communicate legitimacy.
- **Minimal & consistent:** A small set of reusable primitives (`PageHero`, `SectionHeader`, `CTASection`, cards) is composed repeatedly, so pages feel uniform. Inline SVG icons keep the bundle lean and the look bespoke.
- **Deliberate exception:** The **Agri-Tech** page adopts a **cool blue/indigo/slate "tech" palette** to visually separate the technology division from the food brand. This is an intentional design decision, not an inconsistency.

---

## 13. Responsive Strategy

- **Breakpoints:** Tailwind defaults — `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). The app primarily uses `sm`, `md`, `lg`.
- **Container widths:** Centered `max-w-7xl` for wide sections; `max-w-6xl/5xl/4xl/3xl` for narrower content; consistent horizontal padding `px-4 sm:px-6 lg:px-8`.
- **Grid system:** Card grids scale `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3/4`. Community page uses a 12-column grid (`md:grid-cols-12`) with `col-span-7/5` splits.
- **Flex usage:** Hero and sourcing/product-detail rows use `flex-col` → `lg:flex-row` (with `lg:flex-row-reverse` for alternating sourcing cards).
- **Mobile behavior:** Navbar collapses into a hamburger menu (animated max-height); `PartnershipStepper` switches from horizontal to a vertical timeline; CTAs stack and go full-width; single-column grids.
- **Tablet behavior (`md`):** Two-column card grids; stepper becomes horizontal; increased section padding.
- **Desktop behavior (`lg+`):** Multi-column layouts (3–4 up), side-by-side hero/text/image, larger type scale, decorative background blurs become prominent.

---

## 14. Animation System

- **Hover animations:** Card lift (`hover:-translate-y-1`, `hover:-translate-y-0.5`), shadow growth (`shadow-sm → shadow-xl/lg`), border tint changes, text color transitions. `FloatingCTA` scales (`hover:scale-110`).
- **Transitions:** Pervasive `transition-all`/`transition-colors`/`transition-transform` at `duration-200/300/500` with `ease-out`/`ease-in-out`.
- **Reveal animations:** `@keyframes fade-in-up/fade-in/slide-in-left/slide-in-right/scale-in` are defined and exposed as `--animate-*` tokens; `.animate-on-scroll(.is-visible)(.delay-*)` provides an opt-in Intersection-Observer reveal pattern (opacity 0 → fade-in-up with staggered delays).
- **Image zoom:** `.premium-image-hover` (`hover:scale-[1.03]`, 500ms) on product/leadership/sourcing images; `ServiceCard` uses `group-hover:scale-105`.
- **Button interactions:** Color shift + shadow, some with slight upward translate; form submit shows an `animate-spin` SVG spinner while pending.
- **Hero effects:** `HeroSection` image floats continuously via `.animate-float-slow` (6s loop) atop blurred decorative gradient blobs; `PageHero` has static decorative translucent circles.
- **Misc:** Global `scroll-behavior: smooth`; pulsing status dots (`animate-pulse`) on "since founded" badge and active operation location.

---

## 15. Naming Conventions

- **Files / components:** React components are `PascalCase.tsx` and use `export default`. Route files are lowercase `page.tsx` inside lowercase, kebab-or-single-word route folders (`about`, `agri-tech`, `products/[slug]`).
- **Directories:** `layout/`, `sections/`, `ui/`, `data/`, `types/` — lowercase, role-based.
- **Data modules:** lowercase filenames (`products.ts`, `siteConfig.ts`); export **named** arrays/objects in `camelCase` (`products`, `sourcingStories`, `trustItems`, `mainNavLinks`, `operationLocations`). `siteConfig` is a **default** export; most others are named.
- **Types:** `PascalCase` interfaces in `types/index.ts` (`Product`, `Leader`, `SourcingStory`, `Service`, `TrustItem`, `NavLink`, `OperationLocation`, `SiteConfig`, `InquiryFormData`). Union types encode enumerations (e.g. `category`, `icon`, `status`).
- **Data object IDs:** kebab-case string `id`s (`"plain-makhana"`, `"founder-director"`, `"madhubani-makhana"`), also used as React `key`s and (for products) as slugs.
- **Images:** `<subject>-placeholder.jpg.<ext>` (double-extension quirk) for stock/placeholder assets; descriptive kebab-case names for real photos.
- **CSS:** Design tokens `--color-<scale>-<step>`, `--font-*`, `--animate-*`. Reusable classes kebab-case (`.premium-card`, `.glass-card`, `.gradient-text`, `.premium-image-hover`, `.animate-float-slow`).
- **Props interfaces:** `<Component>Props` (e.g. `ProductCardProps`), variant maps as local `const` objects (`gradientMap`, `variantStyles`, `iconMap`).
- **Client components** are explicitly marked with `'use client'`; everything else is a Server Component by default.

---

## 16. Dependencies Between Components

- **`ImageWithFallback` is the shared image primitive** — `ProductCard`, `LeadershipCard`, `SourcingStoryCard`, `ServiceCard`, `HeroSection`, `ProductDetailPage`, and `CommunityPage` all depend on it. Changing its API affects every image on the site.
- **`ProductGrid → ProductCard → ImageWithFallback + next/link`** — the product display chain. Used by both the products page and the home `ProductsSection`.
- **`SectionHeader` is used almost everywhere** — nearly every section/interior page renders it for the title + divider.
- **`CTASection` is a global closer** — reused by about, products, product detail, sourcing, partner, agri-tech. It hard-codes contact info independent of `siteConfig`.
- **`PageHero` is reused across all interior pages** — the single source for interior page banners (variant-driven).
- **`PartnershipStepper`** is shared by the partner page and the home `PartnershipSection`.
- **`SourcingStoryCard`** is shared by the sourcing page and the home `SourcingSection` (fed from `data/sourcing`).
- **`LeadershipCard`** is shared by the about page and the home `LeadershipSection` (fed from `data/leadership`).
- **Icon-key pattern:** `ServiceCard`, `TrustBadge`, and `ContactCard` each own an internal `iconMap` and depend on the icon key string stored in their data (`Service.icon`, `TrustItem.icon`) or passed as a prop.
- **`InquiryForm` depends on the `submitInquiry` Server Action** (`app/actions.ts`), the `products` data (select options), and `siteConfig` (fallback links).
- **`layout.tsx` depends on** `Navbar`, `Footer`, `FloatingCTA`, `siteConfig`, and the two Google fonts.
- **Home sections depend on their data modules** — `ProductsSection→products`, `SourcingSection→sourcingStories`, `TrustSection→trustItems`, `OperationsSection→WhereWeOperate→operationLocations`, `LeadershipSection→leaders`, `ContactSection→siteConfig`.

---

## 17. Things That Should Never Be Broken

These are load-bearing architectural decisions. Preserve them:

1. **Centralized `siteConfig`** — brand, contact, SEO, and the form webhook flow through `src/data/siteConfig.ts` and drive root metadata, sitemap, robots, footer, and contact UI.
2. **Data-driven content in `src/data/`** — pages render from typed arrays/objects. Content changes should happen in `data/`, not in JSX.
3. **Shared primitives, no duplication** — `ProductCard`, `ProductGrid`, `PageHero`, `SectionHeader`, `CTASection`, `LeadershipCard`, `SourcingStoryCard`, `ImageWithFallback` are single-source components reused across pages. Do not fork copies.
4. **`ImageWithFallback` everywhere** — never use bare `next/image` directly for content images; the fallback gradient keeps layouts intact when assets are missing.
5. **Typed contracts in `types/index.ts`** — data and components share these interfaces. Keep data shapes and component props in sync with them.
6. **App Router conventions** — `page.tsx` per route, `generateStaticParams` + `dynamicParams = false` for products (all product pages are pre-rendered; unknown slugs → `notFound()`), `metadata`/`generateMetadata` for SEO, Server Action for the form.
7. **Tailwind v4 theme in `globals.css`** — there is **no** `tailwind.config.js`. Tokens live in `@theme inline`. Don't introduce a config file expecting it to be picked up without wiring; edit the CSS tokens instead.
8. **Icon-key → `iconMap` pattern** — keeps data serializable. Add new icons by extending the map + the union type, not by putting JSX in data.
9. **Server/Client boundary** — only `Navbar`, `FloatingCTA`, `ImageWithFallback`, and `InquiryForm` are `'use client'`. Keep interactivity confined to leaves; keep pages/sections as Server Components where possible.
10. **Form security pipeline** — sanitize → validate → rate-limit → webhook. Don't remove sanitization/validation when editing `actions.ts`.

---

## 18. Future Extension Points

Safe, low-risk places to extend (following existing patterns):

- **Add a product:** Append an object to `products` in `data/products.ts` (unique `id`/`slug`, valid `category`, and an image in `public/images/`). It auto-appears in the catalog (filtered by category), gets a pre-rendered detail page via `generateStaticParams`, is added to the sitemap, and shows up in the inquiry form's product select. **No component changes needed.**
- **Add a page/route:** Create `src/app/<route>/page.tsx`, export `metadata`, compose `PageHero` + `SectionHeader` + `CTASection` + relevant cards. Add the route to `mainNavLinks`/footer links (and, to be consistent, to `sitemap.ts`).
- **Add leadership / sourcing story / trust badge / service / operation:** Append to the corresponding `data/*.ts` module. For icon-bearing types, reuse an existing icon key or extend the type's union + the component's `iconMap`.
- **Add testimonials/events:** Follow the `data/ + card component + section` pattern (e.g. model on `SourcingStoryCard` or the community narrative blocks). Prefer a new `data/testimonials.ts` + a `ui/TestimonialCard.tsx`.
- **Change colors/theme:** Edit the `@theme` color tokens in `globals.css`. All utilities update automatically.
- **Add animations:** Add a `@keyframes` block + an `--animate-*` token in `globals.css`, then apply via utility/class. The `.animate-on-scroll` scaffold exists for reveal effects.
- **Change card/hero look:** Edit the shared component (`premium-card` in CSS, or `PageHero`/`CTASection` variant maps) once — it propagates everywhere.
- **Add a hero/CTA variant:** Extend the `gradientMap`/`accentMap` (PageHero) or `variantStyles` (CTASection) and the corresponding `variant` union.

---

## 19. AI Developer Notes

Guidance for future AI assistants working in this repo:

- **Read the bundled Next.js docs first.** `AGENTS.md` explicitly warns this Next.js version (16.2.7) may diverge from training data. Before writing framework-level code (routing, metadata, server actions, image, fonts), consult `node_modules/next/dist/docs/`. Heed deprecation notices. Do not assume older App Router semantics.
- **Content changes belong in `src/data/`, not JSX.** If asked to change copy, add a product, or update contact info, edit the data module (and `siteConfig`). Search for hard-coded values only when a data source doesn't cover them.
- **Reuse, don't recreate.** Before adding UI, check `components/ui/` — a suitable primitive almost certainly exists (`PageHero`, `SectionHeader`, `CTASection`, `ProductCard`, `ProductGrid`, `ImageWithFallback`, the various cards). Extend via props/variants rather than forking.
- **Extend variant maps for new looks.** New hero/CTA styles → add to `gradientMap`/`accentMap`/`variantStyles` **and** the `variant` union type. New icons → extend the union in `types/index.ts` **and** the component's `iconMap`.
- **Respect the Server/Client boundary.** Keep pages and sections as Server Components. Only add `'use client'` when a component genuinely needs state/effects/browser APIs (as `Navbar`, `FloatingCTA`, `ImageWithFallback`, `InquiryForm` do).
- **Use `ImageWithFallback` for all content images**, passing the correct `category`. Preserve the exact image path (including the `.jpg.<ext>` double-extension quirk) from the data module.
- **Theme via `globals.css` only.** There is no `tailwind.config.js`. Add/adjust tokens in `@theme inline`. Don't hard-code hex colors in components when a token exists (`green-*`, `brown-*`, `gold-*`, `warm-*`).
- **Keep types authoritative.** Update `types/index.ts` alongside any data-shape or prop change so the compiler enforces consistency.
- **Preserve the form's security pipeline** (sanitize → validate → rate-limit → webhook) when touching `app/actions.ts`. The `GOOGLE_SHEETS_WEBHOOK_URL` env var is required for submissions to succeed.
- **Architectural style to respect:** data-driven, composition of small reusable primitives, statically generated App Router, warm agriculture-inspired design system (with the Agri-Tech page as a deliberate blue-themed exception), inline-SVG icons, and no global state/CMS. Match the existing Tailwind utility density, comment style, and PascalCase component / camelCase data conventions.
- **Known inconsistencies to be aware of (documented, not to "fix" unless asked):** `/community` is missing from `sitemap.ts`; contact phone/email are hard-coded in several presentational components (`CTASection`, `ProductCard`, `PartnershipStepper`, `HeroSection`) rather than read from `siteConfig`; several interior pages render a `<main>` that nests inside the layout's `<main>`; the form rate-limiter uses a global key rather than a real per-IP key.
```

