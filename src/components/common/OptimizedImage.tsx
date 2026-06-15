// src/components/common/OptimizedImage.tsx
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** The display width in pixels – used for the resize proxy and helps prevent layout shift. */
  width?: number;
  /** The display height in pixels – used for the resize proxy and helps prevent layout shift. */
  height?: number;
  /** JPEG/WebP quality (0-100). Default 60 for a good balance of speed vs quality. */
  quality?: number;
  /** Controls native lazy loading. Use "eager" for above‑the‑fold images (LCP). Default "lazy". */
  loading?: 'lazy' | 'eager';
  /** Hint for the browser to prioritise fetching this image. Use "high" for LCP images. Default "auto". */
  fetchpriority?: 'high' | 'low' | 'auto';
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  quality = 60,
  loading = 'lazy',
  fetchpriority = 'auto',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Build an optimised URL.
  let optimizedSrc = src;

  if (!error && width) {
    try {
      const isSupabaseStorage = src.includes('supabase.co/storage/v1/object/public');

      if (isSupabaseStorage) {
        // ------------------------------------------------------------------
        // Supabase Free Plan → use images.weserv.nl as a free resize proxy
        // ------------------------------------------------------------------
        const proxy = 'https://images.weserv.nl/';
        const params = new URLSearchParams();
        params.set('url', src);
        params.set('w', width.toString());
        if (height) params.set('h', height.toString());
        params.set('q', (quality || 60).toString());
        params.set('output', 'webp');   // optional: convert to WebP
        // Let the browser handle the final format
        params.set('default', '');
        optimizedSrc = `${proxy}?${params.toString()}`;
      } else {
        // For non‑Supabase URLs (local files, other CDNs), keep the original.
        // You can add your own resizing logic here if needed.
        optimizedSrc = src;
      }
    } catch {
      // If URL parsing fails, fall back to the original src.
      optimizedSrc = src;
    }
  }

  return (
    <div className={cn('relative overflow-hidden bg-gray-200', className)}>
      {/* Subtle loading placeholder until the image finishes loading */}
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-gray-300" />}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        fetchpriority={fetchpriority}
        decoding="async"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true);
          setIsLoaded(true); // hide placeholder even on error
        }}
      />
    </div>
  );
}