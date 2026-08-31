import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Vote, 
  Image as ImageIcon, 
  Megaphone, 
  LogOut, 
  FileText, 
  CreditCard, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles,
  Compass, 
  User, 
  Building, 
  Plus, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Heart, 
  MessageSquare,
  AlertTriangle,
  Package,
  Download,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Minus,
  ShoppingCart,
  Bell,
  Smartphone,
  Send,
  Trash2,
  Settings,
  CheckCircle,
  Volume2,
  VolumeX,
  Folder,
  FolderOpen,
  Library,
  Images,
  Pin,
  Video,
  Upload,
  ShieldCheck,
  FileCheck,
  PenTool,
  Printer,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { Formando, Turma, Parcela, Evento, Enquete, Foto, Album, MuralItem, Pacote, Depoimento, PushDevice, SystemNotification, Reuniao, TurmaMessage, PaymentGatewayConfig } from '../types';
import Logo from './Logo';
import BlurUpImage from './BlurUpImage';
import TurmaChat from './TurmaChat';
import { IntegratedMonthlyCalendar } from './IntegratedMonthlyCalendar';
import { StudentWelcomeTour, TourStep } from './StudentWelcomeTour';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { requestNotificationPermission, getFCMToken, generateSimulatedToken } from '../lib/messaging';
import { compressImageFile } from '../lib/imageOptimizer';

interface StudentPortalProps {
  currentStudent: Formando;
  turmas: Turma[];
  parcelas: Parcela[];
  eventos: Evento[];
  enquetes: Enquete[];
  albums?: Album[];
  fotos: Foto[];
  mural: MuralItem[];
  formandos: Formando[];
  pacotes: Pacote[];
  depoimentos?: Depoimento[];
  notifications?: SystemNotification[];
  pushTokens?: PushDevice[];
  reunioes?: Reuniao[];
  turmaMessages?: TurmaMessage[];
  gatewayConfig?: PaymentGatewayConfig;
  onUpdateState: (newState: {
    parcelas: Parcela[];
    enquetes: Enquete[];
    albums?: Album[];
    fotos: Foto[];
    mural: MuralItem[];
    formandos: Formando[];
    pacotes?: Pacote[];
    depoimentos?: Depoimento[];
    notifications?: SystemNotification[];
    pushTokens?: PushDevice[];
    turmaMessages?: TurmaMessage[];
    gatewayConfig?: PaymentGatewayConfig;
  }) => void;
  onLogout: () => void;
}

