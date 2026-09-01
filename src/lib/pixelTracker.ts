/**
 * WM2 Produções & Eventos - Sistema de Tráfego Pago & Pixels de Rastreamento
 * Suporte a Meta Pixel (Facebook/Instagram Ads), Google Ads, GA4 e TikTok Pixel
 */

export interface TrackingPixelConfig {
  enabled: boolean;
  metaPixelId: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
  ga4MeasurementId: string;
  tiktokPixelId: string;
  customHeaderScripts: string;
  updatedAt?: string;
}

export interface UTMLinkItem {
  id: string;
  name: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
  fullUrl: string;
  createdAt: string;
  clicksCount: number;
}

const STORAGE_KEY = 'wm2_tracking_pixels_config';
const UTM_HISTORY_KEY = 'wm2_utm_links_history';

export const defaultPixelConfig: TrackingPixelConfig = {
  enabled: true,
  metaPixelId: '',
  googleAdsId: '',
  googleAdsConversionLabel: '',
  ga4MeasurementId: '',
  tiktokPixelId: '',
  customHeaderScripts: ''
};

export function getTrackingPixelsConfig(): TrackingPixelConfig {
  if (typeof window === 'undefined') return defaultPixelConfig;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultPixelConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Erro ao ler configuração de pixels:', e);
  }
  return defaultPixelConfig;
}

export function saveTrackingPixelsConfig(config: TrackingPixelConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const dataToSave = { ...config, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('wm2_pixels_updated', { detail: dataToSave }));
    injectTrackingScripts(dataToSave);
  } catch (e) {
    console.error('Erro ao salvar configuração de pixels:', e);
  }
}

export function getUTMLinksHistory(): UTMLinkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(UTM_HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler histórico de UTMs:', e);
  }
  return [];
}

export function saveUTMLink(link: UTMLinkItem): UTMLinkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getUTMLinksHistory();
    const updated = [link, ...current.filter(item => item.id !== link.id)].slice(0, 50);
    localStorage.setItem(UTM_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Erro ao salvar link UTM:', e);
    return [];
  }
}

export function deleteUTMLink(id: string): UTMLinkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getUTMLinksHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(UTM_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Erro ao excluir link UTM:', e);
    return [];
  }
}

/**
 * Injeta dinamicamente os SDKs de rastreamento no <head> da aplicação
 */
export function injectTrackingScripts(config?: TrackingPixelConfig): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  const currentConfig = config || getTrackingPixelsConfig();
  if (!currentConfig.enabled) return;

  // 1. Meta Pixel (Facebook & Instagram Ads)
  if (currentConfig.metaPixelId && currentConfig.metaPixelId.trim()) {
    const pixelId = currentConfig.metaPixelId.trim();
    if (!document.getElementById('meta-pixel-script')) {
      try {
        /* eslint-disable */
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          t.id = 'meta-pixel-script';
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */

        if ((window as any).fbq) {
          (window as any).fbq('init', pixelId);
          (window as any).fbq('track', 'PageView');
        }
      } catch (e) {
        console.warn('Erro ao inicializar Meta Pixel:', e);
      }
    }
  }

  // 2. Google Ads & Google Analytics 4 (gtag.js)
  const gaId = currentConfig.ga4MeasurementId?.trim();
  const gadsId = currentConfig.googleAdsId?.trim();
  const primaryGtagId = gadsId || gaId;

  if (primaryGtagId && !document.getElementById('google-gtag-script')) {
    try {
      const script = document.createElement('script');
      script.id = 'google-gtag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());

      if (gaId) {
        gtag('config', gaId);
      }
      if (gadsId) {
        gtag('config', gadsId);
      }
    } catch (e) {
      console.warn('Erro ao inicializar Google Tag:', e);
    }
  }

  // 3. TikTok Pixel
  if (currentConfig.tiktokPixelId && currentConfig.tiktokPixelId.trim()) {
    const ttId = currentConfig.tiktokPixelId.trim();
    if (!document.getElementById('tiktok-pixel-script')) {
      try {
        /* eslint-disable */
        (function(w: any, d: any, t: any) {
          w.TiktokAnalyticsObject = t;
          var ttq = (w[t] = w[t] || []);
          ttq.methods = [
            'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'
          ];
          ttq.setAndDefer = function(t: any, e: any) {
            t[e] = function() {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          };
          for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
          ttq.instance = function(t: any) {
            for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
            return e;
          };
          ttq.load = function(e: any, n: any) {
            var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            ttq._i = ttq._i || {};
            ttq._i[e] = [];
            ttq._i[e]._u = i;
            ttq._t = ttq._t || {};
            ttq._t[e] = +new Date();
            ttq._o = ttq._o || {};
            ttq._o[e] = n || {};
            var o = d.createElement('script');
            o.type = 'text/javascript';
            o.async = !0;
            o.src = i + '?sdkid=' + e + '&lib=' + t;
            o.id = 'tiktok-pixel-script';
            var a = d.getElementsByTagName('script')[0];
            a.parentNode.insertBefore(o, a);
          };
          ttq.load(ttId);
          ttq.page();
        })(window, document, 'ttq');
        /* eslint-enable */
      } catch (e) {
        console.warn('Erro ao inicializar TikTok Pixel:', e);
      }
    }
  }
}

