// src/components/common/OptimizedImage.tsx
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, className, width, height }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Build optimized URL with transformation parameters if width/height provided
  let optimizedSrc = src;
  if ((width || height) && !error) {
    try {
      const url = new URL(src);
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      optimizedSrc = url.toString();
    } catch {
      // If URL parsing fails, fall back to original src
      optimizedSrc = src;
    }
  }

  return (
    <div className={cn('relative overflow-hidden bg-gray-200', className)}>
      {/* Loading placeholder */}
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-gray-300" />}
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setError(true);
          setIsLoaded(true); // Hide placeholder
        }}
      />
    </div>
  );
}