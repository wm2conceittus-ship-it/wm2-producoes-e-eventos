export function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          cleaned[key] = cleanUndefined(val);
        }
      }
    }
    return cleaned;
  }
  return obj;
}

export function isWebpSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const elem = document.createElement('canvas');
  if (Boolean(elem.getContext && elem.getContext('2d'))) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

export function compressBase64Image(
  dataUrl: string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length < 8000) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    img.onload = () => {
      try {
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
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill background for transparency safety
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let compressed = '';
        try {
          if (isWebpSupported()) {
            compressed = canvas.toDataURL('image/webp', quality);
          }
          if (!compressed || !compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressed && compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
}

export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
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
            resolve(src);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let output = '';
          try {
            if (isWebpSupported()) {
              output = canvas.toDataURL('image/webp', quality);
            }
            if (!output || !output.startsWith('data:image/webp')) {
              output = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            output = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(output || src);
        } catch {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
  });
}

export async function optimizeStateForStorage(state: any): Promise<any> {
  if (!state) return state;
  let jsonStr = JSON.stringify(state);
  // If comfortably under 380KB, keep as is
  if (jsonStr.length < 380000) return state;

  const newState = JSON.parse(jsonStr);

  // Pass 1: Standard high-definition optimization (~1000px, 0.75 quality)
  if (Array.isArray(newState.fotos)) {
    for (let i = 0; i < newState.fotos.length; i++) {
      if (newState.fotos[i]?.url?.startsWith('data:image/')) {
        newState.fotos[i].url = await compressBase64Image(newState.fotos[i].url, 1000, 1000, 0.75);
      }
    }
  }

  if (Array.isArray(newState.mural)) {
    for (let i = 0; i < newState.mural.length; i++) {
      if (newState.mural[i]?.imageUrl?.startsWith('data:image/')) {
        newState.mural[i].imageUrl = await compressBase64Image(newState.mural[i].imageUrl, 1000, 1000, 0.75);
      }
    }
  }

  if (Array.isArray(newState.albums)) {
    for (let i = 0; i < newState.albums.length; i++) {
      if (newState.albums[i]?.coverUrl?.startsWith('data:image/')) {
        newState.albums[i].coverUrl = await compressBase64Image(newState.albums[i].coverUrl, 900, 900, 0.75);
      }
    }
  }

  if (Array.isArray(newState.formandos)) {
    for (let i = 0; i < newState.formandos.length; i++) {
      if (newState.formandos[i]?.photo?.startsWith('data:image/')) {
        newState.formandos[i].photo = await compressBase64Image(newState.formandos[i].photo, 400, 400, 0.70);
      }
    }
  }

  if (Array.isArray(newState.portfolioAlbums)) {
    for (let i = 0; i < newState.portfolioAlbums.length; i++) {
      const alb = newState.portfolioAlbums[i];
      if (alb?.cover?.startsWith('data:image/')) {
        alb.cover = await compressBase64Image(alb.cover, 1000, 1000, 0.75);
      }
      if (Array.isArray(alb?.photos)) {
        for (let j = 0; j < alb.photos.length; j++) {
          if (alb.photos[j]?.url?.startsWith('data:image/')) {
            alb.photos[j].url = await compressBase64Image(alb.photos[j].url, 1000, 1000, 0.75);
          }
        }
      }
    }
  }

  if (newState.productGalleries && typeof newState.productGalleries === 'object') {
    for (const key of Object.keys(newState.productGalleries)) {
      const list = newState.productGalleries[key];
      if (Array.isArray(list)) {
        for (let i = 0; i < list.length; i++) {
          if (list[i]?.url?.startsWith('data:image/')) {
            list[i].url = await compressBase64Image(list[i].url, 1000, 1000, 0.75);
          }
        }
      }
    }
  }

  // Pass 2: If still > 700KB (nearing Firestore's 1MB limit), apply tighter compression
  jsonStr = JSON.stringify(newState);
  if (jsonStr.length > 700000) {
    if (Array.isArray(newState.fotos)) {
      for (let i = 0; i < newState.fotos.length; i++) {
        if (newState.fotos[i]?.url?.startsWith('data:image/')) {
          newState.fotos[i].url = await compressBase64Image(newState.fotos[i].url, 800, 800, 0.65);
        }
      }
    }
    if (Array.isArray(newState.portfolioAlbums)) {
      for (let i = 0; i < newState.portfolioAlbums.length; i++) {
        const alb = newState.portfolioAlbums[i];
        if (Array.isArray(alb?.photos)) {
          for (let j = 0; j < alb.photos.length; j++) {
            if (alb.photos[j]?.url?.startsWith('data:image/')) {
              alb.photos[j].url = await compressBase64Image(alb.photos[j].url, 800, 800, 0.65);
            }
          }
        }
      }
    }
    if (newState.productGalleries && typeof newState.productGalleries === 'object') {
      for (const key of Object.keys(newState.productGalleries)) {
        const list = newState.productGalleries[key];
        if (Array.isArray(list)) {
          for (let i = 0; i < list.length; i++) {
            if (list[i]?.url?.startsWith('data:image/')) {
              list[i].url = await compressBase64Image(list[i].url, 800, 800, 0.65);
            }
          }
        }
      }
    }
  }

  // Pass 3: Emergency safeguard if > 880KB
  jsonStr = JSON.stringify(newState);
  if (jsonStr.length > 880000) {
    if (Array.isArray(newState.fotos)) {
      for (let i = 0; i < newState.fotos.length; i++) {
        if (newState.fotos[i]?.url?.startsWith('data:image/')) {
          newState.fotos[i].url = await compressBase64Image(newState.fotos[i].url, 650, 650, 0.55);
        }
      }
    }
    if (Array.isArray(newState.portfolioAlbums)) {
      for (let i = 0; i < newState.portfolioAlbums.length; i++) {
        const alb = newState.portfolioAlbums[i];
        if (Array.isArray(alb?.photos)) {
          for (let j = 0; j < alb.photos.length; j++) {
            if (alb.photos[j]?.url?.startsWith('data:image/')) {
              alb.photos[j].url = await compressBase64Image(alb.photos[j].url, 650, 650, 0.55);
            }
          }
        }
      }
    }
  }

  return newState;
}
