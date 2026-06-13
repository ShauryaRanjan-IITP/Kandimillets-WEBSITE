'use client';

import Image from 'next/image';
import { useState } from 'react';

type FallbackCategory = 'product' | 'sourcing' | 'leadership' | 'service' | 'hero';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  category?: FallbackCategory;
  sizes?: string;
}

const gradients: Record<FallbackCategory, string> = {
  product: 'linear-gradient(135deg, var(--color-green-100), var(--color-gold-100))',
  sourcing: 'linear-gradient(135deg, var(--color-brown-100), var(--color-warm-200))',
  leadership: 'linear-gradient(135deg, var(--color-warm-200), var(--color-green-50))',
  service: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
  hero: 'linear-gradient(135deg, var(--color-green-50), var(--color-gold-50))',
};

function LeafIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" /><path d="M15 20v2" />
      <path d="M2 15h2" /><path d="M2 9h2" />
      <path d="M20 15h2" /><path d="M20 9h2" />
      <path d="M9 2v2" /><path d="M9 20v2" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

const categoryIcons: Record<FallbackCategory, () => React.JSX.Element> = {
  product: LeafIcon,
  sourcing: MapPinIcon,
  leadership: UserIcon,
  service: CpuIcon,
  hero: ImageIcon,
};

function getFilename(src: string): string {
  try {
    const parts = src.split('/');
    return parts[parts.length - 1] || src;
  } catch {
    return src;
  }
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fill,
  className,
  category = 'product',
  sizes,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    const gradient = gradients[category];
    const IconComponent = categoryIcons[category];
    const filename = getFilename(src);

    return (
      <div
        className={`flex flex-col items-center justify-center ${className ?? ''}`}
        style={{
          background: gradient,
          ...(fill
            ? { position: 'absolute', inset: 0 }
            : { width: width ?? '100%', height: height ?? 200 }),
        }}
        role="img"
        aria-label={alt}
      >
        <span className="text-brown-400">
          <IconComponent />
        </span>
        <span className="mt-2 text-sm text-brown-500 text-center px-4 line-clamp-2">
          {alt}
        </span>
        <span className="mt-1 text-xs text-brown-400 text-center px-4">
          Replace: {filename}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
