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

    return (
      <div
        className={`${className ?? ''}`}
        style={{
          background: gradient,
          ...(fill
            ? { position: 'absolute' as const, inset: 0 }
            : { width: width ?? '100%', height: height ?? 200 }),
        }}
        role="img"
        aria-label={alt}
      />
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
