import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Megaphone,
  DollarSign,
  FileCheck,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Compass,
  ArrowRight,
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right';
  actionHint?: string;
}

export const STUDENT_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-profile-card',
    title: '👋 Bem-vindo(a) ao seu Portal!',
    description:
      'Aqui você tem uma visão completa da sua formatura: seus dados cadastrais, código de formando, dados da faculdade e status das suas mensalidades.',
    icon: Sparkles,
    preferredPosition: 'bottom',
    actionHint: 'Visão Geral & Perfil',
  },
  {
    targetId: 'tour-tab-mural',
    title: '📢 Mural de Avisos & Comunicados',
    description:
      'Acompanhe todos os comunicados oficiais da comissão e da WM2 Eventos: convocações, lembretes de prazos e novidades da sua turma.',
    icon: Megaphone,
    preferredPosition: 'bottom',
    actionHint: 'Fique por dentro das novidades',
  },
  {
    targetId: 'tour-tab-financeiro',
    title: '💳 Financeiro & Boletos Pix',
    description:
      'Consulte todas as suas parcelas da formatura, baixe a 2ª via do boleto em PDF ou pague instantaneamente via Pix Copia e Cola com confirmação automática.',
    icon: DollarSign,
    preferredPosition: 'bottom',
    actionHint: 'Mensalidades e Chave Pix',
  },
  {
    targetId: 'tour-tab-contratos',
    title: '📄 Contrato & Termos de Adesão',
    description:
      'Verifique seu termo de adesão da formatura, realize a assinatura digital com certificado e faça download do seu contrato autenticado.',
    icon: FileCheck,
    preferredPosition: 'bottom',
    actionHint: 'Segurança Jurídica',
  },
  {
    targetId: 'tour-tab-cronograma',
    title: '📅 Cronograma & Eventos',
    description:
      'Consulte as datas de sessões fotográficas, pré-eventos, colação de grau e a contagem regressiva para a grande noite do Baile de Gala.',
    icon: Calendar,
    preferredPosition: 'bottom',
    actionHint: 'Datas e Horários',
  },
  {
    targetId: 'tour-tab-chat',
    title: '💬 Chat da Turma & Enquetes',
    description:
      'Converse com seus colegas de turma em tempo real e participe das votações para escolher atrações, cardápios e cores oficiais do baile.',
    icon: MessageSquare,
    preferredPosition: 'bottom',
    actionHint: 'Interação e Votações',
  },
  {
    targetId: 'tour-tab-galeria',
    title: '📸 Galeria de Fotos Oficiais',
    description:
      'Visualize e faça download das coberturas fotográficas em alta resolução de todos os ensaios, festas e momentos inesquecíveis da sua turma.',
    icon: ImageIcon,
    preferredPosition: 'bottom',
    actionHint: 'Fotos em Alta Resolução',
  },
];

interface StudentWelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onStepChange?: (stepIndex: number, step: TourStep) => void;
}

export const StudentWelcomeTour: React.FC<StudentWelcomeTourProps> = ({
  isOpen,
  onClose,
  studentName,
  onStepChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = STUDENT_TOUR_STEPS[currentStepIndex];

  // Update target element position
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      // Scroll element smoothly into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // Fallback if target element isn't in DOM
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure DOM is ready and scroll smoothly
    const timer = setTimeout(() => {
      updateTargetPosition();
    }, 150);

    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < STUDENT_TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onStepChange?.(nextIndex, STUDENT_TOUR_STEPS[nextIndex]);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onStepChange?.(prevIndex, STUDENT_TOUR_STEPS[prevIndex]);
    }
  };

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STUDENT_TOUR_STEPS.length - 1;
  const progressPercentage = ((currentStepIndex + 1) / STUDENT_TOUR_STEPS.length) * 100;

  // Calculate tooltip placement
  const calculateTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      // Centered fallback if target is not found
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      };
    }

    const padding = 16;
    const tooltipWidth = Math.min(420, window.innerWidth - 32);
    
    // Check if there is enough space below the target
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let top = targetRect.bottom + padding;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    // If not enough space below, place above
    if (spaceBelow < 280 && spaceAbove > spaceBelow) {
      top = Math.max(16, targetRect.top - 280);
    }

    // Keep horizontally within screen bounds
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    return {
      position: 'fixed',
      top: `${Math.max(16, Math.min(window.innerHeight - 340, top))}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 9999,
    };
  };

  return (
    <div className="fixed inset-0 z-[9990] select-none pointer-events-auto">
      {/* Dark Dimmer Backdrop with Cutout Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px]"
      />

      {/* Target Element Spotlight Highlight Ring */}
      {targetRect && (
        <motion.div
          layoutId="tour-highlight-box"
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed rounded-2xl pointer-events-none z-[9995] ring-4 ring-[#aa904f] ring-offset-2 ring-offset-white shadow-[0_0_50px_rgba(170,144,79,0.5)] transition-all duration-300"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Subtle animated corner pulsers */}
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#aa904f] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#aa904f]"></span>
          </span>
        </motion.div>
      )}

      {/* Floating Interactive Tooltip Card */}
      <motion.div
        key={currentStep.targetId}
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        style={calculateTooltipStyle()}
        className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200/90 text-neutral-900 overflow-hidden relative"
      >
        {/* Top Progress Track */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-100">
          <motion.div
            className="h-full bg-gradient-to-r from-[#aa904f] to-[#dfd1a1]"
            initial={{ width: `${progressPercentage}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header: Step Counter & Close Button */}
        <div className="flex items-center justify-between gap-3 pt-1 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[#8a7238] text-[11px] font-extrabold tracking-wide uppercase">
              <Compass className="w-3 h-3 text-[#aa904f]" />
              Passo {currentStepIndex + 1} de {STUDENT_TOUR_STEPS.length}
            </span>
            {currentStep.actionHint && (
              <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline-block">
                • {currentStep.actionHint}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            title="Pular Tour de Boas-Vindas"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3 mt-1">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#aa904f] shrink-0 shadow-xs">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-neutral-900 tracking-tight leading-snug">
                {currentStep.title}
              </h4>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed font-normal">
                {currentStep.description}
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicators (Dots) & Navigation Action Controls */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          {/* Step Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {STUDENT_TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentStepIndex(idx);
                  onStepChange?.(idx, STUDENT_TOUR_STEPS[idx]);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#aa904f]'
                    : idx < currentStepIndex
                    ? 'w-2 bg-amber-300'
                    : 'w-2 bg-neutral-200 hover:bg-neutral-300'
                }`}
                title={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#aa904f] to-[#8a7238] hover:from-[#bfa762] hover:to-[#9c8242] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLastStep ? 'Concluir Tour' : 'Próximo'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Small Footer Tip */}
        <div className="mt-3 text-center">
          <span className="text-[10px] text-neutral-400 font-medium">
            Pressione <kbd className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-600 text-[9px] border border-neutral-200">ESC</kbd> para fechar a qualquer momento
          </span>
        </div>
      </motion.div>
    </div>
  );
};
