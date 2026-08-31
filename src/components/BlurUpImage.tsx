import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import {
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
  getPictureSourceSets,
  ImageFormat
} from '../utils/imageOptimizer';

interface BlurUpImageProps {
  src: string;
  thumbnailSrc?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  showHdBadge?: boolean;
  priority?: boolean;
  zoom?: number;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
  format?: ImageFormat;
  sizes?: string;
  style?: React.CSSProperties;
}

export const BlurUpImage: React.FC<BlurUpImageProps> = ({
  src,
  thumbnailSrc,
  alt = 'Imagem em alta resolução',
  className = '',
  containerClassName = '',
  onClick,
  referrerPolicy = 'no-referrer',
  showHdBadge = false,
  priority = false,
  zoom = 1,
  targetWidth,
  targetHeight,
  quality = 90,
  format = 'auto',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1920px',
  style = {}
}) => {
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If a micro-thumbnail was not provided in data, automatically request a lightweight 48px WebP blur placeholder
  const placeholder = thumbnailSrc || (src ? getOptimizedImageUrl(src, { width: 48, height: 48, quality: 25, format: 'webp' }) : '');

  // High-res optimized image URL
  const optimizedMainUrl = src ? getOptimizedImageUrl(src, { width: targetWidth, height: targetHeight, quality, format }) : '';

  // Generate responsive srcSet for device-aware delivery
  const responsiveSrcSet = src ? generateResponsiveSrcSet(src, { height: targetHeight, quality, format }) : '';
  const pictureSets = src ? getPictureSourceSets(src, { height: targetHeight, quality }) : null;

  // Reset loading status when main src changes
  useEffect(() => {
    setIsFullLoaded(false);
    setHasError(false);

    if (!src) return;

    // Check if the image is already cached in browser memory
    const img = new Image();
    img.src = optimizedMainUrl || src;
    img.referrerPolicy = referrerPolicy;
    if (img.complete && img.naturalWidth > 0) {
      setIsFullLoaded(true);
    }
  }, [src, optimizedMainUrl, referrerPolicy]);

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${containerClassName}`}
      onClick={onClick}
      style={style}
    >
      {/* 1. Background Micro Thumbnail / Blur-Up Placeholder */}
      {placeholder && !hasError && (
        <img
          src={placeholder}
          alt={alt}
          aria-hidden="true"
          referrerPolicy={referrerPolicy}
          style={{ transform: `scale(${zoom * 1.05})` }}
          className={`w-full h-full object-contain filter transition-all duration-700 ease-out pointer-events-none select-none ${
            isFullLoaded ? 'opacity-0 blur-0' : 'opacity-100 blur-md sm:blur-xl'
          } ${className}`}
        />
      )}

      {/* 2. Main Full-Resolution Image with Responsive SrcSet & AVIF/WebP Picture Delivery */}
      {!hasError && src ? (
        <picture className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-auto">
          {pictureSets && pictureSets.avifSrcSet && (
            <source type="image/avif" srcSet={pictureSets.avifSrcSet} sizes={sizes} />
          )}
          {pictureSets && pictureSets.webpSrcSet && (
            <source type="image/webp" srcSet={pictureSets.webpSrcSet} sizes={sizes} />
          )}
          <motion.img
            key={src}
            src={optimizedMainUrl || src}
            srcSet={responsiveSrcSet || undefined}
            sizes={sizes}
            alt={alt}
            referrerPolicy={referrerPolicy}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setIsFullLoaded(true)}
            onError={() => setHasError(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isFullLoaded ? 1 : 0, scale: zoom }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`w-full h-full object-contain absolute inset-0 transition-transform duration-200 ${
              isFullLoaded ? 'filter-none' : 'filter blur-sm opacity-0'
            } ${className}`}
          />
        </picture>
      ) : hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 p-4 bg-neutral-900/60 rounded-xl">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50 text-neutral-400" />
          <span className="text-xs">Não foi possível carregar a imagem</span>
        </div>
      ) : null}

      {/* 3. HD Loading Indicator Badge (only in Lightbox / Fullscreen modes) */}
      <AnimatePresence>
        {showHdBadge && !isFullLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 z-30 bg-neutral-950/80 backdrop-blur-md border border-[#c5a880]/40 text-[#dfd1a1] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-2xl pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#dfd1a1]" />
            <span className="tracking-wide text-[11px]">Otimizando Ultra HD (WebP/AVIF)...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlurUpImage;
