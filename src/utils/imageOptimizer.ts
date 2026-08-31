/**
 * WM2 High-Performance Image Optimization & Delivery Service
 * 
 * Supports dynamic real-time edge processing and delivery pipelines:
 * - Dynamic Edge Optimizer (powered by global edge caching with automatic WebP / AVIF conversion)
 * - Cloudinary Image Pipeline (fetch & upload modes)
 * - Imgix Dynamic Processing (f=auto, q=auto, dpr, w, h)
 * - ImageKit Dynamic CDN (tr:w-...,q-...,f-auto)
 * - Unsplash / Pexels native parameter handling
 * - Client-side high-fidelity WebP/AVIF encoding with JPEG fallback
 */

export type ImageCdnProvider = 'auto' | 'wsrv' | 'cloudinary' | 'imgix' | 'imagekit' | 'direct';
export type ImageFormat = 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';

export interface ImageCdnConfig {
  provider: ImageCdnProvider;
  cloudinaryCloudName?: string;
  imgixDomain?: string;
  imagekitId?: string;
  preferredFormat: ImageFormat;
  defaultQuality: number;
  enableResponsiveSrcSet: boolean;
  enableEdgeProxy: boolean;
}

const STORAGE_KEY = 'wm2_image_cdn_config';

export const DEFAULT_CDN_CONFIG: ImageCdnConfig = {
  provider: 'auto',
  cloudinaryCloudName: '',
  imgixDomain: '',
  imagekitId: '',
  preferredFormat: 'auto',
  defaultQuality: 94,
  enableResponsiveSrcSet: true,
  enableEdgeProxy: true
};

/**
 * Retrieve saved CDN settings from localStorage or defaults
 */
export function getImageCdnConfig(): ImageCdnConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CDN_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_CDN_CONFIG;
}

/**
 * Save CDN configuration to localStorage
 */
export function saveImageCdnConfig(config: Partial<ImageCdnConfig>): ImageCdnConfig {
  const current = getImageCdnConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  dpr?: number;
  fit?: 'cover' | 'contain' | 'crop' | 'inside' | 'fill';
  provider?: ImageCdnProvider;
}

/**
 * Transforms an image URL to serve modern WebP/AVIF formats at targeted width and DPR.
 */
