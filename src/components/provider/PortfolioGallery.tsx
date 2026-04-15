// src/components/provider/PortfolioGallery.tsx
import { useState } from 'react';
import { OptimizedImage } from '../common/OptimizedImage';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioImage {
  id: string;
  image_url: string;
  title?: string | null;
  description?: string | null;
}

interface PortfolioGalleryProps {
  images: PortfolioImage[];
}

export function PortfolioGallery({ images }: PortfolioGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };
  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.slice(0, 8).map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <OptimizedImage
              src={image.image_url}
              alt={image.title || 'Portfolio image'}
              className="w-full h-full"
              width={300}
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          <button
            onClick={prevImage}
            disabled={lightboxIndex === 0}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Main lightbox image */}
          <img
            src={images[lightboxIndex].image_url}
            alt={images[lightboxIndex].title || 'Portfolio'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          {/* Next button */}
          <button
            onClick={nextImage}
            disabled={lightboxIndex === images.length - 1}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}