/**
 * Dispara eventos de conversão e rastreamento para todas as redes ativas
 */
export function trackConversionEvent(
  eventName: 'Lead' | 'Contact' | 'ViewContent' | 'InitiateCheckout' | 'CompleteRegistration' | 'WhatsAppClick',
  params?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const config = getTrackingPixelsConfig();
  if (!config.enabled) return;

  // 1. Meta Pixel
  if ((window as any).fbq) {
    try {
      if (eventName === 'WhatsAppClick') {
        (window as any).fbq('trackCustom', 'WhatsAppClick', params);
      } else {
        (window as any).fbq('track', eventName, params);
      }
    } catch (e) {
      console.warn('Erro ao disparar evento no Meta Pixel:', e);
    }
  }

  // 2. Google Ads & GA4
  if ((window as any).gtag) {
    try {
      (window as any).gtag('event', eventName, {
        event_category: 'WM2_Engagement',
        ...params
      });

      // Conversão específica do Google Ads se configurada
      if (config.googleAdsId && config.googleAdsConversionLabel && (eventName === 'Lead' || eventName === 'Contact')) {
        (window as any).gtag('event', 'conversion', {
          send_to: `${config.googleAdsId}/${config.googleAdsConversionLabel}`,
          ...params
        });
      }
    } catch (e) {
      console.warn('Erro ao disparar evento no Google Ads/GA4:', e);
    }
  }

  // 3. TikTok Pixel
  if ((window as any).ttq) {
    try {
      (window as any).ttq.track(eventName, params);
    } catch (e) {
      console.warn('Erro ao disparar evento no TikTok Pixel:', e);
    }
  }
}

/**
 * Extrai parâmetros UTM da URL atual para registrar no radar de visitantes
 */
export function extractUTMParameters(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  hasUTM: boolean;
} {
  if (typeof window === 'undefined') return { hasUTM: false };

  try {
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || undefined;
    const utm_medium = params.get('utm_medium') || undefined;
    const utm_campaign = params.get('utm_campaign') || undefined;
    const utm_content = params.get('utm_content') || undefined;
    const utm_term = params.get('utm_term') || undefined;

    const hasUTM = Boolean(utm_source || utm_campaign || utm_medium);

    if (hasUTM) {
      // Salva último canal de origem para enriquecer leads e rastreamento
      sessionStorage.setItem('wm2_last_utm_source', utm_source || 'direct');
      sessionStorage.setItem('wm2_last_utm_campaign', utm_campaign || 'none');
    }

    return {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      hasUTM
    };
  } catch (e) {
    return { hasUTM: false };
  }
}