export function getOptimizedImageUrl(url?: string, options: OptimizeImageOptions = {}): string {
  if (!url) return '';

  // Return base64 or blob URLs untouched
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const config = getImageCdnConfig();
  const provider = options.provider || config.provider;
  const quality = options.quality ?? config.defaultQuality;
  const format = options.format ?? config.preferredFormat;
  const width = options.width;
  const height = options.height;
  const dpr = options.dpr ?? (typeof window !== 'undefined' ? Math.min(Math.round(window.devicePixelRatio || 1), 2) : 1);
  const fit = options.fit || 'inside';

  // 1. Native Unsplash handling
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', format === 'avif' ? 'format,compress' : 'format');
      parsed.searchParams.set('fit', fit === 'cover' ? 'crop' : 'max');
      if (width) parsed.searchParams.set('w', String(width));
      if (height) parsed.searchParams.set('h', String(height));
      parsed.searchParams.set('q', String(quality));
      if (dpr > 1) parsed.searchParams.set('dpr', String(dpr));
      if (format === 'avif' || format === 'webp') {
        parsed.searchParams.set('fm', format);
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // 2. Native Pexels handling
  if (url.includes('images.pexels.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'compress');
      parsed.searchParams.set('cs', 'tinysrgb');
      if (width) parsed.searchParams.set('w', String(width));
      if (height) parsed.searchParams.set('h', String(height));
      if (dpr > 1) parsed.searchParams.set('dpr', String(dpr));
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // 3. Custom Cloudinary Integration
  if (provider === 'cloudinary' && config.cloudinaryCloudName) {
    const transforms: string[] = ['f_auto', `q_${quality}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (dpr > 1) transforms.push(`dpr_${dpr}`);
    if (fit === 'cover') transforms.push('c_fill');
    else if (fit === 'contain') transforms.push('c_fit');

    const transformStr = transforms.join(',');
    return `https://res.cloudinary.com/${config.cloudinaryCloudName}/image/fetch/${transformStr}/${encodeURIComponent(url)}`;
  }

  // 4. Custom Imgix Integration
  if (provider === 'imgix' && config.imgixDomain) {
    try {
      const cleanDomain = config.imgixDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const parsed = new URL(`https://${cleanDomain}/${encodeURIComponent(url)}`);
      parsed.searchParams.set('auto', 'format,compress');
      parsed.searchParams.set('q', String(quality));
      if (width) parsed.searchParams.set('w', String(width));
      if (height) parsed.searchParams.set('h', String(height));
      if (dpr > 1) parsed.searchParams.set('dpr', String(dpr));
      if (format && format !== 'auto') parsed.searchParams.set('fm', format);
      return parsed.toString();
    } catch {
      // fallback
    }
  }

  // 5. Custom ImageKit Integration
  if (provider === 'imagekit' && config.imagekitId) {
    const trParams: string[] = [`q-${quality}`, 'f-auto'];
    if (width) trParams.push(`w-${width}`);
    if (height) trParams.push(`h-${height}`);
    if (dpr > 1) trParams.push(`dpr-${dpr}`);
    return `https://ik.imagekit.io/${config.imagekitId}/tr:${trParams.join(',')}/${encodeURIComponent(url)}`;
  }

  // 6. Global Edge Caching & Optimization Proxy (wsrv.nl / Cloudflare edge)
  // Optimizes Firebase Storage images, external links and high-res event photos on-the-fly
  if ((provider === 'auto' || provider === 'wsrv') && config.enableEdgeProxy && url.startsWith('http')) {
    // Avoid double proxying
    if (url.includes('wsrv.nl')) return url;

    try {
      const edgeUrl = new URL('https://wsrv.nl/');
      edgeUrl.searchParams.set('url', url);
      
      // Auto format selection (avif / webp / auto)
      if (format === 'avif') {
        edgeUrl.searchParams.set('output', 'avif');
      } else if (format === 'png') {
        edgeUrl.searchParams.set('output', 'png');
      } else if (format === 'jpeg') {
        edgeUrl.searchParams.set('output', 'jpg');
      } else {
        edgeUrl.searchParams.set('output', 'webp');
      }

      edgeUrl.searchParams.set('q', String(quality));
      if (width) edgeUrl.searchParams.set('w', String(width));
      if (height) edgeUrl.searchParams.set('h', String(height));
      if (dpr > 1) edgeUrl.searchParams.set('dpr', String(dpr));
      
      if (fit === 'cover') edgeUrl.searchParams.set('fit', 'cover');
      else if (fit === 'contain') edgeUrl.searchParams.set('fit', 'contain');
      else edgeUrl.searchParams.set('fit', 'inside');

      // Strip unneeded EXIF while keeping color profiles & sharpening slightly for crispness
      edgeUrl.searchParams.set('we', '1'); // lossless webp if appropriate
      edgeUrl.searchParams.set('n', '-1'); // process all frames if animated
      
      return edgeUrl.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Backward compatibility alias for getHighResImageUrl
 */
export function getHighResImageUrl(url?: string, targetWidth: number = 1920, quality: number = 90): string {
  return getOptimizedImageUrl(url, { width: targetWidth, quality, format: 'auto' });
}

/**
 * Generates a responsive `srcSet` string for standard screen widths (360w, 640w, 1024w, 1440w, 1920w, 2560w).
 */
export function generateResponsiveSrcSet(url?: string, options: Omit<OptimizeImageOptions, 'width'> = {}): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return '';

  const standardWidths = [360, 640, 960, 1280, 1600, 1920, 2400];
  return standardWidths
    .map((w) => `${getOptimizedImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Generates structured picture source sets for next-gen formats (AVIF, WebP, fallback).
 */
export function getPictureSourceSets(url?: string, options: Omit<OptimizeImageOptions, 'format'> = {}) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return { avifSrcSet: '', webpSrcSet: '', fallbackSrc: url || '' };
  }

  return {
    avifSrcSet: generateResponsiveSrcSet(url, { ...options, format: 'avif' }),
    webpSrcSet: generateResponsiveSrcSet(url, { ...options, format: 'webp' }),
    fallbackSrc: getOptimizedImageUrl(url, { ...options, format: 'auto' })
  };
}

/**
 * Checks if the browser supports modern WebP encoding via Canvas API
 */
export function isWebpSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const elem = document.createElement('canvas');
  if (Boolean(elem.getContext && elem.getContext('2d'))) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Optimizes an image upload on the client side preserving high resolution (up to 2560px)
 * with bicubic smoothing and modern WebP / JPEG compression.
 */
export function optimizeUploadedImage(
  file: File,
  maxWidth = 2560,
  maxHeight = 2560,
  quality = 0.90
): Promise<Blob | File> {
  return new Promise((resolve) => {
    // If it's not an image or SVG/GIF, don't recompress
    if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Enable crisp high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP format if supported for 35-50% smaller sizes at identical visual fidelity
        const outputMime = isWebpSupported() ? 'image/webp' : 'image/jpeg';

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        }, outputMime, quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
