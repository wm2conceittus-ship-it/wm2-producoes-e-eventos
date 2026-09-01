import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  Share2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Target,
  BarChart3,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  HelpCircle,
  QrCode,
  Trash2,
  Plus,
  Play,
  Instagram,
  Facebook,
  Globe,
  MessageSquare,
  Zap,
  Info,
  ShieldCheck,
  AlertCircle,
  Save,
  Check,
  Send,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Search,
  BookOpen,
  Smartphone,
  Sliders,
  Award,
  Calendar,
  MousePointerClick,
  Download,
  Terminal,
  Heart,
  MessageCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Upload,
  Image as ImageIcon,
  FileText,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrackingPixelConfig,
  UTMLinkItem,
  getTrackingPixelsConfig,
  saveTrackingPixelsConfig,
  getUTMLinksHistory,
  saveUTMLink,
  deleteUTMLink,
  trackConversionEvent,
  defaultPixelConfig
} from '../lib/pixelTracker';

interface PaidTrafficManagerProps {
  onOpenVisitorsTab?: () => void;
}

// Exemplos de imagens para o simulador visual de anúncios
const AD_THEMES = [
  {
    id: 'gala',
    name: 'Baile de Gala & Glamour',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    tag: 'Luxo & Celebração'
  },
  {
    id: 'show',
    name: 'Palco, Luzes & Show',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
    tag: 'Estrutura & Tecnologia'
  },
  {
    id: 'sunset',
    name: 'Aula da Saudade & Sunset',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    tag: 'Emoção & Turma'
  },
  {
    id: 'decor',
    name: 'Cenografia & Decoração',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
    tag: 'Design Impecável'
  }
];

// Base de Copys automáticas para formaturas
const COPY_TEMPLATES = {
  medicina: [
    {
      title: '🎓 Comissão de Medicina: O Baile dos Seus Sonhos com a WM2',
      body: '6 anos de esforço, dedicação e noites em claro merecem uma celebração histórica e inesquecível. ✨\n\nA WM2 Produções & Eventos cuida de cada detalhe: cenografia imersiva, atrações nacionais, segurança impecável e portal financeiro exclusivo para cada formando.\n\n📲 Solicite uma apresentação exclusiva para sua comissão agora mesmo!',
      cta: 'Solicitar Apresentação VIP',
      hashtags: '#FormaturaMedicina #Medicina2026 #BaileDeGala #WM2Eventos'
    },
    {
      title: '🏆 Estrutura de Megaevento para sua Formatura de Medicina',
      body: 'Por que comissões de Medicina escolhem a WM2?\n\n✔️ Transparência financeira em tempo real\n✔️ Contratos digitais com assinatura jurídica\n✔️ Cenografia e iluminação de padrão nacional\n✔️ Atendimento dedicado à comissão\n\nGaranta a melhor data para a sua turma!',
      cta: 'Falar com Especialista',
      hashtags: '#Medicina #FormandosMed #WM2Producoes'
    }
  ],
  direito: [
    {
      title: '⚖️ Formatura de Direito: Celebre essa Vitória com Maestria',
      body: 'O juramento, o baile de gala e a emoção de fechar esse ciclo com chave de ouro! 🎓🏛️\n\nA WM2 é especialista em realizar formaturas de Direito com o requinte, sofisticação e a infraestrutura que a sua turma merece.\n\nClique e descubra nossas propostas personalizadas.',
      cta: 'Conhecer Projetos',
      hashtags: '#FormaturaDireito #Direito2026 #BaileDeGala #WM2'
    }
  ],
  geral: [
    {
      title: '✨ Sua Formatura do Jeito que a Comissão Sempre Sonhou!',
      body: 'Esqueça o estresse de organizar eventos grandes sozinho. Com a WM2 Produções & Eventos, a sua comissão tem:\n\n✨ Portal do Formando 100% online (Pix, Boleto e Cartão)\n✨ Vistoria e gestão de todos os fornecedores\n✨ Decoração cinematográfica e shows marcantes\n\nToque em "Saiba Mais" e monte o orçamento da sua turma!',
      cta: 'Montar Orçamento',
      hashtags: '#Formaturas #ComissaoDeFormatura #WM2Eventos #BaileDosSonhos'
    },
    {
      title: '🔥 Economia, Transparência e Qualidade para Sua Turma',
      body: 'Procurando a produtora ideal para a formatura da sua faculdade? A WM2 entrega a melhor relação de custo-benefício, com flexibilidade nos pagamentos e acompanhamento presencial completo.\n\nFale direto com a nossa diretoria pelo WhatsApp!',
      cta: 'Chamar no WhatsApp',
      hashtags: '#Formatura2026 #Formatura2027 #EventosCeara #WM2'
    }
  ]
};

