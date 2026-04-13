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

  if (!images.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.slice(0, 8).map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition"
          >
            <OptimizedImage
              src={image.image_url}
              alt={image.title || 'Portfolio image'}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={prevImage}
            disabled={lightboxIndex === 0}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-30"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <img
            src={images[lightboxIndex].image_url}
            alt={images[lightboxIndex].title || 'Portfolio'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          
          <button
            onClick={nextImage}
            disabled={lightboxIndex === images.length - 1}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-30"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}