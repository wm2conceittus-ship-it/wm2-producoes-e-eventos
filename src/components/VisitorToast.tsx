import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  X, 
  Activity, 
  ExternalLink,
  Sparkles,
  Radio,
  Eye
} from 'lucide-react';

export interface VisitorToastItemData {
  id: string;
  city: string;
  state?: string;
  page?: string;
  device?: 'mobile' | 'desktop' | 'tablet' | string;
  timestamp: Date;
  durationMs?: number;
}

interface VisitorToastContainerProps {
  toasts: VisitorToastItemData[];
  onDismiss: (id: string) => void;
  onOpenAnalytics?: () => void;
}

export const VisitorToastItem: React.FC<{
  toast: VisitorToastItemData;
  onDismiss: (id: string) => void;
  onOpenAnalytics?: () => void;
}> = ({ toast, onDismiss, onOpenAnalytics }) => {
  const duration = toast.durationMs || 5000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const getDeviceIcon = () => {
    const d = (toast.device || 'mobile').toLowerCase();
    if (d.includes('desktop') || d.includes('computador')) {
      return <Monitor className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (d.includes('tablet') || d.includes('ipad')) {
      return <Tablet className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const getDeviceLabel = () => {
    const d = (toast.device || 'mobile').toLowerCase();
    if (d.includes('desktop') || d.includes('computador')) return 'Desktop';
    if (d.includes('tablet') || d.includes('ipad')) return 'Tablet';
    return 'Celular';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="group relative w-full max-w-[360px] bg-neutral-950/95 backdrop-blur-md border border-[#aa904f]/60 text-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto transition-all hover:border-[#dfd1a1]"
      role="alert"
      aria-live="polite"
    >
      {/* Top Beacon Header */}
      <div className="bg-gradient-to-r from-[#aa904f]/20 via-[#dfd1a1]/10 to-transparent px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black tracking-wider uppercase text-[#dfd1a1] flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#dfd1a1] animate-pulse" /> Novo Visitante Ao Vivo
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Fechar notificação"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Toast Content */}
      <div className="p-4 space-y-2.5">
        {/* City of Origin - Main Highlight */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#aa904f]/20 border border-[#aa904f]/40 flex items-center justify-center shrink-0 shadow-inner">
            <MapPin className="w-5 h-5 text-[#dfd1a1]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Cidade de Origem
            </div>
            <div className="text-base font-extrabold text-white truncate flex items-center gap-1.5">
              <span>{toast.city}</span>
              {toast.state && (
                <span className="bg-[#aa904f]/30 text-[#dfd1a1] border border-[#aa904f]/50 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {toast.state}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Access Details */}
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 truncate text-neutral-300">
            <Eye className="w-3.5 h-3.5 text-[#dfd1a1] shrink-0" />
            <span className="truncate font-medium">{toast.page || 'Página Inicial'}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-2 py-1 rounded-lg text-[10px] text-neutral-300 font-semibold border border-white/10">
            {getDeviceIcon()}
            <span>{getDeviceLabel()}</span>
          </div>
        </div>

        {/* Quick Action Footer */}
        {onOpenAnalytics && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-neutral-500 font-medium">
              Detectado agora mesmo
            </span>
            <button
              type="button"
              onClick={() => {
                onOpenAnalytics();
                onDismiss(toast.id);
              }}
              className="text-[11px] font-bold text-[#dfd1a1] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver no Radar</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Progress countdown bar */}
      <div className="w-full bg-white/10 h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#dfd1a1] to-[#aa904f] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export const VisitorToastContainer: React.FC<VisitorToastContainerProps> = ({
  toasts,
  onDismiss,
  onOpenAnalytics
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <VisitorToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            onOpenAnalytics={onOpenAnalytics}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