export function PaidTrafficManager({ onOpenVisitorsTab }: PaidTrafficManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ad_preview' | 'copy_generator' | 'utm_builder' | 'roi_simulator' | 'pixels' | 'guide'>('ad_preview');

  // Pixel Config State
  const [pixelConfig, setPixelConfig] = useState<TrackingPixelConfig>(getTrackingPixelsConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testEventsLog, setTestEventsLog] = useState<Array<{ name: string; time: string; payload: any }>>([]);
  const [testEventSent, setTestEventSent] = useState<string | null>(null);

  // UTM Builder State
  const [utmLinks, setUtmLinks] = useState<UTMLinkItem[]>(getUTMLinksHistory);
  const [utmBaseUrl, setUtmBaseUrl] = useState(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'https://wm2eventos.com.br';
  });
  const [utmSource, setUtmSource] = useState('instagram_ads');
  const [utmMedium, setUtmMedium] = useState('stories');
  const [utmCampaign, setUtmCampaign] = useState('medicina_baile_2026');
  const [utmContent, setUtmContent] = useState('video_depoimento_comissao');
  const [utmTerm, setUtmTerm] = useState('produtora_formaturas');
  const [utmCampaignName, setUtmCampaignName] = useState('Campanha Stories Medicina 2026');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [selectedQrCodeItem, setSelectedQrCodeItem] = useState<UTMLinkItem | null>(null);

  // Interactive Ad Preview Mockup State
  const [adPlatform, setAdPlatform] = useState<'instagram_stories' | 'instagram_feed' | 'google_search'>('instagram_stories');
  const [selectedTheme, setSelectedTheme] = useState<{ id: string; name: string; imageUrl: string; tag: string }>(AD_THEMES[0]);
  const [customUploadedImages, setCustomUploadedImages] = useState<Array<{ id: string; name: string; imageUrl: string; tag: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wm2_custom_ad_photos');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [showSampleThemes, setShowSampleThemes] = useState(true);
  const [hiddenThemeIds, setHiddenThemeIds] = useState<string[]>([]);
  const [adHeadline, setAdHeadline] = useState('Comissão de Formatura: O Baile dos Seus Sonhos com a WM2');
  const [adPrimaryText, setAdPrimaryText] = useState('6 anos de dedicação merecem um baile épico. Cenografia de gala, atrações inesquecíveis e gestão completa para a sua comissão.');
  const [adCtaText, setAdCtaText] = useState('Solicitar Orçamento Grátis');
  const [adTargetCourse, setAdTargetCourse] = useState('Medicina & Saúde');
  const [copiedCopySuccess, setCopiedCopySuccess] = useState(false);

  // Carrossel Slides State
  const [carouselSlides, setCarouselSlides] = useState<Array<{ id: string; name: string; imageUrl: string; tag: string }>>(() => {
    return [AD_THEMES[0], AD_THEMES[1], AD_THEMES[2]];
  });
  const [activeCarouselSlideIdx, setActiveCarouselSlideIdx] = useState<number>(0);

  // Interface for Pending Uploads with Preview & Metadata
  interface PendingUploadItem {
    id: string;
    file: File;
    previewUrl: string;
    name: string;
    sizeFormatted: string;
    dimensions?: { width: number; height: number };
    status: 'pending' | 'processing' | 'done' | 'error';
  }

  // Advanced Photo Upload and Preview States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUploadItem[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [selectedPreviewIdx, setSelectedPreviewIdx] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [activeUploadStepText, setActiveUploadStepText] = useState<string>('');
  const [carouselActionChoice, setCarouselActionChoice] = useState<'create_new_carousel' | 'replace_active_slide' | 'add_to_gallery'>('create_new_carousel');
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');

  // Helper: Read and compress image to avoid huge base64 strings, ensuring fast performance and persistence
  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (!src) {
          reject(new Error('Arquivo vazio'));
          return;
        }
        // If SVG or very small, resolve directly
        if (file.type === 'image/svg+xml' || file.size < 120 * 1024) {
          resolve(src);
          return;
        }
        const img = new Image();
        img.onerror = () => resolve(src); // fallback to raw dataUrl
        img.onload = () => {
          try {
            const maxDimension = 1000;
            let width = img.width;
            let height = img.height;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(src);
              return;
            }
            // Draw with smooth interpolation
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            let compressedData = '';
            try {
              compressedData = canvas.toDataURL('image/webp', 0.78);
            } catch {}
            if (!compressedData || !compressedData.startsWith('data:image/webp')) {
              compressedData = canvas.toDataURL('image/jpeg', 0.78);
            }
            resolve(compressedData);
          } catch {
            resolve(src);
          }
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  // Staging: Prepare files for pre-upload preview modal
  const handleProcessFiles = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files);
    const validImageFiles = rawFiles.filter(f => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|jfif|heic|svg)$/i.test(f.name));

    if (validImageFiles.length === 0) {
      setUploadFeedback({
        message: 'Por favor, selecione arquivos de imagem válidos (JPG, PNG, WEBP, etc).',
        type: 'error'
      });
      setTimeout(() => setUploadFeedback(null), 5000);
      return;
    }

    const stagedItems: PendingUploadItem[] = [];

    for (let i = 0; i < validImageFiles.length; i++) {
      const file = validImageFiles[i];
      const previewUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").slice(0, 24);
      const sizeMB = file.size / (1024 * 1024);
      const sizeFormatted = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

      stagedItems.push({
        id: `pending-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl,
        name: cleanName || `Foto ${customUploadedImages.length + i + 1}`,
        sizeFormatted,
        status: 'pending'
      });
    }

    setPendingUploads(stagedItems);
    setSelectedPreviewIdx(0);
    setUploadProgress(0);
    setActiveUploadStepText('');
    setShowPreviewModal(true);

    // Default action: if user has multiple photos and is in carrossel mode, offer create new carousel
    if (validImageFiles.length > 1 && adPlatform === 'instagram_feed') {
      setCarouselActionChoice('create_new_carousel');
    } else if (adPlatform === 'instagram_feed') {
      setCarouselActionChoice('replace_active_slide');
    } else {
      setCarouselActionChoice('add_to_gallery');
    }
  };

  // Confirm and execute upload with real-time progress bar and compression
  const handleConfirmUpload = async () => {
    if (pendingUploads.length === 0) return;

    setIsProcessingPhotos(true);
    setUploadProgress(5);
    setActiveUploadStepText('Iniciando processamento e otimização HD...');

    try {
      const finalLoadedPhotos: Array<{ id: string; name: string; imageUrl: string; tag: string }> = [];
      const total = pendingUploads.length;

      for (let i = 0; i < total; i++) {
        const item = pendingUploads[i];
        
        // Update item status to processing
        setPendingUploads(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'processing' } : p));
        const currentProgress = Math.round(10 + ((i / total) * 80));
        setUploadProgress(currentProgress);
        setActiveUploadStepText(`Otimizando foto ${i + 1} de ${total}: "${item.name}"...`);

        try {
          const compressedData = await compressAndReadImage(item.file);
          finalLoadedPhotos.push({
            id: `custom-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: item.name || `Foto PC ${customUploadedImages.length + i + 1}`,
            imageUrl: compressedData,
            tag: 'Foto do Computador'
          });

          // Mark as done
          setPendingUploads(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
        } catch (err) {
          console.error('Erro ao comprimir imagem:', item.name, err);
          setPendingUploads(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
        }
      }

      setUploadProgress(95);
      setActiveUploadStepText('Atualizando galeria e carrossel...');

      if (finalLoadedPhotos.length > 0) {
        const updated = [...finalLoadedPhotos, ...customUploadedImages];
        setCustomUploadedImages(updated);
        try {
          localStorage.setItem('wm2_custom_ad_photos', JSON.stringify(updated.slice(0, 20)));
        } catch {
          // localStorage quota fallback
        }

        // Apply based on carouselActionChoice
        if (carouselActionChoice === 'create_new_carousel' || (adPlatform === 'instagram_feed' && finalLoadedPhotos.length > 1)) {
          setCarouselSlides(finalLoadedPhotos);
          setActiveCarouselSlideIdx(0);
          setSelectedTheme(finalLoadedPhotos[0]);
        } else if (carouselActionChoice === 'replace_active_slide' && adPlatform === 'instagram_feed') {
          setCarouselSlides(prev => {
            if (prev.length === 0) return [finalLoadedPhotos[0]];
            const next = [...prev];
            const safeIdx = Math.min(activeCarouselSlideIdx, prev.length - 1);
            next[safeIdx] = finalLoadedPhotos[0];
            return next;
          });
          setSelectedTheme(finalLoadedPhotos[0]);
        } else {
          setSelectedTheme(finalLoadedPhotos[0]);
        }

        setUploadProgress(100);
        setActiveUploadStepText('Concluído com sucesso!');

        // Cleanup object URLs
        pendingUploads.forEach(item => {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch {
            // ignore
          }
        });

        setTimeout(() => {
          setShowPreviewModal(false);
          setPendingUploads([]);
          setIsProcessingPhotos(false);
          setUploadProgress(0);
          setUploadFeedback({
            message: `✓ ${finalLoadedPhotos.length} foto(s) adicionada(s) e aplicadas com sucesso!`,
            type: 'success'
          });
          setTimeout(() => setUploadFeedback(null), 5000);
        }, 500);
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      setIsProcessingPhotos(false);
      setUploadFeedback({
        message: 'Ocorreu um erro ao processar as fotos.',
        type: 'error'
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Cancel preview modal and discard pending staged items
  const handleCancelPreviewModal = () => {
    pendingUploads.forEach(item => {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch {
        // ignore
      }
    });
    setPendingUploads([]);
    setShowPreviewModal(false);
    setIsProcessingPhotos(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a single photo from the pending preview stage
  const handleRemovePendingItem = (indexToRemove: number) => {
    const itemToRemove = pendingUploads[indexToRemove];
    if (itemToRemove) {
      try {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      } catch {
        // ignore
      }
    }
    const next = pendingUploads.filter((_, idx) => idx !== indexToRemove);
    if (next.length === 0) {
      handleCancelPreviewModal();
      return;
    }
    setPendingUploads(next);
    if (selectedPreviewIdx >= next.length) {
      setSelectedPreviewIdx(Math.max(0, next.length - 1));
    }
  };

  const handleUploadCustomAdImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleAddPhotoByUrl = () => {
    const url = customPhotoUrlInput.trim();
    if (!url) return;
    const newPhoto = {
      id: `custom-url-${Date.now()}`,
      name: 'Foto por Link Web',
      imageUrl: url,
      tag: 'Link Externo'
    };
    const updated = [newPhoto, ...customUploadedImages];
    setCustomUploadedImages(updated);
    setSelectedTheme(newPhoto);
    if (adPlatform === 'instagram_feed') {
      setCarouselSlides(prev => {
        if (prev.length === 0) return [newPhoto];
        const next = [...prev];
        next[activeCarouselSlideIdx] = newPhoto;
        return next;
      });
    }
    try {
      localStorage.setItem('wm2_custom_ad_photos', JSON.stringify(updated.slice(0, 20)));
    } catch {
      // ignore
    }
    setCustomPhotoUrlInput('');
    setShowUrlModal(false);
    setUploadFeedback({
      message: '✓ Foto adicionada com sucesso via link!',
      type: 'success'
    });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleRemoveSingleCustomImage = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = customUploadedImages.filter(img => img.id !== id);
    setCustomUploadedImages(updated);
    try {
      localStorage.setItem('wm2_custom_ad_photos', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Remove from carousel slides if present
    setCarouselSlides(prev => {
      const filtered = prev.filter(slide => slide.id !== id);
      if (filtered.length === 0) {
        const visibleThemes = AD_THEMES.filter(t => !hiddenThemeIds.includes(t.id));
        return visibleThemes.length > 0 ? [visibleThemes[0]] : [AD_THEMES[0]];
      }
      return filtered;
    });

    if (selectedTheme.id === id) {
      if (updated.length > 0) {
        setSelectedTheme(updated[0]);
      } else {
        const visibleThemes = AD_THEMES.filter(t => !hiddenThemeIds.includes(t.id));
        if (visibleThemes.length > 0) {
          setSelectedTheme(visibleThemes[0]);
        }
      }
    }
  };

  // Select / Swap photo for the active carousel slide or story
  const handleSelectPhotoForAd = (photo: { id: string; name: string; imageUrl: string; tag: string }) => {
    setSelectedTheme(photo);
    if (adPlatform === 'instagram_feed') {
      setCarouselSlides(prev => {
        if (prev.length === 0) return [photo];
        const next = [...prev];
        const safeIdx = Math.min(activeCarouselSlideIdx, prev.length - 1);
        next[safeIdx] = photo;
        return next;
      });
    }
  };

  // Add photo as a new slide in the carousel
  const handleAddSlideToCarousel = (photo?: { id: string; name: string; imageUrl: string; tag: string }, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSlide = photo || selectedTheme;
    setCarouselSlides(prev => [...prev, newSlide]);
    setActiveCarouselSlideIdx(carouselSlides.length);
  };

  // Remove a specific slide from the carousel
  const handleRemoveCarouselSlide = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (carouselSlides.length <= 1) return; // Keep at least 1 slide
    const next = carouselSlides.filter((_, idx) => idx !== index);
    setCarouselSlides(next);
    if (activeCarouselSlideIdx >= next.length) {
      setActiveCarouselSlideIdx(Math.max(0, next.length - 1));
    }
  };

  // Use all custom uploaded photos as the carousel
  const handleUseAllCustomInCarousel = () => {
    if (customUploadedImages.length === 0) return;
    setCarouselSlides(customUploadedImages);
    setActiveCarouselSlideIdx(0);
    setSelectedTheme(customUploadedImages[0]);
  };

  const handleHideTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHidden = [...hiddenThemeIds, id];
    setHiddenThemeIds(updatedHidden);
    if (selectedTheme.id === id) {
      const remaining = AD_THEMES.filter(t => !updatedHidden.includes(t.id));
      if (customUploadedImages.length > 0) {
        setSelectedTheme(customUploadedImages[0]);
      } else if (remaining.length > 0) {
        setSelectedTheme(remaining[0]);
      }
    }
  };

  const handleRestoreSampleThemes = () => {
    setHiddenThemeIds([]);
    setShowSampleThemes(true);
  };

  // Copy Generator State
  const [selectedCourseGroup, setSelectedCourseGroup] = useState<'medicina' | 'direito' | 'geral'>('medicina');
  const [selectedTone, setSelectedTone] = useState<'luxo' | 'transparencia' | 'emocao'>('luxo');
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);

  // ROI Calculator State
  const [monthlyBudget, setMonthlyBudget] = useState<number>(1500);
  const [avgCpc, setAvgCpc] = useState<number>(1.20);
  const [leadConversionRate, setLeadConversionRate] = useState<number>(4.5); // % of clicks that become committee leads
  const [contractClosingRate, setContractClosingRate] = useState<number>(8.0); // % of leads that close a class contract
  const [avgContractValue, setAvgContractValue] = useState<number>(120000); // R$ average graduation class contract revenue

  // Save pixels
  const handleSavePixels = (e: React.FormEvent) => {
    e.preventDefault();
    saveTrackingPixelsConfig(pixelConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Test event dispatch with live console log
  const handleTriggerTestEvent = (eventName: 'Lead' | 'Contact' | 'WhatsAppClick' | 'ViewContent') => {
    const payload = {
      source: 'Admin_Interactive_Trigger',
      page: 'Painel_Administrativo_WM2',
      course_preview: adTargetCourse,
      timestamp: new Date().toISOString()
    };
    trackConversionEvent(eventName, payload);
    setTestEventSent(eventName);
    setTestEventsLog(prev => [
      { name: eventName, time: new Date().toLocaleTimeString('pt-BR'), payload },
      ...prev.slice(0, 7)
    ]);
    setTimeout(() => setTestEventSent(null), 3000);
  };

  // Build UTM Link
  const buildGeneratedUrl = (overrideCampaign?: string, overrideSource?: string) => {
    try {
      const cleanBase = utmBaseUrl.trim() || 'https://wm2eventos.com.br';
      const url = new URL(cleanBase.startsWith('http') ? cleanBase : `https://${cleanBase}`);
      url.searchParams.set('utm_source', overrideSource || utmSource.trim() || 'instagram_ads');
      url.searchParams.set('utm_medium', utmMedium.trim() || 'stories');
      url.searchParams.set('utm_campaign', overrideCampaign || utmCampaign.trim() || 'campanha_wm2');
      if (utmContent.trim()) url.searchParams.set('utm_content', utmContent.trim());
      if (utmTerm.trim()) url.searchParams.set('utm_term', utmTerm.trim());
      return url.toString();
    } catch {
      return `${utmBaseUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    }
  };

  const handleCreateUtmLink = (e: React.FormEvent) => {
    e.preventDefault();
    const fullUrl = buildGeneratedUrl();
    const newLink: UTMLinkItem = {
      id: `utm-${Date.now()}`,
      name: utmCampaignName.trim() || `Campanha ${utmSource} - ${utmCampaign}`,
      baseUrl: utmBaseUrl,
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      content: utmContent,
      term: utmTerm,
      fullUrl,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      clicksCount: 0
    };

    const updated = saveUTMLink(newLink);
    setUtmLinks(updated);
    handleCopyLink(newLink.id, fullUrl);
  };

  const handleCopyLink = (id: string, url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2500);
    }
  };

  const handleDeleteUtm = (id: string) => {
    const updated = deleteUTMLink(id);
    setUtmLinks(updated);
  };

  const handleCopyAdCopy = () => {
    const fullCopy = `${adHeadline}\n\n${adPrimaryText}\n\n👉 ${adCtaText}: ${buildGeneratedUrl()}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullCopy);
      setCopiedCopySuccess(true);
      setTimeout(() => setCopiedCopySuccess(false), 2500);
    }
  };

  const handleCopyTemplateText = (idx: number, tpl: { title: string; body: string; cta: string; hashtags: string }) => {
    const fullText = `${tpl.title}\n\n${tpl.body}\n\n👉 ${tpl.cta}: ${buildGeneratedUrl()}\n\n${tpl.hashtags}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedTemplateIdx(idx);
      setTimeout(() => setCopiedTemplateIdx(null), 2500);
    }
  };

  // Calculations for ROI Simulator
  const totalClicksEstimated = avgCpc > 0 ? Math.round(monthlyBudget / avgCpc) : 0;
  const totalLeadsEstimated = Math.round(totalClicksEstimated * (leadConversionRate / 100));
  const totalContractsEstimated = Math.max(1, Math.round(totalLeadsEstimated * (contractClosingRate / 100)));
  const totalProjectedRevenue = totalContractsEstimated * avgContractValue;
  const estimatedRoas = monthlyBudget > 0 ? (totalProjectedRevenue / monthlyBudget).toFixed(1) : '0';
  const estimatedProfit = totalProjectedRevenue - monthlyBudget;

  const isAnyPixelConfigured = Boolean(
    pixelConfig.metaPixelId.trim() ||
    pixelConfig.googleAdsId.trim() ||
    pixelConfig.ga4MeasurementId.trim() ||
    pixelConfig.tiktokPixelId.trim()
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card (White Theme) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 text-neutral-900 border border-neutral-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#8a7238] text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-[#aa904f]" />
              <span>Central Interativa de Aquisição de Turmas</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-neutral-900 flex items-center gap-2.5">
              <span>Tráfego Pago & Anúncios de Formatura</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-[#8a7238] border border-amber-200 font-extrabold uppercase tracking-wide">
                Interativo
              </span>
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Crie mockups visuais de anúncios em tempo real, gere copys persuasivas para comissões, configure os pixels do <strong>Meta Ads</strong> e <strong>Google Ads</strong> e simule o retorno em novos contratos de formaturas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenVisitorsTab && (
              <button
                id="btn-open-visitor-radar"
                onClick={onOpenVisitorsTab}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-200 transition-all shadow-2xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#aa904f]" />
                <span>Ver Radar de Visitas</span>
              </button>
            )}

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isAnyPixelConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span className="text-neutral-700 font-medium">
                {isAnyPixelConfigured ? "Pixels Ativos no Site" : "Configure seus Pixels"}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-neutral-100">
          <button
            id="tab-interactive-ad-preview"
            onClick={() => setActiveSubTab("ad_preview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "ad_preview"
                ? "bg-[#aa904f] text-white shadow-xs"
                : "bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Simulador Visual de Anúncios</span>
          </button>
          <button
            id="tab-copy-generator"
            onClick={() => setActiveSubTab("copy_generator")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "copy_generator"
                ? "bg-[#aa904f] text-white shadow-xs"
                : "bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Gerador de Textos & Copys</span>
          </button>
          <button
            id="tab-utm-builder"
            onClick={() => setActiveSubTab("utm_builder")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "utm_builder"
                ? "bg-[#aa904f] text-white shadow-xs"
                : "bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>3. Links UTM & QR Codes</span>
          </button>
          <button
            id="tab-roi-simulator"
            onClick={() => setActiveSubTab("roi_simulator")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "roi_simulator"
                ? "bg-[#aa904f] text-white shadow-xs"
                : "bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>4. Simulador de ROI & Lucro</span>
          </button>
          <button
            id="tab-pixels-config"
            onClick={() => setActiveSubTab("pixels")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "pixels"
                ? "bg-[#aa904f] text-white shadow-xs"
                : "bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>5. Configuração dos Pixels</span>
          </button>
          <button
            id="tab-strategy-guide"
            onClick={() => setActiveSubTab("guide")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "guide"
                ? "bg-[#aa904f] text-white shadow-xs"
                : "bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>6. Estratégia de Captação</span>
          </button>
        </div>
      </div>
      {/* TAB 1: INTERACTIVE AD PREVIEW MOCKUP */}
      {activeSubTab === 'ad_preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 border-neutral-200">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#aa904f]" />
                    <span>Personalizador de Anúncio</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Altere os textos, imagem e canal para visualizar como o anúncio aparecerá para os formandos.
                  </p>
                </div>
              </div>

              {/* Platform Switcher */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-2">
                  Canal do Anúncio:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdPlatform('instagram_stories')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      adPlatform === 'instagram_stories'
                        ? 'border-[#aa904f] bg-[#aa904f]/10 text-[#aa904f]'
                        : 'border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-500 hover:bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Stories / Reels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdPlatform('instagram_feed')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      adPlatform === 'instagram_feed'
                        ? 'border-[#aa904f] bg-[#aa904f]/10 text-[#aa904f]'
                        : 'border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-500 hover:bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Feed / Carrossel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdPlatform('google_search')}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      adPlatform === 'google_search'
                        ? 'border-[#aa904f] bg-[#aa904f]/10 text-[#aa904f]'
                        : 'border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-500 hover:bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Google Busca</span>
                  </button>
                </div>
              </div>

              {/* Theme / Visual Selector & Carousel Manager */}
              {adPlatform !== 'google_search' && (
                <div className="space-y-4">
                  {/* In Feed / Carrossel mode: Dedicated Carousel Slide Manager */}
                  {adPlatform === 'instagram_feed' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 text-neutral-900">
                            <Sliders className="w-4 h-4 text-[#aa904f]" />
                            <span>Montador de Slides do Carrossel ({carouselSlides.length} cards)</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Clique em um slide para selecioná-lo e depois clique em qualquer foto abaixo para trocá-la.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {customUploadedImages.length > 1 && (
                            <button
                              type="button"
                              onClick={handleUseAllCustomInCarousel}
                              className="px-2.5 py-1 rounded-lg bg-[#aa904f]/20 hover:bg-[#aa904f]/30 text-[#aa904f] text-[11px] font-bold transition-all border border-[#aa904f]/30"
                              title="Montar o carrossel com todas as fotos que você subiu"
                            >
                              ⚡ Usar Todas as Minhas Fotos ({customUploadedImages.length})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleAddSlideToCarousel()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#aa904f] hover:bg-[#967e3a] text-white text-[11px] font-bold shadow-xs transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Adicionar Slide</span>
                          </button>
                        </div>
                      </div>

                      {/* Slides Strip */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                        {carouselSlides.map((slide, idx) => {
                          const isActive = idx === activeCarouselSlideIdx;
                          return (
                            <div
                              key={`${slide.id}-${idx}`}
                              className="relative shrink-0 group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCarouselSlideIdx(idx);
                                  setSelectedTheme(slide);
                                }}
                                className={`relative w-24 h-18 rounded-xl overflow-hidden border-2 transition-all text-left block ${
                                  isActive
                                    ? 'border-[#aa904f] ring-2 ring-[#aa904f]/40 scale-105 shadow-md'
                                    : 'border-neutral-300 border-neutral-200 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={slide.imageUrl} alt={slide.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-between">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full self-start leading-none ${
                                    isActive ? 'bg-[#aa904f] text-white' : 'bg-black/60 text-neutral-300'
                                  }`}>
                                    Slide {idx + 1}
                                  </span>
                                  <span className="text-[10px] font-bold text-white leading-tight truncate">
                                    {slide.name}
                                  </span>
                                </div>
                              </button>

                              {carouselSlides.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveCarouselSlide(idx, e)}
                                  title={`Remover Slide ${idx + 1}`}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-md z-10 transition-transform active:scale-90"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5 border-t border-[#aa904f]/20">
                        <span className="font-semibold text-[#aa904f]">
                          👉 Editando agora: <strong>Slide {activeCarouselSlideIdx + 1} de {carouselSlides.length}</strong>
                        </span>
                        <span>Dica: clique em qualquer foto da galeria abaixo para aplicá-la neste slide</span>
                      </div>
                    </div>
                  )}

                  {/* Header & Upload Photo Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 text-neutral-700">
                        Galeria de Fotos Disponíveis:
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        {adPlatform === 'instagram_feed'
                          ? `Clique em uma foto para colocar no Slide ${activeCarouselSlideIdx + 1}`
                          : 'Clique em uma foto para aplicar no anúncio'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingPhotos}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#aa904f] hover:bg-[#967e3a] text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessingPhotos ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessingPhotos ? 'Carregando...' : '+ Incluir Fotos do Computador'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlModal(!showUrlModal)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 bg-neutral-50 hover:bg-neutral-200 text-neutral-700 text-neutral-700 text-xs font-bold transition-all border border-neutral-200 border-neutral-200"
                        title="Adicionar foto através de um link web"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-[#aa904f]" />
                        <span>Via Link</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.jfif"
                        multiple
                        onChange={handleUploadCustomAdImages}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Feedback / Progress Toast Alert */}
                  {uploadFeedback && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn ${
                      uploadFeedback.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : uploadFeedback.type === 'error'
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                        : 'bg-[#aa904f]/10 border border-[#aa904f]/30 text-[#aa904f]'
                    }`}>
                      <div className="flex items-center gap-2">
                        {uploadFeedback.type === 'info' && <Loader2 className="w-4 h-4 animate-spin text-[#aa904f]" />}
                        {uploadFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {uploadFeedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        <span>{uploadFeedback.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadFeedback(null)}
                        className="text-neutral-400 hover:text-neutral-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Optional: Add by URL Drawer */}
                  {showUrlModal && (
                    <div className="p-3 rounded-xl bg-neutral-100 bg-neutral-50/80 border border-neutral-300 border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        <span>Adicionar Foto via Link URL</span>
                        <button type="button" onClick={() => setShowUrlModal(false)} className="text-neutral-400 hover:text-white">✕</button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={customPhotoUrlInput}
                          onChange={(e) => setCustomPhotoUrlInput(e.target.value)}
                          placeholder="https://exemplo.com/sua-foto.jpg"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 border-neutral-200 bg-white bg-white text-xs focus:ring-2 focus:ring-[#aa904f]/40 outline-hidden"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddPhotoByUrl();
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoByUrl}
                          className="px-3 py-1.5 rounded-lg bg-[#aa904f] hover:bg-[#967e3a] text-white text-xs font-bold"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag and drop / upload card banner */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all text-center group ${
                      isDraggingOver
                        ? 'border-[#aa904f] bg-[#aa904f]/20 scale-[1.01]'
                        : 'border-[#aa904f]/40 hover:border-[#aa904f] bg-[#aa904f]/5 hover:bg-[#aa904f]/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#aa904f]">
                      {isProcessingPhotos ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#aa904f]" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      <span>
                        {isDraggingOver
                          ? 'Solte as fotos aqui para importar!'
                          : isProcessingPhotos
                          ? 'Processando imagens...'
                          : '+ Clique ou Arraste fotos do seu computador para cá (selecione uma ou várias)'}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-0.5">
                      Suporta JPG, PNG, WEBP, HEIC — o sistema otimiza e salva automaticamente na sua galeria!
                    </span>
                  </div>

                  {/* Section 1: Minhas Fotos Enviadas (Custom Uploaded Photos) */}
                  {customUploadedImages.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#aa904f]/5 border border-[#aa904f]/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#aa904f] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Minhas Fotos Enviadas ({customUploadedImages.length}):</span>
                        </span>
                        <span className="text-[11px] text-neutral-400">Clique para aplicar</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
                        {customUploadedImages.map((img) => {
                          const isCurrentTheme = selectedTheme.id === img.id;
                          const isInCurrentSlide = adPlatform === 'instagram_feed' && carouselSlides[activeCarouselSlideIdx]?.id === img.id;

                          return (
                            <div key={img.id} className="relative group">
                              <button
                                type="button"
                                onClick={() => handleSelectPhotoForAd(img)}
                                className={`w-full relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                                  isInCurrentSlide || isCurrentTheme
                                    ? 'border-[#aa904f] ring-2 ring-[#aa904f]/40 scale-[1.02]'
                                    : 'border-neutral-300 border-neutral-200 opacity-80 hover:opacity-100 hover:border-[#aa904f]/50'
                                }`}
                              >
                                <img src={img.imageUrl} alt={img.name} className="w-full h-16 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-end">
                                  <span className="text-[10px] font-bold text-white leading-tight truncate">
                                    {(isInCurrentSlide || isCurrentTheme) ? '✓ ' : ''}{img.name}
                                  </span>
                                </div>
                              </button>

                              {/* Action overlay: Add as new slide in carousel mode */}
                              {adPlatform === 'instagram_feed' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleAddSlideToCarousel(img, e)}
                                  title="Adicionar como novo slide no carrossel"
                                  className="absolute top-1 left-1 p-1 bg-[#aa904f]/90 hover:bg-[#aa904f] text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-[10px] font-bold flex items-center gap-0.5"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Slide</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleRemoveSingleCustomImage(img.id, e)}
                                title={`Remover "${img.name}"`}
                                className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Fotos Padrão de Exemplo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-neutral-400 font-semibold">
                        {showSampleThemes && hiddenThemeIds.length < AD_THEMES.length
                          ? 'Fotos de exemplo da galeria:'
                          : 'Fotos de exemplo apagadas / ocultas'}
                      </span>
                      <div className="flex items-center gap-2">
                        {(hiddenThemeIds.length > 0 || !showSampleThemes) && (
                          <button
                            type="button"
                            onClick={handleRestoreSampleThemes}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-[#aa904f] hover:bg-[#aa904f]/10 border border-[#aa904f]/30 transition-all"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restaurar Fotos de Exemplo</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (showSampleThemes) {
                              setShowSampleThemes(false);
                              setHiddenThemeIds(AD_THEMES.map(t => t.id));
                              // If current selected theme is an example theme, switch to first custom image if available
                              if (selectedTheme && !selectedTheme.id.startsWith('custom') && customUploadedImages.length > 0) {
                                setSelectedTheme(customUploadedImages[0]);
                              }
                            } else {
                              handleRestoreSampleThemes();
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            showSampleThemes && hiddenThemeIds.length < AD_THEMES.length
                              ? 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : 'bg-neutral-100 bg-neutral-50 hover:bg-neutral-200 text-neutral-700 text-neutral-700'
                          }`}
                        >
                          {showSampleThemes && hiddenThemeIds.length < AD_THEMES.length ? (
                            <>
                              <Trash2 className="w-3 h-3" />
                              <span>Apagar Todas Fotos de Exemplo</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Mostrar Fotos de Exemplo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {showSampleThemes && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
                        {AD_THEMES.filter(theme => !hiddenThemeIds.includes(theme.id)).map(theme => {
                          const isCurrentTheme = selectedTheme.id === theme.id;
                          const isInCurrentSlide = adPlatform === 'instagram_feed' && carouselSlides[activeCarouselSlideIdx]?.id === theme.id;

                          return (
                            <div key={theme.id} className="relative group">
                              <button
                                type="button"
                                onClick={() => handleSelectPhotoForAd(theme)}
                                className={`w-full relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                                  isInCurrentSlide || isCurrentTheme
                                    ? 'border-[#aa904f] ring-2 ring-[#aa904f]/30 scale-[1.02]'
                                    : 'border-transparent opacity-75 hover:opacity-100'
                                }`}
                              >
                                <img src={theme.imageUrl} alt={theme.name} className="w-full h-16 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                                  <span className="text-[10px] font-bold text-white leading-tight truncate">{theme.name}</span>
                                </div>
                              </button>

                              {adPlatform === 'instagram_feed' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleAddSlideToCarousel(theme, e)}
                                  title="Adicionar como novo slide no carrossel"
                                  className="absolute top-1 left-1 p-1 bg-[#aa904f]/90 hover:bg-[#aa904f] text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-[10px] font-bold flex items-center gap-0.5"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Slide</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleHideTheme(theme.id, e)}
                                title={`Apagar "${theme.name}" da galeria`}
                                className="absolute top-1 right-1 px-1.5 py-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-md flex items-center gap-1 text-[10px] font-bold"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Apagar</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(!showSampleThemes || hiddenThemeIds.length === AD_THEMES.length) && (
                      <div className="p-3 rounded-xl bg-neutral-100 bg-white border border-dashed border-neutral-300 border-neutral-200 text-center flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          Fotos de exemplo apagadas. O simulador está exibindo apenas suas fotos personalizadas.
                        </span>
                        <button
                          type="button"
                          onClick={handleRestoreSampleThemes}
                          className="text-xs font-bold text-[#aa904f] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Restaurar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Headline & Copy Text Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1">
                    Título / Gancho Principal:
                  </label>
                  <input
                    type="text"
                    value={adHeadline}
                    onChange={(e) => setAdHeadline(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1">
                    Texto do Anúncio (Legenda / Descrição):
                  </label>
                  <textarea
                    rows={3}
                    value={adPrimaryText}
                    onChange={(e) => setAdPrimaryText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1">
                      Texto do Botão (CTA):
                    </label>
                    <input
                      type="text"
                      value={adCtaText}
                      onChange={(e) => setAdCtaText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1">
                      Curso em Foco:
                    </label>
                    <input
                      type="text"
                      value={adTargetCourse}
                      onChange={(e) => setAdTargetCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 border-neutral-200">
                <button
                  type="button"
                  onClick={handleCopyAdCopy}
                  className="flex items-center gap-2 bg-neutral-900 bg-neutral-50 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {copiedCopySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Texto Copiado para Anúncio!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#aa904f]" />
                      <span>Copiar Texto & Link para Anunciar</span>
                    </>
                  )}
                </button>

                <a
                  href={buildGeneratedUrl(`preview_${adPlatform}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#aa904f] hover:underline font-bold"
                >
                  <span>Testar Destino do Anúncio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Live Mockup Column (Right) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="text-center mb-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-[#aa904f]" />
                <span>Prévia ao Vivo</span>
              </span>

              {adPlatform !== 'google_search' && (
                <div className="flex items-center gap-1.5">
                  {selectedTheme.id.startsWith('custom') && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSingleCustomImage(selectedTheme.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition-all border border-rose-200 dark:border-rose-800"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover esta</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#aa904f]/20 hover:bg-[#aa904f]/30 text-[#aa904f] text-[11px] font-bold transition-all border border-[#aa904f]/40 active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Incluir Foto</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mockup 1: Instagram Stories */}
            {adPlatform === 'instagram_stories' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[310px] aspect-[9/16] rounded-[36px] bg-neutral-950 border-[6px] border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 select-none"
              >
                {/* Background Image with Cinematic Overlay */}
                <img
                  src={selectedTheme.imageUrl}
                  alt={selectedTheme.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-75 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none"></div>

                {/* Left/Right click zones for story switching */}
                <div
                  onClick={() => {
                    const allPhotos = [...customUploadedImages, ...AD_THEMES.filter(t => !hiddenThemeIds.includes(t.id))];
                    const currentIdx = allPhotos.findIndex(p => p.id === selectedTheme.id);
                    const prevIdx = currentIdx <= 0 ? allPhotos.length - 1 : currentIdx - 1;
                    if (allPhotos[prevIdx]) setSelectedTheme(allPhotos[prevIdx]);
                  }}
                  className="absolute left-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
                  title="Foto anterior do story"
                />
                <div
                  onClick={() => {
                    const allPhotos = [...customUploadedImages, ...AD_THEMES.filter(t => !hiddenThemeIds.includes(t.id))];
                    const currentIdx = allPhotos.findIndex(p => p.id === selectedTheme.id);
                    const nextIdx = currentIdx >= allPhotos.length - 1 ? 0 : currentIdx + 1;
                    if (allPhotos[nextIdx]) setSelectedTheme(allPhotos[nextIdx]);
                  }}
                  className="absolute right-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
                  title="Próxima foto do story"
                />

                {/* Top Stories Header */}
                <div className="relative z-10 space-y-2 pt-1">
                  {/* Progress Bars */}
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 flex-1 bg-white rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-white/40 rounded-full"></div>
                    <div className="h-0.5 flex-1 bg-white/20 rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-[#aa904f] bg-white p-0.5 overflow-hidden flex items-center justify-center font-black text-xs text-neutral-900">
                        WM2
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white leading-none">wm2eventos</span>
                          <CheckCircle2 className="w-3 h-3 text-[#aa904f] fill-[#aa904f]/20" />
                        </div>
                        <span className="text-[10px] text-white/70">Patrocinado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Content Overlay */}
                <div className="relative z-10 space-y-2 my-auto px-1">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-[#aa904f]/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                    {adTargetCourse}
                  </span>
                  <h4 className="text-lg font-black text-white leading-tight drop-shadow-md">
                    {adHeadline}
                  </h4>
                  <p className="text-xs text-neutral-100 font-medium leading-snug drop-shadow-sm line-clamp-3">
                    {adPrimaryText}
                  </p>
                </div>

                {/* Bottom Stories Swipe Up / CTA */}
                <div className="relative z-10 space-y-2 pb-2">
                  <div className="flex flex-col items-center animate-bounce">
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase flex items-center gap-1">
                      <span>Saiba Mais</span>
                    </span>
                  </div>

                  <a
                    href={buildGeneratedUrl('instagram_stories', 'instagram_ads')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white/95 hover:bg-white text-neutral-900 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <span>{adCtaText}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#aa904f]" />
                  </a>
                </div>
              </motion.div>
            )}

            {/* Mockup 2: Instagram Feed / Carrossel Post */}
            {adPlatform === 'instagram_feed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[340px] rounded-2xl bg-white bg-neutral-50 border border-neutral-200 border-neutral-200 shadow-xl overflow-hidden text-neutral-900 text-neutral-900 text-xs"
              >
                {/* Header */}
                <div className="p-3 flex items-center justify-between border-b border-neutral-100 border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-[#aa904f] bg-white text-neutral-950 font-black text-xs flex items-center justify-center">
                      WM2
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold block leading-tight">wm2eventos</span>
                        <CheckCircle2 className="w-3 h-3 text-[#aa904f] fill-[#aa904f]/20" />
                      </div>
                      <span className="text-[10px] text-neutral-500">Patrocinado • Carrossel</span>
                    </div>
                  </div>

                  {/* Slide counter */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 bg-neutral-50 text-[#aa904f]">
                    Slide {activeCarouselSlideIdx + 1}/{carouselSlides.length}
                  </span>
                </div>

                {/* Interactive Carousel Image Container */}
                <div className="relative aspect-square bg-neutral-900 overflow-hidden group">
                  {/* Active Slide Image */}
                  <img
                    src={carouselSlides[activeCarouselSlideIdx]?.imageUrl || selectedTheme.imageUrl}
                    alt={carouselSlides[activeCarouselSlideIdx]?.name || selectedTheme.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Target course badge */}
                  <div className="absolute top-3 left-3 bg-[#aa904f] text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md pointer-events-none">
                    {adTargetCourse}
                  </div>

                  {/* Instagram-style Carousel counter pill (Top Right) */}
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                    {activeCarouselSlideIdx + 1}/{carouselSlides.length}
                  </div>

                  {/* Left Arrow Navigation */}
                  {carouselSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextIdx = activeCarouselSlideIdx <= 0 ? carouselSlides.length - 1 : activeCarouselSlideIdx - 1;
                        setActiveCarouselSlideIdx(nextIdx);
                        setSelectedTheme(carouselSlides[nextIdx]);
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer z-10"
                      title="Slide Anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Right Arrow Navigation */}
                  {carouselSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextIdx = activeCarouselSlideIdx >= carouselSlides.length - 1 ? 0 : activeCarouselSlideIdx + 1;
                        setActiveCarouselSlideIdx(nextIdx);
                        setSelectedTheme(carouselSlides[nextIdx]);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer z-10"
                      title="Próximo Slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Slide Pagination Dots overlay at bottom of image */}
                  {carouselSlides.length > 1 && (
                    <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
                      {carouselSlides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCarouselSlideIdx(dotIdx);
                            setSelectedTheme(carouselSlides[dotIdx]);
                          }}
                          className={`rounded-full transition-all ${
                            dotIdx === activeCarouselSlideIdx
                              ? 'w-4 h-1.5 bg-[#aa904f]'
                              : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                          }`}
                          title={`Ir para o slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA Action Banner */}
                <div className="bg-neutral-100 bg-white px-3 py-2 flex items-center justify-between border-b border-neutral-200 border-neutral-200">
                  <span className="font-bold text-[11px] text-[#aa904f] truncate">{adCtaText}</span>
                  <ChevronRight className="w-4 h-4 text-[#aa904f]" />
                </div>

                {/* Social Icons & Pagination Dots */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-neutral-600 text-neutral-500">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <MessageCircle className="w-4 h-4" />
                      <Send className="w-4 h-4" />
                    </div>

                    {/* Instagram-style middle carousel dots */}
                    {carouselSlides.length > 1 && (
                      <div className="flex items-center gap-1">
                        {carouselSlides.map((_, dotIdx) => (
                          <div
                            key={dotIdx}
                            className={`rounded-full transition-all ${
                              dotIdx === activeCarouselSlideIdx
                                ? 'w-2 h-2 bg-[#aa904f]'
                                : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <Bookmark className="w-4 h-4" />
                  </div>

                  <div>
                    <span className="font-bold mr-1.5">wm2eventos</span>
                    <span className="text-neutral-700 text-neutral-700 font-normal">
                      <strong>{adHeadline}</strong> {adPrimaryText}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mockup 3: Google Search Sponsored Result */}
            {adPlatform === 'google_search' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[420px] rounded-2xl bg-white bg-white border border-neutral-200 border-neutral-200 p-5 shadow-xl space-y-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-neutral-900 text-neutral-900 bg-neutral-100 bg-neutral-50 px-2 py-0.5 rounded-sm">
                    Patrocinado
                  </span>
                  <span className="text-xs text-neutral-500 truncate font-mono">
                    https://wm2eventos.com.br &gt; formaturas
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {adHeadline} | WM2 Produções & Eventos
                  </h4>
                  <p className="text-xs text-neutral-600 text-neutral-700 mt-1 leading-relaxed">
                    {adPrimaryText} Atendimento presencial para comissões de formatura, contratos digitais e cenografia impecável.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 border-neutral-200 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-neutral-50 bg-neutral-50/60 font-semibold text-blue-600 dark:text-blue-400">
                    ✨ Baile de Gala & Shows
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 bg-neutral-50/60 font-semibold text-blue-600 dark:text-blue-400">
                    📲 Orçamento via WhatsApp
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COPY GENERATOR */}
      {activeSubTab === 'copy_generator' && (
        <div className="space-y-6">
          <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 border-neutral-200 mb-6">
              <div>
                <h3 className="text-base font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#aa904f]" />
                  <span>Gerador Inteligente de Textos & Ideias de Anúncios</span>
                </h3>
                <p className="text-xs text-neutral-500 text-neutral-500 mt-0.5">
                  Copys persuasivas testadas para atrair a atenção de presidentes e tesoureiros de comissões de formatura.
                </p>
              </div>

              {/* Course Category Filter */}
              <div className="flex items-center gap-2 bg-neutral-100 bg-neutral-50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedCourseGroup('medicina')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCourseGroup === 'medicina'
                      ? 'bg-white bg-white text-[#aa904f] shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 hover:text-neutral-900'
                  }`}
                >
                  Medicina & Saúde
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCourseGroup('direito')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCourseGroup === 'direito'
                      ? 'bg-white bg-white text-[#aa904f] shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 hover:text-neutral-900'
                  }`}
                >
                  Direito & Humanas
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCourseGroup('geral')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCourseGroup === 'geral'
                      ? 'bg-white bg-white text-[#aa904f] shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 hover:text-neutral-900'
                  }`}
                >
                  Geral / Todas as Turmas
                </button>
              </div>
            </div>

            {/* Generated Templates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COPY_TEMPLATES[selectedCourseGroup].map((tpl, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-neutral-200 border-neutral-200 bg-neutral-50/70 bg-neutral-50/40 flex flex-col justify-between space-y-4 hover:border-[#aa904f]/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#aa904f] uppercase tracking-wider">
                        Modelo #{idx + 1}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-medium">Pronto para Stories/Feed</span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 text-neutral-900">
                      {tpl.title}
                    </h4>

                    <p className="text-xs text-neutral-600 text-neutral-700 whitespace-pre-line leading-relaxed">
                      {tpl.body}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white bg-white border border-neutral-200 border-neutral-200 text-xs">
                      <span className="text-neutral-500 font-medium">Botão CTA sugerido: </span>
                      <strong className="text-[#aa904f]">{tpl.cta}</strong>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-mono">
                      {tpl.hashtags}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 border-neutral-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setAdHeadline(tpl.title);
                        setAdPrimaryText(tpl.body);
                        setAdCtaText(tpl.cta);
                        setActiveSubTab('ad_preview');
                      }}
                      className="text-xs font-bold text-neutral-600 text-neutral-700 hover:text-[#aa904f] flex items-center gap-1"
                    >
                      <span>Aplicar no Simulador</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyTemplateText(idx, tpl)}
                      className="flex items-center gap-1.5 bg-[#aa904f] hover:bg-[#967e3a] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
                    >
                      {copiedTemplateIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Texto Completo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UTM BUILDER & QR CODES */}
      {activeSubTab === 'utm_builder' && (
        <div className="space-y-6">
          <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 border-neutral-200 mb-6">
              <div>
                <h3 className="text-base font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#aa904f]" />
                  <span>Gerador de Links Rastreados (UTM Builder)</span>
                </h3>
                <p className="text-xs text-neutral-500 text-neutral-500 mt-0.5">
                  Crie links personalizados com parâmetros de campanha para colar em anúncios do Instagram, botões do WhatsApp e posts patrocinados.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 bg-neutral-50 px-3 py-1.5 rounded-lg">
                <Globe className="w-3.5 h-3.5 text-[#aa904f]" />
                <span>Rastreamento Automático no Radar WM2</span>
              </span>
            </div>

            <form onSubmit={handleCreateUtmLink} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    Nome Interno da Campanha
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Anúncio Stories Baile Medicina 2026"
                    value={utmCampaignName}
                    onChange={(e) => setUtmCampaignName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    URL de Destino do Site
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://wm2eventos.com.br"
                    value={utmBaseUrl}
                    onChange={(e) => setUtmBaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    Origem (<code className="text-[#aa904f]">utm_source</code>)
                  </label>
                  <select
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden"
                  >
                    <option value="instagram_ads">Instagram Ads</option>
                    <option value="facebook_ads">Facebook Ads</option>
                    <option value="google_ads">Google Ads (Pesquisa/YouTube)</option>
                    <option value="tiktok_ads">TikTok Ads</option>
                    <option value="whatsapp_comissao">WhatsApp Direto</option>
                    <option value="influencer_parceiro">Influencer / Parceria</option>
                    <option value="email_mkt">E-mail Marketing</option>
                  </select>
                </div>

                {/* Medium */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    Mídia / Formato (<code className="text-[#aa904f]">utm_medium</code>)
                  </label>
                  <select
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden"
                  >
                    <option value="stories">Stories (Vertical)</option>
                    <option value="reels">Reels / Vídeo Curto</option>
                    <option value="feed">Feed / Carrossel</option>
                    <option value="cpc">CPC (Google Search)</option>
                    <option value="display">Banner Display</option>
                    <option value="direct_message">Mensagem Direta</option>
                  </select>
                </div>

                {/* Campaign */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    Identificador (<code className="text-[#aa904f]">utm_campaign</code>)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: odonto_sobral_2026"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    Criativo / Conteúdo (<code className="text-[#aa904f]">utm_content</code>)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: video_brinde_champanhe"
                    value={utmContent}
                    onChange={(e) => setUtmContent(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Real-time Link Preview */}
              <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 space-y-2">
                <span className="text-[11px] font-bold text-[#dfd1a1] uppercase tracking-wider block">
                  Link Final Gerado para o Anúncio:
                </span>
                <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono text-neutral-200 break-all select-all">
                  {buildGeneratedUrl()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  id="btn-generate-utm-link"
                  className="flex items-center gap-2 bg-[#aa904f] hover:bg-[#967e3a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salvar & Copiar Link</span>
                </button>
              </div>
            </form>
          </div>

          {/* Saved Links Table */}
          <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-neutral-900 text-neutral-900 flex items-center gap-2 mb-4">
              <Share2 className="w-4 h-4 text-[#aa904f]" />
              <span>Links de Campanhas Salvos ({utmLinks.length})</span>
            </h3>

            {utmLinks.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs border border-dashed border-neutral-200 border-neutral-200 rounded-xl">
                Nenhum link com UTM gerado ainda. Use o formulário acima para criar links rastreados para seus anúncios!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 border-neutral-200 text-neutral-500 font-semibold">
                      <th className="py-2.5 px-3">Nome da Campanha</th>
                      <th className="py-2.5 px-3">Origem / Canal</th>
                      <th className="py-2.5 px-3">Mídia</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Link Completo</th>
                      <th className="py-2.5 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {utmLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-neutral-50 hover:bg-neutral-100/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-neutral-900 text-neutral-900">
                          {link.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {link.source}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 text-neutral-500 font-medium">
                          {link.medium}
                        </td>
                        <td className="py-3 px-3 text-neutral-500">
                          {link.createdAt}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-neutral-500 max-w-xs truncate">
                          {link.fullUrl}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedQrCodeItem(link)}
                              title="Ver QR Code do Link"
                              className="p-1.5 rounded-lg text-neutral-600 text-neutral-700 hover:text-[#aa904f] hover:bg-neutral-100 hover:bg-neutral-100 transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleCopyLink(link.id, link.fullUrl)}
                              title="Copiar Link"
                              className="p-1.5 rounded-lg text-neutral-600 text-neutral-700 hover:text-[#aa904f] hover:bg-neutral-100 hover:bg-neutral-100 transition-colors"
                            >
                              {copiedLinkId === link.id ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            <a
                              href={link.fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Testar Link em Nova Guia"
                              className="p-1.5 rounded-lg text-neutral-600 text-neutral-700 hover:text-blue-500 hover:bg-neutral-100 hover:bg-neutral-100 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleDeleteUtm(link.id)}
                              title="Excluir Link"
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 hover:bg-neutral-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ROI SIMULATOR */}
      {activeSubTab === 'roi_simulator' && (
        <div className="space-y-6">
          <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 lg:p-8 shadow-xs">
            <div className="pb-4 border-b border-neutral-200 border-neutral-200 mb-6">
              <h3 className="text-lg font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#aa904f]" />
                <span>Simulador de Retorno de Investimento (ROI / ROAS) para Formaturas</span>
              </h3>
              <p className="text-xs text-neutral-500 text-neutral-500 mt-0.5">
                Simule como o tráfego pago escala o faturamento da sua produtora com a captação de novas comissões de formatura.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Inputs & Parameters */}
              <div className="space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#aa904f]">
                  1. Parâmetros de Investimento & Conversão
                </h4>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-700 text-neutral-700 mb-1.5">
                    <span>Orçamento Mensal em Anúncios (Instagram/Google):</span>
                    <span className="text-base text-[#aa904f]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyBudget)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="15000"
                    step="100"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full accent-[#aa904f] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>R$ 300</span>
                    <span>R$ 5.000</span>
                    <span>R$ 15.000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1">
                      Custo Médio por Clique (CPC)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-neutral-400">R$</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.30"
                        max="5.00"
                        value={avgCpc}
                        onChange={(e) => setAvgCpc(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1">
                      Taxa de Conversão em Lead (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="20"
                        value={leadConversionRate}
                        onChange={(e) => setLeadConversionRate(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900"
                      />
                      <span className="absolute right-3 top-2 text-xs text-neutral-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1">
                      Taxa de Fechamento de Turmas (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="50"
                        value={contractClosingRate}
                        onChange={(e) => setContractClosingRate(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900"
                      />
                      <span className="absolute right-3 top-2 text-xs text-neutral-400">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1">
                      Faturamento Médio por Turma
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-neutral-400">R$</span>
                      <input
                        type="number"
                        step="5000"
                        min="20000"
                        max="800000"
                        value={avgContractValue}
                        onChange={(e) => setAvgContractValue(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Projection Outcome Dashboard */}
              <div className="bg-neutral-950 text-white rounded-2xl p-6 border border-neutral-800 space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#dfd1a1] mb-4">
                    2. Estimativa de Retorno Mensal Projetado
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-1">Cliques Estimados</span>
                      <span className="text-xl font-bold text-white">
                        {totalClicksEstimated.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 block mb-1">Contatos de Comissões</span>
                      <span className="text-xl font-bold text-[#aa904f]">
                        ~ {totalLeadsEstimated} comissões
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#aa904f]/20 via-[#aa904f]/10 to-transparent border border-[#aa904f]/40 space-y-2 mb-4">
                    <span className="text-xs text-neutral-300 font-semibold block">
                      Faturamento Bruto Projetado em Novos Contratos:
                    </span>
                    <div className="text-2xl lg:text-3xl font-extrabold text-[#dfd1a1]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProjectedRevenue)}
                    </div>
                    <span className="text-[11px] text-neutral-400 block">
                      Baseado no fechamento de ~ <strong>{totalContractsEstimated} {totalContractsEstimated === 1 ? 'turma' : 'turmas'}</strong> por mês.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Retorno sobre Anúncios (ROAS):</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {estimatedRoas}x o investimento
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block uppercase">Lucro Bruto Estimado:</span>
                    <span className="text-sm font-bold text-neutral-200">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PIXEL CONFIGURATION & LIVE DIAGNOSTIC */}
      {activeSubTab === 'pixels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 border-neutral-200 mb-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#aa904f]" />
                    <span>Códigos de Rastreamento de Anúncios</span>
                  </h3>
                  <p className="text-xs text-neutral-500 text-neutral-500 mt-0.5">
                    Cole os IDs gerados nas contas de anúncios para rastrear automaticamente visualizações e leads.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 text-neutral-500 font-medium">Injeção Ativa:</span>
                  <button
                    type="button"
                    onClick={() => setPixelConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      pixelConfig.enabled ? 'bg-[#aa904f]' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        pixelConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSavePixels} className="space-y-5">
                {/* Meta Pixel (Instagram & Facebook) */}
                <div className="p-4 rounded-xl bg-neutral-50 bg-neutral-50/50 border border-neutral-200 border-neutral-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 text-neutral-900">
                          Meta Pixel ID (Instagram & Facebook Ads)
                        </h4>
                        <p className="text-xs text-neutral-500">Rastreia conversões de Stories, Reels e Feed</p>
                      </div>
                    </div>
                    {pixelConfig.metaPixelId.trim() && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Configurado
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1.5">
                      ID do Conjunto de Dados / Pixel do Meta
                    </label>
                    <input
                      type="text"
                      id="meta-pixel-id-input"
                      placeholder="Ex: 1234567890123456"
                      value={pixelConfig.metaPixelId}
                      onChange={(e) => setPixelConfig({ ...pixelConfig, metaPixelId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                    />
                    <span className="text-[11px] text-neutral-500 text-neutral-500 mt-1 block">
                      Encontrado no <em>Gerenciador de Eventos da Meta &gt; Fontes de Dados</em>.
                    </span>
                  </div>
                </div>

                {/* Google Ads & Conversão */}
                <div className="p-4 rounded-xl bg-neutral-50 bg-neutral-50/50 border border-neutral-200 border-neutral-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        G
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 text-neutral-900">
                          Google Ads & Tag de Conversão
                        </h4>
                        <p className="text-xs text-neutral-500">Rastreia pesquisas no Google e visualizações do YouTube</p>
                      </div>
                    </div>
                    {pixelConfig.googleAdsId.trim() && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Configurado
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1.5">
                        ID da Tag do Google Ads
                      </label>
                      <input
                        type="text"
                        id="google-ads-id-input"
                        placeholder="Ex: AW-1234567890"
                        value={pixelConfig.googleAdsId}
                        onChange={(e) => setPixelConfig({ ...pixelConfig, googleAdsId: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 text-neutral-700 mb-1.5">
                        Rótulo de Conversão (Lead/Contato)
                      </label>
                      <input
                        type="text"
                        id="google-ads-label-input"
                        placeholder="Ex: AbCdEfGhIjKlMnOp"
                        value={pixelConfig.googleAdsConversionLabel}
                        onChange={(e) => setPixelConfig({ ...pixelConfig, googleAdsConversionLabel: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Google Analytics 4 & TikTok */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 bg-neutral-50/50 border border-neutral-200 border-neutral-200/60 space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 text-neutral-900 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#aa904f]" />
                      <span>Google Analytics 4 (GA4)</span>
                    </h4>
                    <input
                      type="text"
                      id="ga4-id-input"
                      placeholder="Ex: G-XXXXXXXXXX"
                      value={pixelConfig.ga4MeasurementId}
                      onChange={(e) => setPixelConfig({ ...pixelConfig, ga4MeasurementId: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 bg-neutral-50/50 border border-neutral-200 border-neutral-200/60 space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 text-neutral-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#aa904f]" />
                      <span>TikTok Pixel ID (Opcional)</span>
                    </h4>
                    <input
                      type="text"
                      id="tiktok-id-input"
                      placeholder="Ex: CXXXXXXXXXXXXXXXXX"
                      value={pixelConfig.tiktokPixelId}
                      onChange={(e) => setPixelConfig({ ...pixelConfig, tiktokPixelId: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 border-neutral-200 bg-white bg-white text-neutral-900 text-neutral-900 focus:ring-2 focus:ring-[#aa904f] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {savedSuccess && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        <Check className="w-3.5 h-3.5" /> Pixels salvos e injetados com sucesso!
                      </motion.span>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="btn-save-tracking-pixels"
                    className="flex items-center gap-2 bg-[#aa904f] hover:bg-[#967e3a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar & Ativar Pixels</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Test Conversions & Diagnostics Panel */}
          <div className="space-y-6">
            <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-[#aa904f]" />
                <span>Testador Interativo de Eventos</span>
              </h3>
              <p className="text-xs text-neutral-500 text-neutral-500">
                Envie eventos em tempo real para verificar os disparos no seu navegador.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTriggerTestEvent('Lead')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 border-neutral-200 bg-neutral-50 bg-neutral-50/40 hover:bg-neutral-100 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Disparar Evento: <strong>Lead (Orçamento)</strong></span>
                  </span>
                  {testEventSent === 'Lead' ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enviado
                    </span>
                  ) : (
                    <span className="text-[#aa904f] text-[11px]">Disparar &rarr;</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerTestEvent('WhatsAppClick')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 border-neutral-200 bg-neutral-50 bg-neutral-50/40 hover:bg-neutral-100 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Disparar Evento: <strong>Clique WhatsApp</strong></span>
                  </span>
                  {testEventSent === 'WhatsAppClick' ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enviado
                    </span>
                  ) : (
                    <span className="text-[#aa904f] text-[11px]">Disparar &rarr;</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerTestEvent('ViewContent')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 border-neutral-200 bg-neutral-50 bg-neutral-50/40 hover:bg-neutral-100 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>Disparar Evento: <strong>Ver Portfólio / Produtos</strong></span>
                  </span>
                  {testEventSent === 'ViewContent' ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enviado
                    </span>
                  ) : (
                    <span className="text-[#aa904f] text-[11px]">Disparar &rarr;</span>
                  )}
                </button>
              </div>

              {/* Real-time event monitor logs */}
              {testEventsLog.length > 0 && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Terminal className="w-3 h-3" /> Eventos Disparados Recentemente:
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {testEventsLog.map((ev, i) => (
                      <div key={i} className="text-[10px] text-neutral-400 border-l border-emerald-500 pl-2">
                        <span className="text-white font-bold">{ev.time}</span> &gt; <span className="text-amber-400">{ev.name}</span> (200 OK)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STRATEGY GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white bg-white border border-neutral-200 border-neutral-200 space-y-3">
            <h4 className="text-sm font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>Estratégia 1: Instagram Ads (Stories & Reels)</span>
            </h4>
            <p className="text-xs text-neutral-600 text-neutral-700 leading-relaxed">
              O Instagram é a rede onde os universitários e comissões passam mais tempo. Foque em anúncios verticais mostrando momentos de pico do baile (entrada triunfal, brinde com champanhe, show ao vivo e cenografia iluminada).
            </p>
            <ul className="text-xs text-neutral-500 space-y-1.5 pl-4 list-disc">
              <li><strong>Idade do público:</strong> 20 a 27 anos</li>
              <li><strong>Localização:</strong> Cidades das universidades e raio de 35km</li>
              <li><strong>Interesses:</strong> Ensino Superior, Medicina, Direito, Engenharia, Formatura</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white bg-white border border-neutral-200 border-neutral-200 space-y-3">
            <h4 className="text-sm font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Estratégia 2: Google Search Ads (Pesquisa de Alta Intenção)</span>
            </h4>
            <p className="text-xs text-neutral-600 text-neutral-700 leading-relaxed">
              Quando a comissão é eleita, a primeira atitude do presidente ou tesoureiro é pesquisar no Google por produtoras e empresas de formatura na região.
            </p>
            <ul className="text-xs text-neutral-500 space-y-1.5 pl-4 list-disc">
              <li><strong>Palavras-chave recomendadas:</strong> "produtora de formaturas", "empresa de baile de formatura", "formatura medicina ceara", "baile de gala formatura"</li>
              <li><strong>Extensões:</strong> Botão de WhatsApp e links diretos para o portfólio de fotos</li>
            </ul>
          </div>
        </div>
      )}

      {/* Pre-Upload Photo Preview & Optimization Modal */}
      <AnimatePresence>
        {showPreviewModal && pendingUploads.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 border-neutral-200 shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-200 border-neutral-200 flex items-center justify-between bg-neutral-50/70 bg-neutral-50/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#aa904f]/15 border border-[#aa904f]/30 flex items-center justify-center text-[#aa904f]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                      <span>Pré-visualização de Novas Fotos</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#aa904f] text-white font-black">
                        {pendingUploads.length} {pendingUploads.length === 1 ? 'foto' : 'fotos'}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Confira as fotos antes de confirmar o upload para o simulador e carrossel.
                    </p>
                  </div>
                </div>

                {!isProcessingPhotos && (
                  <button
                    type="button"
                    onClick={handleCancelPreviewModal}
                    className="w-8 h-8 rounded-full bg-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900 hover:text-neutral-900 flex items-center justify-center text-xs font-bold transition-all"
                    title="Cancelar upload"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
                {/* Large Preview View of the currently selected pending photo */}
                {pendingUploads[selectedPreviewIdx] && (
                  <div className="space-y-3">
                    <div className="relative aspect-video sm:aspect-16/9 bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200 border-neutral-200 flex items-center justify-center shadow-inner group">
                      <img
                        src={pendingUploads[selectedPreviewIdx].previewUrl}
                        alt={pendingUploads[selectedPreviewIdx].name}
                        className="w-full h-full object-contain"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold">
                          Foto {selectedPreviewIdx + 1} de {pendingUploads.length}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-[#aa904f] text-white text-[11px] font-extrabold shadow-sm">
                          {pendingUploads[selectedPreviewIdx].sizeFormatted}
                        </span>
                      </div>

                      {/* Quick Navigation in Large Preview */}
                      {pendingUploads.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewIdx(prev => prev <= 0 ? pendingUploads.length - 1 : prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-all"
                            title="Foto anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewIdx(prev => prev >= pendingUploads.length - 1 ? 0 : prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-all"
                            title="Próxima foto"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Editable Title for Active Photo */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs font-bold text-neutral-700 text-neutral-700 shrink-0">
                        Nome / Legenda da foto:
                      </label>
                      <input
                        type="text"
                        value={pendingUploads[selectedPreviewIdx].name}
                        disabled={isProcessingPhotos}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setPendingUploads(prev => prev.map((item, idx) => idx === selectedPreviewIdx ? { ...item, name: newName } : item));
                        }}
                        placeholder="Ex: Formatura Baile de Gala"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 border-neutral-200 bg-white bg-neutral-50 text-xs text-neutral-900 text-neutral-900 font-medium focus:ring-2 focus:ring-[#aa904f]/40 outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Thumbnails Strip with Remove Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-700 text-neutral-700">
                      Miniaturas Selecionadas ({pendingUploads.length}):
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Clique para ampliar ou no ✕ para remover
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1">
                    {pendingUploads.map((item, idx) => {
                      const isSelected = idx === selectedPreviewIdx;
                      return (
                        <div key={item.id} className="relative shrink-0 group">
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewIdx(idx)}
                            className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all block ${
                              isSelected
                                ? 'border-[#aa904f] ring-2 ring-[#aa904f]/40 scale-105 shadow-md'
                                : 'border-neutral-300 border-neutral-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-1">
                              <span className={`text-[8px] font-bold px-1 rounded-sm self-start leading-tight ${
                                isSelected ? 'bg-[#aa904f] text-white' : 'bg-black/60 text-neutral-300'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-[9px] font-semibold text-white truncate leading-tight">
                                {item.name}
                              </span>
                            </div>

                            {/* Processing / Done Indicator Overlay on thumbnail */}
                            {item.status === 'processing' && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-[#aa904f] animate-spin" />
                              </div>
                            )}
                            {item.status === 'done' && (
                              <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              </div>
                            )}
                          </button>

                          {/* Delete Item Button from staging */}
                          {!isProcessingPhotos && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePendingItem(idx);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-md transition-transform active:scale-90"
                              title="Remover esta foto"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Destination Choice for Carousel & Ads */}
                <div className="p-3.5 rounded-2xl bg-neutral-100 bg-neutral-50/80 border border-neutral-200 border-neutral-200 space-y-2.5">
                  <span className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    O que deseja fazer com {pendingUploads.length > 1 ? 'estas fotos' : 'esta foto'} no simulador?
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {pendingUploads.length > 1 && (
                      <button
                        type="button"
                        disabled={isProcessingPhotos}
                        onClick={() => setCarouselActionChoice('create_new_carousel')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          carouselActionChoice === 'create_new_carousel'
                            ? 'border-[#aa904f] bg-[#aa904f]/15 text-[#aa904f] font-bold shadow-xs'
                            : 'border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Montar Carrossel</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          Cria {pendingUploads.length} slides ordenados no carrossel
                        </p>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isProcessingPhotos}
                      onClick={() => setCarouselActionChoice('replace_active_slide')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        carouselActionChoice === 'replace_active_slide'
                          ? 'border-[#aa904f] bg-[#aa904f]/15 text-[#aa904f] font-bold shadow-xs'
                          : 'border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Target className="w-3.5 h-3.5" />
                        <span>Aplicar no Slide Atual</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        Substitui o Slide {activeCarouselSlideIdx + 1} ativo
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPhotos}
                      onClick={() => setCarouselActionChoice('add_to_gallery')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        carouselActionChoice === 'add_to_gallery'
                          ? 'border-[#aa904f] bg-[#aa904f]/15 text-[#aa904f] font-bold shadow-xs'
                          : 'border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Apenas Galeria</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        Salva para usar quando quiser
                      </p>
                    </button>
                  </div>
                </div>

                {/* Real-time Progress Bar & Status Indicator (Visible during processing) */}
                {isProcessingPhotos && (
                  <div className="p-4 rounded-2xl bg-[#aa904f]/10 border border-[#aa904f]/30 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-900 text-neutral-900">
                      <span className="flex items-center gap-2 text-[#aa904f]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{activeUploadStepText || 'Otimizando fotos em HD...'}</span>
                      </span>
                      <span className="font-mono text-[#aa904f] font-extrabold">{uploadProgress}%</span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2.5 rounded-full bg-neutral-200 bg-neutral-50 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#aa904f] via-[#c4aa63] to-[#aa904f] rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.3 }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                      <span>✓ Resolução HD ajustada</span>
                      <span>✓ Compressão sem perda de nitidez</span>
                      <span>✓ Pronto para tráfego pago</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 border-t border-neutral-200 border-neutral-200 bg-neutral-50/70 bg-neutral-50/40 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCancelPreviewModal}
                  disabled={isProcessingPhotos}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 border-neutral-200 hover:bg-neutral-200 hover:bg-neutral-100 text-neutral-700 text-neutral-700 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={isProcessingPhotos || pendingUploads.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#aa904f] to-[#967e3a] hover:from-[#967e3a] hover:to-[#826d32] text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingPhotos ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando ({uploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar e Enviar ({pendingUploads.length} {pendingUploads.length === 1 ? 'foto' : 'fotos'})</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      {selectedQrCodeItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200 border-neutral-200 shadow-2xl text-center space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-900 text-neutral-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#aa904f]" />
                <span>QR Code de Campanha</span>
              </h4>
              <button
                onClick={() => setSelectedQrCodeItem(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-bold"
              >
                Fechar ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Imprima este QR Code em banners, folders ou estandes de faculdade. O rastreamento UTM será registrado automaticamente.
            </p>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQrCodeItem.fullUrl)}`}
                alt="QR Code da Campanha"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="text-xs font-mono text-neutral-500 break-all p-2 bg-neutral-100 bg-neutral-50 rounded-xl">
              {selectedQrCodeItem.name}
            </div>

            <button
              onClick={() => handleCopyLink(selectedQrCodeItem.id, selectedQrCodeItem.fullUrl)}
              className="w-full py-2.5 rounded-xl bg-[#aa904f] hover:bg-[#967e3a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Link do QR Code</span>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