export default function StudentPortal({
  currentStudent,
  turmas,
  parcelas,
  eventos,
  enquetes,
  albums = [],
  fotos,
  mural,
  formandos,
  pacotes,
  depoimentos = [],
  notifications = [],
  pushTokens = [],
  reunioes = [],
  turmaMessages = [],
  gatewayConfig,
  onUpdateState,
  onLogout
}: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<'mural' | 'chat' | 'financeiro' | 'cronograma' | 'enquetes' | 'galeria' | 'comissao' | 'depoimentos' | 'notifications' | 'contratos'>('mural');
  const [cronogramaViewMode, setCronogramaViewMode] = useState<'cards' | 'calendar'>('calendar');
  
  // Welcome Tour State for Student Portal (First-time auto-trigger & manual button)
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    const tourKey = "wm2_has_completed_student_tour_" + currentStudent.id;
    try {
      const hasSeenTour = localStorage.getItem(tourKey);
      if (!hasSeenTour) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage error reading tour preference', e);
    }
  }, [currentStudent.id]);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    try {
      localStorage.setItem("wm2_has_completed_student_tour_" + currentStudent.id, 'true');
    } catch (e) {
      console.warn('LocalStorage error writing tour preference', e);
    }
  };

  const handleStartTourManual = () => {
    setIsTourOpen(true);
  };

  const handleTourStepChange = (_index: number, step: TourStep) => {
    if (step.targetId === 'tour-tab-mural') setActiveTab('mural');
    else if (step.targetId === 'tour-tab-financeiro') setActiveTab('financeiro');
    else if (step.targetId === 'tour-tab-contratos') setActiveTab('contratos');
    else if (step.targetId === 'tour-tab-cronograma') setActiveTab('cronograma');
    else if (step.targetId === 'tour-tab-chat') setActiveTab('chat');
    else if (step.targetId === 'tour-tab-galeria') setActiveTab('galeria');
    else if (step.targetId === 'tour-profile-card') setActiveTab('mural');
  };

  
  // Student Password Change State
  const [isChangeStudentPassOpen, setIsChangeStudentPassOpen] = useState(false);
  const [newStudentPass, setNewStudentPass] = useState('');
  const [confirmStudentPass, setConfirmStudentPass] = useState('');
  const [changeStudentPassMsg, setChangeStudentPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleStudentPasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentPass.trim()) {
      setChangeStudentPassMsg({ text: 'Por favor, digite a nova senha.', type: 'error' });
      return;
    }
    if (newStudentPass.trim().length < 4) {
      setChangeStudentPassMsg({ text: 'A senha deve ter pelo menos 4 caracteres.', type: 'error' });
      return;
    }
    if (newStudentPass.trim() !== confirmStudentPass.trim()) {
      setChangeStudentPassMsg({ text: 'As senhas digitadas não coincidem.', type: 'error' });
      return;
    }

    // Save student password to localStorage
    localStorage.setItem(`wm2_student_pass_${currentStudent.id}`, newStudentPass.trim());

    // Update in formandos list if possible
    const updatedFormandos = formandos.map(f => f.id === currentStudent.id ? { ...f, password: newStudentPass.trim() } : f);
    onUpdateState({
      parcelas,
      enquetes,
      albums,
      fotos,
      mural,
      formandos: updatedFormandos,
      pacotes,
      depoimentos,
      notifications,
      pushTokens
    });

    setChangeStudentPassMsg({ text: 'Senha alterada com sucesso!', type: 'success' });
    setTimeout(() => {
      setIsChangeStudentPassOpen(false);
      setNewStudentPass('');
      setConfirmStudentPass('');
      setChangeStudentPassMsg(null);
    }, 1500);
  };
  
  // Contracts and Digital Signatures for current student
  const [studentContracts, setStudentContracts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('wm2_student_contracts');
      let list = saved ? JSON.parse(saved) : [];
      let userContracts = list.filter((c: any) => c.studentId === currentStudent.id);
      
      if (userContracts.length === 0) {
        const defaultContract = {
          id: `contract-default-${currentStudent.id}`,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          title: 'Contrato Oficial de Adesão e Prestação de Serviços de Formatura',
          content: `CONTRATO DE ADESÃO E PRESTAÇÃO DE SERVIÇOS DE FORMATURA

CONTRATADA:
WM2 PRODUÇÕES & EVENTOS LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 12.345.678/0001-99, com sede na Alameda dos Eventos, nº 1000, São Paulo/SP.

CONTRATANTE:
${currentStudent.name}, pessoa física, inscrito(a) no CPF sob o nº ${currentStudent.cpf || '000.000.000-00'}, e-mail ${currentStudent.email || 'aluno@email.com'}, telefone ${currentStudent.phone || '(00) 00000-0000'}, residente e domiciliado(a) em ${currentStudent.address || 'Endereço não informado'}, portador(a) do código de aluno nº ${currentStudent.studentCode || 'WM2-ALUNO'}.

DADOS DA TURMA E INSTITUIÇÃO:
Turma ${studentTurma ? studentTurma.name : 'Formatura'}, referente à instituição de ensino ${studentTurma ? studentTurma.institution : 'Faculdade'}, ano ${studentTurma ? studentTurma.year : 2026} e sob o Contrato Geral de Turma nº ${studentTurma ? studentTurma.contractNumber : 'WM2-2026'}.

CLÁUSULA PRIMEIRA - DO OBJETO
O presente instrumento tem por objeto a prestação de serviços de planejamento, organização, produção e execução dos eventos festivos de formatura da turma, contemplando o pacote individual selecionado pelo(a) CONTRATANTE (${currentStudent.packageSelected || 'Pacote Completo'}).

CLÁUSULA SEGUNDA - DO VALOR E CONDIÇÕES DE PAGAMENTO
Pela prestação dos serviços objeto deste contrato, o(a) CONTRATANTE pagará à CONTRATADA o valor total de R$ ${(currentStudent.totalDue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, conforme plano financeiro acordado no Portal do Formando.

CLÁUSULA TERCEIRA - DA ASSINATURA ELETRÔNICA
As partes reconhecem a veracidade, autenticidade e validade jurídica deste contrato firmado mediante assinatura eletrônica na plataforma WM2 DocEngine, com registro de IP e hash criptográfico de segurança.`,
          templateId: 'wm2_adesao',
          theme: 'wm2_gold',
          totalDue: currentStudent.totalDue || 0,
          sentAt: new Date().toISOString(),
          status: 'Pendente'
        };
        
        list = [defaultContract, ...list];
        localStorage.setItem('wm2_student_contracts', JSON.stringify(list));
        userContracts = [defaultContract];
      }
      return userContracts;
    } catch {
      return [];
    }
  });

  const [selectedContractId, setSelectedContractId] = useState<string>('');

  useEffect(() => {
    if (studentContracts.length > 0 && !selectedContractId) {
      setSelectedContractId(studentContracts[0].id);
    }
  }, [studentContracts, selectedContractId]);

  const activeContract = studentContracts.find(c => c.id === selectedContractId) || studentContracts[0];

  // Signature state
  const [signatureMode, setSignatureMode] = useState<'type' | 'draw'>('type');
  const [typedSignature, setTypedSignature] = useState(currentStudent.name);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureSuccess, setSignatureSuccess] = useState(false);

  // Drawing canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasCanvasDrawn, setHasCanvasDrawn] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasCanvasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b18';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasCanvasDrawn(false);
  };

  const handleSignContract = () => {
    if (!activeContract) return;
    if (!agreedTerms) {
      alert('Você precisa aceitar a declaração de concordância antes de assinar.');
      return;
    }
    if (signatureMode === 'type' && !typedSignature.trim()) {
      alert('Por favor, digite seu nome completo para a assinatura eletrônica.');
      return;
    }
    if (signatureMode === 'draw' && !hasCanvasDrawn) {
      alert('Por favor, desenhe sua assinatura no quadro antes de confirmar.');
      return;
    }

    setIsSigning(true);

    let sigImage = '';
    if (signatureMode === 'draw' && canvasRef.current) {
      sigImage = canvasRef.current.toDataURL();
    }

    const signedAt = new Date().toLocaleString('pt-BR');
    const signedHash = `HASH-WM2-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const mockIp = '189.120.45.12';

    setTimeout(() => {
      const updatedContracts = studentContracts.map(c => {
        if (c.id === activeContract.id) {
          return {
            ...c,
            status: 'Assinado',
            signedAt,
            signedHash,
            signedIp: mockIp,
            signatureText: typedSignature || currentStudent.name,
            signatureImage: sigImage,
            signatureMode,
            isNewSignature: true
          };
        }
        return c;
      });

      setStudentContracts(updatedContracts);

      try {
        const savedAll = localStorage.getItem('wm2_student_contracts');
        const parsedAll = savedAll ? JSON.parse(savedAll) : [];
        const otherStudentsContracts = parsedAll.filter((c: any) => c.studentId !== currentStudent.id);
        const merged = [...updatedContracts, ...otherStudentsContracts];
        localStorage.setItem('wm2_student_contracts', JSON.stringify(merged));

        // Create internal admin alert notification
        const savedAdminNotifs = localStorage.getItem('wm2_admin_notifications');
        const parsedAdminNotifs = savedAdminNotifs ? JSON.parse(savedAdminNotifs) : [];
        const newNotif = {
          id: `notif-contract-${Date.now()}`,
          title: 'Novo Contrato Assinado! 📜✨',
          body: `O(A) formando(a) ${currentStudent.name} assinou digitalmente o contrato "${activeContract.title}".`,
          category: 'contrato',
          studentName: currentStudent.name,
          studentId: currentStudent.id,
          date: new Date().toISOString(),
          read: false
        };
        localStorage.setItem('wm2_admin_notifications', JSON.stringify([newNotif, ...parsedAdminNotifs]));
      } catch (e) {
        console.error(e);
      }

      setIsSigning(false);
      setSignatureSuccess(true);
      setTimeout(() => setSignatureSuccess(false), 5000);
    }, 1200);
  };
  
  // Load and synchronize read status for notifications
  const [readMuralIds, setReadMuralIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`wm2_read_mural_${currentStudent.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [readEventIds, setReadEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`wm2_read_eventos_${currentStudent.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`wm2_read_notif_${currentStudent.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sound enabled
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active toast for real-time in-app push simulations
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; body: string; category: string } | null>(null);

  // Keep track of shown notification IDs in current session to prevent double toasts
  const shownNotifIds = useRef<Set<string>>(new Set());

  // Elegant chime sound using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.08); // G5
      oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.16); // C6
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.55);
    } catch (err) {
      console.warn("Could not play notification sound:", err);
    }
  };

  // Real-time Push Delivery Effect
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    
    // Find notifications for this user that are not yet marked as read
    const userNotifs = notifications.filter(n => 
      (n.targetTurmaId === 'all' || n.targetTurmaId === currentStudent.turmaId) &&
      !readNotificationIds.includes(n.id)
    );

    if (userNotifs.length === 0) return;

    // Get the latest notification
    const latest = userNotifs[userNotifs.length - 1];

    // If it hasn't been shown in this session yet, show it!
    if (!shownNotifIds.current.has(latest.id)) {
      shownNotifIds.current.add(latest.id);
      
      // Only show toast if the message is fresh (e.g. within 30 seconds of loading or created in real-time)
      const isRecent = (Date.now() - new Date(latest.date).getTime()) < 24 * 60 * 60 * 1000; // Let's show it if it's new
      
      if (isRecent) {
        setActiveToast({
          id: latest.id,
          title: latest.title,
          body: latest.body,
          category: latest.category
        });
        playChime();
      }
    }
  }, [notifications, readNotificationIds]);
  
  // States for simulate payment
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  const [paymentType, setPaymentType] = useState<'pix' | 'boleto' | 'whatsapp' | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // States for buying extra invites (Gala)
  const [isBuyingExtra, setIsBuyingExtra] = useState(false);
  const [extraQty, setExtraQty] = useState(1);
  const [extraPayType, setExtraPayType] = useState<'pix' | 'boleto' | null>(null);
  const [extraPaySuccess, setExtraPaySuccess] = useState(false);

  // States for guest list management
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestCpf, setNewGuestCpf] = useState('');
  const [guestListFeedback, setGuestListFeedback] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // States for comments and likes
  const [newCommentText, setNewCommentText] = useState<{ [fotoId: string]: string }>({});
  const [muralCommentsText, setMuralCommentsText] = useState<{ [muralId: string]: string }>({});

  // Commission controls state
  const [newMuralTitle, setNewMuralTitle] = useState('');
  const [newMuralContent, setNewMuralContent] = useState('');
  const [newMuralCategory, setNewMuralCategory] = useState<'Geral' | 'Financeiro' | 'Evento' | 'Aviso Importante'>('Geral');
  const [newMuralImage, setNewMuralImage] = useState<string>('');
  const [isNewMuralDragging, setIsNewMuralDragging] = useState(false);
  const [newMuralPinned, setNewMuralPinned] = useState(false);
  const [newMuralSuccess, setNewMuralSuccess] = useState(false);

  const [newEnqueteQuestion, setNewEnqueteQuestion] = useState('');
  const [newEnqueteOptions, setNewEnqueteOptions] = useState<string[]>(['', '']);
  const [newEnqueteSuccess, setNewEnqueteSuccess] = useState(false);

  // Gallery view states
  const [galleryViewMode, setGalleryViewMode] = useState<'albums' | 'carousel' | 'grid'>('albums');
  const [selectedAlbumName, setSelectedAlbumName] = useState<string | null>(null);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Depoimentos state
  const [newDepoimentoText, setNewDepoimentoText] = useState('');
  const [depoimentoSearch, setDepoimentoSearch] = useState('');
  const [depoimentoSuccess, setDepoimentoSuccess] = useState(false);

  // Retrieve current student's turma
  const studentTurma = turmas.find(t => t.id === currentStudent.turmaId) || turmas[0];

  // Check if extra invite purchase is locked due to starting date
  const isExtraInviteLocked = () => {
    if (!studentTurma?.extraInviteStartDate) return false;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localTodayStr = `${year}-${month}-${day}`;
    return studentTurma.extraInviteStartDate > localTodayStr;
  };

  // Filter lists by student's class (turma)
  const studentParcelas = parcelas.filter(p => p.formandoId === currentStudent.id).sort((a,b) => a.number - b.number);

  // Helper to detect parcel due status
  const getParcelaStatus = (dueDateStr: string, status: string) => {
    if (status === 'Paga') return { type: 'normal', days: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = dueDateStr.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 || status === 'Atrasada') {
      return { type: 'overdue', days: Math.abs(diffDays) };
    } else if (diffDays <= 10) { // Let's alert within 10 days!
      return { type: 'due_soon', days: diffDays };
    }
    return { type: 'normal', days: diffDays };
  };

  // Urgent pending installments (< 7 days or overdue) for visual alerts
  const urgentParcelas = studentParcelas.filter(p => {
    if (p.status === 'Paga') return false;
    const statusInfo = getParcelaStatus(p.dueDate, p.status);
    return statusInfo.type === 'overdue' || (statusInfo.type === 'due_soon' && statusInfo.days <= 7);
  });
  const urgentParcelasCount = urgentParcelas.length;
  const studentEventos = eventos.filter(e => e.turmaId === currentStudent.turmaId);
  const studentEnquetes = enquetes.filter(e => e.turmaId === currentStudent.turmaId);
  const studentTurmaMessages = (turmaMessages || []).filter(m => m.turmaId === currentStudent.turmaId);
  const studentFotos = fotos.filter(f => 
    f.turmaId === currentStudent.turmaId && 
    (!f.formandoId || f.formandoId === currentStudent.id)
  );

  // Group student photos into Albums by album folder or eventName
  const albumsGrouped = React.useMemo(() => {
    const map: { [key: string]: { name: string; coverUrl?: string; photos: Foto[] } } = {};

    studentFotos.forEach(photo => {
      let albumName = 'Fotos da Turma';
      let albumKey = 'uncategorized';
      let coverUrl: string | undefined = undefined;

      if (photo.albumId) {
        const albumObj = (albums || []).find(a => a.id === photo.albumId);
        if (albumObj) {
          albumKey = albumObj.id;
          albumName = albumObj.name;
          coverUrl = albumObj.coverUrl;
        } else {
          albumName = photo.eventName?.trim() || 'Sessão de Fotos';
          albumKey = albumName;
        }
      } else if (photo.eventName) {
        albumName = photo.eventName.trim();
        albumKey = albumName;
      }

      if (!map[albumKey]) {
        map[albumKey] = { name: albumName, coverUrl, photos: [] };
      }
      map[albumKey].photos.push(photo);
    });

    return Object.entries(map).map(([key, data]) => ({
      key,
      name: data.name,
      photos: data.photos,
      coverPhoto: data.coverUrl ? ({ url: data.coverUrl } as Foto) : data.photos[0],
      previewPhotos: data.photos.slice(0, 4),
      count: data.photos.length,
      hasExclusive: data.photos.some(p => !!p.formandoId),
      totalLikes: data.photos.reduce((acc, p) => acc + (p.likes || 0), 0),
      totalComments: data.photos.reduce((acc, p) => acc + (p.comments?.length || 0), 0),
    }));
  }, [studentFotos, albums]);

  // Photos to display based on selected album filter
  const activeDisplayPhotos = React.useMemo(() => {
    if (!selectedAlbumName) return studentFotos;
    const albumGroup = albumsGrouped.find(a => a.name === selectedAlbumName || a.key === selectedAlbumName);
    if (albumGroup) return albumGroup.photos;
    return studentFotos.filter(p => (p.eventName?.trim() || 'Álbum da Turma') === selectedAlbumName);
  }, [studentFotos, selectedAlbumName, albumsGrouped]);
  const studentMural = mural
    .filter(m => m.turmaId === currentStudent.turmaId || m.turmaId === 'all')
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id);
    });
  const turmaStudents = formandos.filter(f => f.turmaId === currentStudent.turmaId);

  const unreadMuralCount = studentMural.filter(m => !readMuralIds.includes(m.id)).length;
  const unreadEventosCount = studentEventos.filter(e => !readEventIds.includes(e.id)).length;

  const studentNotifications = (notifications || []).filter(n => n.targetTurmaId === 'all' || n.targetTurmaId === currentStudent.turmaId);
  const unreadNotificationsCount = studentNotifications.filter(n => !readNotificationIds.includes(n.id)).length;
  const unsignedContractsCount = studentContracts.filter(c => c.status === 'Pendente').length;

  useEffect(() => {
    if (activeTab === 'notifications' && studentNotifications.length > 0) {
      const notifIds = studentNotifications.map(n => n.id);
      const hasNew = notifIds.some(id => !readNotificationIds.includes(id));
      if (hasNew) {
        const uniqueIds = Array.from(new Set([...readNotificationIds, ...notifIds]));
        setReadNotificationIds(uniqueIds);
        localStorage.setItem(`wm2_read_notif_${currentStudent.id}`, JSON.stringify(uniqueIds));
      }
    }
  }, [activeTab, studentNotifications, readNotificationIds, currentStudent.id]);

  useEffect(() => {
    if (activeTab === 'mural' && studentMural.length > 0) {
      const muralIds = studentMural.map(m => m.id);
      const hasNew = muralIds.some(id => !readMuralIds.includes(id));
      if (hasNew) {
        const uniqueIds = Array.from(new Set([...readMuralIds, ...muralIds]));
        setReadMuralIds(uniqueIds);
        localStorage.setItem(`wm2_read_mural_${currentStudent.id}`, JSON.stringify(uniqueIds));
      }
    }
  }, [activeTab, studentMural, readMuralIds, currentStudent.id]);

  useEffect(() => {
    if (activeTab === 'cronograma' && studentEventos.length > 0) {
      const eventIds = studentEventos.map(e => e.id);
      const hasNew = eventIds.some(id => !readEventIds.includes(id));
      if (hasNew) {
        const uniqueIds = Array.from(new Set([...readEventIds, ...eventIds]));
        setReadEventIds(uniqueIds);
        localStorage.setItem(`wm2_read_eventos_${currentStudent.id}`, JSON.stringify(uniqueIds));
      }
    }
  }, [activeTab, studentEventos, readEventIds, currentStudent.id]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setLightboxZoom(1);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev === null || prev <= 0 ? studentFotos.length - 1 : prev - 1));
        setLightboxZoom(1);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev === null || prev >= studentFotos.length - 1 ? 0 : prev + 1));
        setLightboxZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, studentFotos.length]);

  const handleGuestListFileUpload = (file: File) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileUploadError('O arquivo deve ter no máximo 10MB.');
      return;
    }

    // Validate file extension
    const allowedExtensions = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.txt', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setFileUploadError('Formato inválido. Envie PDF, Excel, Word ou arquivo de texto.');
      return;
    }

    setFileUploading(true);
    setFileUploadProgress(0);
    setFileUploadError(null);

    const storageRef = ref(storage, `listas_convidados/${currentStudent.id}_${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setFileUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading guest list file:', error);
        setFileUploadError('Falha ao enviar arquivo. Tente novamente.');
        setFileUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          const updatedFormandos = formandos.map(f => {
            if (f.id === currentStudent.id) {
              return { 
                ...f, 
                guestListFile: {
                  url: downloadUrl,
                  name: file.name,
                  uploadedAt: new Date().toISOString()
                }
              };
            }
            return f;
          });

          onUpdateState({
            formandos: updatedFormandos,
            parcelas,
            enquetes,
            fotos,
            mural
          });

          setFileUploading(false);
          setFileUploadProgress(100);
          setGuestListFeedback('Arquivo de lista final enviado com sucesso!');
          setTimeout(() => setGuestListFeedback(null), 3000);
        } catch (err) {
          console.error('Error getting download URL:', err);
          setFileUploadError('Erro ao finalizar o envio do arquivo.');
          setFileUploading(false);
        }
      }
    );
  };

  const handleRemoveGuestListFile = () => {
    const updatedFormandos = formandos.map(f => {
      if (f.id === currentStudent.id) {
        const updated = { ...f };
        delete updated.guestListFile;
        return updated;
      }
      return f;
    });

    onUpdateState({
      formandos: updatedFormandos,
      parcelas,
      enquetes,
      fotos,
      mural
    });

    setFileUploadProgress(0);
    setGuestListFeedback('Arquivo de lista removido.');
    setTimeout(() => setGuestListFeedback(null), 3000);
  };

  // Copy Pix code or Boleto key
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Process payment simulation
  const handleConfirmPayment = () => {
    if (!selectedParcela) return;

    // Update the paid installment
    const updatedParcelas = parcelas.map(p => {
      if (p.id === selectedParcela.id) {
        return {
          ...p,
          status: 'Paga' as const,
          payDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });

    // Update totalPaid in student profile
    const updatedFormandos = formandos.map(f => {
      if (f.id === currentStudent.id) {
        return {
          ...f,
          totalPaid: f.totalPaid + selectedParcela.value,
          status: 'Ativo' as const // Restore active status if they pay up
        };
      }
      return f;
    });

    onUpdateState({
      parcelas: updatedParcelas,
      formandos: updatedFormandos,
      enquetes,
      fotos,
      mural
    });

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedParcela(null);
      setPaymentType(null);
    }, 3000);
  };

  // Process extra invites payment simulation
  const handleConfirmExtraInvitesPayment = () => {
    const costPerInvite = studentTurma && studentTurma.extraInvitePrice !== undefined ? studentTurma.extraInvitePrice : 150;
    const totalCost = extraQty * costPerInvite;

    // Update the student profile: increase extraInvites, totalPaid, totalDue
    const updatedFormandos = formandos.map(f => {
      if (f.id === currentStudent.id) {
        return {
          ...f,
          extraInvites: (f.extraInvites || 0) + extraQty,
          totalPaid: f.totalPaid + totalCost,
          totalDue: f.totalDue + totalCost
        };
      }
      return f;
    });

    // Create a new paid installment for this transaction
    const newParcelaId = `p-extra-${currentStudent.id}-${Date.now()}`;
    const nextParcelaNum = (parcelas.filter(p => p.formandoId === currentStudent.id).length) + 1;
    const newParcela: Parcela = {
      id: newParcelaId,
      formandoId: currentStudent.id,
      number: nextParcelaNum,
      value: totalCost,
      dueDate: new Date().toISOString().split('T')[0],
      payDate: new Date().toISOString().split('T')[0],
      status: 'Paga' as const,
      type: extraPayType === 'pix' ? 'Pix' : 'Boleto'
    };

    const updatedParcelas = [...parcelas, newParcela];

    onUpdateState({
      parcelas: updatedParcelas,
      formandos: updatedFormandos,
      enquetes,
      fotos,
      mural
    });

    setExtraPaySuccess(true);
    setTimeout(() => {
      setExtraPaySuccess(false);
      setIsBuyingExtra(false);
      setExtraQty(1);
      setExtraPayType(null);
    }, 4000);
  };

  // Submit vote in poll
  const handleVote = (enqueteId: string, optionIndex: number) => {
    const updatedEnquetes = enquetes.map(enq => {
      if (enq.id === enqueteId) {
        const updatedOptions = [...enq.options];
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          votes: updatedOptions[optionIndex].votes + 1
        };
        return {
          ...enq,
          options: updatedOptions,
          votedStudentIds: [...enq.votedStudentIds, currentStudent.id]
        };
      }
      return enq;
    });

    onUpdateState({
      parcelas,
      formandos,
      enquetes: updatedEnquetes,
      fotos,
      mural
    });
  };

  // Download photo function
  const handleDownloadPhoto = async (url: string, eventName: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Falha ao baixar imagem via CORS');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${eventName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: opens the photo URL in a new tab so they can right-click and save
      console.warn("Direct download failed, opening in new tab:", error);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${eventName.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Like photo
  const handleLikePhoto = (fotoId: string) => {
    const updatedFotos = fotos.map(f => {
      if (f.id === fotoId) {
        return {
          ...f,
          likes: f.likes + 1
        };
      }
      return f;
    });

    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos: updatedFotos,
      mural
    });
  };

  // Add comment to photo
  const handleAddComment = (fotoId: string) => {
    const commentText = newCommentText[fotoId];
    if (!commentText || commentText.trim() === '') return;

    const updatedFotos = fotos.map(f => {
      if (f.id === fotoId) {
        return {
          ...f,
          comments: [
            ...f.comments,
            {
              author: currentStudent.name,
              text: commentText,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return f;
    });

    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos: updatedFotos,
      mural
    });

    setNewCommentText(prev => ({
      ...prev,
      [fotoId]: ''
    }));
  };

  // Add testimonial (Depoimento)
  const handleAddDepoimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepoimentoText.trim()) return;

    const newDep: Depoimento = {
      id: `dep-${Date.now()}`,
      turmaId: currentStudent.turmaId,
      formandoId: currentStudent.id,
      authorName: currentStudent.name,
      text: newDepoimentoText.trim(),
      date: new Date().toISOString().split('T')[0],
      approved: true
    };

    const updatedDepoimentos = [newDep, ...depoimentos];
    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos,
      mural,
      depoimentos: updatedDepoimentos
    });

    setNewDepoimentoText('');
    setDepoimentoSuccess(true);
    setTimeout(() => setDepoimentoSuccess(false), 3000);
  };

  // Delete testimonial (Depoimento)
  const handleDeleteDepoimento = (id: string) => {
    const updatedDepoimentos = depoimentos.filter(d => d.id !== id);
    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos,
      mural,
      depoimentos: updatedDepoimentos
    });
  };

  // Create notice (Commission feature)
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuralTitle || !newMuralContent) return;

    const newItem: MuralItem = {
      id: `mural-${Date.now()}`,
      turmaId: currentStudent.turmaId,
      title: newMuralTitle,
      content: newMuralContent,
      author: `Comissão (${currentStudent.name})`,
      date: new Date().toISOString().split('T')[0],
      category: newMuralCategory,
      imageUrl: newMuralImage || undefined,
      pinned: newMuralPinned
    };

    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos,
      mural: [newItem, ...mural]
    });

    setNewMuralTitle('');
    setNewMuralContent('');
    setNewMuralImage('');
    setNewMuralPinned(false);
    setNewMuralSuccess(true);
    setTimeout(() => setNewMuralSuccess(false), 3000);
  };

  const handleAddMuralComment = (muralId: string) => {
    const text = muralCommentsText[muralId]?.trim();
    if (!text) return;

    const updatedMural = mural.map(item => {
      if (item.id === muralId) {
        const existingComments = item.comments || [];
        const newComment = {
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          author: currentStudent.role === 'comissao' ? `Comissão (${currentStudent.name})` : currentStudent.name,
          text,
          date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...item,
          comments: [...existingComments, newComment]
        };
      }
      return item;
    });

    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos,
      mural: updatedMural,
      pacotes,
      depoimentos,
      notifications,
      pushTokens
    });

    setMuralCommentsText(prev => ({ ...prev, [muralId]: '' }));
  };

  const handleDeleteMuralComment = (muralId: string, commentId: string) => {
    const updatedMural = mural.map(item => {
      if (item.id === muralId) {
        const existingComments = item.comments || [];
        return {
          ...item,
          comments: existingComments.filter(c => c.id !== commentId)
        };
      }
      return item;
    });

    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos,
      mural: updatedMural,
      pacotes,
      depoimentos,
      notifications,
      pushTokens
    });
  };

  const handleTogglePinMuralItem = (itemId: string) => {
    const updatedMural = mural.map(item => {
      if (item.id === itemId) {
        return { ...item, pinned: !item.pinned };
      }
      return item;
    });

    onUpdateState({
      parcelas,
      formandos,
      enquetes,
      fotos,
      mural: updatedMural,
      pacotes,
      depoimentos,
      notifications,
      pushTokens,
      turmaMessages
    });
  };

  // Turma Chat Handlers
  const handleSendTurmaMessage = (msgData: Omit<TurmaMessage, 'id' | 'createdAt'>) => {
    const newMsg: TurmaMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      reactions: {}
    };

    const updatedMessages = [...(turmaMessages || []), newMsg];
    onUpdateState({
      parcelas,
      enquetes,
      albums,
      fotos,
      mural,
      formandos,
      pacotes,
      depoimentos,
      notifications,
      pushTokens,
      turmaMessages: updatedMessages
    });
  };

  const handleDeleteTurmaMessage = (messageId: string) => {
    const updatedMessages = (turmaMessages || []).filter(m => m.id !== messageId);
    onUpdateState({
      parcelas,
      enquetes,
      albums,
      fotos,
      mural,
      formandos,
      pacotes,
      depoimentos,
      notifications,
      pushTokens,
      turmaMessages: updatedMessages
    });
  };

  const handleTogglePinTurmaMessage = (messageId: string) => {
    const updatedMessages = (turmaMessages || []).map(m => {
      if (m.id === messageId) {
        return { ...m, pinned: !m.pinned };
      }
      return m;
    });
    onUpdateState({
      parcelas,
      enquetes,
      albums,
      fotos,
      mural,
      formandos,
      pacotes,
      depoimentos,
      notifications,
      pushTokens,
      turmaMessages: updatedMessages
    });
  };

  const handleToggleReactionTurmaMessage = (messageId: string, emoji: string) => {
    const updatedMessages = (turmaMessages || []).map(m => {
      if (m.id === messageId) {
        const reactions = { ...(m.reactions || {}) };
        const currentList = reactions[emoji] || [];
        const studentName = currentStudent.name;

        if (currentList.includes(studentName)) {
          reactions[emoji] = currentList.filter(n => n !== studentName);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji] = [...currentList, studentName];
        }

        return { ...m, reactions };
      }
      return m;
    });

    onUpdateState({
      parcelas,
      enquetes,
      albums,
      fotos,
      mural,
      formandos,
      pacotes,
      depoimentos,
      notifications,
      pushTokens,
      turmaMessages: updatedMessages
    });
  };

  const handleUpdateStatusTurmaMessage = (messageId: string, status: 'Pendente' | 'Respondida' | 'Em Análise', statusNote?: string) => {
    const updatedMessages = (turmaMessages || []).map(m => {
      if (m.id === messageId) {
        return { ...m, status, statusNote: statusNote || m.statusNote };
      }
      return m;
    });
    onUpdateState({
      parcelas,
      enquetes,
      albums,
      fotos,
      mural,
      formandos,
      pacotes,
      depoimentos,
      notifications,
      pushTokens,
      turmaMessages: updatedMessages
    });
  };

  // Create poll (Commission feature)
  const handleCreateEnquete = (e: React.FormEvent) => {
    e.preventDefault();
    const filledOptions = newEnqueteOptions.filter(opt => opt.trim() !== '');
    if (!newEnqueteQuestion || filledOptions.length < 2) return;

    const newPoll: Enquete = {
      id: `enq-${Date.now()}`,
      turmaId: currentStudent.turmaId,
      question: newEnqueteQuestion,
      options: filledOptions.map(opt => ({ text: opt, votes: 0 })),
      createdBy: 'Comissão de Formatura',
      endDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0], // 15 days from now
      active: true,
      votedStudentIds: []
    };

    onUpdateState({
      parcelas,
      formandos,
      enquetes: [newPoll, ...enquetes],
      fotos,
      mural
    });

    setNewEnqueteQuestion('');
    setNewEnqueteOptions(['', '']);
    setNewEnqueteSuccess(true);
    setTimeout(() => setNewEnqueteSuccess(false), 3000);
  };

  // Add poll option input
  const handleAddEnqueteOptionInput = () => {
    if (newEnqueteOptions.length < 6) {
      setNewEnqueteOptions([...newEnqueteOptions, '']);
    }
  };

  // Update poll option text
  const handleUpdateOptionText = (index: number, text: string) => {
    const updated = [...newEnqueteOptions];
    updated[index] = text;
    setNewEnqueteOptions(updated);
  };

  // Calculate global statistics for commission
  const totalTurmaGoalPaid = studentTurma.packagePrice * studentTurma.totalStudents;
  const currentTurmaTotalCollected = turmaStudents.reduce((acc, current) => acc + current.totalPaid, 0);
  const collectionPercentage = totalTurmaGoalPaid > 0 ? (currentTurmaTotalCollected / totalTurmaGoalPaid) * 100 : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-white text-neutral-800 dark:text-neutral-900 font-sans transition-colors pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] border-b border-[#aa904f]/40 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo className="w-32" showSubtitle={true} variant="dark" />
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-neutral-900/80 font-bold uppercase">Área do Formando</div>
              <div className="text-neutral-950 text-sm font-black flex items-center gap-1.5 justify-end">
                <User className="w-3.5 h-3.5 text-neutral-950" />
                {currentStudent.name}
                {currentStudent.role === 'comissao' && (
                  <span className="bg-[#705510] text-[#ebe0b2] text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase shadow-xs">
                    Comissão
                  </span>
                )}
              </div>
              <div className="text-[10px] text-neutral-900/80 font-semibold text-right">
                {studentTurma.name}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartTourManual}
                className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] px-3 py-2 rounded-lg transition-colors border border-[#aa904f]/40 flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer"
                title="Iniciar Tour de Boas-Vindas pelo Portal"
              >
                <Compass className="w-3.5 h-3.5 text-[#dfd1a1]" />
                <span className="hidden sm:inline">Tour Guiado</span>
              </button>
              <button
                onClick={() => {
                  setIsChangeStudentPassOpen(true);
                  setNewStudentPass('');
                  setConfirmStudentPass('');
                  setChangeStudentPassMsg(null);
                }}
                className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] px-3 py-2 rounded-lg transition-colors border border-[#aa904f]/40 flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer"
                title="Alterar Minha Senha de Acesso"
              >
                <Key className="w-3.5 h-3.5 text-[#dfd1a1]" /> Senha
              </button>
              
              <button
                onClick={onLogout}
                className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] px-3 py-2 rounded-lg transition-colors border border-[#aa904f]/40 flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer"
                title="Sair do Portal"
              >
                <LogOut className="w-4 h-4 text-rose-300" /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Nav Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Profile Card Summary & Highlights */}
        <div id="tour-profile-card" className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl p-6 shadow-sm mb-8 text-[#543d03]">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-8 flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
              <div className="w-16 h-16 bg-gradient-to-r from-[#543d03] to-[#705510] rounded-full flex items-center justify-center text-[#ebe0b2] font-bold text-xl shadow-inner">
                {currentStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#3c2a01] flex items-center gap-2 justify-center sm:justify-start">
                  Seja bem-vindo, {currentStudent.name.split(' ')[0]}!
                </h2>
                <p className="text-xs text-[#543d03]/80 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <Building className="w-3.5 h-3.5 text-[#705510]" /> {studentTurma.institution} • {studentTurma.location}
                </p>
                <div className="text-xs text-[#543d03]/80 mt-1 font-mono flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                  <span>Código de Acesso: <strong className="text-[#3c2a01] bg-white/60 px-1.5 py-0.5 rounded border border-amber-900/10">{currentStudent.studentCode || 'MED-ANA-123'}</strong></span>
                  <span>CPF: <strong className="text-[#3c2a01]">{currentStudent.cpf || '123.456.789-00'}</strong></span>
                </div>
                {currentStudent.address && (
                  <p className="text-xs text-[#543d03]/80 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-[#705510]" /> <span className="font-medium">Endereço:</span> {currentStudent.address}
                  </p>
                )}
                <div className="mt-2.5 flex justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangeStudentPassOpen(true);
                      setNewStudentPass('');
                      setConfirmStudentPass('');
                      setChangeStudentPassMsg(null);
                    }}
                    className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#aa904f]/40 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-[#dfd1a1]" /> Alterar Minha Senha
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-amber-900/20 pt-4 md:pt-0 md:pl-6 flex flex-col gap-2">
              <div className="text-xs text-[#543d03]/80 font-semibold uppercase tracking-wider">Seu Pacote Selecionado:</div>
              <div className="bg-white/40 p-3 rounded-xl border border-amber-900/10 text-sm">
                <div className="font-bold text-[#3c2a01] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#705510]" />
                  {currentStudent.packageSelected}
                </div>
                <div className="text-[10px] text-[#543d03]/70 mt-1">
                  Valor total contratado: {currentStudent.totalDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

          </div>
        </div>



        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-6 overflow-x-auto gap-1 no-scrollbar">
          {[
            { id: 'mural', label: 'Mural & Avisos', icon: Megaphone, badgeCount: unreadMuralCount },
            { id: 'chat', label: 'Chat da Turma', icon: MessageSquare, badgeCount: studentTurmaMessages.length > 0 ? studentTurmaMessages.length : undefined },
            { id: 'contratos', label: 'Contratos & Assinatura', icon: FileCheck, badgeCount: unsignedContractsCount > 0 ? unsignedContractsCount : undefined },
            { id: 'notifications', label: 'Notificações Push', icon: Bell, badgeCount: unreadNotificationsCount },
            { id: 'financeiro', label: 'Financeiro', icon: DollarSign, badgeCount: urgentParcelasCount > 0 ? urgentParcelasCount : undefined },
            { id: 'cronograma', label: 'Cronograma', icon: Calendar, badgeCount: unreadEventosCount },
            { id: 'enquetes', label: 'Opiniões e Votações', icon: Vote },
            { id: 'galeria', label: 'Galeria de Fotos', icon: ImageIcon },
            { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquare },
            ...(currentStudent.role === 'comissao' ? [{ id: 'comissao', label: 'Painel da Comissão', icon: TrendingUp }] : [])
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={"tour-tab-" + tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'border-[#aa904f] text-[#aa904f] bg-[#aa904f]/5 rounded-t-lg'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="bg-[#aa904f] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse shrink-0 shadow-xs">
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div>

          {/* CONTRATOS & ASSINATURA TAB */}
          {activeTab === 'contratos' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 p-6 rounded-2xl text-white shadow-lg border border-[#aa904f]/40">
                <div>
                  <h3 className="text-xl font-extrabold text-[#ffe29a] flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-[#aa904f]" />
                    Contratos e Assinatura Eletrônica (WM2 DocEngine)
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
                    Consulte as cláusulas contratuais da sua formatura e assine digitalmente com total legalidade, autenticação e validação criptográfica de segurança.
                  </p>
                </div>
                
                {unsignedContractsCount > 0 ? (
                  <div className="bg-amber-500/20 border border-amber-400/50 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse shrink-0">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    {unsignedContractsCount} Contrato(s) Pendente(s) de Assinatura
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Todos os contratos estão assinados
                  </div>
                )}
              </div>

              {/* CONTRACT SELECTOR TABS IF MULTIPLE */}
              {studentContracts.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
                  {studentContracts.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedContractId(c.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeContract?.id === c.id
                          ? 'bg-[#705510] text-[#ebe0b2] shadow-md'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      {c.title}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black ${
                        c.status === 'Assinado' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeContract ? (
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT: FULL DOCUMENT VIEW (7 COLS) */}
                  <div className="lg:col-span-7 bg-white dark:bg-white text-neutral-900 border-2 border-[#aa904f]/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
                    
                    {/* Header Logo */}
                    <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                      <Logo variant="dark" className="w-32" showSubtitle={true} />
                      <div className="text-right text-[11px] text-neutral-500 font-mono">
                        <div>REF: {activeContract.id}</div>
                        <div>DATA: {new Date(activeContract.sentAt || Date.now()).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center space-y-1">
                      <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight">
                        {activeContract.title}
                      </h2>
                      <div className="text-xs font-semibold text-[#aa904f] uppercase tracking-widest">
                        WM2 Produções & Eventos • Instrumento de Contratação
                      </div>
                    </div>

                    {/* Scrollable Document Text */}
                    <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 font-serif text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
                      {activeContract.content}
                    </div>

                    {/* Electronic Seal if Signed */}
                    {activeContract.status === 'Assinado' && (
                      <div className="bg-emerald-50 border-2 border-emerald-500/60 rounded-2xl p-5 text-emerald-950 space-y-3">
                        <div className="flex items-center gap-2.5 text-emerald-800 font-black text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          SELO DE AUTENTICIDADE E ASSINATURA DIGITAL WM2
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-emerald-900">
                          <div><strong>Assinado por:</strong> {activeContract.signatureText || currentStudent.name}</div>
                          <div><strong>CPF:</strong> {currentStudent.cpf || '000.000.000-00'}</div>
                          <div><strong>Data e Hora:</strong> {activeContract.signedAt}</div>
                          <div><strong>Endereço IP:</strong> {activeContract.signedIp || '189.120.45.12'}</div>
                          <div className="sm:col-span-2 text-ellipsis overflow-hidden">
                            <strong>Hash de Validação:</strong> <span className="bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950 font-bold">{activeContract.signedHash}</span>
                          </div>
                        </div>

                        {activeContract.signatureImage && (
                          <div className="pt-2 border-t border-emerald-300">
                            <span className="text-[10px] text-emerald-700 font-sans uppercase font-bold">Assinatura Grafotécnica Registrada:</span>
                            <div className="mt-1 bg-white p-2 rounded-lg border border-emerald-200 inline-block">
                              <img src={activeContract.signatureImage} alt="Assinatura" className="max-h-16 h-auto" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200">
                      <button
                        onClick={() => window.print()}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-neutral-300"
                      >
                        <Printer className="w-4 h-4 text-neutral-600" /> Imprimir / PDF
                      </button>
                      
                      {activeContract.status === 'Assinado' && (
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Lock className="w-4 h-4" /> Documento Registrado e Válido
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT: SIGNATURE ACTION PANEL (5 COLS) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {activeContract.status === 'Pendente' ? (
                      <div className="bg-white dark:bg-white border-2 border-[#aa904f] rounded-2xl p-6 shadow-xl text-neutral-900 space-y-5">
                        
                        <div className="border-b border-neutral-200 pb-3">
                          <h4 className="font-extrabold text-base text-neutral-900 flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-[#aa904f]" />
                            Assinatura Eletrônica do Formando
                          </h4>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Escolha como deseja assinar e confirme sua concordância.
                          </p>
                        </div>

                        {/* Mode selector */}
                        <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                          <button
                            onClick={() => setSignatureMode('type')}
                            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              signatureMode === 'type' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500'
                            }`}
                          >
                            <PenTool className="w-3.5 h-3.5" /> Digitar Nome
                          </button>
                          <button
                            onClick={() => setSignatureMode('draw')}
                            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              signatureMode === 'draw' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-500'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Desenhar na Tela
                          </button>
                        </div>

                        {/* Mode Type Input */}
                        {signatureMode === 'type' && (
                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-neutral-700">
                              Nome Completo para Assinatura:
                            </label>
                            <input
                              type="text"
                              value={typedSignature}
                              onChange={e => setTypedSignature(e.target.value)}
                              placeholder="Digite seu nome completo..."
                              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#aa904f]"
                            />
                            
                            {/* Cursive preview box */}
                            {typedSignature.trim() && (
                              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl text-center">
                                <span className="text-[10px] text-amber-800 font-bold uppercase block mb-1">Prévia da Assinatura Gerada:</span>
                                <span className="font-serif italic text-2xl text-neutral-800 tracking-wider">
                                  {typedSignature}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Mode Draw Canvas */}
                        {signatureMode === 'draw' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-xs font-bold text-neutral-700">
                                Desenhe com o mouse ou toque:
                              </label>
                              <button
                                onClick={clearCanvas}
                                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Limpar
                              </button>
                            </div>

                            <div className="border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden relative touch-none">
                              <canvas
                                ref={canvasRef}
                                width={380}
                                height={140}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-36 cursor-crosshair block"
                              />
                              {!hasCanvasDrawn && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-neutral-400 font-medium">
                                  Assine aqui dentro...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Terms checkbox */}
                        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="agreeContractTerms"
                            checked={agreedTerms}
                            onChange={e => setAgreedTerms(e.target.checked)}
                            className="mt-0.5 rounded text-[#aa904f] focus:ring-[#aa904f] w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="agreeContractTerms" className="text-xs text-neutral-700 leading-snug cursor-pointer font-medium">
                            Li e concordo integralmente com os termos e cláusulas deste contrato. Confirmo minha assinatura eletrônica nos termos da MP nº 2.200-2/2001.
                          </label>
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleSignContract}
                          disabled={isSigning}
                          className="w-full bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#aa904f] hover:brightness-105 text-neutral-950 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSigning ? (
                            <>
                              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                              Registrando Assinatura Eletrônica...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-5 h-5 text-neutral-950" />
                              Assinar Eletronicamente Agora
                            </>
                          )}
                        </button>

                        {signatureSuccess && (
                          <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Contrato assinado com sucesso e registrado no sistema!
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="bg-emerald-900 text-white border-2 border-emerald-500/80 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-300">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-emerald-200">
                            Contrato Concluído e Assinado!
                          </h4>
                          <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                            Seu contrato foi assinado eletronicamente e possui validade jurídica integral. Uma cópia está guardada e disponível para você a qualquer momento neste portal.
                          </p>
                        </div>

                        <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-700/60 text-xs space-y-1.5 font-mono">
                          <div className="text-emerald-400 font-bold uppercase text-[10px]">Resumo do Registro:</div>
                          <div>Status: <span className="text-emerald-300 font-bold">ASSINADO E CONFIRMADO</span></div>
                          <div>Data: {activeContract.signedAt}</div>
                          <div>Hash: {activeContract.signedHash}</div>
                        </div>
                      </div>
                    )}

                    {/* Legal Info Box */}
                    <div className="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-neutral-800 dark:text-neutral-800 space-y-2">
                      <h5 className="font-bold text-xs text-[#705510] uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-4 h-4" /> Segurança e Validade Jurídica
                      </h5>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        A assinatura eletrônica na plataforma WM2 é amparada pela Medida Provisória nº 2.200-2/2001 e pela Lei nº 14.063/2020, garantindo autenticidade, integridade e não repúdio ao documento assinado.
                      </p>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 text-neutral-500">
                  Nenhum contrato encontrado para este formando.
                </div>
              )}

            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#aa904f]" />
                    Central de Notificações Push (FCM)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Ative e gerencie seus dispositivos registrados no Firebase Cloud Messaging para receber avisos de boletos e mural.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#dfd1a1]/10 px-3 py-1.5 rounded-xl border border-[#aa904f]/25">
                  <span className="text-xs font-semibold text-neutral-600">Efeitos Sonoros:</span>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      if (!soundEnabled) {
                        setTimeout(() => playChime(), 100);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${soundEnabled ? 'bg-[#705510] text-[#ebe0b2]' : 'bg-neutral-200 text-neutral-500'}`}
                    title={soundEnabled ? "Desativar som" : "Ativar som"}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Device Registration & Push Info (Left) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#ebe0b2]/40 dark:bg-[#ebe0b2]/20 border border-[#d2c595]/50 rounded-xl p-5 text-[#543d03]">
                    <h4 className="font-bold text-sm text-[#3c2a01] mb-2 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      Status de Registro
                    </h4>
                    
                    <p className="text-xs text-[#543d03]/80 leading-relaxed mb-4">
                      O Firebase Cloud Messaging permite que a comissão de formatura envie alertas instantâneos diretamente para o seu celular ou computador, mesmo com o portal fechado.
                    </p>

                    <div className="space-y-3 mb-5">
                      <div className="bg-white/60 p-3 rounded-lg border border-[#d2c595]/30 text-xs flex justify-between items-center">
                        <span className="font-medium">Navegador Atual:</span>
                        <span className="font-mono bg-[#705510]/10 text-[#543d03] px-2 py-0.5 rounded text-[10px] font-bold">
                          {navigator.userAgent.includes('Chrome') ? 'Google Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Navegador Web'}
                        </span>
                      </div>
                      
                      <div className="bg-white/60 p-3 rounded-lg border border-[#d2c595]/30 text-xs flex justify-between items-center">
                        <span className="font-medium">Status da Permissão:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          'Notification' in window 
                            ? Notification.permission === 'granted' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : Notification.permission === 'denied'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                        }`}>
                          {'Notification' in window 
                            ? Notification.permission === 'granted' 
                              ? 'Autorizado' 
                              : Notification.permission === 'denied'
                                ? 'Negado'
                                : 'Pendente'
                            : 'Não Suportado'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={async () => {
                          const permission = await requestNotificationPermission();
                          if (permission === 'granted') {
                            const realToken = await getFCMToken();
                            const token = realToken || generateSimulatedToken(currentStudent.id);
                            
                            const newDevice: PushDevice = {
                              id: 'dev-' + Date.now(),
                              formandoId: currentStudent.id,
                              token: token,
                              browser: navigator.userAgent.includes('Chrome') ? 'Google Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Navegador Web',
                              date: new Date().toISOString().split('T')[0],
                              status: realToken ? 'Ativo' : 'Simulado'
                            };

                            if (pushTokens.some(t => t.formandoId === currentStudent.id && t.status === 'Simulado' && !realToken)) {
                              // If they already have a simulated token in state, play chime but don't duplicate
                              playChime();
                              return;
                            }

                            onUpdateState({
                              parcelas,
                              enquetes,
                              fotos,
                              mural,
                              formandos,
                              pacotes,
                              depoimentos,
                              notifications,
                              pushTokens: [...pushTokens, newDevice]
                            });
                            playChime();
                          } else {
                            alert('Permissão de notificações bloqueada pelo navegador. Ative nas configurações para receber os alertas.');
                          }
                        }}
                        className="w-full bg-[#705510] hover:bg-[#543d03] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Inscrever este Dispositivo
                      </button>

                      <button
                        onClick={() => {
                          const testNotif: SystemNotification = {
                            id: 'notif-test-' + Date.now(),
                            title: '🔔 Teste de Notificação FCM',
                            body: 'Olá! Suas notificações push via Firebase Cloud Messaging estão ativas e funcionando!',
                            date: new Date().toISOString(),
                            category: 'Geral',
                            targetTurmaId: currentStudent.turmaId,
                            readBy: []
                          };
                          onUpdateState({
                            parcelas,
                            enquetes,
                            fotos,
                            mural,
                            formandos,
                            pacotes,
                            depoimentos,
                            pushTokens,
                            notifications: [...(notifications || []), testNotif]
                          });
                        }}
                        className="w-full bg-white hover:bg-neutral-50 border border-[#d2c595] text-[#705510] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Enviar Notificação de Teste
                      </button>
                    </div>
                  </div>

                  {/* Device List */}
                  <div className="bg-[#ebe0b2]/40 dark:bg-[#ebe0b2]/20 border border-[#d2c595]/50 rounded-xl p-5 text-[#543d03]">
                    <h4 className="font-bold text-sm text-[#3c2a01] mb-3 flex items-center gap-1.5">
                      <Settings className="w-4 h-4" />
                      Seus Dispositivos Inscritos
                    </h4>

                    {pushTokens.filter(t => t.formandoId === currentStudent.id).length === 0 ? (
                      <div className="text-center py-4 text-xs text-neutral-500 font-medium">
                        Nenhum dispositivo registrado ainda. Clique em "Inscrever" para ativar as notificações.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {pushTokens.filter(t => t.formandoId === currentStudent.id).map(device => (
                          <div key={device.id} className="bg-white/70 p-3 rounded-lg border border-[#d2c595]/30 flex justify-between items-center gap-2">
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-[#3c2a01] flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-[#aa904f]" />
                                {device.browser}
                              </div>
                              <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[140px] mt-0.5">
                                {device.token}
                              </p>
                              <div className="flex gap-2.5 mt-1">
                                <span className={`text-[8px] font-extrabold uppercase px-1 rounded ${
                                  device.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {device.status === 'Ativo' ? 'FCM Real' : 'Simulação'}
                                </span>
                                <span className="text-[9px] text-neutral-400 font-medium">
                                  Reg: {device.date}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                onUpdateState({
                                  parcelas,
                                  enquetes,
                                  fotos,
                                  mural,
                                  formandos,
                                  pacotes,
                                  depoimentos,
                                  notifications,
                                  pushTokens: pushTokens.filter(t => t.id !== device.id)
                                });
                              }}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                              title="Desinscrever dispositivo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notifications Log (Right) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-[#ebe0b2]/40 dark:bg-[#ebe0b2]/20 border border-[#d2c595]/50 rounded-xl p-5 text-[#543d03]">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-sm text-[#3c2a01] flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#aa904f]" />
                        Histórico de Alertas Recebidos
                      </h4>
                      
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={() => {
                            const notifIds = studentNotifications.map(n => n.id);
                            setReadNotificationIds(notifIds);
                            localStorage.setItem(`wm2_read_notif_${currentStudent.id}`, JSON.stringify(notifIds));
                          }}
                          className="text-xs font-bold text-[#705510] hover:text-[#543d03] flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Marcar tudo como lido
                        </button>
                      )}
                    </div>

                    {studentNotifications.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500 text-sm">
                        <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-3 animate-bounce" />
                        Você não possui nenhuma notificação recebida ainda.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {studentNotifications.slice().reverse().map(notif => {
                          const isRead = readNotificationIds.includes(notif.id);
                          const tagColors = {
                            'Boleto': 'bg-rose-100 text-rose-800 border-rose-200',
                            'Mural': 'bg-blue-100 text-blue-800 border-blue-200',
                            'Geral': 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          };
                          
                          return (
                            <div 
                              key={notif.id}
                              onClick={() => {
                                if (!isRead) {
                                  const updatedIds = [...readNotificationIds, notif.id];
                                  setReadNotificationIds(updatedIds);
                                  localStorage.setItem(`wm2_read_notif_${currentStudent.id}`, JSON.stringify(updatedIds));
                                }
                              }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                isRead 
                                  ? 'bg-white/40 border-neutral-200 text-neutral-500' 
                                  : 'bg-white border-[#aa904f]/40 shadow-xs text-neutral-900 border-l-4 border-l-[#aa904f]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${tagColors[notif.category] || 'bg-neutral-100'}`}>
                                      {notif.category}
                                    </span>
                                    
                                    {!isRead && (
                                      <span className="bg-[#aa904f] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse">
                                        Nova
                                      </span>
                                    )}

                                    <span className="text-[10px] text-neutral-400 font-medium font-mono">
                                      {new Date(notif.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  <h5 className={`font-bold text-xs ${isRead ? 'text-neutral-700' : 'text-neutral-900'}`}>
                                    {notif.title}
                                  </h5>
                                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                    {notif.body}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* MURAL TAB */}
          {activeTab === 'mural' && (
            <div className="space-y-6">
              {/* Quick interactive chat banner */}
              <div className="bg-gradient-to-r from-[#705510] via-neutral-900 to-[#705510] text-white p-4 sm:p-5 rounded-2xl border border-[#aa904f]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[#ffe29a] shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#ffe29a] flex items-center gap-2">
                      Área de Comentários & Chat Interativo da Turma
                      <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Envie dúvidas, sugestões e receba comunicados oficiais da Comissão de Formatura em tempo real.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('chat')}
                  className="bg-gradient-to-r from-[#dfd1a1] to-[#aa904f] hover:brightness-105 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Acessar Chat da Turma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Mural de Avisos da Turma</h3>
                <span className="text-xs text-neutral-500 font-mono">Atualizado recentemente</span>
              </div>

              {studentMural.length === 0 ? (
                <div className="text-center py-12 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] text-stone-900 rounded-xl">
                  <Megaphone className="w-12 h-12 text-[#705510] mx-auto mb-3" />
                  <p className="text-stone-700 text-sm">Nenhum aviso no mural até o momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-12 gap-6">
                  {/* Announcement feeds */}
                  <div className="md:col-span-8 space-y-4">
                    {studentMural.map(item => {
                      const badgeColors = {
                        'Geral': 'bg-blue-100 text-blue-800 border-blue-200',
                        'Financeiro': 'bg-amber-100 text-amber-800 border-amber-200',
                        'Evento': 'bg-purple-100 text-purple-800 border-purple-200',
                        'Aviso Importante': 'bg-rose-100 text-rose-800 border-rose-200'
                      };

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-[#543d03] ${
                            item.pinned 
                              ? 'bg-[#f5ebd0] border-[#aa904f] ring-1 ring-[#aa904f]/20' 
                              : 'bg-[#ebe0b2] dark:bg-[#ebe0b2] border-[#d2c595]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              {item.pinned && (
                                <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs border border-amber-600">
                                  <Pin className="w-2.5 h-2.5 fill-white" /> FIXADO
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColors[item.category] || 'bg-white/50 text-[#543d03] border-[#d2c595]'}`}>
                                {item.category}
                              </span>
                              {!readMuralIds.includes(item.id) && (
                                <span className="bg-[#aa904f] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded animate-pulse uppercase tracking-wider shadow-xs">
                                  Novo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-[#543d03]/70 font-mono flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {item.date}
                              </span>
                              {currentStudent.role === 'comissao' && (
                                <button
                                  onClick={() => handleTogglePinMuralItem(item.id)}
                                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                                    item.pinned 
                                      ? 'text-amber-700 bg-amber-500/10 hover:bg-amber-500/20' 
                                      : 'text-[#543d03]/55 hover:text-amber-700 hover:bg-white/30'
                                  }`}
                                  title={item.pinned ? "Desafixar do Topo" : "Fixar no Topo"}
                                >
                                  <Pin className={`w-3.5 h-3.5 ${item.pinned ? 'fill-amber-600 text-amber-600' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                          <h4 className="text-base font-bold text-[#3c2a01] mb-2">{item.title}</h4>
                          <p className="text-[#543d03]/90 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
                          {item.imageUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-[#d2c595]/50 bg-white/20 max-h-96 flex items-center justify-center">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="w-full h-full object-cover max-h-96"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className="border-t border-[#d2c595]/50 mt-4 pt-3 flex items-center justify-between">
                            <span className="text-[10px] text-[#543d03]/70 font-medium">Publicado por:</span>
                            <span className="text-xs text-[#3c2a01] font-semibold">{item.author}</span>
                          </div>

                          {/* Seção de Comentários */}
                          <div className="mt-4 pt-4 border-t border-[#d2c595]/50 space-y-3">
                            <h5 className="text-xs font-bold text-[#3c2a01] flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-[#aa904f]" /> Comentários e Perguntas ({item.comments?.length || 0})
                            </h5>
                            
                            {/* Lista de Comentários */}
                            {item.comments && item.comments.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {item.comments.map(comment => {
                                  // Can delete if author is self or student is part of commission (comissão)
                                  const canDelete = comment.author === currentStudent.name || 
                                                    comment.author === `Comissão (${currentStudent.name})` || 
                                                    currentStudent.role === 'comissao';
                                  return (
                                    <div key={comment.id} className="bg-white/45 p-2 rounded-lg border border-[#d2c595]/30 text-xs flex justify-between items-start gap-2">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <span className="font-extrabold text-[#3c2a01] text-[10px]">{comment.author}</span>
                                          <span className="text-[9px] text-[#543d03]/60 font-mono">{comment.date}</span>
                                        </div>
                                        <p className="text-[#543d03] text-[11px] leading-snug whitespace-pre-line">{comment.text}</p>
                                      </div>
                                      {canDelete && (
                                        <button
                                          onClick={() => handleDeleteMuralComment(item.id, comment.id)}
                                          className="text-[#543d03]/50 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                                          title="Excluir Comentário"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[10px] text-[#543d03]/70 italic">Nenhum comentário ou dúvida neste aviso. Deixe sua pergunta abaixo!</p>
                            )}

                            {/* Formulário de Envio de Comentário */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={muralCommentsText[item.id] || ''}
                                onChange={(e) => setMuralCommentsText(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Escreva uma pergunta ou comentário..."
                                className="flex-1 bg-white/60 hover:bg-white/80 focus:bg-white text-xs text-[#3c2a01] px-3 py-1.5 rounded-lg border border-[#d2c595] focus:outline-none focus:ring-1 focus:ring-[#aa904f] placeholder-[#543d03]/50 transition-all"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddMuralComment(item.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddMuralComment(item.id)}
                                className="bg-[#543d03] hover:bg-[#3c2a01] text-white p-2 rounded-lg transition-colors cursor-pointer"
                                title="Enviar Comentário"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Sidebar stats/reminders */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="bg-gradient-to-br from-[#8d1811] to-[#3d0301] text-white p-5 rounded-2xl shadow-md border border-[#705510] relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-10">
                        <GraduationCap className="w-32 h-32" />
                      </div>
                      <h4 className="text-base font-bold text-[#dfd1a1] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Próximo Grande Evento
                      </h4>
                      {studentEventos.length > 0 ? (
                        <div>
                          <div className="text-lg font-bold text-white leading-tight">
                            {studentEventos[0].title}
                          </div>
                          <div className="text-xs text-slate-300 mt-2 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(studentEventos[0].date).toLocaleDateString('pt-BR')} às {studentEventos[0].time}
                          </div>
                          <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{studentEventos[0].venue}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">
                            {studentEventos[0].description}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300">Nenhum evento agendado ainda.</p>
                      )}
                    </div>

                    <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] p-5 rounded-xl text-[#543d03]">
                      <h4 className="text-xs font-bold text-[#705510] uppercase tracking-wider mb-3">Enquetes Pendentes</h4>
                      {studentEnquetes.filter(enq => enq.active && !enq.votedStudentIds.includes(currentStudent.id)).length > 0 ? (
                        <div className="space-y-3">
                          {studentEnquetes.filter(enq => enq.active && !enq.votedStudentIds.includes(currentStudent.id)).map(enq => (
                            <div key={enq.id} className="text-xs border-b border-[#d2c595]/50 pb-2 last:border-0 last:pb-0">
                              <p className="font-bold text-[#3c2a01] line-clamp-2">{enq.question}</p>
                              <button
                                onClick={() => setActiveTab('enquetes')}
                                className="text-[#8d1811] hover:underline font-semibold mt-1 flex items-center gap-0.5"
                              >
                                Votar agora <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#543d03]/70">Tudo em dia! Você já votou em todas as enquetes.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAT DA TURMA TAB */}
          {activeTab === 'chat' && (
            <TurmaChat
              currentStudent={currentStudent}
              turma={studentTurma}
              turmaMessages={turmaMessages || []}
              onSendMessage={handleSendTurmaMessage}
              onDeleteMessage={handleDeleteTurmaMessage}
              onTogglePin={handleTogglePinTurmaMessage}
              onToggleReaction={handleToggleReactionTurmaMessage}
              onUpdateStatus={handleUpdateStatusTurmaMessage}
            />
          )}

          {/* FINANCEIRO TAB */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Seu Extrato Financeiro</h3>

              {/* Stats highlights */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <div className="text-xs font-bold text-emerald-800 uppercase">Total Pago</div>
                  <div className="text-2xl font-extrabold text-[#3c2a01] mt-1">
                    {currentStudent.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-[10px] text-[#543d03]/70 mt-1">Acumulado desde a adesão</div>
                </div>

                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <div className="text-xs font-bold text-rose-800 uppercase">Restante a Pagar</div>
                  <div className="text-2xl font-extrabold text-[#3c2a01] mt-1">
                    {Math.max(0, currentStudent.totalDue - currentStudent.totalPaid).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-[10px] text-[#543d03]/70 mt-1">Saldo devedor contratado</div>
                </div>

                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <div className="text-xs font-bold text-[#705510] uppercase">Status Geral</div>
                  <div className="text-base font-bold mt-2 flex items-center gap-1.5">
                    {currentStudent.status === 'Ativo' ? (
                      <span className="text-emerald-700 text-xs font-bold">
                        Em Dia
                      </span>
                    ) : currentStudent.status === 'Pendente' ? (
                      <span className="text-amber-700 text-xs font-bold">
                        Pendente
                      </span>
                    ) : (
                      <span className="text-rose-700 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline" /> Atrasado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações do Pacote Escolhido */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-sm text-neutral-700 dark:text-neutral-300">
                <div className="grid md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Current Package details */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#aa904f] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Seu Pacote Ativo
                      </span>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {currentStudent.packageSelected || "Pacote Customizado"}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {(() => {
                        const studentPacotes = pacotes.filter(p => p.turmaId === currentStudent.turmaId);
                        if (!currentStudent.packageSelected) return "Seu pacote inclui a participação em todos os eventos oficiais da colação de grau e celebrações da turma gerenciados pela WM2 Produções.";
                        
                        const parts = currentStudent.packageSelected.split(" + ").map(s => s.trim());
                        const matchedPacotes = studentPacotes.filter(p => 
                          parts.some(part => 
                            p.name.toLowerCase() === part.toLowerCase() ||
                            part.toLowerCase().includes(p.name.toLowerCase()) ||
                            p.name.toLowerCase().includes(part.toLowerCase())
                          )
                        );
                        
                        if (matchedPacotes.length > 0) {
                          return matchedPacotes.map(p => p.description).join(" + ");
                        }
                        
                        return "Seu pacote inclui a participação em todos os eventos oficiais da colação de grau e celebrações da turma gerenciados pela WM2 Produções.";
                      })()}
                    </p>

                    {(() => {
                      const studentPacotes = pacotes.filter(p => p.turmaId === currentStudent.turmaId);
                      if (!currentStudent.packageSelected) {
                        return (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> Baile de Gala
                            </span>
                            <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> Colação de Grau
                            </span>
                            <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> Coquetel Oficial
                            </span>
                          </div>
                        );
                      }

                      const parts = currentStudent.packageSelected.split(" + ").map(s => s.trim());
                      const matchedPacotes = studentPacotes.filter(p => 
                        parts.some(part => 
                          p.name.toLowerCase() === part.toLowerCase() ||
                          part.toLowerCase().includes(p.name.toLowerCase()) ||
                          p.name.toLowerCase().includes(part.toLowerCase())
                        )
                      );

                      const allItems = Array.from(new Set(matchedPacotes.flatMap(p => p.items || [])));

                      if (allItems.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {allItems.map((item, idx) => (
                              <span key={idx} className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> {item}
                              </span>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> Baile de Gala
                          </span>
                          <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> Colação de Grau
                          </span>
                          <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] font-bold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#aa904f] rounded-full"></span> Coquetel Oficial
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Column: Other Available Packages */}
                  <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 pt-4 md:pt-0 md:pl-6 space-y-3">
                    <h5 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#aa904f]" /> Opções de Pacotes Disponíveis para a Turma
                    </h5>
                    
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {(() => {
                        const studentPacotes = pacotes.filter(p => p.turmaId === currentStudent.turmaId);
                        return studentPacotes.length === 0 ? (
                          <p className="text-[11px] text-neutral-400 italic">Nenhum pacote adicional cadastrado para esta turma pelo administrador.</p>
                        ) : (
                          studentPacotes.map(p => {
                            const isSelected = currentStudent.packageSelected?.split(" + ").some(part => 
                              part.trim().toLowerCase() === p.name.toLowerCase() ||
                              part.trim().toLowerCase().startsWith(p.name.toLowerCase()) ||
                              p.name.toLowerCase().startsWith(part.trim().toLowerCase())
                            );
                            return (
                              <div 
                                key={p.id} 
                                className={`p-3 rounded-lg border text-xs transition-all flex justify-between items-center ${isSelected ? 'bg-amber-500/5 dark:bg-amber-500/10 border-[#aa904f] ring-1 ring-[#aa904f]/20' : 'bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-neutral-900 dark:text-white text-xs">{p.name}</strong>
                                    {isSelected && (
                                      <span className="bg-[#aa904f] text-white text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">
                                        Atual
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{p.description}</p>
                                </div>
                                <div className="text-right pl-3 shrink-0">
                                  <span className="font-extrabold text-[#aa904f] text-xs block">
                                    {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Installment simulation area */}
              <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* List of installments */}
                <div className="lg:col-span-7 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl overflow-hidden shadow-sm text-[#543d03]">
                  <div className="bg-white/40 border-b border-[#d2c595] px-5 py-3.5 font-bold text-sm text-[#3c2a01]">
                    Parcelas do Contrato
                  </div>
                  <div className="divide-y divide-[#d2c595]/30">
                    {studentParcelas.map(parc => {
                      const statusInfo = getParcelaStatus(parc.dueDate, parc.status);
                      return (
                        <div
                          key={parc.id}
                          className={`p-4 flex items-center justify-between text-sm flex-wrap gap-2 transition-all ${
                            statusInfo.type === 'overdue' ? 'bg-rose-500/10 dark:bg-rose-950/20' :
                            statusInfo.type === 'due_soon' ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/50 border border-[#d2c595] flex items-center justify-center font-bold text-xs text-[#543d03]">
                              {parc.number}
                            </div>
                            <div>
                              <div className="font-bold text-[#3c2a01] flex items-center gap-2 flex-wrap">
                                <span>{parc.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                {statusInfo.type === 'overdue' && (
                                  <span className="bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/50 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" /> Vencida
                                  </span>
                                )}
                                {statusInfo.type === 'due_soon' && (
                                  <span className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-pulse" /> Vence em breve
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#543d03]/70 font-mono">
                                Vencimento: {new Date(parc.dueDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {parc.status === 'Paga' ? (
                              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 inline" /> Paga em {new Date(parc.payDate || '').toLocaleDateString('pt-BR')} ({parc.type})
                              </span>
                            ) : statusInfo.type === 'overdue' ? (
                              <span className="text-rose-700 text-xs font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600 inline" /> Atrasada ({statusInfo.days === 1 ? 'há 1 dia' : `há ${statusInfo.days} dias`})
                              </span>
                            ) : statusInfo.type === 'due_soon' ? (
                              <span className="text-amber-700 text-xs font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 inline" /> Vence em {statusInfo.days === 0 ? 'hoje' : statusInfo.days === 1 ? '1 dia' : `${statusInfo.days} dias`}
                              </span>
                            ) : (
                              <span className="text-amber-700 text-xs font-semibold">
                                A vencer
                              </span>
                            )}

                            {parc.status !== 'Paga' && (
                              <button
                                onClick={() => {
                                  setSelectedParcela(parc);
                                  setPaymentType(null);
                                  setPaymentSuccess(false);
                                }}
                                className="bg-[#543d03] hover:bg-[#3c2a01] text-white text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm cursor-pointer"
                              >
                                Pagar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulation panel */}
                <div className="lg:col-span-5 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <h4 className="text-sm font-bold text-[#3c2a01] uppercase tracking-wider mb-4 border-b border-[#d2c595] pb-2">
                    Simulador de Pagamentos WM2
                  </h4>

                  {selectedParcela ? (
                    <div>
                      {paymentSuccess ? (
                        <div className="text-center py-8 space-y-3">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                            ✓
                          </div>
                          <h5 className="font-bold text-[#3c2a01]">Pagamento Confirmado!</h5>
                          <p className="text-xs text-[#543d03]/70">
                            A parcela de {selectedParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi marcada como Paga com sucesso no banco de dados simulado.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-white/40 p-4 rounded-lg border border-[#d2c595]">
                            <div className="text-xs text-[#543d03]/70">Parcela selecionada:</div>
                            <div className="font-bold text-base text-[#3c2a01] mt-1">
                              Parcela nº {selectedParcela.number} - {selectedParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <div className="text-[10px] text-[#543d03]/60 mt-1">
                              Vencimento: {new Date(selectedParcela.dueDate).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {!paymentType ? (
                            <div className="space-y-2">
                              <p className="text-xs text-[#543d03]/80 font-medium">Escolha a forma de pagamento simulada:</p>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => setPaymentType('pix')}
                                  className="border border-[#d2c595] hover:border-[#705510] hover:bg-white/30 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all text-[#543d03] text-center"
                                >
                                  <Sparkles className="w-4 h-4 text-[#705510]" />
                                  <span className="text-[10px] font-bold leading-tight">Pix Copia/Cola</span>
                                </button>
                                <button
                                  onClick={() => setPaymentType('boleto')}
                                  className="border border-[#d2c595] hover:border-[#705510] hover:bg-white/30 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all text-[#543d03] text-center"
                                >
                                  <CreditCard className="w-4 h-4 text-[#705510]" />
                                  <span className="text-[10px] font-bold leading-tight">Boleto Bancário</span>
                                </button>
                                <button
                                  onClick={() => setPaymentType('whatsapp')}
                                  className="border border-[#d2c595] hover:border-emerald-600 hover:bg-emerald-50/25 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all text-[#543d03] text-center"
                                >
                                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                                  <span className="text-[10px] font-bold leading-tight text-emerald-800">WhatsApp Link</span>
                                </button>
                              </div>
                            </div>
                          ) : paymentType === 'pix' ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#3c2a01]">Pagamento via Pix:</p>
                                {selectedParcela.gatewayProvider === 'mercadopago' && (
                                  <span className="text-[9px] bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                                    Mercado Pago Integrado
                                  </span>
                                )}
                              </div>
                              
                              {/* Pix QR Code Display */}
                              <div className="bg-white p-2.5 border border-[#d2c595] rounded-xl w-36 h-36 mx-auto flex items-center justify-center shadow-sm">
                                {selectedParcela.pixQrCodeUrl ? (
                                  <img 
                                    src={selectedParcela.pixQrCodeUrl} 
                                    alt="QR Code Pix" 
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z" fill="#000" />
                                    <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z" fill="#000" />
                                    <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z" fill="#000" />
                                    <path d="M45,45 h10 v10 h-10 z" fill="#000" />
                                    <rect x="45" y="10" width="10" height="15" fill="#000" />
                                    <rect x="10" y="45" width="15" height="10" fill="#000" />
                                    <rect x="60" y="50" width="15" height="15" fill="#000" />
                                    <rect x="80" y="60" width="10" height="30" fill="#000" />
                                    <rect x="50" y="80" width="20" height="10" fill="#000" />
                                  </svg>
                                )}
                              </div>

                              <div className="bg-white/70 p-2.5 border border-[#d2c595] rounded-lg text-[11px] font-mono break-all flex justify-between items-center gap-2 text-[#543d03]">
                                <span className="truncate">{selectedParcela.pixCode || "00020101021126380014br.gov.pix0116wm2eventosformatura"}</span>
                                <button
                                  onClick={() => handleCopy(selectedParcela.pixCode || "00020101021126380014br.gov.pix0116wm2eventosformatura")}
                                  className="text-[#705510] hover:text-[#543d03] p-1 shrink-0 flex items-center gap-1 font-sans text-[10px] font-bold bg-white border border-[#d2c595]/50 px-2 py-0.5 rounded shadow-xs"
                                  title="Copiar Código Pix Copia e Cola"
                                >
                                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copiedText ? 'Copiado!' : 'Copiar'}
                                </button>
                              </div>

                              {selectedParcela.gatewayPaymentLink && (
                                <button
                                  onClick={() => window.open(selectedParcela.gatewayPaymentLink, '_blank')}
                                  className="w-full bg-[#009ee3] hover:bg-[#0081b8] text-white font-bold py-2 rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Abrir no App Mercado Pago
                                </button>
                              )}

                              <button
                                onClick={handleConfirmPayment}
                                className="w-full bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-md mt-2"
                              >
                                Confirmar Pagamento do Pix
                              </button>
                            </div>
                          ) : paymentType === 'boleto' ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#3c2a01]">Boleto Bancário:</p>
                                {selectedParcela.gatewayProvider === 'mercadopago' && (
                                  <span className="text-[9px] bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                                    Mercado Pago Integrado
                                  </span>
                                )}
                              </div>
                              
                              <div className="bg-white/60 p-3.5 border border-[#d2c595] rounded-xl text-center space-y-1.5 shadow-xs">
                                <span className="text-lg font-bold tracking-widest text-[#543d03] font-mono">|||| | | ||| || ||| |</span>
                                <div className="text-[10px] font-mono break-all font-semibold text-[#543d03]">
                                  {selectedParcela.boletoBarcode || "34191.79001 01043.513184 91020.150008 7 94220000120000"}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleCopy(selectedParcela.boletoBarcode || "34191.79001 01043.513184 91020.150008 7 94220000120000")}
                                  className="w-full border border-[#d2c595] bg-white/70 hover:bg-white text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-[#543d03] font-semibold"
                                >
                                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#705510]" />}
                                  Copiar Código de Barras
                                </button>

                                {selectedParcela.boletoPdfUrl ? (
                                  <button
                                    onClick={() => window.open(selectedParcela.boletoPdfUrl, '_blank')}
                                    className="w-full border border-sky-400 bg-sky-50 hover:bg-sky-100 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sky-800 font-semibold"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Baixar Boleto PDF
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCopy(selectedParcela.boletoBarcode || "34191.79001 01043.513184 91020.150008 7 94220000120000")}
                                    className="w-full border border-[#d2c595] bg-white/70 hover:bg-white text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-[#543d03] font-semibold"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#705510]" /> Imprimir Fatura
                                  </button>
                                )}
                              </div>

                              <button
                                onClick={handleConfirmPayment}
                                className="w-full bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-md mt-2"
                              >
                                Confirmar Pagamento de Boleto
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-[#3c2a01]">Cobrança via WhatsApp:</p>
                              
                              <div className="bg-emerald-500/5 border border-emerald-600/20 p-3 rounded-xl space-y-2 text-[#543d03] dark:text-emerald-100">
                                <div className="text-[11px] font-medium leading-relaxed text-neutral-700 dark:text-neutral-300">
                                  Será gerado um link do WhatsApp com mensagem pré-preenchida para a central de faturamento da <strong>WM2 Produções</strong> para receber ou validar sua parcela.
                                </div>
                                <div className="text-[10px] bg-white/50 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-[#d2c595]/30 max-h-32 overflow-y-auto font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-normal">
                                  {`Olá WM2 Produções!\n\nGostaria de solicitar ou registrar o pagamento da minha parcela de formatura:\n\n👤 Formando: ${currentStudent.name}\n📱 Celular: ${currentStudent.phone}\n🎓 Turma: ${studentTurma?.name || 'Não informada'}\n💳 Parcela: Nº ${selectedParcela.number}\n💰 Valor: ${selectedParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n📅 Vencimento: ${new Date(selectedParcela.dueDate).toLocaleDateString('pt-BR')}\n\nPor favor, me envie o link de pagamento ou confirme o recebimento.`}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    const valueFormatted = selectedParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                                    const dateFormatted = new Date(selectedParcela.dueDate).toLocaleDateString('pt-BR');
                                    const whatsappMsg = `Olá WM2 Produções!\n\nGostaria de solicitar ou registrar o pagamento da minha parcela de formatura:\n\n👤 *Formando:* ${currentStudent.name}\n📱 *Celular:* ${currentStudent.phone}\n🎓 *Turma:* ${studentTurma?.name || 'Não informada'}\n💳 *Parcela:* Nº ${selectedParcela.number}\n💰 *Valor:* ${valueFormatted}\n📅 *Vencimento:* ${dateFormatted}\n\nPor favor, me envie o link de pagamento ou confirme o recebimento.`;
                                    
                                    const encoded = encodeURIComponent(whatsappMsg);
                                    window.open(`https://api.whatsapp.com/send?phone=5511988887777&text=${encoded}`, '_blank');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Enviar WhatsApp
                                </button>

                                <button
                                  onClick={handleConfirmPayment}
                                  className="bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold py-2 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Confirmar Local
                                </button>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setSelectedParcela(null);
                              setPaymentType(null);
                            }}
                            className="w-full text-center text-xs text-neutral-500 hover:underline mt-2"
                          >
                            Voltar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <CreditCard className="w-10 h-10 text-[#705510]/50 mx-auto mb-2" />
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Selecione uma das parcelas em aberto na lista ao lado para simular o faturamento, copiar a chave Pix ou gerar a linha digitável do boleto.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CRONOGRAMA TAB */}
          {activeTab === 'cronograma' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#8d1811]" /> Calendário & Cronograma da Turma
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Acompanhe todas as datas de cerimoniais, reuniões da comissão e prazos da sua formatura.
                  </p>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setCronogramaViewMode('calendar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                      cronogramaViewMode === 'calendar'
                        ? 'bg-[#8d1811] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Calendário Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setCronogramaViewMode('cards')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                      cronogramaViewMode === 'cards'
                        ? 'bg-[#8d1811] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Cards Detalhados
                  </button>
                </div>
              </div>

              {cronogramaViewMode === 'calendar' ? (
                <IntegratedMonthlyCalendar
                  eventos={studentEventos}
                  reunioes={(reunioes || []).filter(r => r.turmaId === currentStudent.turmaId)}
                  turmas={turmas.filter(t => t.id === currentStudent.turmaId)}
                  currentTurmaId={currentStudent.turmaId}
                  isStudentView={true}
                />
              ) : studentEventos.length === 0 ? (
                <div className="text-center py-12 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] text-stone-900 rounded-xl">
                  <Calendar className="w-12 h-12 text-[#705510] mx-auto mb-3" />
                  <p className="text-stone-700 text-sm">Nenhum evento agendado até o momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {studentEventos.map(evt => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-[#543d03]"
                    >
                      <div className="bg-white/30 border-b border-[#d2c595] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#3c2a01] text-base">{evt.title}</h4>
                          {!readEventIds.includes(evt.id) && (
                            <span className="bg-[#aa904f] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded animate-pulse uppercase tracking-wider shadow-xs">
                              Novo
                            </span>
                          )}
                        </div>
                        <span className="bg-[#705510] text-[#ebe0b2] text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase shadow-xs border border-[#aa904f]/20">
                          WM2 Exclusivo
                        </span>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2 text-[#543d03]/90">
                            <Calendar className="w-4 h-4 text-[#705510] shrink-0" />
                            <div>
                              <div className="text-[10px] text-[#543d03]/60 uppercase font-semibold">Data</div>
                              <div className="font-bold">{new Date(evt.date).toLocaleDateString('pt-BR')}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[#543d03]/90">
                            <Clock className="w-4 h-4 text-[#705510] shrink-0" />
                            <div>
                              <div className="text-[10px] text-[#543d03]/60 uppercase font-semibold">Horário</div>
                              <div className="font-bold">{evt.time}h</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-[#543d03]/90">
                          <MapPin className="w-4 h-4 text-[#705510] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] text-[#543d03]/60 uppercase font-semibold">Local/Espaço</div>
                            <div className="font-semibold leading-normal">{evt.venue}</div>
                          </div>
                        </div>

                        <p className="text-xs text-[#543d03]/95 leading-relaxed border-t border-[#d2c595]/50 pt-3">
                          {evt.description}
                        </p>

                        {evt.title.toLowerCase().includes('baile') && (() => {
                          const studentPacotes = pacotes.filter(p => p.turmaId === currentStudent.turmaId);
                          const activePackage = studentPacotes.find(p => p.name === currentStudent.packageSelected);
                          
                          let packageInvites = 0;
                          if (activePackage) {
                            const baileItem = activePackage.items.find(item => {
                              const low = item.toLowerCase();
                              return low.includes("baile") || 
                                     low.includes("exib") || 
                                     low.includes("convit") || 
                                     low.includes("ingresso");
                            });
                            if (baileItem) {
                              const match = baileItem.match(/(\d+)/);
                              if (match) {
                                packageInvites = parseInt(match[1], 10);
                              }
                            }
                          } else {
                            if (currentStudent.packageSelected?.toLowerCase().includes("master")) {
                              packageInvites = 10;
                            } else if (currentStudent.packageSelected?.toLowerCase().includes("premium")) {
                              packageInvites = 8;
                            } else if (currentStudent.packageSelected?.toLowerCase().includes("executivo")) {
                              packageInvites = 5;
                            } else if (currentStudent.packageSelected?.toLowerCase().includes("básico") || currentStudent.packageSelected?.toLowerCase().includes("basico")) {
                              packageInvites = 5;
                            } else {
                              packageInvites = 5;
                            }
                          }
                          const extra = currentStudent.extraInvites || 0;
                          const total = packageInvites + extra;
                                   return (
                            <>
                              <div className="bg-white/60 border border-[#d2c595]/80 rounded-xl p-3.5 mt-3 space-y-2 text-[#543d03]">
                                <div className="flex items-center gap-1.5 border-b border-[#d2c595]/40 pb-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-[#8d1811]" />
                                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#3c2a01]">Seus Exibíveis de Direito (Convites do Baile)</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="bg-white/40 p-1.5 rounded border border-[#d2c595]/30">
                                    <div className="text-[9px] text-[#543d03]/70 font-semibold uppercase">No Pacote</div>
                                    <div className="text-sm font-black text-[#3c2a01] mt-0.5">{packageInvites}</div>
                                  </div>
                                  <div className="bg-white/40 p-1.5 rounded border border-[#d2c595]/30">
                                    <div className="text-[9px] text-[#543d03]/70 font-semibold uppercase">Extras</div>
                                    <div className="text-sm font-black text-[#3c2a01] mt-0.5">{extra}</div>
                                  </div>
                                  <div className="bg-gradient-to-br from-[#8d1811] to-[#3d0301] text-white p-1.5 rounded shadow-sm">
                                    <div className="text-[9px] text-white/80 font-bold uppercase">Total Geral</div>
                                    <div className="text-sm font-black text-white mt-0.5">{total}</div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-[#543d03]/80 italic text-center mt-1 font-medium">
                                  Cada exibível dá direito a 1 entrada exclusiva de convidado no Baile de Gala.
                                </p>

                                {/* Buy Extra Invites Section */}
                                {isExtraInviteLocked() ? (
                                  <div className="mt-3 bg-[#fdf9ee] border border-[#e0cb95] text-[#543d03] rounded-lg p-3 text-center space-y-1 shadow-xs">
                                    <span className="text-[10px] font-extrabold block uppercase tracking-wider text-[#8d1811]">🔒 Vendas Temporariamente Bloqueadas</span>
                                    <p className="text-[9.5px] leading-relaxed text-[#543d03]/90 font-medium">
                                      Os convites extras para esta turma estarão liberados para compra a partir de{' '}
                                      <strong className="text-[#8d1811] font-bold">
                                        {studentTurma.extraInviteStartDate ? studentTurma.extraInviteStartDate.split('-').reverse().join('/') : ''}
                                      </strong>.
                                    </p>
                                  </div>
                                ) : !isBuyingExtra ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsBuyingExtra(true);
                                      setExtraQty(1);
                                      setExtraPayType(null);
                                      setExtraPaySuccess(false);
                                    }}
                                    className="w-full mt-2 bg-[#8d1811] hover:bg-[#3d0301] text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    Comprar Convites Extras ({(studentTurma && studentTurma.extraInvitePrice !== undefined ? studentTurma.extraInvitePrice : 150).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un)
                                  </button>
                                ) : (() => {
                                  const invitePrice = studentTurma && studentTurma.extraInvitePrice !== undefined ? studentTurma.extraInvitePrice : 150;
                                  return (
                                    <div className="bg-white/95 border border-[#d2c595] rounded-xl p-3 mt-2 space-y-3 text-[#543d03] relative text-left">
                                      <button
                                        type="button"
                                        onClick={() => setIsBuyingExtra(false)}
                                        className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>

                                      <div className="text-center">
                                        <h5 className="text-[11px] font-extrabold text-[#3c2a01] uppercase tracking-wider">🛒 Adquirir Convites Extras</h5>
                                        <p className="text-[9px] text-[#543d03]/70 mt-0.5">Adicione convites extras para seus convidados no Baile</p>
                                      </div>

                                      {extraPaySuccess ? (
                                        <div className="text-center py-4 space-y-2">
                                          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                                            ✓
                                          </div>
                                          <h6 className="font-extrabold text-xs text-[#3c2a01] uppercase">Pagamento Confirmado!</h6>
                                          <p className="text-[10px] text-emerald-800 font-medium leading-normal">
                                            Sua compra de <strong>{extraQty} convite(s) extra(s)</strong> ({(extraQty * invitePrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) foi processada com sucesso!<br />
                                            Os exibíveis já estão disponíveis em seu saldo.
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          {/* Quantity Selector */}
                                          <div className="flex items-center justify-between bg-[#fcf9f0] p-2 rounded-lg border border-[#d2c595]/50">
                                            <span className="text-[10px] font-bold text-[#543d03]">Quantidade:</span>
                                            <div className="flex items-center gap-2.5">
                                              <button
                                                type="button"
                                                onClick={() => setExtraQty(Math.max(1, extraQty - 1))}
                                                className="w-5.5 h-5.5 rounded-full border border-[#d2c595] bg-white text-[#543d03] flex items-center justify-center hover:bg-white/80 active:bg-white/50 text-[10px] font-bold cursor-pointer"
                                              >
                                                <Minus className="w-2.5 h-2.5" />
                                              </button>
                                              <span className="text-xs font-black text-[#3c2a01] w-4 text-center">{extraQty}</span>
                                              <button
                                                type="button"
                                                onClick={() => setExtraQty(Math.min(50, extraQty + 1))}
                                                className="w-5.5 h-5.5 rounded-full border border-[#d2c595] bg-white text-[#543d03] flex items-center justify-center hover:bg-white/80 active:bg-white/50 text-[10px] font-bold cursor-pointer"
                                              >
                                                <Plus className="w-2.5 h-2.5" />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Pricing Summary */}
                                          <div className="flex justify-between items-center text-[11px] border-b border-[#d2c595]/30 pb-2">
                                            <span className="font-semibold text-[#543d03]/80">Valor Unitário:</span>
                                            <span className="font-bold text-[#3c2a01]">
                                              {invitePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs font-bold bg-gradient-to-r from-[#f5efd5] to-transparent p-2 rounded border-l-2 border-[#8d1811]">
                                            <span className="text-[#3c2a01]">Valor Total:</span>
                                            <span className="text-xs font-black text-[#8d1811]">
                                              {(extraQty * invitePrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                          </div>

                                          {/* Payment Method Selector */}
                                          {!extraPayType ? (
                                            <div className="space-y-1.5">
                                              <p className="text-[9px] font-bold uppercase text-[#543d03]/70">Escolha o Método de Pagamento:</p>
                                              <div className="grid grid-cols-2 gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => setExtraPayType('pix')}
                                                  className="border border-[#d2c595] hover:border-[#8d1811] hover:bg-white rounded-lg p-2 flex flex-col items-center gap-1 transition-all cursor-pointer text-[#543d03]"
                                                >
                                                  <Sparkles className="w-3.5 h-3.5 text-[#8d1811]" />
                                                  <span className="text-[9px] font-bold">Pix Copia/Cola</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setExtraPayType('boleto')}
                                                  className="border border-[#d2c595] hover:border-[#8d1811] hover:bg-white rounded-lg p-2 flex flex-col items-center gap-1 transition-all cursor-pointer text-[#543d03]"
                                                >
                                                  <CreditCard className="w-3.5 h-3.5 text-[#8d1811]" />
                                                  <span className="text-[9px] font-bold">Boleto Bancário</span>
                                                </button>
                                              </div>
                                            </div>
                                          ) : extraPayType === 'pix' ? (
                                            <div className="space-y-2 bg-[#fcf9f0] p-2 rounded-lg border border-[#d2c595]/50">
                                              <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-bold uppercase text-[#8d1811]">🔑 Pix Copia e Cola</span>
                                                <button 
                                                  type="button"
                                                  onClick={() => setExtraPayType(null)} 
                                                  className="text-[9px] font-bold text-[#543d03]/70 hover:underline cursor-pointer"
                                                >
                                                  Alterar
                                                </button>
                                              </div>
                                              <div className="bg-white p-2 border border-[#d2c595]/30 rounded-lg w-24 h-24 mx-auto flex items-center justify-center">
                                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                                  <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z" fill="#000" />
                                                  <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z" fill="#000" />
                                                  <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z" fill="#000" />
                                                  <rect x="45" y="45" width="10" height="10" fill="#000" />
                                                  <rect x="60" y="60" width="20" height="20" fill="#000" />
                                                </svg>
                                              </div>
                                              <div className="bg-white/80 p-1.5 border border-[#d2c595]/30 rounded text-[9px] font-mono break-all flex justify-between items-center gap-1">
                                                <span className="truncate">00020101021126380014br.gov.pix0116wm2eventosextraconvites</span>
                                                <button
                                                  type="button"
                                                  onClick={() => handleCopy("00020101021126380014br.gov.pix0116wm2eventosextraconvites")}
                                                  className="text-[#8d1811] hover:text-[#3d0301] p-0.5"
                                                >
                                                  {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={handleConfirmExtraInvitesPayment}
                                                className="w-full bg-[#8d1811] hover:bg-[#3d0301] text-white font-bold py-1.5 rounded text-xs transition-all cursor-pointer shadow-sm"
                                              >
                                                Confirmar Pagamento do Pix
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="space-y-2 bg-[#fcf9f0] p-2 rounded-lg border border-[#d2c595]/50">
                                              <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-bold uppercase text-[#8d1811]">🎫 Boleto Digitável</span>
                                                <button 
                                                  type="button"
                                                  onClick={() => setExtraPayType(null)} 
                                                  className="text-[9px] font-bold text-[#543d03]/70 hover:underline cursor-pointer"
                                                >
                                                  Alterar
                                                </button>
                                              </div>
                                              <div className="bg-white p-1.5 border border-[#d2c595]/30 rounded text-center">
                                                <span className="text-xs font-bold tracking-widest text-neutral-800 font-mono block">|||| | | ||| || ||| |</span>
                                                <span className="text-[9px] font-mono break-all font-semibold text-[#543d03] mt-0.5 block">
                                                  34191.79001 01043.513184 91020.150008 7 94220000150000
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => handleCopy("34191.79001 01043.513184 91020.150008 7 94220000150000")}
                                                className="w-full border border-[#d2c595] hover:bg-white text-[9px] py-1 rounded flex items-center justify-center gap-1 text-[#543d03] cursor-pointer"
                                              >
                                                {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                                Copiar Linha Digitável
                                              </button>
                                              <button
                                                type="button"
                                                onClick={handleConfirmExtraInvitesPayment}
                                                className="w-full bg-[#8d1811] hover:bg-[#3d0301] text-white font-bold py-1.5 rounded text-xs transition-all cursor-pointer shadow-sm"
                                              >
                                                Confirmar Pagamento de Boleto
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* GUEST LIST MANAGER WIDGET */}
                              <div className="bg-white/60 border border-[#d2c595]/80 rounded-xl p-4 mt-4 space-y-3 text-[#543d03] text-left">
                                <div className="flex items-center justify-between border-b border-[#d2c595]/40 pb-2">
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-[#8d1811]" />
                                    <span className="text-xs font-black uppercase tracking-wider text-[#3c2a01]">
                                      📋 Relação de Convidados para o Baile
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const guests = currentStudent.convidados || [];
                                      if (guests.length === 0) return;
                                      const content = `WM2 PRODUÇÕES E EVENTOS\nRELAÇÃO DE CONVIDADOS PARA O BAILE DE GALA\n\nFormando: ${currentStudent.name}\nTurma: ${studentTurma?.name || 'Não informada'}\nData de Emissão: ${new Date().toLocaleDateString('pt-BR')}\n\nCONVIDADOS CONFIRMADOS (${guests.length} de ${total}):\n==================================================\n${guests.map((g, idx) => `${idx + 1}. ${g.name} ${g.cpf ? `(CPF/RG: ${g.cpf})` : ''}`).join('\n')}\n==================================================\n* Apresente os exibíveis individuais na recepção do evento para liberação das entradas.`;
                                      
                                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `convidados-baile-${currentStudent.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
                                      link.click();
                                      URL.revokeObjectURL(url);
                                    }}
                                    disabled={(currentStudent.convidados || []).length === 0}
                                    className="text-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 text-[#8d1811] border border-[#d2c595] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                                    title="Baixar lista em formato texto"
                                  >
                                    <Download className="w-3 h-3" /> Exportar Relação (TXT)
                                  </button>
                                </div>

                                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 bg-[#fbf9f0] p-2.5 rounded-lg border border-[#d2c595]/40">
                                  <span>Limite Máximo de Convidados:</span>
                                  <span className="bg-[#8d1811] text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                                    {(currentStudent.convidados || []).length} de {total}
                                  </span>
                                </div>

                                <p className="text-[9.5px] leading-relaxed text-[#543d03]/85 font-medium">
                                  Cadastre abaixo o nome completo e documento de cada um dos seus convidados do Baile. Essa lista serve para controle da portaria e segurança do evento.
                                </p>

                                <div className="bg-white/80 border border-[#d2c595]/50 p-3 rounded-lg space-y-2.5">
                                  <h6 className="text-[10px] font-extrabold uppercase text-[#3c2a01] tracking-wider">Adicionar Novo Convidado</h6>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase font-bold text-[#543d03]/70">Nome Completo</label>
                                      <input
                                        type="text"
                                        placeholder="Ex: João da Silva Santos"
                                        value={newGuestName}
                                        onChange={(e) => setNewGuestName(e.target.value)}
                                        className="w-full text-xs p-2 border border-[#d2c595] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8d1811] bg-white text-[#3c2a01]"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] uppercase font-bold text-[#543d03]/70">CPF ou RG (Opcional)</label>
                                      <input
                                        type="text"
                                        placeholder="Ex: 123.456.789-00"
                                        value={newGuestCpf}
                                        onChange={(e) => setNewGuestCpf(e.target.value)}
                                        className="w-full text-xs p-2 border border-[#d2c595] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8d1811] bg-white text-[#3c2a01]"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (newGuestName.trim() === '') return;
                                      const currentGuests = currentStudent.convidados || [];
                                      if (currentGuests.length >= total) {
                                        setGuestListFeedback('Você já atingiu o limite de convidados do seu pacote!');
                                        return;
                                      }
                                      
                                      const newGuestObj = {
                                        id: 'guest-' + Date.now(),
                                        name: newGuestName.trim(),
                                        cpf: newGuestCpf.trim() || undefined
                                      };

                                      const updatedGuests = [...currentGuests, newGuestObj];
                                      const updatedFormandos = formandos.map(f => {
                                        if (f.id === currentStudent.id) {
                                          return { ...f, convidados: updatedGuests };
                                        }
                                        return f;
                                      });

                                      onUpdateState({
                                        formandos: updatedFormandos,
                                        parcelas,
                                        enquetes,
                                        fotos,
                                        mural
                                      });
                                      setNewGuestName('');
                                      setNewGuestCpf('');
                                      setGuestListFeedback('Convidado adicionado com sucesso!');
                                      setTimeout(() => setGuestListFeedback(null), 3000);
                                    }}
                                    disabled={newGuestName.trim() === '' || (currentStudent.convidados || []).length >= total}
                                    className="w-full bg-[#8d1811] hover:bg-[#3d0301] disabled:opacity-50 disabled:bg-[#8d1811]/60 text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Confirmar e Adicionar Convidado
                                  </button>

                                  {guestListFeedback && (
                                    <p className={`text-[9.5px] font-extrabold text-center ${guestListFeedback.includes('sucesso') ? 'text-emerald-700' : 'text-[#8d1811]'}`}>
                                      {guestListFeedback}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                  <h6 className="text-[10px] font-extrabold uppercase text-[#3c2a01] tracking-wider mb-1">Convidados Cadastrados</h6>
                                  {(!currentStudent.convidados || currentStudent.convidados.length === 0) ? (
                                    <p className="text-[10px] text-[#543d03]/70 italic py-2 text-center border border-dashed border-[#d2c595]/50 rounded-lg bg-white/40">
                                      Nenhum convidado cadastrado ainda. Use o formulário acima para adicionar.
                                    </p>
                                  ) : (
                                    currentStudent.convidados.map((guest, idx) => (
                                      <div
                                        key={guest.id}
                                        className="bg-white/90 border border-[#d2c595]/40 px-3 py-2 rounded-lg flex items-center justify-between gap-3 text-xs shadow-xs"
                                      >
                                        <div className="truncate flex items-center gap-2">
                                          <span className="font-extrabold text-[#8d1811] font-mono text-[11px]">{idx + 1}.</span>
                                          <div className="truncate text-left">
                                            <span className="font-bold text-neutral-900 block truncate">{guest.name}</span>
                                            {guest.cpf && (
                                              <span className="text-[9px] text-[#543d03]/70 font-semibold block font-mono">CPF/RG: {guest.cpf}</span>
                                            )}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentGuests = currentStudent.convidados || [];
                                            const updatedGuests = currentGuests.filter(g => g.id !== guest.id);
                                            const updatedFormandos = formandos.map(f => {
                                              if (f.id === currentStudent.id) {
                                                return { ...f, convidados: updatedGuests };
                                              }
                                              return f;
                                            });
                                            onUpdateState({
                                              formandos: updatedFormandos,
                                              parcelas,
                                              enquetes,
                                              fotos,
                                              mural
                                            });
                                            setGuestListFeedback('Convidado removido.');
                                            setTimeout(() => setGuestListFeedback(null), 3000);
                                          }}
                                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                                          title="Remover Convidado"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* FILE UPLOAD WIDGET FOR FINAL GUEST LIST */}
                              <div className="bg-white/60 border border-[#d2c595]/80 rounded-xl p-3.5 mt-3 space-y-2.5 text-[#543d03]">
                                <div className="flex items-center gap-1.5 border-b border-[#d2c595]/40 pb-1.5">
                                  <Upload className="w-3.5 h-3.5 text-[#8d1811]" />
                                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#3c2a01]">Enviar Lista de Convidados Final (Arquivo)</span>
                                </div>
                                
                                <p className="text-[10px] text-[#543d03]/85 leading-normal">
                                  Se preferir, envie uma planilha Excel, documento do Word ou PDF contendo a relação final completa de todos os seus convidados para a recepção do evento.
                                </p>

                                {currentStudent.guestListFile ? (
                                  <div className="bg-emerald-50/90 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs shadow-xs">
                                    <div className="flex items-center gap-2 truncate">
                                      <div className="bg-emerald-100 p-1.5 rounded text-emerald-800 shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="truncate text-left">
                                        <span className="font-bold text-neutral-900 block truncate">{currentStudent.guestListFile.name}</span>
                                        <span className="text-[9px] text-neutral-500 font-medium block">
                                          Enviado em {new Date(currentStudent.guestListFile.uploadedAt).toLocaleString('pt-BR')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <a 
                                        href={currentStudent.guestListFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                                        title="Download/Visualizar Lista"
                                      >
                                        <Download className="w-4.5 h-4.5" />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={handleRemoveGuestListFile}
                                        className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-100 transition-colors cursor-pointer border-none bg-transparent"
                                        title="Excluir Arquivo"
                                      >
                                        <Trash2 className="w-4.5 h-4.5" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setIsDraggingFile(true);
                                    }}
                                    onDragLeave={() => setIsDraggingFile(false)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      setIsDraggingFile(false);
                                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        handleGuestListFileUpload(e.dataTransfer.files[0]);
                                      }
                                    }}
                                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                                      isDraggingFile 
                                        ? 'border-[#8d1811] bg-[#8d1811]/5' 
                                        : 'border-[#d2c595]/60 hover:border-[#8d1811]/40 hover:bg-white/30'
                                    }`}
                                  >
                                    <input 
                                      type="file"
                                      id="guest-list-file"
                                      className="hidden"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleGuestListFileUpload(e.target.files[0]);
                                        }
                                      }}
                                    />
                                    <label htmlFor="guest-list-file" className="cursor-pointer block space-y-1">
                                      <Upload className="w-6 h-6 text-[#705510] mx-auto opacity-75" />
                                      <div className="text-[10px] font-bold text-neutral-800">
                                        Arraste seu arquivo ou <span className="text-[#8d1811] hover:underline">clique para selecionar</span>
                                      </div>
                                      <p className="text-[8.5px] text-[#543d03]/60 font-medium">
                                        Formatos aceitos: PDF, Excel, Word, TXT ou CSV (Até 10MB)
                                      </p>
                                    </label>
                                  </div>
                                )}

                                {fileUploading && (
                                  <div className="space-y-1 mt-1">
                                    <div className="flex justify-between items-center text-[9px] font-bold">
                                      <span className="text-neutral-600 animate-pulse">Enviando lista para produção...</span>
                                      <span className="text-[#8d1811]">{fileUploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className="bg-[#8d1811] h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${fileUploadProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                {fileUploadError && (
                                  <p className="text-[9px] text-rose-700 font-bold text-center mt-1">
                                    {fileUploadError}
                                  </p>
                                )}
                              </div>
                            </>
                          );
                        })()}

                        <div className="border-t border-[#d2c595]/50 pt-3">
                          <span className="text-[10px] text-[#543d03]/70 uppercase font-bold tracking-wider">Fornecedores Vinculados</span>
                          <div className="grid sm:grid-cols-2 gap-2 mt-2">
                            {evt.suppliers.map((supp, index) => (
                              <div key={index} className="bg-white/40 p-2 rounded border border-[#d2c595] text-[10px] flex items-center justify-between gap-2">
                                <div className="truncate">
                                  <div className="font-bold text-[#3c2a01] truncate">{supp.name}</div>
                                  <div className="text-[#543d03]/70 truncate">{supp.service}</div>
                                </div>
                                <span className={`text-[10px] font-semibold ${
                                  supp.status === 'Confirmado' 
                                    ? 'text-emerald-700' 
                                    : 'text-amber-700'
                                }`}>
                                  {supp.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ENQUETES TAB */}
          {activeTab === 'enquetes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Opiniões & Votações Ativas</h3>

              {studentEnquetes.length === 0 ? (
                <div className="text-center py-12 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] text-stone-900 rounded-2xl shadow-sm">
                  <Vote className="w-12 h-12 text-[#705510] mx-auto mb-3" />
                  <p className="text-stone-700 text-sm">Nenhuma enquete cadastrada até o momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {studentEnquetes.map(enq => {
                    const hasVoted = enq.votedStudentIds.includes(currentStudent.id);
                    const totalVotes = enq.options.reduce((acc, current) => acc + current.votes, 0);

                    return (
                      <motion.div
                        key={enq.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-2xl p-5 shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-[#d2c595] pb-2">
                          <span className="text-[10px] text-[#543d03]/70 font-semibold font-mono">
                            Criado por: {enq.createdBy}
                          </span>
                          <span className={`text-[11px] font-bold uppercase ${
                            enq.active && new Date(enq.endDate) > new Date()
                              ? 'text-emerald-700'
                              : 'text-stone-500'
                          }`}>
                            {enq.active && new Date(enq.endDate) > new Date() ? 'Ativa' : 'Encerrada'}
                          </span>
                        </div>

                        <h4 className="font-bold text-[#3c2a01] text-sm">
                          {enq.question}
                        </h4>

                        <div className="space-y-3">
                          {enq.options.map((opt, optIdx) => {
                            const optionPercentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;

                            return (
                              <div key={optIdx} className="space-y-1">
                                {hasVoted || !enq.active ? (
                                  // Results mode
                                  <div className="text-xs bg-white/40 p-2.5 rounded border border-[#d2c595]">
                                    <div className="flex justify-between font-semibold mb-1">
                                      <span className="text-[#3c2a01]">{opt.text}</span>
                                      <span className="text-[#543d03]/70 font-mono">
                                        {opt.votes} {opt.votes === 1 ? 'voto' : 'votos'} ({optionPercentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                    <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-[#543d03] h-full" 
                                        style={{ width: `${optionPercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  // Vote selection mode
                                  <button
                                    onClick={() => handleVote(enq.id, optIdx)}
                                    className="w-full text-left text-xs bg-white/40 hover:bg-white/60 border border-[#d2c595] rounded p-3 font-semibold text-[#543d03] transition-colors flex items-center justify-between group"
                                  >
                                    <span>{opt.text}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#543d03] group-hover:translate-x-1 transition-transform" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-[#d2c595] pt-3 flex items-center justify-between text-[10px] text-[#543d03]/70">
                          <span>Total de votos: <strong className="text-[#3c2a01]">{totalVotes}</strong></span>
                          <span>Término: {new Date(enq.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GALERIA TAB */}
          {activeTab === 'galeria' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#d2c595]/30 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-[#8d1811]" />
                    Álbuns e Sessões Fotográficas
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Visualize suas fotos exclusivas de formatura organizadas por álbum e faça o download em alta definição.</p>
                </div>
                
                {studentFotos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={async () => {
                        const targetPhotos = activeDisplayPhotos;
                        for (let i = 0; i < targetPhotos.length; i++) {
                          await handleDownloadPhoto(targetPhotos[i].url, `${targetPhotos[i].eventName}_${i + 1}`);
                          await new Promise(r => setTimeout(r, 400));
                        }
                      }}
                      className="flex items-center gap-1.5 bg-[#543d03] hover:bg-[#3c2a01] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:scale-105 cursor-pointer"
                      title="Baixar todas as fotos exibidas em alta definição"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{selectedAlbumName ? `Baixar Álbum (${activeDisplayPhotos.length})` : `Baixar Tudo (${studentFotos.length})`}</span>
                    </button>

                    <div className="bg-[#ebe0b2]/60 p-1 rounded-lg border border-[#d2c595] flex items-center shadow-2xs">
                      <button
                        onClick={() => setGalleryViewMode('albums')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          galleryViewMode === 'albums'
                            ? 'bg-[#543d03] text-white shadow'
                            : 'text-[#543d03] hover:bg-[#ebe0b2]'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5" />
                        Modo Álbuns ({albumsGrouped.length})
                      </button>
                      <button
                        onClick={() => setGalleryViewMode('carousel')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          galleryViewMode === 'carousel'
                            ? 'bg-[#543d03] text-white shadow'
                            : 'text-[#543d03] hover:bg-[#ebe0b2]'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Carrossel
                      </button>
                      <button
                        onClick={() => setGalleryViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          galleryViewMode === 'grid'
                            ? 'bg-[#543d03] text-white shadow'
                            : 'text-[#543d03] hover:bg-[#ebe0b2]'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Grade
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Album Filter Breadcrumb / Banner */}
              {selectedAlbumName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#ebe0b2] border border-[#d2c595] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs text-[#543d03]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#8d1811] text-white rounded-xl shadow-xs">
                      <FolderOpen className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#705510] block">Álbum em Destaque</span>
                      <h4 className="font-extrabold text-base text-[#3c2a01] leading-tight">
                        {selectedAlbumName} <span className="text-xs font-bold text-[#705510] ml-1">({activeDisplayPhotos.length} {activeDisplayPhotos.length === 1 ? 'foto' : 'fotos'})</span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={async () => {
                        for (let i = 0; i < activeDisplayPhotos.length; i++) {
                          await handleDownloadPhoto(activeDisplayPhotos[i].url, `${selectedAlbumName}_${i + 1}`);
                          await new Promise(r => setTimeout(r, 350));
                        }
                      }}
                      className="flex items-center gap-1.5 bg-[#543d03] hover:bg-[#3c2a01] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Este Álbum</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAlbumName(null);
                        setGalleryViewMode('albums');
                      }}
                      className="flex items-center gap-1.5 text-[#543d03] hover:text-[#3c2a01] bg-white/70 hover:bg-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-[#d2c595] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-rose-700" />
                      <span>Ver Todos os Álbuns</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {studentFotos.length === 0 ? (
                <div className="text-center py-12 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] text-stone-900 rounded-2xl shadow-sm">
                  <ImageIcon className="w-12 h-12 text-[#705510] mx-auto mb-3" />
                  <p className="text-stone-700 text-sm font-semibold">Nenhuma foto cadastrada até o momento para você.</p>
                  <p className="text-stone-500 text-xs mt-1">Fotos enviadas pelo administrador aparecerão aqui em tempo real.</p>
                </div>
              ) : galleryViewMode === 'albums' ? (
                /* Cards per Album View */
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {albumsGrouped.map((album, aIdx) => (
                    <motion.div
                      key={album.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: aIdx * 0.05 }}
                      className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 text-[#543d03] flex flex-col justify-between group"
                    >
                      {/* Album Cover & Stacked Preview Thumbnails */}
                      <div 
                        onClick={() => {
                          setSelectedAlbumName(album.name);
                          setGalleryViewMode('grid');
                        }}
                        className="relative h-56 bg-stone-900 overflow-hidden cursor-pointer group/cover"
                        title={`Clique para abrir e ver as fotos de: ${album.name}`}
                      >
                        <img
                          src={album.coverPhoto.url}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500 opacity-90"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          <span className="bg-[#8d1811] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow flex items-center gap-1">
                            <Folder className="w-3 h-3 text-amber-300" />
                            {album.count} {album.count === 1 ? 'Foto' : 'Fotos'}
                          </span>
                          {album.hasExclusive && (
                            <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow flex items-center gap-1">
                              🔒 Exclusivas
                            </span>
                          )}
                        </div>

                        {/* Direct Download Button for Album */}
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              for (let i = 0; i < album.photos.length; i++) {
                                await handleDownloadPhoto(album.photos[i].url, `${album.name}_${i + 1}`);
                                await new Promise(r => setTimeout(r, 350));
                              }
                            }}
                            className="bg-black/75 hover:bg-[#8d1811] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md border border-white/20 transition-all hover:scale-105 cursor-pointer"
                            title="Baixar todas as fotos deste álbum"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hidden sm:inline">Baixar</span>
                          </button>
                        </div>

                        {/* Stacked Preview Thumbnails on Bottom Right */}
                        <div className="absolute bottom-3 right-3 flex items-center -space-x-2 z-10">
                          {album.previewPhotos.slice(1, 4).map((p, pIdx) => (
                            <div 
                              key={p.id || pIdx} 
                              className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/90 shadow-md transform group-hover/cover:translate-y-1 transition-transform"
                              style={{ zIndex: 10 - pIdx }}
                            >
                              <img src={p.url} alt="Miniatura" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>

                        {/* Hover Overlay Message */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                          <span className="bg-black/80 text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-2 border border-white/20 shadow-xl">
                            <FolderOpen className="w-4 h-4 text-amber-300" />
                            Abrir Álbum ({album.count} fotos)
                          </span>
                        </div>

                        {/* Album Title */}
                        <div className="absolute bottom-3 left-3 right-28 z-10 text-white">
                          <h4 className="font-extrabold text-base leading-tight drop-shadow-md text-amber-100 truncate">
                            {album.name}
                          </h4>
                          <span className="text-[10px] text-stone-200 font-medium block">
                            Álbum Fotográfico Oficial
                          </span>
                        </div>
                      </div>

                      {/* Body Info & Actions */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-[#543d03]/80 font-bold border-b border-[#d2c595]/40 pb-2">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                              {album.totalLikes} Curtidas
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                              {album.totalComments} Comentários
                            </span>
                          </div>
                          <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-full text-[#3c2a01] border border-amber-300/50 font-mono">
                            {album.count} {album.count === 1 ? 'foto' : 'fotos'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => {
                              setSelectedAlbumName(album.name);
                              setGalleryViewMode('grid');
                            }}
                            className="w-full bg-[#543d03] hover:bg-[#3c2a01] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                            <span>Ver Fotos</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedAlbumName(album.name);
                              setLightboxIndex(0);
                            }}
                            className="w-full bg-[#8d1811] hover:bg-[#6b120c] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                            <span>Slideshow</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : galleryViewMode === 'carousel' ? (
                (() => {
                  const displayList = activeDisplayPhotos;
                  const safeIdx = Math.min(activeCarouselIdx, displayList.length - 1);
                  const activePhoto = displayList[safeIdx] || displayList[0];
                  if (!activePhoto) return null;

                  const nextSlide = () => {
                    setActiveCarouselIdx(prev => (prev >= displayList.length - 1 ? 0 : prev + 1));
                  };
                  const prevSlide = () => {
                    setActiveCarouselIdx(prev => (prev <= 0 ? displayList.length - 1 : prev - 1));
                  };

                  return (
                    <div className="space-y-6">
                      {/* Carousel Layout: Main viewport and controls */}
                      <div className="grid lg:grid-cols-12 gap-6 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-3xl overflow-hidden shadow-md text-[#543d03]">
                        
                        {/* Left: Viewport with navigation arrows */}
                        <div className="lg:col-span-7 bg-black/95 relative h-[350px] sm:h-[450px] lg:h-[500px] flex items-center justify-center group overflow-hidden select-none">
                          <BlurUpImage
                            key={activePhoto.id}
                            src={activePhoto.url}
                            thumbnailSrc={activePhoto.thumbnailUrl}
                            alt={activePhoto.caption}
                            onClick={() => setLightboxIndex(safeIdx)}
                            className="max-w-full max-h-full object-contain transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                            containerClassName="w-full h-full"
                          />
                          
                          {/* Left Navigation Arrow */}
                          <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all duration-200 border border-white/10 hover:scale-105 cursor-pointer z-10"
                            title="Foto Anterior"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          
                          {/* Right Navigation Arrow */}
                          <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all duration-200 border border-white/10 hover:scale-105 cursor-pointer z-10"
                            title="Próxima Foto"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          {/* Top Exclusivity Badge Overlays */}
                          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 pointer-events-none z-10">
                            <span className="bg-[#8d1811] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                              {activePhoto.eventName}
                            </span>
                            {activePhoto.formandoId ? (
                              <span className="bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                                🔒 Exclusivo para Você
                              </span>
                            ) : (
                              <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                                🌐 Geral da Turma
                              </span>
                            )}
                          </div>

                          {/* Top Right Action Controls: Lightbox & Download */}
                          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            <button
                              onClick={() => setLightboxIndex(safeIdx)}
                              className="bg-[#543d03]/90 hover:bg-[#3c2a01] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20 transition-all hover:scale-105 cursor-pointer"
                              title="Ampliar Foto em Tela Cheia (Lightbox)"
                            >
                              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                              <span className="hidden sm:inline">Ampliar</span>
                            </button>
                            <button
                              onClick={() => handleDownloadPhoto(activePhoto.url, activePhoto.eventName)}
                              className="bg-[#543d03]/90 hover:bg-[#3c2a01] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20 transition-all hover:scale-105 cursor-pointer"
                              title="Baixar Foto em Alta Definição"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Baixar</span>
                            </button>
                          </div>

                          {/* Index indicator */}
                          <div className="absolute bottom-4 right-4 bg-black/75 text-white font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-white/10 z-10">
                            {safeIdx + 1} / {displayList.length}
                          </div>
                        </div>

                        {/* Right: Info details, likes, comments, and download action */}
                        <div className="lg:col-span-5 p-6 flex flex-col justify-between h-full space-y-4">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#705510] block mb-0.5">Álbum de Origem</span>
                              <h4 className="text-base font-extrabold text-[#3c2a01] leading-tight">{activePhoto.eventName}</h4>
                            </div>

                            <p className="text-xs text-[#543d03] leading-relaxed font-semibold bg-white/30 p-3.5 rounded-xl border border-[#d2c595]/30">
                              {activePhoto.caption || "Sem legenda cadastrada."}
                            </p>

                            {/* Direct Download Button */}
                            <div className="bg-[#543d03]/10 p-3 rounded-2xl border border-[#d2c595]/40 flex items-center justify-between gap-3">
                              <div className="text-[11px] text-[#543d03]/80 leading-normal">
                                <span className="font-bold block text-[#3c2a01] text-xs">Arquivo Digital Disponível</span>
                                Resolução máxima de estúdio
                              </div>
                              <button
                                onClick={() => handleDownloadPhoto(activePhoto.url, activePhoto.eventName)}
                                className="flex items-center gap-1.5 bg-[#543d03] hover:bg-[#3c2a01] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.03] cursor-pointer"
                                title="Baixar Foto"
                              >
                                <Download className="w-4 h-4" />
                                <span>Baixar Agora</span>
                              </button>
                            </div>

                            {/* Comments counter & Likes row */}
                            <div className="flex items-center gap-6 border-y border-[#d2c595]/40 py-3 text-xs font-bold">
                              <button
                                onClick={() => handleLikePhoto(activePhoto.id)}
                                className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800 transition-colors"
                              >
                                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                                <span>{activePhoto.likes} Likes</span>
                              </button>
                              
                              <div className="flex items-center gap-1.5 text-[#543d03]/80">
                                <MessageSquare className="w-4 h-4 text-[#705510]" />
                                <span>{activePhoto.comments?.length || 0} Comentários</span>
                              </div>
                            </div>

                            {/* Comments list inside scroll area */}
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#705510] block">Mural de Comentários</span>
                              {activePhoto.comments && activePhoto.comments.length > 0 ? (
                                <div className="bg-white/45 p-3 rounded-xl border border-[#d2c595]/30 text-xs space-y-2.5 max-h-[140px] overflow-y-auto">
                                  {activePhoto.comments.map((comm, commIdx) => (
                                    <div key={commIdx} className="border-b border-[#d2c595]/20 last:border-0 pb-2 last:pb-0">
                                      <div className="flex justify-between text-[10px] font-bold text-[#3c2a01] mb-0.5">
                                        <span>{comm.author}</span>
                                        <span className="text-[#543d03]/50 font-mono font-normal">
                                          {new Date(comm.date).toLocaleDateString('pt-BR')}
                                        </span>
                                      </div>
                                      <p className="text-[#543d03]/90 leading-relaxed font-medium">{comm.text}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-[#543d03]/60 italic pl-1">Seja o primeiro a comentar nesta foto!</p>
                              )}
                            </div>
                          </div>

                          {/* New comment form */}
                          <div className="flex gap-2 items-center border-t border-[#d2c595]/30 pt-3">
                            <input
                              type="text"
                              placeholder="Escreva seu comentário..."
                              value={newCommentText[activePhoto.id] || ''}
                              onChange={(e) => {
                                const text = e.target.value;
                                setNewCommentText(prev => ({ ...prev, [activePhoto.id]: text }));
                              }}
                              className="flex-1 bg-white/60 border border-[#d2c595] text-xs p-2.5 rounded-xl outline-none focus:border-[#705510] transition-colors text-[#543d03] placeholder-[#543d03]/50 font-medium"
                            />
                            <button
                              onClick={() => handleAddComment(activePhoto.id)}
                              className="bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                            >
                              Enviar
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Bottom horizontal scrollable thumbnail strip */}
                      <div className="bg-[#ebe0b2]/45 border border-[#d2c595]/50 rounded-2xl p-3">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#705510] block mb-2 px-1">Selecione Rapidamente ({displayList.length} fotos)</span>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-h-24">
                          {displayList.map((photo, index) => (
                            <button
                              key={photo.id}
                              onClick={() => setActiveCarouselIdx(index)}
                              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-200 cursor-pointer ${
                                index === safeIdx
                                  ? 'border-[#8d1811] scale-105 shadow-md'
                                  : 'border-[#d2c595]/50 opacity-60 hover:opacity-100 hover:border-[#543d03]'
                              }`}
                            >
                              <img
                                src={photo.url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {photo.formandoId && (
                                <span className="absolute top-0.5 right-0.5 bg-amber-600 text-white text-[6px] font-bold px-1 rounded">
                                  🔒
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Classic Grid View mode */
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {activeDisplayPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm text-[#543d03]"
                    >
                      <div 
                        onClick={() => setLightboxIndex(index)}
                        className="h-64 overflow-hidden relative group cursor-pointer"
                        title="Clique para ampliar no visualizador de fotos (Lightbox)"
                      >
                        <BlurUpImage 
                          src={photo.url} 
                          thumbnailSrc={photo.thumbnailUrl}
                          alt={photo.caption || 'Foto da formatura'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          containerClassName="w-full h-full"
                        />

                        {/* Hover Overlay Indicator */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-lg">
                            <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                            Ampliar (Lightbox)
                          </span>
                        </div>

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                          <span className="bg-[#8d1811] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow">
                            {photo.eventName}
                          </span>
                          {photo.formandoId ? (
                            <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow flex items-center gap-1">
                              🔒 Exclusivo para Você
                            </span>
                          ) : (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow">
                              🌐 Geral da Turma
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIndex(index);
                            }}
                            className="bg-[#543d03]/90 hover:bg-[#3c2a01] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-white/20 transition-all hover:scale-105 cursor-pointer"
                            title="Ampliar Foto"
                          >
                            <Maximize2 className="w-3 h-3 text-amber-300" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPhoto(photo.url, photo.eventName);
                            }}
                            className="bg-[#543d03]/90 hover:bg-[#3c2a01] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-white/20 transition-all hover:scale-105 cursor-pointer"
                            title="Baixar Foto Direta"
                          >
                            <Download className="w-3 h-3" />
                            <span>Baixar</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <p className="text-xs text-[#543d03] leading-normal font-bold">
                          {photo.caption}
                        </p>

                        {/* Interactive footer: Likes, Comments and Download */}
                        <div className="border-t border-[#d2c595]/50 pt-3 flex items-center justify-between gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikePhoto(photo.id)}
                              className="flex items-center gap-1.5 text-[#543d03]/70 hover:text-[#543d03] transition-colors"
                            >
                              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                              <span>{photo.likes} Likes</span>
                            </button>
                            
                            <div className="flex items-center gap-1.5 text-[#543d03]/70">
                              <MessageSquare className="w-4 h-4 text-[#705510]" />
                              <span>{photo.comments?.length || 0} Comentários</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownloadPhoto(photo.url, photo.eventName)}
                            className="flex items-center gap-1 bg-[#543d03] hover:bg-[#3c2a01] text-white text-[11px] px-3 py-1.5 rounded-lg transition-colors shadow-xs hover:scale-105 cursor-pointer"
                            title="Baixar Foto"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Baixar</span>
                          </button>
                        </div>

                        {/* Comment logs */}
                        {photo.comments && photo.comments.length > 0 && (
                          <div className="bg-white/40 p-3 rounded-lg border border-[#d2c595] text-xs space-y-2 max-h-32 overflow-y-auto font-medium">
                            {photo.comments.map((comm, commIdx) => (
                              <div key={commIdx} className="border-b border-[#d2c595]/30 last:border-0 pb-1.5 last:pb-0">
                                <div className="flex justify-between text-[10px] font-bold text-[#3c2a01] mb-0.5">
                                  <span>{comm.author}</span>
                                  <span className="text-[#543d03]/50 font-mono font-normal">{new Date(comm.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <p className="text-[#543d03]/90 leading-normal">{comm.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New comment input */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Escreva seu comentário..."
                            value={newCommentText[photo.id] || ''}
                            onChange={(e) => {
                              const text = e.target.value;
                              setNewCommentText(prev => ({ ...prev, [photo.id]: text }));
                            }}
                            className="flex-1 bg-white/50 border border-[#d2c595] text-xs p-2.5 rounded outline-none focus:border-[#705510] transition-colors text-[#543d03] placeholder-[#543d03]/50"
                          />
                          <button
                            onClick={() => handleAddComment(photo.id)}
                            className="bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold px-3 py-2 rounded text-xs transition-colors shadow-sm"
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEPOIMENTOS TAB */}
          {activeTab === 'depoimentos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#d2c595]/30 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#aa904f]" /> Livro de Depoimentos & Recordações
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Deixe uma mensagem especial, um agradecimento ou uma recordação para os seus colegas da {studentTurma?.name}.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Post form column (4 cols on large screens) */}
                <div className="lg:col-span-4 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] p-5 rounded-2xl shadow-sm text-[#543d03]">
                  <h4 className="font-bold text-sm text-[#3c2a01] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#705510]" /> Deixe seu Depoimento
                  </h4>
                  <form onSubmit={handleAddDepoimento} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#705510] mb-1.5">Sua Mensagem</label>
                      <textarea
                        rows={5}
                        maxLength={500}
                        placeholder="Escreva aqui palavras de agradecimento, uma história marcante ou desejos de sucesso para a turma..."
                        value={newDepoimentoText}
                        onChange={(e) => setNewDepoimentoText(e.target.value)}
                        className="w-full text-sm p-3 bg-white/50 dark:bg-white/50 border border-[#d2c595] rounded-xl outline-none focus:border-[#705510] dark:focus:border-[#705510] transition-all resize-none text-[#3c2a01] placeholder-[#543d03]/50"
                      />
                      <div className="flex justify-between items-center mt-1 text-[11px] text-[#543d03]/70">
                        <span>Restam {500 - newDepoimentoText.length} caracteres</span>
                        <span>Máx. 500</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newDepoimentoText.trim()}
                      className="w-full bg-[#543d03] hover:bg-[#3c2a01] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Publicar Depoimento
                    </button>
                  </form>

                  {depoimentoSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-100/80 border border-emerald-300 rounded-xl text-center"
                    >
                      <p className="text-xs text-emerald-800 dark:text-emerald-900 font-bold">
                        🎉 Depoimento publicado com sucesso!
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Testimonials list column (8 cols on large screens) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Search bar */}
                  <div className="flex items-center gap-2 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] px-3.5 py-2 rounded-xl text-[#543d03]">
                    <span className="text-xs text-[#705510] font-semibold">Buscar por autor ou conteúdo:</span>
                    <input
                      type="text"
                      placeholder="Filtrar depoimentos..."
                      value={depoimentoSearch}
                      onChange={(e) => setDepoimentoSearch(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-[#3c2a01] outline-none placeholder-[#543d03]/50 font-medium"
                    />
                    {depoimentoSearch && (
                      <button
                        onClick={() => setDepoimentoSearch('')}
                        className="text-[#543d03]/70 hover:text-[#3c2a01] text-xs font-bold"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* Testimonials rendering */}
                  {(() => {
                    const filtered = depoimentos
                      .filter(d => d.turmaId === currentStudent.turmaId)
                      .filter(d => {
                        if (!depoimentoSearch.trim()) return true;
                        const query = depoimentoSearch.toLowerCase();
                        return (
                          d.authorName.toLowerCase().includes(query) ||
                          d.text.toLowerCase().includes(query)
                        );
                      });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl text-[#543d03]">
                          <MessageSquare className="w-12 h-12 text-[#705510] mx-auto mb-3 animate-bounce" />
                          <p className="text-[#3c2a01] text-sm font-semibold">
                            {depoimentoSearch ? 'Nenhum depoimento corresponde à sua busca.' : 'Seja o primeiro a publicar uma mensagem especial para a turma!'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid md:grid-cols-2 gap-4">
                        {filtered.map((dep, idx) => {
                          const isAuthor = dep.formandoId === currentStudent.id;
                          const isCommission = currentStudent.role === 'comissao';
                          const canDelete = isAuthor || isCommission;

                          return (
                            <motion.div
                              key={dep.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="relative group bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#705510] transition-all text-[#543d03]"
                            >
                              <div>
                                <div className="text-3xl text-[#705510]/30 font-serif leading-none absolute top-3 left-4 select-none">“</div>
                                <p className="text-sm text-[#3c2a01] italic leading-relaxed pt-3 relative z-10 whitespace-pre-wrap font-medium">
                                  {dep.text}
                                </p>
                              </div>

                              <div className="mt-5 pt-3 border-t border-[#d2c595]/50 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-xs font-extrabold text-[#3c2a01] flex items-center gap-1">
                                    {dep.authorName}
                                    {isAuthor && (
                                      <span className="bg-[#aa904f]/20 text-[#705510] text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider">
                                        Você
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-[#543d03]/70 mt-0.5">
                                    {new Date(dep.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>

                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteDepoimento(dep.id)}
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-rose-600 hover:text-rose-800 text-xs font-bold transition-all px-2 py-1 rounded hover:bg-rose-100/50"
                                    title="Excluir Depoimento"
                                  >
                                    Excluir
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* COMMISSION ONLY TAB */}
          {activeTab === 'comissao' && currentStudent.role === 'comissao' && (
            <div className="space-y-8">
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#aa904f]" />
                  Painel de Representação da Comissão
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Espaço exclusivo para representantes gerenciarem enquetes de opinião, publicarem avisos no mural e acompanharem a arrecadação financeira geral da turma.
                </p>
              </div>

              {/* Arrecadação global */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <div className="text-xs font-bold text-[#705510] uppercase">Adesão Total Estimada</div>
                  <div className="text-xl font-extrabold text-[#3c2a01] mt-1">
                    {totalTurmaGoalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-[10px] text-[#543d03]/70 mt-1">{studentTurma.totalStudents} de {studentTurma.targetStudents} alunos aderidos</div>
                </div>

                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <div className="text-xs font-bold text-emerald-800 uppercase">Arrecadação Efetiva Real</div>
                  <div className="text-xl font-extrabold text-[#3c2a01] mt-1">
                    {currentTurmaTotalCollected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-[10px] text-[#543d03]/70 mt-1">{collectionPercentage.toFixed(1)}% do orçamento total recolhido</div>
                </div>

                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <div className="text-xs font-bold text-[#705510] uppercase">Aderência de Pagamentos</div>
                  <div className="text-xs mt-2 flex flex-col gap-1 text-[#543d03] font-semibold">
                    <span className="flex justify-between"><span>Ativos (Em dia):</span> <span className="font-bold text-emerald-800">{turmaStudents.filter(s => s.status === 'Ativo').length}</span></span>
                    <span className="flex justify-between"><span>Pendente:</span> <span className="font-bold text-amber-800">{turmaStudents.filter(s => s.status === 'Pendente').length}</span></span>
                    <span className="flex justify-between"><span>Atrasado:</span> <span className="font-bold text-rose-800">{turmaStudents.filter(s => s.status === 'Inadimplente').length}</span></span>
                  </div>
                </div>
              </div>

              {/* Pacotes de Adesão da Turma */}
              <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-6 shadow-sm text-[#543d03]">
                <h4 className="text-sm font-bold text-[#3c2a01] uppercase tracking-wider mb-4 border-b border-[#d2c595] pb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#705510]" /> Pacotes de Adesão Ativos da Turma
                </h4>
                <p className="text-xs text-[#543d03]/80 mb-4">
                  Estes são os pacotes oficiais criados pela WM2 Produções e contratados por sua turma. Os alunos podem aderir a qualquer uma destas opções para a formatura.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {pacotes.filter(p => p.turmaId === currentStudent.turmaId).length === 0 ? (
                    <div className="sm:col-span-3 text-center py-6 text-neutral-500 italic text-xs">
                      Nenhum pacote personalizado cadastrado ainda para sua turma. Solicite ao administrador da WM2.
                    </div>
                  ) : (
                    pacotes
                      .filter(p => p.turmaId === currentStudent.turmaId)
                      .map(p => (
                        <div key={p.id} className="bg-white/50 border border-[#d2c595]/40 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-[#3c2a01] text-sm">{p.name}</h5>
                              <span className="font-extrabold text-[#705510] text-xs">
                                {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#543d03]/80 mt-1">{p.description}</p>
                          </div>

                          {p.items && p.items.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-[#d2c595]/20">
                              {p.items.map((item, idx) => (
                                <span key={idx} className="bg-[#543d03]/10 text-[#543d03] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Reuniões de Alinhamento com a WM2 */}
              <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-6 shadow-sm text-[#543d03]">
                <h4 className="text-sm font-bold text-[#3c2a01] uppercase tracking-wider mb-4 border-b border-[#d2c595] pb-2 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#705510]" /> Cronograma de Reuniões com a Assessoria WM2
                </h4>
                <p className="text-xs text-[#543d03]/80 mb-4">
                  Abaixo estão listadas as reuniões agendadas com a assessoria da WM2 Produções para alinhamento de prazos, contratos, fornecedores e andamento dos preparativos da formatura.
                </p>

                {(!reunioes || reunioes.filter(m => m.turmaId === currentStudent.turmaId).length === 0) ? (
                  <div className="text-center py-8 text-[#543d03]/60 italic text-xs bg-white/30 rounded-xl border border-[#d2c595]/30">
                    Nenhuma reunião de alinhamento agendada para a sua comissão no momento.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {reunioes
                      .filter(m => m.turmaId === currentStudent.turmaId)
                      .slice()
                      .reverse()
                      .map(meeting => {
                        const statusColors = {
                          'Agendada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          'Realizada': 'bg-neutral-100 text-neutral-800 border-neutral-200',
                          'Cancelada': 'bg-rose-100 text-rose-800 border-rose-200'
                        };

                        const formattedDate = new Date(meeting.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <div key={meeting.id} className="bg-white/50 border border-[#d2c595]/40 rounded-xl p-4 flex flex-col justify-between space-y-3 text-left">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[meeting.status] || 'bg-neutral-100'}`}>
                                  {meeting.status}
                                </span>
                                <span className="text-[10px] text-[#543d03]/60 font-mono">
                                  {meeting.time}h
                                </span>
                              </div>

                              <div>
                                <h5 className="font-extrabold text-[#3c2a01] text-xs">{meeting.title}</h5>
                                <p className="text-[11px] text-[#543d03]/80 mt-1 leading-relaxed">{meeting.description}</p>
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-[#d2c595]/20 flex justify-between items-center text-[10px] text-[#543d03]/70">
                              <span className="flex items-center gap-1 font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-[#705510]" /> {formattedDate}
                              </span>

                              {meeting.status === 'Agendada' && meeting.link && (
                                <a
                                  href={meeting.link.startsWith('http') ? meeting.link : `https://${meeting.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#543d03] hover:bg-[#3c2a01] text-white font-extrabold px-2.5 py-1 rounded text-[9px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <Video className="w-3 h-3" /> Entrar
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Action grid: Add mural notice or add poll */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                
                {/* Notice Creator */}
                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <h4 className="text-sm font-bold text-[#3c2a01] uppercase tracking-wider mb-4 border-b border-[#d2c595] pb-2 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-[#705510]" /> Publicar Aviso no Mural
                  </h4>

                  {newMuralSuccess && (
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold mb-4">
                      Aviso publicado com sucesso no mural da sua turma!
                    </div>
                  )}

                  <form onSubmit={handleCreateNotice} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#543d03]/90 uppercase mb-1">Título do Comunicado</label>
                      <input
                        type="text"
                        required
                        value={newMuralTitle}
                        onChange={(e) => setNewMuralTitle(e.target.value)}
                        placeholder="Ex: Medição final das Beca para colação"
                        className="w-full bg-white/50 border border-[#d2c595] text-[#543d03] text-xs p-2.5 rounded outline-none focus:border-[#705510] placeholder-[#543d03]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#543d03]/90 uppercase mb-1">Conteúdo Completo</label>
                      <textarea
                        rows={4}
                        required
                        value={newMuralContent}
                        onChange={(e) => setNewMuralContent(e.target.value)}
                        placeholder="Escreva os detalhes do comunicado para os alunos..."
                        className="w-full bg-white/50 border border-[#d2c595] text-[#543d03] text-xs p-2.5 rounded outline-none focus:border-[#705510] resize-none placeholder-[#543d03]/50"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#543d03]/90 uppercase mb-1">Categoria</label>
                        <select
                          value={newMuralCategory}
                          onChange={(e: any) => setNewMuralCategory(e.target.value)}
                          className="w-full bg-white/50 border border-[#d2c595] text-[#543d03] text-xs p-2.5 rounded outline-none focus:border-[#705510]"
                        >
                          <option value="Geral" className="text-neutral-900">Geral</option>
                          <option value="Financeiro" className="text-neutral-900">Financeiro</option>
                          <option value="Evento" className="text-neutral-900">Evento</option>
                          <option value="Aviso Importante" className="text-neutral-900">Aviso Importante</option>
                        </select>
                      </div>

                      {/* Imagem do Comunicado */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#543d03]/90 uppercase mb-1">Imagem Ilustrativa (Opcional)</label>
                        {newMuralImage ? (
                          <div className="relative rounded overflow-hidden border border-[#d2c595] bg-white/40 h-[42px] flex items-center justify-between px-3">
                            <span className="text-[10px] text-[#543d03] font-medium truncate max-w-[120px]">Imagem selecionada</span>
                            <button
                              type="button"
                              onClick={() => setNewMuralImage('')}
                              className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
                              title="Remover imagem"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsNewMuralDragging(true); }}
                            onDragLeave={() => setIsNewMuralDragging(false)}
                            onDrop={async (e) => {
                              e.preventDefault();
                              setIsNewMuralDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith('image/')) {
                                try {
                                  const compressed = await compressImageFile(file, 1000, 1000, 0.78);
                                  if (compressed) setNewMuralImage(compressed);
                                } catch (err) {
                                  console.error("Erro ao comprimir imagem:", err);
                                }
                              }
                            }}
                            onClick={() => document.getElementById('comissao-mural-file-input')?.click()}
                            className={`border border-dashed rounded p-2 text-center cursor-pointer transition-all ${
                              isNewMuralDragging 
                                ? 'border-[#705510] bg-white/60' 
                                : 'border-[#d2c595] hover:border-[#705510] bg-white/30 hover:bg-white/40'
                            }`}
                          >
                            <input
                              id="comissao-mural-file-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.type.startsWith('image/')) {
                                    try {
                                      const compressed = await compressImageFile(file, 1000, 1000, 0.78);
                                      if (compressed) setNewMuralImage(compressed);
                                    } catch (err) {
                                      console.error("Erro ao comprimir imagem:", err);
                                    }
                                  }
                              }}
                            />
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] font-semibold text-[#543d03]">Clique para anexar foto</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Opção de Fixar no Topo */}
                    <div className="flex items-center gap-2 bg-white/30 p-2.5 rounded border border-[#d2c595] hover:bg-white/40 transition-colors cursor-pointer" onClick={() => setNewMuralPinned(!newMuralPinned)}>
                      <input 
                        type="checkbox" 
                        id="comissao-mural-pinned"
                        checked={newMuralPinned}
                        onChange={(e) => setNewMuralPinned(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded text-[#aa904f] focus:ring-[#aa904f] cursor-pointer h-4 w-4"
                      />
                      <label htmlFor="comissao-mural-pinned" className="text-xs font-bold text-[#543d03] flex items-center gap-1 cursor-pointer select-none">
                        <Pin className={`w-3.5 h-3.5 ${newMuralPinned ? 'text-amber-600 fill-amber-600' : 'text-[#543d03]/70'}`} /> Fixar aviso no topo do mural
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold py-2.5 rounded text-xs transition-colors shadow"
                    >
                      Publicar Aviso
                    </button>
                  </form>
                </div>

                {/* Poll Creator */}
                <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-5 shadow-sm text-[#543d03]">
                  <h4 className="text-sm font-bold text-[#3c2a01] uppercase tracking-wider mb-4 border-b border-[#d2c595] pb-2 flex items-center gap-1.5">
                    <Vote className="w-4 h-4 text-[#705510]" /> Lançar Nova Enquete de Opinião
                  </h4>

                  {newEnqueteSuccess && (
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold mb-4">
                      Nova enquete aberta com sucesso para a turma!
                    </div>
                  )}

                  <form onSubmit={handleCreateEnquete} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#543d03]/90 uppercase mb-1">Pergunta da Enquete</label>
                      <input
                        type="text"
                        required
                        value={newEnqueteQuestion}
                        onChange={(e) => setNewEnqueteQuestion(e.target.value)}
                        placeholder="Ex: Qual deve ser a cor oficial dos copos do churrasco?"
                        className="w-full bg-white/50 border border-[#d2c595] text-[#543d03] text-xs p-2.5 rounded outline-none focus:border-[#705510] placeholder-[#543d03]/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#543d03]/90 uppercase">Opções de Escolha</label>
                      {newEnqueteOptions.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          required={optIdx < 2}
                          placeholder={`Opção nº ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => handleUpdateOptionText(optIdx, e.target.value)}
                          className="w-full bg-white/50 border border-[#d2c595] text-[#543d03] text-xs p-2 rounded outline-none focus:border-[#705510] placeholder-[#543d03]/50"
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddEnqueteOptionInput}
                        disabled={newEnqueteOptions.length >= 6}
                        className="border border-[#d2c595] hover:bg-white/20 px-3 py-2 rounded text-xs font-semibold text-[#543d03] flex-1 transition-colors disabled:opacity-50"
                      >
                        + Adicionar Opção
                      </button>

                      <button
                        type="submit"
                        className="bg-[#543d03] hover:bg-[#3c2a01] text-white font-bold px-4 py-2 rounded text-xs transition-colors shadow flex-1"
                      >
                        Publicar Enquete
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Student overview list */}
              <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl overflow-hidden shadow-sm text-[#543d03]">
                <div className="bg-white/40 border-b border-[#d2c595] px-5 py-3.5 font-bold text-sm text-[#3c2a01]">
                  Lista de Formandos Aderidos ({turmaStudents.length})
                </div>
                <div className="divide-y divide-[#d2c595]/30">
                  {turmaStudents.map(std => (
                    <div key={std.id} className="p-4 flex items-center justify-between text-sm flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {std.phone && (() => {
                            const cleanPhone = std.phone.replace(/\D/g, '');
                            const waNumber = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
                            return (
                              <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-all flex items-center justify-center cursor-pointer"
                                title={`Falar com ${std.name} no WhatsApp`}
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.885-6.963C16.588 1.964 14.12 1.04 11.498 1.04c-5.43 0-9.85 4.414-9.855 9.852-.002 1.712.447 3.382 1.299 4.843L1.875 20.94l5.312-1.393L6.647 19.15zM17.01 14.39c-.274-.138-1.62-.8-1.87-.891-.25-.091-.433-.138-.616.138-.183.276-.708.891-.867 1.074-.158.184-.317.207-.591.069a7.46 7.46 0 0 1-2.193-1.355 8.243 8.243 0 0 1-1.517-1.888c-.165-.284-.018-.438.12-.576.125-.123.275-.322.413-.483.137-.161.183-.276.275-.459.091-.184.046-.344-.023-.482-.069-.138-.616-1.484-.843-2.035-.222-.534-.445-.461-.616-.47l-.527-.01c-.183 0-.482.069-.733.344-.25.276-.957.935-.957 2.279 0 1.344.978 2.639 1.116 2.822.137.184 1.925 2.939 4.661 4.124.651.282 1.159.451 1.554.577.654.208 1.248.179 1.718.109.524-.079 1.62-.663 1.848-1.272.227-.609.227-1.129.158-1.239-.069-.11-.252-.178-.526-.316z"/>
                                </svg>
                              </a>
                            );
                          })()}
                          <div className="font-bold text-[#3c2a01]">{std.name}</div>
                        </div>
                        <div className="text-[10px] text-[#543d03]/70 mt-0.5">{std.email} • {std.phone}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#543d03]">
                            {std.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pagos
                          </div>
                          <div className="text-[9px] text-[#543d03]/50 font-mono">de {std.totalDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        </div>

                        {std.status === 'Ativo' ? (
                          <span className="text-emerald-700 text-[10px] font-bold">
                            Em Dia
                          </span>
                        ) : std.status === 'Pendente' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-700 text-[10px] font-bold">
                              Pendente
                            </span>
                            <button
                              onClick={() => {
                                const remaining = Math.max(0, std.totalDue - std.totalPaid);
                                const remainingFormatted = remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                                const reminderMsg = `Olá ${std.name}! Tudo bem?\n\nAqui é da Comissão de Formatura da ${studentTurma.name}.\n\nGostaríamos de lembrar que você possui parcelas pendentes com a faturadora WM2 Produções. O valor em aberto é de ${remainingFormatted}.\n\nVocê pode acessar o seu portal do formando no link abaixo para emitir os códigos de barra de boletos, pix copia/cola ou abrir o link direto do faturamento via WhatsApp:\n🔗 ${window.location.origin}\n\nQualquer dúvida, estamos à disposição para ajudar! 😉`;
                                
                                const cleanPhone = std.phone.replace(/\D/g, '');
                                const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                                window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(reminderMsg)}`, '_blank');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                              title="Enviar lembrete de cobrança via WhatsApp"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> Cobrar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-rose-700 text-[10px] font-bold">
                              Inadimplente
                            </span>
                            <button
                              onClick={() => {
                                const remaining = Math.max(0, std.totalDue - std.totalPaid);
                                const remainingFormatted = remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                                const reminderMsg = `Olá ${std.name}! Tudo bem?\n\nAqui é da Comissão de Formatura da ${studentTurma.name}.\n\nGostaríamos de lembrar que você possui parcelas em atraso com a faturadora WM2 Produções. O valor vencido é de ${remainingFormatted}.\n\nVocê pode acessar o seu portal do formando no link abaixo para emitir os códigos de barra de boletos, pix copia/cola ou abrir o link direto do faturamento via WhatsApp:\n🔗 ${window.location.origin}\n\nQualquer dúvida, estamos à disposição para ajudar! 😉`;
                                
                                const cleanPhone = std.phone.replace(/\D/g, '');
                                const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                                window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(reminderMsg)}`, '_blank');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                              title="Enviar lembrete de cobrança via WhatsApp"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> Cobrar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Floating Real-Time Push Notification Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-white border-2 border-[#aa904f] rounded-2xl shadow-2xl overflow-hidden p-4 font-sans flex gap-3.5"
          >
            <div className="bg-[#dfd1a1]/30 p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#705510]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-[#705510] px-1.5 py-0.5 rounded">
                  {activeToast.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold font-mono">
                  Agora mesmo
                </span>
              </div>
              <h4 className="font-extrabold text-xs text-neutral-900 mt-1.5 truncate">
                {activeToast.title}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 leading-normal line-clamp-2">
                {activeToast.body}
              </p>
              
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setActiveToast(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#705510] hover:bg-[#543d03] text-white px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors shadow-xs cursor-pointer"
                >
                  Visualizar Alerta
                </button>
                <button
                  onClick={() => setActiveToast(null)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen High-Quality Photo Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && activeDisplayPhotos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl text-white flex flex-col justify-between select-none p-3 sm:p-6"
          >
            {/* Lightbox Header Bar */}
            <div className="flex items-center justify-between gap-4 bg-black/50 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="bg-[#8d1811] text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase shadow shrink-0">
                  {activeDisplayPhotos[lightboxIndex].eventName}
                </span>
                {activeDisplayPhotos[lightboxIndex].formandoId ? (
                  <span className="bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase shadow shrink-0 hidden sm:inline-flex items-center gap-1">
                    🔒 Exclusivo
                  </span>
                ) : (
                  <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase shadow shrink-0 hidden sm:inline-flex">
                    🌐 Geral
                  </span>
                )}
                <span className="text-white/70 font-mono text-xs sm:text-sm font-bold truncate">
                  {lightboxIndex + 1} / {activeDisplayPhotos.length}
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setLightboxZoom(prev => Math.max(0.75, prev - 0.25))}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
                    title="Reduzir Zoom"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1.5 text-amber-300">
                    {Math.round(lightboxZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setLightboxZoom(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {lightboxZoom !== 1 && (
                    <button
                      onClick={() => setLightboxZoom(1)}
                      className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ml-1"
                      title="Resetar Zoom"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Direct HD Download */}
                <button
                  onClick={() => handleDownloadPhoto(activeDisplayPhotos[lightboxIndex!].url, activeDisplayPhotos[lightboxIndex!].eventName)}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer hover:scale-105"
                  title="Baixar Foto em Alta Definição"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Baixar HD</span>
                </button>

                {/* Close Lightbox */}
                <button
                  onClick={() => {
                    setLightboxIndex(null);
                    setLightboxZoom(1);
                  }}
                  className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-xl transition-all cursor-pointer border border-white/20"
                  title="Fechar (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Central Viewport with Navigation Controls */}
            <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden select-none group">
              {/* Previous Button */}
              <button
                onClick={() => {
                  setLightboxIndex(prev => (prev === null || prev <= 0 ? activeDisplayPhotos.length - 1 : prev - 1));
                  setLightboxZoom(1);
                }}
                className="absolute left-2 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-2xl"
                title="Anterior (Seta Esquerda)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              {/* Scalable High Quality Image with Instant Blur-Up */}
              <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-auto">
                <BlurUpImage
                  key={activeDisplayPhotos[lightboxIndex].id}
                  src={activeDisplayPhotos[lightboxIndex].url}
                  thumbnailSrc={activeDisplayPhotos[lightboxIndex].thumbnailUrl}
                  alt={activeDisplayPhotos[lightboxIndex].caption || 'Foto em alta definição'}
                  zoom={lightboxZoom}
                  showHdBadge={true}
                  priority={true}
                  className="w-full h-full max-w-[96vw] max-h-[76vh] sm:max-h-[80vh] md:max-h-[82vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 cursor-zoom-in"
                  containerClassName="w-full h-full"
                  onClick={() => setLightboxZoom(prev => prev === 1 ? 1.75 : 1)}
                />
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  setLightboxIndex(prev => (prev === null || prev >= activeDisplayPhotos.length - 1 ? 0 : prev + 1));
                  setLightboxZoom(1);
                }}
                className="absolute right-2 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-2xl"
                title="Próxima (Seta Direita)"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            {/* Lightbox Footer Info & Thumbnail Strip */}
            <div className="space-y-3 bg-black/50 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-amber-300 text-sm">{activeDisplayPhotos[lightboxIndex].eventName}</h5>
                  <p className="text-stone-300 max-w-2xl text-xs font-medium leading-relaxed">
                    {activeDisplayPhotos[lightboxIndex].caption || 'Sem legenda cadastrada.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <button
                    onClick={() => handleLikePhoto(activeDisplayPhotos[lightboxIndex!].id)}
                    className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors font-bold cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>{activeDisplayPhotos[lightboxIndex].likes} Likes</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>{activeDisplayPhotos[lightboxIndex].comments?.length || 0} Comentários</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Selector Strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-h-16 pt-1 border-t border-white/10">
                {activeDisplayPhotos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxZoom(1);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === lightboxIndex
                        ? 'border-amber-400 scale-110 shadow-lg'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Alterar Senha do Aluno */}
      <AnimatePresence>
        {isChangeStudentPassOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden text-neutral-900"
            >
              <div className="bg-[#543d03] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-[#dfd1a1]" />
                  <h3 className="font-extrabold text-sm text-white">Alterar Minha Senha de Acesso</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangeStudentPassOpen(false)}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-black/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStudentPasswordChangeSubmit} className="p-6 space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Crie uma nova senha de acesso para o seu portal do formando.
                </p>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newStudentPass}
                    onChange={(e) => setNewStudentPass(e.target.value)}
                    placeholder="Sua nova senha..."
                    className="w-full bg-slate-50 border border-neutral-300 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-[#aa904f] font-mono text-neutral-900"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmStudentPass}
                    onChange={(e) => setConfirmStudentPass(e.target.value)}
                    placeholder="Repita a nova senha..."
                    className="w-full bg-slate-50 border border-neutral-300 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-[#aa904f] font-mono text-neutral-900"
                  />
                </div>

                {changeStudentPassMsg && (
                  <p className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 font-medium ${
                    changeStudentPassMsg.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {changeStudentPassMsg.text}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangeStudentPassOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#dfd1a1]" /> Salvar Nova Senha
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Welcome Tour Component for Student First Login */}
      <StudentWelcomeTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        studentName={currentStudent.name}
        onStepChange={handleTourStepChange}
      />
    </div>
  );
}
