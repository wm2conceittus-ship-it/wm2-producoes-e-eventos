import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  Users, 
  Award, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Church,
  ShoppingBag,
  X,
  Menu,
  Home,
  Eye,
  EyeOff,
  User,
  MessageCircle,
  Check,
  Instagram,
  Facebook,
  Youtube,
  Lock,
  AlertCircle,
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Maximize,
  Minimize
} from 'lucide-react';
import { trackConversionEvent } from '../lib/pixelTracker';
import Logo from './Logo';
import BlurUpImage from './BlurUpImage';
import { Role, Formando } from '../types';
import { getHighResImageUrl } from '../utils/imageOptimizer';

const graduationHeroBg = getHighResImageUrl('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 2560, 92);
const champagneToastGala = getHighResImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552', 2000, 90);
const outdoorPhotoshoot = getHighResImageUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c', 2000, 90);
const ceremonyHall = getHighResImageUrl('https://images.unsplash.com/photo-1523580494863-6f303122450d', 2000, 90);

const initialProductGalleries: Record<string, { url: string; title: string }[]> = {
  album: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1544947950-fa07a98d237f', 1600, 90), title: 'Álbum de Gala Aberto' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552', 1600, 90), title: 'Página Panorâmica de Formatura' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1527529482837-4698179dc6ce', 1600, 90), title: 'Close-up de Alta Resolução' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3', 1600, 90), title: 'Capa Gravada Personalizada de Luxo' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1511578314322-379afb476865', 1600, 90), title: 'Textura e Acabamento do Estojo' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 1600, 90), title: 'Lembranças Eternas da Cerimônia' }
  ],
  placa: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 1600, 90), title: 'Placa Instalada na Universidade' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1497366216548-37526070297c', 1600, 90), title: 'Hall de Entrada com Placa Oficial' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', 1600, 90), title: 'Detalhes Metálicos em Relevo' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1497215728101-856f4ea42174', 1600, 90), title: 'Acabamento Inox de Alta Resistência' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1531973576160-7125cd663d86', 1600, 90), title: 'Gravação à Laser de Alta Definição' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1504384308090-c894fdcc538d', 1600, 90), title: 'Efeito Espelhado e Borda Polida' }
  ],
  estudio: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 1600, 90), title: 'Direção Fotográfica Profissional' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1516873240891-4bf014598ab4', 1600, 90), title: 'Iluminação de Estúdio no Local' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb', 1600, 90), title: 'Retrato Feminino de Alta Resolução' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 1600, 90), title: 'Ensaio Retrato Masculino Elegante' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1505232458627-a727266a704e', 1600, 90), title: 'Backstage da Equipe Técnica' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1529156069898-49953e39b3ac', 1600, 90), title: 'Sessão Externa de Confraternização' }
  ],
  quadro: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 1600, 90), title: 'Quadro Decorativo na Sala de Estar' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1519671482749-fd09be7ccebf', 1600, 90), title: 'Moldura de Luxo no Escritório' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1544025162-d76694265947', 1600, 90), title: 'Tela de Algodão Texturizado Fine Art' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1531685250784-7569952593d2', 1600, 90), title: 'Chassi de Madeira Resistente Imunizada' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1580136579312-94651dfd596d', 1600, 90), title: 'Cores de Impressão de Nível de Museus' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119', 1600, 90), title: 'Exibição de Galeria de Arte Moderna' }
  ],
  beca: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 1600, 90), title: 'Beca para Colação de Grau' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f', 1600, 90), title: 'Solenidade de Colação' }
  ],
  anel: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1605100804763-247f67b3557e', 1600, 90), title: 'Anel de Formatura em Ouro com Emblema' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908', 1600, 90), title: 'Pedra de Curso Lapidada' }
  ],
  convite: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1519671482749-fd09be7ccebf', 1600, 90), title: 'Convite de Luxo com Hot Stamping' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 1600, 90), title: 'Acabamento Especial em Relevo' }
  ],
  brindes: [
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552', 1600, 90), title: 'Kit de Brindes e Souvenirs Exclusivos' },
    { url: getHighResImageUrl('https://images.unsplash.com/photo-1511578314322-379afb476865', 1600, 90), title: 'Lembranças da Turma' }
  ]
};

interface LandingPageProps {
  onEnterPortal: (role: Role, studentId?: string) => void;
  formandos: Formando[];
  portfolioAlbums?: any[];
  productGalleries?: Record<string, { url: string; title: string }[]>;
}

