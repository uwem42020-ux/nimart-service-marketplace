// src/components/common/OptimizedImage.tsx
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** The exact display width in CSS pixels (not multiplied by DPR) */
  width?: number;
  /** The exact display height in CSS pixels (optional) */
  height?: number;
  quality?: number;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  quality = 80,
  loading = 'lazy',
  fetchpriority = 'auto',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    setDpr(window.devicePixelRatio || 1);
  }, []);

  let optimizedSrc = src;

  if (!error && width) {
    try {
      const isSupabase = src.includes('supabase.co/storage/v1/object/public');
      if (isSupabase) {
        const effectiveDpr = dpr >= 2 ? 2 : 1;
        const proxy = 'https://images.weserv.nl/';
        const params = new URLSearchParams();
        params.set('url', src);
        // Request the image at display width × device pixel ratio
        params.set('w', (width * effectiveDpr).toString());
        if (height) params.set('h', (height * effectiveDpr).toString());
        params.set('q', quality.toString());
        params.set('output', 'webp');
        params.set('default', '');
        optimizedSrc = `${proxy}?${params.toString()}`;
      }
    } catch {
      optimizedSrc = src;
    }
  }

  return (
    <div className={cn('relative overflow-hidden bg-gray-200', className)}>
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
          setIsLoaded(true);
        }}
      />
    </div>
  );
}