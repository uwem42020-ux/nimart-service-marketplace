import { useState } from 'react'; 
import { cn } from '../../lib/utils'; 
 
interface OptimizedImageProps { 
  src: string; 
  alt: string; 
  className?: string; 
} 
 
export function OptimizedImage({ src, alt, className }: OptimizedImageProps) { 
  const [isLoaded, setIsLoaded] = useState(false); 
  return ( 
    <div className={cn('relative overflow-hidden', className)}> 
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />} 
      <img 
        src={src} 
        alt={alt} 
        className={cn('w-full h-full object-cover transition-opacity duration-300', isLoaded ? 'opacity-100' : 'opacity-0')} 
        onLoad={() => setIsLoaded(true)} 
      /> 
    </div> 
  ); 
} 