function PortfolioPhotoCard({
  photo,
  album,
  index,
  onOpenLightbox
}: {
  photo: { url: string; title: string; objectPosition?: string };
  album: any;
  index: number;
  onOpenLightbox: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const highDefUrl = getHighResImageUrl(photo.url, 1200, 94);

  return (
    <motion.div
      layoutId={`photo-${album.id}-${index}`}
      onClick={onOpenLightbox}
      className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-2xl group cursor-pointer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ scale: 1.03, y: -3 }}
    >
      {!hasError ? (
        <img
          src={highDefUrl}
          srcSet={`${getHighResImageUrl(photo.url, 600, 92)} 600w, ${getHighResImageUrl(photo.url, 1200, 94)} 1200w, ${getHighResImageUrl(photo.url, 1800, 95)} 1800w`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={photo.title || 'Foto do Portfólio WM2'}
          onError={() => setHasError(true)}
          style={{ 
            objectPosition: photo.objectPosition || 'center top',
            imageRendering: 'auto'
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex flex-col items-center justify-center p-3 text-center border border-amber-500/20">
          <Camera className="w-6 h-6 text-[#aa904f] mb-1.5 opacity-80" />
          <span className="text-[10px] text-neutral-300 font-bold truncate max-w-full">
            {photo.title || 'WM2 Produções'}
          </span>
          <span className="text-[8px] text-amber-400/80 uppercase tracking-widest mt-0.5">
            Portfólio WM2
          </span>
        </div>
      )}

      {/* HD Indicator Pill */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-xs text-[#ffe29a] text-[9px] font-black px-1.5 py-0.5 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
        <Sparkles className="w-2.5 h-2.5 text-[#aa904f]" /> HD
      </div>

      {/* Hover overlay with zoom icon */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-end p-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-[#aa904f] text-white p-2 rounded-full w-8 h-8 flex items-center justify-center self-center mb-auto mt-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
          <Eye className="w-4 h-4" />
        </div>
        <h4 className="text-white font-bold text-xs drop-shadow-md truncate">
          {photo.title || 'Registro Oficial'}
        </h4>
        <p className="text-[9px] text-amber-300 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1 drop-shadow-md">
          <Sparkles className="w-2.5 h-2.5 text-[#aa904f]" /> WM2 Ultra HD
        </p>
      </div>
    </motion.div>
  );
}

export default function LandingPage({ 
  onEnterPortal, 
  formandos = [],
  portfolioAlbums,
  productGalleries: propProductGalleries
}: LandingPageProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<{ url: string; title: string }[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setLightboxZoom(1);
      } else if (e.key === 'ArrowLeft') {
        setCurrentPhotoIdx((prev) => (prev === 0 ? lightboxPhotos.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIdx((prev) => (prev === lightboxPhotos.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxPhotos.length]);

  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Student Quick Auth Modal State
  const [isStudentAuthModalOpen, setIsStudentAuthModalOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Formando | null>(null);
  const [modalPasswordInput, setModalPasswordInput] = useState('');
  const [modalPasswordError, setModalPasswordError] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Admin Security Password State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateCv, setCandidateCv] = useState('');
  const [candidateSent, setCandidateSent] = useState(false);

  // Mobile Navigation Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Interactive Product Detail Modals
  type ProductId = 'album' | 'placa' | 'estudio' | 'quadro' | 'beca' | 'anel' | 'convite' | 'brindes';
  const [selectedProduct, setSelectedProduct] = useState<ProductId | null>(null);
  const [activeModalPhotoIdx, setActiveModalPhotoIdx] = useState<number>(0);
  const [plaqueTab, setPlaqueTab] = useState<'simulator' | 'gallery'>('simulator');
  
  // Placas Mural Customizer States
  const [plaqueMaterial, setPlaqueMaterial] = useState<'inox' | 'latao' | 'vidro' | 'acrylic_led'>('inox');
  const [plaqueTitle, setPlaqueTitle] = useState('ODONTOLOGIA UNICAMP');
  const [plaqueClassYear, setPlaqueClassYear] = useState('2025');
  const [plaqueQuote, setPlaqueQuote] = useState('Aos nossos pais, mestres e a todos que de forma direta ou indireta contribuíram para a nossa vitória.');

  const handleOpenProductModal = (prodId: ProductId) => {
    setSelectedProduct(prodId);
    setActiveModalPhotoIdx(0);
    setPlaqueTab('simulator');
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = adminPasswordInput.trim();
    const validAdminPasswords = [
      'WM22025', 'WM2@2025', 'WM2ADMIN', 'ADMIN', 'ADMIN123', '123456', 'WM2'
    ];
    const customPassword = localStorage.getItem('wm2_admin_password')?.trim();

    if (!trimmed) {
      setAdminPasswordError('Por favor, digite a senha de administrador.');
      return;
    }

    if (
      validAdminPasswords.includes(trimmed.toUpperCase()) ||
      (customPassword && trimmed.toUpperCase() === customPassword.toUpperCase())
    ) {
      setAdminPasswordError('');
      setAdminPasswordInput('');
      setIsAdminAuthModalOpen(false);
      onEnterPortal('admin');
    } else {
      setAdminPasswordError('Senha de administrador incorreta! Tente novamente.');
    }
  };

  const validateStudentPassword = (student: Formando, passInput: string): boolean => {
    const trimmedPass = passInput.trim();
    if (!trimmedPass) return false;

    // Check custom saved student password in localStorage
    const savedCustomPass = localStorage.getItem(`wm2_student_pass_${student.id}`)?.trim();
    if (savedCustomPass && savedCustomPass === trimmedPass) {
      return true;
    }

    if (student.password && student.password === trimmedPass) {
      return true;
    }

    // Default accepted passwords for mock students
    const defaultAccepted = [
      '3456789',
      '123456',
      '1234',
      '12345678',
      'WM22025',
      'wm22025',
      student.studentCode?.toUpperCase(),
      student.cpf?.replace(/[^0-9]/g, '').slice(-4),
      student.cpf?.replace(/[^0-9]/g, '')
    ].filter(Boolean);

    return defaultAccepted.includes(trimmedPass) || defaultAccepted.includes(trimmedPass.toUpperCase());
  };

  const handleCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loginClean = accessCodeInput.trim();
    const passClean = studentPasswordInput.trim();

    if (!loginClean) {
      setLoginError('Por favor, digite o seu E-mail, CPF ou Código do Aluno.');
      return;
    }

    if (!passClean) {
      setLoginError('Por favor, informe a sua senha de acesso.');
      return;
    }

    // Check admin password entry in login box
    const validAdminPasswords = ['WM22025', 'WM2@2025', 'WM2ADMIN', 'ADMIN', 'ADMIN123', 'WM2'];
    const customAdminPassword = localStorage.getItem('wm2_admin_password')?.trim().toUpperCase();
    if (
      validAdminPasswords.includes(loginClean.toUpperCase()) ||
      (customAdminPassword && loginClean.toUpperCase() === customAdminPassword)
    ) {
      setLoginError('');
      setAccessCodeInput('');
      setStudentPasswordInput('');
      onEnterPortal('admin');
      return;
    }

    // Find student by code, email or CPF
    const matchedStudent = formandos.find(f => {
      const cCode = f.studentCode?.trim().toLowerCase();
      const cEmail = f.email?.trim().toLowerCase();
      const cCpfDigits = f.cpf?.replace(/[^0-9]/g, '');
      const inputDigits = loginClean.replace(/[^0-9]/g, '');
      const inputLower = loginClean.toLowerCase();

      return (
        (cCode && cCode === inputLower) ||
        (cEmail && cEmail === inputLower) ||
        (cCpfDigits && inputDigits && cCpfDigits === inputDigits) ||
        f.id.toLowerCase() === inputLower
      );
    });

    if (!matchedStudent) {
      setLoginError('Aluno não encontrado. Verifique seu e-mail, CPF ou código de aluno.');
      return;
    }

    if (!validateStudentPassword(matchedStudent, passClean)) {
      setLoginError('Senha incorreta para o formando informado. (Senha padrão de acesso: 3456789)');
      return;
    }

    setLoginError('');
    setAccessCodeInput('');
    setStudentPasswordInput('');
    onEnterPortal(matchedStudent.role, matchedStudent.id);
  };

  const handleModalStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForModal) return;

    if (!modalPasswordInput.trim()) {
      setModalPasswordError('Por favor, digite a sua senha de acesso.');
      return;
    }

    if (!validateStudentPassword(selectedStudentForModal, modalPasswordInput)) {
      setModalPasswordError('Senha incorreta! A senha padrão de acesso é 3456789.');
      return;
    }

    setModalPasswordError('');
    setModalPasswordInput('');
    setIsStudentAuthModalOpen(false);
    onEnterPortal(selectedStudentForModal.role, selectedStudentForModal.id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    
    // Trigger conversion event on active tracking pixels (Meta Pixel, Google Ads, GA4)
    trackConversionEvent('Lead', {
      name: contactName,
      email: contactEmail,
      course_message: contactMessage,
      source: 'LandingPage_Form'
    });

    const emailTo = "wm2conceittus@icloud.com";
    const subject = encodeURIComponent("Solicitação de Orçamento - WM2 Produções e Eventos");
    const body = encodeURIComponent(
      `Olá, gostaria de solicitar um orçamento!\n\n` +
      `Nome Completo: ${contactName}\n` +
      `E-mail de Contato: ${contactEmail}\n` +
      `Curso / Mensagem:\n${contactMessage || 'Nenhuma mensagem adicional.'}`
    );
    const mailtoUrl = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    
    setContactSent(true);
    
    // Automatically trigger the mailto link to open the email client
    window.location.href = mailtoUrl;
  };

  // Default initial portfolio albums fallback
  const initialGalleryAlbums = [
    {
      id: 'gala' as const,
      title: 'Baile de Gala',
      subtitle: 'Turma de Medicina USP',
      date: 'Novembro de 2025',
      cover: champagneToastGala,
      description: 'Uma noite extraordinária com buffet internacional de alta gastronomia, cenografia majestosa em 3D, banda show nacional e um brinde inesquecível de celebração.',
      photos: [
        { url: champagneToastGala, title: 'Brinde de Champanhe dos Formandos' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1511795409834-ef04bbd61622', 1800, 90), title: 'Brinde de Abertura Oficial da Valsa' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1469371670807-013ccf25f16a', 1800, 90), title: 'Mesas Decoradas e Fine Dining' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 1800, 90), title: 'Mega Show e Pista de Dança Lotada' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1504196606672-aef5c9cefc92', 1800, 90), title: 'Chuva de Balões Dourados' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', 1800, 90), title: 'Valsa dos Formandos com Familiares' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 1800, 90), title: 'Elegância dos Trajes de Gala' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1513151233558-d860c5398176', 1800, 90), title: 'Iluminação Cênica e Decoração Imperial' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552', 1800, 90), title: 'Foto Clássica dos Casais na Escadaria' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 1800, 90), title: 'Atração Musical e Performers' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1513584684374-8bab748fbf90', 1800, 90), title: 'Espaço de Coquetel de Luxo' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1514525253161-7a46d19cd819', 1800, 90), title: 'Encerramento e Chuva de Papel Picado' }
      ]
    },
    {
      id: 'shoot' as const,
      title: 'Sessão Fotográfica Externa',
      subtitle: 'Turma de Direito FGV',
      date: 'Outubro de 2025',
      cover: outdoorPhotoshoot,
      description: 'Sessão de fotos ao ar livre, ensaios individuais artísticos com beca completa em cenários históricos, e fotos de pura descontração e sorrisos com amigos.',
      photos: [
        { url: outdoorPhotoshoot, title: 'Retrato Clássico com o Diploma e Capelo' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846', 1800, 90), title: 'Ensaio Externo nos Jardins' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1507679799987-c73779587ccf', 1800, 90), title: 'Retrato Corporativo de Sucesso' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb', 1800, 90), title: 'Ensaio Fotográfico Individual de Estúdio' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c', 1800, 90), title: 'Foto de Grupo com Becas Completas' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1529156069898-49953e39b3ac', 1800, 90), title: 'Sorrisos Espontâneos de Conquista Coletiva' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3', 1800, 90), title: 'Pose Clássica com a Placa da Turma' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 1800, 90), title: 'Detalhe do Anel de Formatura e Caneta' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1519501025264-65ba15a82390', 1800, 90), title: 'Foto com Vista para o Skyline Urbano' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1518156677180-95a2893f3e9f', 1800, 90), title: 'Retrato ao Pôr do Sol com Beca' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1511632765486-a01980e01a18', 1800, 90), title: 'Abraço dos Melhores Amigos da Faculdade' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2', 1800, 90), title: 'Retrato Sorridente com Estética Moderna' }
      ]
    },
    {
      id: 'ceremony' as const,
      title: 'Colação de Grau',
      subtitle: 'Turma de Engenharia Mackenzie',
      date: 'Dezembro de 2025',
      cover: ceremonyHall,
      description: 'O momento solene e emocionante de outorga de grau, juramento de ética profissional, homenagens emocionantes e o clássico lançamento dos capelos.',
      photos: [
        { url: ceremonyHall, title: 'Abertura da Sessão Solene no Auditório' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1461896836934-ffe607ba8211', 1800, 90), title: 'O Clássico e Alegre Lançamento do Capelo' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644', 1800, 90), title: 'Momento da Outorga do Grau Acadêmico' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3', 1800, 90), title: 'Juramento e Discurso do Orador de Turma' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1471440671318-55ddd5f556cf', 1800, 90), title: 'Abraço Emocionante dos Pais e Familiares' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1558021211-6d1403321394', 1800, 90), title: 'Entrada Triunfal de Becas com os Patronos' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 1800, 90), title: 'O Diploma Entregue pelas Mãos da Reitoria' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', 1800, 90), title: 'Plenária de Formandos Assistindo ao Hino' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1511578314322-379afb476865', 1800, 90), title: 'Emoção Coletiva e Aplausos de Pé' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1431540015161-0bf868a2d407', 1800, 90), title: 'Mesa Diretiva e Autoridades Presentes' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1484807352052-23338990c6c6', 1800, 90), title: 'Retrato de Lágrimas e Orgulho das Mães' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1501504905252-473c47e087f8', 1800, 90), title: 'Fileira de Becas Prontas para o Juramento' }
      ]
    },
    {
      id: 'studio' as const,
      title: 'Ensaio Fotográfico em Estúdio',
      subtitle: 'Retratos Oficiais Individuais',
      date: 'Dezembro de 2025',
      cover: getHighResImageUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb', 1600, 90),
      description: 'Ensaios individuais com iluminação profissional de estúdio, capturando a essência e o orgulho de cada formando em retratos de altíssima definição.',
      photos: [
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb', 1800, 90), title: 'Retrato Clássico Feminino em Estúdio' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 1800, 90), title: 'Retrato Clássico Masculino em Estúdio' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2', 1800, 90), title: 'Expressão e Foco em Estúdio Fechado' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 1800, 90), title: 'Perfil Corporativo Elegante' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1521119989659-a83eee488004', 1800, 90), title: 'Retrato de Formando com Capelo' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04', 1800, 90), title: 'Iluminação Direcionada de Estúdio' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1494790108377-be9c29b29330', 1800, 90), title: 'Sorriso de Conquista Espontâneo' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 1800, 90), title: 'Retrato Corporativo de Alta Resolução' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1517841905240-472988babdf9', 1800, 90), title: 'Foco no Olhar e Determinação' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 1800, 90), title: 'Retrato de Formatura Clean em Fundo Neutro' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1501196354995-cbb51c65aaea', 1800, 90), title: 'Pose Profissional para Álbum Oficial' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6', 1800, 90), title: 'Espontaneidade e Alegria do Formando' }
      ]
    },
    {
      id: 'preparty' as const,
      title: 'Aula da Saudade',
      subtitle: 'Turma de Odontologia UNICAMP',
      date: 'Setembro de 2025',
      cover: getHighResImageUrl('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 1600, 90),
      description: 'A última aula inesquecível! Um momento descontraído e nostálgico repleto de memórias, homenagens engraçadas, retrospectiva em vídeo e celebração da trajetória acadêmica.',
      photos: [
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 1800, 90), title: 'Pista de Dança em Alta Energia' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 1800, 90), title: 'Balões e Efeitos Especiais' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', 1800, 90), title: 'Comemoração dos Formandos na Pista' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1517457373958-b7bdd4587205', 1800, 90), title: 'Barman Servindo Coquetéis Artesanais' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1496333031637-2f147c533b64', 1800, 90), title: 'Show ao Vivo para os Alunos' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1470225620780-dba8ba36b745', 1800, 90), title: 'Apresentação do DJ Principal' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1505232458627-a727266a704e', 1800, 90), title: 'Sunset Party ao Ar Livre' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1527529482837-4698179dc6ce', 1800, 90), title: 'Brinde Especial de Confraternização' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1528605248644-14dd04022da1', 1800, 90), title: 'Sorrisos e Abraços Coletivos da Turma' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1513151233558-d860c5398176', 1800, 90), title: 'Cenografia Moderna e Neon' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1516873240891-4bf014598ab4', 1800, 90), title: 'Espaço Gourmet de Convivência' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1561181286-d3fee7d55364', 1800, 90), title: 'Brinde Geral dos Formandos' }
      ]
    },
    {
      id: 'reception' as const,
      title: 'Fotos Meios',
      subtitle: 'Comemoração 50% Concluído',
      date: 'Outubro de 2025',
      cover: getHighResImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644', 1600, 90),
      description: 'A grande celebração do meio do curso! Registros fotográficos dinâmicos e contagiantes marcando os 50% da jornada acadêmica, com becas parciais, camisetas customizadas, placas comemorativas e muita festa.',
      photos: [
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644', 1800, 90), title: 'Comemoração dos 50% Concluído' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1529156069898-49953e39b3ac', 1800, 90), title: 'Alegria e União dos Formandos' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846', 1800, 90), title: 'Foto Oficial com Placa de Meio Curso' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c', 1800, 90), title: 'Descontração e Brinde da Turma' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4', 1800, 90), title: 'Festa Temática de Meio de Curso' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 1800, 90), title: 'Pista de Dança em Alta Energia' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1528605248644-14dd04022da1', 1800, 90), title: 'Abraços e Comemoração Coletiva' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 1800, 90), title: 'Efeitos Especiais na Celebração' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1505232458627-a727266a704e', 1800, 90), title: 'Sunset Party de Meio de Curso' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', 1800, 90), title: 'Registros Especiais com Camisetas da Turma' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1561181286-d3fee7d55364', 1800, 90), title: 'Brinde Geral dos Formandos' },
        { url: getHighResImageUrl('https://images.unsplash.com/photo-1523580494863-6f303122450d', 1800, 90), title: 'Ensaio Comemorativo Metade Cumprida' }
      ]
    }
  ];

  const sanitizeAlbums = (albums: any[]) => {
    if (!Array.isArray(albums)) return albums;
    return albums.map(alb => {
      let updated = alb;
      if (alb?.title === 'Ato Religioso' || (alb?.id === 'reception' && alb?.title === 'Ato Religioso')) {
        updated = {
          ...alb,
          title: 'Fotos Meios',
          subtitle: alb.subtitle === 'Missa & Culto Ecumênico' || alb.subtitle === 'Turma de Arquitetura Mackenzie' ? 'Comemoração 50% Concluído' : alb.subtitle,
          description: alb.description && alb.description.includes('fé') ? 'A grande celebração do meio do curso! Registros fotográficos dinâmicos e contagiantes marcando os 50% da jornada acadêmica, com becas parciais, camisetas customizadas, placas comemorativas e muita festa.' : alb.description
        };
      }
      if (Array.isArray(updated?.photos) && updated.photos.length > 12) {
        updated = {
          ...updated,
          photos: updated.photos.slice(0, 12)
        };
      }
      return updated;
    });
  };

  const [galleryAlbums, setGalleryAlbums] = useState(() => {
    if (Array.isArray(portfolioAlbums)) {
      return sanitizeAlbums(portfolioAlbums);
    }
    const saved = localStorage.getItem('wm2_portfolio_albums');
    if (saved) {
      try {
        return sanitizeAlbums(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar álbuns customizados do portfólio', e);
      }
    }
    return initialGalleryAlbums;
  });

  const [productGalleries, setProductGalleries] = useState(() => {
    if (propProductGalleries && typeof propProductGalleries === 'object') {
      return propProductGalleries;
    }
    const saved = localStorage.getItem('wm2_product_galleries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao carregar galerias de produtos customizadas', e);
      }
    }
    return initialProductGalleries;
  });

  // Sync state when props arrive or update from Firebase Firestore in real-time
  useEffect(() => {
    if (Array.isArray(portfolioAlbums)) {
      setGalleryAlbums(sanitizeAlbums(portfolioAlbums));
    }
  }, [portfolioAlbums]);

  useEffect(() => {
    if (propProductGalleries && typeof propProductGalleries === 'object') {
      setProductGalleries(propProductGalleries);
    }
  }, [propProductGalleries]);

  useEffect(() => {
    const handlePortfolioUpdate = () => {
      if (Array.isArray(portfolioAlbums) && portfolioAlbums.length > 0) return;
      const saved = localStorage.getItem('wm2_portfolio_albums');
      if (saved) {
        try {
          setGalleryAlbums(sanitizeAlbums(JSON.parse(saved)));
        } catch (e) {
          console.error(e);
        }
      } else {
        setGalleryAlbums(initialGalleryAlbums);
      }
    };

    const handleProductUpdate = () => {
      if (propProductGalleries && typeof propProductGalleries === 'object' && Object.keys(propProductGalleries).length > 0) return;
      const saved = localStorage.getItem('wm2_product_galleries');
      if (saved) {
        try {
          setProductGalleries(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        setProductGalleries(initialProductGalleries);
      }
    };

    window.addEventListener('wm2_portfolio_updated', handlePortfolioUpdate);
    window.addEventListener('wm2_products_updated', handleProductUpdate);
    window.addEventListener('storage', handlePortfolioUpdate);
    window.addEventListener('storage', handleProductUpdate);
    return () => {
      window.removeEventListener('wm2_portfolio_updated', handlePortfolioUpdate);
      window.removeEventListener('wm2_products_updated', handleProductUpdate);
      window.removeEventListener('storage', handlePortfolioUpdate);
      window.removeEventListener('storage', handleProductUpdate);
    };
  }, [portfolioAlbums, propProductGalleries]);

  return (
    <div className="min-h-screen bg-white dark:bg-white text-neutral-800 dark:text-neutral-900 font-sans selection:bg-[#c5b072]/30">
      {/* Top Black Bar (Tarja Preta) with Social Media & Contact */}
      <div className="bg-neutral-950 text-neutral-300 border-b border-neutral-800 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Contact Details */}
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#aa904f]" /> (88) 3111-6870 / (88) 99439-4418
            </span>
            <span className="hidden md:inline text-neutral-700">|</span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#aa904f]" /> wm2conceittus@icloud.com
            </span>
          </div>

          {/* Social Media Links (Instagram, Facebook, YouTube) */}
          <div className="flex items-center gap-4 font-medium text-[11px]">
            <span className="text-neutral-500 hidden lg:inline uppercase tracking-wider text-[10px]">Siga a WM2:</span>
            
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#aa904f] transition-colors group"
              title="Siga no Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-[#aa904f] group-hover:scale-110 transition-transform" />
              <span>Instagram</span>
            </a>

            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#aa904f] transition-colors group"
              title="Siga no Facebook"
            >
              <Facebook className="w-3.5 h-3.5 text-[#aa904f] group-hover:scale-110 transition-transform" />
              <span>Facebook</span>
            </a>

            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#aa904f] transition-colors group"
              title="Inscreva-se no YouTube"
            >
              <Youtube className="w-3.5 h-3.5 text-[#aa904f] group-hover:scale-110 transition-transform" />
              <span>YouTube</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#aa904f]/30 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo showSubtitle={true} className="w-36" variant="color" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#inicio" className="text-neutral-900 dark:text-neutral-900 hover:text-[#aa904f] pb-1.5 border-b-2 border-transparent hover:border-[#aa904f] transition-all duration-300 font-semibold">Início</a>
            <a href="#servicos" className="text-neutral-900 dark:text-neutral-900 hover:text-[#aa904f] pb-1.5 border-b-2 border-transparent hover:border-[#aa904f] transition-all duration-300 font-semibold">Serviços</a>
            <a href="#produtos" className="text-neutral-900 dark:text-neutral-900 hover:text-[#aa904f] pb-1.5 border-b-2 border-transparent hover:border-[#aa904f] transition-all duration-300 font-semibold">Produtos</a>
            <a href="#portfolio" className="text-neutral-900 dark:text-neutral-900 hover:text-[#aa904f] pb-1.5 border-b-2 border-transparent hover:border-[#aa904f] transition-all duration-300 font-semibold">Portfólio</a>
            <a href="#contato" className="text-neutral-900 dark:text-neutral-900 hover:text-[#aa904f] pb-1.5 border-b-2 border-transparent hover:border-[#aa904f] transition-all duration-300 font-semibold">Contato</a>
            <a href="#portal" className="bg-[#aa904f] text-white hover:bg-[#967e3a] px-4 py-2 rounded-lg transition-colors shadow-md">Acessar Portal</a>
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu de navegação"}
              className="p-2 text-neutral-800 hover:text-[#aa904f] hover:bg-neutral-100 active:bg-neutral-200 rounded-lg transition-all focus:outline-hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7 text-[#aa904f]" />
              ) : (
                <Menu className="w-7 h-7 text-neutral-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden border-t border-[#aa904f]/20 bg-white/98 backdrop-blur-md shadow-xl overflow-hidden"
            >
              <div className="px-5 pt-3 pb-6 space-y-1.5 divide-y divide-neutral-100">
                <div className="space-y-1 pb-3">
                  <a
                    href="#inicio"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-neutral-900 hover:text-[#aa904f] hover:bg-[#dfd1a1]/15 active:bg-[#dfd1a1]/25 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#dfd1a1]/25 flex items-center justify-center text-[#aa904f]">
                      <Home className="w-4 h-4" />
                    </div>
                    <span>Início</span>
                  </a>

                  <a
                    href="#servicos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-neutral-900 hover:text-[#aa904f] hover:bg-[#dfd1a1]/15 active:bg-[#dfd1a1]/25 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#dfd1a1]/25 flex items-center justify-center text-[#aa904f]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>Serviços</span>
                  </a>

                  <a
                    href="#produtos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-neutral-900 hover:text-[#aa904f] hover:bg-[#dfd1a1]/15 active:bg-[#dfd1a1]/25 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#dfd1a1]/25 flex items-center justify-center text-[#aa904f]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span>Produtos</span>
                  </a>

                  <a
                    href="#portfolio"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-neutral-900 hover:text-[#aa904f] hover:bg-[#dfd1a1]/15 active:bg-[#dfd1a1]/25 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#dfd1a1]/25 flex items-center justify-center text-[#aa904f]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span>Portfólio</span>
                  </a>

                  <a
                    href="#contato"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-neutral-900 hover:text-[#aa904f] hover:bg-[#dfd1a1]/15 active:bg-[#dfd1a1]/25 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#dfd1a1]/25 flex items-center justify-center text-[#aa904f]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>Contato</span>
                  </a>
                </div>

                {/* Mobile Portal CTA Button */}
                <div className="pt-3">
                  <a
                    href="#portal"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-[#aa904f] hover:bg-[#967e3a] active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm uppercase tracking-wide"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>Acessar Portal WM2</span>
                  </a>
                </div>

                {/* Fast Contact info inside mobile menu */}
                <div className="pt-3 flex items-center justify-around text-xs text-neutral-600">
                  <a 
                    href="tel:8831116870" 
                    className="flex items-center gap-1.5 hover:text-[#aa904f] py-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#aa904f]" /> (88) 3111-6870
                  </a>
                  <span className="text-neutral-300">|</span>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 hover:text-[#aa904f] py-1 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#aa904f]" /> Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden py-24 lg:py-32 text-white border-b border-neutral-100 flex items-center justify-center min-h-[85vh]">
        {/* Full-width background graduation photo - 100% sharp and clear */}
        <div className="absolute inset-0 z-0">
          <img 
            src={graduationHeroBg} 
            alt="Formatura WM2" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Elegant dark overlay to guarantee excellent text contrast and legibility without boxy backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#201a0e]/80 via-[#201a0e]/50 to-[#201a0e]/60 z-10"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center text-center justify-center">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#ffe29a] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 w-fit animate-pulse mx-auto backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#aa904f]" />
            Sua formatura, nossa obra de arte
          </motion.div>
          
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.1 }}
             className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl drop-shadow-md"
          >
            Criamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd369] via-[#fceab9] to-[#d0b363]">Momentos Inesquecíveis</span> para sua formatura
          </motion.h1>
          
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="text-lg sm:text-xl text-neutral-200 max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow"
          >
            A WM2 Produções & Eventos é referência nacional em planejamento, cenografia, produção e cobertura fotográfica para formaturas de alto padrão. Cuidamos de cada detalhe com paixão e excelência.
          </motion.p>
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="flex flex-wrap justify-center gap-4"
          >
            <a href="#portal" className="bg-gradient-to-r from-[#ffe29a] via-[#c5b072] to-[#aa904f] text-neutral-900 hover:brightness-110 font-bold px-8 py-3.5 rounded-none shadow-xl flex items-center gap-2 transition-all text-sm uppercase tracking-wider">
              Entrar no Portal WM2
              <ArrowRight className="w-4 h-4 text-neutral-900" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats section */}
      <section className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] border-y border-[#aa904f]/40 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-neutral-950">25+</div>
            <div className="text-xs uppercase tracking-wider text-neutral-900 mt-1 font-bold">Anos de História</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-neutral-950">250+</div>
            <div className="text-xs uppercase tracking-wider text-neutral-900 mt-1 font-bold">Turmas Formadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-neutral-950">35k+</div>
            <div className="text-xs uppercase tracking-wider text-neutral-900 mt-1 font-bold">Formandos Felizes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-neutral-950">100%</div>
            <div className="text-xs uppercase tracking-wider text-neutral-900 mt-1 font-bold">Fidelidade Cerimonial</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#aa904f] mb-2">Assessoria Completa</h2>
          <p className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">O que fazemos por você</p>
          <div className="h-1 w-20 bg-[#aa904f] mx-auto mt-4 rounded"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-[#faf8f2] p-8 rounded-xl shadow-sm border border-[#aa904f]/30 hover:border-[#aa904f]/70 hover:shadow-md hover:shadow-[#aa904f]/10 hover:-translate-y-1 transition-all">
            <div className="bg-[#dfd1a1]/25 text-[#aa904f] w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <GraduationCap className="w-6 h-6 text-[#aa904f]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Cerimonial & Colação</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Organização protocolar perfeita com roteiro personalizado, becas higienizadas, ensaios estruturados e cenografia solene impecável.
            </p>
          </div>

          <div className="bg-[#faf8f2] p-8 rounded-xl shadow-sm border border-[#aa904f]/30 hover:border-[#aa904f]/70 hover:shadow-md hover:shadow-[#aa904f]/10 hover:-translate-y-1 transition-all">
            <div className="bg-[#dfd1a1]/25 text-[#aa904f] w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <Church className="w-6 h-6 text-[#aa904f]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Cerimônia Religiosa</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Celebração ecumênica e missa em ação de graças solene, com trilhas emocionantes, decoração litúrgica refinada e momentos de profunda gratidão.
            </p>
          </div>

          <div className="bg-[#faf8f2] p-8 rounded-xl shadow-sm border border-[#aa904f]/30 hover:border-[#aa904f]/70 hover:shadow-md hover:shadow-[#aa904f]/10 hover:-translate-y-1 transition-all">
            <div className="bg-[#dfd1a1]/25 text-[#aa904f] w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <Calendar className="w-6 h-6 text-[#aa904f]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Baile de Gala</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Gastronomia refinada, carta de drinks exclusivos, projetos luminotécnicos 3D e as melhores bandas shows e atrações de renome nacional.
            </p>
          </div>

          <div className="bg-[#faf8f2] p-8 rounded-xl shadow-sm border border-[#aa904f]/30 hover:border-[#aa904f]/70 hover:shadow-md hover:shadow-[#aa904f]/10 hover:-translate-y-1 transition-all">
            <div className="bg-[#dfd1a1]/25 text-[#aa904f] w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-6 h-6 text-[#aa904f]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Departamento de Fotografia</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Sessões de fotos em estúdio e externas exclusivas, fotógrafos artísticos equipados e plataforma inteligente para escolha e compra de álbuns.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio/Gallery */}
      <section id="portfolio" className="py-24 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#aa904f] mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#aa904f]" /> Portfólio de Ouro
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Galeria de Eventos Recentes
            </p>
            <p className="text-neutral-500 text-xs mt-3 max-w-2xl mx-auto">
              Navegue pelas nossas <strong>6 galerias fotográficas exclusivas</strong> e confira a sofisticação, emoção e excelência técnica que a WM2 entrega em cada celebração oficial.
            </p>
          </div>

          {/* Render All 6 Galleries Vertically Stacked */}
          <div className="space-y-20">
            {galleryAlbums.map((album, albumIdx) => (
              <div key={album.id} className="animate-fade-in">
                {/* Gallery Section Header */}
                <div className="border-l-4 border-[#aa904f] pl-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-1 tracking-tight">
                      {album.title}
                    </h3>
                    <p className="text-neutral-500 text-xs mt-1.5 max-w-2xl leading-relaxed">
                      {album.description}
                    </p>
                  </div>
                </div>

                {/* Photos Grid for this specific Album */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                  {album.photos.map((photo: any, index: number) => (
                    <PortfolioPhotoCard
                      key={index}
                      photo={photo}
                      album={album}
                      index={index}
                      onOpenLightbox={() => {
                        setLightboxPhotos(album.photos);
                        setLightboxTitle(`${album.title} — ${album.subtitle}`);
                        setCurrentPhotoIdx(index);
                        setIsLightboxOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Modern Lightbox Modal Viewer */}
      {isLightboxOpen && lightboxPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-2 sm:p-4 select-none animate-fade-in">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between text-white max-w-7xl mx-auto w-full pt-1 pb-2 border-b border-white/10 gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block truncate">
                {lightboxTitle}
              </span>
              <h5 className="text-xs sm:text-sm font-bold truncate text-neutral-100">
                {lightboxPhotos[currentPhotoIdx]?.title || 'Registro Fotográfico'}
              </h5>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.max(0.75, prev - 0.25))}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
                  title="Reduzir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold px-1 text-[#c5a880] min-w-[34px] text-center">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.min(3, prev + 0.25))}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {lightboxZoom !== 1 && (
                  <button
                    type="button"
                    onClick={() => setLightboxZoom(1)}
                    className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ml-1 text-[#c5a880]"
                    title="Resetar Zoom"
                  >
                    100%
                  </button>
                )}
              </div>

              {/* Photo Counter */}
              <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl text-neutral-200 border border-white/10 font-bold hidden sm:inline-block">
                {currentPhotoIdx + 1} / {lightboxPhotos.length}
              </span>

              {/* Direct HD Download Button */}
              <button
                type="button"
                onClick={() => {
                  const curr = lightboxPhotos[currentPhotoIdx];
                  if (!curr) return;
                  const link = document.createElement('a');
                  link.href = curr.url;
                  link.download = `${curr.title || 'foto-wm2-formatura'}.jpg`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-[#c5a880] hover:bg-[#dfd1a1] text-neutral-950 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                title="Baixar Foto em Alta Definição"
              >
                <Download className="w-4 h-4 text-neutral-950" />
                <span className="hidden sm:inline">Baixar HD</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(1);
                }}
                className="bg-white/10 hover:bg-rose-600 text-white p-2 rounded-xl transition-all cursor-pointer shadow-md border border-white/10"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewer */}
          <div className="flex-1 flex items-center justify-center relative my-1 overflow-hidden w-full">
            
            {/* Previous Photo Button */}
            <button
              type="button"
              onClick={() => {
                setCurrentPhotoIdx((prev) => (prev === 0 ? lightboxPhotos.length - 1 : prev - 1));
                setLightboxZoom(1);
              }}
              className="absolute left-2 sm:left-6 z-20 bg-black/70 hover:bg-[#aa904f] text-white p-3 sm:p-4 rounded-full transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95 border border-white/20"
              title="Foto Anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Main High-Res Image Container with Instant Blur-Up */}
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-auto">
              <BlurUpImage
                key={currentPhotoIdx}
                src={lightboxPhotos[currentPhotoIdx]?.url}
                alt={lightboxPhotos[currentPhotoIdx]?.title}
                zoom={lightboxZoom}
                showHdBadge={true}
                priority={true}
                className="w-full h-full max-w-[96vw] max-h-[76vh] sm:max-h-[80vh] md:max-h-[82vh] object-contain shadow-2xl rounded-xl border border-white/10 transition-transform duration-200 cursor-zoom-in"
                containerClassName="w-full h-full"
                onClick={() => setLightboxZoom(prev => prev === 1 ? 1.75 : 1)}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Photo Button */}
            <button
              type="button"
              onClick={() => {
                setCurrentPhotoIdx((prev) => (prev === lightboxPhotos.length - 1 ? 0 : prev + 1));
                setLightboxZoom(1);
              }}
              className="absolute right-2 sm:right-6 z-20 bg-black/70 hover:bg-[#aa904f] text-white p-3 sm:p-4 rounded-full transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95 border border-white/20"
              title="Próxima Foto (Seta Direita)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

          </div>

          {/* Bottom Thumbnail Strip and Caption */}
          <div className="w-full max-w-5xl mx-auto space-y-2 pt-1 pb-1">
            {/* Thumbnail Strip */}
            {lightboxPhotos.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar max-h-16 pt-1">
                {lightboxPhotos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentPhotoIdx(idx);
                      setLightboxZoom(1);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === currentPhotoIdx
                        ? 'border-[#dfd1a1] scale-110 shadow-lg ring-2 ring-[#c5b072]/50'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Caption */}
            <div className="text-center text-xs text-neutral-400 space-y-0.5">
              <p className="font-semibold text-neutral-200 text-xs sm:text-sm">
                {lightboxPhotos[currentPhotoIdx]?.title}
              </p>
              <p className="text-[9px] sm:text-[10px] text-[#c5a880] uppercase tracking-widest font-semibold opacity-90">
                Foto oficial registrada com tecnologia WM2 FineArt HDR • Proibida reprodução não autorizada
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Products Section */}
      <section id="produtos" className="py-20 bg-[#3e3e42] transition-colors border-t border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#ffe29a] mb-2 flex items-center gap-1.5 justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-[#ffe29a]" /> Exclusividade WM2
            </h2>
            <p className="text-3xl font-extrabold text-white tracking-tight">Produtos e Recordações Premium</p>
            <p className="text-neutral-400 text-sm mt-3">
              Materiais nobres, acabamento luxuoso e design de vanguarda para eternizar sua conquista acadêmica.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'album' as const,
                title: 'Álbum de Formatura',
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'placa' as const,
                title: 'Placas Mural',
                image: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'estudio' as const,
                title: 'Placa de Homenagem',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'quadro' as const,
                title: 'Quadro de Formatura',
                image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'beca' as const,
                title: 'Beca para Colação',
                image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'anel' as const,
                title: 'Anel de Formatura',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'convite' as const,
                title: 'Convite de Luxo',
                image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=600'
              },
              {
                id: 'brindes' as const,
                title: 'Brindes',
                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'
              }
            ].map((prod, index) => {
              const coverImg = productGalleries[prod.id]?.[0]?.url || prod.image;
              return (
                <div 
                  key={index} 
                  onClick={() => handleOpenProductModal(prod.id)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 border border-[#aa904f]/30">
                    <img 
                      src={coverImg} 
                      alt={prod.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-neutral-950/90 text-white text-[10px] uppercase font-normal tracking-wider px-3 py-1.5 transition-opacity duration-300">
                        Ver Galeria
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 pb-1 text-center">
                    <h3 className="font-bold text-neutral-200 text-sm group-hover:text-[#ffe29a] transition-colors line-clamp-1">
                      {prod.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Portal / Interactive Demo Access Panel */}
      <section id="portal" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white text-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-neutral-200 p-8 md:p-12 lg:p-16 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <GraduationCap className="w-64 h-64 text-neutral-900" />
          </div>
          
          <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-6">
              <h2 className="text-xs font-bold text-[#aa904f] uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> SISTEMA INTEGRADO DE GESTÃO
              </h2>
              <p className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
                Portal Administrativo & Área do Formando
              </p>
              <p className="text-neutral-700 text-sm leading-relaxed mb-6">
                Gerencie todos os aspectos do seu contrato de formatura, verifique faturamento, participe de enquetes de opinião da comissão, agende sessões fotográficas e acesse seu álbum digital em alta resolução. 
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white border border-neutral-200/80 px-4 py-2.5 rounded-[4px] text-xs text-neutral-800 shadow-xs">
                  <Award className="w-4 h-4 text-[#aa904f]" />
                  <span><strong>Administradores da WM2</strong>: Acompanham receitas, faturamento, contratos e fornecedores.</span>
                </div>
                <div className="flex items-center gap-3 bg-white border border-neutral-200/80 px-4 py-2.5 rounded-[4px] text-xs text-neutral-800 shadow-xs">
                  <TrendingUp className="w-4 h-4 text-[#aa904f]" />
                  <span><strong>Comissões de Formatura</strong>: Aprovam enquetes, mural de notícias e acompanham a adesão da turma.</span>
                </div>
                <div className="flex items-center gap-3 bg-white border border-neutral-200/80 px-4 py-2.5 rounded-[4px] text-xs text-neutral-800 shadow-xs">
                  <Users className="w-4 h-4 text-[#aa904f]" />
                  <span><strong>Formandos</strong>: Efetuam pagamentos Pix/boleto simulados, votam e visualizam fotos.</span>
                </div>
              </div>

              {/* Botão / Card de Ofertas de Emprego em Branco */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsJobsModalOpen(true)}
                  className="w-full flex items-center justify-between bg-white hover:bg-amber-50/30 text-neutral-900 font-bold text-xs px-4 py-3 rounded-[4px] shadow-xs transition-all cursor-pointer group border border-neutral-200/90 hover:border-[#aa904f]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-50 rounded-[4px] text-[#aa904f] border border-amber-200/60">
                      <Briefcase className="w-4 h-4 text-[#aa904f] group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="tracking-wide font-extrabold text-neutral-900">Ofertas de Emprego & Trabalhe Conosco</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#aa904f] hover:bg-[#8e763e] px-3 py-1.5 rounded-[4px] text-[10px] font-bold text-white transition-colors shadow-xs">
                    <span>Ver Oportunidades</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-md">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-neutral-900 text-center flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#aa904f]" /> Área do Aluno & Comissão
                </h3>
                <p className="text-center text-xs text-neutral-500 mt-1">Informe seu Login (E-mail, CPF ou Código) e Senha para acessar o portal.</p>
              </div>

              {/* Login with Student Credentials Form */}
              <form onSubmit={handleCodeLogin} className="mb-6 pb-6 border-b border-neutral-200/85 space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Login / Identificação do Aluno
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={accessCodeInput}
                      onChange={(e) => {
                        setAccessCodeInput(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="E-mail, CPF ou Código (ex: MED-ANA-123)"
                      className="w-full bg-slate-50 border border-neutral-200 pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:border-[#aa904f] focus:ring-2 focus:ring-[#aa904f]/20 text-neutral-900 placeholder-neutral-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Senha do Aluno
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type={showStudentPassword ? "text" : "password"}
                      value={studentPasswordInput}
                      onChange={(e) => {
                        setStudentPasswordInput(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="Sua senha de acesso..."
                      className="w-full bg-slate-50 border border-neutral-200 pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-[#aa904f] focus:ring-2 focus:ring-[#aa904f]/20 text-neutral-900 font-mono placeholder-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-rose-600 text-xs font-medium leading-relaxed bg-rose-50 p-2.5 border border-rose-200 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#aa904f] hover:bg-[#967e3a] text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#dfd1a1]" /> Entrar no Portal do Formando
                </button>
              </form>

              {/* Quick simulation buttons */}
              <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3 text-center">Acesso Rápido de Simulação</p>
                <div className="space-y-3">
                {/* ADMIN Profile Entry Button */}
                <button 
                  onClick={() => {
                    setIsAdminAuthModalOpen(true);
                    setAdminPasswordInput('');
                    setAdminPasswordError('');
                  }}
                  className="w-full bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] hover:brightness-105 text-neutral-900 font-bold py-3.5 px-6 rounded-xl shadow-md flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-neutral-900 shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-extrabold flex items-center gap-1">
                        Área do Administrador
                      </div>
                      <div className="text-[10px] text-neutral-800/90 font-medium">Acesso Restrito • Requer Senha WM2</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* COMISSAO Profile Entry Button */}
                <button 
                  onClick={() => {
                    const std1 = formandos.find(f => f.id === 'std-1') || formandos[0];
                    if (std1) {
                      setSelectedStudentForModal(std1);
                      setModalPasswordInput('');
                      setModalPasswordError('');
                      setIsStudentAuthModalOpen(true);
                    } else {
                      onEnterPortal('comissao', 'std-1');
                    }
                  }}
                  className="w-full bg-neutral-50 hover:bg-neutral-100 text-neutral-950 border border-neutral-200 font-bold py-3 px-5 rounded-xl shadow-xs flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#8d1811]" />
                    <div className="text-left">
                      <div className="text-sm">Área da Comissão</div>
                      <div className="text-[10px] text-neutral-500 font-normal">Ana Beatriz • Requer Senha do Aluno</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* FORMANDO Profile Entry Button */}
                <button 
                  onClick={() => {
                    const std2 = formandos.find(f => f.id === 'std-2') || formandos[1];
                    if (std2) {
                      setSelectedStudentForModal(std2);
                      setModalPasswordInput('');
                      setModalPasswordError('');
                      setIsStudentAuthModalOpen(true);
                    } else {
                      onEnterPortal('formando', 'std-2');
                    }
                  }}
                  className="w-full bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold py-3 px-5 rounded-xl shadow-xs flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#dfd1a1]" />
                    <div className="text-left">
                      <div className="text-sm">Área do Formando</div>
                      <div className="text-[10px] text-white/80 font-normal">Carlos Eduardo • Requer Senha do Aluno</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
                <span className="text-[10px] text-neutral-500 flex items-center justify-center gap-1 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#aa904f]" /> Área do Administrador Protegida por Senha.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="bg-slate-50 dark:bg-slate-50 py-16 transition-colors border-t border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#aa904f] mb-2">Contato Especial</h2>
            <p className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-6">Traga sua comissão de formatura</p>
            <p className="text-neutral-600 text-sm leading-relaxed mb-8">
              Queremos conhecer os planos da sua turma! Agende uma reunião presencial ou online sem compromisso e receba uma simulação personalizada de orçamento, atrações e opções de faturamento individual.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-neutral-600">
                <MapPin className="w-5 h-5 text-[#aa904f]" />
                <span className="text-sm">Rua Cel. Diogo Gomes, 945 - Sobral - CE</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-600">
                <Phone className="w-5 h-5 text-[#aa904f]" />
                <span className="text-sm">(88) 3111-6870 / WhatsApp: (88) 99439-4418</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-600">
                <Mail className="w-5 h-5 text-[#aa904f]" />
                <span className="text-sm">wm2conceittus@icloud.com</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white rounded-2xl shadow-md border border-[#aa904f]/25 hover:border-[#aa904f]/50 p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Fale com o nosso Comercial</h3>
            {contactSent ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-900 border border-emerald-200 p-6 rounded-xl text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 border border-emerald-200">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold mb-2 text-[#2d5a27] font-sans">Orçamento Pronto para Envio!</h4>
                <p className="text-xs text-emerald-800/90 leading-relaxed mb-6 font-sans">
                  Tentamos abrir o seu cliente de e-mail padrão automaticamente. Para garantir que seu pedido chegue imediatamente para <strong>wm2conceittus@icloud.com</strong>, clique em um dos canais diretos abaixo para concluir o envio:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
                  <a
                    href={`mailto:wm2conceittus@icloud.com?subject=${encodeURIComponent("Solicitação de Orçamento - WM2 Produções e Eventos")}&body=${encodeURIComponent(
                      `Olá, gostaria de solicitar um orçamento!\n\n` +
                      `Nome Completo: ${contactName}\n` +
                      `E-mail de Contato: ${contactEmail}\n` +
                      `Curso / Mensagem:\n${contactMessage || 'Nenhuma mensagem adicional.'}`
                    )}`}
                    className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer font-sans"
                  >
                    <Mail className="w-4 h-4" /> Enviar por E-mail
                  </a>
                  <a
                    href={`https://wa.me/5588994394418?text=${encodeURIComponent(
                      `Olá! Gostaria de solicitar um orçamento comercial.\n\n` +
                      `*Nome Completo:* ${contactName}\n` +
                      `*E-mail de Contato:* ${contactEmail}\n` +
                      `*Curso / Mensagem:* ${contactMessage || 'Nenhum'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackConversionEvent('WhatsAppClick', { source: 'Contact_Form_WhatsApp_Button', name: contactName, email: contactEmail })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer font-sans"
                  >
                    <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                  </a>
                </div>
                <button
                  onClick={() => {
                    setContactName('');
                    setContactEmail('');
                    setContactMessage('');
                    setContactSent(false);
                  }}
                  className="text-xs font-bold text-neutral-500 hover:text-neutral-800 underline transition-colors cursor-pointer font-sans"
                >
                  Criar Nova Solicitação
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-500 uppercase mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-transparent dark:bg-transparent border border-[#aa904f]/40 dark:border-[#aa904f]/40 rounded-lg p-2.5 text-sm outline-none focus:border-[#aa904f] focus:ring-1 focus:ring-[#aa904f] transition-colors text-neutral-900 dark:text-neutral-900 placeholder-neutral-400 dark:placeholder-neutral-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-500 uppercase mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-transparent dark:bg-transparent border border-[#aa904f]/40 dark:border-[#aa904f]/40 rounded-lg p-2.5 text-sm outline-none focus:border-[#aa904f] focus:ring-1 focus:ring-[#aa904f] transition-colors text-neutral-900 dark:text-neutral-900 placeholder-neutral-400 dark:placeholder-neutral-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-500 uppercase mb-1">Curso & Instituição / Mensagem</label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Ex: Medicina UNESP LIV - Gostaria de receber orçamento..."
                    className="w-full bg-transparent dark:bg-transparent border border-[#aa904f]/40 dark:border-[#aa904f]/40 rounded-lg p-2.5 text-sm outline-none focus:border-[#aa904f] focus:ring-1 focus:ring-[#aa904f] transition-colors text-neutral-900 dark:text-neutral-900 placeholder-neutral-400 dark:placeholder-neutral-400 resize-none font-medium"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold py-3 rounded-none transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#faf8f0] text-neutral-600 py-12 border-t border-[#aa904f]/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo showSubtitle={true} variant="dark" className="w-28 opacity-95" />
          
          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-xs text-neutral-700 hover:text-[#aa904f] transition-colors font-medium"
            >
              <Instagram className="w-4 h-4 text-[#aa904f]" /> Instagram
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-xs text-neutral-700 hover:text-[#aa904f] transition-colors font-medium"
            >
              <Facebook className="w-4 h-4 text-[#aa904f]" /> Facebook
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-xs text-neutral-700 hover:text-[#aa904f] transition-colors font-medium"
            >
              <Youtube className="w-4 h-4 text-[#aa904f]" /> YouTube
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs font-semibold text-neutral-800">&copy; 2026 WM2 Produções & Eventos. Todos os direitos reservados.</p>
            <p className="text-[10px] mt-1 text-neutral-500">Desenvolvido com tecnologia de alta performance para formaturas exclusivas.</p>
          </div>
        </div>
      </footer>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-neutral-900 rounded-[4px] max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#aa904f]/30 flex items-center justify-between bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#543d03]" />
                <h3 className="font-extrabold text-[#3c2a01] text-sm uppercase tracking-wider">
                  {selectedProduct === 'placa' && 'Galeria - Placas Mural'}
                  {selectedProduct === 'album' && 'Galeria - Álbum de Formatura'}
                  {selectedProduct === 'estudio' && 'Galeria - Placa de Homenagem'}
                  {selectedProduct === 'quadro' && 'Galeria - Quadro de Formatura'}
                  {selectedProduct === 'beca' && 'Galeria - Beca para Colação'}
                  {selectedProduct === 'anel' && 'Galeria - Anel de Formatura'}
                  {selectedProduct === 'convite' && 'Galeria - Convite de Luxo'}
                  {selectedProduct === 'brindes' && 'Galeria - Brindes'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-[#543d03] hover:text-[#3c2a01] transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const currentGallery = (productGalleries && selectedProduct && productGalleries[selectedProduct]) || (selectedProduct && initialProductGalleries[selectedProduct]) || [];
              const activePhoto = currentGallery[activeModalPhotoIdx] || currentGallery[0] || { url: '', title: '' };

              return (
                <div className="p-6 space-y-4">
                  <div className="relative aspect-[3/2] md:aspect-[16/10] rounded-[4px] overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
                    {activePhoto.url ? (
                      <img 
                        src={activePhoto.url} 
                        alt={activePhoto.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                        Sem fotos cadastradas nesta galeria.
                      </div>
                    )}
                  </div>
                  
                  {activePhoto.title && (
                    <p className="text-xs text-neutral-600 text-center font-medium italic">
                      {activePhoto.title}
                    </p>
                  )}

                  {currentGallery.length > 0 && (
                    <div className="grid grid-cols-6 gap-2">
                      {currentGallery.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveModalPhotoIdx(index)}
                          className={`relative aspect-square rounded-[4px] overflow-hidden border-2 transition-all cursor-pointer ${
                            activeModalPhotoIdx === index 
                              ? 'border-[#aa904f] ring-2 ring-[#aa904f]/25' 
                              : 'border-transparent hover:border-neutral-400'
                          }`}
                        >
                          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* Modal de Ofertas de Emprego / Trabalhe Conosco */}
      <AnimatePresence>
        {isJobsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white border border-neutral-200 rounded-[4px] shadow-2xl overflow-hidden my-8"
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] text-[#3c2a01] p-6 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsJobsModalOpen(false);
                    setSelectedJobId(null);
                    setCandidateSent(false);
                  }}
                  className="absolute top-4 right-4 text-[#543d03] hover:text-[#3c2a01] bg-black/10 p-2 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-[#543d03] rounded-[4px] text-[#ebe0b2]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#3c2a01] tracking-tight">Oportunidades de Emprego & Carreiras</h2>
                    <p className="text-xs text-[#543d03]">WM2 Produções & Eventos • Faça parte da nossa equipe</p>
                  </div>
                </div>
              </div>

              {/* Corpo do Modal */}
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                {candidateSent ? (
                  <div className="text-center py-10 px-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Candidatura Enviada com Sucesso!</h3>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">
                      Agradecemos seu interesse em fazer parte da WM2 Produções & Eventos. Nosso setor de Talentos & RH analisará seu currículo e entrará em contato.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsJobsModalOpen(false);
                        setCandidateSent(false);
                        setSelectedJobId(null);
                      }}
                      className="bg-[#aa904f] hover:bg-[#8e763e] text-white font-bold text-xs px-6 py-2.5 rounded-[4px] cursor-pointer transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                      Procuramos profissionais talentosos e apaixonados por realizar sonhos. Se você tem energia, comprometimento e deseja trabalhar no mercado de grandes formaturas e eventos, confira as vagas disponíveis abaixo:
                    </p>

                    {/* Vagas Listadas */}
                    <div className="space-y-4 mb-8">
                      {[
                        {
                          id: 'job-1',
                          title: 'Fotógrafo & Cinegrafista de Eventos',
                          type: 'Freelancer / Eventual',
                          location: 'Juazeiro do Norte & Região',
                          department: 'Audiovisual',
                          desc: 'Cobertura fotográfica e tomadas de vídeo em alta definição para bailes de gala, colações de grau e ensaios fotográficos de formandos.',
                          reqs: 'Possuir equipamento fotográfico DSLR/Mirrorless próprio e portfólio comprovado em eventos.'
                        },
                        {
                          id: 'job-2',
                          title: 'Cerimonialista & Produtor de Campo',
                          type: 'Temporário por Evento',
                          location: 'Cariri / Ceará',
                          department: 'Operacional & Cerimonial',
                          desc: 'Atendimento aos formandos e comissões, organização de fluxo de entrada, recepção de convidados e suporte ao protocolo das cerimônias.',
                          reqs: 'Excelente comunicação, proatividade, pontualidade e boa apresentação pessoal.'
                        },
                        {
                          id: 'job-3',
                          title: 'Executivo de Vendas & Parcerias Comerciais',
                          type: 'Efetivo (CLT)',
                          location: 'Juazeiro do Norte - CE',
                          department: 'Comercial',
                          desc: 'Prospecção e negociação de contratos de formatura com comissões de formandos em faculdades e universidades do Ceará.',
                          reqs: 'Experiência prévia em vendas consultivas, boa oratória e disponibilidade para reuniões.'
                        },
                        {
                          id: 'job-4',
                          title: 'Estagiário de Produção & Marketing',
                          type: 'Estágio Remunerado',
                          location: 'Juazeiro do Norte - CE',
                          department: 'Marketing & Criação',
                          desc: 'Apoio na gestão de redes sociais, atendimento ao formando, elaboração de comunicados e apoio logístico de eventos.',
                          reqs: 'Cursando Ensino Superior (Marketing, Publicidade, Administração ou Eventos) e afinidade com redes sociais.'
                        }
                      ].map((job) => (
                        <div
                          key={job.id}
                          className={`border rounded-[4px] p-4 transition-all ${
                            selectedJobId === job.id
                              ? 'border-[#aa904f] bg-amber-50/40 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-[#543d03] mr-2">
                                {job.department}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-500">{job.type} • {job.location}</span>
                              <h4 className="text-sm font-extrabold text-neutral-900 mt-1">{job.title}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJobId(selectedJobId === job.id ? null : job.id);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-[4px] cursor-pointer transition-all self-start sm:self-center ${
                                selectedJobId === job.id
                                  ? 'bg-[#aa904f] text-white'
                                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                              }`}
                            >
                              {selectedJobId === job.id ? 'Selecionado' : 'Candidatar-se'}
                            </button>
                          </div>
                          <p className="text-xs text-neutral-600 mb-2 leading-relaxed">{job.desc}</p>
                          <p className="text-[11px] text-neutral-500 font-medium">
                            <strong className="text-neutral-700">Requisitos principais:</strong> {job.reqs}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Formulário de Candidatura */}
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-[4px]">
                      <h4 className="text-sm font-extrabold text-neutral-900 mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#aa904f]" />
                        Formulário de Candidatura
                      </h4>
                      <p className="text-xs text-neutral-500 mb-4">
                        {selectedJobId 
                          ? 'Preencha seus dados para se candidatar à vaga selecionada acima.' 
                          : 'Preencha seus dados abaixo para cadastrar seu currículo em nosso banco de talentos.'}
                      </p>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!candidateName || !candidateEmail || !candidatePhone) return;
                          setCandidateSent(true);
                        }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Nome Completo *</label>
                            <input
                              type="text"
                              required
                              value={candidateName}
                              onChange={(e) => setCandidateName(e.target.value)}
                              placeholder="Seu nome completo"
                              className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 px-3 py-2 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#aa904f]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">E-mail *</label>
                            <input
                              type="email"
                              required
                              value={candidateEmail}
                              onChange={(e) => setCandidateEmail(e.target.value)}
                              placeholder="seu.email@exemplo.com"
                              className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 px-3 py-2 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#aa904f]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">WhatsApp / Telefone *</label>
                            <input
                              type="text"
                              required
                              value={candidatePhone}
                              onChange={(e) => setCandidatePhone(e.target.value)}
                              placeholder="(88) 99999-9999"
                              className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 px-3 py-2 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#aa904f]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Link do Currículo / Portfólio (Opcional)</label>
                            <input
                              type="text"
                              value={candidateCv}
                              onChange={(e) => setCandidateCv(e.target.value)}
                              placeholder="LinkedIn, Instagram, Google Drive..."
                              className="w-full bg-white border border-neutral-300 text-xs text-neutral-800 px-3 py-2 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#aa904f]"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-[#aa904f] hover:bg-[#8e763e] text-white font-bold text-xs py-2.5 rounded-[4px] cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                          >
                            <Briefcase className="w-4 h-4" />
                            <span>Enviar Candidatura</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Autenticação Administrativa */}
      <AnimatePresence>
        {isAdminAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] p-6 text-neutral-950 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminAuthModalOpen(false);
                    setAdminPasswordInput('');
                    setAdminPasswordError('');
                  }}
                  className="absolute top-4 right-4 text-neutral-800 hover:text-neutral-950 bg-black/10 hover:bg-black/20 p-2 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#543d03] rounded-xl text-[#ebe0b2] shadow-md">
                    <Lock className="w-6 h-6 text-[#dfd1a1]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-950">Acesso Administrativo</h3>
                    <p className="text-xs text-neutral-800 font-medium">WM2 Produções • Painel de Controle</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAdminPasswordSubmit} className="p-6 space-y-4">
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Informe a senha de administrador para acessar a gestão financeira, contratos e turmas.
                </p>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Senha de Administrador
                  </label>

                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      if (adminPasswordError) setAdminPasswordError('');
                    }}
                    placeholder="Digite a senha..."
                    className="w-full bg-slate-50 border border-neutral-300 px-4 py-3 rounded-xl text-sm outline-none focus:border-[#aa904f] focus:ring-2 focus:ring-[#aa904f]/20 text-neutral-900 font-mono"
                    autoFocus
                  />

                  {adminPasswordError && (
                    <p className="text-rose-600 text-xs mt-2 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      {adminPasswordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminAuthModalOpen(false);
                      setAdminPasswordInput('');
                      setAdminPasswordError('');
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#dfd1a1]" /> Entrar no Painel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Autenticação do Aluno / Comissão */}
      <AnimatePresence>
        {isStudentAuthModalOpen && selectedStudentForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#543d03] p-6 text-white relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStudentAuthModalOpen(false);
                    setModalPasswordInput('');
                    setModalPasswordError('');
                  }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#aa904f] rounded-xl text-neutral-950 shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Acesso do Formando</h3>
                    <p className="text-xs text-[#dfd1a1] font-medium">{selectedStudentForModal.name}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleModalStudentSubmit} className="p-6 space-y-4">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-1">
                  <div><strong>Aluno:</strong> {selectedStudentForModal.name}</div>
                  <div><strong>Código / Login:</strong> <span className="font-mono text-[#aa904f] font-bold">{selectedStudentForModal.studentCode || selectedStudentForModal.email}</span></div>
                  <div><strong>E-mail:</strong> {selectedStudentForModal.email}</div>
                  <div><strong>Perfil:</strong> <span className="uppercase font-bold text-[#aa904f]">{selectedStudentForModal.role}</span></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Digite sua Senha de Acesso
                  </label>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                    <input
                      type={showModalPassword ? "text" : "password"}
                      value={modalPasswordInput}
                      onChange={(e) => {
                        setModalPasswordInput(e.target.value);
                        if (modalPasswordError) setModalPasswordError('');
                      }}
                      placeholder="Senha de acesso..."
                      className="w-full bg-slate-50 border border-neutral-300 pl-9 pr-10 py-3 rounded-xl text-sm outline-none focus:border-[#aa904f] focus:ring-2 focus:ring-[#aa904f]/20 text-neutral-900 font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {modalPasswordError && (
                    <p className="text-rose-600 text-xs mt-2 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      {modalPasswordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudentAuthModalOpen(false);
                      setModalPasswordInput('');
                      setModalPasswordError('');
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#dfd1a1]" /> Acessar Portal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Buttons Group */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 items-center">
        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              key="scroll-to-top"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              onClick={scrollToTop}
              className="bg-[#aa904f] hover:bg-[#967e3a] text-white p-3 shadow-lg border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center rounded-full"
              aria-label="Voltar ao topo"
            >
              <ChevronUp className="w-5.5 h-5.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp Floating Button */}
        <motion.a
          href="https://wa.me/5588994394418?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20as%20formaturas%20e%20orçamentos%20da%20WM2%20Produções%20e%20Eventos."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackConversionEvent('WhatsAppClick', { source: 'Floating_WhatsApp_Button' })}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 shadow-xl border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center rounded-full group"
          aria-label="Falar no WhatsApp"
        >
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75"></span>
          <MessageCircle className="w-6.5 h-6.5 relative z-10" />
        </motion.a>
      </div>
    </div>
  );
}
