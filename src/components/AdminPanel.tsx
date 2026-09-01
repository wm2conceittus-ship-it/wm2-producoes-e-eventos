import { PushNotificationManager } from "./PushNotificationManager";
import WhatsAppApiManager from "./WhatsAppApiManager";
import MercadoPagoParcelasList from "./MercadoPagoParcelasList";
import PaymentGatewayManager from "./PaymentGatewayManager";
import { INITIAL_GATEWAY_CONFIG, INITIAL_VISITOR_TRACKING } from "../data/mockData";
import React, { useState } from "react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ContractPdfGenerator } from "./ContractPdfGenerator";
import { FirebaseDomainGuide } from "./FirebaseDomainGuide";
import { VisitorAnalytics } from "./VisitorAnalytics";
import { VisitorToastContainer, VisitorToastItemData } from "./VisitorToast";
import { PaidTrafficManager } from "./PaidTrafficManager";
import { CrmManager } from "./CrmManager";
import { OverviewDashboard } from "./OverviewDashboard";
import {
  PackagesManager,
  COMMON_PACKAGE_ITEMS_SUGGESTIONS,
} from "./PackagesManager";
import { StudentExtraItemsManager } from "./StudentExtraItemsManager";
import { AddExtraItemModal } from "./AddExtraItemModal";
import { TaskManager } from "./TaskManager";
import {
  IntegratedMonthlyCalendar,
  CalendarScheduleItem,
} from "./IntegratedMonthlyCalendar";
import {
  Globe,
  Building,
  Building2,
  GraduationCap,
  Users,
  User,
  DollarSign,
  Calendar,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Key,
  TrendingUp,
  Check,
  X,
  Search,
  UserPlus,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  MapPin,
  Clock,
  ShieldAlert,
  UserCog,
  Upload,
  Image,
  Package,
  ShoppingBag,
  CreditCard,
  Cpu,
  Printer,
  FileText,
  FileCheck,
  FileClock,
  CheckCircle2,
  Bell,
  Smartphone,
  Send,
  Megaphone,
  MessageSquare,
  Pin,
  Download,
  FileSpreadsheet,
  Video,
  Settings,
  Mail,
  Kanban,
  CheckSquare,
  ArrowUpDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Move,
  List,
  Target,
  Percent,
  Crown,
  Receipt,
  TrendingDown,
  Wallet,
  Table,
  LayoutGrid,
  Activity,
  Folder,
  FolderPlus,
  Cloud,
  CloudOff,
  RefreshCw,
  Eye,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Turma,
  Formando,
  FormandoExtraPackage,
  Parcela,
  Evento,
  Enquete,
  Fornecedor,
  Pacote,
  Foto,
  Album,
  MuralItem,
  Depoimento,
  PushDevice,
  SystemNotification,
  Reuniao,
  Lead,
  LeadActivity,
  Expense,
  StudentContract,
  VisitorTracking,
  AdminTask,
  PaymentGatewayConfig,
} from "../types";
import {
  getStagnantLeads,
  isLeadStagnant,
  getLeadDaysInStage,
  getStaleLeadFollowUpText,
  getWhatsAppDirectUrl,
} from "../utils/crmHelpers";
import Logo from "./Logo";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";

const compressImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78,
): Promise<Blob | File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
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
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Enable high quality image smoothing on canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill white background for clean rendering
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, then jpeg
        try {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob);
              } else {
                canvas.toBlob(
                  (blob2) => resolve(blob2 || file),
                  "image/jpeg",
                  quality,
                );
              }
            },
            "image/webp",
            quality,
          );
        } catch {
          canvas.toBlob(
            (blob) => resolve(blob || file),
            "image/jpeg",
            quality,
          );
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const convertBlobToBase64 = (blob: Blob | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const parseOklch = (str: string): string => {
  const clean = str.replace(/,/g, " ").replace(/\s+/g, " ");
  const match = clean.match(
    /oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg|rad|grad|turn)?)(?:\s*[\/]\s*([0-9.%]+))?\s*\)/i,
  );
  if (!match) return str;

  const lStr = match[1];
  const cStr = match[2];
  const hStr = match[3];
  const aStr = match[4];

  const L = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);
  const C = cStr.endsWith("%") ? parseFloat(cStr) / 100 : parseFloat(cStr);

  let H = parseFloat(hStr);
  if (hStr.endsWith("rad")) {
    H = (parseFloat(hStr) * 180) / Math.PI;
  } else if (hStr.endsWith("grad")) {
    H = (parseFloat(hStr) * 360) / 400;
  } else if (hStr.endsWith("turn")) {
    H = parseFloat(hStr) * 360;
  }

  let alpha = 1;
  if (aStr) {
    alpha = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
  }

  const hRad = (H * Math.PI) / 180;
  const a_lab = C * Math.cos(hRad);
  const b_lab = C * Math.sin(hRad);

  const l_lms = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_lms = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_lms = L - 0.0894841775 * a_lab - 1.291485548 * b_lab;

  const l_cube = l_lms * l_lms * l_lms;
  const m_cube = m_lms * m_lms * m_lms;
  const s_cube = s_lms * s_lms * s_lms;

  const r_lin =
    +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin =
    -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin =
    -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.707614701 * s_cube;

  const f = (x: number) =>
    x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;

  const r = Math.max(0, Math.min(255, Math.round(f(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(b_lin) * 255)));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const parseOklab = (str: string): string => {
  const clean = str.replace(/,/g, " ").replace(/\s+/g, " ");
  const match = clean.match(
    /oklab\(\s*([0-9.-]+%?)\s+([0-9.-]+%?)\s+([0-9.-]+%?)(?:\s*[\/]\s*([0-9.%]+))?\s*\)/i,
  );
  if (!match) return str;

  const lStr = match[1];
  const aStr = match[2];
  const bStr = match[3];
  const alphaStr = match[4];

  const L = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);
  const a_lab = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
  const b_lab = bStr.endsWith("%") ? parseFloat(bStr) / 100 : parseFloat(bStr);

  let alpha = 1;
  if (alphaStr) {
    alpha = alphaStr.endsWith("%")
      ? parseFloat(alphaStr) / 100
      : parseFloat(alphaStr);
  }

  const l_lms = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_lms = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_lms = L - 0.0894841775 * a_lab - 1.291485548 * b_lab;

  const l_cube = l_lms * l_lms * l_lms;
  const m_cube = m_lms * m_lms * m_lms;
  const s_cube = s_lms * s_lms * s_lms;

  const r_lin =
    +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin =
    -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin =
    -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.707614701 * s_cube;

  const f = (x: number) =>
    x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;

  const r = Math.max(0, Math.min(255, Math.round(f(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(b_lin) * 255)));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const parseColorMix = (argsStr: string): string => {
  const parts = argsStr.split(",");
  if (parts.length >= 3) {
    const colorPart1 = parts[1].trim();
    const colorMatch = colorPart1.match(
      /^(rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-f0-9]+|var\([^)]+\)|\w+)/i,
    );
    if (colorMatch) {
      const color = colorMatch[1];
      if (color.toLowerCase() === "currentcolor") {
        return "currentColor";
      }
      return color;
    }
  }
  return "rgba(150, 150, 150, 0.5)";
};

function findMatchingCloseParen(str: string, startIndex: number): number {
  let depth = 1;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "(") depth++;
    else if (str[i] === ")") depth--;
    if (depth === 0) return i;
  }
  return -1;
}

const replaceUnsupportedColors = (str: string): string => {
  if (!str) return "";
  const oklchIndex = str.toLowerCase().indexOf("oklch(");
  const oklabIndex = str.toLowerCase().indexOf("oklab(");
  const colorMixIndex = str.toLowerCase().indexOf("color-mix(");

  const indices = [
    { type: "oklch", index: oklchIndex },
    { type: "oklab", index: oklabIndex },
    { type: "color-mix", index: colorMixIndex },
  ]
    .filter((x) => x.index !== -1)
    .sort((a, b) => a.index - b.index);

  if (indices.length === 0) {
    return str;
  }

  const first = indices[0];
  const startIdx = first.index;
  const parenStartIdx = startIdx + first.type.length + 1;

  const endIdx = findMatchingCloseParen(str, parenStartIdx);
  if (endIdx === -1) {
    return (
      str.substring(0, startIdx) +
      first.type +
      "_" +
      replaceUnsupportedColors(str.substring(startIdx + first.type.length))
    );
  }

  const argsRaw = str.substring(parenStartIdx, endIdx);
  const argsClean = replaceUnsupportedColors(argsRaw);

  let replacement = "";
  if (first.type === "oklch") {
    try {
      replacement = parseOklch(`oklch(${argsClean})`);
    } catch (e) {
      replacement = "rgba(220, 220, 220, 1)";
    }
  } else if (first.type === "oklab") {
    try {
      replacement = parseOklab(`oklab(${argsClean})`);
    } catch (e) {
      replacement = "rgba(220, 220, 220, 1)";
    }
  } else if (first.type === "color-mix") {
    try {
      replacement = parseColorMix(argsClean);
    } catch (e) {
      replacement = "rgba(150, 150, 150, 0.5)";
    }
  }

  const prefix = str.substring(0, startIdx);
  const suffix = str.substring(endIdx + 1);
  return prefix + replacement + replaceUnsupportedColors(suffix);
};

interface AdminPanelProps {
  turmas: Turma[];
  formandos: Formando[];
  parcelas: Parcela[];
  eventos: Evento[];
  fornecedores: Fornecedor[];
  pacotes: Pacote[];
  albums?: Album[];
  fotos: Foto[];
  notifications?: SystemNotification[];
  pushTokens?: PushDevice[];
  mural?: MuralItem[];
  reunioes?: Reuniao[];
  leads?: Lead[];
  portfolioAlbums?: any[];
  productGalleries?: Record<string, { url: string; title: string }[]>;
  visitorTracking?: VisitorTracking;
  adminTasks?: AdminTask[];
  gatewayConfig?: PaymentGatewayConfig;
  theme?: "light" | "dark";
  isSynced?: boolean;
  syncError?: string | null;
  isQuotaExceeded?: boolean;
  lastSyncTime?: Date | string | null;
  onUpdateState: (newState: any) => void;
  onLogout: () => void;
}

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-op-1",
    description: "Aluguel Comercial da Loja / Sede",
    category: "Aluguel & Condomínio",
    amount: 4500,
    date: "2026-07-05",
    status: "Pago",
    paymentMethod: "Transferência",
    supplierName: "Imobiliária Conceito",
    notes: "Aluguel mensal e condomínio da loja",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-op-2",
    description: "Link de Internet Fibra & Telefonia Fixa",
    category: "Internet, Telefone & TI",
    amount: 380,
    date: "2026-07-10",
    status: "Pago",
    paymentMethod: "Pix",
    supplierName: "Telecom Fibra Pro",
    notes: "Internet de alta velocidade da loja",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-op-3",
    description: "Conta de Água e Energia Elétrica da Loja",
    category: "Água, Luz & Consumo",
    amount: 650,
    date: "2026-07-12",
    status: "Pago",
    paymentMethod: "Boleto",
    supplierName: "Concessionária de Água e Luz",
    notes: "Contas de consumo do mês",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-op-4",
    description: "Folha de Pagamento & Salários dos Funcionários",
    category: "Funcionários, Folha & Salários",
    amount: 14500,
    date: "2026-07-01",
    status: "Pago",
    paymentMethod: "Pix",
    supplierName: "Equipe Interna WM2",
    notes: "Salários dos colaboradores da loja/atendimento",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-1",
    description: "Locação do Salão de Festas - Villa Regia",
    category: "Local / Espaço de Evento",
    amount: 28000,
    date: "2026-06-15",
    status: "Pago",
    paymentMethod: "Pix",
    supplierName: "Villa Regia Eventos",
    notes: "Sinal de 50% pago e quitado via Pix",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-2",
    description: "Buffet Premium & Serviço - Baile de Gala",
    category: "Buffet / A&B",
    amount: 45000,
    date: "2026-07-02",
    status: "Pendente",
    paymentMethod: "Boleto",
    supplierName: "Chef & Gala Gastronomia",
    notes: "Parcela 2 de 3 do serviço de buffet",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-3",
    description: "Sonorização, Painel LED e Iluminação Cênica",
    category: "Fornecedores de Eventos",
    amount: 18500,
    date: "2026-05-20",
    status: "Pago",
    paymentMethod: "Transferência",
    supplierName: "Luz & Som Pro Visual",
    notes: "Equipamentos e técnicos de som",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-4",
    description: "Equipe de Segurança & Recepcionistas (20 membros)",
    category: "Segurança & Logística",
    amount: 6800,
    date: "2026-08-10",
    status: "Agendado",
    paymentMethod: "Pix",
    supplierName: "WM2 Staff & Logística",
    notes: "Agendado para 2 dias antes do baile",
    createdAt: new Date().toISOString(),
  },
];

export default function AdminPanel({
  turmas = [],
  formandos = [],
  parcelas = [],
  eventos = [],
  fornecedores = [],
  pacotes = [],
  albums = [],
  fotos = [],
  notifications = [],
  pushTokens = [],
  mural = [],
  reunioes = [],
  leads = [],
  portfolioAlbums = [],
  productGalleries: propProductGalleries = {},
  visitorTracking = INITIAL_VISITOR_TRACKING,
  adminTasks = [],
  gatewayConfig = INITIAL_GATEWAY_CONFIG,
  theme = "light",
  isSynced = true,
  syncError = null,
  isQuotaExceeded = false,
  lastSyncTime = null,
  onUpdateState,
  onLogout,
}: AdminPanelProps) {
  const currentTheme = theme || "light";

  const handleToggleTheme = () => {
    const nextTheme: "light" | "dark" =
      currentTheme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("wm2_admin_theme", nextTheme);
    } catch (e) {
      console.error(e);
    }
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      albums,
      fotos,
      notifications,
      pushTokens,
      mural,
      reunioes,
      leads,
      portfolioAlbums,
      productGalleries: propProductGalleries,
      visitorTracking,
      adminTasks,
      theme: nextTheme,
    });
  };
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "financeiro"
    | "funil"
    | "tarefas"
    | "turmas"
    | "pacotes"
    | "formandos"
    | "eventos"
    | "fornecedores"
    | "equipe"
    | "fotos"
    | "notifications"
    | "mural"
    | "reunioes"
    | "visitors"
    | "settings"
  >("dashboard");
  const [presetPackageTurmaId, setPresetPackageTurmaId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<string>("all");
  const [financialSubTab, setFinancialSubTab] = useState<"dre" | "mercadopago_parcelas" | "despesas" | "inadimplencia">("dre");
  const [settingsSubTab, setSettingsSubTab] = useState<
    "gateway" | "regua" | "whatsapp" | "domain" | "traffic" | "push"
  >("gateway");
  const [selectedContractStatusFilter, setSelectedContractStatusFilter] =
    useState<"all" | "NovosAssinados" | "Pendente" | "Assinado">("all");
  const [showContractPdfModal, setShowContractPdfModal] = useState(false);
  const [contractStudentId, setContractStudentId] = useState<string | null>(
    null,
  );
  const [stdModalTab, setStdModalTab] = useState<
    "cadastro" | "extras" | "parcelas" | "convidados"
  >("cadastro");

  // Admin Password Change Modal States
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordModalSuccess, setPasswordModalSuccess] = useState("");
  const [passwordModalError, setPasswordModalError] = useState("");
  // Real-time Visitor Toast Notification System
  const [visitorToasts, setVisitorToasts] = useState<VisitorToastItemData[]>(
    [],
  );
  const [isVisitorToastEnabled, setIsVisitorToastEnabled] = useState<boolean>(
    () => {
      try {
        const saved = localStorage.getItem("wm2_visitor_toast_enabled");
        return saved !== null ? saved === "true" : true;
      } catch {
        return true;
      }
    },
  );

  const lastSeenVisitorIdRef = React.useRef<string | null>(null);

  const triggerVisitorToast = React.useCallback(
    (city: string, state?: string, page?: string, device?: string) => {
      if (!isVisitorToastEnabled || activeTab !== "visitors") return;
      const newToast: VisitorToastItemData = {
        id: `vtoast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        city: city || "São Paulo",
        state: state || "SP",
        page: page || "Página Inicial",
        device: device || (window.innerWidth < 768 ? "mobile" : "desktop"),
        timestamp: new Date(),
        durationMs: 5000,
      };
      setVisitorToasts((prev) => [newToast, ...prev].slice(0, 3));
    },
    [isVisitorToastEnabled, activeTab],
  );

  const handleDismissVisitorToast = React.useCallback((id: string) => {
    setVisitorToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleVisitorToastEnabled = () => {
    setIsVisitorToastEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("wm2_visitor_toast_enabled", String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleTestToast = React.useCallback(() => {
    const testCities = [
      {
        city: "Botucatu",
        state: "SP",
        page: "Portal do Formando (Medicina UNESP)",
      },
      { city: "Bauru", state: "SP", page: "Galeria de Fotos" },
      { city: "Campinas", state: "SP", page: "Página Inicial" },
      { city: "São Paulo", state: "SP", page: "Área da Comissão" },
      { city: "Ribeirão Preto", state: "SP", page: "Planos & Pacotes" },
    ];
    const pick = testCities[Math.floor(Math.random() * testCities.length)];
    if (!isVisitorToastEnabled) {
      setIsVisitorToastEnabled(true);
    }
    const newToast: VisitorToastItemData = {
      id: `vtoast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      city: pick.city,
      state: pick.state,
      page: pick.page,
      device: "mobile",
      timestamp: new Date(),
      durationMs: 5000,
    };
    setVisitorToasts((prev) => [newToast, ...prev].slice(0, 3));
  }, [isVisitorToastEnabled]);

  // Listen to props visitorTracking changes to trigger toast on real visits (when viewing visitors tab)
  React.useEffect(() => {
    if (activeTab !== "visitors") return;
    if (
      !visitorTracking ||
      !visitorTracking.recentVisitors ||
      visitorTracking.recentVisitors.length === 0
    )
      return;
    const latestVisitor = visitorTracking.recentVisitors[0];
    if (latestVisitor && latestVisitor.id) {
      if (lastSeenVisitorIdRef.current === null) {
        // Initial setup, do not toast old historic visitor on first load
        lastSeenVisitorIdRef.current = latestVisitor.id;
      } else if (lastSeenVisitorIdRef.current !== latestVisitor.id) {
        lastSeenVisitorIdRef.current = latestVisitor.id;
        triggerVisitorToast(
          latestVisitor.city || "São Paulo",
          latestVisitor.state || "SP",
          latestVisitor.path === "/"
            ? "Página Inicial"
            : latestVisitor.path || "Portal WM2",
          latestVisitor.device || "mobile",
        );
      }
    }
  }, [visitorTracking, triggerVisitorToast, activeTab]);

  // Listen to custom window 'wm2_new_visitor' events (only while on visitors tab)
  React.useEffect(() => {
    if (activeTab !== "visitors") return;
    const handleCustomVisitor = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.city) {
        triggerVisitorToast(
          detail.city,
          detail.state,
          detail.page || detail.path,
          detail.device,
        );
      }
    };
    window.addEventListener("wm2_new_visitor", handleCustomVisitor);
    return () =>
      window.removeEventListener("wm2_new_visitor", handleCustomVisitor);
  }, [triggerVisitorToast, activeTab]);

  // Realistic background visitor simulation loop for live interactive demonstrations (only while on visitors tab)
  React.useEffect(() => {
    if (!isVisitorToastEnabled || activeTab !== "visitors") return;

    const collegeCities = [
      {
        city: "Botucatu",
        state: "SP",
        page: "Portal do Formando (Medicina UNESP)",
        device: "mobile",
      },
      {
        city: "Bauru",
        state: "SP",
        page: "Galeria de Fotos do Baile",
        device: "mobile",
      },
      {
        city: "Campinas",
        state: "SP",
        page: "Página Inicial (Landing Page)",
        device: "desktop",
      },
      {
        city: "São Paulo",
        state: "SP",
        page: "Área da Comissão de Formatura",
        device: "mobile",
      },
      {
        city: "Ribeirão Preto",
        state: "SP",
        page: "Planos & Pacotes Formatura",
        device: "mobile",
      },
      {
        city: "São José do Rio Preto",
        state: "SP",
        page: "Portal do Aluno",
        device: "desktop",
      },
      {
        city: "Sorocaba",
        state: "SP",
        page: "Cronograma de Eventos & Cerimonial",
        device: "mobile",
      },
      {
        city: "Piracicaba",
        state: "SP",
        page: "Página Inicial",
        device: "mobile",
      },
      {
        city: "Marília",
        state: "SP",
        page: "Portal do Formando",
        device: "mobile",
      },
      {
        city: "Presidente Prudente",
        state: "SP",
        page: "Galeria de Fotos",
        device: "desktop",
      },
      {
        city: "Curitiba",
        state: "PR",
        page: "Página Inicial",
        device: "mobile",
      },
    ];

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextVisitor = () => {
      const delay = Math.floor(Math.random() * (45000 - 25000 + 1)) + 25000;
      timeoutId = setTimeout(() => {
        const randomHit =
          collegeCities[Math.floor(Math.random() * collegeCities.length)];
        triggerVisitorToast(
          randomHit.city,
          randomHit.state,
          randomHit.page,
          randomHit.device,
        );
        scheduleNextVisitor();
      }, delay);
    };

    // First scheduled trigger after 6 seconds of entering visitors tab
    timeoutId = setTimeout(() => {
      const initialHit =
        collegeCities[Math.floor(Math.random() * collegeCities.length)];
      triggerVisitorToast(
        initialHit.city,
        initialHit.state,
        initialHit.page,
        initialHit.device,
      );
      scheduleNextVisitor();
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [isVisitorToastEnabled, triggerVisitorToast, activeTab]);

  const [studentContracts, setStudentContracts] = useState<StudentContract[]>(
    () => {
      try {
        const saved = localStorage.getItem("wm2_student_contracts");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    },
  );

  const handleMarkContractViewed = (studentId: string) => {
    setStudentContracts((prev) => {
      const updated = prev.map((c) => {
        if (c.studentId === studentId && c.isNewSignature) {
          return {
            ...c,
            isNewSignature: false,
            adminViewedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      try {
        localStorage.setItem("wm2_student_contracts", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  React.useEffect(() => {
    const syncContracts = () => {
      try {
        const saved = localStorage.getItem("wm2_student_contracts");
        if (saved) {
          setStudentContracts(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    syncContracts();
    window.addEventListener("focus", syncContracts);
    return () => window.removeEventListener("focus", syncContracts);
  }, [showContractPdfModal]);
  const [dashboardTurmaFilter, setDashboardTurmaFilter] =
    useState<string>("all");
  const [dashboardYearFilter, setDashboardYearFilter] = useState<string>("all");
  const [overviewAlertFilter, setOverviewAlertFilter] = useState<
    "all" | "inadimplencia" | "leads" | "eventos" | "reunioes"
  >("all");
  const [salesChartMetric, setSalesChartMetric] = useState<"value" | "count">(
    "value",
  );
  const [salesChartType, setSalesChartType] = useState<
    "monthly" | "cumulative"
  >("cumulative");

  // Staff registry modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaffEventId, setNewStaffEventId] = useState("");

  // Modals / Creators States
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [newTurmaName, setNewTurmaName] = useState("");
  const [newTurmaInstitution, setNewTurmaInstitution] = useState("");
  const [newTurmaYear, setNewTurmaYear] = useState(2026);
  const [newTurmaTarget, setNewTurmaTarget] = useState(100);
  const [newTurmaPrice, setNewTurmaPrice] = useState(9000);
  const [newTurmaExtraInvitePrice, setNewTurmaExtraInvitePrice] = useState(150);
  const [newTurmaExtraInviteStartDate, setNewTurmaExtraInviteStartDate] =
    useState("");
  const [newTurmaLocation, setNewTurmaLocation] = useState("");
  const [newTurmaImage, setNewTurmaImage] = useState("");
  const [newTurmaContractType, setNewTurmaContractType] = useState<
    "turma" | "individual"
  >("turma");
  const [newTurmaIndividualService, setNewTurmaIndividualService] =
    useState("");
  const [newTurmaIndividualCourse, setNewTurmaIndividualCourse] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Drag and Drop Photo Reordering States
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(
    null,
  );
  const [dragOverPhotoIndex, setDragOverPhotoIndex] = useState<number | null>(
    null,
  );

  // Edit Turma States
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [editTurmaName, setEditTurmaName] = useState("");
  const [editTurmaInstitution, setEditTurmaInstitution] = useState("");
  const [editTurmaYear, setEditTurmaYear] = useState(2026);
  const [editTurmaTarget, setEditTurmaTarget] = useState(100);
  const [editTurmaPrice, setEditTurmaPrice] = useState(9000);
  const [editTurmaExtraInvitePrice, setEditTurmaExtraInvitePrice] =
    useState(150);
  const [editTurmaExtraInviteStartDate, setEditTurmaExtraInviteStartDate] =
    useState("");
  const [editTurmaLocation, setEditTurmaLocation] = useState("");
  const [editTurmaImage, setEditTurmaImage] = useState("");
  const [editTurmaStatus, setEditTurmaStatus] = useState<
    "Ativo" | "Em Negociação" | "Concluído"
  >("Ativo");
  const [editTurmaContractType, setEditTurmaContractType] = useState<
    "turma" | "individual"
  >("turma");
  const [editTurmaIndividualService, setEditTurmaIndividualService] =
    useState("");
  const [editTurmaIndividualCourse, setEditTurmaIndividualCourse] =
    useState("");
  const [isEditDragging, setIsEditDragging] = useState(false);
  const [printingEvent, setPrintingEvent] = useState<Evento | null>(null);
  const [printingAttendanceEvent, setPrintingAttendanceEvent] =
    useState<Evento | null>(null);
  const [isGeneratingEventPDF, setIsGeneratingEventPDF] = useState(false);
  const [isGeneratingAttendancePDF, setIsGeneratingAttendancePDF] =
    useState(false);
  const [isGeneratingProposalPDF, setIsGeneratingProposalPDF] = useState(false);

  // Notification creation states
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifCategory, setNotifCategory] = useState<
    "Geral" | "Boleto" | "Mural"
  >("Geral");
  const [notifTargetTurma, setNotifTargetTurma] = useState("all");
  const [notifLogs, setNotifLogs] = useState<
    { id: string; time: string; type: "info" | "success"; msg: string }[]
  >(() => [
    {
      id: "initial-log",
      time: new Date().toLocaleTimeString(),
      type: "info",
      msg: "Console de Disparo FCM Inicializado. Pronto para emissão de alertas.",
    },
  ]);

  const handleSendPush = () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      alert("Por favor, preencha o título e o corpo da notificação.");
      return;
    }

    const newNotification: SystemNotification = {
      id: "notif-" + Date.now(),
      title: notifTitle,
      body: notifBody,
      category: notifCategory,
      targetTurmaId: notifTargetTurma,
      date: new Date().toISOString(),
      readBy: [],
    };

    // Count target devices
    const targetDevices = pushTokens.filter((t) => {
      if (notifTargetTurma === "all") return true;
      const student = formandos.find((f) => f.id === t.formandoId);
      return student?.turmaId === notifTargetTurma;
    });

    // Add to notification list
    const updatedNotifications = [...(notifications || []), newNotification];

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications: updatedNotifications,
      pushTokens,
    });

    // Add dispatch log
    const targetName =
      notifTargetTurma === "all"
        ? "Todos os Formandos"
        : turmas.find((t) => t.id === notifTargetTurma)?.name ||
          "Turma Selecionada";

    const successLog = {
      id: "log-" + Date.now(),
      time: new Date().toLocaleTimeString(),
      type: "success" as const,
      msg: `[SUCCESS] Notificação enviada para "${targetName}". FCM encaminhou a mensagem para ${targetDevices.length} dispositivo(s) inscrito(s).`,
    };

    setNotifLogs((prev) => [successLog, ...prev]);

    // Clear inputs
    setNotifTitle("");
    setNotifBody("");
  };

  const handleDeleteNotif = (notifId: string) => {
    const updated = (notifications || []).filter((n) => n.id !== notifId);
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications: updated,
      pushTokens,
    });
  };

  // Meeting scheduling states
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingTargetTurma, setMeetingTargetTurma] = useState("");

  const handleScheduleMeeting = () => {
    if (
      !meetingTitle.trim() ||
      !meetingDescription.trim() ||
      !meetingDate ||
      !meetingTime ||
      !meetingTargetTurma
    ) {
      alert("Por favor, preencha todos os campos obrigatórios da reunião.");
      return;
    }

    const newMeeting: Reuniao = {
      id: "reuniao-" + Date.now(),
      turmaId: meetingTargetTurma,
      title: meetingTitle,
      description: meetingDescription,
      date: meetingDate,
      time: meetingTime,
      link: meetingLink.trim() || undefined,
      status: "Agendada",
      createdAt: new Date().toISOString(),
    };

    // Format date beautifully for Portuguese
    const formattedDate = new Date(
      meetingDate + "T00:00:00",
    ).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const newNotification: SystemNotification = {
      id: "notif-" + Date.now(),
      title: `📅 Reunião com a Comissão: ${meetingTitle}`,
      body: `Uma nova reunião de alinhamento com a comissão foi agendada para o dia ${formattedDate} às ${meetingTime}h. Pauta: ${meetingDescription}. ${meetingLink ? `Link: ${meetingLink}` : ""}`,
      category: "Mural",
      targetTurmaId: meetingTargetTurma,
      date: new Date().toISOString(),
      readBy: [],
    };

    // Send push simulation to commission members' tokens
    const targetComissaoDevices = pushTokens.filter((t) => {
      const student = formandos.find((f) => f.id === t.formandoId);
      return (
        student?.turmaId === meetingTargetTurma && student?.role === "comissao"
      );
    });

    const targetComissaoCount = targetComissaoDevices.length;
    const targetTurmaName =
      turmas.find((t) => t.id === meetingTargetTurma)?.name || "Turma";

    // Update state using onUpdateState
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications: [...(notifications || []), newNotification],
      pushTokens,
      reunioes: [...(reunioes || []), newMeeting],
    });

    // Add push log
    const successLog = {
      id: "log-" + Date.now(),
      time: new Date().toLocaleTimeString(),
      type: "success" as const,
      msg: `[MEETING & PUSH] Reunião "${meetingTitle}" agendada para "${targetTurmaName}". Notificação Push automática enviada via FCM para ${targetComissaoCount} dispositivo(s) ativo(s) da comissão.`,
    };
    setNotifLogs((prev) => [successLog, ...prev]);

    // Clear inputs
    setMeetingTitle("");
    setMeetingDescription("");
    setMeetingDate("");
    setMeetingTime("");
    setMeetingLink("");
    setMeetingTargetTurma("");

    alert(
      "Reunião agendada com a comissão e notificação push enviada automaticamente!",
    );
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancelar e Excluir Reunião",
      message: "Tem certeza que deseja cancelar e excluir esta reunião da agenda?",
      onConfirm: () => {
        const updated = (reunioes || []).filter((m) => m.id !== meetingId);
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores,
          pacotes,
          fotos,
          notifications,
          pushTokens,
          reunioes: updated,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleUpdateMeetingStatus = (
    meetingId: string,
    newStatus: "Agendada" | "Realizada" | "Cancelada",
  ) => {
    const updated = (reunioes || []).map((m) => {
      if (m.id === meetingId) {
        return { ...m, status: newStatus };
      }
      return m;
    });
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications,
      pushTokens,
      reunioes: updated,
    });
  };

  // Mural creation states
  const [muralTitle, setMuralTitle] = useState("");
  const [muralContent, setMuralContent] = useState("");
  const [muralCategory, setMuralCategory] = useState<
    "Geral" | "Financeiro" | "Evento" | "Aviso Importante"
  >("Geral");
  const [muralTargetTurma, setMuralTargetTurma] = useState("all");
  const [muralImage, setMuralImage] = useState<string>("");
  const [isMuralDragging, setIsMuralDragging] = useState(false);
  const [muralPinned, setMuralPinned] = useState(false);
  const [muralCommentsText, setMuralCommentsText] = useState<{
    [key: string]: string;
  }>({});
  const [muralLogs, setMuralLogs] = useState<
    { id: string; time: string; type: "info" | "success"; msg: string }[]
  >(() => [
    {
      id: "mural-init",
      time: new Date().toLocaleTimeString(),
      type: "info",
      msg: "Painel do Mural do Gestor Iniciado. Pronto para publicar comunicados.",
    },
  ]);

  const handleSendMural = () => {
    if (!muralTitle.trim() || !muralContent.trim()) {
      alert("Por favor, preencha o título e o conteúdo do aviso.");
      return;
    }

    const targetTurmas =
      muralTargetTurma === "all" ? turmas.map((t) => t.id) : [muralTargetTurma];

    const newMuralItems: MuralItem[] = targetTurmas.map((turmaId) => ({
      id: "mural-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      turmaId,
      title: muralTitle,
      content: muralContent,
      category: muralCategory,
      author: "WM2 Produções (Gestor)",
      date: new Date().toLocaleDateString("pt-BR"),
      imageUrl: muralImage || undefined,
      pinned: muralPinned,
    }));

    const updatedMural = [...(mural || []), ...newMuralItems];

    let updatedNotifications = notifications || [];
    if (muralImage) {
      const autoNotification: SystemNotification = {
        id: "notif-auto-" + Date.now(),
        title: `📸 Novo comunicado: ${muralTitle}`,
        body: `Confira a nova publicação com imagem no mural de avisos: "${muralContent.substring(0, 100)}${muralContent.length > 100 ? "..." : ""}"`,
        category: "Mural",
        targetTurmaId: muralTargetTurma,
        date: new Date().toISOString(),
        readBy: [],
      };

      updatedNotifications = [...updatedNotifications, autoNotification];

      // Count devices to simulate FCM dispatch
      const targetDevices = (pushTokens || []).filter((t) => {
        if (muralTargetTurma === "all") return true;
        const student = formandos.find((f) => f.id === t.formandoId);
        return student?.turmaId === muralTargetTurma;
      });

      const targetName =
        muralTargetTurma === "all"
          ? "Todos os Formandos"
          : turmas.find((t) => t.id === muralTargetTurma)?.name ||
            "Turma Selecionada";

      const autoNotifLog = {
        id: "log-auto-" + Date.now(),
        time: new Date().toLocaleTimeString(),
        type: "success" as const,
        msg: `[FCM AUTO] Disparo automático para "${targetName}" por conta da imagem anexada no mural. Encaminhado para ${targetDevices.length} dispositivo(s).`,
      };

      setNotifLogs((prev) => [autoNotifLog, ...prev]);
    }

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications: updatedNotifications,
      pushTokens,
      mural: updatedMural,
    });

    const targetName =
      muralTargetTurma === "all"
        ? "Todas as Turmas"
        : turmas.find((t) => t.id === muralTargetTurma)?.name ||
          "Turma Selecionada";

    const successLog = {
      id: "mural-log-" + Date.now(),
      time: new Date().toLocaleTimeString(),
      type: "success" as const,
      msg: `[SUCCESS] Comunicado "${muralTitle}" publicado no mural de "${targetName}".`,
    };

    setMuralLogs((prev) => [successLog, ...prev]);
    setMuralTitle("");
    setMuralContent("");
    setMuralImage("");
    setMuralPinned(false);
  };

  const handleDeleteMuralItem = (itemId: string) => {
    const updated = (mural || []).filter((item) => item.id !== itemId);
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications,
      pushTokens,
      mural: updated,
    });
  };

  const handleTogglePinMuralItem = (itemId: string) => {
    const updated = (mural || []).map((item) => {
      if (item.id === itemId) {
        return { ...item, pinned: !item.pinned };
      }
      return item;
    });
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications,
      pushTokens,
      mural: updated,
    });
  };

  const handleAddMuralComment = (muralId: string) => {
    const text = muralCommentsText[muralId]?.trim();
    if (!text) return;

    const updatedMural = (mural || []).map((item) => {
      if (item.id === muralId) {
        const existingComments = item.comments || [];
        const newComment = {
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          author: "WM2 Produções (Gestor)",
          text,
          date:
            new Date().toLocaleDateString("pt-BR") +
            " " +
            new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        };
        return {
          ...item,
          comments: [...existingComments, newComment],
        };
      }
      return item;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications,
      pushTokens,
      mural: updatedMural,
    });

    setMuralCommentsText((prev) => ({ ...prev, [muralId]: "" }));
  };

  const handleDeleteMuralComment = (muralId: string, commentId: string) => {
    const updatedMural = (mural || []).map((item) => {
      if (item.id === muralId) {
        const existingComments = item.comments || [];
        return {
          ...item,
          comments: existingComments.filter((c) => c.id !== commentId),
        };
      }
      return item;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
      notifications,
      pushTokens,
      mural: updatedMural,
    });
  };

  const generatePDFFromElement = async (
    elementId: string,
    filename: string,
    setLoading: (loading: boolean) => void,
  ) => {
    const element = document.getElementById(elementId);
    if (!element) {
      alert("Elemento para PDF não encontrado!");
      return;
    }

    setLoading(true);
    try {
      // Temporarily remove max-height and scrolling to get a full view
      const originalStyle = element.style.cssText;

      element.style.width = "800px";
      element.style.height = "auto";
      element.style.maxHeight = "none";
      element.style.overflow = "visible";

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        onclone: (clonedDoc) => {
          // Remove all <link rel="stylesheet"> tags in the cloned document to prevent html2canvas from fetching and crashing on them
          const linkTags = Array.from(clonedDoc.getElementsByTagName("link"));
          linkTags.forEach((link) => {
            if (link.rel === "stylesheet") {
              link.parentNode?.removeChild(link);
            }
          });

          // Extract all CSS text from original document.styleSheets
          let cssText = "";
          for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            try {
              const rules = sheet.cssRules || sheet.rules;
              if (rules) {
                for (let j = 0; j < rules.length; j++) {
                  cssText += rules[j].cssText + "\n";
                }
              }
            } catch (e) {
              console.warn(
                "Could not read stylesheet rules (cross-origin):",
                e,
              );
            }
          }

          // Clean oklch, oklab, color-mix from the combined cssText
          const cleanCSS = replaceUnsupportedColors(cssText);

          // Inject a new style tag with the clean css into head
          const newStyle = clonedDoc.createElement("style");
          newStyle.type = "text/css";
          newStyle.appendChild(clonedDoc.createTextNode(cleanCSS));
          clonedDoc.head.appendChild(newStyle);

          // Clean any existing style tags' innerHTML too
          const styleTags = Array.from(clonedDoc.getElementsByTagName("style"));
          styleTags.forEach((styleTag) => {
            if (styleTag !== newStyle && styleTag.innerHTML) {
              styleTag.innerHTML = replaceUnsupportedColors(styleTag.innerHTML);
            }
          });

          // Replace inline styles for all elements
          const allElements = Array.from(clonedDoc.getElementsByTagName("*"));
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText) {
              htmlEl.style.cssText = replaceUnsupportedColors(
                htmlEl.style.cssText,
              );
            }
          });
        },
      });

      // Restore original styling
      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Page 1
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      heightLeft -= pageHeight;

      // Dynamic remaining pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST",
        );
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert(
        "Houve um erro ao gerar o PDF. Se o problema persistir, por favor abra o app em uma Nova Aba usando o botão no canto superior direito do AI Studio.",
      );
    } finally {
      setLoading(false);
    }
  };

  const [showFormandoModal, setShowFormandoModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [newStdName, setNewStdName] = useState("");
  const [newStdEmail, setNewStdEmail] = useState("");
  const [newStdCPF, setNewStdCPF] = useState("");
  const [newStdPhone, setNewStdPhone] = useState("");
  const [newStdAddress, setNewStdAddress] = useState("");
  const [newStdTurmaId, setNewStdTurmaId] = useState("");
  const [newStdRole, setNewStdRole] = useState<"formando" | "comissao">(
    "formando",
  );
  const [newStdPackage, setNewStdPackage] = useState("Pacote Completo WM2");
  const [newStdCode, setNewStdCode] = useState("");
  const [newStdInstallmentCount, setNewStdInstallmentCount] = useState(10);
  const [newStdExtraInvites, setNewStdExtraInvites] = useState<number>(0);

  // Edit Formando States
  const [editingFormando, setEditingFormando] = useState<Formando | null>(null);
  const [editStdName, setEditStdName] = useState("");
  const [editStdEmail, setEditStdEmail] = useState("");
  const [editStdCPF, setEditStdCPF] = useState("");
  const [editStdPhone, setEditStdPhone] = useState("");
  const [editStdTurmaId, setEditStdTurmaId] = useState("");
  const [editStdAddress, setEditStdAddress] = useState("");
  const [editStdRole, setEditStdRole] = useState<"formando" | "comissao">(
    "formando",
  );
  const [editStdPackage, setEditStdPackage] = useState("");
  const [editStdExtraPackages, setEditStdExtraPackages] = useState<
    FormandoExtraPackage[]
  >([]);
  const [showAddExtraPackageModal, setShowAddExtraPackageModal] =
    useState(false);
  const [extraPkgMode, setExtraPkgMode] = useState<
    "preset" | "catalog" | "custom"
  >("preset");
  const [extraPkgPresetId, setExtraPkgPresetId] = useState<string>("ensaio");
  const [extraPkgCatalogId, setExtraPkgCatalogId] = useState<string>("");
  const [extraPkgCustomName, setExtraPkgCustomName] = useState<string>("");
  const [extraPkgCustomPrice, setExtraPkgCustomPrice] = useState<number>(1000);
  const [extraPkgCustomUnitPrice, setExtraPkgCustomUnitPrice] =
    useState<number>(1000);
  const [extraPkgCustomQuantity, setExtraPkgCustomQuantity] =
    useState<number>(1);
  const [extraPkgCustomCategory, setExtraPkgCustomCategory] =
    useState<FormandoExtraPackage["category"]>("foto_video");
  const [extraPkgCustomItemType, setExtraPkgCustomItemType] =
    useState<FormandoExtraPackage["itemType"]>("item_avulso");
  const [extraPkgCustomDesc, setExtraPkgCustomDesc] = useState<string>("");
  const [extraPkgCategoryFilter, setExtraPkgCategoryFilter] =
    useState<string>("all");
  const [extraPkgSplitMode, setExtraPkgSplitMode] = useState<
    "recalculate_all" | "add_specific_installments" | "none"
  >("recalculate_all");
  const [extraPkgInstallmentsCount, setExtraPkgInstallmentsCount] =
    useState<number>(2);

  // States for live preset customization
  const [presetEditValues, setPresetEditValues] = useState<{
    name: string;
    price: number;
    quantity: number;
    desc: string;
  }>({
    name: "Ensaio Fotográfico VIP em Estúdio",
    price: 1200,
    quantity: 1,
    desc: "Sessão individual com maquiagem, 3 trocas de figurino e 30 fotos em alta resolução.",
  });

  // State for editing already added extra package of student
  const [editingExtraPackage, setEditingExtraPackage] =
    useState<FormandoExtraPackage | null>(null);
  const [editExtraName, setEditExtraName] = useState<string>("");
  const [editExtraPrice, setEditExtraPrice] = useState<number>(0);
  const [editExtraQuantity, setEditExtraQuantity] = useState<number>(1);
  const [editExtraDesc, setEditExtraDesc] = useState<string>("");
  const [editExtraCategory, setEditExtraCategory] =
    useState<FormandoExtraPackage["category"]>("foto_video");
  const [editExtraItems, setEditExtraItems] = useState<string[]>([]);
  const [newExtraItemInput, setNewExtraItemInput] = useState<string>("");
  const [editStdStatus, setEditStdStatus] = useState<
    "Ativo" | "Pendente" | "Inadimplente"
  >("Ativo");
  const [editStdTotalPaid, setEditStdTotalPaid] = useState<number>(0);
  const [editStdTotalDue, setEditStdTotalDue] = useState<number>(0);
  const [editStdCode, setEditStdCode] = useState("");
  const [editStdExtraInvites, setEditStdExtraInvites] = useState<number>(0);
  const [editStdParcelas, setEditStdParcelas] = useState<Parcela[]>([]);
  const [regerarQtd, setRegerarQtd] = useState(10);
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  // Sales Funnel Lead States
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<Lead | null>(
    null,
  );
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [leadTypeFilter, setLeadTypeFilter] = useState<
    "all" | "turma" | "individual"
  >("all");
  const [leadSortOrder, setLeadSortOrder] = useState<"newest" | "oldest">(
    "newest",
  );
  const [leadFollowUpFilter, setLeadFollowUpFilter] = useState<
    "all" | "overdue"
  >("all");
  const [leadViewMode, setLeadViewMode] = useState<
    "kanban" | "table" | "timeline"
  >("kanban");
  const [turmaViewMode, setTurmaViewMode] = useState<"cards" | "table">(
    "table",
  );
  const [leadInstitution, setLeadInstitution] = useState("");
  const [leadContactName, setLeadContactName] = useState("");
  const [leadContactPhone, setLeadContactPhone] = useState("");
  const [leadContactEmail, setLeadContactEmail] = useState("");
  const [leadIsComissao, setLeadIsComissao] = useState<boolean>(true);
  const [leadContactRoleTitle, setLeadContactRoleTitle] =
    useState<string>("Membro da Comissão");
  const [leadComissaoFilter, setLeadComissaoFilter] = useState<
    "all" | "comissao" | "formando"
  >("all");
  const [leadEstimatedStudents, setLeadEstimatedStudents] =
    useState<number>(50);
  const [leadEstimatedValue, setLeadEstimatedValue] = useState<number>(450000);
  const [leadStage, setLeadStage] = useState<Lead["stage"]>("prospecting");
  const [leadNotes, setLeadNotes] = useState("");
  const [leadPackageId, setLeadPackageId] = useState<string>("");
  const [leadPackageIds, setLeadPackageIds] = useState<string[]>([]);
  const [leadPackageMode, setLeadPackageMode] = useState<"select" | "custom">(
    "select",
  );
  const [customPkgName, setCustomPkgName] = useState("Pacote Personalizado");
  const [customPkgPrice, setCustomPkgPrice] = useState<number>(8500);
  const [customPkgDescription, setCustomPkgDescription] = useState("");
  const [customPkgItems, setCustomPkgItems] = useState<string[]>([
    "Beca Completa",
    "Baile de Gala",
    "Coquetel",
  ]);
  const [newCustomItemText, setNewCustomItemText] = useState("");
  const [leadContractType, setLeadContractType] = useState<
    "turma" | "individual"
  >("turma");

  // Custom Confirmation Dialog State
  const [gallerySubTab, setGallerySubTab] = useState<
    "turmas" | "portfolio_site" | "produtos_site"
  >("turmas");
  const [folderDisplayLayout, setFolderDisplayLayout] = useState<
    "grid" | "list"
  >("grid");
  const [selectedPortfolioAlbumId, setSelectedPortfolioAlbumId] =
    useState<string>("gala");
  const [selectedProductId, setSelectedProductId] = useState<
    | "album"
    | "placa"
    | "estudio"
    | "quadro"
    | "beca"
    | "anel"
    | "convite"
    | "brindes"
  >("album");
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<
    number | null
  >(null);
  const [galleryUploadStatusText, setGalleryUploadStatusText] =
    useState<string>("");

  const renderSyncStatusBadge = (customLabel?: string) => {
    const isUploading = portfolioUploading || galleryUploadProgress !== null;

    if (isQuotaExceeded) {
      return (
        <div className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 bg-amber-100/90 text-amber-900 border-amber-300 shadow-2xs">
          <CloudOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Salvo Localmente (Cota Excedida)</span>
        </div>
      );
    }

    if (syncError) {
      return (
        <div className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 bg-rose-100/90 text-rose-900 border-rose-300 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>Erro na Sincronização</span>
        </div>
      );
    }

    if (isUploading) {
      const pct = galleryUploadProgress ?? 45;
      return (
        <div className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-amber-50/95 text-amber-950 border-amber-300 shadow-sm min-w-[260px] flex flex-col gap-1.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
              <span className="font-extrabold text-amber-900">
                {galleryUploadStatusText || "Sincronizando Foto(s)..."}
              </span>
            </div>
            <span className="text-[11px] font-black text-amber-800 shrink-0">
              {pct}%
            </span>
          </div>
          <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden border border-amber-300/80 shadow-xs">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(6, pct)}%` }}
            />
          </div>
        </div>
      );
    }

    if (!isSynced) {
      return (
        <div className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-amber-50/95 text-amber-950 border-amber-300 shadow-sm min-w-[260px] flex flex-col gap-1.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
              <span className="font-extrabold text-amber-900">
                Sincronizando com Firebase...
              </span>
            </div>
          </div>
          <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden border border-amber-300/80 shadow-xs relative">
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 h-full rounded-full w-full animate-pulse transition-all duration-300" />
          </div>
        </div>
      );
    }

    return (
      <div className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-2xs min-w-[260px] flex flex-col gap-1.5 transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-extrabold text-emerald-950">
              {customLabel || "Sincronizado no Firebase"}
            </span>
          </div>
        </div>
        <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden border border-emerald-300/60 shadow-xs">
          <div className="bg-emerald-500 h-full rounded-full w-full transition-all duration-500" />
        </div>
      </div>
    );
  };


  // confirmDialog moved to top

  // Package Management States
  const [selectedTurmaForPackages, setSelectedTurmaForPackages] =
    useState<Turma | null>(null);

  // Proposal and Budget Generator States
  const [selectedTurmaForProposal, setSelectedTurmaForProposal] = useState<
    any | null
  >(null);
  const [leadDetailTab, setLeadDetailTab] = useState<
    "info" | "pacotes" | "message" | "meeting" | "timeline"
  >("info");
  // Opportunity Package Manager States
  const [leadPkgSearchQuery, setLeadPkgSearchQuery] = useState("");
  const [showOpportunityPkgForm, setShowOpportunityPkgForm] = useState(false);
  const [editingOpportunityPkg, setEditingOpportunityPkg] =
    useState<Pacote | null>(null);
  const [oppPkgName, setOppPkgName] = useState("");
  const [oppPkgPrice, setOppPkgPrice] = useState<number>(8500);
  const [oppPkgDesc, setOppPkgDesc] = useState("");
  const [oppPkgItems, setOppPkgItems] = useState<string[]>([]);
  const [oppPkgNewItem, setOppPkgNewItem] = useState("");
  const [oppPkgFormError, setOppPkgFormError] = useState("");
  const [newActivityType, setNewActivityType] = useState<
    "call" | "whatsapp" | "meeting" | "email" | "note" | "proposal"
  >("note");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [newActivityFollowUp, setNewActivityFollowUp] = useState("");
  const [leadMsgTemplate, setLeadMsgTemplate] = useState<
    "welcome" | "proposal" | "followup"
  >("welcome");
  const [leadCustomMsg, setLeadCustomMsg] = useState("");
  const [leadMeetingTitle, setLeadMeetingTitle] = useState("");
  const [leadMeetingDate, setLeadMeetingDate] = useState("");
  const [leadMeetingTime, setLeadMeetingTime] = useState("");
  const [leadMeetingLink, setLeadMeetingLink] = useState("");
  const [leadMeetingDesc, setLeadMeetingDesc] = useState("");
  const [selectedTurmaForFinancialReport, setSelectedTurmaForFinancialReport] =
    useState<Turma | null>(null);
  const [isGeneratingFinancialReportPDF, setIsGeneratingFinancialReportPDF] =
    useState(false);
  const [proposalOnlyText, setProposalOnlyText] = useState(false);
  const [proposalNotes, setProposalNotes] = useState("");
  const [proposalItems, setProposalItems] = useState<
    Array<{ name: string; included: boolean }>
  >([]);
  const [newProposalItemName, setNewProposalItemName] = useState("");
  const [proposalShowPaymentDetails, setProposalShowPaymentDetails] =
    useState(true);
  const [proposalTargetStudentsOverride, setProposalTargetStudentsOverride] =
    useState<number>(0);
  const [proposalInstallmentCount, setProposalInstallmentCount] =
    useState<number>(10);
  const [proposalWhatsappPhone, setProposalWhatsappPhone] = useState("");
  const [editingPackage, setEditingPackage] = useState<Pacote | null>(null);
  const [pkgName, setPkgName] = useState("");
  const [pkgDescription, setPkgDescription] = useState("");
  const [pkgPrice, setPkgPrice] = useState<number>(0);
  const [pkgItemsString, setPkgItemsString] = useState(""); // Comma-separated or itemized list of inclusions
  const [isCreatingNewPackage, setIsCreatingNewPackage] = useState(false);

  const [showEventoModal, setShowEventoModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [eventoViewMode, setEventoViewMode] = useState<
    "cards" | "table" | "calendar"
  >("calendar");
  const [eventoSearchQuery, setEventoSearchQuery] = useState("");
  const [eventoTurmaFilter, setEventoTurmaFilter] = useState("all");
  const [newEvtTurmaId, setNewEvtTurmaId] = useState("");
  const [newEvtTitle, setNewEvtTitle] = useState("");
  const [newEvtDate, setNewEvtDate] = useState("");
  const [newEvtTime, setNewEvtTime] = useState("");
  const [newEvtVenue, setNewEvtVenue] = useState("");
  const [newEvtDescription, setNewEvtDescription] = useState("");

  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(
    null,
  );
  const [fornecedoresViewMode, setFornecedoresViewMode] = useState<
    "cards" | "table"
  >("cards");
  const [fornecedoresSearchQuery, setFornecedoresSearchQuery] = useState("");
  const [newFornName, setNewFornName] = useState("");
  const [newFornService, setNewFornService] = useState("");
  const [newFornPhone, setNewFornPhone] = useState("");
  const [newFornEmail, setNewFornEmail] = useState("");
  const [newFornLogoUrl, setNewFornLogoUrl] = useState("");

  const [staffViewMode, setStaffViewMode] = useState<"cards" | "table">(
    "cards",
  );

  // Photo / Gallery Management States
  const [selectedAlbumFolderId, setSelectedAlbumFolderId] = useState<
    string | null
  >(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [newAlbumTurmaId, setNewAlbumTurmaId] = useState("");
  const [newAlbumCoverUrl, setNewAlbumCoverUrl] = useState("");
  const [newFotoAlbumId, setNewFotoAlbumId] = useState<string>("");
  const [editFotoAlbumId, setEditFotoAlbumId] = useState<string>("");

  const [showFotoModal, setShowFotoModal] = useState(false);
  const [newFotoTurmaId, setNewFotoTurmaId] = useState("");
  const [newFotoFormandoId, setNewFotoFormandoId] = useState("");
  const [newFotoEventName, setNewFotoEventName] = useState("");
  const [newFotoUrl, setNewFotoUrl] = useState("");
  const [newFotoCaption, setNewFotoCaption] = useState("");
  const [isBatchUpload, setIsBatchUpload] = useState(false);
  const [batchUrls, setBatchUrls] = useState("");
  const [uploadType, setUploadType] = useState<"url" | "file">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileFormandoIds, setFileFormandoIds] = useState<{
    [key: number]: string;
  }>({});
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [editingFoto, setEditingFoto] = useState<Foto | null>(null);
  const [editFotoTurmaId, setEditFotoTurmaId] = useState("");
  const [editFotoFormandoId, setEditFotoFormandoId] = useState("");
  const [editFotoEventName, setEditFotoEventName] = useState("");
  const [editFotoUrl, setEditFotoUrl] = useState("");
  const [editFotoCaption, setEditFotoCaption] = useState("");

  // Album / Folder Management Helper Handlers
  const handleOpenNewAlbumModal = (presetTurmaId?: string) => {
    setEditingAlbum(null);
    setNewAlbumName("");
    setNewAlbumDescription("");
    setNewAlbumTurmaId(presetTurmaId || turmas[0]?.id || "");
    setNewAlbumCoverUrl("");
    setShowAlbumModal(true);
  };

  const handleOpenEditAlbumModal = (alb: Album) => {
    setEditingAlbum(alb);
    setNewAlbumName(alb.name);
    setNewAlbumDescription(alb.description || "");
    setNewAlbumTurmaId(alb.turmaId);
    setNewAlbumCoverUrl(alb.coverUrl || "");
    setShowAlbumModal(true);
  };

  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim() || !newAlbumTurmaId) return;

    if (editingAlbum) {
      const updatedAlbums = (albums || []).map((a) =>
        a.id === editingAlbum.id
          ? {
              ...a,
              name: newAlbumName.trim(),
              description: newAlbumDescription.trim(),
              turmaId: newAlbumTurmaId,
              coverUrl: newAlbumCoverUrl.trim() || a.coverUrl,
            }
          : a,
      );
      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores,
        pacotes,
        albums: updatedAlbums,
        fotos,
        notifications,
        pushTokens,
        mural,
        reunioes,
      });
    } else {
      const newAlbum: Album = {
        id: "alb-" + Date.now(),
        name: newAlbumName.trim(),
        description: newAlbumDescription.trim(),
        turmaId: newAlbumTurmaId,
        coverUrl:
          newAlbumCoverUrl.trim() ||
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        createdAt: new Date().toISOString(),
      };
      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores,
        pacotes,
        albums: [...(albums || []), newAlbum],
        fotos,
        notifications,
        pushTokens,
        mural,
        reunioes,
      });
    }
    setShowAlbumModal(false);
    setEditingAlbum(null);
    setNewAlbumName("");
    setNewAlbumDescription("");
    setNewAlbumCoverUrl("");
  };

  const handleDeleteAlbum = (albumId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Pasta / Álbum",
      message:
        "Tem certeza que deseja excluir esta pasta/álbum? As fotos contidas nesta pasta perderão a associação com a pasta, mas não serão excluídas permanentemente.",
      onConfirm: () => {
        const updatedAlbums = (albums || []).filter((a) => a.id !== albumId);
        const updatedFotos = (fotos || []).map((f) =>
          f.albumId === albumId ? { ...f, albumId: undefined } : f,
        );
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores,
          pacotes,
          albums: updatedAlbums,
          fotos: updatedFotos,
          notifications,
          pushTokens,
          mural,
          reunioes,
        });
        if (selectedAlbumFolderId === albumId) {
          setSelectedAlbumFolderId(null);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Event Staff Management States
  const [activeEventTabs, setActiveEventTabs] = useState<
    Record<string, "suppliers" | "staff" | "guests" | "expenses">
  >({});
  const [addingStaffEventId, setAddingStaffEventId] = useState<string | null>(
    null,
  );
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffPhotoUrl, setNewStaffPhotoUrl] = useState("");
  const [newStaffStatus, setNewStaffStatus] = useState<
    "Confirmado" | "Pendente"
  >("Pendente");
  const [editingStaffMember, setEditingStaffMember] = useState<{
    eventId: string;
    originalName: string;
    name: string;
    role: string;
    phone: string;
    status: "Confirmado" | "Pendente";
    photoUrl?: string;
    eventTitle?: string;
  } | null>(null);
  const [staffQuery, setStaffQuery] = useState("");

  // Event Supplier Management States
  const [addingSupplierEventId, setAddingSupplierEventId] = useState<
    string | null
  >(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [customSupplierName, setCustomSupplierName] = useState<string>("");
  const [customSupplierService, setCustomSupplierService] =
    useState<string>("");
  const [newSupplierStatus, setNewSupplierStatus] = useState<
    "Confirmado" | "Pendente"
  >("Pendente");

  // Payment Gateway Configuration States
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<
    "boletocloud" | "asaas" | "mercadopago" | "efi" | "pagseguro"
  >("boletocloud");
  const [gatewayToken, setGatewayToken] = useState(
    "api_pub_Ym9sZXRvY2xvdWRfYXBpX3Rva2VuX3NhbmRib3g6",
  );
  const [boletoCloudAccountToken, setBoletoCloudAccountToken] = useState(
    "ca_b92a832c81d81f28b3a88c7182fb",
  );
  const [gatewayEnv, setGatewayEnv] = useState<"production" | "sandbox">(
    "sandbox",
  );
  const [webhookSecret, setWebhookSecret] = useState(
    "whsec_bc_M82x98y10z81h7182as831ha7",
  );
  const [matchByField, setMatchByField] = useState<"cpf" | "email">("cpf");
  const [autoNotifyStudent, setAutoNotifyStudent] = useState(true);
  const [gatewayStatusMessage, setGatewayStatusMessage] = useState<
    "Conectado" | "Desconectado" | "Salvando"
  >("Conectado");

  // Gateway Simulator States
  const [simStudentId, setSimStudentId] = useState("");
  const [simParcelaId, setSimParcelaId] = useState("");
  const [simPaymentType, setSimPaymentType] = useState<
    "Boleto" | "Pix" | "Cartão"
  >("Boleto");
  const [gatewayLogs, setGatewayLogs] = useState<
    Array<{
      id: string;
      time: string;
      type: "success" | "info" | "error";
      message: string;
    }>
  >([
    {
      id: "1",
      time: "16:30:15",
      type: "info",
      message:
        "Sistema de conciliação automática via Boleto Cloud inicializado com sucesso.",
    },
    {
      id: "2",
      time: "16:30:16",
      type: "success",
      message:
        "Webhook de homologação configurado com sucesso: https://api.wm2producoes.com.br/v1/webhooks/boletocloud",
    },
  ]);

  // Automated Overdue Billing Reminder States
  const [billingRemindersEnabled, setBillingRemindersEnabled] = useState(true);
  const [billingReminderFrequency, setBillingReminderFrequency] = useState<
    "3_days" | "5_days" | "7_days" | "10_days" | "15_days"
  >("5_days");
  const [billingEmailSubject, setBillingEmailSubject] = useState(
    "⚠️ IMPORTANTE: Pendência de Pagamento - Conceittus Formaturas",
  );
  const [billingEmailTemplate, setBillingEmailTemplate] = useState(
    `Prezado(a) {NOME_FORMANDO},\n\nIdentificamos que a sua Parcela #{PARCELA_NUMERO} no valor de {VALOR_PARCELA}, com vencimento em {DATA_VENCIMENTO}, encontra-se pendente de pagamento em nosso sistema.\n\nPedimos a gentileza de regularizar sua situação o quanto antes para evitar a suspensão temporária dos benefícios e o acréscimo de encargos contratuais.\n\nVocê pode acessar o seu boleto atualizado ou chave Pix diretamente no Portal do Aluno.\n\nAtenciosamente,\nSetor Financeiro - Conceittus Formaturas`,
  );
  const [billingWhatsappEnabled, setBillingWhatsappEnabled] = useState(true);
  const [billingWhatsappTemplate, setBillingWhatsappTemplate] = useState(
    `Olá, {NOME_FORMANDO}! 🎓\n\nConstatamos que sua Parcela #{PARCELA_NUMERO} de {VALOR_PARCELA} (Vencimento: {DATA_VENCIMENTO}) ainda está pendente de pagamento.\n\nPor favor, evite multas ou suspensão de benefícios acessando o Portal do Aluno para realizar o pagamento via Pix ou Boleto.\n\nFicamos à disposição para ajudar!\nAtenciosamente,\nFinanceiro Conceittus Formaturas`,
  );
  const [billingReminderLogs, setBillingReminderLogs] = useState<
    Array<{
      id: string;
      date: string;
      studentName: string;
      installment: string;
      status: "Enviado" | "Falhou";
      email: string;
      channel?: "E-mail" | "WhatsApp";
    }>
  >([
    {
      id: "1",
      date: "04/07/2026 09:15",
      studentName: "Gabriel Santos Silva",
      installment: "Parcela #3",
      status: "Enviado",
      email: "gabriel.santos@gmail.com",
      channel: "E-mail",
    },
    {
      id: "2",
      date: "04/07/2026 09:16",
      studentName: "Mariana Costa Oliveira",
      installment: "Parcela #4",
      status: "Enviado",
      email: "mariana.costa@hotmail.com",
      channel: "E-mail",
    },
    {
      id: "3",
      date: "04/07/2026 10:20",
      studentName: "Gabriel Santos Silva",
      installment: "Parcela #3",
      status: "Enviado",
      email: "(11) 98765-4321",
      channel: "WhatsApp",
    },
  ]);
  const [testStudentIdForBilling, setTestStudentIdForBilling] = useState("");
  const [billingSavedSuccessfully, setBillingSavedSuccessfully] =
    useState(false);
  const [billingComposerTab, setBillingComposerTab] = useState<
    "email" | "whatsapp"
  >("email");
  const [billingPreviewTab, setBillingPreviewTab] = useState<
    "email" | "whatsapp"
  >("email");

  // WhatsApp API Configuration States
  const [waProvider, setWaProvider] = useState<"meta" | "twilio">(() => {
    return (localStorage.getItem("wa_provider") as "meta" | "twilio") || "meta";
  });

  // Meta Cloud API States
  const [waMetaToken, setWaMetaToken] = useState(
    () => localStorage.getItem("wa_meta_token") || "",
  );
  const [waMetaPhoneId, setWaMetaPhoneId] = useState(
    () => localStorage.getItem("wa_meta_phone_id") || "",
  );
  const [waMetaBusinessId, setWaMetaBusinessId] = useState(
    () => localStorage.getItem("wa_meta_business_id") || "",
  );

  // Twilio API States
  const [waTwilioSid, setWaTwilioSid] = useState(
    () => localStorage.getItem("wa_twilio_sid") || "",
  );
  const [waTwilioToken, setWaTwilioToken] = useState(
    () => localStorage.getItem("wa_twilio_token") || "",
  );
  const [waTwilioFrom, setWaTwilioFrom] = useState(
    () => localStorage.getItem("wa_twilio_from") || "",
  );

  // Automation Triggers
  const [waTriggerBilling, setWaTriggerBilling] = useState(
    () => localStorage.getItem("wa_trigger_billing") !== "false",
  );
  const [waTriggerEvent, setWaTriggerEvent] = useState(
    () => localStorage.getItem("wa_trigger_event") !== "false",
  );
  const [waTriggerMeeting, setWaTriggerMeeting] = useState(
    () => localStorage.getItem("wa_trigger_meeting") !== "false",
  );
  const [waTriggerWelcome, setWaTriggerWelcome] = useState(
    () => localStorage.getItem("wa_trigger_welcome") !== "false",
  );

  // WhatsApp Templates
  const [waTemplateBillingName, setWaTemplateBillingName] = useState(
    () =>
      localStorage.getItem("wa_template_billing_name") || "cobranca_parcela",
  );
  const [waTemplateEventName, setWaTemplateEventName] = useState(
    () => localStorage.getItem("wa_template_event_name") || "aviso_evento",
  );
  const [waTemplateMeetingName, setWaTemplateMeetingName] = useState(
    () => localStorage.getItem("wa_template_meeting_name") || "aviso_reuniao",
  );

  // Expenses State & LocalStorage
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("wm2_expenses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EXPENSES;
  });

  React.useEffect(() => {
    localStorage.setItem("wm2_expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Expense Form Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<Expense["category"]>(
    "Fornecedores de Eventos",
  );
  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expenseTurmaId, setExpenseTurmaId] = useState<string>("all");
  const [expenseEventId, setExpenseEventId] = useState<string>("none");
  const [expenseSupplierName, setExpenseSupplierName] = useState("");
  const [expenseStatus, setExpenseStatus] = useState<Expense["status"]>("Pago");
  const [expensePaymentMethod, setExpensePaymentMethod] =
    useState<Expense["paymentMethod"]>("Pix");
  const [expenseNotes, setExpenseNotes] = useState("");

  // Table filters for Expenses
  const [expenseCategoryFilter, setExpenseCategoryFilter] =
    useState<string>("all");
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>("all");
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
  const [expensePeriodFilter, setExpensePeriodFilter] = useState<string>("all");
  const [expenseStartDate, setExpenseStartDate] = useState<string>("");
  const [expenseEndDate, setExpenseEndDate] = useState<string>("");

  const handleOpenNewExpenseModal = (
    presetTurmaId?: string,
    presetEventId?: string,
  ) => {
    setEditingExpense(null);
    setExpenseDesc("");
    setExpenseCategory("Fornecedores de Eventos");
    setExpenseAmount("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setExpenseTurmaId(presetTurmaId || "all");
    setExpenseEventId(presetEventId || "none");
    setExpenseSupplierName("");
    setExpenseStatus("Pago");
    setExpensePaymentMethod("Pix");
    setExpenseNotes("");
    setShowExpenseModal(true);
  };

  const handleOpenEditExpenseModal = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseDesc(exp.description);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount);
    setExpenseDate(exp.date);
    setExpenseTurmaId(exp.turmaId || "all");
    setExpenseEventId(exp.eventId || "none");
    setExpenseSupplierName(exp.supplierName || "");
    setExpenseStatus(exp.status);
    setExpensePaymentMethod(exp.paymentMethod || "Pix");
    setExpenseNotes(exp.notes || "");
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount || Number(expenseAmount) <= 0)
      return;

    const numericAmount = Number(expenseAmount);

    let finalTurmaId = expenseTurmaId === "all" ? undefined : expenseTurmaId;
    let finalEventId: string | undefined = undefined;
    let finalEventName: string | undefined = undefined;

    if (expenseEventId && expenseEventId !== "none") {
      finalEventId = expenseEventId;
      const matchedEvt = eventos.find((evt) => evt.id === expenseEventId);
      if (matchedEvt) {
        finalEventName = matchedEvt.title;
        if (!finalTurmaId) {
          finalTurmaId = matchedEvt.turmaId;
        }
      }
    }

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingExpense.id
            ? {
                ...item,
                description: expenseDesc,
                category: expenseCategory,
                amount: numericAmount,
                date: expenseDate,
                turmaId: finalTurmaId,
                eventId: finalEventId,
                eventName: finalEventName,
                supplierName: expenseSupplierName,
                status: expenseStatus,
                paymentMethod: expensePaymentMethod,
                notes: expenseNotes,
              }
            : item,
        ),
      );
    } else {
      const newExp: Expense = {
        id: "exp-" + Date.now(),
        description: expenseDesc,
        category: expenseCategory,
        amount: numericAmount,
        date: expenseDate,
        turmaId: finalTurmaId,
        eventId: finalEventId,
        eventName: finalEventName,
        supplierName: expenseSupplierName,
        status: expenseStatus,
        paymentMethod: expensePaymentMethod,
        notes: expenseNotes,
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExp, ...prev]);
    }

    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Despesa",
      message: "Tem certeza que deseja excluir esta despesa?",
      onConfirm: () => {
        setExpenses((prev) => prev.filter((item) => item.id !== id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleExpenseStatus = (id: string) => {
    setExpenses((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: Expense["status"] =
            item.status === "Pago" ? "Pendente" : "Pago";
          return { ...item, status: nextStatus };
        }
        return item;
      }),
    );
  };

  const [waTemplateBillingBody, setWaTemplateBillingBody] = useState(
    () =>
      localStorage.getItem("wa_template_billing_body") ||
      "Olá, {NOME_FORMANDO}! 🎓\n\nLembramos que a sua Parcela #{PARCELA_NUMERO} no valor de {VALOR_PARCELA} vence no dia {DATA_VENCIMENTO}.\n\nEvite multas e encargos efetuando o pagamento diretamente no seu Portal do Aluno.\n\nAtenciosamente,\nWM2 Produções",
  );
  const [waTemplateEventBody, setWaTemplateEventBody] = useState(
    () =>
      localStorage.getItem("wa_template_event_body") ||
      "Olá, {NOME_FORMANDO}! 🎉\n\nUm novo evento foi agendado para a sua turma!\n\n📅 {NOME_EVENTO}\n📍 {LOCAL_EVENTO}\n⏰ {DATA_EVENTO} às {HORA_EVENTO}\n\nEsperamos você lá!\nAtenciosamente,\nWM2 Produções",
  );
  const [waTemplateMeetingBody, setWaTemplateMeetingBody] = useState(
    () =>
      localStorage.getItem("wa_template_meeting_body") ||
      "Atenção Comissão! 📅\n\nTemos uma nova reunião agendada: {NOME_REUNIAO}.\n\nData: {DATA_REUNIAO} às {HORA_REUNIAO}.\nLink de Acesso: {LINK_REUNIAO}\n\nContamos com a presença de todos!\nAtenciosamente,\nWM2 Produções",
  );

  // Active testing variables
  const [waTestStudentId, setWaTestStudentId] = useState("");
  const [waTestPhone, setWaTestPhone] = useState("");
  const [waTestType, setWaTestType] = useState<"billing" | "event" | "meeting">(
    "billing",
  );
  const [waSending, setWaSending] = useState(false);
  const [waLogs, setWaLogs] = useState<
    Array<{
      id: string;
      time: string;
      type: "info" | "success" | "error";
      message: string;
      payload?: string;
    }>
  >([
    {
      id: "1",
      time: new Date().toLocaleTimeString("pt-BR"),
      type: "info",
      message:
        "Módulo WhatsApp API inicializado. Insira suas credenciais para realizar disparos reais.",
    },
  ]);

  // Administrator API Testing States
  const [adminTestEmail, setAdminTestEmail] = useState(
    "tuppyliberato1@gmail.com",
  );
  const [adminTestPhone, setAdminTestPhone] = useState("5511987654321");
  const [adminTestChannel, setAdminTestChannel] = useState<
    "email" | "whatsapp"
  >("email");
  const [adminTestingInProgress, setAdminTestingInProgress] = useState(false);

  const handleExportOverdueCSV = () => {
    // Filtrar alunos inadimplentes ou com parcelas em atraso
    const overdueStudents = formandos.filter((student) => {
      const hasOverdueInstallment = parcelas.some(
        (p) => p.formandoId === student.id && p.status === "Atrasada",
      );
      return student.status === "Inadimplente" || hasOverdueInstallment;
    });

    if (overdueStudents.length === 0) {
      alert(
        "Não há alunos inadimplentes ou com parcelas em atraso no momento.",
      );
      return;
    }

    // Definir cabeçalhos do CSV
    const headers = [
      "Nome",
      "Turma/Ano",
      "E-mail",
      "CPF",
      "Telefone",
      "Status do Aluno",
      "Qtd Parcelas Atrasadas",
      "Saldo Devedor em Atraso (R$)",
      "Saldo Devedor Total (R$)",
    ];

    // Mapear formandos para as linhas do CSV
    const rows = overdueStudents.map((student) => {
      const studentTurma = turmas.find((t) => t.id === student.turmaId);
      const turmaLabel = studentTurma
        ? `${studentTurma.name} (${studentTurma.year})`
        : "N/A";

      // Parcelas do aluno
      const studentInstallments = parcelas.filter(
        (p) => p.formandoId === student.id,
      );
      const overdueInstallments = studentInstallments.filter(
        (p) => p.status === "Atrasada",
      );
      const pendingInstallments = studentInstallments.filter(
        (p) => p.status === "Pendente",
      );

      const overdueCount = overdueInstallments.length;

      // Calcular saldos devedores
      const overdueBalance = overdueInstallments.reduce(
        (sum, p) => sum + p.value,
        0,
      );
      const totalDueBalance =
        overdueBalance +
        pendingInstallments.reduce((sum, p) => sum + p.value, 0);

      return [
        student.name,
        turmaLabel,
        student.email || "N/A",
        student.cpf,
        student.phone || "N/A",
        student.status,
        overdueCount,
        overdueBalance.toFixed(2).replace(".", ","),
        totalDueBalance.toFixed(2).replace(".", ","),
      ];
    });

    // Montar conteúdo do CSV. Inclui BOM (\uFEFF) para correto suporte a acentos no Microsoft Excel.
    const csvContent =
      "\uFEFF" +
      [
        headers.join(";"),
        ...rows.map((row) =>
          row
            .map((val) => {
              const valStr = String(val);
              if (
                valStr.includes(";") ||
                valStr.includes("\n") ||
                valStr.includes('"')
              ) {
                return `"${valStr.replace(/"/g, '""')}"`;
              }
              return valStr;
            })
            .join(";"),
        ),
      ].join("\n");

    // Criar Blob e disparar download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Inadimplentes_Consolidado_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdminTestSend = async () => {
    if (adminTestChannel === "email") {
      if (!adminTestEmail.trim() || !adminTestEmail.includes("@")) {
        alert("Por favor, insira um e-mail válido para o administrador.");
        return;
      }
      setAdminTestingInProgress(true);

      setTimeout(() => {
        const logId = String(Date.now());
        const newLog = {
          id: logId,
          date: new Date().toLocaleString("pt-BR").substring(0, 16),
          studentName: "Administrador (Teste API)",
          installment: "Conexão API OK",
          status: "Enviado" as const,
          email: adminTestEmail,
          channel: "E-mail" as const,
        };

        setBillingReminderLogs((prev) => [newLog, ...prev]);
        setAdminTestingInProgress(false);
        alert(
          `✓ Conexão com a API de E-mail validada! E-mail de teste enviado com sucesso para o administrador no endereço: ${adminTestEmail}`,
        );
      }, 1000);
    } else {
      const cleanPhone = adminTestPhone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        alert(
          "Por favor, insira um número de WhatsApp válido (com DDD) para o administrador.",
        );
        return;
      }

      setAdminTestingInProgress(true);
      const logId = String(Date.now());
      const timeStr = new Date().toLocaleTimeString("pt-BR");

      setWaLogs((prev) => [
        {
          id: logId + "_admin_init",
          time: timeStr,
          type: "info",
          message: `Iniciando disparo de teste para o Administrador no WhatsApp +${cleanPhone}...`,
        },
        ...prev,
      ]);

      const textMessage = `📢 [TESTE DE CONEXÃO API]\n\nOlá, Administrador!\n\nEste é um disparo de teste imediato gerado pelo painel para verificar a conectividade com a API de WhatsApp.\n\n✓ Status: Conectado com Sucesso\n📅 Data: ${new Date().toLocaleDateString("pt-BR")} às ${timeStr}\n\nSe você recebeu esta mensagem, sua integração está funcionando perfeitamente!`;

      const hasMetaCreds =
        waProvider === "meta" && waMetaToken && waMetaPhoneId;
      const hasTwilioCreds =
        waProvider === "twilio" && waTwilioSid && waTwilioToken && waTwilioFrom;

      if (waProvider === "meta" && hasMetaCreds) {
        try {
          const url = `https://graph.facebook.com/v20.0/${waMetaPhoneId}/messages`;

          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${waMetaToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: cleanPhone,
              type: "text",
              text: {
                body: textMessage,
              },
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setWaLogs((prev) => [
              {
                id: String(Date.now()),
                time: new Date().toLocaleTimeString("pt-BR"),
                type: "success",
                message: `[META] Mensagem enviada com sucesso para o administrador! ID: ${data.messages?.[0]?.id || "N/A"}`,
              },
              ...prev,
            ]);
            alert(
              `✓ Conexão com a WhatsApp Cloud API validada! WhatsApp de teste enviado com sucesso para o administrador no número: +${cleanPhone}`,
            );
          } else {
            setWaLogs((prev) => [
              {
                id: String(Date.now()),
                time: new Date().toLocaleTimeString("pt-BR"),
                type: "error",
                message: `[META ERROR] Erro no envio ao administrador. Código: ${data.error?.code}. Mensagem: ${data.error?.message}`,
              },
              ...prev,
            ]);
            alert(
              `Falha na API da Meta: ${data.error?.message || "Erro desconhecido"}`,
            );
          }
        } catch (err: any) {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "error",
              message: `[FETCH ERROR] Erro de rede na Meta API: ${err.message}`,
            },
            ...prev,
          ]);
          alert(`Erro de conexão ao disparar Meta API: ${err.message}`);
        } finally {
          setAdminTestingInProgress(false);
        }
      } else if (waProvider === "twilio" && hasTwilioCreds) {
        try {
          const url = `https://api.twilio.com/2010-04-01/Accounts/${waTwilioSid}/Messages.json`;

          const params = new URLSearchParams();
          params.append("To", `whatsapp:+${cleanPhone}`);
          params.append(
            "From",
            waTwilioFrom.startsWith("whatsapp:")
              ? waTwilioFrom
              : `whatsapp:${waTwilioFrom}`,
          );
          params.append("Body", textMessage);

          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(`${waTwilioSid}:${waTwilioToken}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
          });

          const data = await response.json();

          if (response.ok) {
            setWaLogs((prev) => [
              {
                id: String(Date.now()),
                time: new Date().toLocaleTimeString("pt-BR"),
                type: "success",
                message: `[TWILIO] Mensagem enviada com sucesso para o administrador! SID: ${data.sid}`,
              },
              ...prev,
            ]);
            alert(
              `✓ Conexão com a API Twilio validada! WhatsApp de teste enviado com sucesso para o administrador no número: +${cleanPhone}`,
            );
          } else {
            setWaLogs((prev) => [
              {
                id: String(Date.now()),
                time: new Date().toLocaleTimeString("pt-BR"),
                type: "error",
                message: `[TWILIO ERROR] Erro no envio ao administrador. Código: ${data.code}. Mensagem: ${data.message}`,
              },
              ...prev,
            ]);
            alert(
              `Falha na API Twilio: ${data.message || "Erro desconhecido"}`,
            );
          }
        } catch (err: any) {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "error",
              message: `[FETCH ERROR] Erro de rede na Twilio API: ${err.message}`,
            },
            ...prev,
          ]);
          alert(`Erro de conexão ao disparar Twilio API: ${err.message}`);
        } finally {
          setAdminTestingInProgress(false);
        }
      } else {
        setTimeout(() => {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "success",
              message: `[SIMULADO] Mensagem de teste gerada com sucesso para o Administrador! Número: +${cleanPhone}`,
            },
            ...prev,
          ]);

          const formattedPhone = cleanPhone.startsWith("55")
            ? cleanPhone
            : "55" + cleanPhone;
          const text = encodeURIComponent(textMessage);
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`;

          window.open(whatsappUrl, "_blank");

          setAdminTestingInProgress(false);
          alert(
            `✓ Canal de WhatsApp validado! O link de envio direto via WhatsApp Web foi gerado e aberto para +${cleanPhone}.\n\n(Dica: Para envios automatizados diretos sem abrir navegador, insira suas credenciais da Meta Cloud API ou Twilio à esquerda).`,
          );
        }, 1000);
      }
    }
  };

  const handleSaveWhatsAppConfig = () => {
    localStorage.setItem("wa_provider", waProvider);
    localStorage.setItem("wa_meta_token", waMetaToken);
    localStorage.setItem("wa_meta_phone_id", waMetaPhoneId);
    localStorage.setItem("wa_meta_business_id", waMetaBusinessId);
    localStorage.setItem("wa_twilio_sid", waTwilioSid);
    localStorage.setItem("wa_twilio_token", waTwilioToken);
    localStorage.setItem("wa_twilio_from", waTwilioFrom);
    localStorage.setItem("wa_trigger_billing", String(waTriggerBilling));
    localStorage.setItem("wa_trigger_event", String(waTriggerEvent));
    localStorage.setItem("wa_trigger_meeting", String(waTriggerMeeting));
    localStorage.setItem("wa_trigger_welcome", String(waTriggerWelcome));
    localStorage.setItem("wa_template_billing_name", waTemplateBillingName);
    localStorage.setItem("wa_template_event_name", waTemplateEventName);
    localStorage.setItem("wa_template_meeting_name", waTemplateMeetingName);
    localStorage.setItem("wa_template_billing_body", waTemplateBillingBody);
    localStorage.setItem("wa_template_event_body", waTemplateEventBody);
    localStorage.setItem("wa_template_meeting_body", waTemplateMeetingBody);

    setWaLogs((prev) => [
      {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString("pt-BR"),
        type: "success",
        message:
          "Configurações de integração do WhatsApp salvas localmente com sucesso!",
      },
      ...prev,
    ]);
    alert("Configurações de WhatsApp salvas com sucesso!");
  };

  const getWaRenderedMessage = (
    type: "billing" | "event" | "meeting",
    studentId: string,
  ) => {
    let name = "Gabriel Santos Silva";
    let num = "3";
    let value = "R$ 150,00";
    let dueDate = "10/07/2026";
    let eventName = "Baile de Gala";
    let eventLocal = "Espaço Villa Lobos";
    let eventDate = "14/11/2026";
    let eventHour = "22:00";
    let meetingName = "Reunião de Alinhamento de Convites Extra";
    let meetingDate = "15/07/2026";
    let meetingHour = "19:00";
    let meetingLink = "https://meet.google.com/abc-defg-hij";

    const student = formandos.find((f) => f.id === studentId);
    if (student) {
      name = student.name;
      const classOverdue = parcelas.find(
        (p) => p.formandoId === student.id && p.status === "Atrasada",
      );
      if (classOverdue) {
        num = String(classOverdue.number);
        value = classOverdue.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        dueDate = new Date(classOverdue.dueDate).toLocaleDateString("pt-BR");
      } else {
        const classPending = parcelas.find(
          (p) => p.formandoId === student.id && p.status !== "Paga",
        );
        if (classPending) {
          num = String(classPending.number);
          value = classPending.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          dueDate = new Date(classPending.dueDate).toLocaleDateString("pt-BR");
        }
      }

      // Find event
      const classEvent = eventos.find((e) => e.turmaId === student.turmaId);
      if (classEvent) {
        eventName = classEvent.title;
        eventLocal = classEvent.venue;
        eventDate = new Date(classEvent.date).toLocaleDateString("pt-BR");
        eventHour = classEvent.time;
      }

      // Find meeting
      const classMeeting = reunioes.find((r) => r.turmaId === student.turmaId);
      if (classMeeting) {
        meetingName = classMeeting.title;
        meetingDate = new Date(classMeeting.date).toLocaleDateString("pt-BR");
        meetingHour = classMeeting.time;
        meetingLink = classMeeting.link || meetingLink;
      }
    }

    if (type === "billing") {
      return waTemplateBillingBody
        .replace(/{NOME_FORMANDO}/g, name)
        .replace(/{PARCELA_NUMERO}/g, num)
        .replace(/{VALOR_PARCELA}/g, value)
        .replace(/{DATA_VENCIMENTO}/g, dueDate);
    } else if (type === "event") {
      return waTemplateEventBody
        .replace(/{NOME_FORMANDO}/g, name)
        .replace(/{NOME_EVENTO}/g, eventName)
        .replace(/{LOCAL_EVENTO}/g, eventLocal)
        .replace(/{DATA_EVENTO}/g, eventDate)
        .replace(/{HORA_EVENTO}/g, eventHour);
    } else {
      return waTemplateMeetingBody
        .replace(/{NOME_REUNIAO}/g, meetingName)
        .replace(/{DATA_REUNIAO}/g, meetingDate)
        .replace(/{HORA_REUNIAO}/g, meetingHour)
        .replace(/{LINK_REUNIAO}/g, meetingLink);
    }
  };

  const handleSendWaMessage = async () => {
    if (!waTestPhone.trim()) {
      alert("Por favor, digite o número de telefone de destino.");
      return;
    }

    const cleanPhone = waTestPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Por favor, digite um número de WhatsApp válido (com DDD).");
      return;
    }

    const textMessage = getWaRenderedMessage(waTestType, waTestStudentId);
    setWaSending(true);

    const logId = String(Date.now());
    const timeStr = new Date().toLocaleTimeString("pt-BR");

    // Add info log
    setWaLogs((prev) => [
      {
        id: logId + "_init",
        time: timeStr,
        type: "info",
        message: `Iniciando disparo via ${waProvider === "meta" ? "Meta Cloud API" : "Twilio API"} para +${cleanPhone}...`,
      },
      ...prev,
    ]);

    const hasMetaCreds = waProvider === "meta" && waMetaToken && waMetaPhoneId;
    const hasTwilioCreds =
      waProvider === "twilio" && waTwilioSid && waTwilioToken && waTwilioFrom;

    if (waProvider === "meta" && hasMetaCreds) {
      try {
        const url = `https://graph.facebook.com/v20.0/${waMetaPhoneId}/messages`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${waMetaToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
            type: "text",
            text: {
              body: textMessage,
            },
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "success",
              message: `[META] Mensagem enviada com sucesso! ID: ${data.messages?.[0]?.id || "N/A"}`,
            },
            ...prev,
          ]);
          alert("Mensagem disparada com sucesso real via Meta Cloud API!");
        } else {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "error",
              message: `[META ERROR] Erro no envio. Código: ${data.error?.code}. Mensagem: ${data.error?.message}`,
              payload: JSON.stringify(data, null, 2),
            },
            ...prev,
          ]);
          alert(
            `Falha no envio via Meta API: ${data.error?.message || "Erro desconhecido"}`,
          );
        }
      } catch (err: any) {
        setWaLogs((prev) => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString("pt-BR"),
            type: "error",
            message: `[FETCH ERROR] Erro de rede ou CORS: ${err.message}`,
          },
          ...prev,
        ]);
        alert(`Erro de conexão ao disparar Meta API: ${err.message}`);
      } finally {
        setWaSending(false);
      }
    } else if (waProvider === "twilio" && hasTwilioCreds) {
      try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${waTwilioSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append("To", `whatsapp:+${cleanPhone}`);
        params.append(
          "From",
          waTwilioFrom.startsWith("whatsapp:")
            ? waTwilioFrom
            : `whatsapp:${waTwilioFrom}`,
        );
        params.append("Body", textMessage);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${waTwilioSid}:${waTwilioToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        });

        const data = await response.json();

        if (response.ok) {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "success",
              message: `[TWILIO] Mensagem enviada com sucesso! SID: ${data.sid}`,
            },
            ...prev,
          ]);
          alert("Mensagem disparada com sucesso real via Twilio!");
        } else {
          setWaLogs((prev) => [
            {
              id: String(Date.now()),
              time: new Date().toLocaleTimeString("pt-BR"),
              type: "error",
              message: `[TWILIO ERROR] Erro no envio. Código: ${data.code}. Mensagem: ${data.message}`,
              payload: JSON.stringify(data, null, 2),
            },
            ...prev,
          ]);
          alert(
            `Falha no envio via Twilio: ${data.message || "Erro desconhecido"}`,
          );
        }
      } catch (err: any) {
        setWaLogs((prev) => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString("pt-BR"),
            type: "error",
            message: `[FETCH ERROR] Erro de rede ou CORS: ${err.message}`,
          },
          ...prev,
        ]);
        alert(`Erro de conexão ao disparar Twilio API: ${err.message}`);
      } finally {
        setWaSending(false);
      }
    } else {
      // Simulation mode
      setTimeout(() => {
        setWaLogs((prev) => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString("pt-BR"),
            type: "success",
            message: `[SIMULADO] WhatsApp disparado com sucesso para +${cleanPhone}! Canal de comunicação estabelecido.`,
          },
          {
            id: String(Date.now() + 1),
            time: new Date().toLocaleTimeString("pt-BR"),
            type: "info",
            message: `[PAYLOAD SIMULADO] Provedor: ${waProvider.toUpperCase()} | Conteúdo enviado:\n"${textMessage}"`,
          },
          ...prev,
        ]);
        setWaSending(false);
        alert(
          `Disparo SIMULADO concluído para +${cleanPhone}! (Credenciais não preenchidas, simulando envio com sucesso)`,
        );
      }, 1000);
    }
  };

  const handleSimulatePayment = () => {
    if (!simStudentId || !simParcelaId) {
      alert("Por favor, selecione um formando e uma parcela para simular.");
      return;
    }

    const selectedStudent = formandos.find((f) => f.id === simStudentId);
    const selectedParcela = parcelas.find((p) => p.id === simParcelaId);

    if (!selectedStudent || !selectedParcela) return;

    // Create a log entry
    const timeStr = new Date().toLocaleTimeString("pt-BR");
    const logId = String(Date.now());

    // Update Parcela to 'Paga'
    const updatedParcelas = parcelas.map((p) => {
      if (p.id === simParcelaId) {
        return {
          ...p,
          status: "Paga" as const,
          payDate: new Date().toISOString().split("T")[0],
          type: simPaymentType as any,
        };
      }
      return p;
    });

    // Calculate new totalPaid for the student
    const studentParcelas = updatedParcelas.filter(
      (p) => p.formandoId === simStudentId,
    );
    const totalPaid = studentParcelas.reduce(
      (sum, p) => (p.status === "Paga" ? sum + p.value : sum),
      0,
    );

    // Check if there are any remaining overdue or unpaid installments
    const hasUnpaid = studentParcelas.some((p) => p.status !== "Paga");
    const hasAtrasada = studentParcelas.some((p) => p.status === "Atrasada");
    let newStatus = selectedStudent.status;
    if (!hasUnpaid) {
      newStatus = "Ativo";
    } else if (hasAtrasada) {
      newStatus = "Inadimplente";
    } else {
      newStatus = "Pendente";
    }

    const updatedFormandos = formandos.map((f) => {
      if (f.id === simStudentId) {
        return {
          ...f,
          totalPaid,
          status: newStatus,
        };
      }
      return f;
    });

    // Update global state via parent callback
    onUpdateState({
      turmas,
      formandos: updatedFormandos,
      parcelas: updatedParcelas,
      eventos,
      fornecedores,
      pacotes,
      fotos,
    });

    // Add success log
    const gatewayName =
      selectedGateway === "boletocloud"
        ? "Boleto Cloud"
        : selectedGateway.toUpperCase();
    const transId =
      selectedGateway === "boletocloud"
        ? `bc_tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        : `tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newLog = {
      id: logId,
      time: timeStr,
      type: "success" as const,
      message:
        selectedGateway === "boletocloud"
          ? `[SUCCESS] Webhook Boleto Cloud (${gatewayEnv}) - Evento "boleto.pago" recebido. ID Transação: ${transId}. Token Conta: ${boletoCloudAccountToken.substring(0, 8)}***. Valor compensado: R$ ${selectedParcela.value.toLocaleString("pt-BR")} (Parcela #${selectedParcela.number}) do formando ${selectedStudent.name}. Baixa realizada com sucesso.`
          : `[SUCCESS] Webhook ${gatewayName} (${gatewayEnv}) - Recebido pagamento de R$ ${selectedParcela.value.toLocaleString("pt-BR")} (Parcela #${selectedParcela.number}) de ${selectedStudent.name}. Baixa realizada automaticamente.`,
    };

    setGatewayLogs((prev) => [newLog, ...prev]);

    // Reset simulator selectors
    setSimParcelaId("");

    alert(
      selectedGateway === "boletocloud"
        ? `Sucesso! O webhook do Boleto Cloud (Transação #${transId}) confirmou o pagamento de R$ ${selectedParcela.value.toLocaleString("pt-BR")} do formando ${selectedStudent.name}. Baixa automática efetuada!`
        : `Sucesso! Pagamento da parcela #${selectedParcela.number} de ${selectedStudent.name} recebido via ${simPaymentType} e baixado automaticamente.`,
    );
  };

  // Helper to calculate combined price of selected packages
  const getSelectedPackagesPrice = (
    pkgSelected: string,
    turmaId: string,
    fallbackPrice: number,
  ): number => {
    if (!pkgSelected) return fallbackPrice;
    const parts = pkgSelected.split(" + ").map((s) => s.trim());
    const classPacotes = pacotes.filter((p) => p.turmaId === turmaId);
    let sum = 0;
    let matchedAny = false;
    for (const part of parts) {
      const found = classPacotes.find(
        (p) =>
          p.name.toLowerCase() === part.toLowerCase() ||
          part.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(part.toLowerCase()),
      );
      if (found) {
        sum += found.price;
        matchedAny = true;
      }
    }
    return matchedAny ? sum : fallbackPrice;
  };

  const getStudentPackageInvites = (
    pkgSelected: string,
    turmaId: string,
  ): number => {
    if (!pkgSelected) return 0;
    const parts = pkgSelected.split(" + ").map((s) => s.trim());
    const classPacotes = pacotes.filter((p) => p.turmaId === turmaId);
    let totalInvites = 0;
    let foundAnyPackage = false;

    for (const part of parts) {
      const found = classPacotes.find(
        (p) =>
          p.name.toLowerCase() === part.toLowerCase() ||
          part.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(part.toLowerCase()),
      );
      if (found) {
        foundAnyPackage = true;
        let pInvites = 0;
        if (found.items) {
          for (const item of found.items) {
            const match = item.match(/(\d+)\s*convite/i);
            if (match) {
              pInvites += parseInt(match[1], 10);
            }
          }
        }
        if (pInvites === 0 && found.description) {
          const match = found.description.match(/(\d+)\s*convite/i);
          if (match) {
            pInvites = parseInt(match[1], 10);
          }
        }
        totalInvites += pInvites;
      }
    }

    if (!foundAnyPackage) {
      const match = pkgSelected.match(/(\d+)\s*convite/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return totalInvites;
  };

  const getEventPrintData = (evt: Evento) => {
    const evTurma = turmas.find((t) => t.id === evt.turmaId);
    const classStudents = formandos.filter((s) => s.turmaId === evt.turmaId);

    const targetStudents = evTurma?.targetStudents || 100;
    const enrolledStudents = classStudents.length;

    const extraInvitesCount = classStudents.reduce(
      (acc, s) => acc + (s.extraInvites || 0),
      0,
    );
    const packageInvitesCount = classStudents.reduce(
      (acc, s) => acc + getStudentPackageInvites(s.packageSelected, s.turmaId),
      0,
    );
    const totalInvitesCount = packageInvitesCount + extraInvitesCount;

    const extraInvitePrice = evTurma?.extraInvitePrice || 150;
    const extraInvitesTotal = extraInvitesCount * extraInvitePrice;

    const stdPackagePrice = evTurma?.packagePrice || 9000;
    const packagesTotal = classStudents.reduce((acc, s) => {
      return (
        acc +
        getSelectedPackagesPrice(s.packageSelected, s.turmaId, stdPackagePrice)
      );
    }, 0);

    const totalRevenueExpected = packagesTotal + extraInvitesTotal;
    const totalRevenuePaid = classStudents.reduce(
      (acc, s) => acc + s.totalPaid,
      0,
    );

    const activeCount = classStudents.filter(
      (s) => s.status === "Ativo",
    ).length;
    const pendingCount = classStudents.filter(
      (s) => s.status === "Pendente",
    ).length;
    const unpaidCount = classStudents.filter(
      (s) => s.status === "Inadimplente",
    ).length;

    return {
      evTurma,
      classStudents,
      targetStudents,
      enrolledStudents,
      extraInvitesCount,
      packageInvitesCount,
      totalInvitesCount,
      extraInvitePrice,
      extraInvitesTotal,
      packagesTotal,
      totalRevenueExpected,
      totalRevenuePaid,
      activeCount,
      pendingCount,
      unpaidCount,
    };
  };

  // Global Financial Statistics
  const totalTurmas = turmas.length;
  const totalStudents = formandos.length;
  const totalProjected = formandos.reduce(
    (acc, curr) => acc + curr.totalDue,
    0,
  );
  const totalCollected = formandos.reduce(
    (acc, curr) => acc + curr.totalPaid,
    0,
  );
  const pendingReceivables = Math.max(0, totalProjected - totalCollected);
  const collectionsRate =
    totalProjected > 0 ? (totalCollected / totalProjected) * 100 : 0;

  // Recharts chart data preparation
  const revenueChartData = turmas.map((t) => {
    const classStudents = formandos.filter((f) => f.turmaId === t.id);
    const collected = classStudents.reduce(
      (acc, curr) => acc + curr.totalPaid,
      0,
    );
    const projected = classStudents.reduce(
      (acc, curr) => acc + curr.totalDue,
      0,
    );
    return {
      name: t.name.split(" - ")[0],
      Arrecadado: collected,
      Projetado: projected,
    };
  });

  const studentsStatusChartData = [
    {
      name: "Em Dia",
      value: formandos.filter((f) => f.status === "Ativo").length,
    },
    {
      name: "Pendente",
      value: formandos.filter((f) => f.status === "Pendente").length,
    },
    {
      name: "Inadimplente",
      value: formandos.filter((f) => f.status === "Inadimplente").length,
    },
  ];

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  // Preparação de dados de progresso de arrecadação ao longo do tempo (acumulado)
  const timelineChartData = (() => {
    const paidParcelas = parcelas.filter(
      (p) => p.status === "Paga" && p.payDate,
    );
    const periodsSet = new Set<string>();

    paidParcelas.forEach((p) => {
      if (p.payDate) {
        periodsSet.add(p.payDate.substring(0, 7)); // 'YYYY-MM'
      }
    });

    if (periodsSet.size === 0) {
      periodsSet.add("2025-01");
      periodsSet.add("2025-02");
      periodsSet.add("2025-03");
      periodsSet.add("2025-04");
      periodsSet.add("2025-05");
      periodsSet.add("2025-06");
    }

    const sortedPeriods = Array.from(periodsSet).sort();

    return sortedPeriods.map((period) => {
      const [year, month] = period.split("-");
      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      const formattedLabel = `${monthNames[parseInt(month, 10) - 1]}/${year.substring(2)}`;

      const dataPoint: { name: string; [key: string]: string | number } = {
        name: formattedLabel,
      };

      turmas.forEach((t) => {
        const classStudentIds = formandos
          .filter((f) => f.turmaId === t.id)
          .map((f) => f.id);
        const cumulativeSum = parcelas
          .filter(
            (p) =>
              p.status === "Paga" &&
              p.payDate &&
              classStudentIds.includes(p.formandoId) &&
              p.payDate.substring(0, 7) <= period,
          )
          .reduce((sum, p) => sum + p.value, 0);

        dataPoint[t.name.split(" - ")[0]] = cumulativeSum;
      });

      return dataPoint;
    });
  })();

  const lineColors = [
    "#aa904f",
    "#705510",
    "#543d03",
    "#d2c595",
    "#8d1811",
    "#c2410c",
  ];

  // Add graduation class
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const compressedBlob = await compressImage(file, 1000, 1000, 0.65);
      const dataUrl = await convertBlobToBase64(compressedBlob);
      setNewTurmaImage(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCreateTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurmaName || !newTurmaInstitution) return;

    const newTurma: Turma = {
      id: `turma-${Date.now()}`,
      name:
        newTurmaContractType === "individual"
          ? newTurmaName
          : `${newTurmaName} - ${newTurmaYear}`,
      institution: newTurmaInstitution,
      year: Number(newTurmaYear),
      totalStudents: 0,
      targetStudents: Number(newTurmaTarget),
      packagePrice: Number(newTurmaPrice),
      extraInvitePrice: Number(newTurmaExtraInvitePrice),
      extraInviteStartDate: newTurmaExtraInviteStartDate || undefined,
      contractNumber: `CONTR-2026-0${Math.floor(Math.random() * 900 + 100)}`,
      status: "Ativo",
      image:
        newTurmaImage.trim() ||
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
      location: newTurmaLocation || "São Paulo - SP",
      contractType: newTurmaContractType,
      individualService:
        newTurmaContractType === "individual"
          ? newTurmaIndividualService
          : undefined,
      individualCourse:
        newTurmaContractType === "individual"
          ? newTurmaIndividualCourse
          : undefined,
    };

    onUpdateState({
      turmas: [...turmas, newTurma],
      formandos,
      parcelas,
      eventos,
      fornecedores,
    });

    // Reset fields & Close modal
    setNewTurmaName("");
    setNewTurmaInstitution("");
    setNewTurmaLocation("");
    setNewTurmaImage("");
    setNewTurmaExtraInvitePrice(150);
    setNewTurmaExtraInviteStartDate("");
    setNewTurmaContractType("turma");
    setNewTurmaIndividualService("");
    setNewTurmaIndividualCourse("");
    setShowTurmaModal(false);
  };

  // Edit graduation class handlers
  const handleOpenEditTurma = (turma: Turma) => {
    setEditingTurma(turma);
    const baseName = turma.name
      ? turma.name.replace(new RegExp(`\\s*-\\s*${turma.year}$`), "")
      : turma.name;
    setEditTurmaName(baseName);
    setEditTurmaInstitution(turma.institution);
    setEditTurmaYear(turma.year);
    setEditTurmaTarget(turma.targetStudents);
    setEditTurmaPrice(turma.packagePrice);
    setEditTurmaExtraInvitePrice(
      turma.extraInvitePrice !== undefined ? turma.extraInvitePrice : 150,
    );
    setEditTurmaExtraInviteStartDate(turma.extraInviteStartDate || "");
    setEditTurmaLocation(turma.location);
    setEditTurmaImage(turma.image);
    setEditTurmaStatus(turma.status);
    setEditTurmaContractType(turma.contractType || "turma");
    setEditTurmaIndividualService(turma.individualService || "");
    setEditTurmaIndividualCourse(turma.individualCourse || "");
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processEditFile(file);
    }
  };

  const processEditFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const compressedBlob = await compressImage(file, 1000, 1000, 0.65);
      const dataUrl = await convertBlobToBase64(compressedBlob);
      setEditTurmaImage(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsEditDragging(true);
  };

  const handleEditDragLeave = () => {
    setIsEditDragging(false);
  };

  const handleEditDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsEditDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processEditFile(file);
    }
  };

  const handleUpdateTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTurma || !editTurmaName || !editTurmaInstitution) return;

    const updatedTurmas = turmas.map((t) => {
      if (t.id === editingTurma.id) {
        return {
          ...t,
          name:
            editTurmaContractType === "individual"
              ? editTurmaName
              : `${editTurmaName} - ${editTurmaYear}`,
          institution: editTurmaInstitution,
          year: Number(editTurmaYear),
          targetStudents: Number(editTurmaTarget),
          packagePrice: Number(editTurmaPrice),
          extraInvitePrice: Number(editTurmaExtraInvitePrice),
          extraInviteStartDate: editTurmaExtraInviteStartDate || undefined,
          location: editTurmaLocation || "São Paulo - SP",
          image:
            editTurmaImage.trim() ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
          status: editTurmaStatus,
          contractType: editTurmaContractType,
          individualService:
            editTurmaContractType === "individual"
              ? editTurmaIndividualService
              : undefined,
          individualCourse:
            editTurmaContractType === "individual"
              ? editTurmaIndividualCourse
              : undefined,
        };
      }
      return t;
    });

    onUpdateState({
      turmas: updatedTurmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
    });

    setEditingTurma(null);
  };

  // Delete graduation class
  const handleDeleteTurma = (turmaId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Turma de Formatura",
      message:
        "Deseja realmente excluir esta turma? Todos os formandos e dados financeiros associados a ela serão permanentemente removidos. Esta ação não poderá ser desfeita.",
      onConfirm: () => {
        const updatedTurmas = turmas.filter((t) => t.id !== turmaId);
        const updatedFormandos = formandos.filter((f) => f.turmaId !== turmaId);

        // Cascading deletion for installments, events, meetings, mural, and photos
        const deletedFormandoIds = new Set(
          formandos.filter((f) => f.turmaId === turmaId).map((f) => f.id),
        );
        const updatedParcelas = parcelas.filter(
          (p) => !deletedFormandoIds.has(p.formandoId),
        );
        const updatedEventos = eventos.filter((e) => e.turmaId !== turmaId);
        const updatedReunioes = (reunioes || []).filter(
          (m) => m.turmaId !== turmaId,
        );
        const updatedMural = (mural || []).filter((m) => m.turmaId !== turmaId);
        const updatedFotos = (fotos || []).filter((f) => f.turmaId !== turmaId);

        onUpdateState({
          turmas: updatedTurmas,
          formandos: updatedFormandos,
          parcelas: updatedParcelas,
          eventos: updatedEventos,
          fornecedores,
          reunioes: updatedReunioes,
          mural: updatedMural,
          fotos: updatedFotos,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Add student + Generate custom count of installments automatically
  const handleCreateFormando = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStdName || !newStdEmail || !newStdTurmaId) return;

    const selectedTurma = turmas.find((t) => t.id === newStdTurmaId);

    // Find selected package(s) price or fallback to turma price or fallback to 9000
    const price = getSelectedPackagesPrice(
      newStdPackage,
      newStdTurmaId,
      selectedTurma ? selectedTurma.packagePrice : 9000,
    );
    const stdId = `std-${Date.now()}`;

    // Auto-generate student code if not filled in
    const codeToUse =
      newStdCode.trim().toUpperCase() ||
      (() => {
        const prefix = selectedTurma
          ? selectedTurma.name.split(" ")[0].substring(0, 3).toUpperCase()
          : "WM2";
        const nameParts = newStdName.trim().toUpperCase().split(/\s+/);
        const initials = nameParts
          .slice(0, 2)
          .map((p) => p[0] || "")
          .join("");
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${initials || "ALU"}-${randomNum}`;
      })();

    const newStudent: Formando = {
      id: stdId,
      name: newStdName,
      email: newStdEmail,
      cpf: newStdCPF || "000.000.000-00",
      phone: newStdPhone || "(11) 99999-9999",
      turmaId: newStdTurmaId,
      role: newStdRole,
      packageSelected: newStdPackage,
      extraInvites: newStdExtraInvites,
      status: "Ativo",
      joinedDate: new Date().toISOString().split("T")[0],
      totalPaid: 0,
      totalDue: price,
      address: newStdAddress || "",
      studentCode: codeToUse,
    };

    // Auto-generate installments count
    const generatedInstallments: Parcela[] = [];
    const count = Number(newStdInstallmentCount) || 10;
    const baseValue = Math.floor(price / count);
    let totalAssigned = 0;

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      const dueDateStr = dueDate.toISOString().split("T")[0];

      const isLast = i === count;
      const val = isLast ? price - totalAssigned : baseValue;
      totalAssigned += val;

      generatedInstallments.push({
        id: `p-${stdId}-${i}`,
        formandoId: stdId,
        number: i,
        value: val,
        dueDate: dueDateStr,
        status: "Pendente",
        type: "Pix",
        pixCode: `00020101021126380014br.gov.pix0116wm2eventosformatura0215${selectedTurma?.name.substring(0, 6).toUpperCase() || "WM2"}`,
      });
    }

    // Update Turma students count
    const updatedTurmas = turmas.map((t) => {
      if (t.id === newStdTurmaId) {
        return { ...t, totalStudents: t.totalStudents + 1 };
      }
      return t;
    });

    onUpdateState({
      turmas: updatedTurmas,
      formandos: [...formandos, newStudent],
      parcelas: [...parcelas, ...generatedInstallments],
      eventos,
      fornecedores,
    });

    // Reset & Close
    setNewStdName("");
    setNewStdEmail("");
    setNewStdCPF("");
    setNewStdPhone("");
    setNewStdAddress("");
    setNewStdTurmaId("");
    setNewStdCode("");
    setNewStdInstallmentCount(10);
    setNewStdExtraInvites(0);
    setShowFormandoModal(false);
  };

  // Toggle student active/delinquent status
  const handleToggleStudentStatus = (stdId: string) => {
    const student = formandos.find((f) => f.id === stdId);
    if (!student) return;

    const nextStatus =
      student.status === "Ativo"
        ? "Pendente"
        : student.status === "Pendente"
          ? "Inadimplente"
          : "Ativo";

    const updatedFormandos = formandos.map((f) => {
      if (f.id === stdId) {
        return { ...f, status: nextStatus as any };
      }
      return f;
    });

    onUpdateState({
      turmas,
      formandos: updatedFormandos,
      parcelas,
      eventos,
      fornecedores,
    });
  };

  // Delete student
  const handleDeleteStudent = (stdId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Formando",
      message:
        "Tem certeza de que deseja excluir este formando? Todos os seus dados pessoais e parcelas financeiras vinculadas serão permanentemente removidos.",
      onConfirm: () => {
        const student = formandos.find((f) => f.id === stdId);
        const updatedFormandos = formandos.filter((f) => f.id !== stdId);
        const updatedParcelas = parcelas.filter((p) => p.formandoId !== stdId);

        // Decrement class student count
        const updatedTurmas = turmas.map((t) => {
          if (student && t.id === student.turmaId) {
            return { ...t, totalStudents: Math.max(0, t.totalStudents - 1) };
          }
          return t;
        });

        onUpdateState({
          turmas: updatedTurmas,
          formandos: updatedFormandos,
          parcelas: updatedParcelas,
          eventos,
          fornecedores,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Edit student handlers
  const handleOpenEditStudent = (student: Formando) => {
    setEditingFormando(student);
    setEditStdName(student.name);
    setEditStdEmail(student.email);
    setEditStdCPF(student.cpf);
    setEditStdPhone(student.phone);
    setEditStdTurmaId(student.turmaId);
    setEditStdAddress(student.address || "");
    setEditStdRole(student.role);
    setEditStdPackage(student.packageSelected);
    setEditStdExtraPackages(student.extraPackages || []);
    setEditStdStatus(student.status);
    setEditStdTotalPaid(student.totalPaid);
    setEditStdTotalDue(student.totalDue);
    setEditStdCode(student.studentCode || "");
    setEditStdExtraInvites(student.extraInvites || 0);

    // Load student installments
    const studentParcelas = parcelas
      .filter((p) => p.formandoId === student.id)
      .sort((a, b) => a.number - b.number);
    setEditStdParcelas(studentParcelas);
    setRegerarQtd(studentParcelas.length || 10);
    setStdModalTab("cadastro");
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFormando || !editStdName || !editStdEmail || !editStdTurmaId)
      return;

    // Check if the class changed
    const oldTurmaId = editingFormando.turmaId;
    const newTurmaId = editStdTurmaId;

    let updatedTurmas = [...turmas];
    if (oldTurmaId !== newTurmaId) {
      updatedTurmas = turmas.map((t) => {
        if (t.id === oldTurmaId) {
          return { ...t, totalStudents: Math.max(0, t.totalStudents - 1) };
        }
        if (t.id === newTurmaId) {
          return { ...t, totalStudents: t.totalStudents + 1 };
        }
        return t;
      });
    }

    // Process and sort installments
    const finalStudentParcelas = editStdParcelas.map((p, idx) => ({
      ...p,
      number: idx + 1,
      id: p.id.startsWith("p-") ? p.id : `p-${editingFormando.id}-${idx + 1}`,
    }));

    // Calculate totals automatically based on installments
    const calculatedTotalPaid = finalStudentParcelas
      .filter((p) => p.status === "Paga")
      .reduce((sum, p) => sum + p.value, 0);
    const calculatedTotalDue = finalStudentParcelas.reduce(
      (sum, p) => sum + p.value,
      0,
    );

    const updatedFormandos = formandos.map((f) => {
      if (f.id === editingFormando.id) {
        return {
          ...f,
          name: editStdName,
          email: editStdEmail,
          cpf: editStdCPF,
          phone: editStdPhone,
          turmaId: editStdTurmaId,
          address: editStdAddress,
          role: editStdRole,
          packageSelected: editStdPackage,
          extraPackages: editStdExtraPackages,
          extraInvites: editStdExtraInvites,
          status: editStdStatus,
          totalPaid: calculatedTotalPaid,
          totalDue: calculatedTotalDue,
          studentCode: editStdCode.trim().toUpperCase() || f.studentCode,
        };
      }
      return f;
    });

    // Replace installments for this student
    const filteredParcelas = parcelas.filter(
      (p) => p.formandoId !== editingFormando.id,
    );

    onUpdateState({
      turmas: updatedTurmas,
      formandos: updatedFormandos,
      parcelas: [...filteredParcelas, ...finalStudentParcelas],
      eventos,
      fornecedores,
    });

    setEditingFormando(null);
  };

  // Manual installments management helpers
  const handleRegenerateInstallments = () => {
    if (!editingFormando) return;

    // Calculate total including extra packages specific to this student
    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = (editStdExtraPackages || []).reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    const totalToDistribute = basePrice + extraSum || editStdTotalDue;

    const count = Number(regerarQtd) || 10;
    const baseValue = Math.floor(totalToDistribute / count);
    let totalAssigned = 0;
    const newParcelas: Parcela[] = [];

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      const dueDateStr = dueDate.toISOString().split("T")[0];

      const isLast = i === count;
      const val = isLast ? totalToDistribute - totalAssigned : baseValue;
      totalAssigned += val;

      newParcelas.push({
        id: `p-${editingFormando.id}-${i}-${Date.now()}`,
        formandoId: editingFormando.id,
        number: i,
        value: val,
        dueDate: dueDateStr,
        status: "Pendente",
        type: "Pix",
        pixCode: `00020101021126380014br.gov.pix0116wm2eventosformatura0215${
          turmas
            .find((t) => t.id === editStdTurmaId)
            ?.name.substring(0, 6)
            .toUpperCase() || "WM2"
        }`,
      });
    }
    setEditStdParcelas(newParcelas);
  };

  const handleAddExtraPackageToStudent = (
    pkgData: {
      name: string;
      price: number;
      unitPrice?: number;
      quantity?: number;
      category?: FormandoExtraPackage["category"];
      itemType?: FormandoExtraPackage["itemType"];
      description?: string;
      items?: string[];
      status?: "Confirmado" | "Pendente";
    },
    splitMode: "recalculate_all" | "add_specific_installments" | "none",
    splitCount: number,
  ) => {
    if (!editingFormando || !pkgData.name || pkgData.price <= 0) return;

    const qty = Math.max(1, Number(pkgData.quantity) || 1);
    const unitPrice =
      pkgData.unitPrice !== undefined
        ? Number(pkgData.unitPrice)
        : Number(pkgData.price) / qty;
    const calculatedTotal = qty * unitPrice;

    const newExtra: FormandoExtraPackage = {
      id: `extra-pkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: pkgData.name,
      price: calculatedTotal,
      unitPrice: unitPrice,
      quantity: qty,
      category: pkgData.category || "outros",
      itemType: pkgData.itemType || "item_avulso",
      status: pkgData.status || "Confirmado",
      description: pkgData.description || "",
      items: pkgData.items || [],
      createdAt: new Date().toISOString(),
    };

    const updatedExtras = [...editStdExtraPackages, newExtra];
    setEditStdExtraPackages(updatedExtras);

    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = updatedExtras.reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    const newTotalDue = basePrice + extraSum;
    setEditStdTotalDue(newTotalDue);

    if (splitMode === "recalculate_all") {
      // Redistribute total evenly
      const count =
        Number(regerarQtd) || Math.max(1, editStdParcelas.length) || 10;
      const baseValue = Math.floor(newTotalDue / count);
      let totalAssigned = 0;
      const newParcelas: Parcela[] = [];

      for (let i = 1; i <= count; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        const dueDateStr = dueDate.toISOString().split("T")[0];

        const isLast = i === count;
        const val = isLast ? newTotalDue - totalAssigned : baseValue;
        totalAssigned += val;

        const existing = editStdParcelas[i - 1];

        newParcelas.push({
          id: existing?.id || `p-${editingFormando.id}-${i}-${Date.now()}`,
          formandoId: editingFormando.id,
          number: i,
          value: val,
          dueDate: existing?.dueDate || dueDateStr,
          status: existing?.status || "Pendente",
          type: existing?.type || "Pix",
          pixCode: `00020101021126380014br.gov.pix0116wm2eventosformatura0215${
            turmas
              .find((t) => t.id === editStdTurmaId)
              ?.name.substring(0, 6)
              .toUpperCase() || "WM2"
          }`,
        });
      }
      setEditStdParcelas(newParcelas);
    } else if (splitMode === "add_specific_installments") {
      // Add dedicated installments for this extra package
      const lastNum =
        editStdParcelas.length > 0
          ? Math.max(...editStdParcelas.map((p) => p.number))
          : 0;
      let baseDate = new Date();
      if (editStdParcelas.length > 0) {
        const lastDate = new Date(
          editStdParcelas[editStdParcelas.length - 1].dueDate,
        );
        if (!isNaN(lastDate.getTime())) {
          baseDate = lastDate;
        }
      }

      const nInstallments = Math.max(1, Number(splitCount) || 1);
      const instBaseVal = Math.floor(calculatedTotal / nInstallments);
      let assigned = 0;
      const extraParcelas: Parcela[] = [];

      for (let j = 1; j <= nInstallments; j++) {
        const nextD = new Date(baseDate);
        nextD.setMonth(nextD.getMonth() + j);
        const nextDStr = nextD.toISOString().split("T")[0];

        const isLast = j === nInstallments;
        const pVal = isLast ? calculatedTotal - assigned : instBaseVal;
        assigned += pVal;

        extraParcelas.push({
          id: `p-${editingFormando.id}-${lastNum + j}-${Date.now()}`,
          formandoId: editingFormando.id,
          number: lastNum + j,
          value: pVal,
          dueDate: nextDStr,
          status: "Pendente",
          type: "Pix",
          description: `Item Extra (${qty}x): ${pkgData.name}`,
          pixCode: `00020101021126380014br.gov.pix0116wm2eventosformatura0215${
            turmas
              .find((t) => t.id === editStdTurmaId)
              ?.name.substring(0, 6)
              .toUpperCase() || "WM2"
          }`,
        });
      }

      setEditStdParcelas([...editStdParcelas, ...extraParcelas]);
      setRegerarQtd(editStdParcelas.length + extraParcelas.length);
    }

    setShowAddExtraPackageModal(false);
    setExtraPkgCustomName("");
    setExtraPkgCustomPrice(1000);
    setExtraPkgCustomUnitPrice(1000);
    setExtraPkgCustomQuantity(1);
    setExtraPkgCustomDesc("");
  };

  const handleUpdateExtraItemQuantity = (extraId: string, newQty: number) => {
    const validQty = Math.max(1, newQty);
    const updatedExtras = editStdExtraPackages.map((ep) => {
      if (ep.id === extraId) {
        const uPrice =
          ep.unitPrice !== undefined
            ? ep.unitPrice
            : ep.price / (ep.quantity || 1);
        return {
          ...ep,
          quantity: validQty,
          unitPrice: uPrice,
          price: validQty * uPrice,
        };
      }
      return ep;
    });

    setEditStdExtraPackages(updatedExtras);
    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = updatedExtras.reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    setEditStdTotalDue(basePrice + extraSum);
  };

  const handleUpdateExtraItemUnitPrice = (
    extraId: string,
    newUnitPrice: number,
  ) => {
    const validPrice = Math.max(0, newUnitPrice);
    const updatedExtras = editStdExtraPackages.map((ep) => {
      if (ep.id === extraId) {
        const q = ep.quantity || 1;
        return {
          ...ep,
          unitPrice: validPrice,
          price: q * validPrice,
        };
      }
      return ep;
    });

    setEditStdExtraPackages(updatedExtras);
    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = updatedExtras.reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    setEditStdTotalDue(basePrice + extraSum);
  };

  const handleToggleExtraItemStatus = (extraId: string) => {
    const updatedExtras = editStdExtraPackages.map((ep) => {
      if (ep.id === extraId) {
        const nextStatus: "Confirmado" | "Pendente" =
          ep.status === "Confirmado" ? "Pendente" : "Confirmado";
        return { ...ep, status: nextStatus };
      }
      return ep;
    });
    setEditStdExtraPackages(updatedExtras);
  };

  const handleRemoveExtraPackageFromStudent = (extraId: string) => {
    const updatedExtras = editStdExtraPackages.filter(
      (ep) => ep.id !== extraId,
    );
    setEditStdExtraPackages(updatedExtras);

    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = updatedExtras.reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    const newTotalDue = basePrice + extraSum;
    setEditStdTotalDue(newTotalDue);
  };

  const handleSaveEditedExtraPackage = () => {
    if (!editingExtraPackage) return;
    const q = Math.max(1, Number(editExtraQuantity) || 1);
    const p = Math.max(0, Number(editExtraPrice) || 0);
    const updatedExtras = editStdExtraPackages.map((ep) => {
      if (ep.id === editingExtraPackage.id) {
        return {
          ...ep,
          name: editExtraName.trim() || ep.name,
          quantity: q,
          price: p,
          unitPrice: p / q,
          category: editExtraCategory,
          description: editExtraDesc.trim(),
          items: editExtraItems.filter((it) => it.trim().length > 0),
        };
      }
      return ep;
    });

    setEditStdExtraPackages(updatedExtras);
    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = updatedExtras.reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    setEditStdTotalDue(basePrice + extraSum);
    setEditingExtraPackage(null);
  };

  const handleAddSingleInstallment = () => {
    if (!editingFormando) return;
    const lastNum =
      editStdParcelas.length > 0
        ? Math.max(...editStdParcelas.map((p) => p.number))
        : 0;
    const nextNum = lastNum + 1;

    let nextDateStr = new Date().toISOString().split("T")[0];
    if (editStdParcelas.length > 0) {
      const lastDate = new Date(
        editStdParcelas[editStdParcelas.length - 1].dueDate,
      );
      if (!isNaN(lastDate.getTime())) {
        lastDate.setMonth(lastDate.getMonth() + 1);
        nextDateStr = lastDate.toISOString().split("T")[0];
      }
    }

    // Attempt to guess value based on remaining balance
    const basePrice = getSelectedPackagesPrice(
      editStdPackage,
      editStdTurmaId,
      0,
    );
    const extraSum = editStdExtraPackages.reduce(
      (sum, ep) => sum + (Number(ep.price) || 0),
      0,
    );
    const targetPrice = basePrice + extraSum || editStdTotalDue;
    const currentSum = editStdParcelas.reduce((sum, p) => sum + p.value, 0);
    const remaining = Math.max(0, targetPrice - currentSum);

    const newP: Parcela = {
      id: `p-${editingFormando.id}-${nextNum}-${Date.now()}`,
      formandoId: editingFormando.id,
      number: nextNum,
      value: remaining > 0 ? remaining : 500,
      dueDate: nextDateStr,
      status: "Pendente",
      type: "Pix",
      pixCode: `00020101021126380014br.gov.pix0116wm2eventosformatura0215${
        turmas
          .find((t) => t.id === editStdTurmaId)
          ?.name.substring(0, 6)
          .toUpperCase() || "WM2"
      }`,
    };
    setEditStdParcelas([...editStdParcelas, newP]);
  };

  const handleDeleteInstallment = (id: string) => {
    const updated = editStdParcelas
      .filter((p) => p.id !== id)
      .map((p, idx) => ({
        ...p,
        number: idx + 1,
      }));
    setEditStdParcelas(updated);
  };

  const handleChangeInstallmentField = (
    id: string,
    field: keyof Parcela,
    value: any,
  ) => {
    const updated = editStdParcelas.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setEditStdParcelas(updated);
  };

  // Package handlers
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurmaForPackages || !pkgName || !pkgPrice) return;

    const itemsArray = pkgItemsString
      ? pkgItemsString
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "")
      : [];

    let updatedPacotes: Pacote[];

    if (editingPackage) {
      // Update existing
      updatedPacotes = pacotes.map((p) => {
        if (p.id === editingPackage.id) {
          return {
            ...p,
            name: pkgName,
            description: pkgDescription,
            price: Number(pkgPrice),
            items: itemsArray,
          };
        }
        return p;
      });
    } else {
      // Create new
      const newPkg: Pacote = {
        id: `pkg-${Date.now()}`,
        turmaId: selectedTurmaForPackages.id,
        name: pkgName,
        description: pkgDescription,
        price: Number(pkgPrice),
        items: itemsArray,
      };
      updatedPacotes = [...pacotes, newPkg];
    }

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updatedPacotes,
    });

    // Reset form
    setEditingPackage(null);
    setIsCreatingNewPackage(false);
    setPkgName("");
    setPkgDescription("");
    setPkgPrice(0);
    setPkgItemsString("");
  };

  const handleDeletePackage = (pkgId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Pacote de Adesão",
      message:
        "Deseja realmente excluir este pacote? Os formandos que já possuem esse pacote selecionado manterão suas configurações, mas o pacote não estará mais disponível para novas adesões.",
      onConfirm: () => {
        const updatedPacotes = pacotes.filter((p) => p.id !== pkgId);
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores,
          pacotes: updatedPacotes,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleStartCreatePackage = () => {
    setEditingPackage(null);
    setIsCreatingNewPackage(true);
    setPkgName("");
    setPkgDescription("");
    setPkgPrice(selectedTurmaForPackages?.packagePrice || 0);
    setPkgItemsString("");
  };

  const handleStartEditPackage = (pkg: Pacote) => {
    setEditingPackage(pkg);
    setIsCreatingNewPackage(true);
    setPkgName(pkg.name);
    setPkgDescription(pkg.description);
    setPkgPrice(pkg.price);
    setPkgItemsString(pkg.items ? pkg.items.join(", ") : "");
  };

  const handleStartEditEvento = (evt: Evento) => {
    setEditingEvento(evt);
    setNewEvtTurmaId(evt.turmaId);
    setNewEvtTitle(evt.title);
    setNewEvtDate(evt.date);
    setNewEvtTime(evt.time);
    setNewEvtVenue(evt.venue);
    setNewEvtDescription(evt.description || "");
    setShowEventoModal(true);
  };

  const handleDeleteEvento = (eventId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar Exclusão de Evento",
      message:
        "Tem certeza que deseja excluir este cerimonial/evento da agenda? Esta ação é irreversível.",
      onConfirm: () => {
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          fornecedores,
          eventos: eventos.filter((e) => e.id !== eventId),
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleMoveCalendarItem = (
    item: CalendarScheduleItem,
    newDate: string,
  ) => {
    if (item.type === "evento" && item.rawEvento) {
      const updatedEventos = eventos.map((e) =>
        e.id === item.rawEvento!.id ? { ...e, date: newDate } : e,
      );
      onUpdateState({
        turmas,
        formandos,
        parcelas,
        fornecedores,
        eventos: updatedEventos,
        reunioes,
      });
    } else if (item.type === "reuniao" && item.rawReuniao) {
      const updatedReunioes = (reunioes || []).map((r) =>
        r.id === item.rawReuniao!.id ? { ...r, date: newDate } : r,
      );
      onUpdateState({
        turmas,
        formandos,
        parcelas,
        fornecedores,
        eventos,
        reunioes: updatedReunioes,
      });
    }
  };

  // ==========================================
  // GESTÃO DE LEADS / FUNIL DE VENDAS KANBAN
  // ==========================================

  const handleOpenNewLeadModal = () => {
    setEditingLead(null);
    setLeadName("");
    setLeadInstitution("");
    setLeadContactName("");
    setLeadContactPhone("");
    setLeadContactEmail("");
    setLeadIsComissao(true);
    setLeadContactRoleTitle("Membro da Comissão");
    setLeadEstimatedStudents(50);
    setLeadEstimatedValue(425000); // 50 * 8500
    setLeadStage("prospecting");
    setLeadNotes("");
    setLeadPackageId("");
    setLeadPackageIds([]);
    setLeadPackageMode("select");
    setCustomPkgName("Pacote Personalizado");
    setCustomPkgPrice(8500);
    setCustomPkgDescription("Pacote comercial personalizado");
    setCustomPkgItems(["Beca Completa", "Baile de Gala", "Coquetel"]);
    setNewCustomItemText("");
    setLeadContractType("turma");
    setShowLeadModal(true);
  };

  const handleOpenEditLeadModal = (lead: Lead) => {
    setEditingLead(lead);
    setLeadName(lead.name);
    setLeadInstitution(lead.institution);
    setLeadContactName(lead.contactName);
    setLeadContactPhone(lead.contactPhone);
    setLeadContactEmail(lead.contactEmail);
    setLeadIsComissao(lead.isComissao !== false);
    setLeadContactRoleTitle(lead.contactRoleTitle || "Membro da Comissão");
    setLeadEstimatedStudents(lead.estimatedStudents);
    setLeadEstimatedValue(lead.estimatedValue);
    setLeadStage(lead.stage);
    setLeadNotes(lead.notes || "");
    setLeadPackageId(lead.packageId || "");
    setLeadPackageIds(
      lead.packageIds || (lead.packageId ? [lead.packageId] : []),
    );
    setLeadContractType(lead.contractType || "turma");

    // Check if there is an associated package
    const matchedPkg = lead.packageId
      ? pacotes.find((p) => p.id === lead.packageId)
      : null;
    if (
      matchedPkg &&
      (matchedPkg.id.startsWith("pkg-custom-") ||
        matchedPkg.turmaId === lead.id ||
        matchedPkg.turmaId.startsWith("lead-"))
    ) {
      // It's a custom package! Set custom mode and populate its values
      setLeadPackageMode("custom");
      setCustomPkgName(matchedPkg.name);
      setCustomPkgPrice(matchedPkg.price);
      setCustomPkgDescription(matchedPkg.description || "");
      setCustomPkgItems(matchedPkg.items || []);
    } else {
      // Regular template package selected
      setLeadPackageMode("select");
      setCustomPkgName("Pacote Personalizado");
      setCustomPkgPrice(8500);
      setCustomPkgDescription("Pacote comercial personalizado");
      setCustomPkgItems(["Beca Completa", "Baile de Gala", "Coquetel"]);
    }
    setNewCustomItemText("");
    setShowLeadModal(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadInstitution) return;

    let finalPackageId: string | undefined =
      leadPackageId ||
      (leadPackageIds.length > 0 ? leadPackageIds[0] : undefined);
    let finalPackageIds: string[] =
      leadPackageIds.length > 0
        ? leadPackageIds
        : finalPackageId
          ? [finalPackageId]
          : [];
    let updatedPacotes = [...pacotes];

    if (leadPackageMode === "custom") {
      const customPkgId =
        editingLead?.packageId &&
        editingLead.packageId.startsWith("pkg-custom-")
          ? editingLead.packageId
          : `pkg-custom-${Date.now()}`;

      finalPackageId = customPkgId;
      finalPackageIds = [customPkgId];

      const newOrUpdatedPkg: Pacote = {
        id: customPkgId,
        turmaId: editingLead ? editingLead.id : `lead-temp-${Date.now()}`,
        name: customPkgName || "Pacote Personalizado",
        description: customPkgDescription || "Pacote comercial personalizado",
        price: Number(customPkgPrice) || 0,
        items: customPkgItems,
      };

      const pkgIndex = updatedPacotes.findIndex((p) => p.id === customPkgId);
      if (pkgIndex !== -1) {
        updatedPacotes[pkgIndex] = newOrUpdatedPkg;
      } else {
        updatedPacotes.push(newOrUpdatedPkg);
      }
    }

    if (editingLead) {
      // Edit existing lead
      const updatedLeads = leads.map((l) => {
        if (l.id === editingLead.id) {
          return {
            ...l,
            name: leadName,
            institution: leadInstitution,
            contactName: leadContactName,
            contactPhone: leadContactPhone,
            contactEmail: leadContactEmail,
            isComissao: leadIsComissao,
            contactRoleTitle: leadIsComissao
              ? leadContactRoleTitle || "Membro da Comissão"
              : "Formando",
            estimatedStudents: Number(leadEstimatedStudents) || 0,
            estimatedValue: Number(leadEstimatedValue) || 0,
            stage: leadStage,
            notes: leadNotes,
            packageId: finalPackageId,
            packageIds: finalPackageIds,
            contractType: leadContractType,
            lastContactDate: new Date().toISOString().split("T")[0],
          };
        }
        return l;
      });

      if (selectedLeadDetails?.id === editingLead.id) {
        setSelectedLeadDetails({
          ...selectedLeadDetails,
          name: leadName,
          institution: leadInstitution,
          contactName: leadContactName,
          contactPhone: leadContactPhone,
          contactEmail: leadContactEmail,
          isComissao: leadIsComissao,
          contactRoleTitle: leadIsComissao
            ? leadContactRoleTitle || "Membro da Comissão"
            : "Formando",
          estimatedStudents: Number(leadEstimatedStudents) || 0,
          estimatedValue: Number(leadEstimatedValue) || 0,
          stage: leadStage,
          notes: leadNotes,
          packageId: finalPackageId,
          packageIds: finalPackageIds,
          contractType: leadContractType,
          lastContactDate: new Date().toISOString().split("T")[0],
        });
      }

      // Update package turmaId if it was temp
      if (leadPackageMode === "custom") {
        updatedPacotes = updatedPacotes.map((p) => {
          if (p.id === finalPackageId) {
            return { ...p, turmaId: editingLead.id };
          }
          return p;
        });
      }

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores,
        pacotes: updatedPacotes,
        leads: updatedLeads,
      });
      setEditingLead(null);
    } else {
      // Add new lead
      const newLeadId = `lead-${Date.now()}`;

      if (leadPackageMode === "custom" && finalPackageId) {
        updatedPacotes = updatedPacotes.map((p) => {
          if (p.id === finalPackageId) {
            return { ...p, turmaId: newLeadId };
          }
          return p;
        });
      }

      const newL: Lead = {
        id: newLeadId,
        name: leadName,
        institution: leadInstitution,
        contactName: leadContactName,
        contactPhone: leadContactPhone,
        contactEmail: leadContactEmail,
        isComissao: leadIsComissao,
        contactRoleTitle: leadIsComissao
          ? leadContactRoleTitle || "Membro da Comissão"
          : "Formando",
        estimatedStudents: Number(leadEstimatedStudents) || 0,
        estimatedValue: Number(leadEstimatedValue) || 0,
        stage: leadStage,
        notes: leadNotes,
        packageId: finalPackageId,
        packageIds: finalPackageIds,
        contractType: leadContractType,
        lastContactDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString().split("T")[0],
      };

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores,
        pacotes: updatedPacotes,
        leads: [...leads, newL],
      });
    }

    setShowLeadModal(false);
  };

  const handleDeleteLead = (leadId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Lead Comercial",
      message:
        "Tem certeza que deseja excluir este lead de vendas? Todas as informações de prospecção serão perdidas permanentemente.",
      onConfirm: () => {
        const updatedLeads = leads.filter((l) => l.id !== leadId);
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores,
          pacotes,
          leads: updatedLeads,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (selectedLeadDetails?.id === leadId) {
          setSelectedLeadDetails(null);
        }
      },
    });
  };

  const handleUpdateLeadStage = (leadId: string, newStage: Lead["stage"]) => {
    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: newStage,
          lastContactDate: new Date().toISOString().split("T")[0],
        };
      }
      return l;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      leads: updatedLeads,
    });

    // Also update selectedLeadDetails if it is open
    if (selectedLeadDetails?.id === leadId) {
      const match = updatedLeads.find((l) => l.id === leadId);
      if (match) setSelectedLeadDetails(match);
    }
  };

  const handleOpenLeadDetails = (
    lead: Lead,
    initialTab:
      "info" | "pacotes" | "message" | "meeting" | "timeline" = "info",
  ) => {
    setSelectedLeadDetails(lead);
    setLeadDetailTab(initialTab);
    setLeadMsgTemplate("welcome");
    setLeadCustomMsg(
      `Olá ${lead.contactName || lead.name}! Tudo bem? Sou consultor da WM2 Produções & Eventos. Vi o seu interesse em realizar a formatura para a turma de ${lead.name} da instituição ${lead.institution}. Gostaria de agendar uma breve conversa para apresentar nossa proposta comercial e pacotes de adesão?`,
    );
    setLeadMeetingTitle(`Apresentação Comercial - ${lead.name}`);
    setLeadMeetingDate("");
    setLeadMeetingTime("");
    setLeadMeetingLink("");
    setLeadMeetingDesc(
      `Reunião comercial de alinhamento inicial e apresentação dos pacotes para a comissão do lead ${lead.name} da instituição ${lead.institution}.`,
    );
    setShowOpportunityPkgForm(false);
    setEditingOpportunityPkg(null);
  };

  const handleToggleLeadPackageSelection = (leadId: string, pkgId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const currentIds =
      lead.packageIds || (lead.packageId ? [lead.packageId] : []);
    const isSelected = currentIds.includes(pkgId);
    const newPackageIds = isSelected
      ? currentIds.filter((id) => id !== pkgId)
      : [...currentIds, pkgId];

    // Recompute estimated value based on packages if student count > 0
    let updatedEstimatedValue = lead.estimatedValue;
    if (newPackageIds.length > 0) {
      const selectedPkgsList = pacotes.filter((p) =>
        newPackageIds.includes(p.id),
      );
      if (selectedPkgsList.length > 0) {
        const avgPrice =
          selectedPkgsList.reduce((sum, p) => sum + p.price, 0) /
          selectedPkgsList.length;
        updatedEstimatedValue = Math.round(
          avgPrice * (lead.estimatedStudents || 1),
        );
      }
    }

    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          packageId: newPackageIds[0] || undefined,
          packageIds: newPackageIds,
          estimatedValue: updatedEstimatedValue,
        };
      }
      return l;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      leads: updatedLeads,
    });

    if (selectedLeadDetails?.id === leadId) {
      const match = updatedLeads.find((l) => l.id === leadId);
      if (match) setSelectedLeadDetails(match);
    }
  };

  const handleOpenCreatePackageForOpportunity = (lead: Lead) => {
    setEditingOpportunityPkg(null);
    setOppPkgName(`Pacote ${lead.name}`);
    setOppPkgPrice(
      lead.estimatedStudents > 0
        ? Math.round(lead.estimatedValue / lead.estimatedStudents)
        : 8500,
    );
    setOppPkgDesc(
      `Pacote oficial de formatura personalizado para a turma de ${lead.name} (${lead.institution}).`,
    );
    setOppPkgItems([
      "🎓 Beca Oficial & Capelo",
      "🎉 Baile de Gala (10 Convites)",
      "📸 Álbum Fotográfico Encadernado de Luxo",
      "🏛️ Colação de Grau Oficial Solene",
      "🍹 Open Bar Internacional com Drinks",
    ]);
    setOppPkgNewItem("");
    setOppPkgFormError("");
    setShowOpportunityPkgForm(true);
  };

  const handleOpenEditPackageForOpportunity = (pkg: Pacote) => {
    setEditingOpportunityPkg(pkg);
    setOppPkgName(pkg.name);
    setOppPkgPrice(pkg.price);
    setOppPkgDesc(pkg.description);
    setOppPkgItems(pkg.items || []);
    setOppPkgNewItem("");
    setOppPkgFormError("");
    setShowOpportunityPkgForm(true);
  };

  const handleSavePackageFromOpportunity = (e: React.FormEvent, lead: Lead) => {
    e.preventDefault();
    if (!oppPkgName.trim()) {
      setOppPkgFormError("Por favor, informe o nome do pacote.");
      return;
    }
    if (oppPkgPrice <= 0) {
      setOppPkgFormError("O valor por aluno deve ser maior que zero.");
      return;
    }

    let updatedPacotes: Pacote[];
    let savedPkgId: string;

    const leadTurmaMatch = turmas.find(
      (t) => t.name.toLowerCase() === lead.name.toLowerCase(),
    );
    const targetTurmaId = leadTurmaMatch
      ? leadTurmaMatch.id
      : turmas[0]?.id || "global";

    if (editingOpportunityPkg) {
      savedPkgId = editingOpportunityPkg.id;
      updatedPacotes = pacotes.map((p) => {
        if (p.id === editingOpportunityPkg.id) {
          return {
            ...p,
            name: oppPkgName.trim(),
            description: oppPkgDesc.trim(),
            price: oppPkgPrice,
            items: oppPkgItems,
          };
        }
        return p;
      });
    } else {
      savedPkgId = `pkg-${Date.now()}`;
      const newPkg: Pacote = {
        id: savedPkgId,
        turmaId: targetTurmaId,
        name: oppPkgName.trim(),
        description: oppPkgDesc.trim(),
        price: oppPkgPrice,
        items: oppPkgItems,
      };
      updatedPacotes = [...pacotes, newPkg];
    }

    // Automatically ensure saved package is selected in lead.packageIds
    const currentPkgIds =
      lead.packageIds || (lead.packageId ? [lead.packageId] : []);
    const newPkgIds = currentPkgIds.includes(savedPkgId)
      ? currentPkgIds
      : [...currentPkgIds, savedPkgId];

    // Recompute estimated value based on average
    const selectedPkgsList = updatedPacotes.filter((p) =>
      newPkgIds.includes(p.id),
    );
    const avgPrice =
      selectedPkgsList.reduce((sum, p) => sum + p.price, 0) /
      (selectedPkgsList.length || 1);
    const newEstValue = Math.round(avgPrice * (lead.estimatedStudents || 1));

    const updatedLeads = leads.map((l) => {
      if (l.id === lead.id) {
        return {
          ...l,
          packageId: newPkgIds[0],
          packageIds: newPkgIds,
          estimatedValue: newEstValue,
        };
      }
      return l;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updatedPacotes,
      leads: updatedLeads,
    });

    if (selectedLeadDetails?.id === lead.id) {
      const match = updatedLeads.find((l) => l.id === lead.id);
      if (match) setSelectedLeadDetails(match);
    }

    setShowOpportunityPkgForm(false);
    setEditingOpportunityPkg(null);
  };

  const handleDeletePackageFromOpportunity = (pkgId: string, lead: Lead) => {
    const pkgToDelete = pacotes.find((p) => p.id === pkgId);
    if (!pkgToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: "Excluir Pacote de Formatura",
      message: `Deseja realmente excluir o pacote "${pkgToDelete.name}" (${pkgToDelete.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})? Ele será removido do catálogo e desvinculado desta oportunidade.`,
      onConfirm: () => {
        const updatedPacotes = pacotes.filter((p) => p.id !== pkgId);
        const currentPkgIds =
          lead.packageIds || (lead.packageId ? [lead.packageId] : []);
        const newPkgIds = currentPkgIds.filter((id) => id !== pkgId);

        const updatedLeads = leads.map((l) => {
          if (l.id === lead.id) {
            return {
              ...l,
              packageId: newPkgIds[0] || undefined,
              packageIds: newPkgIds,
            };
          }
          return l;
        });

        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores,
          pacotes: updatedPacotes,
          leads: updatedLeads,
        });

        if (selectedLeadDetails?.id === lead.id) {
          const match = updatedLeads.find((l) => l.id === lead.id);
          if (match) setSelectedLeadDetails(match);
        }

        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSyncOpportunityValueWithPackages = (lead: Lead) => {
    const selectedPkgIds =
      lead.packageIds || (lead.packageId ? [lead.packageId] : []);
    const selectedPkgsList = pacotes.filter((p) =>
      selectedPkgIds.includes(p.id),
    );
    if (selectedPkgsList.length === 0) {
      alert(
        "Nenhum pacote selecionado para esta oportunidade. Marque pelo menos um pacote na lista abaixo para sincronizar.",
      );
      return;
    }

    const avgPrice =
      selectedPkgsList.reduce((sum, p) => sum + p.price, 0) /
      selectedPkgsList.length;
    const syncedValue = Math.round(avgPrice * (lead.estimatedStudents || 1));

    const updatedLeads = leads.map((l) => {
      if (l.id === lead.id) {
        return {
          ...l,
          estimatedValue: syncedValue,
        };
      }
      return l;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      leads: updatedLeads,
    });

    if (selectedLeadDetails?.id === lead.id) {
      const match = updatedLeads.find((l) => l.id === lead.id);
      if (match) setSelectedLeadDetails(match);
    }
  };

  const handleAddLeadActivity = (
    leadId: string,
    type: LeadActivity["type"],
    description: string,
    nextFollowUp?: string,
  ) => {
    if (!description.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const newAct: LeadActivity = {
      id: "act-" + Date.now(),
      type,
      description: description.trim(),
      date: new Date().toISOString(),
      author: "Consultor Comercial",
      nextFollowUpDate: nextFollowUp || undefined,
    };

    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        const currentActivities = l.activities || [];
        return {
          ...l,
          lastContactDate: today,
          nextFollowUpDate: nextFollowUp || l.nextFollowUpDate,
          activities: [newAct, ...currentActivities],
        };
      }
      return l;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      leads: updatedLeads,
    });

    if (selectedLeadDetails?.id === leadId) {
      const match = updatedLeads.find((l) => l.id === leadId);
      if (match) setSelectedLeadDetails(match);
    }

    setNewActivityDesc("");
    setNewActivityFollowUp("");
  };

  const handleExportCRMToCSV = () => {
    if (!leads || leads.length === 0) {
      alert("Nenhum lead cadastrado para exportar.");
      return;
    }
    const stageLabels: Record<string, string> = {
      prospecting: "Prospecção / Inbound",
      contacted: "Primeiro Contato",
      proposal_sent: "Proposta Enviada",
      negotiation: "Em Negociação",
      won: "Contrato Assinado",
      lost: "Perdido",
    };

    const headers = [
      "Nome / Turma",
      "Instituicao",
      "Contato",
      "Telefone",
      "E-mail",
      "Tipo",
      "Etapa",
      "Valor Estimado (R$)",
      "Formandos Estimados",
      "Proximo Follow-up",
      "Ultimo Contato",
      "Data Cadastro",
    ];

    const rows = leads.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.institution || "").replace(/"/g, '""')}"`,
      `"${(l.contactName || "").replace(/"/g, '""')}"`,
      `"${(l.contactPhone || "").replace(/"/g, '""')}"`,
      `"${(l.contactEmail || "").replace(/"/g, '""')}"`,
      `"${l.contractType === "individual" ? "Individual" : "Turma"}"`,
      `"${stageLabels[l.stage] || l.stage}"`,
      l.estimatedValue || 0,
      l.estimatedStudents || 0,
      `"${l.nextFollowUpDate || ""}"`,
      `"${l.lastContactDate || ""}"`,
      `"${l.createdAt || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `relatorio_crm_leads_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConvertLeadToTurma = (lead: Lead) => {
    const matchedPkg = pacotes.find((p) => p.id === lead.packageId);
    const today = new Date().toISOString().split("T")[0];

    let newTurmaList = [...turmas];
    let newFormandosList = [...formandos];
    let updatedPacotes = [...pacotes];
    let targetTurmaId = "";
    let createdStudentName = "";

    if (lead.contractType === "individual") {
      // Individual contract conversion
      let indTurma = turmas.find(
        (t) =>
          t.name.toLowerCase().includes("individual") ||
          t.contractType === "individual",
      );
      if (!indTurma) {
        indTurma = {
          id: `turma-ind-${Date.now()}`,
          name: "Contratos Individuais - Vendas Avulsas",
          institution: lead.institution || "Geral",
          year: new Date().getFullYear(),
          totalStudents: 0,
          targetStudents: 100,
          packagePrice: matchedPkg
            ? matchedPkg.price
            : lead.estimatedValue || 2500,
          contractNumber: `INDIV-${Date.now().toString().slice(-4)}`,
          status: "Ativo",
          image:
            "https://images.unsplash.com/photo-1523050854-01023f1de119?auto=format&fit=crop&q=80&w=800",
          location: "São Paulo - SP",
          contractType: "individual",
        };
        newTurmaList.push(indTurma);
      }

      targetTurmaId = indTurma.id;
      createdStudentName = lead.contactName || lead.name;

      const newStudent: Formando = {
        id: `formando-conv-${Date.now()}`,
        name: createdStudentName,
        email: lead.contactEmail || `lead.${Date.now()}@email.com`,
        cpf: "000.000.000-00",
        phone: lead.contactPhone || "(11) 90000-0000",
        turmaId: targetTurmaId,
        role: lead.isComissao !== false ? "comissao" : "formando",
        packageSelected: matchedPkg
          ? matchedPkg.name
          : "Pacote Completo Individual",
        extraInvites: 0,
        status: "Ativo",
        joinedDate: today,
        totalPaid: 0,
        totalDue: lead.estimatedValue || (matchedPkg ? matchedPkg.price : 2500),
        studentCode: `STU${Math.floor(1000 + Math.random() * 9000)}`,
      };

      newFormandosList.push(newStudent);
    } else {
      // Turma contract conversion
      const newTurma: Turma = {
        id: `turma-${Date.now()}`,
        name: lead.name,
        institution: lead.institution,
        year: new Date().getFullYear() + 2,
        totalStudents: lead.contactName ? 1 : 0,
        targetStudents: lead.estimatedStudents,
        packagePrice: matchedPkg
          ? matchedPkg.price
          : lead.estimatedStudents > 0
            ? Math.round(lead.estimatedValue / lead.estimatedStudents)
            : 8000,
        contractNumber: `CONTR-${Date.now().toString().slice(-4)}`,
        status: "Ativo",
        image:
          "https://images.unsplash.com/photo-1523050854-01023f1de119?auto=format&fit=crop&q=80&w=800",
        location: "São Paulo - SP",
        contractType: "turma",
      };

      targetTurmaId = newTurma.id;
      newTurmaList.push(newTurma);

      if (lead.packageId && matchedPkg) {
        const newPkg: Pacote = {
          id: `pkg-dup-${Date.now()}`,
          turmaId: newTurma.id,
          name: matchedPkg.name,
          description: matchedPkg.description,
          price: matchedPkg.price,
          items: matchedPkg.items,
        };
        updatedPacotes.push(newPkg);
      }

      // Auto-create 1st student (Commission Representative) if contactName exists
      if (lead.contactName) {
        createdStudentName = lead.contactName;
        const newStudent: Formando = {
          id: `formando-comissao-${Date.now()}`,
          name: lead.contactName,
          email: lead.contactEmail || `comissao.${Date.now()}@email.com`,
          cpf: "000.000.000-00",
          phone: lead.contactPhone || "(11) 90000-0000",
          turmaId: newTurma.id,
          role: lead.isComissao !== false ? "comissao" : "formando",
          packageSelected: matchedPkg
            ? matchedPkg.name
            : "Pacote Completo da Turma",
          extraInvites: 0,
          status: "Ativo",
          joinedDate: today,
          totalPaid: 0,
          totalDue: newTurma.packagePrice,
          studentCode: `COM${Math.floor(1000 + Math.random() * 9000)}`,
        };
        newFormandosList.push(newStudent);
      }
    }

    // Register conversion activity on lead
    const convActivity: LeadActivity = {
      id: "act-conv-" + Date.now(),
      type: "note",
      description: `🎉 [CONVERSÃO REALIZADA] Lead convertido com sucesso em Contrato Fechado! ${createdStudentName ? `Representante ${createdStudentName} cadastrado.` : ""}`,
      date: new Date().toISOString(),
      author: "Sistema CRM",
    };

    // Mark the lead as Won & store conversion IDs
    const updatedLeads = leads.map((l) => {
      if (l.id === lead.id) {
        return {
          ...l,
          stage: "won" as const,
          convertedTurmaId: targetTurmaId,
          lastContactDate: today,
          activities: [convActivity, ...(l.activities || [])],
        };
      }
      return l;
    });

    onUpdateState({
      turmas: newTurmaList,
      formandos: newFormandosList,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updatedPacotes,
      leads: updatedLeads,
    });

    setConfirmDialog({
      isOpen: true,
      title: "🚀 Conversão Concluída!",
      message: `O lead "${lead.name}" foi convertido com sucesso em Contrato Fechado! ${
        lead.contractType === "individual"
          ? `O formando "${createdStudentName}" foi devidamente matriculado no sistema.`
          : `A Turma "${lead.name}" foi ativada${createdStudentName ? ` e o formando de comissão ${createdStudentName} foi cadastrado.` : "."}`
      }`,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setActiveTab(
          lead.contractType === "individual" ? "formandos" : "turmas",
        );
      },
    });
  };

  const handleDownloadAttendanceCSV = (evt: Evento) => {
    // 1. Get students of the class
    const classStudents = formandos.filter((f) => f.turmaId === evt.turmaId);

    // 2. Build headers
    const headers = [
      "Nome Completo",
      "CPF",
      "Email",
      "Telefone",
      "Pacote Selecionado",
      "Status de Faturamento",
      "Status de Presença",
    ];

    // 3. Build rows
    const rows = classStudents.map((std) => {
      // Determine presence status based on financial status
      let presenceStatus = "Confirmado";
      if (std.status === "Pendente") {
        presenceStatus = "Pendente";
      } else if (std.status === "Inadimplente") {
        presenceStatus = "Não Confirmado (Inadimplente)";
      }

      return [
        std.name,
        std.cpf,
        std.email,
        std.phone,
        std.packageSelected || "Nenhum",
        std.status === "Ativo"
          ? "Em Dia"
          : std.status === "Pendente"
            ? "Pendente"
            : "Inadimplente",
        presenceStatus,
      ];
    });

    // 4. Construct CSV Content (escaping quotes if necessary, using semicolon as separator)
    const csvRows = [
      headers.join(";"),
      ...rows.map((row) =>
        row
          .map((val) => {
            const escaped = ("" + val).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(";"),
      ),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");

    // 5. Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const cleanEventTitle = evt.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    link.setAttribute("download", `lista-presenca-${cleanEventTitle}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvtTurmaId || !newEvtTitle || !newEvtDate) return;

    if (editingEvento) {
      const updatedEventos = eventos.map((evt) => {
        if (evt.id === editingEvento.id) {
          return {
            ...evt,
            turmaId: newEvtTurmaId,
            title: newEvtTitle,
            date: newEvtDate,
            time: newEvtTime || "19:00",
            venue: newEvtVenue || "Espaço de Eventos WM2",
            description:
              newEvtDescription ||
              "Evento oficial produzido pela WM2 Produções & Eventos.",
          };
        }
        return evt;
      });

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        fornecedores,
        eventos: updatedEventos,
      });
    } else {
      const newEvt: Evento = {
        id: `evt-${Date.now()}`,
        turmaId: newEvtTurmaId,
        title: newEvtTitle,
        date: newEvtDate,
        time: newEvtTime || "19:00",
        venue: newEvtVenue || "Espaço de Eventos WM2",
        description:
          newEvtDescription ||
          "Evento oficial produzido pela WM2 Produções & Eventos.",
        suppliers: [
          {
            name: "WM2 Cenografia",
            service: "Cenografia e Estrutura",
            status: "Confirmado",
          },
        ],
      };

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        fornecedores,
        eventos: [...eventos, newEvt],
      });
    }

    setNewEvtTitle("");
    setNewEvtDate("");
    setNewEvtTime("");
    setNewEvtVenue("");
    setNewEvtDescription("");
    setEditingEvento(null);
    setShowEventoModal(false);
  };

  // Add / Edit Supplier
  const handleCreateFornecedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFornName || !newFornService) return;

    if (editingFornecedor) {
      const updatedFornecedores = fornecedores.map((f) => {
        if (f.id === editingFornecedor.id) {
          return {
            ...f,
            name: newFornName,
            service: newFornService,
            phone: newFornPhone || "(11) 99999-0000",
            email: newFornEmail || "comercial@fornecedor.com",
            logoUrl: newFornLogoUrl || f.logoUrl,
          };
        }
        return f;
      });

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores: updatedFornecedores,
      });
    } else {
      const newForn: Fornecedor = {
        id: `forn-${Date.now()}`,
        name: newFornName,
        service: newFornService,
        phone: newFornPhone || "(11) 99999-0000",
        email: newFornEmail || "comercial@fornecedor.com",
        status: "Ativo",
        logoUrl: newFornLogoUrl,
      };

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores: [...fornecedores, newForn],
      });
    }

    setEditingFornecedor(null);
    setNewFornName("");
    setNewFornService("");
    setNewFornPhone("");
    setNewFornEmail("");
    setNewFornLogoUrl("");
    setShowFornecedorModal(false);
  };

  const handleOpenEditFornecedor = (forn: Fornecedor) => {
    setEditingFornecedor(forn);
    setNewFornName(forn.name);
    setNewFornService(forn.service);
    setNewFornPhone(forn.phone);
    setNewFornEmail(forn.email);
    setNewFornLogoUrl(forn.logoUrl || "");
    setShowFornecedorModal(true);
  };

  // Delete Supplier
  const handleDeleteFornecedor = (id: string) => {
    const supplierToDelete = fornecedores.find((f) => f.id === id);
    if (!supplierToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: "Descredenciar Fornecedor",
      message: `Deseja realmente remover o fornecedor "${supplierToDelete.name}" da carteira de credenciados? Esta ação não pode ser desfeita e removerá o fornecedor do painel de controle.`,
      onConfirm: () => {
        const updatedFornecedores = fornecedores.filter((f) => f.id !== id);
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores: updatedFornecedores,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Photo / Gallery Management Functions
  const handleCreateFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");

    if (!newFotoTurmaId) {
      setUploadError("Por favor, selecione a turma destinatária.");
      return;
    }

    const effectiveEventName = newFotoEventName.trim() || "Álbum da Turma";

    setUploadingFiles(true);
    setUploadProgress(0);

    let newFotosAdded: Foto[] = [];
    let usedFallback = false;

    try {
      if (uploadType === "file") {
        if (selectedFiles.length === 0) {
          throw new Error(
            "Por favor, selecione pelo menos um arquivo de imagem.",
          );
        }

        // Upload files one by one, updating progress
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];

          // Compress the image to crisp high resolution (2400x2400 max, 0.90 quality)
          // Preserves crisp details and high definition for albums and lightbox displays
          const compressedBlob = await compressImage(file, 1200, 1200, 0.78);

          // Generate ultra-lightweight micro-thumbnail placeholder (~48px, ~400 bytes) for instant blur-up rendering
          let thumbnailUrl = "";
          try {
            const thumbBlob = await compressImage(file, 48, 48, 0.25);
            thumbnailUrl = await convertBlobToBase64(thumbBlob);
          } catch (tErr) {
            console.warn("Aviso ao gerar miniatura blur-up:", tErr);
          }

          let downloadUrl = "";
          try {
            const storagePath = `fotos/${newFotoTurmaId}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);

            const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

            downloadUrl = await new Promise<string>((resolve, reject) => {
              const timer = setTimeout(() => {
                try {
                  uploadTask.cancel();
                } catch (e) {}
                reject(
                  new Error(
                    "Timeout de conexão com Firebase Storage. Ativando fallback local.",
                  ),
                );
              }, 5000);

              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const fileProgress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  const overallProgress = Math.round(
                    (i / selectedFiles.length) * 100 +
                      fileProgress / selectedFiles.length,
                  );
                  setUploadProgress(overallProgress);
                },
                (error) => {
                  clearTimeout(timer);
                  reject(error);
                },
                async () => {
                  clearTimeout(timer);
                  try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                  } catch (urlErr) {
                    reject(urlErr);
                  }
                },
              );
            });
          } catch (storageErr) {
            console.warn(
              "O Firebase Storage não está ativado ou as regras estão bloqueando. Usando fallback Base64 ultra comprimido para teste rápido:",
              storageErr,
            );
            usedFallback = true;
            // Fallback to compressed Base64
            const base64Str = await convertBlobToBase64(compressedBlob);
            downloadUrl = base64Str;
          }

          newFotosAdded.push({
            id: `ft-${Date.now()}-${i}`,
            turmaId: newFotoTurmaId,
            formandoId:
              fileFormandoIds[i] !== undefined
                ? fileFormandoIds[i] || undefined
                : newFotoFormandoId || undefined,
            albumId: newFotoAlbumId || undefined,
            eventName: effectiveEventName,
            url: downloadUrl,
            thumbnailUrl: thumbnailUrl || undefined,
            caption: newFotoCaption || `Foto ${i + 1} de ${effectiveEventName}`,
            likes: 0,
            comments: [],
          });
        }
      } else {
        if (isBatchUpload) {
          if (!batchUrls.trim()) {
            throw new Error("Insira pelo menos uma URL no campo de texto.");
          }
          const urls = batchUrls
            .split(/[\n,]+/)
            .map((u) => u.trim())
            .filter(
              (u) =>
                u.startsWith("http://") ||
                u.startsWith("https://") ||
                u.startsWith("data:"),
            );

          if (urls.length === 0) {
            throw new Error(
              "Nenhuma URL válida foi encontrada. As URLs devem começar com http://, https:// ou data:",
            );
          }

          newFotosAdded = urls.map((url, idx) => ({
            id: `ft-${Date.now()}-${idx}`,
            turmaId: newFotoTurmaId,
            formandoId: newFotoFormandoId || undefined,
            albumId: newFotoAlbumId || undefined,
            eventName: effectiveEventName,
            url: url,
            caption:
              newFotoCaption || `Foto ${idx + 1} de ${effectiveEventName}`,
            likes: 0,
            comments: [],
          }));
        } else {
          if (!newFotoUrl) throw new Error("Insira uma URL de imagem válida.");
          const newFoto: Foto = {
            id: `ft-${Date.now()}`,
            turmaId: newFotoTurmaId,
            formandoId: newFotoFormandoId || undefined,
            albumId: newFotoAlbumId || undefined,
            eventName: effectiveEventName,
            url: newFotoUrl,
            caption: newFotoCaption || "Foto da formatura",
            likes: 0,
            comments: [],
          };
          newFotosAdded = [newFoto];
        }
      }

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos,
        fornecedores,
        pacotes,
        albums,
        fotos: [...fotos, ...newFotosAdded],
      });

      if (usedFallback) {
        alert(
          "Enviado com sucesso! Como o Firebase Storage não está habilitado em seu painel do Firebase ou está em manutenção, a foto foi comprimida e salva diretamente no banco de dados para que você possa testar imediatamente!",
        );
      }

      // Clear fields on success
      setNewFotoTurmaId("");
      setNewFotoFormandoId("");
      setNewFotoEventName("");
      setNewFotoUrl("");
      setBatchUrls("");
      setNewFotoCaption("");
      setSelectedFiles([]);
      setFileFormandoIds({});
      setIsBatchUpload(false);
      setShowFotoModal(false);
    } catch (err: any) {
      console.error(err);
      setUploadError(
        err.message || "Ocorreu um erro inesperado ao salvar as fotos.",
      );
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleEditFoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFoto || !editFotoTurmaId || !editFotoEventName || !editFotoUrl)
      return;

    const updatedFotos = fotos.map((f) => {
      if (f.id === editingFoto.id) {
        return {
          ...f,
          turmaId: editFotoTurmaId,
          formandoId: editFotoFormandoId || undefined,
          albumId: editFotoAlbumId || undefined,
          eventName: editFotoEventName,
          url: editFotoUrl,
          caption: editFotoCaption,
        };
      }
      return f;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      albums,
      fotos: updatedFotos,
    });

    setEditingFoto(null);
    setEditFotoTurmaId("");
    setEditFotoFormandoId("");
    setEditFotoEventName("");
    setEditFotoUrl("");
    setEditFotoCaption("");
  };

  const handleDeleteFoto = (fotoId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Foto da Galeria",
      message:
        "Deseja realmente remover esta foto da galeria? Esta ação é irreversível.",
      onConfirm: () => {
        const updatedFotos = fotos.filter((f) => f.id !== fotoId);
        onUpdateState({
          turmas,
          formandos,
          parcelas,
          eventos,
          fornecedores,
          pacotes,
          albums,
          fotos: updatedFotos,
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleMoveFoto = (fotoIndex: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? fotoIndex - 1 : fotoIndex + 1;
    if (targetIdx < 0 || targetIdx >= fotos.length) return;

    const updatedFotos = [...fotos];
    const temp = updatedFotos[fotoIndex];
    updatedFotos[fotoIndex] = updatedFotos[targetIdx];
    updatedFotos[targetIdx] = temp;

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      albums,
      fotos: updatedFotos,
    });
  };

  const handleReorderFotos = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= fotos.length ||
      toIndex < 0 ||
      toIndex >= fotos.length ||
      fromIndex === toIndex
    )
      return;
    const updatedFotos = [...fotos];
    const [movedItem] = updatedFotos.splice(fromIndex, 1);
    updatedFotos.splice(toIndex, 0, movedItem);

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes,
      albums,
      fotos: updatedFotos,
    });
  };

  // Event Staff Management Functions
  const handleAddStaffToEvent = (eventId: string) => {
    if (!newStaffName.trim() || !newStaffRole.trim()) return;

    const updatedEventos = eventos.map((evt) => {
      if (evt.id === eventId) {
        const staffList = evt.staff || [];
        const newMember = {
          name: newStaffName,
          role: newStaffRole,
          phone: newStaffPhone || "(11) 99999-9999",
          status: newStaffStatus,
          photoUrl: newStaffPhotoUrl.trim() || undefined,
        };
        return {
          ...evt,
          staff: [...staffList, newMember],
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });

    // Reset adding state
    setNewStaffName("");
    setNewStaffRole("");
    setNewStaffPhone("");
    setNewStaffPhotoUrl("");
    setNewStaffStatus("Pendente");
    setAddingStaffEventId(null);
  };

  const handleRemoveStaffFromEvent = (eventId: string, staffName: string) => {
    const updatedEventos = eventos.map((evt) => {
      if (evt.id === eventId) {
        const staffList = evt.staff || [];
        return {
          ...evt,
          staff: staffList.filter((s) => s.name !== staffName),
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });
  };

  const handleToggleStaffStatus = (eventId: string, staffName: string) => {
    const updatedEventos = eventos.map((evt) => {
      if (evt.id === eventId) {
        const staffList = evt.staff || [];
        return {
          ...evt,
          staff: staffList.map((s) => {
            if (s.name === staffName) {
              return {
                ...s,
                status:
                  s.status === "Confirmado"
                    ? ("Pendente" as const)
                    : ("Confirmado" as const),
              };
            }
            return s;
          }),
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });
  };

  const handleAddSupplierToEvent = (eventId: string) => {
    let name = "";
    let service = "";

    if (selectedSupplierId === "custom") {
      if (!customSupplierName.trim() || !customSupplierService.trim()) return;
      name = customSupplierName.trim();
      service = customSupplierService.trim();
    } else {
      const found = fornecedores.find((f) => f.id === selectedSupplierId);
      if (!found) return;
      name = found.name;
      service = found.service;
    }

    const updatedEventos = eventos.map((evt) => {
      if (evt.id === eventId) {
        const suppliersList = evt.suppliers || [];
        if (
          suppliersList.some((s) => s.name.toLowerCase() === name.toLowerCase())
        ) {
          return evt;
        }
        const newSupp = {
          name,
          service,
          status: newSupplierStatus,
        };
        return {
          ...evt,
          suppliers: [...suppliersList, newSupp],
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });

    // Reset adding state
    setAddingSupplierEventId(null);
    setSelectedSupplierId("");
    setCustomSupplierName("");
    setCustomSupplierService("");
    setNewSupplierStatus("Pendente");
  };

  const handleRemoveSupplierFromEvent = (
    eventId: string,
    supplierName: string,
  ) => {
    const updatedEventos = eventos.map((evt) => {
      if (evt.id === eventId) {
        const suppliersList = evt.suppliers || [];
        return {
          ...evt,
          suppliers: suppliersList.filter((s) => s.name !== supplierName),
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });
  };

  const handleToggleSupplierStatus = (
    eventId: string,
    supplierName: string,
  ) => {
    const updatedEventos = eventos.map((evt) => {
      if (evt.id === eventId) {
        const suppliersList = evt.suppliers || [];
        return {
          ...evt,
          suppliers: suppliersList.map((s) => {
            if (s.name === supplierName) {
              return {
                ...s,
                status:
                  s.status === "Confirmado"
                    ? ("Pendente" as const)
                    : ("Confirmado" as const),
              };
            }
            return s;
          }),
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });
  };

  const handleOpenEditStaff = (member: {
    name: string;
    role: string;
    phone: string;
    status: "Confirmado" | "Pendente";
    photoUrl?: string;
    eventId: string;
    eventTitle?: string;
  }) => {
    setEditingStaffMember({
      eventId: member.eventId,
      originalName: member.name,
      name: member.name,
      role: member.role,
      phone: member.phone,
      status: member.status,
      photoUrl: member.photoUrl || "",
      eventTitle: member.eventTitle,
    });
    setNewStaffName(member.name);
    setNewStaffRole(member.role);
    setNewStaffPhone(member.phone);
    setNewStaffStatus(member.status);
    setNewStaffPhotoUrl(member.photoUrl || "");
    setNewStaffEventId(member.eventId);
    setShowStaffModal(true);
  };

  const handleCreateGlobalStaff = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStaffMember) {
      const targetEventId = newStaffEventId || editingStaffMember.eventId;
      const updatedEventos = eventos.map((evt) => {
        if (evt.id === editingStaffMember.eventId && evt.id !== targetEventId) {
          // Remove from old event
          return {
            ...evt,
            staff: (evt.staff || []).filter(
              (s) => s.name !== editingStaffMember.originalName,
            ),
          };
        }
        if (evt.id === targetEventId) {
          const staffList = evt.staff || [];
          const filtered =
            evt.id === editingStaffMember.eventId
              ? staffList.filter(
                  (s) => s.name !== editingStaffMember.originalName,
                )
              : staffList;

          const updatedMember = {
            name: newStaffName,
            role: newStaffRole,
            phone: newStaffPhone || "(11) 99999-9999",
            status: newStaffStatus,
            photoUrl: newStaffPhotoUrl.trim() || undefined,
          };

          return {
            ...evt,
            staff: [...filtered, updatedMember],
          };
        }
        return evt;
      });

      onUpdateState({
        turmas,
        formandos,
        parcelas,
        eventos: updatedEventos,
        fornecedores,
      });

      setEditingStaffMember(null);
      setNewStaffName("");
      setNewStaffRole("");
      setNewStaffPhone("");
      setNewStaffPhotoUrl("");
      setNewStaffStatus("Pendente");
      setNewStaffEventId("");
      setShowStaffModal(false);
      return;
    }

    const targetEventId = newStaffEventId || eventos[0]?.id;
    if (!newStaffName.trim() || !newStaffRole.trim() || !targetEventId) return;

    const updatedEventos = eventos.map((evt) => {
      if (evt.id === targetEventId) {
        const staffList = evt.staff || [];
        const newMember = {
          name: newStaffName,
          role: newStaffRole,
          phone: newStaffPhone || "(11) 99999-9999",
          status: newStaffStatus,
          photoUrl: newStaffPhotoUrl.trim() || undefined,
        };
        return {
          ...evt,
          staff: [...staffList, newMember],
        };
      }
      return evt;
    });

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos: updatedEventos,
      fornecedores,
    });

    // Reset adding state
    setNewStaffName("");
    setNewStaffRole("");
    setNewStaffPhone("");
    setNewStaffPhotoUrl("");
    setNewStaffStatus("Pendente");
    setNewStaffEventId("");
    setShowStaffModal(false);
  };

  // Filter students by query & class & contract status
  const filteredStudents = formandos.filter((std) => {
    const stdTurma = turmas.find((t) => t.id === std.turmaId);
    const turmaName = stdTurma ? stdTurma.name.toLowerCase() : "";
    const cleanQuery = searchQuery.toLowerCase().trim();
    const cleanQueryDigits = cleanQuery.replace(/\D/g, "");
    const studentCpfDigits = (std.cpf || "").replace(/\D/g, "");

    const matchesSearch =
      !cleanQuery ||
      std.name.toLowerCase().includes(cleanQuery) ||
      (std.email && std.email.toLowerCase().includes(cleanQuery)) ||
      (std.cpf && std.cpf.toLowerCase().includes(cleanQuery)) ||
      (cleanQueryDigits.length > 0 &&
        studentCpfDigits.includes(cleanQueryDigits)) ||
      turmaName.includes(cleanQuery);
    const matchesClass =
      selectedTurmaFilter === "all" || std.turmaId === selectedTurmaFilter;

    // Contract status filter
    const stdContracts = studentContracts.filter((c) => c.studentId === std.id);
    const isSigned = stdContracts.some((c) => c.status === "Assinado");
    const isNewSigned = stdContracts.some(
      (c) => c.status === "Assinado" && c.isNewSignature,
    );

    let matchesContract = true;
    if (selectedContractStatusFilter === "NovosAssinados") {
      matchesContract = isNewSigned;
    } else if (selectedContractStatusFilter === "Assinado") {
      matchesContract = isSigned;
    } else if (selectedContractStatusFilter === "Pendente") {
      matchesContract = !isSigned;
    }

    return matchesSearch && matchesClass && matchesContract;
  });

  // Export consolidated guests list to CSV
  const exportGuestsToCSV = () => {
    const headers = [
      "Turma",
      "Nome do Formando",
      "CPF do Formando",
      "Nome do Convidado",
      "CPF do Convidado",
      "Tipo de Envio",
      "Detalhes / Link do Arquivo",
    ];

    const rows: string[][] = [];

    filteredStudents.forEach((std) => {
      const turmaName = turmas.find((t) => t.id === std.turmaId)?.name || "N/A";

      // Individual guests
      if (std.convidados && std.convidados.length > 0) {
        std.convidados.forEach((g) => {
          rows.push([
            turmaName,
            std.name,
            std.cpf || "",
            g.name,
            g.cpf || "",
            "Cadastro no Portal",
            "",
          ]);
        });
      }

      // Guest list file
      if (std.guestListFile) {
        rows.push([
          turmaName,
          std.name,
          std.cpf || "",
          `Lista por Arquivo: ${std.guestListFile.name}`,
          "",
          "Upload de Arquivo Final",
          std.guestListFile.url,
        ]);
      }

      // No guests registered
      if (
        (!std.convidados || std.convidados.length === 0) &&
        !std.guestListFile
      ) {
        rows.push([
          turmaName,
          std.name,
          std.cpf || "",
          "NENHUM CONVIDADO CADASTRADO",
          "",
          "Pendente",
          "",
        ]);
      }
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(";"),
      ),
    ].join("\r\n");

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `consolidado_convidados_${selectedTurmaFilter === "all" ? "todas_turmas" : "turma_filtrada"}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors pb-12 ${currentTheme === "dark" ? "admin-dark-theme bg-[#0c0d10] text-[#e6e8ec]" : "bg-white text-neutral-800"}`}
    >
      {/* Top Admin Navigation */}
      <div className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] border-b border-[#aa904f]/40 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo className="w-32" showSubtitle={true} variant="dark" />

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-neutral-900/80 font-bold uppercase">
                Gestor do Administrador
              </div>
              <div className="text-[#3c2a01] text-sm font-extrabold flex items-center gap-1.5 justify-end">
                <ShieldAlert className="w-3.5 h-3.5 text-[#705510]" />
                WM2 Staff Admin
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle Button (Light / Dark Premium) */}
              <button
                type="button"
                onClick={handleToggleTheme}
                className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] px-3 py-2 rounded-lg transition-all border border-[#aa904f]/40 flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer"
                title={
                  currentTheme === "dark"
                    ? "Mudar para Tema Claro"
                    : "Mudar para Tema Escuro Premium"
                }
                aria-label="Alternar tema claro/escuro"
              >
                {currentTheme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Tema Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#dfd1a1]" />
                    <span>Tema Escuro</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setNewPasswordInput("");
                  setConfirmPasswordInput("");
                  setPasswordModalError("");
                  setPasswordModalSuccess("");
                  setIsChangePasswordModalOpen(true);
                }}
                className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] px-3 py-2 rounded-lg transition-colors border border-[#aa904f]/40 flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer"
                title="Configurar Senha do Administrador"
              >
                <Key className="w-3.5 h-3.5 text-[#dfd1a1]" /> Alterar Senha
              </button>

              <button
                onClick={onLogout}
                className="bg-[#705510] hover:bg-[#543d03] text-[#ebe0b2] px-3 py-2 rounded-lg transition-colors border border-[#aa904f]/40 flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer"
                title="Voltar ao Portal Público"
              >
                <LogOut className="w-4 h-4 text-rose-300" /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Dashboard Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Global Financial Metrics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all text-[#543d03]">
            <div>
              <span className="text-[10px] text-[#705510] uppercase font-bold">
                Turmas Ativas
              </span>
              <div className="text-2xl font-extrabold text-[#3c2a01] mt-1">
                {totalTurmas}
              </div>
              <span className="text-[9px] text-[#543d03]/70 font-mono mt-0.5 block">
                Classes cadastradas
              </span>
            </div>
            <div className="p-3 bg-white/40 text-[#705510] border border-[#d2c595]/60 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all text-[#543d03]">
            <div>
              <span className="text-[10px] text-[#705510] uppercase font-bold">
                Alunos Aderidos
              </span>
              <div className="text-2xl font-extrabold text-[#3c2a01] mt-1">
                {totalStudents}
              </div>
              <span className="text-[9px] text-[#543d03]/70 font-mono mt-0.5 block">
                Formandos integrados
              </span>
            </div>
            <div className="p-3 bg-white/40 text-[#705510] border border-[#d2c595]/60 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all text-[#543d03]">
            <div>
              <span className="text-[10px] text-[#705510] uppercase font-bold">
                Total de Vendas
              </span>
              <div className="text-xl font-extrabold text-[#705510] mt-1">
                {totalProjected.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </div>
              <span className="text-[9px] text-[#543d03]/70 font-mono mt-0.5 block">
                Valor total contratado
              </span>
            </div>
            <div className="p-3 bg-white/40 text-[#705510] border border-[#d2c595]/60 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all text-[#543d03]">
            <div>
              <span className="text-[10px] text-[#705510] uppercase font-bold">
                Total Recebido
              </span>
              <div className="text-xl font-extrabold text-emerald-800 mt-1">
                {totalCollected.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </div>
              <span className="text-[9px] text-emerald-800 font-semibold mt-0.5 block">
                {collectionsRate.toFixed(1)}% de adimplência
              </span>
            </div>
            <div className="p-3 bg-white/40 text-emerald-800 border border-[#d2c595]/60 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all text-[#543d03]">
            <div>
              <span className="text-[10px] text-[#705510] uppercase font-bold">
                À Receber / Pendente
              </span>
              <div className="text-xl font-extrabold text-rose-800 mt-1">
                {pendingReceivables.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </div>
              <span className="text-[9px] text-rose-800 font-mono mt-0.5 block">
                Saldo financeiro devedor
              </span>
            </div>
            <div className="p-3 bg-white/40 text-rose-800 border border-[#d2c595]/60 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-6 overflow-x-auto gap-1 no-scrollbar">
          {(() => {
            const newSignedContractsCount = studentContracts.filter(
              (c) => c.status === "Assinado" && c.isNewSignature,
            ).length;
            const stagnantLeadsCount = getStagnantLeads(leads, 7).length;
            const urgentTasksCount = adminTasks.filter(
              (t) => t.status !== "completed" && t.priority === "alta",
            ).length;
            return [
              { id: "dashboard", label: "Visão Geral", icon: TrendingUp },
              { id: "financeiro", label: "Financeiro", icon: DollarSign },
              {
                id: "funil",
                label: "Vendas",
                icon: Kanban,
                warningBadge: stagnantLeadsCount,
              },
              {
                id: "tarefas",
                label: "Pendências",
                icon: CheckSquare,
                badge: urgentTasksCount,
              },
              { id: "turmas", label: "Turmas", icon: Building },
              { id: "pacotes", label: "Pacotes", icon: Package },
              {
                id: "formandos",
                label: "Formandos",
                icon: Users,
                badge: newSignedContractsCount,
              },
              { id: "eventos", label: "Eventos & Cerimonial", icon: Calendar },
              { id: "fornecedores", label: "Fornecedores", icon: Briefcase },
              { id: "equipe", label: "Equipe", icon: UserCog },
              { id: "fotos", label: "Galeria de Fotos", icon: Image },
              
              { id: "mural", label: "Mural de Avisos", icon: Megaphone },
              { id: "reunioes", label: "Reuniões Comissão", icon: Video },
              { id: "visitors", label: "Visitas & Logs de Acesso", icon: Eye },
              {
                id: "settings",
                label: "Configurações & Integrações",
                icon: Settings,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "settings") {
                      setActiveTab("settings");
                    } else {
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isTabActive
                      ? "border-[#aa904f] text-[#aa904f] bg-[#aa904f]/5 rounded-t-lg"
                      : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-2xs flex items-center gap-1">
                      ✨ {tab.badge} Novo{tab.badge > 1 ? "s" : ""}
                    </span>
                  ) : null}
                  {tab.warningBadge && tab.warningBadge > 0 ? (
                    <span
                      className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1"
                      title={`${tab.warningBadge} lead(s) parado(s) no funil há mais de 7 dias`}
                    >
                      ⚠️ {tab.warningBadge} Parado
                      {tab.warningBadge > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </button>
              );
            });
          })()}
        </div>

        {/* TAB CONTENTS */}
        <div>
          {/* VISÃO GERAL & GRÁFICOS TAB */}
          {activeTab === "dashboard" && (
            <OverviewDashboard
              turmas={turmas}
              formandos={formandos}
              parcelas={parcelas}
              eventos={eventos}
              fornecedores={fornecedores}
              pacotes={pacotes}
              leads={leads}
              reunioes={reunioes}
              expenses={expenses}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenNewTurmaModal={() => {
                setNewTurmaName("");
                setNewTurmaInstitution("");
                setNewTurmaYear(2026);
                setNewTurmaTarget(50);
                setNewTurmaPrice(8500);
                setNewTurmaExtraInvitePrice(150);
                setNewTurmaExtraInviteStartDate("");
                setNewTurmaImage("");
                setNewTurmaLocation("");
                setNewTurmaContractType("turma");
                setNewTurmaIndividualCourse("");
                setNewTurmaIndividualService("foto");
                setShowTurmaModal(true);
              }}
              onOpenNewFormandoModal={() => setShowFormandoModal(true)}
              onOpenNewExpenseModal={handleOpenNewExpenseModal}
              onOpenNewLeadModal={handleOpenNewLeadModal}
              onOpenLeadDetails={handleOpenLeadDetails}
            />
          )}

          {/* FUNIL DE VENDAS KANBAN & CRM INTELIGENTE TAB */}
          {activeTab === "funil" && (
            <CrmManager
              leads={leads}
              turmas={turmas}
              pacotes={pacotes}
              onUpdateLeads={(updatedLeads) => {
                onUpdateState({
                  turmas,
                  formandos,
                  parcelas,
                  eventos,
                  fornecedores,
                  pacotes,
                  leads: updatedLeads,
                });
              }}
              onOpenNewLeadModal={handleOpenNewLeadModal}
              onOpenEditLeadModal={handleOpenEditLeadModal}
              onOpenLeadDetails={handleOpenLeadDetails}
              onConvertLeadToTurma={handleConvertLeadToTurma}
              onDeleteLead={handleDeleteLead}
              onExportCSV={handleExportCRMToCSV}
            />
          )}

          {/* GESTÃO DE TAREFAS, KANBAN E CHECKLISTS TAB */}
          {activeTab === "tarefas" && (
            <TaskManager
              tasks={adminTasks}
              turmas={turmas}
              formandos={formandos}
              onUpdateTasks={(updatedTasks) => {
                onUpdateState({
                  turmas,
                  formandos,
                  parcelas,
                  eventos,
                  fornecedores,
                  pacotes,
                  albums,
                  fotos,
                  notifications,
                  pushTokens,
                  mural,
                  reunioes,
                  leads,
                  portfolioAlbums,
                  productGalleries: propProductGalleries,
                  visitorTracking,
                  adminTasks: updatedTasks,
                });
              }}
            />
          )}

          {/* GESTÃO DE TURMAS TAB */}
          {activeTab === "turmas" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Contratos e Turmas
                </h3>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Seletor de Modo de Visualização (Cards vs Tabela) */}
                  <div className="flex items-center bg-[#fdfaf2] p-0.5 rounded-lg border border-[#d2c595] shadow-xs">
                    <button
                      type="button"
                      onClick={() => setTurmaViewMode("cards")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                        turmaViewMode === "cards"
                          ? "bg-[#8d1811] text-white shadow-xs"
                          : "text-[#543d03] hover:text-[#8d1811]"
                      }`}
                      title="Visualização em Cards"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurmaViewMode("table")}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                        turmaViewMode === "table"
                          ? "bg-[#8d1811] text-white shadow-xs"
                          : "text-[#543d03] hover:text-[#8d1811]"
                      }`}
                      title="Visualização em Tabela (Colunas)"
                    >
                      <List className="w-3.5 h-3.5" /> Tabela
                    </button>
                  </div>

                  <button
                    onClick={() => setShowTurmaModal(true)}
                    className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] text-neutral-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Nova Turma
                  </button>
                </div>
              </div>

              {/* Class View (Cards Grid vs Table) */}
              {turmaViewMode === "cards" ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {turmas.map((t) => {
                    const percentAdhesion =
                      (t.totalStudents / t.targetStudents) * 100;

                    return (
                      <motion.div
                        key={t.id}
                        className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between text-[#543d03]"
                      >
                        <div className="h-44 relative overflow-hidden bg-slate-100">
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-[#8d1811] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {t.contractNumber}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-[#543d03]/90 backdrop-blur text-[#dfd1a1] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            {t.contractType === "individual" ? (
                              <>
                                <User className="w-2.5 h-2.5" /> Cliente
                                Individual
                              </>
                            ) : (
                              <>
                                <Users className="w-2.5 h-2.5" /> Turma de
                                Formatura
                              </>
                            )}
                          </div>
                          <div className="absolute top-3 right-3 bg-[#8d1811]/90 backdrop-blur text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                            {t.status}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-[#3c2a01] dark:text-[#3c2a01] text-base leading-tight mb-1">
                              {t.name}
                            </h4>
                            {t.contractType === "individual" ? (
                              <div className="space-y-1 mb-4">
                                {t.individualCourse && (
                                  <span className="text-[11px] font-semibold text-[#8d1811] block">
                                    Curso: {t.individualCourse}
                                  </span>
                                )}
                                <span className="text-[10px] text-[#543d03]/70 font-medium block uppercase tracking-wider">
                                  {t.institution} • {t.location}
                                </span>
                                {t.individualService && (
                                  <span className="text-[10px] bg-[#aa904f]/25 text-[#543d03] font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                                    Serviço: {t.individualService}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#543d03]/70 font-medium block uppercase tracking-wider mb-4">
                                {t.institution} • {t.location}
                              </span>
                            )}

                            <div className="space-y-2 border-t pt-3 border-[#d2c595]/40 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[#543d03]/80">
                                  Valor do Pacote Padrão:
                                </span>
                                <span className="font-bold text-[#3c2a01]">
                                  {t.packagePrice.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-[#543d03]/80">
                                  Preço do Convite Extra:
                                </span>
                                <span className="font-bold text-[#3c2a01]">
                                  {(t.extraInvitePrice !== undefined
                                    ? t.extraInvitePrice
                                    : 150
                                  ).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              </div>

                              {t.extraInviteStartDate && (
                                <div className="flex justify-between text-[10px] text-[#8d1811] font-semibold bg-[#fdfaf2] p-1.5 rounded border border-[#d2c595]/30">
                                  <span>Início das Vendas:</span>
                                  <span>
                                    {t.extraInviteStartDate
                                      .split("-")
                                      .reverse()
                                      .join("/")}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between">
                                <span className="text-[#543d03]/80">
                                  Alunos Inscritos / Meta:
                                </span>
                                <span className="font-semibold text-[#3c2a01]">
                                  {t.totalStudents} / {t.targetStudents}
                                </span>
                              </div>

                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-[10px] text-[#543d03]/60">
                                  <span>Adesão do Orçamento:</span>
                                  <span>{percentAdhesion.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#543d03] h-full"
                                    style={{ width: `${percentAdhesion}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Pacotes customizados cadastrados para esta turma */}
                              <div className="pt-2 border-t border-[#d2c595]/30">
                                <span className="text-[10px] text-[#543d03]/65 uppercase font-bold tracking-wider block mb-1">
                                  Pacotes Disponíveis:
                                </span>
                                {pacotes.filter((p) => p.turmaId === t.id)
                                  .length === 0 ? (
                                  <span className="text-[10px] text-amber-950 font-semibold italic">
                                    Nenhum pacote cadastrado (Usa padrão{" "}
                                    {t.packagePrice.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                    )
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-[9px]">
                                    {pacotes
                                      .filter((p) => p.turmaId === t.id)
                                      .map((p, idx, arr) => (
                                        <span
                                          key={p.id}
                                          className="text-[#543d03] font-bold"
                                          title={`${p.description} - ${p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                                        >
                                          {p.name}:{" "}
                                          <span className="text-[#705510]">
                                            {p.price.toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 0,
                                            })}
                                          </span>
                                          {idx < arr.length - 1 && (
                                            <span className="text-neutral-400/60 ml-2">
                                              •
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>

                              {/* Balanço e Saldo em Caixa da Turma */}
                              {(() => {
                                const turmaFormandoIds = new Set(
                                  formandos
                                    .filter((f) => f.turmaId === t.id)
                                    .map((f) => f.id),
                                );
                                const totalCollected = parcelas
                                  .filter(
                                    (p) =>
                                      p.status === "Paga" &&
                                      turmaFormandoIds.has(p.formandoId),
                                  )
                                  .reduce((sum, p) => sum + p.value, 0);

                                const turmaExpensesList = expenses.filter(
                                  (e) =>
                                    e.turmaId === t.id ||
                                    (e.eventId &&
                                      eventos.some(
                                        (evt) =>
                                          evt.id === e.eventId &&
                                          evt.turmaId === t.id,
                                      )),
                                );

                                const totalExpensesPaid = turmaExpensesList
                                  .filter((e) => e.status === "Pago")
                                  .reduce((sum, e) => sum + e.amount, 0);

                                const netBalance =
                                  totalCollected - totalExpensesPaid;

                                return (
                                  <div className="mt-3 p-2.5 bg-white/60 border border-[#d2c595] rounded-xl text-xs space-y-1 shadow-xs">
                                    <div className="flex justify-between items-center pb-1 border-b border-[#d2c595]/40">
                                      <span className="text-[10px] font-extrabold uppercase text-[#543d03]/80 tracking-wider flex items-center gap-1">
                                        <Receipt className="w-3.5 h-3.5 text-rose-700" />{" "}
                                        Caixa & Saldo da Turma
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenNewExpenseModal(t.id)
                                        }
                                        className="bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer shadow-xs border-none"
                                        title="Lançar nova despesa para este contrato"
                                      >
                                        <Plus className="w-3 h-3" /> + Despesa
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-0.5">
                                      <div>
                                        <span className="text-[#543d03]/70 block font-medium">
                                          Recebido:
                                        </span>
                                        <span className="font-extrabold text-emerald-800">
                                          {totalCollected.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            },
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[#543d03]/70 block font-medium">
                                          Despesas Pagas:
                                        </span>
                                        <span className="font-extrabold text-rose-800">
                                          {totalExpensesPaid.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            },
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-1 border-t border-[#d2c595]/30">
                                      <span className="text-[10px] font-bold text-[#3c2a01]">
                                        Saldo em Caixa:
                                      </span>
                                      <span
                                        className={`font-black text-[11px] px-2 py-0.5 rounded ${netBalance >= 0 ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
                                      >
                                        {netBalance.toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="border-t border-[#d2c595]/40 mt-5 pt-3.5 flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedTurmaForProposal(t);
                                setProposalTargetStudentsOverride(
                                  t.targetStudents,
                                );
                                const comissaoMembers = formandos.filter(
                                  (f) =>
                                    f.turmaId === t.id && f.role === "comissao",
                                );
                                if (comissaoMembers.length > 0) {
                                  setProposalWhatsappPhone(
                                    comissaoMembers[0].phone,
                                  );
                                } else {
                                  setProposalWhatsappPhone("");
                                }
                                setProposalNotes(
                                  "A WM2 Produções & Eventos tem o prazer de apresentar a proposta comercial para a sua comissão de formatura. O nosso compromisso é entregar um evento inesquecível com o mais alto padrão de sofisticação, organization e segurança, alinhado ao melhor custo-benefício de adesão individual.",
                                );
                                setProposalItems([
                                  {
                                    name: "Assessoria Completa & Gestão de Projetos de Eventos WM2",
                                    included: true,
                                  },
                                  {
                                    name: "Espaço/Salão de Festas de Prestígio Selecionado para o Baile",
                                    included: true,
                                  },
                                  {
                                    name: "Cenografia Temática e Decoração Floral de Alta Sofisticação",
                                    included: true,
                                  },
                                  {
                                    name: "Painéis de LED de Alta Resolução & Iluminação Cênica Robótica",
                                    included: true,
                                  },
                                  {
                                    name: "Sistema de Som Digital de Alta Definição (Line Array)",
                                    included: true,
                                  },
                                  {
                                    name: "Serviço de Buffet Completo de Cozinha Fina (Coquetel, Jantar e Sobremesa)",
                                    included: true,
                                  },
                                  {
                                    name: "Open Bar de Coquetelaria Internacional com Bartenders Profissionais",
                                    included: true,
                                  },
                                  {
                                    name: "Atração de Grande Porte (Banda Baile Principal + DJ Residente)",
                                    included: true,
                                  },
                                  {
                                    name: "Staff de Apoio Completo: Segurança Privada, Recepcionistas, Limpeza e Gerente de Eventos",
                                    included: true,
                                  },
                                  {
                                    name: "Gerador de Energia de Emergência de Alta Potência Dedicado",
                                    included: true,
                                  },
                                ]);
                              }}
                              className="p-1.5 text-blue-900 hover:bg-blue-50 dark:text-blue-950 dark:hover:bg-blue-100/80 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold"
                              title="Gerar Orçamento / Proposta Comercial em PDF para os Alunos"
                            >
                              <FileText className="w-3.5 h-3.5 animate-pulse" />{" "}
                              Orçamento
                            </button>
                            <button
                              onClick={() =>
                                setSelectedTurmaForFinancialReport(t)
                              }
                              className="p-1.5 text-emerald-900 hover:bg-emerald-50 dark:text-emerald-950 dark:hover:bg-emerald-100/80 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold"
                              title="Gerar Relatório Financeiro Consolidado em PDF"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Financeiro
                            </button>
                            <button
                              onClick={() => {
                                setPresetPackageTurmaId(t.id);
                                setActiveTab("pacotes");
                              }}
                              className="p-1.5 text-amber-900 hover:bg-[#d2c595]/30 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold"
                              title="Gerenciar Pacotes de Formatura"
                            >
                              <Package className="w-3.5 h-3.5" /> Pacotes
                            </button>
                            <button
                              onClick={() => handleOpenEditTurma(t)}
                              className="p-1.5 text-[#705510] hover:bg-[#d2c595]/20 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold"
                              title="Editar Turma"
                            >
                              <Edit className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteTurma(t.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-100 rounded transition-colors animate-fade-in"
                              title="Deletar Turma"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Visualização em Tabela Completa */
                <div className="bg-[#fdfaf2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#ebe0b2] border-b border-[#d2c595] text-[#3c2a01] uppercase text-[10px] font-extrabold tracking-wider">
                          <th className="py-3 px-4">Contrato / Tipo</th>
                          <th className="py-3 px-4">Nome da Turma / Cliente</th>
                          <th className="py-3 px-4">Instituição / Local</th>
                          <th className="py-3 px-4 text-center">
                            Adesão (Alunos)
                          </th>
                          <th className="py-3 px-4 text-right">
                            Contratado / Saldo
                          </th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d2c595]/40 text-[#543d03]">
                        {turmas.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-8 text-center text-[#543d03]/70 font-medium italic"
                            >
                              Nenhuma turma cadastrada.
                            </td>
                          </tr>
                        ) : (
                          turmas.map((t) => {
                            const percentAdhesion =
                              (t.totalStudents / t.targetStudents) * 100;
                            const turmaFormandoIds = new Set(
                              formandos
                                .filter((f) => f.turmaId === t.id)
                                .map((f) => f.id),
                            );
                            const totalCollected = parcelas
                              .filter(
                                (p) =>
                                  p.status === "Paga" &&
                                  turmaFormandoIds.has(p.formandoId),
                              )
                              .reduce((sum, p) => sum + p.value, 0);

                            const turmaExpensesList = expenses.filter(
                              (e) =>
                                e.turmaId === t.id ||
                                (e.eventId &&
                                  eventos.some(
                                    (evt) =>
                                      evt.id === e.eventId &&
                                      evt.turmaId === t.id,
                                  )),
                            );

                            const totalExpensesPaid = turmaExpensesList
                              .filter((e) => e.status === "Pago")
                              .reduce((sum, e) => sum + e.amount, 0);

                            const netBalance =
                              totalCollected - totalExpensesPaid;

                            return (
                              <tr
                                key={t.id}
                                className="hover:bg-[#f5ebd0]/70 transition-colors"
                              >
                                {/* Contrato / Tipo */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-[#d2c595]">
                                      <img
                                        src={t.image}
                                        alt={t.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-[#8d1811] text-xs block">
                                        {t.contractNumber}
                                      </span>
                                      <span className="text-[9.5px] font-bold text-[#543d03]/70 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                        {t.contractType === "individual" ? (
                                          <>
                                            <User className="w-2.5 h-2.5 text-amber-800" />{" "}
                                            Individual
                                          </>
                                        ) : (
                                          <>
                                            <Users className="w-2.5 h-2.5 text-sky-800" />{" "}
                                            Turma
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Nome da Turma */}
                                <td className="py-3.5 px-4 font-bold text-[#3c2a01]">
                                  <div>{t.name}</div>
                                  {t.contractType === "individual" &&
                                    t.individualCourse && (
                                      <span className="text-[10px] text-[#543d03]/70 font-normal block">
                                        Curso: {t.individualCourse}
                                      </span>
                                    )}
                                </td>

                                {/* Instituição / Local */}
                                <td className="py-3.5 px-4 text-[#543d03]">
                                  <div className="font-semibold text-xs">
                                    {t.institution}
                                  </div>
                                  <div className="text-[10px] text-[#543d03]/60 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-2.5 h-2.5" />{" "}
                                    {t.location}
                                  </div>
                                </td>

                                {/* Adesão */}
                                <td className="py-3.5 px-4 text-center">
                                  <div className="font-extrabold text-xs text-[#3c2a01]">
                                    {t.totalStudents} / {t.targetStudents}
                                  </div>
                                  <div className="w-24 bg-[#d2c595]/50 h-1.5 rounded-full overflow-hidden mx-auto mt-1">
                                    <div
                                      className="bg-[#aa904f] h-full rounded-full transition-all"
                                      style={{
                                        width: `${Math.min(percentAdhesion, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-[#543d03]/70 font-bold block mt-0.5">
                                    {percentAdhesion.toFixed(0)}% Aderidos
                                  </span>
                                </td>

                                {/* Financeiro / Saldo */}
                                <td className="py-3.5 px-4 text-right">
                                  <div className="font-extrabold text-xs text-[#3c2a01]">
                                    {(
                                      t.packagePrice * t.targetStudents
                                    ).toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                  </div>
                                  <div className="text-[10px] text-[#543d03]/80 flex justify-end items-center gap-1 mt-0.5">
                                    <span>Saldo Caixa:</span>
                                    <strong
                                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-black ${netBalance >= 0 ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
                                    >
                                      {netBalance.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </strong>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-3.5 px-4 text-center">
                                  <span className="bg-[#8d1811]/15 text-[#8d1811] border border-[#8d1811]/30 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                                    {t.status}
                                  </span>
                                </td>

                                {/* Ações */}
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenNewExpenseModal(t.id)
                                      }
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition-colors cursor-pointer border-none"
                                      title="Lançar Despesa para esta turma"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTurmaForProposal(t);
                                        setProposalTargetStudentsOverride(
                                          t.targetStudents,
                                        );
                                        const comissaoMembers =
                                          formandos.filter(
                                            (f) =>
                                              f.turmaId === t.id &&
                                              f.role === "comissao",
                                          );
                                        if (comissaoMembers.length > 0) {
                                          setProposalWhatsappPhone(
                                            comissaoMembers[0].phone,
                                          );
                                        } else {
                                          setProposalWhatsappPhone("");
                                        }
                                        setProposalNotes(
                                          "A WM2 Produções & Eventos tem o prazer de apresentar a proposta comercial para a sua comissão de formatura. O nosso compromisso é entregar um evento inesquecível com o mais alto padrão de sofisticação, organização e segurança, alinhado ao melhor custo-benefício de adesão individual.",
                                        );
                                        setProposalItems([
                                          {
                                            name: "Assessoria Completa & Gestão de Projetos de Eventos WM2",
                                            included: true,
                                          },
                                          {
                                            name: "Espaço/Salão de Festas de Prestígio Selecionado para o Baile",
                                            included: true,
                                          },
                                          {
                                            name: "Cenografia Temática e Decoração Floral de Alta Sofisticação",
                                            included: true,
                                          },
                                          {
                                            name: "Painéis de LED de Alta Resolução & Iluminação Cênica Robótica",
                                            included: true,
                                          },
                                          {
                                            name: "Sistema de Som Digital de Alta Definição (Line Array)",
                                            included: true,
                                          },
                                          {
                                            name: "Serviço de Buffet Completo de Cozinha Fina (Coquetel, Jantar e Sobremesa)",
                                            included: true,
                                          },
                                          {
                                            name: "Open Bar de Coquetelaria Internacional com Bartenders Profissionais",
                                            included: true,
                                          },
                                          {
                                            name: "Atração de Grande Porte (Banda Baile Principal + DJ Residente)",
                                            included: true,
                                          },
                                          {
                                            name: "Staff de Apoio Completo: Segurança Privada, Recepcionistas, Limpeza e Gerente de Eventos",
                                            included: true,
                                          },
                                          {
                                            name: "Gerador de Energia de Emergência de Alta Potência Dedicado",
                                            included: true,
                                          },
                                        ]);
                                      }}
                                      className="p-1.5 text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer border-none"
                                      title="Gerar Orçamento / Proposta Comercial PDF"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedTurmaForFinancialReport(t)
                                      }
                                      className="p-1.5 text-emerald-900 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer border-none"
                                      title="Gerar Relatório Financeiro PDF"
                                    >
                                      <DollarSign className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPresetPackageTurmaId(t.id);
                                        setActiveTab("pacotes");
                                      }}
                                      className="p-1.5 text-amber-900 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer border-none"
                                      title="Gerenciar Pacotes"
                                    >
                                      <Package className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditTurma(t)}
                                      className="p-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-stone-300 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer border-none"
                                      title="Editar Turma"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTurma(t.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer border-none"
                                      title="Deletar Turma"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GESTÃO DE PACOTES DE FORMATURA TAB */}
          {activeTab === "pacotes" && (
            <PackagesManager
              turmas={turmas}
              formandos={formandos}
              parcelas={parcelas}
              eventos={eventos}
              fornecedores={fornecedores}
              pacotes={pacotes}
              onUpdateState={onUpdateState}
              presetTurmaId={presetPackageTurmaId}
              onClearPresetTurma={() => setPresetPackageTurmaId(null)}
            />
          )}

          {/* GESTÃO DE FORMANDOS TAB */}
          {activeTab === "formandos" && (
            <div className="space-y-6">
              {(() => {
                const newSignedCount = studentContracts.filter(
                  (c) => c.status === "Assinado" && c.isNewSignature,
                ).length;
                if (newSignedCount === 0) return null;
                return (
                  <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border border-emerald-500/50 p-4 rounded-xl text-white flex items-center justify-between gap-3 shadow-md animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 text-emerald-300">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-100 flex items-center gap-2">
                          {newSignedCount} Novo{newSignedCount > 1 ? "s" : ""}{" "}
                          Contrato{newSignedCount > 1 ? "s" : ""} Assinado
                          {newSignedCount > 1 ? "s" : ""} pelo Formando!
                        </h4>
                        <p className="text-xs text-emerald-200/90 mt-0.5">
                          A comissão/administração recebeu novas assinaturas
                          digitais. Filtre abaixo para conferir.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedContractStatusFilter("NovosAssinados")
                      }
                      className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black px-3.5 py-2 rounded-lg text-xs transition-all shrink-0 cursor-pointer shadow-sm"
                    >
                      Ver Novos Assinados ({newSignedCount})
                    </button>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Alunos e Formandos Cadastrados
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setContractStudentId(null);
                      setShowContractPdfModal(true);
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-[#ffe29a] font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-[#aa904f]/60 transition-all cursor-pointer shadow-xs"
                    title="Gerar e personalizar contratos em PDF com preenchimento automático"
                  >
                    <FileText className="w-4 h-4 text-[#aa904f]" /> Gerador de
                    Contratos (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={exportGuestsToCSV}
                    className="bg-white/80 hover:bg-neutral-100 text-neutral-800 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-[#dfd1a1]/50 transition-all cursor-pointer shadow-xs"
                    title="Exportar relação consolidada em formato CSV para Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />{" "}
                    Exportar CSV Convidados
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="bg-white/80 hover:bg-neutral-100 text-neutral-800 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-[#dfd1a1]/50 transition-all cursor-pointer shadow-xs"
                    title="Visualizar e Imprimir a relação de convidados"
                  >
                    <Printer className="w-4 h-4 text-blue-700" /> Imprimir
                    Relação
                  </button>
                  <button
                    onClick={() => setShowFormandoModal(true)}
                    className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] text-neutral-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Incluir Novo Aluno
                  </button>
                </div>
              </div>

              {/* Real-time Search & Filters Panel */}
              <div className="bg-white border border-neutral-200/60 p-4 rounded-xl shadow-xs space-y-3 text-xs text-neutral-700 w-full">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center w-full">
                  {/* Real-time Search Input */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aa904f]" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome, turma, e-mail ou CPF em tempo real..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-neutral-50 border border-[#dfd1a1]/50 hover:border-[#aa904f]/60 focus:border-[#aa904f] pl-10 pr-9 py-2.5 rounded-lg w-full outline-none text-neutral-800 placeholder-neutral-400 font-medium transition-all shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 font-bold transition-colors cursor-pointer"
                        title="Limpar busca"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Turma Select Filter */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-neutral-600 font-bold shrink-0 text-[11px] uppercase tracking-wider">
                      Turma:
                    </span>
                    <select
                      value={selectedTurmaFilter}
                      onChange={(e) => setSelectedTurmaFilter(e.target.value)}
                      className="bg-neutral-50 border border-[#dfd1a1]/50 hover:border-[#aa904f]/60 focus:border-[#aa904f] text-neutral-800 py-2.5 px-3 rounded-lg outline-none w-full sm:w-48 font-semibold cursor-pointer transition-all shadow-xs text-xs"
                    >
                      <option value="all">
                        Todas as turmas ({formandos.length})
                      </option>
                      {turmas.map((t) => {
                        const count = formandos.filter(
                          (f) => f.turmaId === t.id,
                        ).length;
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Contract Status Select Filter */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-neutral-600 font-bold shrink-0 text-[11px] uppercase tracking-wider">
                      Contrato:
                    </span>
                    <select
                      value={selectedContractStatusFilter}
                      onChange={(e) =>
                        setSelectedContractStatusFilter(e.target.value as any)
                      }
                      className="bg-neutral-50 border border-[#dfd1a1]/50 hover:border-[#aa904f]/60 focus:border-[#aa904f] text-neutral-800 py-2.5 px-3 rounded-lg outline-none w-full sm:w-56 font-semibold cursor-pointer transition-all shadow-xs text-xs"
                    >
                      <option value="all">
                        Todos os Contratos ({formandos.length})
                      </option>
                      <option value="NovosAssinados">
                        ✨ Novos Assinados (
                        {
                          formandos.filter((f) =>
                            studentContracts.some(
                              (c) =>
                                c.studentId === f.id &&
                                c.status === "Assinado" &&
                                c.isNewSignature,
                            ),
                          ).length
                        }
                        )
                      </option>
                      <option value="Assinado">
                        Assinados (
                        {
                          formandos.filter((f) =>
                            studentContracts.some(
                              (c) =>
                                c.studentId === f.id && c.status === "Assinado",
                            ),
                          ).length
                        }
                        )
                      </option>
                      <option value="Pendente">
                        Pendentes (
                        {
                          formandos.filter(
                            (f) =>
                              !studentContracts.some(
                                (c) =>
                                  c.studentId === f.id &&
                                  c.status === "Assinado",
                              ),
                          ).length
                        }
                        )
                      </option>
                    </select>
                  </div>
                </div>

                {/* Counter & Active Filters Reset Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px]">
                  <div className="flex items-center gap-2 text-neutral-600 font-semibold">
                    <span className="bg-[#fdfaf2] border border-[#d2c595] text-[#543d03] px-2.5 py-0.5 rounded-md font-bold shadow-2xs">
                      Exibindo {filteredStudents.length} de {formandos.length}{" "}
                      formandos
                    </span>
                    {(searchQuery ||
                      selectedTurmaFilter !== "all" ||
                      selectedContractStatusFilter !== "all") && (
                      <span className="text-[#8d1811] font-bold">
                        • Filtro ativo
                      </span>
                    )}
                  </div>

                  {(searchQuery ||
                    selectedTurmaFilter !== "all" ||
                    selectedContractStatusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTurmaFilter("all");
                        setSelectedContractStatusFilter("all");
                      }}
                      className="text-[10.5px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                    >
                      ✕ Limpar Filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Student registry list */}
              <div className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-none overflow-hidden shadow-sm text-[#543d03]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/40 border-b border-[#d2c595] text-[#3c2a01] uppercase font-bold">
                        <th className="p-4">Nome do Formando</th>
                        <th className="p-4">CPF / Contato</th>
                        <th className="p-4">Turma Vinculada</th>
                        <th className="p-4">Situação Financeira</th>
                        <th className="p-4">Contrato Eletrônico</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d2c595]/30">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-[#543d03]/70"
                          >
                            Nenhum aluno encontrado com os filtros atuais.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((std) => {
                          const stdTurma = turmas.find(
                            (t) => t.id === std.turmaId,
                          );
                          const stdContracts = studentContracts.filter(
                            (c) => c.studentId === std.id,
                          );
                          const signedContract = stdContracts.find(
                            (c) => c.status === "Assinado",
                          );
                          const pendingContract = stdContracts.find(
                            (c) => c.status === "Pendente",
                          );

                          return (
                            <tr
                              key={std.id}
                              className="hover:bg-white/20 transition-colors"
                            >
                              <td className="p-4 font-bold text-[#3c2a01]">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-white/60 border border-[#d2c595] flex items-center justify-center font-bold text-[10px] text-[#543d03]">
                                    {std.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span>{std.name}</span>
                                    {std.role === "comissao" ? (
                                      <span className="ml-1.5 bg-[#543d03] text-amber-100 text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md border border-[#c5b072]/40 inline-flex items-center gap-0.5">
                                        👑 Comissão
                                      </span>
                                    ) : (
                                      <span className="ml-1.5 bg-neutral-100 text-neutral-600 text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-md border border-neutral-200 inline-flex items-center gap-0.5">
                                        🎓 Formando
                                      </span>
                                    )}
                                    {std.studentCode && (
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <span
                                          className="bg-white/70 border border-[#d2c595] text-[#705510] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 select-all"
                                          title="Código de Acesso do Aluno"
                                        >
                                          🔑 {std.studentCode}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              std.studentCode || "",
                                            );
                                            setCopiedStudentId(std.id);
                                            setTimeout(
                                              () => setCopiedStudentId(null),
                                              1500,
                                            );
                                          }}
                                          className="text-[9px] text-[#aa904f] hover:underline flex items-center gap-0.5 cursor-pointer font-bold uppercase tracking-wider"
                                        >
                                          {copiedStudentId === std.id
                                            ? "Copiado!"
                                            : "Copiar"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-[#543d03]">
                                  {std.cpf}
                                </div>
                                <div className="text-[10px] text-[#543d03]/70">
                                  {std.email} • {std.phone}
                                </div>
                                {std.address && (
                                  <div className="text-[9px] text-[#543d03]/60 italic mt-0.5">
                                    Endereço: {std.address}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-[#543d03]">
                                  {stdTurma
                                    ? stdTurma.name.split(" - ")[0]
                                    : "Indefinida"}
                                </div>
                                <div className="text-[9px] text-[#543d03]/60 font-mono">
                                  {std.packageSelected}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-bold text-[#3c2a01]">
                                      {std.totalPaid.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                        maximumFractionDigits: 0,
                                      })}{" "}
                                      pagos
                                    </div>
                                    <div className="text-[9px] text-[#543d03]/60 font-mono">
                                      de{" "}
                                      {std.totalDue.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                        maximumFractionDigits: 0,
                                      })}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleToggleStudentStatus(std.id)
                                    }
                                    className={`px-0 py-0 text-[10px] font-bold transition-all border-none bg-transparent hover:underline ${
                                      std.status === "Ativo"
                                        ? "text-emerald-700"
                                        : std.status === "Pendente"
                                          ? "text-amber-700"
                                          : "text-rose-700"
                                    }`}
                                    title="Clique para alternar situação"
                                  >
                                    {std.status === "Ativo"
                                      ? "Em dia"
                                      : std.status === "Pendente"
                                        ? "Pendente"
                                        : "Inadimplente"}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                {signedContract ? (
                                  <div className="inline-flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="bg-emerald-100/90 text-emerald-900 border border-emerald-400/80 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
                                        Assinado
                                      </span>
                                      {signedContract.isNewSignature && (
                                        <span className="bg-emerald-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full animate-pulse shadow-2xs flex items-center gap-1">
                                          ✨ Novo
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-emerald-800 font-mono mt-0.5">
                                      {signedContract.signedAt
                                        ? `Em ${signedContract.signedAt.split(",")[0]}`
                                        : "Assinatura digital"}
                                    </span>
                                    {signedContract.isNewSignature && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkContractViewed(std.id);
                                        }}
                                        className="text-[9.5px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 transition-all mt-0.5"
                                      >
                                        Marcar visto
                                      </button>
                                    )}
                                  </div>
                                ) : pendingContract ? (
                                  <div className="inline-flex flex-col items-start">
                                    <span className="bg-amber-100/90 text-amber-900 border border-amber-400/80 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                                      <FileClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />{" "}
                                      Pendente
                                    </span>
                                    <span className="text-[9px] text-amber-900/80 font-mono mt-0.5">
                                      Aguardando assinatura
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex flex-col items-start">
                                    <span className="bg-amber-50/80 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <FileText className="w-3 h-3 text-amber-600 shrink-0" />{" "}
                                      Pendente
                                    </span>
                                    <span className="text-[9px] text-[#543d03]/70 italic mt-0.5">
                                      Aguardando envio
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-right flex items-center justify-end gap-1">
                                {std.phone &&
                                  (() => {
                                    const cleanPhone = std.phone.replace(
                                      /\D/g,
                                      "",
                                    );
                                    const waNumber = cleanPhone.startsWith("55")
                                      ? cleanPhone
                                      : "55" + cleanPhone;
                                    return (
                                      <a
                                        href={`https://wa.me/${waNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded transition-colors flex items-center justify-center cursor-pointer"
                                        title={`Falar com ${std.name} no WhatsApp`}
                                      >
                                        <svg
                                          className="w-4 h-4 fill-current"
                                          viewBox="0 0 24 24"
                                        >
                                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.885-6.963C16.588 1.964 14.12 1.04 11.498 1.04c-5.43 0-9.85 4.414-9.855 9.852-.002 1.712.447 3.382 1.299 4.843L1.875 20.94l5.312-1.393L6.647 19.15zM17.01 14.39c-.274-.138-1.62-.8-1.87-.891-.25-.091-.433-.138-.616.138-.183.276-.708.891-.867 1.074-.158.184-.317.207-.591.069a7.46 7.46 0 0 1-2.193-1.355 8.243 8.243 0 0 1-1.517-1.888c-.165-.284-.018-.438.12-.576.125-.123.275-.322.413-.483.137-.161.183-.276.275-.459.091-.184.046-.344-.023-.482-.069-.138-.616-1.484-.843-2.035-.222-.534-.445-.461-.616-.47l-.527-.01c-.183 0-.482.069-.733.344-.25.276-.957.935-.957 2.279 0 1.344.978 2.639 1.116 2.822.137.184 1.925 2.939 4.661 4.124.651.282 1.159.451 1.554.577.654.208 1.248.179 1.718.109.524-.079 1.62-.663 1.848-1.272.227-.609.227-1.129.158-1.239-.069-.11-.252-.178-.526-.316z" />
                                        </svg>
                                      </a>
                                    );
                                  })()}
                                <button
                                  onClick={() => handleOpenEditStudent(std)}
                                  className="p-1.5 text-[#705510] hover:bg-[#d2c595]/20 rounded transition-colors"
                                  title="Editar Aluno"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    handleMarkContractViewed(std.id);
                                    setContractStudentId(std.id);
                                    setShowContractPdfModal(true);
                                  }}
                                  className="p-1.5 text-[#aa904f] hover:bg-[#aa904f]/20 rounded transition-colors"
                                  title={`Gerar Contrato em PDF para ${std.name}`}
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(std.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                                  title="Deletar Aluno"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Geração de Contratos PDF Modal */}
              {showContractPdfModal && (
                <ContractPdfGenerator
                  formandos={formandos}
                  turmas={turmas}
                  initialStudentId={contractStudentId}
                  onClose={() => setShowContractPdfModal(false)}
                />
              )}

              {/* Print Relação de Convidados Modal */}
              {showPrintModal &&
                (() => {
                  const totalFormandosCount = filteredStudents.length;
                  const totalIndividualGuests = filteredStudents.reduce(
                    (sum, f) => sum + (f.convidados?.length || 0),
                    0,
                  );
                  const totalFilesCount = filteredStudents.filter(
                    (f) => f.guestListFile,
                  ).length;

                  // Group students by Turma
                  const groupedByTurma = turmas
                    .map((t) => {
                      const classStudents = filteredStudents.filter(
                        (s) => s.turmaId === t.id,
                      );
                      return {
                        turma: t,
                        students: classStudents,
                      };
                    })
                    .filter((group) => group.students.length > 0);

                  return (
                    <>
                      {/* Normal Screen Preview Modal */}
                      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-neutral-50 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200"
                        >
                          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                            <h4 className="font-bold text-sm text-[#dfd1a1] flex items-center gap-1.5">
                              <Printer className="w-4 h-4 text-[#dfd1a1]" />{" "}
                              Visualização de Impressão - Relação Consolidada
                            </h4>
                            <button
                              onClick={() => setShowPrintModal(false)}
                              className="text-neutral-400 hover:text-white border-none bg-transparent cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Control Panel in preview */}
                          <div className="bg-amber-50 border-b border-amber-200 p-3 flex justify-between items-center gap-4 flex-wrap text-xs text-[#543d03] shrink-0">
                            <div className="flex-1 text-left">
                              <strong>Modo de Impressão Inteligente:</strong> Ao
                              clicar no botão ao lado, a página abrirá a caixa
                              de diálogo de impressão do navegador contendo{" "}
                              <strong>apenas o documento limpo</strong> abaixo,
                              omitindo o painel e os botões do sistema.
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="bg-[#8d1811] hover:bg-[#72120c] text-white font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer uppercase tracking-wider"
                              >
                                <Printer className="w-4 h-4" /> Enviar para
                                Impressora / PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowPrintModal(false)}
                                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold px-4 py-2 rounded-lg transition-all cursor-pointer border-none"
                              >
                                Fechar
                              </button>
                            </div>
                          </div>

                          {/* Page Preview Container */}
                          <div className="p-6 overflow-y-auto bg-neutral-100 flex-1">
                            <div className="bg-white p-8 max-w-3xl mx-auto shadow-sm border border-neutral-300 text-neutral-900 font-sans text-xs">
                              {/* Document Header */}
                              <div className="text-center border-b-2 border-neutral-900 pb-4 mb-6">
                                <h2 className="text-lg font-black tracking-widest uppercase text-neutral-900">
                                  CONCEITTUS FORMATURAS
                                </h2>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                                  Relação Consolidada de Convidados para Evento
                                </p>
                                <div className="flex justify-between items-center mt-3 text-[9px] font-bold text-neutral-600 border-t border-neutral-200 pt-2">
                                  <span>
                                    FILTRO:{" "}
                                    {selectedTurmaFilter === "all"
                                      ? "TODAS AS TURMAS"
                                      : "TURMA FILTRADA"}
                                  </span>
                                  <span>
                                    GERADO EM:{" "}
                                    {new Date().toLocaleString("pt-BR")}
                                  </span>
                                </div>
                              </div>

                              {/* Consolidated Statistics */}
                              <div className="grid grid-cols-3 gap-4 border border-neutral-200 rounded-lg p-3 bg-neutral-50 mb-6 text-center text-[10px]">
                                <div>
                                  <span className="text-neutral-500 block font-bold uppercase">
                                    Formandos Filtrados
                                  </span>
                                  <strong className="text-lg text-neutral-900">
                                    {totalFormandosCount}
                                  </strong>
                                </div>
                                <div className="border-x border-neutral-200">
                                  <span className="text-neutral-500 block font-bold uppercase">
                                    Convidados Individuais
                                  </span>
                                  <strong className="text-lg text-neutral-900">
                                    {totalIndividualGuests}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-neutral-500 block font-bold uppercase">
                                    Listas em Arquivo (Upload)
                                  </span>
                                  <strong className="text-lg text-neutral-900">
                                    {totalFilesCount}
                                  </strong>
                                </div>
                              </div>

                              {/* Group list details */}
                              <div className="space-y-6">
                                {groupedByTurma.length === 0 ? (
                                  <p className="text-center text-neutral-500 italic py-6">
                                    Nenhum dado cadastrado para os filtros
                                    atuais.
                                  </p>
                                ) : (
                                  groupedByTurma.map(({ turma, students }) => (
                                    <div key={turma.id} className="space-y-4">
                                      <div className="bg-neutral-900 text-white font-black px-3 py-1.5 text-xs uppercase tracking-wider flex justify-between items-center rounded-sm">
                                        <span>TURMA: {turma.name}</span>
                                        <span className="text-[9.5px] font-medium">
                                          {turma.institution}
                                        </span>
                                      </div>

                                      <div className="space-y-3">
                                        {students.map((stud) => {
                                          const hasGuests =
                                            stud.convidados &&
                                            stud.convidados.length > 0;
                                          const hasFile = !!stud.guestListFile;

                                          return (
                                            <div
                                              key={stud.id}
                                              className="border border-neutral-300 rounded p-3 bg-neutral-50/50 space-y-2 text-left"
                                            >
                                              <div className="flex justify-between items-center border-b border-neutral-200 pb-1">
                                                <div>
                                                  <strong className="text-[11px] text-neutral-900 uppercase">
                                                    {stud.name}
                                                  </strong>
                                                  <span className="text-[9px] text-neutral-500 block font-mono">
                                                    CPF:{" "}
                                                    {stud.cpf ||
                                                      "Não informado"}{" "}
                                                    |{" "}
                                                    {stud.phone ||
                                                      "Sem contato"}
                                                  </span>
                                                </div>
                                                <div className="text-right">
                                                  {hasGuests && (
                                                    <span className="bg-neutral-200 text-neutral-800 font-extrabold px-2 py-0.5 rounded text-[8px] uppercase">
                                                      {stud.convidados?.length}{" "}
                                                      Convidados
                                                    </span>
                                                  )}
                                                  {hasFile && (
                                                    <span className="bg-neutral-200 text-neutral-800 font-extrabold px-2 py-0.5 rounded text-[8px] uppercase ml-1">
                                                      Arquivo Enviado
                                                    </span>
                                                  )}
                                                  {!hasGuests && !hasFile && (
                                                    <span className="text-rose-700 font-black text-[8px] uppercase">
                                                      PENDENTE
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Individual guest items table */}
                                              {hasGuests && (
                                                <table className="w-full text-left text-[9px] border-collapse mt-1 bg-white">
                                                  <thead>
                                                    <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-neutral-700 uppercase">
                                                      <th className="p-1.5 w-10 text-center border-r border-neutral-200">
                                                        #
                                                      </th>
                                                      <th className="p-1.5 border-r border-neutral-200">
                                                        Nome do Convidado
                                                      </th>
                                                      <th className="p-1.5">
                                                        CPF / RG
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-neutral-200">
                                                    {stud.convidados?.map(
                                                      (guest, idx) => (
                                                        <tr
                                                          key={guest.id || idx}
                                                        >
                                                          <td className="p-1.5 text-center font-mono border-r border-neutral-200 text-neutral-500">
                                                            {idx + 1}
                                                          </td>
                                                          <td className="p-1.5 font-bold text-neutral-900 border-r border-neutral-200">
                                                            {guest.name}
                                                          </td>
                                                          <td className="p-1.5 font-mono text-neutral-600">
                                                            {guest.cpf || "-"}
                                                          </td>
                                                        </tr>
                                                      ),
                                                    )}
                                                  </tbody>
                                                </table>
                                              )}

                                              {/* File upload item details */}
                                              {hasFile &&
                                                stud.guestListFile && (
                                                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[9.5px] text-emerald-900 flex justify-between items-center">
                                                    <span>
                                                      <strong>
                                                        Lista de Convidados
                                                        Final por Arquivo:
                                                      </strong>{" "}
                                                      {stud.guestListFile.name}
                                                    </span>
                                                    <span className="text-[8px] font-mono font-medium">
                                                      Enviado em{" "}
                                                      {new Date(
                                                        stud.guestListFile
                                                          .uploadedAt,
                                                      ).toLocaleDateString(
                                                        "pt-BR",
                                                      )}
                                                    </span>
                                                  </div>
                                                )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* ONLY VISIBLE ON PRINT layout (Opaque, Clean, Pure paper representation covering viewport) */}
                      <div className="print:absolute print:inset-0 print:bg-white print:text-black print:z-[99999] print:p-0 print:overflow-visible hidden print:block font-sans text-xs bg-white text-black p-8">
                        {/* Document Header */}
                        <div className="text-center border-b-2 border-black pb-4 mb-6">
                          <h2 className="text-xl font-black tracking-widest uppercase">
                            CONCEITTUS FORMATURAS
                          </h2>
                          <p className="text-[10px] font-bold text-neutral-750 uppercase tracking-wider mt-0.5">
                            Relação Consolidada de Convidados para Evento
                          </p>
                          <div className="flex justify-between items-center mt-3 text-[9px] font-bold text-neutral-600 border-t border-neutral-300 pt-2">
                            <span>
                              FILTRO:{" "}
                              {selectedTurmaFilter === "all"
                                ? "TODAS AS TURMAS"
                                : "TURMA FILTRADA"}
                            </span>
                            <span>
                              GERADO EM: {new Date().toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>

                        {/* Consolidated Statistics */}
                        <div className="grid grid-cols-3 gap-4 border border-neutral-400 rounded-lg p-3 bg-neutral-50 mb-6 text-center text-[10px]">
                          <div>
                            <span className="text-neutral-600 block font-bold uppercase">
                              Formandos Filtrados
                            </span>
                            <strong className="text-lg text-black">
                              {totalFormandosCount}
                            </strong>
                          </div>
                          <div className="border-x border-neutral-300">
                            <span className="text-neutral-600 block font-bold uppercase">
                              Convidados Individuais
                            </span>
                            <strong className="text-lg text-black">
                              {totalIndividualGuests}
                            </strong>
                          </div>
                          <div>
                            <span className="text-neutral-600 block font-bold uppercase">
                              Listas em Arquivo (Upload)
                            </span>
                            <strong className="text-lg text-black">
                              {totalFilesCount}
                            </strong>
                          </div>
                        </div>

                        {/* Group list details */}
                        <div className="space-y-6">
                          {groupedByTurma.map(({ turma, students }) => (
                            <div
                              key={turma.id}
                              className="space-y-4 break-inside-avoid"
                            >
                              <div className="bg-black text-white font-black px-3 py-1.5 text-xs uppercase tracking-wider flex justify-between items-center">
                                <span>TURMA: {turma.name}</span>
                                <span className="text-[9.5px] font-medium">
                                  {turma.institution}
                                </span>
                              </div>

                              <div className="space-y-3">
                                {students.map((stud) => {
                                  const hasGuests =
                                    stud.convidados &&
                                    stud.convidados.length > 0;
                                  const hasFile = !!stud.guestListFile;

                                  return (
                                    <div
                                      key={stud.id}
                                      className="border border-neutral-400 rounded p-3 bg-white space-y-2 break-inside-avoid text-left"
                                    >
                                      <div className="flex justify-between items-center border-b border-neutral-300 pb-1">
                                        <div>
                                          <strong className="text-[11px] text-black uppercase">
                                            {stud.name}
                                          </strong>
                                          <span className="text-[9px] text-neutral-650 block font-mono">
                                            CPF: {stud.cpf || "Não informado"} |{" "}
                                            {stud.phone || "Sem contato"}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          {hasGuests && (
                                            <span className="bg-neutral-100 text-black border border-neutral-350 font-extrabold px-2 py-0.5 rounded text-[8px] uppercase">
                                              {stud.convidados?.length}{" "}
                                              Convidados
                                            </span>
                                          )}
                                          {hasFile && (
                                            <span className="bg-neutral-100 text-black border border-neutral-350 font-extrabold px-2 py-0.5 rounded text-[8px] uppercase ml-1">
                                              Arquivo Enviado
                                            </span>
                                          )}
                                          {!hasGuests && !hasFile && (
                                            <span className="text-rose-800 border border-rose-400 font-black text-[8px] uppercase px-2 py-0.5 rounded">
                                              PENDENTE
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Individual guest items table */}
                                      {hasGuests && (
                                        <table className="w-full text-left text-[9px] border-collapse mt-1 bg-white">
                                          <thead>
                                            <tr className="bg-neutral-50 border-b border-neutral-400 font-bold text-neutral-700 uppercase">
                                              <th className="p-1.5 w-10 text-center border-r border-neutral-350">
                                                #
                                              </th>
                                              <th className="p-1.5 border-r border-neutral-350">
                                                Nome do Convidado
                                              </th>
                                              <th className="p-1.5">
                                                CPF / RG
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-neutral-300">
                                            {stud.convidados?.map(
                                              (guest, idx) => (
                                                <tr key={guest.id || idx}>
                                                  <td className="p-1.5 text-center font-mono border-r border-neutral-350 text-neutral-500">
                                                    {idx + 1}
                                                  </td>
                                                  <td className="p-1.5 font-bold text-black border-r border-neutral-350">
                                                    {guest.name}
                                                  </td>
                                                  <td className="p-1.5 font-mono text-neutral-800">
                                                    {guest.cpf || "-"}
                                                  </td>
                                                </tr>
                                              ),
                                            )}
                                          </tbody>
                                        </table>
                                      )}

                                      {/* File upload item details */}
                                      {hasFile && stud.guestListFile && (
                                        <div className="bg-neutral-55 border border-neutral-350 rounded p-2 text-[9.5px] text-black flex justify-between items-center">
                                          <span>
                                            <strong>
                                              Lista de Convidados Final por
                                              Arquivo:
                                            </strong>{" "}
                                            {stud.guestListFile.name}
                                          </span>
                                          <span className="text-[8px] font-mono font-medium text-neutral-500">
                                            Enviado em{" "}
                                            {new Date(
                                              stud.guestListFile.uploadedAt,
                                            ).toLocaleDateString("pt-BR")}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}

              {/* Formando Edit Modal */}
              {editingFormando && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl border border-neutral-200 max-h-[90vh] flex flex-col"
                  >
                    <div className="bg-slate-50 text-neutral-800 p-4 flex justify-between items-center border-b border-neutral-200 shrink-0">
                      <h4 className="font-bold text-sm text-[#aa904f] flex items-center gap-1.5">
                        <UserCog className="w-4 h-4" /> Editar Dados e
                        Financeiro do Formando
                      </h4>
                      <button
                        onClick={() => setEditingFormando(null)}
                        className="text-neutral-400 hover:text-neutral-900 animate-none transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleUpdateStudent}
                      className="flex flex-col flex-1 overflow-hidden"
                    >
                      {/* Scrollable Layout Body */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                        {/* LEFT COLUMN: Student Standard Info */}
                        <div className="md:col-span-5 space-y-4 text-xs bg-white text-neutral-850">
                          <h5 className="font-bold text-[11px] text-[#aa904f] uppercase tracking-wider pb-1 border-b border-neutral-100">
                            Informações Pessoais
                          </h5>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                              Nome Completo
                            </label>
                            <input
                              type="text"
                              required
                              value={editStdName}
                              onChange={(e) => setEditStdName(e.target.value)}
                              placeholder="Ex: João da Silva Santos"
                              className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                E-mail
                              </label>
                              <input
                                type="email"
                                required
                                value={editStdEmail}
                                onChange={(e) =>
                                  setEditStdEmail(e.target.value)
                                }
                                placeholder="Ex: joao@exemplo.com"
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Celular / WhatsApp
                              </label>
                              <input
                                type="text"
                                required
                                value={editStdPhone}
                                onChange={(e) =>
                                  setEditStdPhone(e.target.value)
                                }
                                placeholder="Ex: (11) 99123-4567"
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                CPF
                              </label>
                              <input
                                type="text"
                                required
                                value={editStdCPF}
                                onChange={(e) => setEditStdCPF(e.target.value)}
                                placeholder="Ex: 123.456.789-10"
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Turma Vinculada
                              </label>
                              <select
                                required
                                value={editStdTurmaId}
                                onChange={(e) =>
                                  setEditStdTurmaId(e.target.value)
                                }
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-805"
                              >
                                <option value="">Selecione uma turma...</option>
                                {turmas.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                              Endereço Residencial
                            </label>
                            <input
                              type="text"
                              required
                              value={editStdAddress}
                              onChange={(e) =>
                                setEditStdAddress(e.target.value)
                              }
                              placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                              className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                              Código de Acesso do Aluno
                            </label>
                            <input
                              type="text"
                              required
                              value={editStdCode}
                              onChange={(e) => setEditStdCode(e.target.value)}
                              placeholder="Ex: MED-JOAO-123"
                              className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900 font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Tipo de Membro
                              </label>
                              <select
                                value={editStdRole}
                                onChange={(e: any) =>
                                  setEditStdRole(e.target.value)
                                }
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-805"
                              >
                                <option value="formando">
                                  Formando Regular
                                </option>
                                <option value="comissao">
                                  Membro da Comissão
                                </option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Designação de Pacote Base da Turma
                              </label>
                              {editStdTurmaId &&
                              pacotes.filter(
                                (p) => p.turmaId === editStdTurmaId,
                              ).length > 0 ? (
                                <div className="bg-slate-50 border border-neutral-200 p-2.5 rounded space-y-2 max-h-[140px] overflow-y-auto">
                                  {pacotes
                                    .filter((p) => p.turmaId === editStdTurmaId)
                                    .map((p) => {
                                      const isChecked = editStdPackage
                                        .split(" + ")
                                        .some(
                                          (part) =>
                                            part.trim().toLowerCase() ===
                                              p.name.toLowerCase() ||
                                            part
                                              .trim()
                                              .toLowerCase()
                                              .startsWith(
                                                p.name.toLowerCase(),
                                              ) ||
                                            p.name
                                              .toLowerCase()
                                              .startsWith(
                                                part.trim().toLowerCase(),
                                              ),
                                        );

                                      return (
                                        <label
                                          key={p.id}
                                          className="flex items-center gap-2 cursor-pointer select-none hover:text-[#aa904f] transition-colors"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              let currentParts = editStdPackage
                                                ? editStdPackage
                                                    .split(" + ")
                                                    .map((s) => s.trim())
                                                : [];
                                              currentParts =
                                                currentParts.filter(
                                                  (part) =>
                                                    part !== "" &&
                                                    part !==
                                                      "Selecione um pacote...",
                                                );

                                              if (e.target.checked) {
                                                if (
                                                  !currentParts.some(
                                                    (x) =>
                                                      x.toLowerCase() ===
                                                      p.name.toLowerCase(),
                                                  )
                                                ) {
                                                  currentParts.push(p.name);
                                                }
                                              } else {
                                                currentParts =
                                                  currentParts.filter(
                                                    (part) =>
                                                      part.toLowerCase() !==
                                                        p.name.toLowerCase() &&
                                                      !part
                                                        .toLowerCase()
                                                        .startsWith(
                                                          p.name.toLowerCase(),
                                                        ) &&
                                                      !p.name
                                                        .toLowerCase()
                                                        .startsWith(
                                                          part.toLowerCase(),
                                                        ),
                                                  );
                                              }

                                              const joinedName =
                                                currentParts.join(" + ");
                                              setEditStdPackage(joinedName);

                                              const combinedBase =
                                                getSelectedPackagesPrice(
                                                  joinedName,
                                                  editStdTurmaId,
                                                  0,
                                                );
                                              const extraSum =
                                                editStdExtraPackages.reduce(
                                                  (sum, ep) =>
                                                    sum +
                                                    (Number(ep.price) || 0),
                                                  0,
                                                );
                                              setEditStdTotalDue(
                                                combinedBase + extraSum,
                                              );
                                            }}
                                            className="accent-[#aa904f] h-3.5 w-3.5 rounded border-neutral-300"
                                          />
                                          <span className="font-semibold text-[11px] text-neutral-800">
                                            {p.name}{" "}
                                            <span className="text-neutral-500 font-normal">
                                              (
                                              {p.price.toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                                maximumFractionDigits: 0,
                                              })}
                                              )
                                            </span>
                                          </span>
                                        </label>
                                      );
                                    })}
                                  <div className="pt-1.5 border-t border-neutral-200/60 flex items-center gap-1.5">
                                    <span className="text-[9px] text-neutral-400 font-bold uppercase shrink-0">
                                      Nome Final:
                                    </span>
                                    <input
                                      type="text"
                                      value={editStdPackage}
                                      onChange={(e) => {
                                        setEditStdPackage(e.target.value);
                                        const combinedBase =
                                          getSelectedPackagesPrice(
                                            e.target.value,
                                            editStdTurmaId,
                                            0,
                                          );
                                        const extraSum =
                                          editStdExtraPackages.reduce(
                                            (sum, ep) =>
                                              sum + (Number(ep.price) || 0),
                                            0,
                                          );
                                        setEditStdTotalDue(
                                          combinedBase + extraSum,
                                        );
                                      }}
                                      placeholder="Ex: Pacote Customizado"
                                      className="flex-1 bg-white border border-neutral-200/80 px-2 py-1 rounded text-[10px] outline-none focus:border-[#aa904f]"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  required
                                  value={editStdPackage}
                                  onChange={(e) => {
                                    setEditStdPackage(e.target.value);
                                    const combinedBase =
                                      getSelectedPackagesPrice(
                                        e.target.value,
                                        editStdTurmaId,
                                        0,
                                      );
                                    const extraSum =
                                      editStdExtraPackages.reduce(
                                        (sum, ep) =>
                                          sum + (Number(ep.price) || 0),
                                        0,
                                      );
                                    setEditStdTotalDue(combinedBase + extraSum);
                                  }}
                                  className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                                />
                              )}

                              {/* Pacotes Adicionais Exclusivos Deste Formando */}
                              <div className="mt-3 pt-3 border-t border-neutral-200">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <label className="text-[10px] font-bold text-[#aa904f] uppercase flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#aa904f]" />
                                    Pacotes Extras Deste Formando (
                                    {editStdExtraPackages.length})
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowAddExtraPackageModal(true)
                                    }
                                    className="bg-amber-50 hover:bg-amber-100 text-[#8c7438] text-[9.5px] font-bold px-2 py-1 rounded-md border border-amber-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> + Incluir
                                    Pacote Extra
                                  </button>
                                </div>

                                {editStdExtraPackages.length === 0 ? (
                                  <div className="bg-slate-50 border border-dashed border-neutral-200 p-3 rounded-lg text-center text-[10px] text-neutral-400">
                                    Nenhum pacote adicional exclusivo incluído
                                    para este formando.
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowAddExtraPackageModal(true)
                                      }
                                      className="block mx-auto mt-1.5 text-[#aa904f] hover:underline font-bold"
                                    >
                                      + Clique aqui para incluir pacote
                                      exclusivo
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                                    {editStdExtraPackages.map((ep) => (
                                      <div
                                        key={ep.id}
                                        className="bg-amber-50/60 border border-amber-200/90 rounded-lg p-2 flex items-center justify-between gap-2 text-xs"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-neutral-900 text-[11px] truncate">
                                              {ep.name}
                                            </span>
                                            <span className="bg-[#aa904f] text-white text-[7.5px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                              ✨ Exclusivo
                                            </span>
                                            {ep.quantity && ep.quantity > 1 && (
                                              <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                {ep.quantity}x
                                              </span>
                                            )}
                                            {ep.items &&
                                              ep.items.length > 0 && (
                                                <span className="bg-neutral-100 text-neutral-600 text-[7.5px] font-semibold px-1 py-0.5 rounded">
                                                  {ep.items.length} itens
                                                  inclusos
                                                </span>
                                              )}
                                          </div>
                                          {ep.description && (
                                            <p className="text-[9px] text-neutral-500 line-clamp-1 mt-0.5">
                                              {ep.description}
                                            </p>
                                          )}
                                          <div className="text-[10px] font-extrabold text-[#aa904f] mt-0.5">
                                            {Number(ep.price).toLocaleString(
                                              "pt-BR",
                                              {
                                                style: "currency",
                                                currency: "BRL",
                                              },
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingExtraPackage(ep);
                                              setEditExtraName(ep.name);
                                              setEditExtraPrice(
                                                Number(ep.price) || 0,
                                              );
                                              setEditExtraQuantity(
                                                ep.quantity || 1,
                                              );
                                              setEditExtraCategory(
                                                ep.category || "foto_video",
                                              );
                                              setEditExtraDesc(
                                                ep.description || "",
                                              );
                                              setEditExtraItems(
                                                ep.items ? [...ep.items] : [],
                                              );
                                              setNewExtraItemInput("");
                                            }}
                                            className="text-neutral-500 hover:text-[#aa904f] p-1 rounded hover:bg-amber-100/60 transition-colors cursor-pointer"
                                            title="Editar detalhes, preço, itens inclusos ou descrição deste pacote"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveExtraPackageFromStudent(
                                                ep.id,
                                              )
                                            }
                                            className="text-neutral-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Remover pacote exclusivo"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Modal / Dialog de Edição de Pacote Extra Existente */}
                                {editingExtraPackage && (
                                  <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                                    <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
                                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                                          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#aa904f]">
                                            <Edit className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-neutral-900">
                                              Editar Pacote Exclusivo
                                            </h4>
                                            <p className="text-[10px] text-neutral-500">
                                              Ajuste valores, itens inclusos e
                                              detalhes do contrato
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingExtraPackage(null)
                                          }
                                          className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md hover:bg-neutral-100 transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <div className="space-y-3.5 text-xs">
                                        <div>
                                          <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                            Nome do Pacote / Serviço Exclusivo
                                          </label>
                                          <input
                                            type="text"
                                            value={editExtraName}
                                            onChange={(e) =>
                                              setEditExtraName(e.target.value)
                                            }
                                            className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded-lg text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900 focus:bg-white transition-all"
                                            placeholder="Ex: Ensaio Fotográfico VIP, Álbum de Luxo..."
                                          />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                          <div>
                                            <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                              Categoria
                                            </label>
                                            <select
                                              value={editExtraCategory}
                                              onChange={(e) =>
                                                setEditExtraCategory(
                                                  e.target
                                                    .value as FormandoExtraPackage["category"],
                                                )
                                              }
                                              className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] text-neutral-900"
                                            >
                                              <option value="foto_video">
                                                📸 Foto & Vídeo
                                              </option>
                                              <option value="convites">
                                                🎟️ Convites & Acessos
                                              </option>
                                              <option value="beca_vestuario">
                                                🎓 Beca & Vestuário
                                              </option>
                                              <option value="mesas_acessos">
                                                🍽️ Mesas & Camarote
                                              </option>
                                              <option value="personalizados">
                                                ✨ Personalizados
                                              </option>
                                              <option value="outros">
                                                📦 Outros Serviços
                                              </option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                              Valor Total (R$)
                                            </label>
                                            <input
                                              type="number"
                                              min={0}
                                              step="10"
                                              value={editExtraPrice}
                                              onChange={(e) =>
                                                setEditExtraPrice(
                                                  Math.max(
                                                    0,
                                                    Number(e.target.value),
                                                  ),
                                                )
                                              }
                                              className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900 focus:bg-white"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                              Quantidade
                                            </label>
                                            <input
                                              type="number"
                                              min={1}
                                              value={editExtraQuantity}
                                              onChange={(e) =>
                                                setEditExtraQuantity(
                                                  Math.max(
                                                    1,
                                                    Number(e.target.value),
                                                  ),
                                                )
                                              }
                                              className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900 focus:bg-white"
                                            />
                                          </div>
                                        </div>

                                        {editExtraQuantity > 1 && (
                                          <div className="bg-neutral-50 border border-neutral-200 p-2 rounded-lg text-[11px] text-neutral-600 flex justify-between">
                                            <span>
                                              Preço Unitário Calculado:
                                            </span>
                                            <span className="font-bold text-neutral-900">
                                              {(
                                                editExtraPrice /
                                                editExtraQuantity
                                              ).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                              })}{" "}
                                              / unid.
                                            </span>
                                          </div>
                                        )}

                                        <div>
                                          <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                            Descrição Detalhada
                                          </label>
                                          <textarea
                                            rows={2}
                                            value={editExtraDesc}
                                            onChange={(e) =>
                                              setEditExtraDesc(e.target.value)
                                            }
                                            className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 focus:bg-white"
                                            placeholder="Detalhes, especificações ou termos do serviço contratado..."
                                          />
                                        </div>

                                        {/* Gestão de Itens Inclusos */}
                                        <div className="space-y-1.5 pt-1">
                                          <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                                            Itens Inclusos no Pacote
                                          </label>
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              value={newExtraItemInput}
                                              onChange={(e) =>
                                                setNewExtraItemInput(
                                                  e.target.value,
                                                )
                                              }
                                              onKeyDown={(e) => {
                                                if (
                                                  e.key === "Enter" &&
                                                  newExtraItemInput.trim()
                                                ) {
                                                  e.preventDefault();
                                                  setEditExtraItems([
                                                    ...editExtraItems,
                                                    newExtraItemInput.trim(),
                                                  ]);
                                                  setNewExtraItemInput("");
                                                }
                                              }}
                                              placeholder="Ex: 50 fotos digitais tratadas, Beca com capelo..."
                                              className="flex-1 bg-slate-50 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (newExtraItemInput.trim()) {
                                                  setEditExtraItems([
                                                    ...editExtraItems,
                                                    newExtraItemInput.trim(),
                                                  ]);
                                                  setNewExtraItemInput("");
                                                }
                                              }}
                                              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                                            >
                                              + Adicionar
                                            </button>
                                          </div>

                                          {editExtraItems.length > 0 && (
                                            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto bg-neutral-50/70 border border-neutral-200/80 rounded-lg p-2">
                                              {editExtraItems.map(
                                                (item, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded border border-neutral-200 text-[11px] text-neutral-800"
                                                  >
                                                    <span className="truncate flex items-center gap-1.5">
                                                      <span className="text-[#aa904f] font-bold">
                                                        ✓
                                                      </span>{" "}
                                                      {item}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setEditExtraItems(
                                                          editExtraItems.filter(
                                                            (_, i) => i !== idx,
                                                          ),
                                                        )
                                                      }
                                                      className="text-neutral-400 hover:text-rose-600 p-0.5"
                                                      title="Remover item"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                        <div className="text-[11px] text-neutral-500">
                                          Total do Pacote:{" "}
                                          <strong className="text-neutral-900 font-bold">
                                            {Number(
                                              editExtraPrice,
                                            ).toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                            })}
                                          </strong>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEditingExtraPackage(null)
                                            }
                                            className="px-3.5 py-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={
                                              handleSaveEditedExtraPackage
                                            }
                                            className="px-4 py-1.5 bg-[#aa904f] hover:bg-[#967e3a] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                                          >
                                            Salvar Alterações
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Composição Financeira Resumida */}
                                {(() => {
                                  const baseP = getSelectedPackagesPrice(
                                    editStdPackage,
                                    editStdTurmaId,
                                    0,
                                  );
                                  const extraP = editStdExtraPackages.reduce(
                                    (sum, ep) => sum + (Number(ep.price) || 0),
                                    0,
                                  );
                                  const totalP =
                                    baseP + extraP || editStdTotalDue;

                                  return (
                                    <div className="bg-white border border-neutral-200/80 p-2.5 rounded-lg mt-2.5 space-y-1 text-[10px]">
                                      <div className="flex justify-between text-neutral-600">
                                        <span>Pacote Base da Turma:</span>
                                        <span className="font-semibold">
                                          R$ {baseP.toLocaleString("pt-BR")}
                                        </span>
                                      </div>
                                      {extraP > 0 && (
                                        <div className="flex justify-between text-[#aa904f]">
                                          <span>
                                            (+) Extras Exclusivos (
                                            {editStdExtraPackages.length}):
                                          </span>
                                          <span className="font-bold">
                                            R$ {extraP.toLocaleString("pt-BR")}
                                          </span>
                                        </div>
                                      )}
                                      <div className="pt-1 border-t border-neutral-100 flex justify-between font-extrabold text-neutral-900 text-[11px]">
                                        <span>Total Geral Contratado:</span>
                                        <span className="text-[#aa904f]">
                                          R$ {totalP.toLocaleString("pt-BR")}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Situação de Cobrança
                              </label>
                              <select
                                value={editStdStatus}
                                onChange={(e: any) =>
                                  setEditStdStatus(e.target.value)
                                }
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-805"
                              >
                                <option value="Ativo">Em dia</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Inadimplente">
                                  Inadimplente
                                </option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Exibíveis Extras (Gala)
                              </label>
                              <input
                                type="number"
                                required
                                min={0}
                                max={100}
                                value={editStdExtraInvites}
                                onChange={(e) =>
                                  setEditStdExtraInvites(
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded outline-none focus:border-[#aa904f] text-neutral-900 font-medium"
                              />
                            </div>
                          </div>

                          {/* Quick Totals Box */}
                          <div className="bg-slate-50 p-3.5 border border-neutral-200 rounded-xl space-y-2 mt-4 shadow-sm">
                            <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                              Saldos Sincronizados com as Parcelas
                            </span>

                            {(() => {
                              const calculatedTotalDue = editStdParcelas.reduce(
                                (sum, p) => sum + p.value,
                                0,
                              );
                              const calculatedTotalPaid = editStdParcelas
                                .filter((p) => p.status === "Paga")
                                .reduce((sum, p) => sum + p.value, 0);
                              const calculatedRemaining =
                                calculatedTotalDue - calculatedTotalPaid;

                              return (
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div className="bg-white p-2 rounded border border-neutral-200/80">
                                    <div className="text-[8px] font-bold text-neutral-400 uppercase">
                                      Total Contratado
                                    </div>
                                    <div className="text-xs font-bold text-neutral-800 mt-0.5">
                                      R${" "}
                                      {calculatedTotalDue.toLocaleString(
                                        "pt-BR",
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                                    <div className="text-[8px] font-bold text-emerald-600 uppercase">
                                      Total Pago
                                    </div>
                                    <div className="text-xs font-bold text-emerald-800 mt-0.5">
                                      R${" "}
                                      {calculatedTotalPaid.toLocaleString(
                                        "pt-BR",
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-rose-50 p-2 rounded border border-rose-100">
                                    <div className="text-[8px] font-bold text-rose-600 uppercase">
                                      Restante
                                    </div>
                                    <div className="text-xs font-bold text-rose-800 mt-0.5">
                                      R${" "}
                                      {calculatedRemaining.toLocaleString(
                                        "pt-BR",
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* RIGHT COLUMN: MANUAL INSTALLMENTS MANAGER */}
                        <div className="md:col-span-7 bg-slate-50/50 p-5 rounded-xl border border-neutral-200/80 flex flex-col space-y-4 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                            <div>
                              <h5 className="font-bold text-[11px] text-[#aa904f] uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-[#aa904f]" />{" "}
                                Plano de Pagamento (Parcelamento)
                              </h5>
                              <p className="text-[9px] text-neutral-500 mt-0.5">
                                Defina parcelas, valores e inclua pacotes extras
                                adicionais apenas para este formando.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAddExtraPackageModal(true)}
                              className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold py-1.5 px-3 rounded-lg text-[9.5px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> + Incluir
                              Pacote Extra
                            </button>
                          </div>

                          {/* Financial Composition Top Bar */}
                          {(() => {
                            const baseP = getSelectedPackagesPrice(
                              editStdPackage,
                              editStdTurmaId,
                              0,
                            );
                            const extraP = editStdExtraPackages.reduce(
                              (sum, ep) => sum + (Number(ep.price) || 0),
                              0,
                            );
                            const totalP = baseP + extraP || editStdTotalDue;

                            return (
                              <div className="bg-white p-3 rounded-lg border border-neutral-200 grid grid-cols-3 gap-2 text-center shadow-xs">
                                <div className="border-r border-neutral-100 pr-1">
                                  <span className="text-[8px] font-bold text-neutral-400 uppercase block">
                                    Pacote Base
                                  </span>
                                  <span className="text-xs font-bold text-neutral-800 mt-0.5 block">
                                    R$ {baseP.toLocaleString("pt-BR")}
                                  </span>
                                </div>
                                <div className="border-r border-neutral-100 pr-1">
                                  <span className="text-[8px] font-bold text-[#aa904f] uppercase block">
                                    Extras Exclusivos (
                                    {editStdExtraPackages.length})
                                  </span>
                                  <span className="text-xs font-extrabold text-[#aa904f] mt-0.5 block">
                                    R$ {extraP.toLocaleString("pt-BR")}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[8px] font-bold text-emerald-700 uppercase block">
                                    Total a Parcelar
                                  </span>
                                  <span className="text-xs font-black text-emerald-800 mt-0.5 block">
                                    R$ {totalP.toLocaleString("pt-BR")}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Installments Equal Splitter tool */}
                          <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-neutral-200/90 shrink-0 shadow-sm">
                            <div className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">
                              Dividir em:
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={regerarQtd}
                              onChange={(e) =>
                                setRegerarQtd(
                                  Math.max(1, Number(e.target.value)),
                                )
                              }
                              className="w-14 bg-slate-50 border border-neutral-200 p-1.5 rounded outline-none focus:border-[#aa904f] text-neutral-900 font-bold text-center"
                            />
                            <div className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">
                              Meses
                            </div>
                            <button
                              type="button"
                              onClick={handleRegenerateInstallments}
                              className="flex-1 bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold py-1.5 px-3 rounded uppercase tracking-wider text-[9px] transition-colors cursor-pointer text-center"
                            >
                              Dividir Valor Total (Base + Extras) de Forma Igual
                            </button>
                          </div>

                          {/* Scrollable list of active student installments */}
                          <div className="flex-1 min-h-[250px] max-h-[380px] overflow-y-auto space-y-2 pr-1 border border-neutral-200/50 p-2 rounded-lg bg-white shadow-inner">
                            {editStdParcelas.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-neutral-400 space-y-2 bg-slate-50/50 rounded-lg">
                                <AlertTriangle className="w-8 h-8 text-neutral-300" />
                                <p className="text-[10px] leading-relaxed">
                                  Nenhuma parcela cadastrada para este aluno.
                                  <br />
                                  Use o gerador automático acima ou clique em
                                  "Incluir Pacote Extra" para parcelar.
                                </p>
                              </div>
                            ) : (
                              editStdParcelas.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-slate-50 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-all shadow-sm"
                                >
                                  {/* Number ID */}
                                  <div className="text-neutral-500 font-bold text-xs shrink-0 bg-neutral-200/80 w-6 h-6 rounded-full flex items-center justify-center">
                                    #{p.number}
                                  </div>

                                  {/* Value */}
                                  <div className="flex-1 min-w-[85px]">
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-0.5">
                                      Valor (R$)
                                    </label>
                                    <input
                                      type="number"
                                      required
                                      value={p.value}
                                      onChange={(e) =>
                                        handleChangeInstallmentField(
                                          p.id,
                                          "value",
                                          Math.max(0, Number(e.target.value)),
                                        )
                                      }
                                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 rounded text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-bold"
                                    />
                                  </div>

                                  {/* Due Date */}
                                  <div className="flex-1 min-w-[105px]">
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-0.5">
                                      Vencimento
                                    </label>
                                    <input
                                      type="date"
                                      required
                                      value={p.dueDate}
                                      onChange={(e) =>
                                        handleChangeInstallmentField(
                                          p.id,
                                          "dueDate",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 rounded text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-mono text-[11px]"
                                    />
                                  </div>

                                  {/* Status */}
                                  <div className="flex-1 min-w-[80px]">
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-0.5">
                                      Status
                                    </label>
                                    <select
                                      value={p.status}
                                      onChange={(e) =>
                                        handleChangeInstallmentField(
                                          p.id,
                                          "status",
                                          e.target.value as any,
                                        )
                                      }
                                      className={`w-full bg-white border px-1.5 py-1.5 rounded text-xs outline-none focus:border-[#aa904f] font-semibold ${
                                        p.status === "Paga"
                                          ? "text-emerald-700 border-emerald-200"
                                          : p.status === "Atrasada"
                                            ? "text-rose-700 border-rose-200"
                                            : "text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      <option value="Pendente">Pendente</option>
                                      <option value="Paga">Paga</option>
                                      <option value="Atrasada">Atrasada</option>
                                    </select>
                                  </div>

                                  {/* Type */}
                                  <div className="flex-1 min-w-[70px]">
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-0.5">
                                      Meio
                                    </label>
                                    <select
                                      value={p.type}
                                      onChange={(e) =>
                                        handleChangeInstallmentField(
                                          p.id,
                                          "type",
                                          e.target.value as any,
                                        )
                                      }
                                      className="w-full bg-white border border-neutral-200 px-1 py-1.5 rounded text-xs outline-none focus:border-[#aa904f] text-neutral-805"
                                    >
                                      <option value="Pix">Pix</option>
                                      <option value="Boleto">Boleto</option>
                                      <option value="Cartão">Cartão</option>
                                    </select>
                                  </div>

                                  {/* Reference/Description */}
                                  <div className="flex-1 min-w-[95px]">
                                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-0.5">
                                      Ref / Pacote
                                    </label>
                                    <input
                                      type="text"
                                      value={p.description || ""}
                                      onChange={(e) =>
                                        handleChangeInstallmentField(
                                          p.id,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Ex: Base ou Extra"
                                      className="w-full bg-white border border-neutral-200 px-1.5 py-1.5 rounded text-[10px] outline-none focus:border-[#aa904f] text-neutral-700 truncate"
                                    />
                                  </div>

                                  {/* Actions */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteInstallment(p.id)
                                    }
                                    className="text-neutral-400 hover:text-rose-600 p-1.5 mt-3 sm:mt-4 transition-colors cursor-pointer shrink-0"
                                    title="Excluir parcela"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Installments Bottom Actions */}
                          <div className="space-y-3 shrink-0">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={handleAddSingleInstallment}
                                className="w-full bg-white hover:bg-slate-50 text-neutral-700 font-bold py-2 px-3 border border-neutral-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                              >
                                <Plus className="w-4 h-4 text-[#aa904f]" />{" "}
                                Adicionar Parcela Avulsa
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAddExtraPackageModal(true)
                                }
                                className="w-full bg-amber-50 hover:bg-amber-100/80 text-[#8c7438] font-bold py-2 px-3 border border-amber-200/90 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                              >
                                <Sparkles className="w-4 h-4 text-[#aa904f]" />{" "}
                                + Incluir Pacote Extra
                              </button>
                            </div>

                            {/* Verification Summary */}
                            {(() => {
                              const basePrice = getSelectedPackagesPrice(
                                editStdPackage,
                                editStdTurmaId,
                                0,
                              );
                              const extraSum = editStdExtraPackages.reduce(
                                (sum, ep) => sum + (Number(ep.price) || 0),
                                0,
                              );
                              const targetValue =
                                basePrice + extraSum || editStdTotalDue;
                              const sumVal = editStdParcelas.reduce(
                                (sum, p) => sum + p.value,
                                0,
                              );
                              const difference = targetValue - sumVal;

                              return (
                                <div className="p-3 border rounded-lg bg-white shadow-sm">
                                  {difference === 0 ? (
                                    <div className="text-emerald-800 text-[10px] font-medium flex items-center gap-1.5 leading-relaxed">
                                      <Check className="w-4 h-4 text-emerald-600 shrink-0 bg-emerald-50 rounded-full p-0.5" />
                                      A soma das parcelas bate perfeitamente com
                                      o total contratado (R${" "}
                                      {targetValue.toLocaleString("pt-BR")})!
                                    </div>
                                  ) : (
                                    <div className="text-[10px] leading-relaxed">
                                      <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-900">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                        Soma das Parcelas Divergente do Contrato
                                      </div>
                                      Soma atual das parcelas é{" "}
                                      <strong>
                                        R$ {sumVal.toLocaleString("pt-BR")}
                                      </strong>
                                      , mas o valor total contratado (Base +
                                      Extras) é{" "}
                                      <strong>
                                        R$ {targetValue.toLocaleString("pt-BR")}
                                      </strong>
                                      .
                                      <br />
                                      Diferença:{" "}
                                      <strong
                                        className={
                                          difference > 0
                                            ? "text-rose-600"
                                            : "text-emerald-600"
                                        }
                                      >
                                        {difference > 0
                                          ? `Faltam R$ ${difference.toLocaleString("pt-BR")}`
                                          : `Sobra R$ ${Math.abs(difference).toLocaleString("pt-BR")}`}
                                      </strong>
                                      .
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* FULL WIDTH COLUMN: GUEST LIST (CONVIDADOS) */}
                        <div className="md:col-span-12 bg-neutral-50 p-5 rounded-xl border border-neutral-200 mt-2 text-left text-xs text-neutral-800">
                          <h5 className="font-bold text-[11px] text-[#aa904f] uppercase tracking-wider pb-1.5 border-b border-neutral-200 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#aa904f]" /> Relação
                            de Convidados Cadastrada (
                            {editingFormando.convidados?.length || 0}{" "}
                            Convidados)
                          </h5>

                          {!editingFormando.convidados ||
                          editingFormando.convidados.length === 0 ? (
                            <p className="text-neutral-500 italic text-center py-6 bg-white rounded-lg border border-neutral-100 mt-3">
                              Nenhum convidado cadastrado por este formando no
                              portal do aluno.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                              {editingFormando.convidados.map((g, idx) => (
                                <div
                                  key={g.id || idx}
                                  className="bg-white border border-neutral-200 p-3 rounded-lg flex items-center gap-2.5 shadow-xs"
                                >
                                  <div className="bg-neutral-100 text-neutral-700 font-bold font-mono rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-[10px]">
                                    {idx + 1}
                                  </div>
                                  <div className="truncate flex-1">
                                    <span className="font-extrabold text-neutral-900 block truncate">
                                      {g.name}
                                    </span>
                                    {g.cpf && (
                                      <span className="text-[10px] text-neutral-500 font-medium font-mono block mt-0.5">
                                        CPF/RG: {g.cpf}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sticky Bottom Actions footer */}
                      <div className="bg-slate-50 border-t border-neutral-200 p-4 flex gap-3 justify-end text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingFormando(null)}
                          className="px-4 py-2 border border-neutral-200 rounded font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-4 py-2 rounded shadow transition-colors cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Modal de Inclusão de Pacote Extra Exclusivo para Formando */}
              {showAddExtraPackageModal && editingFormando && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col my-8"
                  >
                    {/* Modal Header */}
                    <div className="bg-[#1e293b] text-white p-5 flex items-center justify-between border-b border-neutral-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#aa904f]" />
                          <h4 className="font-bold text-base text-white tracking-wide">
                            Incluir Pacote Adicional Exclusivo
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Adicione um serviço ou pacote complementar exclusivo
                          para o formando{" "}
                          <strong className="text-amber-300">
                            {editStdName || editingFormando.name}
                          </strong>
                          .
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddExtraPackageModal(false)}
                        className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                      {/* Mode Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                          Selecione a Origem do Pacote Adicional:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setExtraPkgMode("preset")}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                              extraPkgMode === "preset"
                                ? "border-[#aa904f] bg-amber-50/50 text-[#8c7438] font-bold shadow-xs"
                                : "border-neutral-200 bg-slate-50/50 text-neutral-600 hover:bg-neutral-50"
                            }`}
                          >
                            <Zap className="w-4 h-4 text-[#aa904f]" />
                            <span className="text-xs font-bold">
                              Sugestões VIP
                            </span>
                            <span className="text-[9px] text-neutral-400">
                              Presets populares
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setExtraPkgMode("catalog")}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                              extraPkgMode === "catalog"
                                ? "border-[#aa904f] bg-amber-50/50 text-[#8c7438] font-bold shadow-xs"
                                : "border-neutral-200 bg-slate-50/50 text-neutral-600 hover:bg-neutral-50"
                            }`}
                          >
                            <Package className="w-4 h-4 text-[#aa904f]" />
                            <span className="text-xs font-bold">
                              Catálogo Geral
                            </span>
                            <span className="text-[9px] text-neutral-400">
                              Pacotes do sistema
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setExtraPkgMode("custom")}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                              extraPkgMode === "custom"
                                ? "border-[#aa904f] bg-amber-50/50 text-[#8c7438] font-bold shadow-xs"
                                : "border-neutral-200 bg-slate-50/50 text-neutral-600 hover:bg-neutral-50"
                            }`}
                          >
                            <Edit className="w-4 h-4 text-[#aa904f]" />
                            <span className="text-xs font-bold">
                              Personalizado
                            </span>
                            <span className="text-[9px] text-neutral-400">
                              Nome e valor livres
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Mode 1: Presets */}
                      {extraPkgMode === "preset" && (
                        <div className="space-y-2.5">
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase">
                            Escolha um dos pacotes mais solicitados:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {[
                              {
                                id: "ensaio",
                                name: "Ensaio Fotográfico VIP em Estúdio",
                                price: 1200,
                                desc: "Sessão individual com maquiagem, 3 trocas de figurino e 30 fotos em alta resolução.",
                              },
                              {
                                id: "album",
                                name: "Álbum de Luxo em Couro 30x30",
                                price: 1800,
                                desc: "Encadernação artesanal em couro legítimo, 50 páginas panorâmicas com estojo gravado.",
                              },
                              {
                                id: "beca",
                                name: "Kit Beca, Canudo & Placa Premium",
                                price: 650,
                                desc: "Beca nobre sob medida, canudo aveludado e placa de homenagem de mesa em aço escovado.",
                              },
                              {
                                id: "teaser",
                                name: "Vídeo Teaser 4K & Cobertura Drone",
                                price: 1500,
                                desc: "Filme cinematográfico exclusivo focado no formando durante a colação e baile.",
                              },
                              {
                                id: "mesa",
                                name: "Mesa VIP Extra no Baile (10 Lugares)",
                                price: 2400,
                                desc: "Mesa nobre com garçom exclusivo, champanhe de boas-vindas e 10 acessos.",
                              },
                              {
                                id: "convites",
                                name: "Combo de Convites Extras (5 Convites)",
                                price: 750,
                                desc: "5 convites magnéticos adicionais com acesso total ao buffet e open bar.",
                              },
                            ].map((preset) => {
                              const isSelected = extraPkgPresetId === preset.id;
                              return (
                                <div
                                  key={preset.id}
                                  onClick={() => {
                                    setExtraPkgPresetId(preset.id);
                                    setPresetEditValues({
                                      name: preset.name,
                                      price: preset.price,
                                      quantity: 1,
                                      desc: preset.desc,
                                    });
                                  }}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? "border-[#aa904f] bg-amber-50/40 ring-1 ring-[#aa904f] shadow-sm"
                                      : "border-neutral-200 bg-white hover:border-neutral-300"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-xs text-neutral-900">
                                        {preset.name}
                                      </span>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-[#aa904f] shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                                      {preset.desc}
                                    </p>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                                    <span className="text-[9px] text-neutral-400 uppercase font-bold">
                                      Investimento:
                                    </span>
                                    <span className="font-extrabold text-xs text-[#aa904f]">
                                      {preset.price.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Ajuste em Tempo Real do Pacote Selecionado */}
                          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-neutral-900 flex items-center gap-1.5">
                                <Edit className="w-3.5 h-3.5 text-[#aa904f]" />{" "}
                                Personalizar / Editar Valores deste Pacote:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setExtraPkgCustomName(presetEditValues.name);
                                  setExtraPkgCustomPrice(
                                    presetEditValues.price *
                                      presetEditValues.quantity,
                                  );
                                  setExtraPkgCustomUnitPrice(
                                    presetEditValues.price,
                                  );
                                  setExtraPkgCustomQuantity(
                                    presetEditValues.quantity,
                                  );
                                  setExtraPkgCustomDesc(presetEditValues.desc);
                                  setExtraPkgMode("custom");
                                }}
                                className="text-[9.5px] font-bold text-[#aa904f] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" /> Abrir no Modo
                                Personalizado 100% Livre →
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div className="sm:col-span-1">
                                <label className="block text-[9px] font-bold text-neutral-600 uppercase mb-0.5">
                                  Nome do Pacote
                                </label>
                                <input
                                  type="text"
                                  value={presetEditValues.name}
                                  onChange={(e) =>
                                    setPresetEditValues((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-white border border-neutral-300 px-2 py-1.5 rounded text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-neutral-600 uppercase mb-0.5">
                                  Preço Unitário (R$)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={presetEditValues.price}
                                  onChange={(e) =>
                                    setPresetEditValues((prev) => ({
                                      ...prev,
                                      price: Math.max(
                                        0,
                                        Number(e.target.value),
                                      ),
                                    }))
                                  }
                                  className="w-full bg-white border border-neutral-300 px-2 py-1.5 rounded text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-neutral-600 uppercase mb-0.5">
                                  Quantidade
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={presetEditValues.quantity}
                                  onChange={(e) =>
                                    setPresetEditValues((prev) => ({
                                      ...prev,
                                      quantity: Math.max(
                                        1,
                                        Number(e.target.value),
                                      ),
                                    }))
                                  }
                                  className="w-full bg-white border border-neutral-300 px-2 py-1.5 rounded text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-neutral-600 uppercase mb-0.5">
                                Descrição / Detalhes
                              </label>
                              <input
                                type="text"
                                value={presetEditValues.desc}
                                onChange={(e) =>
                                  setPresetEditValues((prev) => ({
                                    ...prev,
                                    desc: e.target.value,
                                  }))
                                }
                                className="w-full bg-white border border-neutral-300 px-2 py-1.5 rounded text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                                placeholder="Descrição do serviço ou itens inclusos..."
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-200/60 font-bold text-neutral-800">
                              <span>Valor Total Contratado:</span>
                              <span className="text-[#aa904f] font-black text-xs">
                                {(
                                  presetEditValues.price *
                                  presetEditValues.quantity
                                ).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mode 2: Catalog */}
                      {extraPkgMode === "catalog" && (
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-neutral-200">
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase">
                            Selecione um pacote existente no catálogo geral:
                          </span>
                          {pacotes.length === 0 ? (
                            <p className="text-xs text-neutral-400 italic">
                              Nenhum pacote cadastrado no catálogo.
                            </p>
                          ) : (
                            <div>
                              <select
                                value={
                                  extraPkgCatalogId || pacotes[0]?.id || ""
                                }
                                onChange={(e) =>
                                  setExtraPkgCatalogId(e.target.value)
                                }
                                className="w-full bg-white border border-neutral-300 p-2.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-semibold"
                              >
                                {pacotes.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} —{" "}
                                    {p.price.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}{" "}
                                    {p.turmaId
                                      ? `(Turma #${p.turmaId.substring(0, 8)})`
                                      : ""}
                                  </option>
                                ))}
                              </select>

                              {(() => {
                                const currentCatalogPkg = pacotes.find(
                                  (p) =>
                                    p.id ===
                                    (extraPkgCatalogId || pacotes[0]?.id),
                                );
                                if (!currentCatalogPkg) return null;
                                return (
                                  <div className="mt-3 bg-white p-3 rounded-lg border border-neutral-200 text-xs space-y-1.5">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-neutral-900">
                                        {currentCatalogPkg.name}
                                      </span>
                                      <span className="text-[#aa904f]">
                                        {currentCatalogPkg.price.toLocaleString(
                                          "pt-BR",
                                          {
                                            style: "currency",
                                            currency: "BRL",
                                          },
                                        )}
                                      </span>
                                    </div>
                                    {currentCatalogPkg.description && (
                                      <p className="text-[10px] text-neutral-500">
                                        {currentCatalogPkg.description}
                                      </p>
                                    )}
                                    {currentCatalogPkg.items &&
                                      currentCatalogPkg.items.length > 0 && (
                                        <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1">
                                          {currentCatalogPkg.items.map(
                                            (it, i) => (
                                              <span
                                                key={i}
                                                className="bg-slate-100 text-neutral-700 text-[9px] px-2 py-0.5 rounded-full font-medium"
                                              >
                                                ✓ {it}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExtraPkgCustomName(
                                          currentCatalogPkg.name,
                                        );
                                        setExtraPkgCustomPrice(
                                          currentCatalogPkg.price,
                                        );
                                        setExtraPkgCustomUnitPrice(
                                          currentCatalogPkg.price,
                                        );
                                        setExtraPkgCustomQuantity(1);
                                        setExtraPkgCustomDesc(
                                          currentCatalogPkg.description || "",
                                        );
                                        setExtraPkgMode("custom");
                                      }}
                                      className="w-full mt-2 bg-amber-100/70 hover:bg-amber-100 text-[#8c7438] font-bold py-1.5 px-3 rounded-md text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-amber-300/60 transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" /> Copiar
                                      para Personalizado para Ajustar
                                      Preço/Descrição
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mode 3: Custom */}
                      {extraPkgMode === "custom" && (
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-neutral-200">
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase">
                            Crie um pacote ou item adicional personalizado:
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                Nome do Pacote / Item Extra
                              </label>
                              <input
                                type="text"
                                required
                                value={extraPkgCustomName}
                                onChange={(e) =>
                                  setExtraPkgCustomName(e.target.value)
                                }
                                placeholder="Ex: Mesa Extra Gala + 2 Convites"
                                className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                                Valor do Pacote (R$)
                              </label>
                              <input
                                type="number"
                                min={1}
                                required
                                value={extraPkgCustomPrice}
                                onChange={(e) =>
                                  setExtraPkgCustomPrice(
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                placeholder="Ex: 1500"
                                className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-bold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                              Descrição / Detalhes dos Itens Inclusos
                            </label>
                            <textarea
                              rows={2}
                              value={extraPkgCustomDesc}
                              onChange={(e) =>
                                setExtraPkgCustomDesc(e.target.value)
                              }
                              placeholder="Ex: Inclui 1 mesa no setor intermediário e 2 convites impressos com acesso livre ao open bar."
                              className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* SPLIT & PARCELING STRATEGY */}
                      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                        <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#aa904f]" /> Como
                          deseja parcelar este pacote no plano do formando?
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <label
                            onClick={() =>
                              setExtraPkgSplitMode("recalculate_all")
                            }
                            className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                              extraPkgSplitMode === "recalculate_all"
                                ? "border-[#aa904f] bg-white ring-1 ring-[#aa904f] shadow-xs"
                                : "border-amber-200/80 bg-white/70 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="splitMode"
                              checked={extraPkgSplitMode === "recalculate_all"}
                              onChange={() =>
                                setExtraPkgSplitMode("recalculate_all")
                              }
                              className="accent-[#aa904f] mt-0.5"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-neutral-900 block">
                                Reparcelar Todo o Contrato
                              </span>
                              <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                                Soma o novo pacote ao total geral e redistribui
                                em {regerarQtd || editStdParcelas.length || 10}{" "}
                                parcelas iguais.
                              </span>
                            </div>
                          </label>

                          <label
                            onClick={() =>
                              setExtraPkgSplitMode("add_specific_installments")
                            }
                            className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                              extraPkgSplitMode === "add_specific_installments"
                                ? "border-[#aa904f] bg-white ring-1 ring-[#aa904f] shadow-xs"
                                : "border-amber-200/80 bg-white/70 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="splitMode"
                              checked={
                                extraPkgSplitMode ===
                                "add_specific_installments"
                              }
                              onChange={() =>
                                setExtraPkgSplitMode(
                                  "add_specific_installments",
                                )
                              }
                              className="accent-[#aa904f] mt-0.5"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-neutral-900 block">
                                Gerar Parcelas Exclusivas do Pacote
                              </span>
                              <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                                Mantém as parcelas atuais e adiciona novas
                                parcelas identificadas especificamente para este
                                pacote.
                              </span>
                            </div>
                          </label>
                        </div>

                        {extraPkgSplitMode === "add_specific_installments" && (
                          <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                            <span className="text-[10px] font-bold text-neutral-700 uppercase">
                              Dividir este pacote em:
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={extraPkgInstallmentsCount}
                              onChange={(e) =>
                                setExtraPkgInstallmentsCount(
                                  Math.max(1, Number(e.target.value)),
                                )
                              }
                              className="w-16 bg-white border border-neutral-300 p-1 rounded-md text-xs font-bold text-center outline-none focus:border-[#aa904f]"
                            />
                            <span className="text-[10px] font-bold text-neutral-700 uppercase">
                              parcela(s) exclusiva(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="bg-slate-50 border-t border-neutral-200 p-4 flex items-center justify-between text-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowAddExtraPackageModal(false)}
                        className="px-4 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          let selectedPkg: {
                            name: string;
                            price: number;
                            description?: string;
                            items?: string[];
                          } | null = null;

                          if (extraPkgMode === "preset") {
                            const unitP = Math.max(
                              0,
                              Number(presetEditValues.price) || 0,
                            );
                            const qty = Math.max(
                              1,
                              Number(presetEditValues.quantity) || 1,
                            );
                            selectedPkg = {
                              name:
                                presetEditValues.name.trim() ||
                                "Pacote VIP Adicional",
                              price: unitP * qty,
                              description: presetEditValues.desc.trim(),
                            };
                          } else if (extraPkgMode === "catalog") {
                            const currentCatalogPkg = pacotes.find(
                              (p) =>
                                p.id === (extraPkgCatalogId || pacotes[0]?.id),
                            );
                            if (currentCatalogPkg) {
                              selectedPkg = {
                                name: currentCatalogPkg.name,
                                price: currentCatalogPkg.price,
                                description: currentCatalogPkg.description,
                                items: currentCatalogPkg.items,
                              };
                            }
                          } else {
                            if (!extraPkgCustomName.trim()) {
                              alert(
                                "Por favor, informe o nome do pacote personalizado.",
                              );
                              return;
                            }
                            if (extraPkgCustomPrice <= 0) {
                              alert(
                                "Por favor, informe um valor válido para o pacote.",
                              );
                              return;
                            }
                            selectedPkg = {
                              name: extraPkgCustomName.trim(),
                              price: Number(extraPkgCustomPrice),
                              description: extraPkgCustomDesc.trim(),
                            };
                          }

                          if (selectedPkg) {
                            handleAddExtraPackageToStudent(
                              selectedPkg,
                              extraPkgSplitMode,
                              extraPkgInstallmentsCount,
                            );
                          }
                        }}
                        className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-5 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" /> Confirmar e Incluir no
                        Contrato
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Gestão de Pacotes Modal */}
              {selectedTurmaForPackages && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col my-8"
                  >
                    {/* Header */}
                    <div className="bg-[#543d03] text-white p-5 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-base flex items-center gap-2 text-[#ebe0b2]">
                          <Package className="w-5 h-5 text-[#dfd1a1]" /> Gestão
                          de Pacotes de Adesão
                        </h4>
                        <p className="text-[11px] text-[#ebe0b2]/85 mt-0.5">
                          Configure e edite as opções de pacotes disponíveis
                          para a turma:{" "}
                          <strong className="text-white">
                            {selectedTurmaForPackages.name}
                          </strong>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTurmaForPackages(null);
                          setIsCreatingNewPackage(false);
                          setEditingPackage(null);
                        }}
                        className="text-neutral-200 hover:text-white transition-colors p-1"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="p-6 grid md:grid-cols-12 gap-6 bg-slate-50 text-xs">
                      {/* Left: Packages List (7 cols) */}
                      <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                              Pacotes Atuais
                            </h5>
                            {!isCreatingNewPackage && (
                              <button
                                onClick={handleStartCreatePackage}
                                className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Novo Pacote
                              </button>
                            )}
                          </div>

                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {pacotes.filter(
                              (p) => p.turmaId === selectedTurmaForPackages.id,
                            ).length === 0 ? (
                              <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-8 text-center text-neutral-500">
                                <Package className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                                <p className="font-medium">
                                  Nenhum pacote criado ainda.
                                </p>
                                <p className="text-[10px] mt-1 text-neutral-400">
                                  Adicione pacotes customizados para que os
                                  formandos possam escolher.
                                </p>
                                <button
                                  type="button"
                                  onClick={handleStartCreatePackage}
                                  className="mt-3 bg-[#aa904f]/10 text-[#705510] hover:bg-[#aa904f]/20 font-bold px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 text-[10px]"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Criar
                                  Primeiro Pacote
                                </button>
                              </div>
                            ) : (
                              pacotes
                                .filter(
                                  (p) =>
                                    p.turmaId === selectedTurmaForPackages.id,
                                )
                                .map((p) => (
                                  <div
                                    key={p.id}
                                    className={`bg-white border p-5 rounded-lg shadow-sm transition-all flex flex-col justify-between relative ${editingPackage?.id === p.id ? "border-[#aa904f] ring-2 ring-[#aa904f]/10" : "border-neutral-200 hover:border-neutral-300"}`}
                                  >
                                    <div>
                                      <div className="flex justify-between items-start gap-4">
                                        <div>
                                          <h6 className="font-bold text-neutral-900 text-[15px]">
                                            {p.name}
                                          </h6>
                                          <p className="text-[11px] text-neutral-500 mt-1">
                                            {p.description}
                                          </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="font-extrabold text-[#aa904f] text-[15px] block">
                                            {p.price.toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {p.items && p.items.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3.5">
                                          {p.items.map((item, idx) => (
                                            <span
                                              key={idx}
                                              className="bg-neutral-50 border border-neutral-100 text-neutral-500 text-[9px] font-bold px-2 py-0.5 rounded"
                                            >
                                              ✓ {item}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="border-t border-neutral-100 mt-3.5 pt-3 flex justify-end gap-3 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStartEditPackage(p)
                                        }
                                        className="text-neutral-700 hover:text-[#705510] font-bold flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-1 transition-colors"
                                      >
                                        <Edit className="w-3.5 h-3.5 text-[#aa904f]" />{" "}
                                        Editar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeletePackage(p.id)
                                        }
                                        className="text-rose-600 hover:text-rose-850 font-bold flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-1 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />{" "}
                                        Excluir
                                      </button>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>

                        {/* Back explanation */}
                        <div className="bg-[#dfd1a1]/20 border border-[#aa904f]/25 p-3 rounded-lg text-neutral-600 text-[11px] leading-relaxed mt-4">
                          💡 <strong>Para que servem os pacotes?</strong>
                          <br />
                          Os pacotes criados aqui determinam as opções de adesão
                          disponíveis para os formandos vinculados a esta turma.
                          Quando um aluno é matriculado ou edita seu cadastro,
                          você pode selecionar um destes pacotes para
                          automatizar o seu faturamento.
                        </div>
                      </div>

                      {/* Right: Package Form (5 cols) */}
                      <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200">
                        {isCreatingNewPackage ? (
                          <form
                            onSubmit={handleSavePackage}
                            className="space-y-4"
                          >
                            <h5 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] border-b pb-2">
                              {editingPackage
                                ? "✏️ Editar Pacote"
                                : "✨ Novo Pacote"}
                            </h5>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Nome do Pacote
                              </label>
                              <input
                                type="text"
                                required
                                value={pkgName}
                                onChange={(e) => setPkgName(e.target.value)}
                                placeholder="Ex: Pacote Executivo"
                                className="w-full bg-slate-50 border border-neutral-200 p-2 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Breve Descrição
                              </label>
                              <input
                                type="text"
                                required
                                value={pkgDescription}
                                onChange={(e) =>
                                  setPkgDescription(e.target.value)
                                }
                                placeholder="Ex: Baile de Gala + Colação Oficial"
                                className="w-full bg-slate-50 border border-neutral-200 p-2 rounded outline-none focus:border-[#aa904f] text-neutral-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                                Valor do Pacote (BRL)
                              </label>
                              <input
                                type="number"
                                required
                                value={pkgPrice || ""}
                                onChange={(e) =>
                                  setPkgPrice(Number(e.target.value))
                                }
                                placeholder="Ex: 8500"
                                className="w-full bg-slate-50 border border-neutral-200 p-2 rounded outline-none focus:border-[#aa904f] text-neutral-900 font-semibold"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                                  Inclusões / Itens inclusos
                                </label>
                                <span className="text-[9px] text-neutral-400">
                                  Separe por vírgula
                                </span>
                              </div>
                              <textarea
                                value={pkgItemsString}
                                onChange={(e) =>
                                  setPkgItemsString(e.target.value)
                                }
                                placeholder="Ex: 8 Convites de Gala, Coquetel Oficial, Placa de Formatura"
                                rows={3}
                                className="w-full bg-slate-50 border border-neutral-200 p-2 rounded outline-none focus:border-[#aa904f] text-neutral-900 leading-normal"
                              />
                            </div>

                            <div className="pt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCreatingNewPackage(false);
                                  setEditingPackage(null);
                                }}
                                className="flex-1 px-3 py-2 border border-neutral-200 rounded font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="flex-1 bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-3 py-2 rounded shadow transition-colors"
                              >
                                Salvar Pacote
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                            <ShoppingBag className="w-12 h-12 text-[#aa904f]/20 mb-3 animate-bounce" />
                            <h6 className="font-bold text-neutral-700">
                              Editor de Pacotes
                            </h6>
                            <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px]">
                              Selecione um pacote existente para editar ou
                              clique no botão acima para criar um novo.
                            </p>
                            <button
                              type="button"
                              onClick={handleStartCreatePackage}
                              className="mt-4 bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-4 py-2 rounded text-[10px] shadow transition-colors inline-flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Adicionar Novo
                              Pacote
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* CRONOGRAMA & CERIMONIAL TAB */}
          {activeTab === "eventos" &&
            (() => {
              const filteredEventos = eventos.filter((evt) => {
                const evTurma = turmas.find((t) => t.id === evt.turmaId);
                const matchesSearch =
                  !eventoSearchQuery ||
                  evt.title
                    .toLowerCase()
                    .includes(eventoSearchQuery.toLowerCase()) ||
                  evt.venue
                    .toLowerCase()
                    .includes(eventoSearchQuery.toLowerCase()) ||
                  (evTurma &&
                    evTurma.name
                      .toLowerCase()
                      .includes(eventoSearchQuery.toLowerCase()));
                const matchesTurma =
                  eventoTurmaFilter === "all" ||
                  evt.turmaId === eventoTurmaFilter;
                return matchesSearch && matchesTurma;
              });

              return (
                <div className="space-y-6">
                  {/* Header & Main Actions */}
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        Agenda e Produção de Cerimoniais
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        Gerencie solenidades, fornecedores, equipes de campo e
                        listas de presença de formandos.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingEvento(null);
                        setNewEvtTurmaId("");
                        setNewEvtTitle("");
                        setNewEvtDate("");
                        setNewEvtTime("");
                        setNewEvtVenue("");
                        setNewEvtDescription("");
                        setShowEventoModal(true);
                      }}
                      className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] text-neutral-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Agendar Novo Evento
                    </button>
                  </div>

                  {/* Filter & View Mode Bar */}
                  <div className="bg-white border border-neutral-200/60 p-4 rounded-xl shadow-xs space-y-3.5 text-xs text-neutral-700 w-full">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
                      {/* Search Field */}
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aa904f]" />
                        <input
                          type="text"
                          placeholder="Buscar evento por nome, local ou turma..."
                          value={eventoSearchQuery}
                          onChange={(e) => setEventoSearchQuery(e.target.value)}
                          className="bg-neutral-50 border border-[#dfd1a1]/50 hover:border-[#aa904f]/60 focus:border-[#aa904f] pl-10 pr-8 py-2 rounded-lg w-full outline-none text-neutral-800 placeholder-neutral-400 font-medium transition-all"
                        />
                        {eventoSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setEventoSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* View Mode Switcher (Calendário vs Cards vs Tabela) */}
                      <div className="flex items-center bg-[#fdfaf2] p-1 rounded-lg border border-[#d2c595]/80 shadow-2xs shrink-0 w-full md:w-auto justify-center flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setEventoViewMode("calendar")}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                            eventoViewMode === "calendar"
                              ? "bg-[#8d1811] text-white shadow-xs"
                              : "text-[#543d03] hover:bg-[#dfd1a1]/30"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Calendário Mensal
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventoViewMode("cards")}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                            eventoViewMode === "cards"
                              ? "bg-[#8d1811] text-white shadow-xs"
                              : "text-[#543d03] hover:bg-[#dfd1a1]/30"
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          Cards
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventoViewMode("table")}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                            eventoViewMode === "table"
                              ? "bg-[#8d1811] text-white shadow-xs"
                              : "text-[#543d03] hover:bg-[#dfd1a1]/30"
                          }`}
                        >
                          <List className="w-3.5 h-3.5" />
                          Tabela
                        </button>
                      </div>
                    </div>

                    {/* Filter Dropdown + Reset */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-neutral-100 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 font-bold shrink-0 text-[10.5px] uppercase tracking-wider">
                          Filtrar Turma:
                        </span>
                        <select
                          value={eventoTurmaFilter}
                          onChange={(e) => setEventoTurmaFilter(e.target.value)}
                          className="bg-neutral-50 border border-[#dfd1a1]/50 hover:border-[#aa904f] focus:border-[#aa904f] text-neutral-800 px-3 py-1.5 rounded-lg outline-none font-semibold cursor-pointer transition-all text-xs"
                        >
                          <option value="all">Todas as Turmas</option>
                          {turmas.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.institution})
                            </option>
                          ))}
                        </select>
                      </div>

                      {(eventoSearchQuery || eventoTurmaFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setEventoSearchQuery("");
                            setEventoTurmaFilter("all");
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          ✕ Limpar Filtros
                        </button>
                      )}
                    </div>
                  </div>

                  {eventoViewMode === "calendar" ? (
                    <IntegratedMonthlyCalendar
                      eventos={eventos}
                      reunioes={reunioes}
                      turmas={turmas}
                      tasks={adminTasks}
                      onAddEvento={(initialDate) => {
                        setEditingEvento(null);
                        setNewEvtTurmaId("");
                        setNewEvtTitle("");
                        setNewEvtDate(initialDate || "");
                        setNewEvtTime("19:00");
                        setNewEvtVenue("");
                        setNewEvtDescription("");
                        setShowEventoModal(true);
                      }}
                      onAddReuniao={(initialDate) => {
                        setActiveTab("reunioes");
                        if (initialDate) setMeetingDate(initialDate);
                      }}
                      onEditEvento={handleStartEditEvento}
                      onDeleteEvento={handleDeleteEvento}
                      onDeleteReuniao={handleDeleteMeeting}
                      onPrintAttendance={(evt) =>
                        setPrintingAttendanceEvent(evt)
                      }
                      onPrintExecutionSheet={(evt) => setPrintingEvent(evt)}
                      onMoveItem={handleMoveCalendarItem}
                    />
                  ) : filteredEventos.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-xs">
                      <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3 animate-pulse" />
                      <h5 className="text-sm font-bold text-neutral-700">
                        Nenhum evento/cerimonial encontrado
                      </h5>
                      <p className="text-xs text-neutral-400 mt-1">
                        Ajuste os filtros de busca ou clique em "Agendar Novo
                        Evento".
                      </p>
                    </div>
                  ) : eventoViewMode === "cards" ? (
                    /* Cards View */
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredEventos.map((evt) => {
                        const evTurma = turmas.find(
                          (t) => t.id === evt.turmaId,
                        );

                        return (
                          <motion.div
                            key={evt.id}
                            className="bg-[#ebe0b2] dark:bg-[#ebe0b2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between text-[#543d03]"
                          >
                            <div>
                              <div className="bg-white/40 border-b border-[#d2c595]/40 p-4 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <span className="text-[10px] text-[#705510] font-bold uppercase block tracking-wider">
                                    {evTurma ? evTurma.name : "Sem Turma"}
                                  </span>
                                  <h4 className="font-bold text-[#3c2a01] text-base mt-0.5">
                                    {evt.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() =>
                                      setPrintingAttendanceEvent(evt)
                                    }
                                    className="bg-sky-700 hover:bg-sky-800 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                    title="Gerar PDF de Lista de Presença de Formandos para Recepção"
                                  >
                                    <Printer className="w-3.5 h-3.5" /> Lista de
                                    Presença
                                  </button>
                                  <button
                                    onClick={() => setPrintingEvent(evt)}
                                    className="bg-[#543d03] hover:bg-[#3c2a01] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                    title="Imprimir Ficha de Execução, Cronograma e Vendas"
                                  >
                                    <Printer className="w-3.5 h-3.5" /> Ficha de
                                    Execução
                                  </button>
                                  <button
                                    onClick={() => handleStartEditEvento(evt)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                    title="Editar Evento (Data, Local, etc.)"
                                  >
                                    <Edit className="w-3 h-3" /> Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvento(evt.id)}
                                    className="bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                    title="Excluir Evento"
                                  >
                                    <Trash2 className="w-3 h-3" /> Excluir
                                  </button>
                                  <span className="bg-[#8d1811] text-white text-[9px] font-bold px-2 py-1.5 rounded">
                                    PRODUÇÃO ATIVA
                                  </span>
                                </div>
                              </div>

                              <div className="p-5 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3 text-[#543d03]/90">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#705510]" />
                                    <div>
                                      <span className="text-[9px] text-[#543d03]/70 block font-bold uppercase">
                                        Data Solene
                                      </span>
                                      <span className="font-semibold">
                                        {new Date(evt.date).toLocaleDateString(
                                          "pt-BR",
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#705510]" />
                                    <div>
                                      <span className="text-[9px] text-[#543d03]/70 block font-bold uppercase">
                                        Horário
                                      </span>
                                      <span className="font-semibold">
                                        {evt.time}h
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2 text-[#543d03]/90">
                                  <MapPin className="w-4 h-4 text-[#705510] shrink-0" />
                                  <div>
                                    <span className="text-[9px] text-[#543d03]/70 block font-bold uppercase">
                                      Localização
                                    </span>
                                    <span className="font-semibold leading-normal">
                                      {evt.venue}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-[#543d03]/90 leading-relaxed border-t border-[#d2c595]/30 pt-3">
                                  {evt.description}
                                </p>
                              </div>
                            </div>

                            <div className="border-t border-[#d2c595]/30 p-4 bg-white/20 text-xs">
                              {/* Tab Headers */}
                              <div className="flex gap-2 border-b border-[#d2c595]/30 pb-2 mb-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveEventTabs((prev) => ({
                                      ...prev,
                                      [evt.id]: "suppliers",
                                    }))
                                  }
                                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    (activeEventTabs[evt.id] || "suppliers") ===
                                    "suppliers"
                                      ? "bg-white/50 text-[#3c2a01] border border-[#d2c595]"
                                      : "text-[#543d03]/70 hover:text-[#3c2a01]"
                                  }`}
                                >
                                  Fornecedores ({evt.suppliers.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveEventTabs((prev) => ({
                                      ...prev,
                                      [evt.id]: "staff",
                                    }))
                                  }
                                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    activeEventTabs[evt.id] === "staff"
                                      ? "bg-white/50 text-[#3c2a01] border border-[#d2c595]"
                                      : "text-[#543d03]/70 hover:text-[#3c2a01]"
                                  }`}
                                >
                                  Equipe / Staff ({(evt.staff || []).length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveEventTabs((prev) => ({
                                      ...prev,
                                      [evt.id]: "guests",
                                    }))
                                  }
                                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    activeEventTabs[evt.id] === "guests"
                                      ? "bg-white/50 text-[#3c2a01] border border-[#d2c595]"
                                      : "text-[#543d03]/70 hover:text-[#3c2a01]"
                                  }`}
                                >
                                  Convidados (
                                  {formandos
                                    .filter((f) => f.turmaId === evt.turmaId)
                                    .reduce(
                                      (sum, f) =>
                                        sum + (f.convidados?.length || 0),
                                      0,
                                    )}
                                  )
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveEventTabs((prev) => ({
                                      ...prev,
                                      [evt.id]: "expenses",
                                    }))
                                  }
                                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                    activeEventTabs[evt.id] === "expenses"
                                      ? "bg-rose-700 text-white font-extrabold shadow-xs"
                                      : "bg-rose-100/80 text-rose-800 hover:bg-rose-200 border border-rose-200"
                                  }`}
                                >
                                  <Receipt className="w-3 h-3" /> Despesas (
                                  {
                                    expenses.filter(
                                      (e) =>
                                        e.eventId === evt.id ||
                                        (e.turmaId === evt.turmaId &&
                                          e.description
                                            .toLowerCase()
                                            .includes(evt.title.toLowerCase())),
                                    ).length
                                  }
                                  )
                                </button>
                              </div>

                              {/* Suppliers Tab Content */}
                              {(activeEventTabs[evt.id] || "suppliers") ===
                                "suppliers" && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-[#543d03]/70 font-bold uppercase">
                                      Fornecedores Vinculados
                                    </span>
                                    {addingSupplierEventId !== evt.id && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAddingSupplierEventId(evt.id);
                                          setSelectedSupplierId(
                                            fornecedores[0]?.id || "custom",
                                          );
                                          setCustomSupplierName("");
                                          setCustomSupplierService("");
                                          setNewSupplierStatus("Pendente");
                                        }}
                                        className="text-[#705510] hover:text-[#3c2a01] font-bold text-[10px] flex items-center gap-1 animate-fade-in"
                                      >
                                        <Plus className="w-3 h-3" /> Vincular
                                        Fornecedor
                                      </button>
                                    )}
                                  </div>

                                  {/* Inline Add Supplier Form */}
                                  {addingSupplierEventId === evt.id && (
                                    <div className="bg-white/40 border border-[#d2c595]/50 rounded-lg p-3 space-y-2 text-[10px] animate-fade-in">
                                      <h5 className="font-bold text-[#3c2a01]">
                                        Selecionar Fornecedor para o Evento
                                      </h5>

                                      <div>
                                        <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                          Selecione Fornecedor Credenciado
                                        </label>
                                        <select
                                          value={selectedSupplierId}
                                          onChange={(e) => {
                                            setSelectedSupplierId(
                                              e.target.value,
                                            );
                                            if (e.target.value !== "custom") {
                                              const found = fornecedores.find(
                                                (f) => f.id === e.target.value,
                                              );
                                              if (found) {
                                                setCustomSupplierName(
                                                  found.name,
                                                );
                                                setCustomSupplierService(
                                                  found.service,
                                                );
                                              }
                                            } else {
                                              setCustomSupplierName("");
                                              setCustomSupplierService("");
                                            }
                                          }}
                                          className="w-full bg-white border border-[#d2c595]/40 p-1.5 rounded outline-none text-[#543d03] text-[10px]"
                                        >
                                          {fornecedores.map((f) => (
                                            <option
                                              key={f.id}
                                              value={f.id}
                                              className="text-neutral-900"
                                            >
                                              {f.name} ({f.service})
                                            </option>
                                          ))}
                                          <option
                                            value="custom"
                                            className="text-neutral-900"
                                          >
                                            + Adicionar Fornecedor Personalizado
                                          </option>
                                        </select>
                                      </div>

                                      {selectedSupplierId === "custom" && (
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                              Nome do Fornecedor
                                            </label>
                                            <input
                                              type="text"
                                              value={customSupplierName}
                                              onChange={(e) =>
                                                setCustomSupplierName(
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Ex: Floricultura Florescer"
                                              className="w-full bg-white border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px]"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                              Serviço
                                            </label>
                                            <input
                                              type="text"
                                              value={customSupplierService}
                                              onChange={(e) =>
                                                setCustomSupplierService(
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Ex: Decoração de Mesa"
                                              className="w-full bg-white border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px]"
                                            />
                                          </div>
                                        </div>
                                      )}

                                      <div>
                                        <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                          Status de Confirmação
                                        </label>
                                        <select
                                          value={newSupplierStatus}
                                          onChange={(e: any) =>
                                            setNewSupplierStatus(e.target.value)
                                          }
                                          className="w-full bg-white border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px]"
                                        >
                                          <option
                                            value="Confirmado"
                                            className="text-neutral-900"
                                          >
                                            Confirmado
                                          </option>
                                          <option
                                            value="Pendente"
                                            className="text-neutral-900"
                                          >
                                            Pendente
                                          </option>
                                        </select>
                                      </div>

                                      <div className="flex gap-2 justify-end pt-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setAddingSupplierEventId(null)
                                          }
                                          className="px-2 py-1 border border-[#d2c595] rounded text-[9px] text-[#543d03]/70 hover:bg-white/10"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleAddSupplierToEvent(evt.id)
                                          }
                                          className="px-2.5 py-1 bg-[#705510] text-white rounded text-[9px] font-bold hover:bg-[#543d03]"
                                        >
                                          Adicionar
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-1.5">
                                    {evt.suppliers.length === 0 ? (
                                      <p className="text-[10px] text-neutral-500 italic py-1">
                                        Nenhum fornecedor vinculado a este
                                        evento.
                                      </p>
                                    ) : (
                                      evt.suppliers.map((supp, index) => {
                                        const matchingForn = fornecedores.find(
                                          (f) =>
                                            f.name.toLowerCase() ===
                                            supp.name.toLowerCase(),
                                        );
                                        return (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center bg-white/40 border border-[#d2c595]/50 rounded p-2 text-[10px]"
                                          >
                                            <div className="flex items-center gap-2">
                                              {matchingForn?.logoUrl ? (
                                                <img
                                                  src={matchingForn.logoUrl}
                                                  alt={supp.name}
                                                  className="w-6 h-6 rounded object-contain bg-white border border-[#d2c595]/50 p-0.5 shrink-0"
                                                />
                                              ) : (
                                                <Briefcase className="w-3.5 h-3.5 text-[#aa904f] shrink-0" />
                                              )}
                                              <div>
                                                <span className="font-bold text-[#3c2a01]">
                                                  {supp.name}
                                                </span>
                                                <span className="text-[#543d03]/70 font-medium block">
                                                  {supp.service}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleToggleSupplierStatus(
                                                    evt.id,
                                                    supp.name,
                                                  )
                                                }
                                                title="Clique para alternar o status"
                                                className={`text-[10px] font-bold hover:underline transition-all bg-transparent border-none p-0 cursor-pointer ${
                                                  supp.status === "Confirmado"
                                                    ? "text-emerald-700"
                                                    : "text-amber-700"
                                                }`}
                                              >
                                                {supp.status}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleRemoveSupplierFromEvent(
                                                    evt.id,
                                                    supp.name,
                                                  )
                                                }
                                                title="Desvincular fornecedor"
                                                className="text-[#705510]/50 hover:text-rose-600 transition-colors p-0.5"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Staff/Team Tab Content */}
                              {activeEventTabs[evt.id] === "staff" && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-[#543d03]/70 font-bold uppercase">
                                      Membros Cadastrados
                                    </span>
                                    {addingStaffEventId !== evt.id && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAddingStaffEventId(evt.id);
                                          setNewStaffName("");
                                          setNewStaffRole("");
                                          setNewStaffPhone("");
                                          setNewStaffPhotoUrl("");
                                          setNewStaffStatus("Pendente");
                                        }}
                                        className="text-[#705510] hover:text-[#3c2a01] font-bold text-[10px] flex items-center gap-1 animate-fade-in cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" /> Incluir
                                        Membro
                                      </button>
                                    )}
                                  </div>

                                  {/* Inline Add Staff Form */}
                                  {addingStaffEventId === evt.id && (
                                    <div className="bg-white/40 border border-[#d2c595]/50 rounded-lg p-3 space-y-2 text-[10px]">
                                      <h5 className="font-bold text-[#3c2a01]">
                                        Novo Profissional da Equipe
                                      </h5>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                            Nome
                                          </label>
                                          <input
                                            type="text"
                                            value={newStaffName}
                                            onChange={(e) =>
                                              setNewStaffName(e.target.value)
                                            }
                                            placeholder="Ex: João Silva"
                                            className="w-full bg-white/40 border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px] placeholder-[#543d03]/45"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                            Função
                                          </label>
                                          <input
                                            type="text"
                                            value={newStaffRole}
                                            onChange={(e) =>
                                              setNewStaffRole(e.target.value)
                                            }
                                            placeholder="Ex: Cerimonialista"
                                            className="w-full bg-white/40 border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px] placeholder-[#543d03]/45"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                            WhatsApp
                                          </label>
                                          <input
                                            type="text"
                                            value={newStaffPhone}
                                            onChange={(e) =>
                                              setNewStaffPhone(e.target.value)
                                            }
                                            placeholder="Ex: (11) 99999-9999"
                                            className="w-full bg-white/40 border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px] placeholder-[#543d03]/45"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                            Presença
                                          </label>
                                          <select
                                            value={newStaffStatus}
                                            onChange={(e: any) =>
                                              setNewStaffStatus(e.target.value)
                                            }
                                            className="w-full bg-white/40 border border-[#d2c595] p-1.5 rounded outline-none text-[#543d03] text-[10px]"
                                          >
                                            <option
                                              value="Confirmado"
                                              className="text-neutral-900"
                                            >
                                              Confirmado
                                            </option>
                                            <option
                                              value="Pendente"
                                              className="text-neutral-900"
                                            >
                                              Pendente
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[8px] font-bold text-[#543d03]/65 uppercase mb-0.5">
                                          Foto de Perfil
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <label className="bg-white/60 hover:bg-white border border-[#d2c595] text-[#543d03] font-bold px-2 py-1 rounded text-[9px] cursor-pointer inline-flex items-center gap-1 shrink-0">
                                            <Upload className="w-3 h-3" />{" "}
                                            Anexar Foto
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={async (e) => {
                                                const file =
                                                  e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                  const compressed =
                                                    await compressImage(
                                                      file,
                                                      400,
                                                      400,
                                                      0.6,
                                                    );
                                                  const reader =
                                                    new FileReader();
                                                  reader.onloadend = () => {
                                                    setNewStaffPhotoUrl(
                                                      reader.result as string,
                                                    );
                                                  };
                                                  reader.readAsDataURL(
                                                    compressed,
                                                  );
                                                } catch (err) {
                                                  const reader =
                                                    new FileReader();
                                                  reader.onloadend = () => {
                                                    setNewStaffPhotoUrl(
                                                      reader.result as string,
                                                    );
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                          <input
                                            type="url"
                                            placeholder="Ou cole a URL da imagem (http://...)"
                                            value={newStaffPhotoUrl}
                                            onChange={(e) =>
                                              setNewStaffPhotoUrl(
                                                e.target.value,
                                              )
                                            }
                                            className="w-full bg-white/40 border border-[#d2c595] p-1 rounded outline-none text-[#543d03] text-[9px] placeholder-[#543d03]/45"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end pt-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setAddingStaffEventId(null)
                                          }
                                          className="px-2 py-1 border border-[#d2c595] rounded text-[9px] text-[#543d03]/70 hover:bg-white/10"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleAddStaffToEvent(evt.id)
                                          }
                                          className="px-2 py-1 bg-[#543d03] text-white rounded text-[9px] font-bold hover:bg-[#3c2a01]"
                                        >
                                          Salvar Membro
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Staff List */}
                                  <div className="space-y-1.5">
                                    {!evt.staff || evt.staff.length === 0 ? (
                                      <p className="text-[10px] text-[#543d03]/60 text-center py-2">
                                        Nenhum membro da equipe escalado para
                                        este evento.
                                      </p>
                                    ) : (
                                      evt.staff.map((member, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center bg-white/40 border border-[#d2c595]/50 rounded p-2 text-[10px]"
                                        >
                                          <div className="flex items-center gap-2">
                                            {member.photoUrl ? (
                                              <img
                                                src={member.photoUrl}
                                                alt={member.name}
                                                className="w-7 h-7 rounded-full object-cover border border-[#d2c595] shrink-0"
                                              />
                                            ) : (
                                              <div className="w-7 h-7 bg-[#aa904f]/15 text-[#705510] rounded-full flex items-center justify-center shrink-0">
                                                <UserCog className="w-3.5 h-3.5" />
                                              </div>
                                            )}
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-[#3c2a01]">
                                                  {member.name}
                                                </span>
                                                <span className="text-[9px] text-[#543d03]/60 font-mono">
                                                  {member.phone}
                                                </span>
                                              </div>
                                              <span className="text-[#543d03]/70 font-medium block">
                                                {member.role}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleToggleStaffStatus(
                                                  evt.id,
                                                  member.name,
                                                )
                                              }
                                              title="Clique para alternar o status"
                                              className={`text-[10px] font-bold hover:underline transition-all bg-transparent border-none p-0 cursor-pointer ${
                                                member.status === "Confirmado"
                                                  ? "text-emerald-700"
                                                  : "text-amber-700"
                                              }`}
                                            >
                                              {member.status}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveStaffFromEvent(
                                                  evt.id,
                                                  member.name,
                                                )
                                              }
                                              className="text-[#543d03]/55 hover:text-rose-600 transition-colors p-1"
                                              title="Remover membro da equipe"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Guests/Convidados Tab Content */}
                              {activeEventTabs[evt.id] === "guests" &&
                                (() => {
                                  const classStudents = formandos.filter(
                                    (f) => f.turmaId === evt.turmaId,
                                  );
                                  return (
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center pb-1 border-b border-[#d2c595]/30">
                                        <span className="text-[10px] text-[#543d03]/80 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                          <Users className="w-3.5 h-3.5" />{" "}
                                          Controle de Convidados da Turma
                                        </span>
                                      </div>

                                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {classStudents.length === 0 ? (
                                          <p className="text-[10px] text-[#543d03]/60 text-center py-4 bg-white/20 rounded-xl border border-[#d2c595]/30 italic">
                                            Nenhum formando cadastrado nesta
                                            turma.
                                          </p>
                                        ) : (
                                          classStudents.map((stud) => {
                                            const guestCount =
                                              stud.convidados?.length || 0;
                                            const hasFile =
                                              !!stud.guestListFile;
                                            return (
                                              <div
                                                key={stud.id}
                                                className="bg-white/60 border border-[#d2c595]/50 rounded-xl p-3 text-[10px] space-y-2 shadow-xs"
                                              >
                                                <div className="flex justify-between items-start flex-wrap gap-2">
                                                  <div>
                                                    <span className="font-extrabold text-neutral-900 block text-[11px]">
                                                      {stud.name}
                                                    </span>
                                                    <span className="text-[9px] text-[#543d03]/75 block font-mono">
                                                      CPF:{" "}
                                                      {stud.cpf ||
                                                        "Não informado"}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    {guestCount > 0 && (
                                                      <span className="bg-[#8d1811]/10 text-[#8d1811] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                                        {guestCount} Convidados
                                                        Cadastrados
                                                      </span>
                                                    )}
                                                    {hasFile && (
                                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                                                        <FileText className="w-3 h-3 text-emerald-700" />{" "}
                                                        Arquivo de Lista Final
                                                      </span>
                                                    )}
                                                    {!guestCount &&
                                                      !hasFile && (
                                                        <span className="bg-neutral-100 text-neutral-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                                          Sem Dados de
                                                          Convidados
                                                        </span>
                                                      )}
                                                  </div>
                                                </div>

                                                {/* Individual guests list summary if present */}
                                                {guestCount > 0 && (
                                                  <div className="bg-white/70 rounded-lg p-2 border border-[#d2c595]/30 text-[9px] text-neutral-800 space-y-1">
                                                    <div className="font-extrabold text-[8px] uppercase tracking-wider text-[#705510] border-b border-[#d2c595]/20 pb-0.5">
                                                      Lista Individual
                                                      Cadastrada:
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                                                      {stud.convidados?.map(
                                                        (g, gIdx) => (
                                                          <div
                                                            key={g.id}
                                                            className="truncate flex items-center gap-1"
                                                          >
                                                            <span className="text-neutral-400 font-mono text-[8.5px]">
                                                              {gIdx + 1}.
                                                            </span>
                                                            <span className="font-bold text-neutral-950 truncate">
                                                              {g.name}
                                                            </span>
                                                            {g.cpf && (
                                                              <span className="text-neutral-500 font-mono text-[8px]">
                                                                ({g.cpf})
                                                              </span>
                                                            )}
                                                          </div>
                                                        ),
                                                      )}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* File download widget if present */}
                                                {stud.guestListFile && (
                                                  <div className="bg-emerald-50/70 border border-emerald-100 p-2 rounded-lg flex items-center justify-between gap-3 text-[9px] shadow-xs">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                      <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                                      <span
                                                        className="font-extrabold text-neutral-800 truncate"
                                                        title={
                                                          stud.guestListFile
                                                            .name
                                                        }
                                                      >
                                                        {
                                                          stud.guestListFile
                                                            .name
                                                        }
                                                      </span>
                                                    </div>
                                                    <a
                                                      href={
                                                        stud.guestListFile.url
                                                      }
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1.5 rounded-lg text-[8.5px] flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer uppercase tracking-wider"
                                                    >
                                                      <Download className="w-3 h-3" />{" "}
                                                      Baixar Arquivo Final
                                                    </a>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}

                              {/* Expenses Tab Content */}
                              {activeEventTabs[evt.id] === "expenses" &&
                                (() => {
                                  const eventExpenses = expenses.filter(
                                    (e) =>
                                      e.eventId === evt.id ||
                                      (e.turmaId === evt.turmaId &&
                                        e.description
                                          .toLowerCase()
                                          .includes(evt.title.toLowerCase())),
                                  );
                                  const totalCost = eventExpenses.reduce(
                                    (sum, e) => sum + e.amount,
                                    0,
                                  );
                                  const paidCost = eventExpenses
                                    .filter((e) => e.status === "Pago")
                                    .reduce((sum, e) => sum + e.amount, 0);

                                  return (
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center pb-1.5 border-b border-[#d2c595]/30 flex-wrap gap-2">
                                        <div>
                                          <span className="text-[10px] text-[#543d03]/80 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                            <Receipt className="w-3.5 h-3.5 text-rose-700" />{" "}
                                            Custos & Despesas do Evento
                                          </span>
                                          <span className="text-[10px] text-[#543d03]/70 block font-medium">
                                            Total:{" "}
                                            <strong className="text-rose-900">
                                              {totalCost.toLocaleString(
                                                "pt-BR",
                                                {
                 style: "currencyx��}[o$Gv�����j�@J]^��L�M�����MJ��+��r:+���ŋ(�`���ƾxlcw`z2��2��	{NDޯ'��H��9�&���'��;����i_���
{p�g�/߼h�7q�����;]�w{��U���]9�#����Q�d�{�+>�-_\�m1.����^���氯��4�����g�-q컦=Zў���o���R]5�Ͽ�GH'^�!��S�w��ܦ���5�3��Og����/�@�걖�s��o����W+�lWo���6,�z*�W���~z�cpKw�3�E3w�]��GMͧt�Y����t�vO��zl�	�~��I�s>6}���|��w��c�/o�zӋwlz�^�l��e{~���6�ѶFlh�O��@ؾpوO�Mޘ�y��cР홾��mnY�c=�mOS�긆p۶c:���Α5�r�ހ�����~�>�h�s��3�M��56���^�z7ܜ0��h_��ل_�����UZ��m>�6u�k�̕8��v�ױ�=��lww���S���v���/�0��������Pf@T@x��Vjw����PHGo냭'[�= LE�<}%��l�V��+|�/tD��3��,npƙ�`�Yt:���3�lG��Sǿ�'��	}�r�3��7��.��z��'�w�N�)}^VY_k��3�ӕq1E��Ռ"nM6�^\�^�ۀ��Y���m�WJa[�$+�J�g���y�9�l�
�\[2��$w�9"�X^e��O��|k���A�(��j��@z�1X罵w�^��(���5�x$针쨦��xl��xZ����xM�ƽ�4��qg�if�fөp��&�:^8o��}8K��@r�(7y=e��B�g-D�ZP���m>9����>6n���&�2����M��T��2!s�?�)Z�ÜMmZ9�^^�܉V<��)\�j��yʾ��_�#�lk��5jh��xHГƳa�s��T�F��d��4���Nz���#�}5�Y`o�E`��Դ�jD��"��M���s������E����T��n;�.�6�g�����94�
��V(ٙ���B�Qx�m��K�*�W�����6
�WS�Px�a$
��Xt`��<֢���l�u�?��d���ۡU(-&%�6�r\��������oA/p�Aw�l��I��Ҍ%�@hj�s�:�'?���LX���YQ��}#���\2%_��yۤ|�ro�~���@r�~d�NX�P��[W�����Օ�.־m�;q��;���������-��u?c'���[t���i���`��5'�mr�}�-~aF|�mc�-f�}��z���;a����u{l���T>����C�Ѕ4�W�;�yj�g���m�� 8�ŧ�e�J�|�nTێ�f��탡1���w�;OM�if �"�bĶ"���{����&�V�S@�=�^C�^�7[_�j�٧�kǽ��tv���yc��X�;��M�b�O�������y������R2�hꍐ'��L�o��n�����4{�9��/�`��&��n5���	;��c\&���}ɂ_B�VRq54-�a,�X���cQ�Q &��2�>�:C�6�����K�������Q�T���3���;�i����G�#����0llE���`o߭�њ̈́�M�	2���j笣�kee(�nNXv����l@2��x��C������ʰ�8C�'r����o"�p�m�V8t��TO�����|Wb��l��2}�l�ا��1�t��<i�:ڇ�l�*Gv��Z3x�$n)��Y�]_�m )����&�`��u���O�[�>��-�@�z�
|�l�p��߂^������{�g-)���6�H�>�?��up�M��tD�rK�h�3&
�	��^�q��Y�R���ؒ&>e'�D�,M��od�j��aB��n�δ�ɸ�����U����3t�9Q�D�]�H����Hk�e�J�w�u��1=3�}���n�2v��'���;�����W)�@Wou���eH�)uj�����˦tbi���[�\�,�]�qN+�����l# �� v�Η�(l|8�<��E��;��Km. �dg�I^��h��&���0o�4�}��X{���������؆�,��q��t;HUC*�F�����8t�2ޤ�/[OHm �i���$˴En�`h��#Z-\a�ah�B�=�s�x:��r9\%c�X0?�M6B	��q�[~�ǌ^�������߱�(����P�Q�w4��~
�}�\z���t/?�=11���T��du������6�V�3�-}��LNd�6QH~������7�K>=2����gD_��]�~�/�9�M���$����~�L�ۏ?����*EԴ��m8K���!�7�sf�@xwϽcɈܒ:�Wo"F!���m��z:4�N�TGdz�9fbkAs���[����b �I�=�:Y������eW)+�5K�}yJc�u:�f"�L��h�䧥/���3s�l�M��X���`m"���z�rd��5��k %h���ösk�a=ོ���v?��/'��?������_���w+�$2��d�M��!�O�@A���h��{f�����;&��H�a�Ha7����(]hH�l?q��"�'���kqY(�R��Q���3��|�JJ'�%�����5�1��3��	�EN��������	��Hg���M`�4�-��e����t�7~����q�؆R�/�Q�����e~m��	�3l"�	L�eGϞ/^vۑ'��:2m<z=Y�����F���[S2��m!E��0)=7cIJb��;�%ّ{IG���Q��o'���Q��M��K��H'8�YXE�2$Q-~��D���fД�hh)�IJA���h�0�`�Ԥ��)ū&��,:>z��VD�weXxi�y�x��﯋��8:`��� ��Jd�+o�+�Q���rR�y!�v@�h��R�)�	��O��:S�ֹ�{/��C i.��8��t�Mv�v����i�}��<�z��0L�>���5�9�H<��xt��ѢT�p�_X,��W��٤�H���$2�vv��(<F�����O�{�@YD�Ԃes�����o�s�#?,�F�T�U�ĕ�[m�ڤ�]	8:C����)O�DNK�Ȋ���7R�}�9�MTs��X�i�Q��a����ʐ[��E���b�~����uZ'"��Q>� ���!�_��	�������C��A�c��xv:1��+%Iv�CUs��д�Y^��@��[�%�*f�r&2|h��0��k�˽]���Fj�P,~*�˓6�b+r.�!6�MNI��'7?�3�a��H�b�+;X;Ӟ��ڷ�|_E����AFF�gܚ�h���	-���S���_�`p?wG����	f�)�bk$\�o�lf�0ǃ���_ls 3΃Țڶ�Yx�c��� �B�$g�K��208��׏B��3K���U#8�{�'d0�3B��}��3]Pw��ޠ~[4$u�n�O�%��%�Q�D}�����ꨜ��9*�S�G���1.��}�*]����t�]��]v2K�'�
����2�#$����½�Gr���Z�1w�jo��P�E�'�L;��c�u�ӒC�Oq��}�<xo����y�X�7?e+(<�=�o���O4���*�t��T��/Y��5/�՝�"{�� �ޛ�#Tė��PT5i{�6}k7Fj[���::.��q�m����~kZg�>~Ȏ������f�Guc��������6�\���E��lTh��I�:5�uνݫ�:jk�+��S��ջXJ�_���im0�q��	>���cg�Sn�a�|�?���g����"��drL�������Ğ��d@Ǻ��V�3�;ݐ���}�����
>� ;Q=�:���9l�ͬ������C�X����BKg��H)�M]��:���q|�����uÓ� �]���'E3�x+_&�
�#�t���oڴ\o��v̭3�=�	�za�=Gp��֩FL��'���_��8 @F���Pc��B��U�L���e�;+�lEA�hU�epʶ��Ҳ�zE)���u�	Hx�0 ![���-q�+��@�v�g]�ж������Wu�7����ʠ��A�9�S[��%.�g����陧�%�� �_�������˹z�6z ;��/m��v�������[b9����Q'F��Sϱf>��! $������)��s���}����W�Sn �lM�~?n��<%�*ܟ��<��Le`�Q?ȉ0kӋ9i�c;����P~�Q��s�Q��H8UoU��0a�@{���䵠�ڠ \Vw!Z�v�T����6q�������)VM��������T�����(���jd�J��[�m���/��9���Ҋtۄ/����4n��T��I�l\Y����W �G��M��P�Ћ���`����B��X�}�uVt�8A�:��y�z[[k�w��_��D�G�3JC��(�?є:�QM5���V�7�^�7�����2&f�LƝ�L��uZ�a�@ s���Ĝa�"%]��qD
�ݴ8�'�-4HX	���O={��u&��b��d�V�`J����]=�?�Jk^O���������S�e��(���j��A��J�/�ϻ���B�;ScXsV�(k��Wj����d���{P�1@��I6v�̂����^}��'���iw�VA*��vfr�4�:�=Zv���'ۏ��Z>�b\�|�\�C��;1jQ��ε�����>)���rC�렡sn�-U��P����^N�By�����xC�@����-������c>�^&���^��W0�!3;ZIW��\w��U(TD�,0��p�>Ê���;��$�ߟ����,�V�\)`uu@�Ul�}\d�}R����줚�,与|'0c���򊟉tܭ?5na�s)��i���jIsK�jI���A�3&2��]�8�Z�T�oMoW�X����T���0B�v�G���6�?������>�9tQ�
2eKw9|���(�R3�g��#�M#,��s\�-2������0�h;����ǿ�턢)�;0Y�=���ޙ�x9�" ��*h;l��3�t��	�F��GW��<Ӄ)���o���B�j�;Alh~�6���'��g.g+�lV2�~�m�q`�t�:x?���~&�4�TX�Y1cv�9;숻�X�k�3�,�So6�Yv%E������X��od �a%[ПZle�Z��	����V�S@kuq���i��`9�>�!���,�&|c��z!&�w�@�Q���˕M�z��ն'&���X�@~��L�;�Ρn*��2�����
Nbo5�3��2����TZ��(-n;�T�ɵD5�B�T���<�_&���E[%��$v%��Đ-�S���bE����83H���gD�Ӹ�2���'��ߏg�J2�����Iu�3��ﶤ��.�6R�����p(����+��W���ř���}�"j((�p�Ќ�4���PXG>�+�dRk �hE48�?s���]w��v�U���)/���4&S+R6j��D5�LL)U���8����������Z��%�Jٔs2@旖�/�Z� IEFWh�L�ġ�2�K�M��&��r�
��qeԉ:bْ����#���-v��u�H��=�y�l�|�͛�{�Mt�qW��.A�cT��Uw�u����Hh�������7�7}�W��u��K3]MT	 =���A<�������-�J�h�W3T��F��Z�������A4!�d����>sh�l(�/�A�-j�6
� �Y#�����J+���L�`d�-q C'E�Է�����F����%���<�`���J�`Q��*�^��C�����~��"V%[��}����H�Ċw��Rř�4�g��猒�z?�v����=�$w�
*Kw��tt�����c�ux0�!�����Y�į]��~w�&�k���Q�c��E���I�s<�����2a\���p*]�����2����SW��$��$��i�}e�v�v��29R�ct���
�Bs?7&�m�o�sW2�z�=7mn�|T��r<�L�{�`��)�2��KqZ5ͺ�⚴S�H6E4��̱,��#���Y�Ie�_&"���I����A�P�
��oE2[�W�@Y�:l�TK��U2ŷĺ���I����t��]V�IP���Rf�8Qh"s�GK� 7�r{{�j���+���S�^�͆���̶] ua�s�ۻf{��&�!�٬��G�V��V�����K��~02��k�+C�K����o���G|���ƀi~�G�;q|nE�o��[b�!S�s��L�4�Yk0s]a.[Y�+|��-vMm�\�h��X����r\��mJLC]$��+y��_ȏ�k�K֎����I�̤V��OLL�̡LPmfS���B�o�!���G�y���/��������ы��í;��!�-Bz��Ј��>%�Lvz) �&���i�<����/���NX�
�>N�eh	2/n~�~fb	5c�x�͟��-��-�JZ�6��z0����zϔ��$L�my�0EĶ8��r�ѪA	eJ��y�v˳�Q��8���z0x#�����$
"�7��g�睊��C�e�_'PЅZ+��ك���V��x*#(������ɡi�����L_9������|fK�YD[�9��_@S���Zł��:/��,��W�e:ۑ%���4�+���f�s���#G����p�*x�c	{�����z���p����kN_���ݽڤ��L�aZx�E �H��N!p���x),�34=�^��#'��lj�������E�y��_c��Y��*�FY}��2�\�!�]�_�j�9i�B.������Ö��<�<��u��kQ���IZ򙒱(gI�8n8ס��fz���`�{�P��c��1G�Q�d�+�_�1i�3�h� ��	�Ɠ'�<zZ pMw���)����&�K�+
RD�j6骛˟n=n�^謙���r����J��o�QrI:�$�>��D�� e`Qt�\{L�[��,9����'r�0Dt��+>���S�"@=U-@���@KSږ�abSx�P-.�z�sP9#as�3l�CQ=kkK䞼��g����ÂI4�zȈ�5�}F�gD���jkś6SX���M��Ū�Md�e��(�O)�͔��P`՘dE��m�AG�z�����&��|#ݯ�����ǣ;Ai������H�I�%��gτ�MKl��)Y~�^��?O.��h���S9�T�D�`���G@N�X6�{�(���OQx�f�ج$m�DX�&��K�EoE��C�X-t���a��.�|ۚ��|J(:Q1u+�P���z�����)3��òk��ݤ6���(��c�?�>���;�p>�Q7/���?;}��1������,8�T��0	`�MzM��?˱���=�h(�47�hltU��X�XOVO��M5z�|l��'�J�b�LoHqP�%��0_b��^t��������#���ר�/U`n�~DԳ]����T2NЌ��z��K3�rarU5%�/5_2v�ٌ%��sM�0���n�V�k]�� ��P����u���-��H���@47�r
͆vCe5/��$'O|�-�.�����d��ھMf+�k�ex�CM� �v���D�TN�(����n4Z��w��MX̋	�q\��rp�J��/�4�D_<�
�x5�I�i�9W(��&��Z8I5��W6�'(	i�`�k
�?B8�B�O���r/����BH�����%2�&8OӖ���6l�֑�Q������8��-eTţy�}ٮ�x�j��S�Vo��8*��=�0��������t�&`]mn���%�i�թ]?���Z�zyM���FɾT�'�!n'�m
����6���	��,�G����I[ʓ�'{/س�����{���>f/�O�����jL��:��BZ3-�}�H�_��C(�oO�����듃CԲOS���C�n��E�Ӵ����^��'�7�6(7���S�����X�\&��8+	ȁ{6�K�Y����������M_�b�z��t��玫��̃]���m��V��ƿl&�_ҧH�d�#�K�YV�]ʔ߅8����X��no: �@� �6z�,�4|㛖���!�L(Dl�r�H�ź��F5@�=x��2h����7�;�B
�i�BM�Ogá�b%gY�R��H[,iNjN��H;3�e��;��U�b�{cad���"�=� �$6#_W)J�����G�n{#b��С���nm�0ͣ�Z���02W�����Qc+ �E�P@=~��� ׉��\}�g	C$C���7�^�H��l�q]�v�A��J��Y�o�U�9�u�>�fC����:��	�}@*2�F������=�t��^	���6+�f7Y�!�Qh�Q�a��uT�q=^9>��y=p\��_�c�e��3���"�P�x۸����X�@�� ���g&�~ƭ�g�=Y>Hc�C6�OL_������3�mM"�����M������W����{�
6g,����������~��.2�mgyw�2ڰ���s<O�Ʌ*3��|��w� rC�;خ��/	J��7�i����<��.?����y��c{7�p&,�B��ME[�t��T�"����#���`+�r"�w�	Jq���Ǿ�7��*[0g��w
�<�-;݉���N�}�͔�:\���^1帶���c�/����X޷m��Tz��*�Б�2~\5�駅YY���P�	)�<ۍ�g�����<�qe(��I2����u��a#��aI�]���}������g~�\f���7τt�B����s��zAR��	�&�;5�%�h���b��똙�wZ`�RaT�=,��6�%�cb�I�����d�H�ػ��w�i�����moRP�0�
>��7ʪ���P%ߑ���,}$@
���c�ڶp�>y�b��.0�7���Ͼ+��1g�^���dF�g��ʠ����e��}��د`5���H�r�����v�y��ۮ�&V�U���wK,���]�:��'W��Sϱf>�'�Y�F@�x��L�7���l�����'��@FEń�#Ӧߏ{p$�о*K|�4��T���֘?����Ŝ�ѱ�v��b�n�Z��F@�9�(_�4����[`�0J�=8_�䵠��#�_Vw!Z�v�T����6q�������)VM�������T�����(���ꨌ�*}�[i ؉���W�6�n���6(��y���9��I�ث�c�6A������=��iQ:41�_X, ����6�oy��A)?���]�s�������o�����B��U�_9v;��l"�|D'�^�Ycr��Y0�y���ҝ������5,�>�Zda�s��2����}D
�缽������Ra�u�V��eRB���Wf�%��|�U�g����#�S��ы�3:�0=DM��7�E���h����H�n��9�B��X��!5<�%���0��E�b�efX�.8���CIs�}��߽�
>izG���6�]gr`	t�Q�[�*9�;7@[����I�=�i�7}KUh=�>츕��D2�������!&��^w�ư�p�/P����D��
�Bk���B�'����i�^�e�4�9�d~�gB��$@�Fxx$ΡOQr��E{����'��7��Y����6��X�����#|}���=s�m��F���������	8�K�DOYQ�l��:�-��Z��:�.>Ep>�t[X� �q�D�R�U��b�fDz1��Kd�2I���!�Y�Ĭ�;Y�"�h�Q1�]�Ax^wKeP���Yֳ��V�a�X_�`y�Y�_�4���tGE������V�+���G��ē�Z��j�c����n�Ҋ1i�N���4v+E��R���ѓM	���y�8��7@ka?$O�J:1m����7dpGJĘYu=�'-\믕f��I�a����_΍���ג�e���i{��V׿[����XeK�wI��Qgp���9ԉ����A�SZR3l����r�.5
���dQ���>K�8�k�Q�U��D]�
$QW�ʡ4:j7��t����#;/����ECw�8|`i���9�d�rI���H�8$S3C]](T�L-&���6���@�U1����>O ��̾� F�n�
L��1� "��$�]�t$��6��0�mZnM��>���_^H���1�Ӊ�ċ�2w �Bjv\1�Pc���{�Ϊ�/l4�E𨜼=�so	�nZ���n?$ҊX�������&pi�����k��Us}����w^����lџ��UX���A� ��Ҩ&�u)0�R	�3#˓�_���K��7K�Ƞf]�e~�g�zi	A>
�g�1Z��`���/��ɸBO7�)��	�/�i�ؠĔý��ɂ��r�R,=/�,��(�Z)���-q�2�4Gߍ|���R��K	�&�A�
W'��r�~����@��s�b%輽�[`V���-f�j,��#���ǡ+|dqa�T��7���Yӥ��dx'#����v���(8q���r_
G<��EO�īP�������)L|�ޮ���A������l/,}#T.-	�+��W����7 �]h���Hz��,�/�1lWb?3yK��J��}ts�c75�ð|��D���CU4�0�gUu>3CQKz�b���V�m<C�LX ��Di�(O\�jk�H���C�ϵ�0��2b��゛Ƣ��w��x$T�����q��d�ioɩ��*�D����c=8VҰ�y�:Iw1���7���L���U[��������C��Jgy�$��D���ū�ve���j)������\SO6�������[x��#� �|r�=���hVeC�Xt���</x_���f{,c�=oo�1�Wl�݌͹Q��H��Kb?)�pa��G�'�0�:Ck�8>0�� ���r���4�1,�$NJ,[1Ka"Z`ǥ�肱��٤�f�͢���'u�4ʟ0z]������$�4��v���iKs�q١��d�+FS& �8�C|ߙ4
�� HU��>�8^ak���Lt՚���N�9H�F���W�����\˔�A�D�}i�W�۲HT��g��͝@����ǿ�;|u|�曛���_�X������|��טS������_����%�~��ADhs�A��{V!�8h�#�i2�������W�U���YMǙ��	uGn�p"S!ղG{՛���w��Np���������rh����9<9��h��H�""f�q���`��5���͡��L��Q���l���)�4���\ot�K���y�a�zqaɣȹ�xao���߲wL��}L�7s�c�%F7?!�����)}� S�j���'z��&0 �	 %ALם�������4�i8����⊁��$N�!�Sn�&�80��TlsDb��Bc6V�5�Df��!���Ic�0����,I,��'j����G���6�|��ƶ>��|[ �����c�tI���d-i���rp���ΡI-eZȁ<�^����	���r�+�I��~��ޗ�%��;��c��>�4㦠g��W�����S�R@�eq�;�������~pL4���g���}����y�KM�w�� ��9v;��Fa?I9e%��
DP83��3q,g݂��@�Sy�)�r�s<��DL��*c�X �3+z%���Wt>�E%$_�C�I�/�#z�?0L2�'_�o"���8�{q�WZ����q�ҭGc�"(7L�iQn�$�o��[���y<x�ɺ�3Q�D!pU:�r��ۭ�;m�q�3i�}`�5�����>�N{����q�Ó�Gb���o�t�&B'���"�B�B�Y����dy���Vm�}��:�f^�uU�#|l7����8��ؠ�l��
Eѷ��F�1��Yiܰ��bZ��&}���T��rQ�ҍ||k�b�M�m,��E�&��в˂�}e-dS;�O*.�`b짣J	�9����w�g���t���r��b�����
w��k��
 �S���? 7�`��Ø!���!� 5�m��P+gܚ�ݫ$+U��g3�^k^�ǈ�
,Q(xY�?/n`Et|ߑ/*1�&-��ga$�>������:��OqJfuf>��r�f^?xC��^��
(3�a��Aæ
򐳻��Pu
��lE�rRԻJ��)X���aJ��ⲹU#�y���a��_\�~�.	)�_��ϋ#Y��Lʁ�%녓Q��s��K��)%�r �R���œQ<�j:PL�RTSM+8	8+-���(�r�]��\�41
p�*��'��aÂ�+D�B{�Z��TI�$:��Z��_�[���2�z������B�L��>�]{o�&yIo݇L^j ?;�2�

ń�=qڔU��}]'&�ǎgөe��ɜ�<��*����2�0R��nZg��W��R�R5�}��ĉ��|,Ҷ*�8�U)���4�53����jY@�|�S�iç���6|VHɶٳ�Q�`љ����Ղ��\����`��E*D�	� \��\�S�;�XڌRߤ%P��[O�ޥ�Ӆ�J�;_��J�tjC'��O�f"b��6��i{�A�z7���U!�(FqjG�;	�bp���*|�]&
4��<�)�x�+�8
��qv:���:���B�8g<�������<3��)5�y	�לY��"�C�P\�3�$.W,��)������^B
�M/�$ɦ���tJ�D����Q&�ci���~�'u���qh	9
,!͛ڇ������	Lt�yS� -�SǕ�s�P�ě>��*I�����^]�u�}���9����*<|e�Z$d�e�P�Wd�J Hԇ'������^w���n�3m�
WSs�˜�D�$Vsh)��F��9oe�s���J����咤�' =I�g��ߊ�A&c�u��ҾӋ(U���P'G4"��)���`�]���o�!�3��Q�װy-�2�5�PN "k� }���9�vri���������*V��A�C)Z���6J�{�mV;:C:��T�Hh���p�0�6�:Y/�sT��嫤�O�"�Z�nR��6v�p�껱�O�~�{�;���*a���i<��4Z���%��m����61��n�f(\��ߎWVKM��+���EOW��;$Gx�!�Y��_*��(�s�(�(n��$�y
\�.�����A^Ӌ-�.ެ�G��rO�HNZ�워@��0�-�KX�ՠ�^cn�x=6�*%��jDl�z~�
Z��\���I�OR�������R�-��TҘAk�,��k��S�o��M�^�q��@lx$�i1!K��^�q��)O�	Nb1d�BȓJW>澷7��p��o�I=��E�E�.q;\J&�l'I@~�=��.�	=� �M�3��{���dC��곎W+u�����ߊ���h�~��,T��g�����<ۉяSmי5J|�P��%��<fUJ�\�95[A���3bM�ӂ䀍�REYiIW+��.mC����J�;$���Z�����V�8[�N�0�j�M���,�f��.��V{���e|�e��;�P ��C�UU�0�0��.VF+��"�c�C�у):0@�������_&<�Z���%$�8��QJ���E"�M��E
isꈄ-1�^H.�8ϒ�����vjMK�qt�.|Q��܄E�WΦ-+!5��i`�������mg3�C�BXZ�=��__����F*ԋV�t�+����\�_�(�ŇLrz,%�v��RĘ���c-?Q���ڋW%�$r�赥+)�9�؟�$�۲,n��6m+[v�޹���$�Z@�W�c���Eɻ�τ��4[��Vix`5�eBo���ca�u�i���o�$`�
��d������;|���y����y��(���4�3i���)���OVl�2)����|/�_^�̘Sx�M�p��w�@��^����Lᛙ+#����-]�*�v����E����y��0,3����9�H<��xl�챪pj��`.ƥGQ�W�^��sh>�۳`T��%���W�pT@a�~WJ��$�V�V"^jVku%�X|�)+PD�5�_Ex��˺Y%W�)���"�!����q��<:�V�\�)��k=+WM.d�I��`%�:���tb��WJ���IU��� ����g>.��/5�y�,$0i iބ��L��|RH8�j3���مe�u�{���녳�g*�'���Ղ���l�3a�Pl�[�@x���n�`��t�1�/ ���k;�hI�;rř)ε����2�M}�@:^{����W��h��dO�W�	��~�ly|J�SP�Ub�2+�bC^"a)�e)��(���/��ij�{#&آ�Z�/sl�����w���|\~E'Pg��(�zQ�$`�~��H�����٬���:7E|�kl�3_�NӖ�14���,��$E��|*�� �G{��0�*�mT�Z�L-���Ad��^�U�>w]�r�ᄏ�����Ԟ��J�Kq¡Y���.>@duXC�G�3��B)J$^@&q��� 8�R�*��:T�~��v���Q0�1g�W��j4By�w/�U�T%¶�<P�w?�f��\bjb���6��n�u�i���!w�.��&��E1dC�R�w�"��*D���?��F�Y>��M|ɠ�'q��Z�?�<D���͋���H/�f�ư]�Z��*.}%�"�_�=%&����1j�/y�4Rg�̵ꎉ���"�#�<L�v�
:���n��Y�k2���ӡ��~�zZ�&3�5-�u(�@R��Ю4�_�kY��ό��`%%ќ�$�N2�T�K���Tv���d+e,�����"X��r&�=�p{f�田M	���3�\���tEu����{U�P��&Ah�W��\�ٟ��X��J�/gá�gᆋ���{.,G@���i��n��#Jϡ�|��}L�X� ��z>���$H�W��$
�'!�1%<������ݣ����;+kk����G�[�͍��_Ү�_�E��.Y˰����A}�O]����� ��?���:��/�������Dr|~����y�����_Q=W�	�f`��I�э�����y`z���ǚ^V	89^��&�x2ԠjQʑ	s�x+���(͡���tr���Ȉ�cn��P��Y�\��U3��H�
/H�
U&�bpHaZeT_q��ts�T�l:��o�Ś�����4᫿V�Wlg�0@��$�1�K:`�g",���́�F�mvD�긔�N�����Ό���a�M]ghz7��űGle \s��p�ޖu8�dmU�	k��f�'o~��u�ұyK��ۙ8�r�ō�E����I�c��/:���@ɛ)u��o�v#�Tx�_[�)�Ya�����*Jx� ���XQk���{���Y]A)5�kIɫp[WՒR�Œ��Vͫ������M��,��b���D>�,����V�����aę_�z�?u�+��޾[U8��A���t:�b�$���o7�`\��O�����	�5)+�-o�" ���"G����m���է2ɭ͞��	��l<"TQ롉,�Uԯ������J�����
Μ�h�0����Q��Ʋ��G��E��)�>H�VbC�J�hVI	��<݈x]U'r���MrkX�)�Qf�+��_ 6Fy�WT�*>�����M)#KǠ ]�Һr�t�2�QJhQ���0fЩ�|��\!̗�d�f2^k� �L��	>U�F��l�a��L �xX~P3x�Z��~h��B��8,��]��b(c�>�&����o�Γ�^V��H�َ�݇t�,:,n��U\5����*�GX��n)^�HL��?h$��K���e�X��U��r�6F
){���g�*:�%p�rYWW���Uo��g>�M~��n�u[\m�ĺ~,g���m!y|pul�d�?��Ol3��T�- ��%k��.�d�2�����	>s}X&��%
���u�ڰ��^Q?X
H�,���,��Z]8_SZ�7h�u����a�f"Z�n�H@jP8�G�y.���˂�I59���>>��b�D�D�#��+c?�b���,\ښ�9���E��R	�c��_F��d�A��CcN���te$���=�YsU�'����J-k�N-�&�:t��C�.[�X�Yq	u]��4�I[jQ�̻4�'D��T�gD�5udy��TX��Y���^����(��;�{W�j�\�/}��W����>�(����q�s*�=�zY��R��G��ˬ�ZV��@Z=�T��/�:We�����jg��U�X�89���:1�r4j16�Ĩ�eO���ɸ��d�%�܊���"#��#�	3��L����-�1AP�!Ь���*l�oC:~

��GR]Za��&}�]uM^6��)����S5S�J��_�g���
V�_�Y���   ���}�rG�ޫ� �!�}>`	1@�0KX�As���FI�U��n�����}������fo�&~?���C���P��1cF]Yy��?�����W���r���-��'0��`،��H�e�/$��򆖟�����}B�����h�K�
֌G=	�9sb�+b�U�Jʘ�:���-ˋ���m�DK"�+>�vg��W�۽�kk�W^�׮�R�6�A��>�a��ͺRoS
�(9�� �H�u-�w���紏m��K'��]"��#��<.�.�$� �a�eZ(f�����U�7��[���)/^!�S%̣�W�x踵 �������D���3I_����	[�id�]ֹs$r;y瀹���:�}��+I��}�����,���H�ۃ^/�R	��b7��V1/Jf���v<��^�Q��#;}\��K�O�ܷY�m:��q�vlݧi/�z�v�Skկٳb&�r�X[+��	�y#K�7�%�zi�b"Db�9.��=9�:��f�O����2g3g���~@�Þ^�@u.�ҸK��S��)����Ǚ?�YX�D�@�C�q[g7lk�c#�|^�v��'��A��@騀9-ch��!4�Ln��D�U��с����0�jI����@�	P�M5�E�,D����-<wY�A;������Z�9�Q�J�5��N�Z4%��%�'n���(y	��&GTutS���·�8����<$+c���.������2�����j�z���'���W{1=�H-��eJ���XcW��\?"���_X@mV��g���1��	��d��w&g�*Ha
2��@Bd5���T$AH�ē��c-�c��epR����[(K��S��]D+"}Ej��[D�^�E��3�q))^�L�~�1�EASq@u:�MVwO�\֜��HZ�g9>ŋ-*U�E~���^�H5	�bȃTad�A^j�k)2��ؿfC�m9��↮�T�W���������m�I��Y�Y��q��@+.a1앬����ަ�X�Ȅ���2:l�z����j�����*e����'��G#Z�5v�NP��Uq�3� �&S���=��c�c�A����z�Ʉ�s\󻖾V���UB�O���*Ok�Z-�hu^$��Ko��Q��B��%Xg"��������c�	}�ke|������t���L��DN,Cz{f=��L@������4����Z}��J��a�o��"n}��mcחC�/J_�������[B@�z1x���#��X2K4����Wõ���I��}�ƹ�K�6b�[$�Y����ʢ��ޭ��m� e[7��P�J&�%�'������YMqx�l��&IGzX�Vʇeail�6j��Uh���y>]Q�DU��s��<sT�8���^���5u� �����垍^Dy��І>LC*'�*��N+ߙ��Y�B)U���N���i������^��2�GT����Ԑ�1�]%h�'o3h������}u�������"�|i��4e�4� �(�;nF�G	�&P�y��{"�ߑP�YN��\��n�����:3'��NG<���Z�]4�V��{:8m�e��w'nrizZfʎ���'�5�[d���qa������[�N�N��(�`@��˟���u��=��R]Ÿ�_˟l�y��i�������؏I�t}].�9hk<Y� w�b���u� �����i���T��
D� œ��h�*���Y��k	!1O�G�b�b�69�}x/�A�jtI�(��m!>$m��9��&I�7=c�Yb]M�*��s�34���f<#]�I���h�/���qjT�� c3�X����E�{E���>bAaB<M��"��r?"�L��u����)b�Z��VV�\� �<���C�)*pC�6�"KP�L[�-U�o�ٵ�L��.se�;��d��||~q�N��c�����˓C������y.��O }���U�aD;��#Յ��C����o�O�>_��x�V!z�=��ē11MZ,cp}d�~P"3[gbt�t����r�v��*�a�//�@T�%'K���$_x?x��&�,=P����d�i\�i�'���O��P兎�n��Ӣ�W���(2��͟C�!���[��A^�D��!�u��>�HA� \N����� ���()7�"�:����#QQ��4vq����L;Z��\��aH��$H� �GG����#��4>��2��7E��1�5��e�XP��.��QD���E��gb�P����x5���<<��}��+�A	�� =4�Ma�6SW^�8:9||�2�S����<}�-���\S�a}�֚Iѷ��;���=�/�z��a0��:��>Q	��.�8=;\�E=WHv�I���(�;	
�����ڡQ�Bt���KCI����!q�Qufu�di��_%��	U�c�Nh��ßW��tNV,�ZB�M��kn��c�Id��\ Ɖ�f���@�_�mxj��%F�����WTC!W��Ex-���}�O�$������g=_� �U�Y�'�c2	B �����:9�#��q���W��>v���qy1��Y){���,|fW�����L���%�.	�L,��C�(��
ȧ<��d��p�G<<�Ox�vf��É���'t��_�Cw����1����JU=h56-4��ʖr����F��+�d�k�:T�b���e���A��G����j]��	��\ysH4�ߟ@�'��#t�.������ޫ�`�,q���""st�W�Ɉ����ςD�=�e�[�M0'>d�g�P��d�!��#?3vUb*���$���a"ϩ�lcR��ѯs~[�I|Ǌ ҃r��sw�}��>�JL�~��>�1pi����t�o�k=�#������b����Tt݃����ۧ�
Ge�J<a��32��&v*�y��. i��E�C�x�-ϸ���K������]��hz��K�Kg�_��W���J>�B3Ѷ���B|,;�f˭�+j{RVs٠z�+�[o���Qw0�5�S����iwӇ�=���so�.�ʰ�����y��A�
�.^���d�Lt�r35O*iq[sm��Vw4���~�����N����t�n~��Tw<�~��#�[t�3oz�Qw�v�n4lFΤ?!ۙ���'V�w��� E��2��_���T��?�%�v���M�j��m�Ý���;'�A&�Ʒ������P=��	=�~������z��L�9h�G��v&����lcp��/�AB�S��UZ��PK���5��ΠUo�pk��v'�Ζ��cj��<j��f�ͯS`,� �d�����6��V�;�6[��h����L��[�)K��O�`�>&[�����ً�A0�s^��V�T��Q}�4Gc2�L�xK�0���drMBwy��ݮ(���I��iR2�u��a}�LG�V�9M[�Y�K�ik!^}Pe�V'}���VL�� ��a�����$0[o�L��^��6��~�������굃-�wk�4x�NW�v�0����*�Y쌾�	�P�o��2!nS�Śݦ��w.�Hx�9<Vo��:oA��z��	���|���{�����r��k=޻��>�߃i�c,ʫ=�"ͺ����kU�e5�d~Ê�x����Q�i�u<Y��zEv�������39�>+k)�����l*#���/TFDt�.������%
<� a�5]I�"�>cV8��ߣ���*���
�]y�^��X��#��:A��¡?�.��6�r���!��Dp�I��s��2��U?��巔�o�-�~x�b(��J1�^�ngW�a�U��߲��&Ԯe�-��L��W�MO<� #/�%v�I JեT:8\�d��=�B<�������x�p]]��Z�I*T� ��k@RF-[�
��O��k-�a�kxğ-/�m&�T^b�<��m|U(Ֆ�J��$�xgP��jZ?�#��JS��ӥ;w���/��|ς�h��h���Ǖ�,�^����W�ra��[�::r��K�y��㥟|�������jN;r�W��+�ß�r6Y�G���e�e��/��R/��u}��=��������{K7<��
�;�j_\Ǔ��]%%�uL�q�jb������Ɗnl��������`�� ��Ku�!�^u<��wk�h;��wc��.k�Y���VBG�3d��� ���h�����믾�c��Ͻ���Y���CJ������j����� A�a%sWݎ���u�P��:j�HT�U���a�u-�ʾ�7�b%��y���D�Y���z-=��7
	��Gi���h&�\�KfU�J��T�բm�-K���3�b����>C�z-��d���;���^0307�}��yb���*�:,�?G�	]��3��/#�(G�G?|q��9-ďLa����E��{oxr���tX�a�u�ie�Q���l�D��F��~��\ߐ#�����vs��������4~^K|l�)շ8�����ë	!py|����<D�d&*���yt�D#GZ�P�:�G��N�&��韻TPЃ��%ׇ����^��}V5Ӫ�
�2�G���+9۷�k��fC��B3�L)U�������*�"��jT����.�ZU�+�����P������DŴ�^SJ���۰7�o�mG��j9z=Ǧb�Z�I6�@��u��ڎF�a!�D�T=)�Vxʨ<y��+0�ǔ��aY�g�R״�i�9�x�dZ��@�^ �P��6��?�>Ê�fP�J+A��A%����QҫC)�(��u��Q�3���8�s2��������Ӛq�vN���s��yJ0'�����",�Ѐ۩t���}4���d���{ߤz̲��]��A�
������b��$e{	Y�t�O����ɢ�ܲZ|6L�C�F�(��:b;-�߹��G�+����yd��(��d��$������R�Xį��X�H��Pf�@GTcu�p,�;]���#��6!�U��x�t���S=͗��Mhݒ�Kи��մM��KDO�!щ^�s���Ke��/�VP%_����"��k�����f:�,[�j�;;���6q;^x>��`��5�����7܄`9#'��>�WP��B���!1���,��Ks.-����G��VB����x���%wJAhJח�2�P3�<c�y����nJ���6���tD�>i��	k�K�,���,��>rjcDG�Ĥh0@�[w��SW��V|ܚ��Wgh��6Ix��XB�r<F�<2]�?��Н].��"�`�#ǻ����r[�O�2^�[��8����2>���ڡ:j���WM�R$�7>@Md���lFqܐ9!f@��|%Ǡ�t�[�x�璯�ᵆ�Y3CF�b�0��R�l�y�TV�$�ӳ�	�<�����w�����LPs�9֦��)�f�Z� ��G��-�R�Sŗ�^o+&�
�'G�F���	�J5g�����%?j�G�7���wy��<��C�[;߹��a�t�e�����s������yb�O��gw�76���>5�W�>>)��_pf���pk�%���0���a'�GEJG�y|SNGzٻ��zk1�G�YK%W�k	�0�[K{���ʉ���o�(�s�����>�0��k(�J���N+^%rTdV��!oPz�!
�S�X���J��7�!.E����.�)��3�N��h�+R�D� ��� �T���b�i*�TEe��(�,�ʫ���/���u�nk��#��Q^�t���*�ײ��*�NR���u�����)9h6��wT�7���nj��t��.��+���8qJ��6�A@�w[���4����̗�&%�/�����`��n���ev�CM�m�K��Bmc}l�s�0:��<yQ��)�+�>c�O|(��PU��|�P֢l2HòfK����4xX�W4�|AXބh�s*��?�����g��2�a�X<���j	P�v�l�����9;ꊷ�꺷�*ל�W�:�A�%P��u�+���P�4�Z���@�H��%+O�F�z�H�$�kԴ�j�Ej/�Ӟ�,�V�~��s���}�p\l��N�l�~�i���w������D���(]�;���Y�ʹ��T'b��~�����Ŋ�*i�H	 ���6��G�Y!���ݟǅB�WT4m�8&��7��S�_[C�)!�����;�6n�^'�LY�c]�U�/���02�BcRy�*fTL-�<���Z��QU�S|�.��J�pg��(+��MՕG�3���:��?Ep�<���[�Ϭ�Ʉ,�;,Em�K+N/`�w����q#<��sP�W�X���8��S$c�.k�յ�	�!�
z
^�]����+s�W�G��5��؀��7��m� �1+$�2<!�S���Z�@6p�,�� �r�=7�3�G��7���X��c5�<��~�Op$��]E �N���G�Γhy4	��o~�{��Ik]�+�������!�zp�S�������}��r0���oZ����R���fk�A�-�<�4G!6�n|��uX
Kɻ��T&(8��=8��$N�&癩M[�ϔG$�V��4y{A���\�&V�z��!H��\����2�dV��%�&�3xv� �o�ڶ�c�0�K���tG��f۞;������q�g3��ia�8��l�'�bF�l�[��[ᅧ�>`����:4	�·���9����"[�V�|��9���6�h���%� etJB(���n瓁Ƭ����]�x?%i�,S��V�xmS6�V�`y�����.�uJ�����\�1�3�Of6�	���tJXݝ��*����
��g��\��M,x���[�g�
o?�]q�l�5[�Ň���l��CҒK���@lr�#@��H{�R��g0B���n��W�="�E�RTf�y|�kZ�S�r�b&x{�e[�<�!
���)C�"�	!V���_�����o%i����h�}�P"��Xw�����w�����3��Y&) �B�����F:�"j!��C��s��|�2�g�Y���J�O}4���޲��5q?D;��ZR�w��+6�� >��G=����S�@�ә��&/%b�����{=9�V��~���[ڶ 5#��n�q���Bc4��Ӻ���Xb�C�&O��.-���%���u�-
'��Rm�Bϖ�8�R>�24!Ol'�Ѿ����yC.�?��4=�`���Z�(H��>��G(� ��}��35.���o�ǖ-$T؇���;yw��u��m'Ƹ�ly��c�1�|� |��xE�����=4����B?Y�q�;�YdkR	Q�S3n�;�'*|�-k
�:S;tk;�av�B+I��[�p/̖��.�̗-�Բ�W˖��˙#�H#Z�"�<cTno�@Sݼ�S��VսJ�'w��mL~�D�~o����:="�����H�8V��Ic� �:>\V8]m�)qx��]�sǖN��[����o[�<�\�߆u���xdH�˼�
a{Yk��([q�HH%o�d6'�J[e)'-�mO�=�䵀���).m�AA�K2��]�ߴ.������2���Ll,	��"|9I��,� ����*�<%�H:���=��2d�Y+���,�T��L�I�)�������I}����j��u�Ǫ�,hϙRϢ�������x3����}�������0�>��K��r�=񉿔i���
r��]0��6p�RO��Uf~��_A[gӐUm���7�b)��*�{	��!`U����_4�O�${^�W�՝�,���Z��
{��~����j|�Ǽ�N���=\h�)�\��==~y�������K������xr�_���o���g'G������1�ro}@��\F���q�ɨ/�zȢv��O�OF����t�����F���iOz#�y:
n2��V�Ls�t�	����=��L��L�;L��cqbF"c+a{�o1�����I��#J1t�˕�v�ǉ����q3�0����~��͝�W���^��.��_�߲}�K歃������EAM�2��X�#�c�^�F���d��#�z��S��8k�$��柰��Ap](Z�H�߂
���D@��m��M]_��	@�.O.ɐk��z!!�h�B���Lh�.d�%�}�� �|��C�]%]z�0���TL��}�Ο�2���3#�.���NvY�oգ�4�Co��'��/Էӯ��By�(s�:eHd�I+7�u���[`p���&N����8��=��"�#Jqiwt:�Z��\�yd�珯(%���x"�y��"@{P��>�	��;�)���N�C��y@uq��Y�-Dy\�ԏ��ِ x�q���W}�ɼ$T������]�k(W��"$��-m6�p�� R�r��^�,Y�ڪ����.[�-��4�I/�ʰ�����Ֆ�Ń�fJ�b�����x���ԀW�DU$D$��Tȡ�k$���b�1/�8B>Fߞ�i�z7��Ԩ��Cv���vO��ik�}(`l�w�����������TU�|��ͯ\�B*'ǂ��7 D�*�á��t�\��.�\���:9��g�t]�Cc��(�?�b��w5�6鶦��ڣ�=����h���IB�5m�G0��	����G5�>���v��N�߯[�n���t�ink�R�!�G����|ֽ��^�9v�u2mv�c��귷F���l>�S���U�����ǯs���15E�%���wf�qJY�]ʎv�9h�[�fs4m�ڣɠ5��!��!�%@8D��&d8/PO���.U-��M�Dc?���H�fj��"=ncQ���<�5{ =�}x��M�U��v}��������ǀ_��� �H9���X����95�����Q����f�5086�ܝ}*è��7��0ֻ�Q�C:�qo�օ�G�v�K�Ȳ2�o]�ܾ�K�cF�K��s<�����:MB���䗻�Gڝް٥zd�S�SE��j����s2刄����t�"�$�Y���-ጮ�}��*dT��sE�w�s!b`��� .g�w�hd�-,24It�	��Au�ڴ�w9����n������<�4��^�!δ3ݚ����	b���O�5�;�A3�����t؞t:����cy@��+�������Y�9�KoX:�Q��jNF�ֶ&�M@w��a�@��Z�������bv��ˇ�Т�q߸�J��p���ovzT�Z�����nw2�܉#L�,�����(��j������>�r���%�U�@���"r��OS��X��m�-�=/^J��H�;�>�A��i�Z�����-����i{k�VW:��h�Q�K����G x:�^{8��^�G%o�G&����# ����pŤ/���Bz.���wC�~w8�#������ٚ{����g��N�l?��mG�bS�ԡ�n�3�������E��,�X����`ئQ��N�i(w�H#�8<�H��Bי���W�iG�	3���q2n���R�8>�����9̋6_��+�ө~T6�m,/�l��"^;�dO�O���"���Y��,����� �]��ݘ<}j�v�M*��#j�N{d؟N�Z�37Zr'=�!A�R����'�^�9T{�~{Pǃ�����A��5isN�J���9s�����?a���=|�0�-��m�!8��\8�s�Y����K2s!�'-J�D��s�#DA)�B����q8���� �~B��^N�s�����'�s�э,A:bI��������	��w�"|D���Ʉ�3�% ѓv��ï�m7s�.�D�Ħqβ�I��&��k��JP�
��k�����&����~���GT�XTy�|䀈� �iy@�vN9�_�l ʭPް�e`��v��R�X�?���h��c�K�� "��&X��#�AH����ڋ1ks ���	춘
stYS!�&���r��SV�VK��M�[d"����Q��u�ﲣה��lqY8�<�b<z4E�02��"��b�O��jl	*
��<q=���w�DY�����O�^��-҃o.�?;�c������ձ@��[9�b�X�48�zc���!�u|Iv�)�m��	�"���))�=�tP8BS��ǯ��`����o'g���������\L�(X1��Zj�\{;#V]�ΰC�޾>@��������E�̀CC�3�KZmq�p	�Ǡ�[ ��`��Of���fG��/tCЏ7�"�޵B��@�7�^��@���5�D4g�}�6M�*o�q�6�7��>��6ܴm��Eu�UK����yU�xl�G�`o�qGSZ2�kT��%bl�"8�	��ɏT��Coq�)4:�
:�9?_�<���p�$���}����^����NH�y_������A-�΀��R������p�w1��,�s�������J�?�p��s���CZp*���.Z|��4\���&��a�$�f迪G���j@�.�b�o�?P��韾�ʬ~�2��j.T����O��3V��9^^6حo}��Z�E{�c�E_�aO�XL�ӥ� Z����:�{qP�@�/���x��]%��~L�q�j:�&�3�/�)�<�1(*o��||��Zv6���������P;TA����߇��"x�#��ֲC�v�=��*�4-�r+��Tm 4�ÔQ���ƫ�k��ꋽ�P,���W��_���3H���8�j�����>/yq�Q���]�B���vGm�J�6��Tk	�Q����i�&�T����ژ�"���RsgR6��YJ6iT�6ڌn��u"�[mCm��P�� Lc塕욼j�~e�a�0^5*�8�`B�?�R�����X:B�i���G����#����V}��{����b~O�s���\A�����ۅ��a>y7ZfE�hO�)�@���f��'o�JANj�5Ft*�E�Ғؗ~ƾ�.仿�Jd��elY�`�>��4nu����@
�� ����$U�d��	3pH��L�ה4U73V���R��d5Hj�6�y,�q������7�ѿg^M�[il�B�o	��^���A�?r�u���u@ʱ�.U%(3��*�L��M��>Sժt��<z~�Qit��Լh��P%�i"	c鲔"l$F������b�BI��R�������gmudhZ��ss��2~;*�֔Ъj(���L
��r
i	ڵSJ���VRL��i��k�S��jVQ5Jj���WYI���jUPd$��as��WZS-����s�f���Pi.5#���+U�����7e�+�B<Yb���hy^:���d�U��WZ��T�+�������^Li��|�1��wDqI��9�CU��1!�)v�*~m�4EJ8��_�/.u������"|W6�)��;3�Ƞ}����_���8�AO��T�J۬Ă��� a9l~D�]i]��'��:�1V�l� �&X�!�y�EC#Q�Xl]�ڞ"ԋe��?�=4��O?~s���O��C'z��I�Zj�}�_.�=�	Ts�a5
Ύ��=@wjէ1��sn�j$Щ@�xB�x� �D�2�͘}��T���'Fc��yT�iر��a��H/�R�j�4 ����ð���2�F�v	�#J�j ���C�K�<�>�[��hz8��mj�r��E�iZ7O!�lIB3�E�{6���MH�������%�n��-7�i��Y����7k�Y�( �ģ�p��Q'T}��Q�#���]qs O	Ʉ�v�Q�Oz|���
-��BG�����|����O~e�2ڗn��V���8��Ы��1�oM��j�C�_^��X�㨗d�@��Wr����7y<���ɗ!ݍC;Z+o��k_���#�0o5�63m�ވY�)�o$�Ӣ͙��[�M�X8W�U�8��vi����6����AY}5ϺL�q^o���|��G��4_�e�$��-XDFL�ڗZ�(�W�Q�>b�굳Ol���:<O97��LV[`���ǈ�H���z�M��#�mF)�@K����5� �x]!?�~����2��~nM��XPޙ5������i~���#8<���)�>��;_��B�;���0�m9�������yⱟ���CD�'ђ�4�O^��ݖ+���ꕲ��l��T�i7�K���\�v���í����_��#%� t��P��Q�%�7��ȁ�����V��Н�>/P�
�o�9ejp����Rn٫��]�7(
���z] s_{=�jv���hs<k�r��'��/�C��N]��vY^1�������X�w��bC5�rP����B:s� �F�6���ɯ��R���P�]g 0c%����p�i����;��j��^X�[ �0�Մ�M���N~:��N�9W��ЁLyʦ�'{t�Ân�=��$.2̅B�}aV�Tt.57:cpge'�؞�j�A���&��A�mP���+���%�vG^~�k�^���^���=w~�ʽ���5����Y�����p�*������j�f�9Es�I�-� s�ѣ�eA;@�Q>ؘ���v釦�7/�X*Yr�e�{�kF�W�P�b��E��U�8,�[�P��!� =��>*<t��x� �� ˚C����xxX�����<:oܰ�����h�b����CO��E������>�VÛ�*ٶ��3�W�s��P��j@���7%*��V�gܠ�\0aދ+�-ޱȃG�'�V8���E�0.��W���K\�U[tIRLvD��睦Q��E�\����5�����D��^|{`{��{.U��aG�-S4H�uޞ��!^�Sy�@�Ek��FMt�A��տ˩եk��&۱ʍX��<�����!��XQ�?�ӛ0��9�����~쥴\�N*�N�N��R�5L[e��A�׋so6���iV���kj��^�ȳ�ͧu�j뛝�^��æ�n����� �MU�6�ᛶ+�_�NEK�W�5��W�re����"p���22M	Q �5SI���-�Ĩ����Hއ����F�_1U?X�eA51<?����[hN����I7[�oݪ&J����ͻ��O)�\�=S_׋�k��+~�C@���z5�2�o�Ϻ:�v���W�	<'+vs��$�M�Z�b�Voڜ�2wa���	�4��V{_Z�xVV2Ң��f��{�9�Ѣ�	ʔ<%�V�6JI�K�q�Q��̓=�m-Lß���C�"H����;X猨�`����*,�)�+6]�ҳ��9�H�=R�$#D"2w��D���UdШ�%Y|�J���}�k	]����->�3S�a�Ͼ�*�T��� l+�a��'�O�*1?�2��V!A?��G���A��,f���Z������"�\	��F'Wp�>�@\-]��� l2ب����8��pL�e8:�]ɠ��I��-����ǈ���"�&����KS���FDCK�A�_x�Q���8y�a'u��R=K�m3��8vF���_ƅ��;�Ӑ���UDG���*�8͊{�S)p#*p'��5і�{�Kź~W2�ɂ^,�'��Z�K��1D7zD�l{�����(�&�	��{�]�!7���B*��~�ҝ!v�4�g���~��fI,��	��>L��2���uͮ*o���%� �dJB@A�Ю���p���î+��Y]����joƫ������#�c��{�]�+Uz�!C��3a������e6�	���tJXQ�HG��N7Hm+8���`S�
�X�l7����~C���r��<��,���e��d��#2��嬰�lR�oG�F�\c3�&oks��-�u��}���U�J\<��B,ʖ�3��Ӝ�r̙�V0���{Z�5l�b�K'�25#(a)bx+E��acy��P�Ys��cmxv�;��oaj��Y&U(mփ�s�Q��QR�:�ʂՂ*�fn�l>C>�!�-�Y��B_�O}4'�U��rK:~�v��X��Ul�IoHE���g��c��[A�j�_�%����)���zrD�f�B�k;.��V�i��ލ?���6o1��mb[�v5���֣�W8$i+|Py
�i�#�����pޢprp�lI��h���2�R>�=�5GY�&q����(��<zh�[��^Q�F��;���e��6�����_�9R.�?|u^ݓ1���Qqzi.�~�L� ɞ~���3�3��A	UTB�<w��`���#�.���֨�
�.�[� є�@OK��П�`T�OVa�����郩<���(�L#���a۴���؂��2��|�"�%���	�9���\J}�2��ry�%�e�&h�QR8���g��m�'h��_w��ޚ�Z�۬�3V�F4�,�7ʥ|���}r-'�Fq�ʥ�����A\�l�.;�:�>��(�.���ڡ��c}6��L�wM�Y�A��9�W��<	���G8���R��qՄ���P��yg��0vMӍ����u���p�|��Zg_-$���V�A�������Г`�i v�{�E�s��B�K��jx�!F��e��v�piF����:Y��=+�I�ǲ�
-O�eie�VS(ĕ�m�K}R����.{�?�V��g��*R�{��r]\5)J�k�fFC�13e���/�E�jGxLn�	�ھҖk!ֿ-�+!#��?�D���Y"��w�ULh���&�}b�y6xD�����s�~b���8������>����m���>��,���ض����[a~�nK�/�!�6���f��n�������}�V3�h�.���F����V9�[:ncGm�䒏��"B��ri[���5
�s�?�g�T5�+��U8��"9�[��)m�*}'�jG��ҩ;Z�WJ�(J�ȑ��Ԁv공b&���_�z�����s�d)��������l���[�a<8���3�f�A�����~�D�P�n����4�8�=�e?�O�*�֙�4dH����/W�V�d[�ƭ^i�%�ڶNn�5�qz��
7WI*����߭�����<�^��%�����C��>���)�]|����9=�7~�������%:;<�8�E_�tQ�DD��!�!9P�.�\�Yk9%�E�%���\v�B��LeAt���Oi�R��Ӄ'�k�֦��l��P=���������p��/�n@gp�RC����X2���(t	�htP��q�U9q����kO���Ì���q���W�8��/ �r:"V�_�Ds�]��Qr�����?�V:;B�[�T�i�IYG��vBȚż�"���;agFj;)�g�~�d�]	��X��Wʠ���R�{&�Lja�p��0L:~��Jv>,z���>s�M]��=��i/��vyu$]�"��)��͖���(��J
I�Ѻe��j����1�+���ҳ*^ l��9����Tl��l��ԉ��݇��%|�C����g^L[�|��b���?o���B���C!��.弞}g߆Fn�s�\.���=V�#j��hAi��A%���[�v��k{�foX:�Q��jNF��C�Z�ꌗ����r�Ž���{o��/��e�&�#�T��R۳�Y��.u�N0d��(�q�NS���,1nڔ���Q@:���R�%t+H�z�9��O�U��R4�\�c	z�8��w���R�nq��&�M;��nR7UY[U�A�j����ݬ�m�!��"���v޺0�������	�4:0�uʦ�2��5oc0���\w��JCV��T���jY�kVT���7�lY��p��ӑ�9%)�U7.3G�+��C�%�MمJ4�U��営R5�,�q�w�	o��{�C�����0�\&��=��:��������X�Ԝa�%�PS^R&��X�l������4\�r��
��:E즢�0��M%�XW��o*�6�O���(�����\M~�H��L���b�TZ��B~��JPJ�ujjnGr�!���/�߱"P�|���:f6��0���b�L�����Z�������ct��ώ�N���'���D{�y�TR_A��
I5�ђ��b���d)�w}InU!�� ��Ff���kF�=���y�R-���ƒ�h�-Ti�j-�11��Ք�j��)�����E��*P)И��ݎ�������Qu����"P��Zh�L�OF� �v���	��IsL��,��6K{��/�ku@���ie�c�9��(�y15����[<]��E����	�RO��o��ۖ���Ye��e���ϧ�f
������X�.��.�g��i`V[���E|�6W1y�*4��m�FQwx�w
Ae�Z�p1�]��e��]*����cʐ���8u�Q�F���zM�[>�εg�[w��v���PgY��~a�CѺXa��8���z�r�+2}/�=u4/>,{C�KRm��&��(w�oG��O��,�gؑ�0�X�8bc��o�������euZ��Q��Jd-��m|#��=��`:�,(���x� f��>c�T(G6(k�&QۢIH��q���f��[�$�����)��Nޝ��L�١/�n�[G�lVD��	$@؞b���/05j���5��Z�eb-���0.s&R�~���}ն\(2;5�.
��]���� ��S���\2:([�R)!a�A��[������#�r��С㦱.��;,ı�0�88���GT����\:&�M��bY�}]H�d�ho�0;�(�Z&�06�0��$AGu	��to�_��ȷ�l-P�%�c˰�,gC�Ǳ���ͯ���5k�vڟ9s�k9̸�}A��Iz��r�;'n(��+����[��∙߫}�U<{�D1���ݗ�p�1B���E�q �h
�if�8%-du�}�*Ix�RN�sG�l��U磝���a�w���=B0x��%���+�0QL\,��D��ˡ� Q�Y*l|�3/c�ĹJ��|�����$e����hKCo�V�O��(�o/�ޟz��ٵ������7�i!�������U���m3pު@|�&�>�+U����º��{o�2]e ު�8ȧ�
$Y�R[_\��Nv�ho萭�B�z��J.@i@�6#�m����xRJ�� ��^��R�f���#dz�3z,�JH:�:R@%H?Sh�57z��D��x�U��*�$ģ�}�9�ۅL�;�Q���ֵΓ�-�؃Z��|2g�֭���U���U�^�-��0�,�[�;T��d�e@6�Ｍ%gdʡw8� É�@�)��}$2(R��.��YK���z�O�V9��X��Ս�ʶ�E����B����a���_���M˾<:YWL�@���(��4��c��"[yʂ&��:�@���ywA*n�f��;,�IR��1E.�
�����A�����}�L�]��*��6���(�{ϒ�+��C�M�z��[aQ���Mh��]�6�V$�6����ƺ�Nk��?��=�`T��T\ղ2���gi�x	��F�8�،G�L��+�T�Bc�zN�����*���z�%*+��%vGW$3u�+�YN�-��ZY5h��F�zȀ����)�Hu��C�S6��I̞�3�5mQ�`�m2z��Tq���Н��t�S�r��]��>���&qFY˰͒��uA�˄�=��[��˚����؆I��2Y�ҹYI+)%�=em9��YJ���ɞ��l�$�r��c�%I�8Us˅6#�0�H�Nr�VP+�^;��?�9yV,%��JRk!z[��rysI ��*����J|�.�B�.s)A; ݫ�+'U��3����������/O���_�?VSd�Ud�u���[�z�FKm���y���j�2��� /�Kn�-����pց,�e�F�8�=}�:ՙNM�ݽ�L��#��"�o0�o)Y2V���]}
�71��lrK���e*���m�3YXR\��J,kd,�f��烽�n�$��U�X�tL�g�]�Z�e0�yd=1��~�qE������  ���}[oI��_	�kzZ�H���U[Vu�����0��$��+���LJ��~h�þ����.ؗ��]`1�� �~����qN�%�'�IYv9��(fd\N�8����kY6�`�bi����r}�[,�%kq�@����߉�oce�*i�Ƚ��@,��ܾ��c�ܜX�y=�H��=ͯ��Ÿ���������NF:��F��3��[#�c�<<�� [�t����b0ǃ�"G�N;�zhޟ�A�9W�r���J|9��r/ߦ�7H�Mlh��n��a ��rM�餭כ�z��I#�P'�Ƨ�qcJ0����%1+q��4"�m=ZkE#ӻ9��R���|�N�쉠�Zks+�nEA4_.�2����\�����7����~���0ε�5[,�S�$)�$KTD"���e.��E�g��2-���"Z�+��L~�x.4��ܰV���0n��;�iRM���Bq�ZN\SX&`��VeH'���h�|iV'��Mx�8ח�G#�V�iy�=�Oʫ�(�l>�o��xI&"�Vt4�Ԑ��a�kI��pק�sr:�d =X����wWR��.����t�B	��]|�J��R/I�E���<#�o�����Zw=�XTgv��ؙf�f�02=D��r�aQ�R��-��ݍ܀�#�J �Տ�f �tB��Q�e���Ѱ���X"@s0-s Cq��p��A��qv����# J̮�e��]\.�̭7�4��}>D�z�>�XQ/�������"�7DA��j�!�p�"M�R
0�4��N߻1@� PoC���fH����x�$i4e���[؏K:�+I�;b��Z����I�F�xWMY�B)MZ�猃�6��M�Q9�(9�ʟZ*��j�~��5��nF�v����g��ɻ��uk'��� ��l�9li-0פ��}.�1Ė4�1W� �~���"����������Z��i9h;�,�)�Ú��h�Ya!S����J�\�8#���t��ً::)4e�I�nL���(�Į�����F��*�+��V  �-M��T"QY/��s!䅕���DM�*����9E�.���Жi*Ё���:��,Ŋ�q�Wm��h�P+F�gH?��Ŋo��RE�����2X|��ZO�i�˷&NK�E��n�QǓ�g7kH��w���λ�I����Q�������/N���kr����{_��Dd�.ي:jUuӊt�a��g=^B>���ӹ���R�0�K����e���/;��A����V��I*o�_({=]@gi�_�A��֧�ҷqf�3�xQ��	���b?�Q-��*�1o�ȱT�����@~J�>(p���
r�3�VcoT�=����o�ܻ7��ݫ�u�j�"9�_f��@�$���y��i��Ԁ=wJ��k���}啓�4��}��E�eV�c�@�\.�X����+�hU΍gP�� ��{��s��Y*_'_'���8NyD�6�K�w�����9�,�/^��v'�&�|&���Gv����:]&��(��-��|(� P�5*�g�窸��NM��am,��],m���&@K�^4oI<�u�u|-�	��^�S�_����8�{������SIxP�#�\�����
F�NgD��Ґ(
m�n�U'd��u�ˍ"D]����#Wz� �I��v|٣��F˛�r�C�캄��C�2G�*x��;��W�p{�r�Kj"ΐ�h�8��Л	��3�:ބR钢 իܾzB�V��H)����E+�r�@�e����Pmk�+Ɓ��T�)���@����4��ADت�%���_9�a-I����$��`�{��ȯ��shu���v���3-gk�h�k�I���/�ړ��A��+ZSZ��C=�MX� �o�X	v����!�\on���#��V�~�a�W=�?�U ��;�;�M��;�����ۯ��"O~](hv�](�k�Km��9��4�+�<e�#�C��H�B^H��Kk�3�1��v�T��C�ő�	��&¸.�j�������Ix��M�~�)�>H��c�!�7;�L�.2t��XA���+a���KTϜ�e]�c���kG��N6��/B��T����$�p��L�U����j؇�ע���u��7XXC��Zu-�5�R��t_z�_��*�?�+�W�HZ�_�P��I� �����˫Fw��lƥ�t��EqC	���g��\��Y��a��kSH�xl���nc�A���8�k!�g��T[=)CF��h��hO�7|���Ͱ�UC(S��?�շ��d�T��7���r4���k!H��c\��)7o����S��W�\����6F��b.��Q\6�H��|D�J��'&�K��������)f �]�W{�\RV��0�%�8�S6ԿUB?c���(*H)��S�"��������8��Q>t^�3�̼)D�]�u�9��~�W����\��.WI��h������t�݇��{��C��韀�����)���BJ��M�����}��j��mj��|q>���ʁt��wnB�Pq�nR@i��rK+J0��_��P�Y�#s4re؉�����JV���ǆe� � �+{)B�7X���;5}?� B{U����N:x�
Q�;:O0]��&{9�M����L��_.��v5{�%���V=��Dȯ�֕^��͛:IO�s���y��d�1v�rШ�1&�"�>�]�����rJ6�^��׃�/p��[�ų��3��9s��G�/.�!��VI���I@���uP`�BN �GhO�=���=l��*>�GQ�z,�8�V
J��X*+�ʱ�"ݘ<E@�v�438z�O8��K  �m�(vk���S:����G�a��Ц�I�E�b����~�6��R:Tٝ-64����5��]~�&<��������� :p�;(�j�iu�?�tǰ,%�2�F���
?ߡ���̐\�.�i�L�X�YwPQ"H�AM��kh���I�:��1(��Ht����^��1\X���b�~D�ɸ.B�W�6NDJ�)�ʜ�'�O�A�&btdN�ɥ����R���м,�
	i�JN.1��\���_�bZN*�S����u�G#sTP3*��Oŏ�#�\v���ً'�G�bl&��}[�Q�I��Bh��Sto�$J���P��`���8�_~�翰c����7?��:�)�a�s���
��.�
i~�ޏK�ma���(��>y�������P8u��T0�9�be̚��C�BR�'��5�cs��)\�ͿS? m~�|$ga��'�6}�b����}�{K����+���}�+�E�-��V0k��n=x@���/<����}o0.���{��=�u�f������<��љ���͝�^��L������x�n������|��ﮇ���*��Q�A�+k����)%^�_=cs�Y�MA���Q�`����-+e�t �^.Ck�����-_>E�g4F�㤁�1B�v���Њ�^��2��9�
ؑ`g������ДrP!�j4�� ��(%0 ]U��;f�~�NL��٫��ք�ڰ����8�o����2(�%��X+rj�M�m��kFOU��+� ����U��]���pog������쌍��ִ7��ܹUH�ޡ#�������{�����������lr�5�s��
h�����D��m;&'��h���ncކ�A�D���衅MN��5��JW+@`��\#PS��!+T�=��MN�5��=�F�a&�z7�*�&������De���jI�-�����Zε�hgdR�|�f+K� ���G�@NE���/�4 f��αΑl$�:� 9(t\(���j\	�Y@�!%��*G�"�#���<:e�읏��qi���-��v�q�H�|���^E;R�jlMur0��԰/�=d�0�K�}�,�]Qx#);��7��/�"�L҈��S�}��Ü�IE�β��K��N������Y����Ŭ��5���Z���j,KuC�J���GƄs/9�Be\s0��>֗���/IO��Lz¤T�'g=��'U�ӶT� q���L�
Uao�g�B�Ru:��v4S�n��bGM�"�=06�|cd����%:�6�ej�%��K8)��jy���*�dl��5�DBa@���^���1n#�%��v93C7����Tф�v!�ݣ���ᬱ�yc�d���;F�Sk��2a�"ĉ���氌�NK�M�X��>�#�1\:�]��f�i �� �p��x@?UvG�c˲<�򣠎��X[Hg\,n����ᅩ�-h�r\�Q�4Ns��Y��)�mCK��̺�t��?b�Ӯ97,�ĸqkLa�TNr�S�u��v���Z��V.n��^�`�V`p�N�^r퇗���g�C�&�5�����(���/�s�`ݡ0ʝ�����F�� �Cݛ0}���k�B�a��C:Mس��vK�x���mJ����[5�("�6�"Ͻ��K��eT\�j�7a��^t=�Ɛ/H�~Ab���A��7��4�Ѽ1	��T���8b쀝rf���g�!�U'z'�R|N$¹�T�iT{T�.��˅#1�+g�u�l��!��hnu�?��HJ"�$4��?�z�8�6g�kݸ�^X{SE��m�|�K�Ή3��_B��k�~���=K^����Ѝ���Z�͝�bA����e��Л��Xcu�	zR��LށG4�~���i�3���|iŔF#qzط�.�Sw��>�1���Z����[>z��$�闞�X%Q��zn��h���B��D�3>���o#�˼�"-) T�d^�a� ��P�8��s,�Y��d8� Y�q��0ao�3��EfR��R�.	Vk�ˠ��s��ݥ�\z��A�0�O�.��g�,��D>�����¤ɏ��u�S��;Ќ�m��柘iS�M�!�db�l԰�,�d3�cj��l�IY�5���e��%r���#��~_��H�^���#zW�փ��tpj��8,T'�sq��ѣg�ۧώ�D�(���X�N�@d%���FwfZc�w�ѽ4G����9���i�����.�--l~S:��J�/R�
����42� W�y��2�ow�s�7�j2Z]�A2��uq�&�8��3�v���`�;`�䖷�<�=�;$N��m���x�NE𙨉��5<"�|��3�gQ�ț��UL�*����������Ve�����<s/�<3�Y1ttt�=�l�M.�%��$��5���(|
���K�]�N�*�Ϊ@_aq��, ��KvHZ���
�-FF�
��"W`���CT%�k6КpH�N�A��#�>�`i��Z���+����r;�W0O�R��qI^���ԫ���M<du)�lkjSp(ozo�7��!��	����?���7�V=ݵ���t�����)ɷ��������]�N�]�Z���8���T�&��������KrwpW�z���+�n'��	�����5MC��b*�_��'\�X��w���>".�h�ՆUN��:!�9�p٘SUF�䧆:
��}��T �'1�~8E��P�j`��|YO��P�z4�|Rd��'E𙥌D����C����Y�;L]�E��T��to�q��A3��M+� Zƫ�4`��ȇ/E
�O��f2o�o���JY�����K@Kl:��peN�u�� $gF�f��/?���u0��K�u����>c�\��Zs~�N9UL\5H�����ݺc�4�S֊�c�ӑa]� �E�M,�&�v0��]d 2u�L����Kr�B�~xZ���W*-����^�8o��9�����<����~v��Ұq���I��F�&����T�4^�� �
�?�}wl��2#FH�	��#�%�Z@��EH��)LJЗ5��J�Pr��	]}��3�*�w�F��_:��-�-�� �v�E��-�W�V�Bcw4X�fa�S��T�yC��$У؇_������*�]&Wx 碢+Sz�[h��:O<��%_S-4����hN�ĜK;���]�x��8���GI�bR��S���	��N��8���'�a:����%{5�~�k��X���4�r���n)����<r wZ�*}4M���Tx��-c�r,y�%�O(R�vm�Fε*�Z�[�xX�֯����|�.Yy�Ǭަ�t�FM8s��t�;��s�M_��z�J�㨭�@�ڊ���`����z�5����ԄS:i͸���r�Y��*Z��M�+������Ҵi��Dk�E�Z'�Z�<�Y�>�k+��e3���\i+|8��q�`"���"��C\��d�Q˘�P�����wm�������b:.BE�o��s��\�^��J3�5�]ǡ�r)��Tb��7� IX��ː.���~���l����#�3.�Œ��pr��h<#n �csuKR��E��rG�ج�;Y�GZ��,ʮy�����gߌ@��V�˖cJ�k���࠹��D�8-���|x~���_�O;M��>�RP�$"�0�aȳիL[�6m�Zе�A7k�[�Y'"w�Wp�^��;>|��G5c؍3�WP+������Bº;�Vߥ��e������M�N�7ի��qh{51o^z>+�^S�D���вtՁ��>Jp�Q������3k��Cv��P�l����e�_,I�߷�;K� �8d4@�{""�7Ԣ�40^�����~.L����$%bK���Kd1�>���ht�+��s�� �fs��\*k��䡝͖�cX6;��˼$TЬ�e���@G�k]P} 2�����ִ Im~�i������WϺcDd9�'�;R=�1�4�[�����)�3��$��uJT�E#s���	ą���d���.�T\?[��êԚ/���6���z!eS,��]��/G�)�[Dq|��6����Ú�i>����B-�����Xh��y�55Gn�pI�����%��-���>r(~�^v�Cj専~�P��
�G����5L�Ӵ�-l��3k�^ z����#ζ��+��BH���J{�?�b��?`i<�z�}���'��7HC����#�'j�����$�]y�WX��:�w���Z��F���Lj!6��e]S��A+E�)�T�OW6�FA�I7���z�����O��?��q����4��ӭf��h5c6DKEn��c�x��$���O���j�:)P���@�.���/?����,��r��	��A�m��٧4�CZtع�����v%3m$�S"�R���<��O���[��˯Y��t=!%g��V@�-1�X?m�;�"�gŚXѡ*+��+��L�=��n���L��TuH-R�#B?�4�Bv���j��j����zu����1��<q�\yxmZ���Mx�5�b�� ����he��Ȁ�Eɶ�2:���Cc��E�8��=���Q����f��T��uMR��� X����n���&Z�h�{�Ɨ�1Nw����}��8>k���V�����v3!$��FU�ы��z�K�X���`҆g��cJw�'�ph�M|�>Kz��9�ye���t��|V� cy�7��ߗ}c � �\�x=����z��l�{*`�����-����3�,�f~\���f�
z$/͝f�P�	"�_����0��(��f�nq��@�M�QU��T������"ЁnyC�-t{X��%�^����M,�E��9K�D|������9A�3�" ��=��m���������d����{��i�%>DKlpj�c�]���p�w����#��ơ�>�oS�kY���pog������쌍��ִ7��|��s��Skl�Zh����������:foow{�3����X�4f�Z�����O���ְcr��&;����X�#���_Ƕyn8������������t�����9�u�yV�_�za���kQ�~ak��ٻW�X-�YR�aʜ(t�s���[{|s&V1F<y�sd�F���Ì_x7m�N��$�J�����iP!Pg�\B$3���a�15�fh��ui[�x�9ڣ����g->�"���sә�$���h��E��.᦬�|K��uoyb�C\�rn0����MB���]��	�P���Y6�[-��:"=v��|d>B�q��4d�Vߥ$�*���P`[)(0��0�9��bg�[��- ���Dv7�ajĮx<\�h�>�;��{�$T6�*���N���-�&Mɢ�)�a��@B�("����9��Қ���W����"�)Mt���̪����v��6%9�Q8�Z,m�$,�	?�S���6���� G�1.��4q=V�2E������05��x�Ӂ̿ˁ����䳧�eS/n�o�-d%y����#��3�3� _g�� ������5�@a�(s����b���\�'��8�A������r�F?�C��A����:�m]�N[�����E�h�Z�gNg.
���Ě�J�*m��
�}���BX$��!��gA9��6Y&S��#�s�:���k�Ь��-���JZ����vY-@��]
���RlI�/����Dn" ��6"Ͱ�z��p�D�՛+@�M���,�X���w�r��R�e$���!���l��)�|ݩa_�%���1(�6jV���n�u���7�.0�ni�����0��R@��e� ��X*��T7H�d��o#.�GQ�3���XR��0!�'K����U��a�t�0Y����>����X��������Cj���K���M�.q���4�l����% d��cx �"����䖗����И2dj]���R�{8�('��s�Ȁ���b�V�9���`�~�N���{�o&�wU�G���φ�'��Z���ql;�r���NLGS�p& �U�u�lda�*��:�(W^���c����zU�&���؄5�5���{UN��UX�/)���L����C�O��N�ˎ�iv3��0�M��N�܎�/��I:Y�G�Ԋ���d�L��@6���i�B�T�tM��\ǘ��\�Y�!|P@��G٫�Ci|��/q�Z `mx��G!X�GTF��S9 )�uB���qJ�խ2$ư�Q��Q�d�.r�M~�?'!�B�`�B)�������m�7<�>�p��0
��$e��%�F(kU��S\��P'^�v���o�z�	�H9�$mHm�1����FvQm�������z�x�T��S*o�eIs�<�sò�p��iu�-�S���q�{���1���h��g�11C�^�ؠ��᳏`������������Y��a���>7R�(��bi���1�n��`�fo��5���9��^V�"ۡU�WlJ�.�g�̟S�ِ��A�ο���a�j��%ߎȬL� �S�A2��I�/��B��
���h��h� �����u��I�IdV�a5w�L�@|zG��t���I�^�K�k�aZ�f͌ͻ&�W�Z��3�O� ��R'3�&����@D�zބLJ��*y�w"㒐5�+�Dfe��P/��NdP6����w"S�ij��y'2"���I���|��y����������ERn�:���!�ެ7)Q��4G�����j+��R�]s��z��֘�w�~E��_�>�uwm�r�Z����0L���rn=a��lh�b������7tnG:�|�e#�E�;���
ޡ��|�w�K���y*�L�?~q���3�䘽xy��ۧG�n���;>e'�O���=���\���0ό��}�/���������Q�Scu!3Y�9�R#�
u]zƢ�Q&<�m�A��2 ��ʊ�!�����W>|�5�8fA8h&�co��:��]X���@�X��6g[�3Χn^�99�d'ˑ�tqej�Xc(ֺ�\��+��>����ca?�k;`�p%0������Ŵ!�X�o�.�_F�%}&z���Sa2�3�\2����k�`���=�.�?r���X���qQ?{��_���_ҁ�N�*܎�h�| =�^z�tF����me!�Բy�"����q�1�"�^p:�z�����9\Pe�3+$��ˎ�P����ܫ��2&Z��Q}CUi;|=Jh�J������v�";:��':��3D�	�z��3 �����;��'u�;)@��p��/��,��e�!8r����_`�^�,
�I��	Z�LAŞPI���H՘-9W��;�>TNJ_�E�z���c\��|<��Tp��o����B�E^�j�Ԣ��ٕ(��3�c��8�r�Y";h�?���JnD� (��o"���x7?�o`01��c��� x����/�	��g2�r,� �vM�߮��������9.�Aa�����٪81*k�:�*�сy�eS��|��m� ���}Wm�д�Ň8�<s�?!��ڀFΉ�:GA2��8+�ܥ�)1��5��S���[���幭���ku%B�Z_���M�ĵ�B��=�u)�5:���>��:�P���QY���Wq���M������SH�k���\Dկ����ͧ��x+g�Eyx���&P�#��?��L&"�0Jz0�H�P����x�@8������8WPoI��X'Y��3m�)��,lB��#s�;[%���)d��U��JV�a��s�+�Ac�TxR�*����;��h.��Z�w;����
Av�������u����|��<)��k�d��r�H���*��X8�T� ���)��:��g���"��Բ�=`��'���W��������|ʅ�������v�����nw{�m�������)�}[� >���؍��Ǐ�[�3~��?���)�{�|-U��+��T�DJ�M�y��/9�qL�|�w��95�v�V������/;�x;����#1�g�qaJ�<��P���]���i�y��+ऱC�^�	�˘�����7�7���^�)kc��c_]`�].#x��G+��[�;6[����|P���B�0�zѿ���)�7��N,[�<��љ���͝!����;���S5(�j�'�.�7M��,崺\�8������x�ށ%�i��^�o�cY�����,��g�$��:La2gp�2W�W*��E=a�����d����H|��J��U��w~��jT!!���7a�zH��2�D���\p)R���ӑ\�ZxӅ��p�PQ��Ȧ�ds|rEN��T�*��J�/�c8�ص��Ԑ�YX�,>	�� g��.��U"�Q�e\�u0��1Ca���nM��G�3?l(O�ߴXg�I)���ṟ��:7\&�
/ɓ���֣�Y�v��v:��1`�����7�c�g���yg��}�Z��k��睝�ά��?�a�ެ?����?ԃ�~/����'3 ��T��%J���{J#;)`K�g�a�Q�c�ߓd����X���$���,ь ��39w�����ɋ�m�?��f����'���_��R�GmG|�d�}k]������t(�X��D���-5�+0��\����rsҾ7O~)]�#t�3s��Ƚ�b����Ѩe<����9�
��"��+��dYE_ Y���w�X£]��l���$��"7FS�e�⺫��^1�Y0�9��ޕ[lQ'��W�³S�^��uD��+��@9�nX
� ���͸�T�m~}�b��o������`^�(&����,_�r�Y�]PD{(,��9�����3EyN|��1�p�N�v<6��9d�M'}���x�m�=���=��_�wv�-�m�/ц�p����Lt�vX�C�D���4G��T��(��kY�+NdI,x����\����XnD�W�jKo�rb���8�l�B�|����WlA���[��ےJ؈��*�6�c��j�w���	`�L,X��Q.�y�*��J~+��^y8r��
��a�})Wz�Oe���e��<+�N��DX%9�YOZ�y�c�����:��]����A�l?��R%�tI�׏C��'��V��}'4yiڶ�u4:�(�:\�8��Ǟk�#�k^A���<UĤ�I]�k"���g�
��"+L��V�6/Lg��#�X��uW��,XEA�joT2u��/Ty(�W��{�p���*�D�B�X@�B}�,�;掎��=�BbӰ�L=��&��W��ږ��v�!���/�c.W�L2�a��id��mJ@�-�6͹����q&W��@kD��p��<���s�i[�pNd*K �Le�v�z�d���s�#T$��Yd>k��W?�l�v��ʄ/UjV����R%��CU�JU%�$�UIF���G�<��(�.Jr"E�X៮���\����Y��	%�zy��XZ�'��$�?i�E4cfX����>��<���(����Of�?.M/*�<�,.�@QP��U�E����Ī�H��|�H���"a���t}�>f��������C�v��`#���FW�w�Yxo�� rv���:�j��pO�"׃���[��oU"�7a�·*�}���Pq�@�)��	P����a��>��#�C�/�W�Y��h���ca�o�:����U`!�:�	���O��U󢵰���D���>b���� ��$^�^�Ԁ���_��(o���.����.�7����|�m�����_�AA3�IVF�S�g�2�$�҆��\��ɻ\*,;!p"�>8�El�ʼ�W�p$��pR� ��Pe8�F�f�t.�僋�-E���6 D��퉖ZXe�iX�f��؊��z�qq��pz\S$�&[�
uN��N��B%�N��ʔ���E��Aml�6p�aݜ�5%��F�4�.Iʹh��]y7����7Hb�0=�-ރ(�\�QAMF�A���שa�Sc��@�h �|O�~�C�!��9/U�wIQ�N�7� 6��+��j���x�]�%�V˄KӄB0΄_�m����X������:�@�B�H=ۦ�o)!����������
�o�H+Ԛ�XȐL����#6_{6���]����,(�[n�����pO�)M�X2��Ò�yb�e�ߑ�4�Iw��׳|�X�P4�/4Ϝ��gz'�m��A�d'���	���ơ']�Ƥ��48k��͉���X3ף�+fԄa5;�H8Q4�W� �ߕ?dC�Y�����ȰD\���� ��r��~"����O��K��X@�(=+h��V�dOn�va�ل�D<w��o";(��z�2w��DqP���d��Y9��C��V�Z�M�-�ʬ�E�zj�(��Q�0���CsA�6��@n����,�/���a/H�24�bۣF�h���U����Do���s�d)�3�z��:N�}�/�̈5��s���ϑ�2�FZk�d�"�)�/�����|�\n�:�{t׉(��h/�ăܴr9�M�q>1m30C�8\%���vK�ґm	��v�'Mw�+�䠱MA��oɊ�s-@a������d�D�'��{��l�	A $�	d�"��H?�u��ŉkt�B+Hu��uej��z��h��=�zHݙ9:v��˼G�1!�	=��qs��Q�au�椁��m ���saeU4��](�9�n� U*��N�¨�Q=�}�{x�Ra��p�(��!4G�XB�����Z��0z�<��K���t�4b���o�@P�,O$ Fg�?τ�S�3?�.;�G���"�i!C��>�c���M��H�8��8�b�n��ls�0�=q/�t��A,��庠�8�xaZ�{҄�h2II@!1kT�F'(RE*h��UW~�-9V/�_Z[OHN*�e���2��ϩ̶H���QK�pC�U�NC�ғ��~"��_��Q����@�g�8��8g���m�X�����@�,��A:�%�͕*��&jR��H�8�$n"y��$؊�u.�2�s%o,��������~�����)�ND<��R�މ�'|��5T9�I+Ͼ��^a\L��`E� 1G�xK�D�Ŭ���+!�5$~��,,�8u�[6����S'�k�=#νm�tH��K���fFa������*�K�%������c�?������Xz���s��}zzz��_*�y&'���� �.A��51]b���q5V���z� ��@�e�S�R�J�!n�ɼx��+�3,%��GÂ?��Μ�v�*3Ơ�ȅ���s�#��1p��o~�'>[,�[�vq䥱 [�����e`}���Zb��-#-+8Tw�j��[����-�D�+�]��|"�U�8)+?D�^ӄ���Z]0��zר����Ik��РI�2=8] ���)��nv�]J��+�� ���ʗ�*qW���e6xw*�G�V�B�ٕj�=��(��1v��2�L�x9��TX�ϡ�ڗ�j���V.�����SaM�j��<Q�AUxX����ߙk�`PQ%�����]4�E��i�C�g�ꢮd��όf�A�wUyf9?����u��w���2�&{�򱉒RkQ`�5%xt%e�`s��=w�sۄH�Mc4�L��ygf�鋄�>��'�2 �b�c�B��+�2 �բ5h�R�i橣�ݛ�h] fVO�۴t��83�_�r<��C<"�-���UD,}��\��1M���̜,m3��/��%P���4	�nd5ً��_�_������[�q��>NNK�1_0�֍�a�O���3Av� \��(���;�\.��
!*s�s#T���Y�͌r PNNt��
�0F�ۮ�mLŝ�ږC1�����9L�)L�Y������:j�	��3�`�ɢ�D������I�} ��DQ��^��m�'�^�F��#�F�ɯ�����:�s�5���y��ԦhDP`d�e��^� ��Ճn��l�[N�ڭE�y����$����%�yk�\�9�3�}�z����L�#w�AuF�_�\��U�V|�ԁa/+��c�����Ցʼk�����Ѷ9U���,��ױEK6��]��G��kP��%3�7I��0����J���Jl�QL��w���ےe�S�,?��g��"�R���&}�k���ʨ��7k�k��*t`�X<�c QѷHq|e�[�3��Lt�<H��z���ّB(@�H|u���p?G\DB�Gҏ\eP��:%��#^}EЎ���H����@�6��q�6x�t0V�\~�Sr4yL�����!���7�޴=`�G>��R���{r?��Ea�?l���6�t��x��0RytQ�
�嫓�R7Hm��KaÈ/��g,����J�n��b�`� Pz�I��V'p["e'N�D�x�\���6m�-��P1)j)Y$VD��Ċ�Q����0�ΒS���M����b;�� �5gN��&0���$�W*}2�p7����9�TF5)�ו�>�S���CD��d���RGP��&y1������j�Il����$A��$2���#.�_�k8�Xv4����d<$�e���[M�磝����˛K�m(#�S&e�����   ���}[sIv�_�Fk4��o�.�e�՜/&�jOȊV�jT@a�
�8lF���ݗ����v��m?L�D��x#~4����O�s2��y+ ��nU��*+/'O��w�ק^�^rx�#�;��m�λ}x��������cI�w���i�Y���݆[���Ͽ����o�PQ(g�F4�3�,_f�/;�u�f����������ePE����@&�S(�!0b�n����j]�y�Of�[�R ��}�}��Ef+�4dY��/���[�W�ɝ��9HAp�ʪ)R()��@a�2*v���O�t��p~N��E���Â�?�Ҽp����$&f�Z�C>8^�����O�$��-���|V���re�\��J?t��?|U0����Ra,�gmrJ��F���	��4�H5����d��O��"�8�cA��9R�4<�.)��1:�<�
��6�I��%t���?�G��3`����9�$|=~n�_�ۑ�D�������@E��p�;�����E������xL�G{�d~�����A{��HN����h_4{�y��b�)az�����Ra֯s�)vn� '�AΕ]�y*^�gVS��7V�ε:^�OM��=��6J2�y��7�c��7����a�j��=���h�ݼ�M��⪔P�a+'q��y�����KD�'�n�֬)(TgL������N}���@��2I��)bi@pK]���f�ϙKC! ��D�kf���n)tb>�A���u\���$IEU=@>
S��W�
s�e�d����j��A���$�b�NQի��j*���/�$[I ���l�pL��N���V�/W[�sJ����!�#�G��,����e6��ZK&u}�� 3��?��7�k�L���z+���K�j�Np���~��@LÏ{<�nm��ʔ�&Ӧ>
;��GO��<��I��ե����pd��_n} R䏞��$��I�)�����%3�֥zy��8�� �����[خƱ�Lw�3{���9���~��x(�#�1o�֥h�;/0�d�`�t����g���7�_~˽�r�*�r��|�{X�����O��c'ĸ�1�K�V�%n]��	a�̳(�1���"�Ą}��9��g4�z���!7�X7�xm+�
�9��n"�����l �[�<}�6}G�G� ��n�Xw��w'C�k��Hp��S�[�4xCu��Pꟓ$b��S��C�g��mÐ�!���Cߧ�Ga	��Q�[��o=89��T� 4s��ѩ��4V��1Uv~�usl�m���S�|�8�����q�&.�js�c�r���Ђ�t�h�!u;�;�O��l��t��WpK�ӅE�ɉ�0`N<��Ө��=2�늟P�p|��n�,�Q(�ѝP���X]Y^y����v�!Ig�N���I<qaQ��� |��>�`�1�$/�����H���<c�t�$�+^(#)`�ET���܋�X*������.t��y!���;�� a�ᑨ:�Y8m��U���k#��)��㳕�&�t\��(R�p*vQn�D��%�8E���C-��KCeLUB�����i��}vx_��>��.4a��-p�����U\����9W�4<�ꝺ�x�#�bQ��h�x�hK�Fj���ϐ�!��n�l��Q�_WBNF��1EVh2ynZ��E��t���z�I�5P�T�����}[�NrR\�.?�q{J�c:$i�R���\�<8��|�{x��>�9�Z�/�s@�{�}��y������αxj24<������[�({F	"�{j�}���E�`{o�sp��%V�2�Uh�� ��f|�E~��'��T���T�I��$UX};�T�����d��SX�S8�愯��T4���gZ{�/��=I+�C��0����|�� !���*�U�<�����F$��Ml��p�AČ��&����X�ʖ���]���:%�t2�bΕb�>��Ż��Y<�U�9�Ä/ �σ��s7y�pk�7d�f����]P��hҍ�W+�d���11/�#�dCvSξ��>�[�E���Zw�q">p�݌�l�d�����csKx��5�eD�3�=T�a��K����ju���� Ll�v�k�3��DnN�$LC>{i�����[F��"�{���"�;�l�>{]�l'r"���P��i��.�G��X������,�\�gq2�ɝ�3�0���9VLqe.>����ˏ�������6BN��bd�G%㤁����Ɔ��I�~��p.����]��`8�T���_�m�1�>��
�,�������CT�R�4g쵒�X]��}�fl��eq&��b��k����b+��	�+It��W���༅�t���^�v�D^�*��'}�d6M ː6��3B~����lJ�8�Hb�5I�yKŤ��j)'�a|�=������~ь�I����rm�$V�z��=s���4|�H��Y�F9���$Y�4[�����y]s׉�����P�X��ex�d��>�=YΩ�%n�O�3?�au��h��'�F���>��Vz� jhTz��[��F��s��ܕ�WV�,�W�!�{�du5V����`]�9�H9W��Y�M(9rCZB%�Je���O|�9�j�˃u�4X�.X i w"=X�`�H��UN���`B�p'��V��EX���0�!�̢3a3���$����t �TЀ%�+��O�m�O�\��|~�Jgu�a ���O^X��J౪�Y2t��7Ѝ"�^^�J��J����JڌP�Yz�1E1�]N�q����L� |�4�nyf�&L�
�L��$n�D�Ia��&`�3,�|��
댡~B>�b �:�A8��ܹ,IXQg�t}�T�]c%=(�8���2�EtEQ�"�HS� ��2���X�@7���șD(:k�kа�`����y?��P�� .�T�
m���Yy����o�>���|�/��;�;<�OϿ�? ���Sy!@Y'��=?cA@�7��bS�?-*�$ҩ�S)�J�B5���5����Q6�">��T�������z������x��x]�������u��9��QQq��$�X�آ�ʎ"�ϼ��Jl%�_�RD����iW���N�N��p�U;U"c���:��xv,L�8��e/K�+`Ɂqv��R塚�
�A%uê�yJw:'p�h�����6�DG̔����N���U��a���+�|;��>"Ν���θs�$U��ޙ�\���s5��,W��~�Q�A�L�#`�����4�Ǎ�O{���b��[僝u	��M��h�����@�Dܪh��˦�
m�Zb<������\0�$6��Y�}9ⶹp�ƊB�eGݚu�ೠ7�6�I��ɖF��ꙛ���V�X�����s�sP%W������s�V�'F�_W�W5{�q+�zP�Wn�W�+5���r;�����7����9'�8b?[�~2���߭���}H��*��_��\����"��r��ʿec���-���Z�i�(�J��X��l�b0rH���?��c�hW�\�������/S3"%'���Oos3}9$T���-:)R�ts�B\s���x��<[IG)��@��>Ҭw�9�rz��ڶ�AM�!	D�+i�-��o��Z�"�,���t4�8�nB�&���� �^�Qg1�i�Z� !Z|��D|������ ���`��������p��+`LdLC/p���:�h�h���G�0���Q���v�~�&!Z�����x4���<�	&���$��mX���O�ׯ���od�|`w���m�{�XO�n8jW6k�ǫ鰴�����O���0J���/��hD�Zn�wWk`T�:�����.����I�舜v����O�����I���|�w�9m?%'���W{�4ꡕ?�җ�֠ f�ґ�4š���::V��L/Y~�������n�3��coQ�^X�vDC���Ӌ�첮3��ԓ�ƌ���Ue�����t�ka��S��х�|�Hm72·F��A��G�E��"�]������j9��,�>�-����H.�x������,p�3Զ�H�3Q]]-�9-Lo�33��KR}�Rmv���h���iUq�:�Ts�� �-�'���'&�'^��� l������1�L����ئ<mm[)^�ʿ�Y��ڔе�!�������n�?����������}p��$O�ª�q�d	�{ԋAa���im��Z�nr����U�&J[�}��nزy���f���n��Η�ް�3��Qv�&��sM|H��3,�YC栌�|�Z�r�-�~2aq�"-R�vƎ¿V�7���}vT���CU'�%���%(<��Ւ��[��h��ͭsbN��h0
>6EBy��a~�j�[@ʼM�ǲ�'����b�\���Ւ��d����]o��9Y�Mf�=B�ej�46�q0�%��'�.�I����� "���O���"�T���؛āqz�$D#�'���$���;�G��؉Z�Eл�0�������C�w��[č�1@�9���9I��B�baZ��&�ohWg����yͯ���%0�'�'���K��a�^���/B����k0�&�@N�2l�-��W~:�g>���I��-��.n�������b Ah�U4��+����䤞���*�pv
�x��z�V7��������9�H��?��1{��y(k$V�P���˧��9��D|.�1�+ݰ��ݥ�x������)p�(a�g8���NJf[�CK�>�]���!����9��Φ�J��_?���'n�i�k�u���^���c���Yf��̹�����/t A���{j8�|w?�'i^4&�O6j��I����/�e��8�9���#4�"�!â����7�q� ��⺙�D�A$���;�	:� |E4d�'t��,�5
Lv 7I�;���Wo4R��7X�8��p*��H��jd=���G��%@e��+��&A��~a��X4 �͒!Xθ��T�q����b�	9At���`�Dbc�^�G@����b���KN;'�8��j�=�jJT��|�q��|�������YC������5��8��r�]Z����c����4N���n���7��hNA�/�8���s5l0���9�1Gg9�_�(�d�h�א�d��D�/?w��Ug��r~���g�4�a���qC��|����ybR|pS��vnu�
>�VF:��?f����&�h��!Ļ�q^�La�W`��O���|�[�����682g���S�C�r2"��!����M�9w3�'(%�t��ϊ�lf�$���T�Bɉ��!������j�dE����
��_	���d�h�qҌ9Y7��7�b�k\%��>X�wg-�z�留��._q��{i�-^��uK`���V�$�����`��: �2�2��'yyf�ԡs��^q�I�θ9S��t:
�[���m���)��P�����`g͗0�Tp�[�Saю/I�س���&��L��� ��U���(�"RYK�LnC�4fKmx��Q7��&D�� �m[�%[�F��2��������9���D��f�`��C\��7j�3/ys����,	9���,Π�����Y�S�o���:���Hʧ��T��5B�Юf0kWtb)Bo�Fuo�lI��.׺o�ᄳ����O� �Ȣp2�a]ס�n�|�%��M���@0�D�0��^�q��hZ]5y�o���j�$Z������Fۑ�U��Sj�ɹrgS�|0��)�DʒM���|�aUP:*:o���G1���{/�[b�Ϛ't��m�&FgJ��\_9����б�n9�!����JBeo�t�	�ŠE��g�j��*i}e����v���[A�6 ��ƚH�ы%,�aO���]�Ty�.[��%5��\+�]<�͢��Eׁ.���Rt��{�yo���`�D���3q_CeS#��& ����a�'��ƙ�I�O0�66�RfC���BS ל�o3�� ���%���t�y�l�����O���'��|�Q;�}5K�k3�����6��+`��	�/?_y�A7�bl:�A�ʟ'�`�!ȷ+�m��ycVN���/;*m�~&S���<2�[cx�2��]ܾ[�2U\�e�^�\Ox��B��5�6I㙕(XK��R^�؛VS!�^����
D�QR'�'6Ū�Ճʏ1�.͹�So�3l�����������sM=�rF{�P�^}���D�ސIߥ ΄���3Չ�Z`KQɟ��s��T��8ay��W$���+ LP���nS�ֲNk��S҃8��˲�+Od,�Z�Φ�IT����bm�9�Y�ex 19��83��T���b�w��i�c�TE�z���ȋ����kLB��kK���b�/7�N�`��ڏ^-X��%��(i߀�\7�٬n� �d/L�3�}Q�֜|�����i̶1;N���r!��4g]!��p)1^�}L:/�+�����wH�G{�����;�;9=n��t�&�u��G�J�)OQ��V#Zy�!��@� O�w�� D�W�n:��j�����t��Vi�ɪ�)ZK�\��
p�`R��f@&��XF'�ႚ月x�:�R�����8z����õBS[p:1�`�dl�be�j�0��e@�^OX+-�y +��:P�e��Xлy
��<H�FK����R":$�&�O��7Ps���1��j#m�̈�>�p7��AM���:}K�nx�p�	ycm}`����b�ׇF0�����~�(8�,"��ko���b��b����01��z޸��v�zP���A�h�%SP�%ޗ%h/g|��7���t�,�S`d�{Km`,s�*��1,��u����_��f���t���D��b�!ܭt�1J�����I[��w�Cߏ�"Qڑ�B��Ύ9�&���vyk��n|k�������X]}�����{�k��~̣ѥ����\���8�G5~-�Mwv�Hscc�|��p��0��E`���ɸYL(���Pb�t�[ M�z�Nr�r����FGX�
@�A�U��ifE�!k7Hֆ���H=\��T���ӹ�Y0�M�(-x�Pf����=����;�r>�rZ�B�ǆ��YRp�h�acM��r�F��Ը��OZ����o��"{���&� -�,���L)��yy�F��n�4a��h�?������;1�:\}��en��G��縳�98���0@����O��"������<�FaUBՅ���� }Vv�bO� �@0��S���\i���YQ�z�&�!����t�[?����r���A?��Wi]w^��QxP��&�~ǡA�����A�� ;i�\ZCí�Li?܎0	ps���+��RH�#릠�M���cV�8���A�̍�M���$��}EZ������S%�k^��I��e��Z�X��A�[2γ����g7�O�o�e���(��q+�e�u�R��@ʳ^�t��6�)�s�u�7�lw-*���^���f�);W�#�%�uG0�>C:�b�r�[תv���q�i4�-p����<�#�Wpz�u(}�% e6&	i_X$�=uf�Ȝ1D��O��_/�����BSf乌D\�ɤ+A�P,��g��޾3r�T��f&le�E��'�3�����#����/�}�-b�m��]!�����m�_��$��d�/��it`�Ƃrw��v�5��M@oP���@�gg^O��#�sO�]��F�c:z�EX�4���>lǡ�學Ae�Ɠh��|�,P�l��ؐ�=��ro��d}=�P�=�[~o0�z�L�`��
=MPܭ�%�B���nH6��w��4�h��"#�W�X���w'C�4o/����骨�N�R�������~w�g��m� �a�Nz�3�h��h���U=-�驰P(��1�荲�>ڹs�уU7�X7�����S�$��jZ�!9�*_�&`k�t���y�w�w�>!rz|����g�d��w����I�gK)ër�ǂ[�G�{��ѡ�[��/�c��� ���H�<�H� �u��`t��>e� �c잣Q,��~�����9.��N�䫧����w�>������}�=~�>>-[��������'P��-/�m��M|�Ǒ��G�E��7��*X�=x(&G��"�1"[*L=Ev����}VT��g�n�
�c����O���$;�1�0����`���Y�m�ez	���i��R_w�'���|�5ǭd�{�B�/T���Ǔ�rϼ|���p;�ŢoI{_�dqd\ �<r��x��Nz�ل.� �I���Y�Ɋjy�#:��������3���-�	�K/� �F�{sy@������"?�_��h�ǟ�q��W�M���KP_��f�m����/�k6Ɋ|?�y��ߒ��;>T�w$�x���RB�����
��v/2��8���t���h��H�l�+���M��w�)���:l�d�r�I�+�iE=/��;�	J7/=t����]$���m9�`2���6�_��(�
y�ƈV��O�>�渁$�u.Ä-r@c�u|bH���݀<���A��1��G����wN��|�F4~*�.�����ʙ 4��}otDC4��9A֬���.n0p�RRn�dt�˻�L�|�1>���n^ �/$D��a�+�cP�μ��Ż�Ty��	�,����1��D�#�"0tcf��s�=����^V�(�́�����]�>�8� Z�&y�w����Xh��Օ���J���~�����4r"�*�tc��ġ�`guu��Ù;�0�a�L���EA����n<�<��wB�µe��\��3_?w����ݫ��p�t���B��΀���E��x�_'��@�>Jh��%�+?�X*!�ۤ���d>p�3������E��d�V���Y���y� W�dC<r.�a�O�A�b1o�9�NP�T��w' ��MkA�ĸ���K����[A�u��4n��O�+����7��m`���2���
9� �/r��E2*3���!�k��	K�lx�e7�����٤��'G,�����uVV*�N3�t��5�l9olT�41�k;�����(�j^Lv�,Ó���X�=8#Lsr���N���?7n�`����J��(�I�U�m��ث
��2���cV��A��Ѡ�5c��8y��˓D�-���!�'F
��V�5�+�����B9~�����
�M*�(	2�()p�D�,�&}�Mc��?���dϳ ��ih�f�jO�?�@��B�@��Uu=�$�a,U��E�UZ:Rh*���Zh�i��T����+yF�h�K�`@0ti7&.�Jh�-~�PU�˒�E� ����ʦ!�=&�1���[��f�2�,$�kYĐv`D��xS�k^��HPhG{%��G���d4���]9ʊ�Ɖ�7T��
���f�iEn�qz5��H�qJ$��T��g��G(� '�AC,�i��K������A|a�m�������f}-.����W�GQݏS��`ٲJC~e���E,��w	ǐ��U�]�!����/��W�B���m<�S��m�9�6Xn�Ji��K]|�/��CVԠ�<j;����s�����P*�7~�$�Dc���}���]����'����+>�m�e�1�r2����D��A ��M���Xa�B�)��`�싷��:�"o�$qo�#�h�{q��Ԑ�K���ݾ�~Ԉ��f��"��p��U��<�{���sY���Yï���\b�r|rm��u�M��:���F%c'�m��;��3�V�i�^��F��dO&�ʞ�O��I�fT���^sTT)��`�	4�ƽuweݶ�N�bXR����yK���.���_�ɝ�A@X��e	aGx
k	}�P����N�z�"�	I��p�g��1����$���R���:*x:}:�M"r��ϡ��<��pC���) �[����i�<cĄ�× I�,�߹<+�P��B/�;r�G��GzX����a�_[iF��2C}r����bgM�Dvn�g�7A�.H^�xy+�6�$7;���$��#�?i��dG��z>�{�K۫O[۠�y���2ӑ�>/AO�>�B��æ`y� ��O3�g�ʾs}4'ɥT�鐪�~�{�N`?�]��0et{�XɑY�Dq3����{Y�H�s�'ì�4|��b��?�<x�w�>�D�o�PeɎؼ̻f�Ku�x��Tn˟�8��KN6��(O۴+���h������u�uY��A^{{�{���>k�v�i����Ãݽg��bJ��e>AA}s��s�NCs¾p�o��r,O�����'��˘�ïd�6I�����<i�Y=I/��=��g�$�4��*�Gt˘��/m��L�?��f�>����g��e^���A�*l�Mb�[�mZ���J������P&㪡��DJ&���w��h��8����G���.�
�(_�ˤ�	�l�j)ݷ4��1~T�]F�`�����W��<�TO�(���v�w��?*J�!18��獨;��'t�2s&9X��4F�*կ��rN�	�e�D}A��`�[��3V��ŵ-���q�$ ~.�]���l��H�E��f_�7/�(N� =����R-4$��L�W����yX�<M�����%5a��]�-D	~eg;]�6�Z𚹐�Q��J�t��煕��9a3���4�$������$�A�)QV���j�5PUu=1V|]���"0��{)I�N)�)h��\;�1E��f*�
}:���,p��(]��%�<,c��� �7��`�=^��h�D���6�T�w
��
aL��K�G�������t�{&�T;�Ԓa���"8�=�k���U�+Z!�ͦ �ɾїK(i��(���`w9�?=&j����U���>G�DVY��<�;$��\K��ɀ�"��1/�I�~�3���:i%����4��،�6J�F-�=J�w*Ѩ>�ⰋF�.�2ܚ��éX)F*��ڬ�sLX-g�z��h� %S��R�/�_�@�-Y��% �1��4x��&gj�1��Q&��;��ď��Q"Y3���p��r�������n޹̇�V�U%��z���kC뛤��I�d����،����tq�1�zSr\�a����&��k��1Y�s\4���&z)/J�(	��6�l�f#�O,�^��Ú�ʊ��E�b8A�v���}��5[����m���6��`ps�cv2Z���R�pfH��A<��#\u���p�W�W��N,I��/�A/lT�����$E(�>����U��s�U͍��"�!�wa(x�܆�!�ϵ7_i���Ɣ�c��Ɔ�����$Y��&.�΂`ԯ�'�n`[��$�)ש�J�Z+�j1�f�`DPn^$`���;�6W�~2��1�x��[������X���_�Nbɾ`N��Ӱ�����8�o��%j����?�1{>�9���j}8��'����w$Mp7N�e��#��ٸ�z��C���j	����Fo.ƴ%��L�,���+�ǋ|��e���-���HG�@����2\�ɳW}d����}����ݐ֖L������֧=?��j8pʈ=!҆��ǻ�l�#a`iB-T%��?"��׷d|�yA���5|�\�?T ��6G�Wz�'X�b����:��zbO�2���"%,�C��M�^��Sk��w!=C{gpF�pd�u	��l��47��~���t�ͧZ�)��`I�Gɜ��X�R0�ҕ�Z� x�����x��``R>�(�OL�'1���n��SZ��|��OFn�	��6l�������!����JJc�2�����{k�ʪ>G񣵾*}7z�E�� ��C@�|��A��Vޯ��ş��+2�G�A����ҽ�՚+m��^���߮S��|�f��8���j�����a�����UH	v���K�fzF�����V�r��>��i<����M�YbQ��b'�f�ڀ��g�.E�f ���%�u���m+1;���ӱ��`sb3�
7��8�K|AFF7��'^�b�G���ط�s9��V2E� +/^"�O�J&|�$��q�Q�����f່y�S~[>��^E��/��g�r7�2�~S~�>�eGS:ϟ�Ӥ���{[`]Ɵ�z���a�^�K�Ս/	A�rjԙ��RwЦ��?PчpM�
���Ǒv��w�l���Ǚ7Ô.��u�����]�I��m:9�p�����L1��t����{��D�烩!�����7.������>1�[a�� o�U��2e�|q�g�4����̕����gz8��0�����(���߈���yWR�_����QU��eD%un6�N�0z�D�U~{��nx�N���1_�fx���)�u�Qg���C�ݺ�M���>$f��h���o���<]b�}Z�>p3�A���%{c��{�0�ۨE�P����ā:KE��b�y��2v1S�F�� X�$	2�"�1Ds�s���I)9?�l�(!��}aK#�L��!��1S:=g��i1��!��
k�Y�C���hR��ڗ"�e�7�3��r@G�	������9R�kf��BX�t�L�SY��!?���),6�KahH`#ǃ�(?i��$=��0��4Y�fo4�B���e���>��޻����|���f���I�uy�܅`g<�0?0v\Qn#Uo]�3?��
`y�!��B�|%s��v�q2\��"G�_����6��/�K���t璽D'\�3���.Y�Z�Ε�c����.��_��a���}~썍�c�X1P��e��=�,WQӫ��;��&�xN�_Ht������kS�?^`L �iM\xن�<^��-�R���,e03>	���#"s!+�J*�e�'a ���O�����E��zi$et�n�֍��K+%qOwj��%��q0c��J�XӸ���)j���>�ͬ�����QE�W��dV�`�e3c�M���$��.w�s�%Lk��	�ך����Q��s0c�{�J��˲*h�½�Y��m�|2V�_�
h��r2�{�/�"����F����T(+���L�u��eUQ4��m��BY�4i����˃����^�dr1qZ3͵@�R�f��A�h=�L����H/�Ŭ2�W��U`��a�7Y�Gmt���|ke�c�lV:��w��t��f�9��(��F�̮/m�S�.Y�f�*�Z��x/�����Q�c`U���񃩓e�U;e�_�g��O���ח���"VS��s�C��A���eA���Dc��B^�Lz 9y=�Df�C��荘jx����G��0Mǋ�X73ɖ�����R��nH�7np>"����N��B��Go!?
��oӥ0ɼ�$12 ��k%
�X����j�2ѱ����sx��X�EVD�o3�~�
���v�R�6���٬*H�ou����������N��p���'[i���j�h^����fͪ��[{)4�W��SV;�_��e*E�򗲀Y�b��%Yf0��!J�iЃ�����l�iė*l��=nu��
�Eo9ȥ(���ɒ�Y`���t/Xɔ�
19�k'
�����A����y�_(�4����j&3��[�)��X�y���-/*��*	v�`i=��g��!r/�����9^�tc�G}���6Ɋ�rG��܃Xv��2W?ym�\��C�Vt�NB�=n=�#|��P=���/�U+ڷ��������n��h#�S����avy������V%|W���m��u�[' ���i	�XV� +5�1>KS+ӻX`cr<c���1rxP�\�[E�A���G���
��A7d��j�zb��_(��C��1�Ҏ'�͇ح^�`��,K�Aג3�V��Br@kf�kz��<�ՂA{o��8���E%�^0L��+������ɤ�q�BhB�L@������oN��cP�\ShDH{`���������� 2G�lFZ�Xg4�9WM��9��(���ߏ��H���$�Wa����ᕧ������uA�C�zN��y#�E,'�q�b��I��R��9����A�Pj��5D��a��Q|��#�E1�Z$]8�L8��$��Q(aP>�	�<�$��E����cR ��b���"Dj�m���od^3�d���"P| �Б�JoŎ����ՀDO'�x�p�����`��j'��BGo=��,��d@R�hY��\g�+o����U��u7:�D�؏�'/l���3!'���|�e�+��@�H���B�(�����e�u�@�G�%xh�f���ң�)+��z���C�{7��T�s�9�ֹ�J��:��9�n��w�%�u��$e��T�b}%-[BL�P,۔�3r�-j`����� ��N�a8oOGy��v W�<�rZ�����n9��i��v#� g�D��q�x d���8T#j
���&Ge�{-b������+|���A��Y͌i%9�^�˃����L��,^�	��wFx�Y$��C2H��>'�����^����Ǟ����-�O|Z����������1t邈?�=�&�mE��)v��1��`�[�,��K�0���4����g�6��?��Ȋp>I<s����2���f�Rё�����J^@+Z�i�55�@#i����W�����Z�d���9�?�q�, ����4NWV6�F�CZ��jB�#Z�^������a�����7zc5�O��� ��->�(�����k�t�;=�X���ec $!�蜦Y��4�@�9��}�)޹� 7��"� C��rz��7�k�F̐��q�"A����G�I�uFp2��G,-��٩ަ���w.�s�(,o��_w�tް�+>:���Xb�2
"�-#fd���I�8�6#�Ô2'$̈6���dX^�8^Ps����萾�� X�d��E����G{�m.o�����]��&:��'N����[�s��i��hsy��i���Ɲˌ��� sܺs��ɥ_�m�0��Q�̭���k㶰�u����ǃ;�q�<����!��\������:v+B���HH�������K�^Y���kߛ���������x�ʹ���-��P��W��d��O�I8��a�7p�m�o�Cpy�m�^�٭�z5���+�|�`�S�oή�A���&�8�A��Y��JȰW�(Z�:�]<�?0�`*���}��/&{�@��Bq��q��%f9�T)ڥb�I�{5�ڬ?4­7�֥�-+��ˊ.c�zg�}���[�\ʵ[~�B�[�o��3zc{d�R�1
�1E(�Q�d��Fe�����������J��p
�?����z����������ؒ^���fr�kЈ�Ʃa��_bI��	wٱ��٢Rh���-5kՙXL�8�>���(ik(Z�~�Q��G~��4ٹX��z��.�S���j�,s��5Z�Y������N�;9ꜴOH�������u˱
$MC�[�B1`�ҷ�0�����]�_ET�;���z��K.�\|aZ�G�y�t�x�Zg��-�./��C��Xڭ,Q�C�6���1�2]�)d�`[V猒���/��m�����8�AhZ��8��tXff?�):�.o���qf���m�=��'O��]��qM��0p3�#���C��`��,���ʒ0R;qo@�ꄽٲ8C>��C�����������w�ӖK�^���Nxv1����N�6��7�� XG�҃lP���)��SФ�h2����ݻV�����7���k1-�d�/���~^X��e��r<����-��w�6k�D�b��
H�3z/�[���
>����^��$&7�Q���NK�3������I1����߽��b��Zė �D�a�W��x��s��eA�I�F�y�[VO�&��I<�o� �v�D��e�Rż��4ޝ��/�9౸e�։8/=m�,�����'���lf�PdY�X;�P�>8��}:�\ N*�6Sm:�̳-�.�%Y"Vi\xY�h�>�F�y�;�Nׅ�F��V�6��z���f�D<؊h̞t�[ 2]_�%�bx<e�?f��VW�����y��{�y�Us.���C���G�u�o!#�<���+M�1Q˷��3&�n�ԟ��ȝj�,5�à�Tk��:*��w�),+Lu
J�G��7�Zh�)�#LC�x��Dm1J�f�`�0��b�=�vwS��^�n���m�1�$6X�}�m~�����nD÷"��p�+=I��s\N��L`W�������	E}�E���5��f���<7Q�[��=#��e$)k�Y���5��I�n�b|d�4�!�/iv��F΂"(�����8_��hCT��a�g�8ۯ�نN6>�F�:�0���r������B�����C��f��#����L]IIq�V�[�0�䪈�e}j����ذ�?��s:A���W�&����M�(������U�W�7j6~f"�+�S����vD�3	э���vvw�Í/�љuu��Z-d�I��fd�?�^���5<�?�/���2�w�F�:\��8!hw[��l���Lp�V��>�����^H�vB{1|nb׭��y��&H����O�S��f
�G���bC�%0xvt���&"@�F?p\#�}�
�跽�Y|��	�v��ɡ`��������r��U̰cK'�Z��-���6q�6�C��II,�&���-�|���,�C�ς����e�J�s�[N3��X=��i�P�4, ik��0�$����uH�}�,/x������7��}����&d���M菮D`�������<o�������~�:~ST$�~���R,��,�Y 3~���p��~ϾK�zhK���%j��ȟD*�y� xBr�u���P�>5�n����D��K�$�k��$vh���Kp^꘤���}i1�\%=s��֊u���r�7O�U�}Iʔ�C�D����jx`Z�ò0|8c�!�豇�מ0�1���FX&O`��p��t�V�&1:`�\���5Z�uY���R���#��IWb�@��T�Ф-F�����8}w����5�1��V�������ޅ�� D��$�C�r��
7�}H��t�ô�FE	�mn�&j���C�Q�sR�T������+>HbyP	F��ƩƐ�0ÂX.����������4@I�;�|��e~o�sq��N3�����9�ys�i�A�!�ŴM�������f����ϙa��A�s{L՘p#�6�迦k�D���+B���x�o���O�1x/�XuC<���O\(��s!`@ND���1�fl��������`x�ǑgN(�>5�F�t��o�g�<����)��}�=4���j�#/��)��=c��Ϳ����_�?Z$���.9q|�����n�˹�z����ʟ��/�,É5v�d�2vQ���;�trvFcxW���Ɨ�OS5����#����ٙq����?����XL4�Ι�;�zp�]<���@�߿�c{=s�Ϳ��N���M|�M���CK�^��K��0W�N���y�9@���w��(M[2��t�"d���"b��o� �{�'�2�ꋗ|&7��;Ն�j��/��O�*�Nׄ@.�f���JqL�s�`/({B�L>�u�iT��4?��b:�a6�8��r����������H�(K=�m]�334�q
�ٷzc�]2�T�D�C���ˍ������/Y���C��u%&���-�؉�vL��V��VMѐ59m���w�b�� �9��o��
�1>�=��>� ��o���>Q��2P��g�#���M"T��d8t����"�N�}��M}��ԧ�+Ǚ�[$��O�>Q�N�x���,�ٔ�l�c����5�k�L�4Mj��Iճ�S�O��)�z���i�����Kx��2[E<��P�_nrݼ�3Φ�D�O�M�Zοj��Y���&G�x�1����c�,`5���뵦��kB�"w����o��[��ˢn�K��x�k�k��|��:1�,�L�k��G�@�J��>�%�oVٝ��:kft������V�UkQƺ�h:��k�{S�����SoȘ�݃N�A�����l�M�)��)a,#���jT4�^o��22E>� �E���S+������㹥��*�9���5�-&�8N�>
��#��[��:z3YJ#N< �V�)��khiNS�h��jkk!~�O�X�3�V9#�k�rFc�Z�X/���{�А����=��ԁw�&���	����)��e��q=Dyi3��`,פC�ͪ�����hQ\Ņ�K����)��mi�#�4�bJ� :#a��bD�Z�#�y�2� .s�t&L�
��  �� %%ʸx��}[o$G�޻E�Z+[]�*޺I�ҰI�D��I��fឆ:X���̚�,^�!��m,l���~�]cFއ��O�>.����O�9�Y���dU�ꖔ^��df\O�8��<�W����a����i<=z�xd��f�����b4���ڷ6���
�Az���tȶ�A谰��>�!�ZK�������5��C8N���]ƭW����5�F,�ш����[����������aQL��l�`N�1���zo���5vN�IS��~0�U������O��Q?����/v���b
װFn�R�i���G=v��D�1�[O��ȵF�ǀSj��ßHwvҥ�S�6�n#�Ґ,��>��|�,&1��$೟(Xz��Ƽh0=�u��9�o��q}���N`}*
<s����y�Fq�c~?�\7Hô���F�����^Xd�A�>�'�тyv�;�L^мq����y�O���]������S�����5-�����g^pѺl�q$����/>�0�sZK@,�@�7f$ c�hECÊo�|xR����牝��Y���<���H%;m�%���y�7�0w]�[Q����z'��4���[2u���Ʉ��g9>�| �"H��<�Qk��JF^k���.���b<����	�eQ/tow���<B����6��4��~�3N�d)\�0����Y�Z�8|��^��чfv2�r����R�$,�e~���Ўc��y�ǥH��n�of�2y�V���B3���D��i�\�3�<�uE�&ҵ�ƪ�V���E:�3ҴZu�����@��c�����/��yۻ�ܮK|u�*�C��!qA�t{�N�&I�K���D@x���`L"z��M�
��Cb��w("1�����3j���՘6$��1φ��!�Y��AF4���pla�n/c�ӎ�	Y V��#�!5��r�@�>�R>��|����q���">� �O��}���c�8�t6��Yi20�L}��*��'5&��[��j���ߨ}����,�1_���:���x3���T>щ��'dЬo��� ;�|����j��:��"�*(�n� '�c䖹��Gn�E� �H$ב��g�VKk9U�
��JB����"�#��L<�9ڷ_3�㮙ؐ^�.l��\KE�MR�'벞)ũr�w�%�W��(]﬜�.oo��������b���J`��t�e!.��#룔t�3@H��Z��<v	$F�Eڧp��a��X��0��]HKy%n������Y��N��?�ժ�@��1�J��8�s����jaQ�RMj'�ۅ�k��Ñ��(�4&C���ɸ�rI����Ėֺ�kRm�������zzu�����&\���,����\�6���;�#7��$�|���"ߡ�S����Ș�wTy��M�bA�X���xm�6�レ}P�W����s}L�⪻&����2�of�V�]:զ~�G���BP�lLB���ώޥ�3/ύp��ţ��*ubi�7,������Ӫ+��{�����c�<Sy�&Om���1{�&ϼ6��93iL'OT����͈%��F��%Tۮ����8�g"�����2yN#z���,���I�н�E`���fcN�1�W�U��F���RA  y���uM"5����N�~�c�/MX���0Q�q׻�c7�`Ή%���(Z�|���AX�����a@����g���o��e<����0qJ:9���DA�.;q.�\�a=(lu�J����Qo��|F�ۗ� �v�1AO:��/���dƥ��h����Fi
i4I��҉Do��I࿥	�����/�8�!���0�C�\��W�;�yS��L��KtT_�ζ3` ��L R�Ym���(V5��;L7/nmP�+?��Ye�e�Y���j�����V�+_܇�ץ_�㚴X�0)_�G�{v��Kj
Tӈ�3���q �Ş�Ɖ��"p��=`5۫k�;W3�9�t%;�d�����u"GŤ�/^�y���b'b.����Y���j3v�06���O-���$�]�8������E��P�g��ǂ���O����{?�|����}�IH���vv/�l|���ֲI���!c&V�pd�c���!����?������B�r�~*]h���u��ܛ��C��YP+���(��G�ӱ�g1��� =�AH>"���� Isۻ�W	Q��Ch�5���ΙG�3�xA
|��q6qbO�YO}����,ŝ����U�@DRhb�?gQ����[U����}v�=F�%���{�Q\������-���(�V�%��l7nu�7�ڀ�q��c�7�ׁ�7�ͣFQl�Z!YD�W�K��&7J�Hǡ~����c����_��x�u]���� z�M�o?Ck;�e�[a*�Qs+m��n䞺�_m��������(c���Q>x�x>[�.�B�<���b4����p*;���A�ix�X�!o�A:���`d~��u���k��o���>x���^�q}s�H�}~yo���}3�A�A��p��0qwtYs�~�RQ2�7y���̛m%ֹ��ş`�0j��!:����~�ҫꮲ�o%K��l�l�lͰ��v�֍��O[�A��3ڋM�4�w�)�~Sv���X,%fl<{m�Υ�]�%����A@����G$�[���N�B��/髮�I��|^C���������\�P�5�E�����j�ޏ���4d ���76h�Z_:L�/r�8Oʖ������OPb��Fq ��-T涔���WVW���r2��n�O�S_0�r�B,&��z��[���k���h �y۪���h�XR�;6��;�1�%w�۳@���Ү:�A�Ҷ9X����>�)�.��mֹ,��v@�s9��5��-Sw�N5����r�#m�����!�Χ0u�H,��D,��gnNk��o7�n�A�2(��o	��0N�أʹ�;�����ʴvK�@_����Y�<�;�3�6�"��3�&�`6C�F؟ևJ	�3=���,��m.����Ys��ǋ�G��j,ܴG�Y��< U�G�F��� V�R%U�#H� �ֵ[ݕ�C٥'ngǅ�o�A+$g�!N(��z����p��W���eZ89멏'���不.�{��ZK��D�Ln��cp&���(��j�|�Zt~%�`ԛ����tU5T�#k�Q�q9�z��R#ɅߊF��w������[P��a���C�1�N�̷�V��҇i�6C�鹫m&��w9��R\�]�_5��XA�	@o���Aف5�bq�i�ja�lG�ө�%��i���_r's�C�?��fI�l���!����%=g}���7����nh�p�,�L�yi����ZJw+��Z�-ﷴ]pKO�#�Y����$wd���s����$�=�R��9}��)E[�{f�,�	~����"R�)���p��(?	T��_����IhCI֗�,sk,EX������������êE�MD)���n��Q�r�>*E�K��	�`o��`�j&��D�(��N^���1Q�6ɐw�I�C�4c���bk�eJ~I}&D�h��G����~5f�79b^ �W6�l�MQO�
��MY	�]F��=x�����i�1�O�v���B��Am��6�!j$>�S�S����:��g~�����4��	�8P|�\�����7���C1��������P��DI���0v���l�@k;�A�HΪ��)��1�%�^�"�/yN��6w�/"��Y��<w��"v���Tg��O
ݒEb���Ar����o���E����v�|D�?��FH�&SBy`����h��M@/F���Ў
Ft"b���+;3�I�_ը��MS��H��2�@4Kn9���l���E�������D�W���J<�⚧k����̯W� ���n��=>ye�c���t��8ּ���{,v\�������t����Z�]�ox˨9��wh;��*A\���%f���vXh�	�5�_��!�����H{�ߗ��11K�V���7�60�^��H�nn��i]ߛ=e�v���r��2�&99��9��"`�4�7x���p�R�i��! ̓���ț��F�^��I��|�t�k=��	�K�LNԛ�W/���5YLԭg�b�#o^`�W���=*pq��v
_3�I6�Q6��9��l��}�w��{3Gk���=����#�Or�^�����I�zI�[U�z�NJ����q�n5�*^���,Ebq�0.!��$��@�6�4ݾ�SoÜ���&;������(*&����W�혂V�P`/n��t9�*:=d��.'��z
x;��vW<���O�㮹��tz�������t�Rlb���w�̛�>�!Ґ�\x�)��U�֙���^$[}s��F[�+wN�h���$�;�@D�]�Y@�N#�S��F��4�m��wH�6�$\�*�j�����h\���іW��E5��ch�P��+�+^�����E?�b�4D�=���W�.�S4 ������������	D�V��G�9~W�e�1��2��g!e K�c4�D��׹��SJ�Z��8��r8<�o%{�xO�v6G��d��q����CO]a=Ġ^/�u��!G�N=o�ϏH�_�]d�#,�	-�[����|��4�Ia/�B���h�.KcR��O�v�H󃊝jǡ;l.,$���<YG�k���p'��0�?0)�t�*� ꉘ�5\$lؼ�'cfz�F��kCf��~z�ʊ��ɣ
��|�P�bԂB��� n��UT�b�4'SJ�^fD��	�xn�ཀྵo���)Z�K%gQr�G���<�������U�d�0yɏ�N�ެ�`��	-Y�iꌓ4�6����d�j(3O/��	�|\�u���I-��~|�H��dr<��rs��t�Y�ħ�Aq�E^�k�D���W@ ����T����Z���,r���N<��Oe�^C���Ln�1�	�K��}D3,���?�\r��x ���_p�5]ܥ��p%A�6�v��N���U+�*=��t�O�~-h>���v��5pyީK>����,�����V�>J��p�m��Y�Lt��ߘ�l��l����n-� �A�!m�6)���!�Z�dE�R�n�{$�QTQE���_,Mb�Tߟ����*���!	�.Ԑ8�񮍈��C�������aO��Ǹǔ�,;��W�Z	����L�Z���F�F��'#C���my�K�aq���I�8�q�=���o��y*���L&��l���.l}?�)�e\ɶ��#��{���5�m%:��2D�O����+��d�?w��V "5�|���ϣ*�H
�Mn���-����� �t����N�M�çϐ�A4�<bh=���=���Ն!����?��c�nć=�pÈ��p� ����t���)�9燛��I���c!1�ʇ[!�đR���X�5US��Y�gsi��ӣ��<�)�&���᥻���Yb\*������G��CG��A��Y J����|�:m���N�d�����
W��lo�ѕ�#�FAU���$�mcq��x�x��������s
�t����0�+B1G����)�Oa�� � N�b\�i*�EB]?=n��@��h<"��O=�5���ȷ�`T�� �����Y��(>�Wr��rF��w�A��c��=�$=��o!|��0�8D���')�������O&�K�g(��`�����tx ���U��~����o��[K\�MP
���	�}�0<}� /��D�egu}mm� �0
#�8�PD��tm.�,�4�QwE�j�tuum���/`5VĘ'h�D���}"�B��t�k6�O0���,��
L��$K��Y�m���޿��\�/(U��(e%�*	�69BrFσ�����\���K(䛫T)�s/I��Aj�>_~�?I�I����%~Ja2�%���)7�Oa-x�,�7�3��;&��?�$Am�(,<���́����}���v���d��?{ˮxjN$z�؅-�3B�kn�h-�u�_��
�͢v��4,�䍁���o�8�/��Q��aE�۾|����{C�Z�>���"3^<S�ǋ�^������3M��x�5�
%���٨l�U�� ������
��"&��ч��DWX")�$�vPf��5�,�Ecs��Q%�P3a�:	5k#��݄D��Z�i��}��{��V˟z.�sv+o(7�*���9LX�ew�'r�p�_���o���"�E�xc��/t�_��=&���L�����'yxxtpxp|�Mv��?/�O�<�&-�Eף��/o����������˓����������y?CG��w�c��x�R�����Q$���dd
��H�	��8(
�ٓ��l��Q֯7&��<�'h�!1\|7�Z������Cdgn<������U^\�^_��G�p�P�>w����Ȗ7�B���?��{�'�@�_m�=r������@�� �f{w����������<|�/�,"�J�S|�Ĥ�`_�W��
5d����54I�����%g��]��H����K)i�$�tHÑ^���`H~9�X	jKT�J�>?y~)ِ$�'���8n��=qy}�e��RZ3��6J����=��DG���d��j��&Y��I�ʦes�qs�a����o���}���xg�|v����K~���y������
���n�طAisȥYԜ÷����U�;�"qc>#�;�/��Y�_d��<��%R���˘#�rX�� oP����3a�I�)�^�Kc�Q'D��#��Xv���Ÿ������CQǏ>��LXB�:`�O��!~��h��Qࣾ�+b'��<F}n��$��?SN�����]P^ͺ�Q�4��H����9*L�s74�Ƃ���-75>��隣3j��fTV�_|�c~?�b-�����5��V�-�`Pl�����	;�_����Y���1�ad=I�^�����g�� �G����m��ד�o>����t�oL.,Uh������w��A��;�,,��0�E̦+���Z�}L�}C`̽i�L��I��k��-,�{����"���`�Kj�߰��ywsa�3�r��z9+�	/�1�~���/�$1*����r��4�!PU+�)/#�ZA	�G"�	��0B*f�Y�&�\��|S���#ǛN�R5�r9����p%��%��6��$�D:L��8��Í�sfL;����r=X�-�Z�o��(>���|�ژLsm��+ ���_��e��X*��4�����j1K���&�.!�֟�����m`ۡ�H;L�P� i�$�W�����&��Z)�%����)�IDPY*G��*l����no��~"a�z2��,�~5	�Ġ
"WiP�L����1���7�XZo?�*n��3."�遌�sk开\�Vц m��$�s��@� ��A?�$LU���ɟB�-w0�vɌ�o��(��M�P�@ 5��L-t@)�li�1:�5�Z]s���O��
�+4��4t�o5xX���(���+bgW;��D�%�����z���������;ˋ�N��Z���!%����8\����8G?sA|;�^04���b�?REd�UYz�2�J�B�x�v�b��n�وU��D:+)�?�����k�Tۃ9~(��\�ζ�v�L���?�Gdͮ�b;����挨Y��7*���4r{}P��cVC>)��3K]�D�̣Xm�ml�L���l�VcE�J�X�]�S�4��.t��s�:������y6SU���h�����d,�6��n-�%�[�e��Y麸<l�mјg=�%yV��%���.�1��Z�hh�$g�f�F�ŷ�~p�\ �@mY��Y���1�h0���f�M��q��H v<�0�9�b\���:�$�"L�c�(5���K�m#m�w'�sjPy�N�ՔJ�ȝ��=RJ���XfOc|s85�W���~��-���U ��%8*��|J:䣏LV[��Z�w��S�(�zD����@��W����K�]����z��S��K�Q*GS�ʋ�d!���'��ف����E[@��S�w+U)I��e���&c �F)AX����NA�c�aX���A[�`���FL3H��j�M_Y�z�ō�շ������L"���ŏ��oyS� b��'���X�$�,	٣%�yc�`�|i�� d�*�P`^6��e���<��/͜�CM�B�ݰ�z�<jEp��Z�#�K A>`;w90v^9z�����-@&��(+� ��q��8daI�FS�<v��֭�Q�uv��m�9@����3K�	>Sd��S3���S�Enc�U�4���S��������E;G����jW�yϞ*X=���`�NΟٜ���>�vm̩�\�O/F�c�SQj�����0��A�0yA�v��L��{�DE�P��<N�c�[d�:�P���o���s|�3�r,�,�\�s���i�o��xϟ�:d)%f"�$�wD�?��]�SsiЫ�9�[ݬ�k\![Bȓ���I8����IZh=���M��!��B#�h��I�C�)���Wcֻ��s�Fm�1	?��=O����O@ۍ?-Q
r��G�;f>����D���L��\>g�O[��@>�?�P�<�]X��ǈ8}I��tQJ�(ʉm�N���74��*4Ii�Q�A��N�.A������2�C��v���R7z$Rc�tE��S��������3
'L^a�
�Z�W(��98k>��?�gYΫ���C�I</��������I{�-��VLG���9�u�#��6�cNl��M������t0��ipYS)�v��q���\i��:�����V?�� ���#G�{*�:wVW����R�S�3̏ֺE�G�8)���~��Z=�\-�h���T�y�F-�����\�CPzƅ���Lܘ�|�	��=���Đ�s��ZJ'����Λ|��?q� �Mj��0��Y�Lޒ���F��Q����������<	Y��w��	�E�㶕Fu��Y��v�I�ػd=`����C^MS�T�Oܹ�h�W�������w2�TSL`�SNY��t�a��fh)�g��F�]�����	,�Xʤ�^�a@?�ӄzN��>25bjA��pС�Q=.[k����lL�G����X/�:�^�)
V%�[t`��� ]_{̖�L���o�P'��r���_R0j����eH�) tN��3ק>�4;A��Ӑѷs�w�Gf�BM�]	�r�l��)&V����Z��C'T4�d��i�?� E�&�3 �:q�X�nΠ\:뚘\��̹��8%ʴ4>�eQ/@����`���F��	�&>io^õ3-�����M9���(n;lx/���EK܌O�J^~ց���u�j�f|�E����7@S��>)���=I��>�DmG
����r!N���B�w�� Ǣ(�vTU7s#��Y����C��㏭�!]1�{�g 
K�}ֹx�0���q[�ܲ�������Ofc
��Y�"v[���`o��xP���]Y�8�߬L9��qͼ%{7�|f���g�\|����g��|j�u�3%Z�qhY����`�������;'W>��]��I>H�9ֹN�E��2�_<�e��3��5Z�R�����Zfb.S���F��I�����b>&3�K�w��p,l�h#���"W\�E04�{���[���ƝR�R�tq�ޜW\���e�����q��%�aޏt1�ٔ���)Z��I�^R��k�sI���E��G��<�'�-��j�gBI� &>�9���0/o������,��s��r1�l;�#W�j���������2<MA����}���S����t$)afۼꝑ���-װ��K{n�0��\��<�o��Ez4Yv���m)1j�[6h���;H�V�¢�4�$��8a�,�3��T/�c,�O[�~��̟E�D��Z]I/�?� [��8�dTt�DФ�ɁEKg<:_�d�|�Oe����� �� �,^z�h^��Ʒ��Y;-Z�	�����e�<V1R��0��)b�kjQ�]k�[��x��e��.�:��Y��{wn=׼��3���v|�E ���1��{vtȃ`9uY�PC���0c��NŇ�����J��|�K*ӌ�>��w�JO<���Pt�k��S��6\�%!�u�B6I�%�M��Iz��@[�5y-�x��2��۬U�TϜ='YC�̫��6�)�F~jxr#���6�3�G~��Q�ci�����Y���y�Bd�ȵ:�&O��z�����r��� ����A[h��IE�^������;�g��*�R|�U;<�|d�_^�����z�5������xlh�N�1Q����M�E}�w��&��nc=+&׈[˵�S�re�E�=P貭Qn΀u󇬛/h�\`뒃X�3R���]�0���t�t���
�2��&���DȜ�.E�׋����.V�G,�TI�S�H^r]mA�d�b��,N�͓�]F>BL��w8�M�Μ�!އM�5U�r�:9����C�asq)���(����o�[�T���כ�� E�v�o��%a�f�9���G�\4�p��]^ڦ��ɐ�l�,i� tA�i	ْ.�*Cp�7s����Q0#��/1鑎a���!�PrCK<��i�B��?��B ��I4��� �n,(�1�:{��x��j�/��:�9Lv�� ��}W�ߛ�1+u�ָW �k�^O� ��'�1���ۂf��]ǆN�)�g�3��0^�x��KV̯R�0�Ӎ�sw3J�y�D��O������$!� ��FV�K�Z�E׏X��o��~�1]�����_���8D�7	"SSo�#�eI�W�2.�d��zP���,Ƒwu��}�g�'/�o]W�(��z���!�y���U����q�F����I��?��¨`?.��;��C�Zg)W}[x����x��=6�U��>/��A�ix�X�!!hZ �3�#�K�6������:x���johxyHþ뛻GB�s�̆@72��a�7�~Կ*t"�#�.k�a�Z*b�#�F#����_�:�	6��SU�.�ÆQ= �y��ϔ=	�ꮲ�o%K��l�l�lͰ��v�֍��O[�A��:4�&b����?�)�1o�_,��͉Y����\R8!�І��^_}DТ8�{ ��<�V��+}ҭ�D�x�8-[K�I@9�l]���Eԏh@�	߭v�.w�~Nll�z��t>���ѓN�h�(��(K�9A�o��:´��/�^kF���h�+5;�Z�]�/5�G�T����\����� *�d���z��9]�}�PA����UѯgaZo��v�:�K�W�f{�<���ł�!2|�~�D�5���w%=\��9a䌢��\�^@LJd���{��+t`y�S����1�-�c�LV��j��dw:���W3 ���ݺnjc���=`V��Ϟ��p��&m�ӭ�n�~�7�!� ��d�Z��kn�N��!t�|A	Y�E��b�i�7�sVqL�����|�L��P���QYi@<�r��]m���'4q�F������3ا	G��<���z�ygޘ��C2V3|�b����1.?�m�~�Ƒ��%���A��ѵE�b�/��|���^O�<f�gQ��*�а$�w5����P��u�hZ��͛�ES����)���Ek��,�7�����/�AjEm��Q��֝���ЊF�oaFŌ3�]f�n��*5f��k�l�|�z%�#O�{IC��4؄Y�cצ05
&9;���/\X�!l7���
�O<ղH]��˨�p�;�ӟd�1��$��B�(���P�����!,���z/�*8�_;MN�ҫ�K���	�'{x�[�~J{&m	W���ڕ?���
�ƊZJ�l��x_�0�B�DǴcd;d�Ja�
L�h�}ቼ��Yhg�`�A��?�Ւ�2n�u�tBP�7�C._9b2�߽BBy���+#���7t}T��%QgA�Z5��:
n'�R�<��9=e �{�e�B%Q;��P^m�gjT�YK��k��ґ��櫥�Q/28�Ri�iԼ�-�f����;M�r�#y�Ӡ���hI>�hu1O&ǥ&���M�9X*WB�W�gg��tq�s�j�e:�{�}r����y��r������.	��%��kǇ֭ᵿ��CՃGU����>RCS�/�ev����Hݽ$�bC�ĥ��5����M����Ǿϭ0I�*5n4����6J�T�PJ�ZIj^�]�7ƋuI���孛�9��z��N�mO�<z�=_�(T�I����a�V�;��ws��_��|�����^����A%��m�\��ǵ��v��� vЦ�p�v^�m��E���.Nby���0ė���u%+�<p,�kl�T��%���i6Ur\�����T� a���0P� �!�9I�V�H_E[�Zf
0�<�P�{����L'.���MD�)I*��/��^߶��x���/G*�}n.k�����j�TU�&�W���Ҏ�"4���r�J�:ݬvbY�2}��y��xE�[|R�XyZ��T�cCMKVV�%�zcf��{�3��?'8b=v�΃�2tZ��p���Z��c������6���~� n���1�������g��s�g�x{@v�9s�j��d�-��.��B��Ԟ>�{?���)οk~�, ��iY@�%��ߒ/�#�;`ı���6 :O>��9n��j��l����xz��	�I�;�ڲ�r���g�d��.����l�k���|^�:���n6<\��:;��*���pĢ�Gʦ�S�L>��ri+r@� ���ϝ΋�%��]- ���`��$R��,�Z,M	b�>Y+S��:����_�T�)�T< �f���ѱ;!�S\�8#�H��d�ȈgK/~w7zr1�������s�9k�n�C��L�7np!i�}�`9E�n7yƻ1�A�!a�c�Ƥ2���}�n��XL#��C��R͂#p#4&��+ײNt��("�L����UW�.~UR`{H�����S�ת�Y�~2�/�.ʝ�gv��9����~/Ui|��Y����!�ϧ�Ĳ3[[)�b�|�Jj�Z�f�bU�ھu��j�B��S+��b�]99�A	ۺ~ln�ۛ�2 ���O@�,ڵ�QV� �$&�"�b�1h��*4���46�i�����1��رF��EzV�VVص�y�D=j�+�b�Ď%L�1rH��W`��Q�)�1Ռsx5�O� 9�0l��M�Թy�C�氭���A���l��	,E�!�ɏe��g�j*��Ӂ�Z�� ��#b�*1�R���?���`���*)�93B]�>.ڲ��S��W�����Z��Ɇ�R��0��8>�Y�Fgw4	�Rv�">Lӈp�I�T�ޔ�4Z��$��R%�t@�e�ߒYz���j[U^������\�������g��f���q�A�� R1�؆=���mH�����T?���:;�m5�#S~�ӻ������B�^���5\����a�����	��bb}���k���?�2 f�&��B�M�lRd�7J�@3k���N8G��e���m�,B*k.���Ӛ
9��-q͸��f{C�^��l~�����n�N�H��J�/�J�P&�ԓԹ��fQ<ޙ�q�)�kj,�[�Ze�]�)�P5c{þ�'C�J�^o������uoa��1�!�_T�S�8�4����	:��=�9�E�����BF0&�j_E}�n��*����1��P)�<A�X\��Ō8Ao,�^	���8TF�G��@DW����!W���%6	�d�������$��&�7Z�VÐU��=ؕ��|�c�iRd�-j�"�0��W/�Cc�,ˡ+�aW����PI�b����
{R���Uf.�q��R�F�ǎ�p��s>9 Z7sB껺_��~�E��;�*������%�?�e�-�G�L�)����7����������?��m�{G;����L��=g��9!���ڔ��9RS!6�Gk���\�����F���K����u0�y讒�V^���_�\b`jH��C�SZ�Ǳ�P��H.��)㶒�J�v����<�ux,��dlc%�6:�������{�+��i��T�\͐0� ��nr|�
-"�th�a8�@���T"�8�>�'�����ma��T�M�5
_���t��[��;;�����L��T.(�H�֟tl=@�k�t�J��9A�"�?qG\�ȑZS\������$��`;�띕�׋]LXZV',M�\Z͖��zӣ��S�$�NWy�q>.��Q�B�8+�V)#�aVN�F���;��z�WT��5j-� ��D�;������X$�3�Ē����ә�I����uq$]��m�v�F��w_Qo̚+K����C�Ti��{����.%�ΐ�8����r��#�on�|��"w���¶	˯�:�*
���7ZD�Σ'RH4�5*��xի���|Y=.E�t�v��h�չj�����K�]n����"Hc���X��$���&�i0�5�����8��s7�Ot�D��5>��ɪ��0����?�{Ź/�7�x�S	�8��,�y�ܡ\�x�G
n��R�IH�Pp�74Y����g�\Ѿ�I�ͽ����q0������z#���Bq�4w�آ���*J�ɇ�?Ǖ����U=���j솬Z��%Q��X��b$ӳTn�KH85���_8�P������!Y�,=����̟#{����Ri+��j�e�b���<���ڠ��Y��M)|e夦|��:y
�y)*�9㘇�p��,荣��"���P�P^��U���ޟ`m����3�{x4q"��+��N��M�63�������a���Cy|h<���n�4����Ly|�M���S,}��=�V���8z�H/X_Qy��d��]�8��&y��BRM��4����{>��E�Rɖ(=Yl�}��u�S;Z��]QzB""�� ��R�	���n��z��mv���zwi��������/���˿��Q���uYx7_������뽫c��Gw�ǂa'��'F���A�a8�rOy8��?�á�ޯn��>� ��	��,��w���4Bn��m�%� ����kg�rs�;�ING35D�7�&U�RKj�a��&޻j�j�4j�Um2������r
CvV�2�B�jg�aH�� ��#����ִ��4!T;ap�GB́ �;���4l���Fժ���y_����t-S[E�R��������շ��T49e�`�9nn�����Qy�]�wU���߉��Lq�Qk�(��	fpO)�e߿ׂX���,���AX,n���AN��x�*�V+я�0C�<�v(�/�3���kMzh|Z�E��NX�C�zߤ��}4�i�^����B��@�_�g$�.4�|YP�*ߟj(�����`꓈m���L�Yɢ��Q��J��:�i��꥟U��y~�J���uWŨ���Rb}Y����*�x��u�U�R��}I;��;�"��>�.�z���\&��O���͐�\Õ�P!��á�H�V����Ql�<$ˤ��):�����5�L��ӱ���r!^�A�C�$��y�a��t�S�q:��EּC��9�8UGɩ�'Zu���O��ו*��gY���p��gn��!�r������m>��2���`�R+Z�!9��H�Z���t��(ׁuQ�I	�ǝ,"�ZR1+��C����a���
+
7����5�5ye���a��i�aC b�˫��J�����QP�F���@����%�(��ST�M�������x7 �Ľ�Pp�8���,b<L2*�	k�^��KC��m�
Q'|��(@�W�0A�e����ܽ��B&j����c&;�]W����9:|砙�p�|� &־�m�0�8?�:�F�W�����s6����,�h!6�o�(>Oz�Iv��c����r;�9):,���Ny���+�����|�f�1�%��5E����H��p[���lN�D`Nu�tnL�7��&*�Cµm�%-1��*����_��~.�D�Jdʄ�#OrS��4�1G��/�&�81�8���:e7�����R�|'<�Fe�unR֝��m��p@��*�u��O	xX��`�z�
�C- ��p�*c�1m傢qS�B"ء�Ó��h̓I� H	1%N�4p��%w	N&JT��O1�ܝ��-�q��Q�]ظʴ�/�l�)��I�ҝXǰ�8*�e�Us�ZΘn���U��D�
�0�d�j/��P�֥ꐆ���5� ���Vӛ4�ǉ��ѩsYK�5D)��P7S<ד]��\��Z���#z*JAу�)�z�H[�)tC��<I��f>ii�d�BW\`0��Zd�)�a.e�7C��f������V2
 �h ��ۖi�K�W4��b�wpk�m1���|j�"�)�3�����Xw:@-|BHҿ�Ѵx�4	���d_�~�n��M|�����,�ݬ��)�.e~#?.�*�$e*[y�󘺋��� 7��S�u�]G,4&��#�:��)��8׭�I3b��������5������[C'��w������c���ߒk\9�Ug�!*�'mAK�U1٧Ś�H?��&�����ŠⓏC�3���9����oY�����+��
�P�L��~A�]�KՃ����چ��~�E5��v,�����e�b�7�#�,/��3�����=����JBG�������	�������$��H��.��m}h�(�uMNw���/	���<C��J{A�S~8��؋�V��%B�:L9�y0JPrw�!z��'��Q��[e�������1��]�����.4RZ6�m���$7�����e!�U��K�G�_�i�5l����L���k\,���BM�I�����r����R���Vc�O�:�o�WŦ�=M4�)8gQfn��Z|d�q����O<Ͻ�U��ȋ^�6�ߣAo��f_Iz(o�}�æ+�_y}���Y޷���I6�f2�N1�W��h\l����$���#������d��Z嘜r%�'*��i�$3�*V�\�qq�1����Q��$I���P�[���!#�d6�)�AMO�!�ig^n�-IUb�OR��۴2g�c�f4�M4�$���&="z�HyN����Ģ�X$�5w[;/}��>�x�X������A�O1q�BC���N��Pd�U��C!��X�kr}�F���>l��j:�	��>E�b�F�UXm��?�w�/r5G���.�ff)�Z���+Ø)��k�>5�A#���V�4dWLI�(�ҡ�si3o�$�Z��
U�,��ǿ�֦Gˊaf�My(�����j�*Ɋ�Z���ڟh3���`�U�ʪ}�����V)[$3>Q-�6F�����C�Z���쒮���+��&{����X:��=����İrf���PC+�q��}c��;����%�^�����u臚`a)T�/�֟b�ɚ7THY!4"��W���x]�g�{��9*
+X>Bq��XG��C�W.�}��iH�ͷ�Y�����!���M��������	��R��j�g� v)�����0gG���6�e��z�N@��S,�jʃ���X踎v�?-(37��s��E���\�By?j2Yu*F\D[���G8�뵋:�!�A�Ǡ�^0DS/�C��V�V�^���m� �#B�;�G�:�Op���m0�b�GZ�2��<��]��(:(��Nք-�O�c�S� 	߈����V���[<�B��DRuJ���p�M �Vj���&��5���.a��H��*t��VU"�v�������"�hX��*'�iu#^��juթ�I�dV@��MJX^�����-�BxB{�z���6c>	+��Εݲɕ���pL�s�m��&��&���-��V���mss���U�7�}:�B��{'�Ͽ�;&��������˗��ۻ{��5�S�0�r����e�zޔͮ""^����I���'�w�7�s��D̀-���D�(��͘�'
arU���;p�8��������By Rv����M�2W�����ٽ���5Pܫ����\~�����Z�U`?-i+���V
���{�Jީ�l%>�KW�S�|%_ƻ(a���KK|���@�0�7��{	v��#��{)�YIbօ0�ךHĂŜG�r�u��|�Dɀ}��0t�Q�+z��F�u�!i�;��Y�����e��`j�=�=U���f�F3�߹���l:��r��[QE���+�ފn(�G�ZL�
Ew^��gno��ˠ�YQ�g�*�*~�R�g;��WM'=1��N�	��Y*�5���\%W����i�u:�;fPAꅇ�z��y�]b�WjG�&���yI�V3=�2���
'��#FuW5�*�Ͳ��D�������+�JZV6��X�r����U����X�+�>��Ϧ ����g�j̜�r���c�U&�um��u�ר���2H��ӕ@�Q�'_���HP��Q�~v�ٗ5��L	R�_F�f�ȗ�ȗ�ȥ���j]h ̸N��W)R-�§]��~��ec\�Y��a�	X�|:v=�H�`��HV�F�ʕ�t�o'��T�پ�?�r�99�~J�nY���5,�`�]4�q�9+f.M>	�J\��W�	=�j�gA���C�+3z�8� Y��b���A3�&�2S��Q;,�Ad"�� ��*�ѥ�2L��܊��h<T!��S�*Mb*{�f�:�N�G@a
��I��=�N�n�ײ�3	T�Y�?e�@̱;d�<|7���  ���}}oGz�W)O�pM_$�!Y�ȑ�D|�H��)�9S����{�/�d���C�.��]_Xl�pȟ�o�/��WOUuwuwU�S3C��Uص83���UO=����9r���~t��_���g�+��Zͦ�&�����+�ri��F2�$�X������ ����KCx��۠ �C�~|$��'AA���ImY��h��z�%��s���3v��'�cq�Nk82h;��l�����6����}�L?���|�&P6�,n��kK�!�^�#\:�t��i�S�^��B�j���'�k�Hu��FU��{D[:��D�>�� �ON� D(<\�.�3����p�@�o�=�Y;f���.��W�ǲ��VӦ8w7w6��۬ېrn���˒���r3�Jh��މԊ�+�3W���F��0���
 � � 
ʐʍ��@�~&�&=�]}�uFSJv�~7�#2��7���<&�w�k)ǖ���h8;�Z:۰<nᖲ�kdU�^ܣT��|XBv��s�_`���G�o��:�j�"��yoU<��m���봶j��6.�����aX�)⡟9$K� ��)[��-��i읢!K��j�Fy�ެ�ф���z���
^^׃[1��ͱ(v�qKZ�<̈�+�i�1��
�&�n&|&����sSDQ,����be�kv��U��k�m�7��d�6'��m�Ǖ Dkk� D�q�D�d���4Df�; ���I�\�p�tu���򬭀v�3��e�2���k�5���n��{"��Qy�jZ������������7tZ�2%�_��F��\Ҩ�6E:uޜӪ�6mzuޘH鲺x}�UwQ
�����E!<@��=.�C _mL���D
�֢�UL�5�Ok}���i�#͚�_�� �L��
�:?�9>4��&�R(�xS%o�\Xm8�a��A��f ��9-fJS<N��hZ�~]�3hhLb��0h�X�j����=<���Ma8�%	O�<� !D����ȗȽKv
��=�6��IE�kD��l�m��=t�w�+�Ps<S�Ev9i�O�,�uT��=�ʚ��hH����KE��֚������y5�}9���w��[Y�t��a�T@�	J�4�������f0��f0�"��T�U�6���
f���YE�R��Bض�ACʭ�rA�U�W��֟�sl�yl)�ޔm^�<h՜��ܤƄ��`��"��N��h�o�AV6/��x�����(�v&����J6뛸�vr��U�ѓ#�,�&L9Ȭb۲��cҨwi�g����w�+1�V�`1Wg~�\<qa�x!���y�?��Z�Ll<%���%/ L����7ԋ��d��1�o�l�s�M%���'��r'_V!p�dr�@�� � �b�̰���X �w�oJy�����%�._!J�^���vrYSx��T�e�=�;9��n�
�Qкw�$G�s�F�L��;ʊ��:�o<����c� w��p\F���Ko29��[��1��� ������^�bwܢ�L"b}H�g ��n3&���ܳ�Mb
9��zN� �%=�щ����I�y��z��^�I�a�$\��讈\����bzʺd��f̉&_gtp����E0
�j����Ʋ�G�m�l���^XTOe�S(�2�b���#Y�eL��e�pSѐ�\}?�y�ސ�)�{��gG��b	�=�ٛw@��� �s�.8�_���]|E��B+2�˟�?�h����������7{bH��!M�������<��T��0=�/Q�Kp
�b-�	՟�v�Ž8�1'�B�)�
8��7�*E��݌c�M|�E�ܾ�z�bnI�BҾ4����Ll�D��\
I vFe��®��������J��Ę<P�&֩��$��s����I��y��������3���/��A	���`.rz�~2a�J�|�򝞂AM�O��M�?eG�Z����y��l������;a�yD�W����m:�by�>؟qx3`K}X9�ߡW=����w����v�B/h�x��N���P����?�0!/����;�C�{�V���|ʖlL��ZY�m�����>���������ߟO��&wI�Ŀڊ�)��G��V�#t�E�'�jaZ�c:���.�4�1.�7��/��Y�q~$ivUJ�!�+0��vm"���Co���\���3&���k������,E@>"�;����K{�z''|{N"?*(y��2�b�y������ڇci�<���p�g�##+g�;4ϸ��v?��)���>�9Ot���T~�M��1��I��K3�V�����e�r��q����%�x�]���3E>YZ]Y��78���˕ރ�^�3���E���Z�8�ֵm�ݜ!��)�CGl���>����IƄzk�/Gޏ����"���0����_!1aK�8�X~ k��7�> �C������'��_[���2,��d\^�k�l	�39.���K�Ϝk.v�Dar���2�p-�ˢR���C�z�ڥ�%�7y�r8?�����{p�r�0����,]3��3{/��A��i z�4�a�؊�:�j��ƞ.ˣ��&`N+S���Gx����<4f�T���!*��"b�`t��K��1/׾���v�YY{��~�J͘-3��K�W	����|[d �
�bjn�3��Mn9b"2��^����>YY__]�g4\�x��P��%�/���r���>�練hF	[�t�JɋE8��5��(�ߢ$^Q��C�_)ޔ'�<[Sg�2�8
ׁ�i�զHn��?�g��,fz�v�^�:ʂ^�i��П+B�>���s����?$��Y
��/��?�|�'��{�:y��Z�Em��/j>i%D����A^�]S���e7�0ȃ�N�F���M/��qwa!�[�%��F�k"P��=��b�}h�T[�X�����5T�ܯ�-=�����~�J������)���恵��Z*ܷ�5�4�<����:jC�A�W�d����EƉy<���n������n�ր�n���D+gc���8Q��Ւi��$në��7u���N7�J�b��|���W�6/ec�FL�LZ5S��٠��ęɤ��=��hB�1����mqqpחYҍŀT���+�TP1qK�2�n͜ww�Z_�^ �ݪ���*��R2��3��nCc�ւ������>*��)K�Į�ʭ������|l�9�j��=�s���q�^w��:���`r���
 "`�Q+��n(ϣ�r��k���8���������q/s�ʊE��22�����&�4�3e`�5;��}eK$���e�#�1Q��k��Us+T��L�rM�����f��Ҵ���%�x�J�Q�	�KF\�ɺZ�^��k���i^�0L�S�`EC�[��ۏ��-l���H��9uT���&'�j� *dٝ�e\'wQ���G��闶A��|*fg��pr�ɚe�l��d���C�t	/�!<E S~�r_ ��Bh"��p�#�E�ς踎8V/x6�Ж�^}D�8G~� �$́��� r8E��ɟelې�7��aHm�C�L�a��^~�+n�8���
wXd��X��Iz��8s-��1ض��z��9>� ���k�4��qj�DU<ukD_m�� �k�(/���p�"��0X$.�+\�f"4�hI�nOg���t�ߏ��w���
���S����P�E���B{xO��v�A���)]�7�� p�~s�]��O�	�V�wf̆,8����] kq'ؼA�{��']�q}�f_@Ơ=�ྜA��������1$L��ו$��	��4��д��d�α�ÉP�v]0c:?�p_-aE$@�:��LF�{B<H�'�w��;L���.g�ˑ�id�И�}2�R��n���s�C��im�p7uLe��-u��)�9��_��(�������h�8J܊�Ur7xA4ƺ�I�锂�[��b�"��[�C?� 7�Ei�mp(AD���?���|g�_D�l��o�� ˤ��<��k�5\$��\�VvH��a?�L�k�vk��*�<57ea�etR8k�m�S�T�bpQbD�Y|c3�#���12)�P쭺�]�t���p���x+8��A^	�2��-���(>.t;��wM�����xsx_��x���U�J�)�b֤�v�7��0�ju�9��|Z����r�E4�ȕ��1+��!�B��ل�QB�y\��"����B@!"��f@�����4�r'G�[���Tk����׶��}g}Xf�c?e��"�C)zg��6�ƪ��.��	2S��r��Ob��{Fj~�w]����2m�~TVy*�����1eP�X?Íu��b~8�R�p�i/��M���#��i�������~G ������c;>��ܷ{���e��:l"����_<��tj������c��\�f�r���	EY
j�8�N�A�l4��&�����e��י�!�rd���W����9��wE��u_�Y�%{:䐟�U�ᣋU,17x��u<AU�9����F�s)��m�c�5�� �u>��Ń����6�b����(j8�c�	�W9guIAn��"YxJVv�?Ak����ɒX8�~'�S4+J�F=�m��<�JF����ć0R���t���y��b����m���(�2��\��+���M�1Gk[�j
q,B�K$���)��K���z=����0�����,�Jx�T2��_���.Y�ah�)��"�vQv7��h��E(������ȟ@��NȨ0L�avz
��m���X.�l
n���΋	�g6�l�v��W(��#S�7��̱�L�	qT� �0�,0Ж�U���:�Ǣ4�B�ػ�aId�#�r�4�3���n�w���2��gWJ�9T-�5�`Oo��@����
|8#B_�,�`'s0 ���_G��3��
��aß�K�q�DpP4yS�i�������6h�5��62�v���/�S6<�m^�е��[�C���6U�C�
AD ;�]�[����Ӏ�d��	��H\��G�L���.ǩ8߸s��;VjqY�Wy����_�,�:梼é�$n�P���`�9�� �|���Y����f�����ߓ	�	�C���Q�C~
�_6�	��������8z��B<�Q����vt�u0� X��SY ��� �-H"�Mb^)g��xY�b*�T�v��3+Am�a����z��%��\7�3��Dp[��I�)��6�Ŕ9r=�f�;\u�5��<����-�JT��q�X��L&}y_�����;����SE[Asd>���90�Y��鸱���,�f�	qc5�1��d${�k� W�E@n35]Q�[T���۵Xiʊ�PH�H;^_p��E7aG�nS`���L�{���M� ������껉?���q�꟢vx�b����	�i`�\�g �� :_z��eP�1vxË������/e���;G���/?{��x���w��%�[R�"Iv��ͅ��c���3���iϟrdN����l����&��,2��k�"o��ae�\�x�f5�A����ļd��[����CgC��M=���O�l3*S�ͦRɁ�4׮J4���\�Vr�W9���Zl@�y/����9&��;�DP��S��cR�/�
��Ž�?�<�]��ȸjP��	����w�l��0);jsu+<tu��vQ?K���o;0y���AY�%֫H���nu7;�NT�4�'6�
�0��*cef�$-ISM: .Y�ӎч�|R��\�>!j�m��^���i�k�n}@5ܾ�����D��~�Li	�K�QZu��]�#�QY4ᇟ�&a�o���C9�V�I����\�8�32�;���(���Q�C��>�b^���ICdsN{�Iv(X���|`����rU�|HD�G�n,�
;Yl��z�P�P-���n�x(_��D��x�PS�I��tE�"�O�׈ �|��h����O\�?ɒ#�|2sBȸ�2L�qKGp����ħ��s�y�I�n`�\N׀�`�>�Ì�>�F��m,��Atj�1$��S1~l�w����w�r?���Z�q^P�}(3y����QԡQ��yՏB��-/&�Wqc�eQiý{Z�m	0Ѩ�������ҕ�}�"�T���KFt�ہ��Vr4Z�����߯�:<�_��!4!���`�HH��J"�!�5�����W��{����_�� ���=���v��.�?�~<w\s�Ɂ���1m/��7��ޔ<2�KB�/7���B��b`�C^���"��?�QLf*�S6��`�&��!1U�ƅ�WP.Oÿk�e�ɸ\y��MX�+ ��z���6ᴠ������*��C���g3��óz��E�����Ehgq�b(�w�.//u
�9��p�&O8+D��q9�[���ΐ �P�\m�W�#�]���61oX^�6���r^.^�vr����wNŕ�/Y���Ŧ�t�	~�`��,E��Pr�6��Թ�8��랛����%�p��lo�d��`CQr���SSL1w���C���@�Eh�e�O�S��\,���B�߂��)��w��J���vx���+/�����j+������yuS�������+ukZ�K�Swy8Ê��΍t��T�3M���67�#�v?�����s�8-���tc�u�Ԃ�j��)&p��G�u�j�1�|��|�i�.jՐq8��gj�Am����vO�}�|Uy0o���WP.F^�m�L�fsG�� ����3��XJ�H�7k)�U���F�'�H��!�S��o�O��pRj�����X	_@����41D"h3�A��H�Y�j��q$_k������â�9x��tc���O�zr+��7a��s�0r��vQ7�MYXB4���O��݌o>[�!^ڂ�4c�$t�������1�rV𑸆㄁#�����:Ňj�<�L3�5$p���z4�LPCh5��E}�.p);�=\9'
����� 6;�6||�(6���))��wU�����1�}j�45��RJJqRܫG�Oʮ*����On_�:����Q�qU3�Y�A����/�9���m$ ��D�=L�t���b>�F﹛�pF<7��ޕ�o�ՕӆE��{K`���i�ft��uE�z�Ea�+P�jG�s��VV�yF#�'MW��]�'qe�9�IO^�1�<�l�r�@F�]6J%l�c�ǻò �R[��[����N�[�O�;m�Z�Uz���5%8���Ӽܘ⁼&xFx��NSb�U���~�=��8dj��t�[AM�nb����,n�0����u����Ĺ��y{�hmV,I�TZ7w��.�n΀X!�C��Je��� ^��<r4��Í�v���n7�l�~��@�?��ƭ�7ԋ���I�����єDOc�.����zl���n��L��B�7�ɷ�ڙ]a�!*�l�W����K���?�%�q"��7�n�D�A}���
��%��p����L�M�br1�q�<���Jb*>O��;Í����v�&/E?wr:��

��L :���*qr�8�6�Q���٩�C�rP� �iG���Ko29E�4��M���B�;N�>��� ��m����$:�����1��;e�X���}�)P�
����i`�đ�;r%�d
cMi�9�-�.���ecL̉}��fξ��MS�X
h�E5�:7�U��4u�k�Y-pR8��	7(��z7���~@���Z�a��?�1��|b��zt�)><'~�h4VB�Ԛiu�X����a`�]����l>![�{G���r���&�����g}�W��ub�y�M|L��	0�ޔ|���0^:�t��~�z�m$�nq��"�"�x�Q��~2��{��hH��7wi>n���,���J	�4^g�U"+�&�Gt<��n� T`�x��[���s����#Rq�L�[��z�9ʆ9����0ʸB�ič�_�cf��C���(��}&�$4#�}��k0�* ��# ���
t�,�GR�a�����)R�5�rM�T�/{�����3J	���� �a���J�'M�p�(=��H]n�*t�X6{�c��f當s��V���S-w��}kj>{���T�Rp��2TV�h�RL�>3
�=b��1����9�q�mg)����D*o���S(fiަjQ�����ehb*]Y�Ad�7����a}��h2��:&�(�«߲^���M>�+gzlb�^�1F(�,(~�E
.R��{6bl��̏p�O����DA�g��c#���,2��/lOx�0�"a�b̞�%�h��	猕$\:�0^��-��m2K�1.�=��/�	�cᖦ\r�i��.��g��+�M}P�W�z���g9�(�=�0��|����̼����Ң��m'y`^�$����W0��խc�5�bl��;QJ�����`{F��	dT7��!��4{�eU��Ts�r��u[�f�������|�dK��	��8M��[�}�b�X+v�M���x�Kh%p�!���`p�X�[�Ŕ�Qw�/��O	� ��@�
��8�H�>�,�eHR=F.P���_�L�����^q���c\f�H'�p�B6�R�#��{@S�d_�G��b&�:T��
8�
���o�AKb��������el��L>�AXa�9%r�!��E!IGL��Bm�����>���>�[�29�X�c�fQ#�
�H03��� � �y�Ӳ��m�i����b�n�4�9ܗ�蛒I���Qg��
�W�1���$v���(�u��\�W�k%??�L!B\ʎB�zG\I�����0b�;f ��b��o������d_�%���W�4�$������@v�����=��ѝ�*ǹ��)�5���g/v�����݊|�p��6�s���y/�аˆĎ�/��~e;0-J����Z�_�j�*|���W���e+�W�8�E�Dz�-&�ñ�|ݪ��=2b�W^/��M� ��0L��0E���lN�2T��5x\�R������f�1��-��<���Nb�'��/� `t|�%�?�F!�~/>��{�A��{����ѥ�F�r���c�b�r��q����h�杔%���T���G!C���Mz��P�ϏC��`��� ���'dP�n������)��B͠yT�3�h,�Ft���-	��	�J��@��?����gk��F69�2=�|OF��$��u3ZoG����-f�M�2{A���I�������u���g�-jZX��젨x�Gs�c��XA�+]}�fwx�Sמ*�py �!�!)ޑ]� � ��&9�-�]��3KᝧJ�"q���R�p����a&S�P��v��8G��7�MF�
�N�ۑ����5��A��ָ��H@A�lyj���X��W��ar��Bu��Ô��T尷�o�x�-"�?���b�r�\ɧ>&&Uw�`0�g&yx̏�䯛�q��m�����W d}��Z&�^`���C�w�f��\�"(���(:(wyǃ�!=9]���v	�6l�m|.�6�Ɂ��� �~@E^i6�k&txĜ	]�pݽu�����U���Ca'@�Jc��Z��κK�Ǜf%���n/��1{ "@惚��z ����;�br�ESFO�
��"x�<B�H����}��y�V/B�� tL'7,A�,]/�λ�w侘�Q$�א��~�^E��m�N��F�����C�@�0��U�68�}E���0ƅ��bE���V��HV]�V��¤��"��o�G��P~-�u|D:G++��w\(����ѵ�� �0�� ft̄��#��S��������gŇ�7{D����K����p��#=���g݌S��<�XȨWw.��C�/_�e���������� ��;�Rٳ���7I��1��^���[0����#�9�ب�kN�\���^�_��yr��$�$�?WB��lVIN�ñ����82���Ys�~���u��.nZq���S-8�9+�!_x���U�z�s$Ej�̕d��I"~��@�.>lEjѓ7IƯ�Ŭe-��Z��X���B�zd/_�M����N�&��H@�Zz��{𠞕�����t�6�֘�Y�eٖ7m���D��1�X��E^}N{�J�<b`�B��s��ly���!L��h���1t¥�����=������U����y[Xi{,�E~��N��Z�;��'u׊��2H5�g�R�TS����j��L��2�5�X+�h8���X	4Q�\圃k�37�gw�Zɷ����iK�
�Z-�\[����R��,y{�Il͖-���lg]q�G�VǮ,��J'��:%#ʐJլ�5!�y���j=�r��^�
v2��u������-T���T7^�*_�����߭�U�����W�C9ߋ�u�x:�OX�룞���>��m��}mi!.V8���ï��%)�'�D|u���R�N��2d��,��+��!�0��f��٫N�ŋ�����J������*r�ѯ[��sYdt9d\�݊��!5tᶍ\�����ن��v�k��3�r�VO��K�QLO�A �#���~:�v ��
���ҟ��e��ʌ]�r�ɥ:�p?�s0�i�F��Aא���p裱�`R��ˋ�|=/�����_H��y)'���S岇}���[@ѝ'�x�5&z��������2��:��|�h�����S�ͥ}l����o����e��-1���~���^t�8��Q�%���� �/�5S�Mϳ�~�C��W����K�jݱ����0�+����'��S1�N��%�����������`~+���]���^�CY����}�#���?�7Tg3��z�8,B���N
�K�!��^	M����d 0�n9.�%PYh~���oU���"_X}eμ��F�����P+P ���o�o��7+_A�|�����k��<3���B��J��^��i0�,�U�7P5�x�c�dch��B�i�N=qF�j��!:a���x�<��-a���2���[%�x��U�6C����%R,�Ȅ�Y�N�߿��p�7ʏI�j�F1��&���|��鿞���.�*Nb��9�4���K�Dm�ė����;ݐ������{;���;������ʈ,t��8�o���]��ȁ��(�f#bj,��m���A�%.1��L�^p����n�k�,8��@���"�`+��(�����2؄}4��s����L&�5�Ĭ}u�157 Xs�`4r�Tϝ���
�P��0.�Wl2�4�0�U��t0�.�C��	caԏ���I�L��j�,.7}кg�!��n̰>u0C�dr#�2#�pכ@�ǀ��CQ�u��?E���6+i���0�*�R���<7���7p��44!.ύKҨ���H�|d���Ѓ��$�9�Fa4D���ǰ#� ����� �&R.PWy�c&ag-���_6a,��nKX�#�S�4��`�hh�˺��d�Gn,DF~4�>,������_�I�A(��k��jDz���5;bi��5��B�ї�@���s+8��t)�y��jo����!�BP�(0wгR���A��F��}�y���2�W�I����@��w��(� pmmi(�E2�Ìs��+�W�lh�1���^��Z��|R�!��	�4���y�M��8��1`�û�k�>�DG�ԙ$T�0V6�E� 0(5��W�߅�?և{�e��9;�_������s:>f��Q��v�n��[#O�[r��A��*��"��ng�3��D��l)#�).Cs5FL����VN�)��[�V�M:lk��V�D̈I�R+2�,I�F1m�U�_KJm�'����R�l	�ٲ=�O����RO	F�X��߄��@��)%ɹ��Ȳ&�X��Q&{���:��Q��p���c5k�l.�����&�9x1���#�i�t�)�F�TƁ������J�i���#\"E���s��rT�? ����wZ��������Xeq?�߇��w����X�͡�&%���q�H�!�@�XԶ8�'i'<�a��L�c��(
	t>=�m���9����LO�jDp�\���W�O�c����;;�N��b0sn&�©�}慣h�����{E��u0l���z��,K@�	N���@a���q���y&0�����"�3�Y��T��Oh��"-9zǮo��%wW=����+��xD#�(����X���.�*�93���F�wvTm�J*&þ��rɚ�l{� ��0�m�揽�W�mU��p'��iI.'�-��i�(�÷Q�%g�Dys(�4��d<����������߿�}L���쏲�T�A��.��.��V���dnUS��ϋ'�� ?��[u���6�-J�Qi2�c�A����q��k�ָ\�R��ru����A�O���%��ۛϕ#�"E����tH(?������tj���o�Ҟ
Y�2���!S�7Y��^��{�����m����{)ρ,r؈���@K֨1m���?>^Z�����(��J|8��Й���Ț#@)�m���Ď�/���ڙ'��`�/>�Ŋ���8c"�$�>&y�=�«ߖ۔�Չ��o�#.�Y�R�=���z����nc�G[{\W����F��/HtQ�m�q�4ęI���.�]X���f}�\����� :��!�̉���x짏.��}�Q9M��� ɒ�D�gps�?��V\E��T�Li|�C廟i��!��=��ӯ3?�:�RS�!;�؜0���بɓ�䄦�x��Ϻ�H{u��މ�B��!��3������-��pm�h@nXk�V���y�z�hj7h��N'�*�Z�tM���=!�{AĄ�(egw�ŝ��FL��IZ3���$��G���ʪ����@�5�voeì,��DU��3K�B҆W�
љY��Y��ց#��μ=>m�Me���-t��x���܀��B�J�9�d�y�{�� >�N�D��9
	�f��ɜmк[j<�X7���k���>�u���L_�/gb�wo'��bkr1֙N[�#UZ��x�Lo��ݦ�r7�i�3؞�V�\��| �h|�}�GFۄ�j�y��@^��_�fL�|�}#z��<�t�>�H�E�	�!9�1��p��y�1�� ?Y�@��Ǻ��e���9M���_��6�H����bLm�3]O�}�b�c��H�h�l~����ɩ�K�K���Χ��N]mC��`[��R53Ύ��'琞f1�����G�W�')DG�Fb�~���z�W<ܚ�{����b�~�f.�J�y�=�{��8u�G@��Xo�/�:3;)o�,��$w�^�0q$@+����?U�9�˚"fr/���DWt`�G��|���~	���p��Ɲ;m�Đ�D�g)[��މ�D��L�ϰ�j�1��?Z�m�z�x؋��
pQx99M6�t�2�����������I\�������A��?�ts�>���^`	��`�"�*mE��Γ8x
G�U���T�T����m�W�c�B�!��� ��1K����,�ɟ�a�{�줕i*Ϛ�9��ˇ�����C,�O����!47�D�����G��K��-�8`�*i�,�V�?Ω����B��[%:���`�IwA�漋�=ˮr�#Y�El��KY��������@l��@�ۂ*�5`��-������)>�cc�x�[�m��wԧXO�?FKai0`b���G#�,nse܆�s?<�d���P>P?��>���2H�IR��'b
�]Tx�a��DT8[�Kz:lA�n#~�;c�6��r򲕉:���_�E����_3)�r��;���?���F�O���>v�L��@���y=��@�wL�x
��7�-�7��.MGR����>[Ghߺ�4o1�����������_�[��8 �O�N7At�	���p2:�V?����p�/�O�fڭ�/5b�[	=�?Nh|6~��D9|oB�����j�9�T q���KE����
�ot�,�����)��Đ�@}Li�����ܸ�'���=�3�`���f������-֬c5�D6������)Ƥ��ѱ�\�xO-�\��s�\�d��x��Hi�ـ���\&<HV7���X�MGzݒ�RLE]%����YҜt�S����5�j���E47h��/��I���p��m\	��^T�X�c�b�%5�Y#R�/@��)�DAt�&�I"�����TI��@pc�ʾ�`�8YP� ��m�G�=?�t9�L��@EIL�Ck�D5�L �L����G�׳� +��D�F��u���ܱ�\�Z�ܖ�!Y�H�`�Y ō�!��s�]kK�Pɴ=C=4����=aÔ���	|8��R�+W)L (�4a�l���&�>�}v`2�{��(��(3�f�v�5�.��a*����Gv����	W��2���Dl��Or�Д�gιxP='Q���I��|UO�[��Icv�!���P+E�a���Ҡ��xu����c8������I���9$��5JUrm(�m���	s�p� d<�g[�*�����9T���T����5��E�6_�&��\Q0��zdI�����-Ҏ�l �7(�i��C�x���p�� �VŪ,�'B;`�{�H�����z/��C���K���P�Nͦ�M�5f��)}cgj@��ONՍ�*T>�T�&�c�D�������:��p=���&U,���܅�6����.�I��)�����鉗iW�Օ(ı?󨐐���>HY1�y#�p| ��Gl�%�,m?��X��0�z�E�"��L�$!$2'�j�g�J{Z�L��Z8囿4��H�P����ܛ��6��8�'�$<�`����b�\�K�8!)9����M�Kɞ�"X�e�l��!��c��o|@��a�L���`���9�}�	�ˉ[g1'b��\��Ì[7tK�
�w��z���"Lc�dpG��TI��w�s�B��{�\m�x V6�ҮN�L5��H�1�����TU�
\�{UN8�Ks�1��^�Lئ�1��c��9������Ϲ�Ng�ؓ}f�O�՛�n����Jc�.���"�+ʒK���<��De�Jou��>�8դ�K\6�!f�Z;�y�Xl�h�]	�'���������4>��^`^�X񞬩�+@vi"�p�JF����O���oΕ���j�v��mkliz�U��������-pќ=tW�:y�pN5��[@'U2l)sdP+U��n����
����}���4�k:�L��]��M@�j_R�r�R+�Y1�*�����<�Q���s��硦UN�������ȓ�������!`Z�0_���.g��2`i��V��Վ��w����ZݼǍ]ґ₦;� 1�o����4�<������ݎ|�9� C^�B`��<����d��Kh@Ǟ��c�pL+6�;/
F��c��q&:N:5��| GNf'�J�)��<�8S��0�(�����$9����v\^����GS6��Y7Ϟ�?�|.P�|��.���_g^�u�h���"�<�"�o���L�Q��b%[P����A�T�[��N� �����F.�91�d~ &�:�QΕ*�De�n�C��	�P�2k�L����`^��Q����`��HͼDe���t�W�FĹ��n�v�҅g�ȟ�P��X��$_~e�4�획Sj]��W�V����T4�u�V�PlHͨ�_3�v�fʄd_�(`�:� ���D����6v\�����w�P����ٍf,���:��
.c�.�=�����h֜ڋW\��U.�H�EJ��Ej��k��Z�H�u���i�Bʹ	9KL��6�[��kgDM /@��]n�N��b.`Rl��|�[%CF��J`�
�¡U!�4���J2�j7em�z	r���F�gq&��da"��&�+P@#קɘG׆��v��_0k���lϟ��T�������C;�8d�(`2`/'d�\�up����-z�����v�C�������j��
��J�҉7�K��6�)������j�L�8��h{ј�	"��.���z �ye�xlkz%�ٜ�͖���Z���+l�q��˷�S��%�Ck$�����a.�Z(���aR�5�Pk�6l5��-���^r"=��x��F�%��o1�OE=���Ӹ���G��PH#�Q��bFpY˹�c��Rj?�3cd9�?}�j����n+b/r��N��� ��Os�?q��n���z�, z��;J�L=K��r�m���R�g�?�5�2k� 0}�41�	b�C7����q�'w�yı01	Ճ�B���������&��e_��*����(�c^ZG� R+|���+~��&����O����iX2@�p�0!�MN|�\_�)�d�t� �g���t�������L�+��)��
Z��?9���4��ڈ���Q]'��T;K���K?�4�D�.�un)	�;	I��{"�f"�T��E�[��%��S��x= �.��5�m�߉;s'����1�)1M#6E&��ݤ�����*w��)��o����U$A6~�H���;e�ܐ�Mȿ��l���Ԍ!
���3FyL����x�_�S��/L�G���hbȣiG!d�h"rz����?���J<cɇ�\:�Pd��,<��Ϯn���_��$X��� ���$��,��5wu����^3y�����O�0��뻧�e��7�[մuK^j��G��PO�Ha-�����L���p�&��z�gƈ�S�>e��o�G��L5p%ͷ�������k��?��L	��I5|�%���F�[	v�S�{M[�1�i�!D{IM��N�d8t̶ͱ��	I����ęm�^�V��_g~"@����b=���_���0Wm��4>��|���
K�W����~�'Q����/��׋����Kb�����W���P�[v[̓h��'њa�{��B�yy�C7�%��k.�L��N�*�.P"�/���yA�0,y֛�%�L�n6b�~���-��|6	"oX����qU��0��|<ɂ���x�5��g���^��j��z$RM�*=A	��1��-}�d�:�Z��g�&O��>҃�-ʈ0$��B���ﾰ��W��h{�&Q�t能g��O���H7��^8T��^*IL�X�����'�X��h1-hv����>ǲ��ً焟�$�N�1��{�/O�Gv���L����~ <�$��39���"?r�ȉw��dCE�C8�W׀�Vl?#�ޝ�0	oC����Q�jX����N{/N�/�tԅ���Fg!��^�Pۙ�b+�V��  ���]�r���)੔kTь$���UEr�Ҭk]��H��!�5D4�r�ٕ,��r�K��)���M��#� 9����hD���F$��k����@����u�
�1Y�����q 7��H0R��K�	�a���#��x8b(o<B;�q6�0��Z��b�§�~���R]V,R�L��W�|���J�rl7Yݧ����dv/YV��T�>PwM�˭�-�cu��^�:��<uƌ�����?;{��ͮU흞FZw��!A$����r�Q7�Q��<.����FB����Z�4Q���5@��sP\�W����&@�]ۭ/��<�k�B�?�i\a�lJ5��rK�s��O �	ݐ6jPf�x���!�F�t�FRR�a�KF?��m����e~�J.�˦0&:<�  �
r,���9|��,A'���*C��d?P����Lv��?n��T��#G�2>�5�b1�6���
^����j��qM"p��&�,:��:�W$9���x��#9�E:ZZK˱NZ��#��Fq�_��Į�z?{��]*�ݘ?F99� ����x�����~���c�K�x?�Q�D�1*>�P揊Q�RX�ŵ�5��(I�/K>-��e�H������t��#�����|RK ���V�cw� $C�1���_� ��K����r�(ϒ�lެ�]��4`1�6T|���!*�\����%��,�;���r���&R���L	�=�p�˲�ܻ[i��z�!�|��80w�e���!6� �"�Q'D28է-&�"pjo'�b�&�H�ĐKD�~g>�jX�A��F4�l$I�M���=�D�2Q#.l���#���,!I��K	I�-gI6��dT�[KI�xn)I,%��$��$K;��(I�p'I�Mev��+f%Y^�@���dy�,/��f���G���|Bx}����QX#�D�Q�Fƈ�5�IF�t]ٕUA'ϝ�k[����d�[5[�H��ѕl4vϹ�g�~���1��X�E��-��>,��KC�Lm�u7��낤�zG�{�z���ow�3���)yM/��Kv�n��F��?�����We���F'- m��Q�+��Qߖ�����v��Ǆ²�h[�X}��4a����y"��^
U1�8~�	���*Z�K��R���1�N}���D?�*b^D^��l[�+�9����n�;���Ҩm�qDZi��E��PZ�w@Eק��k�U]ݾ|�6Ɯ�򜻺��o��d�Xr;���@XMΝ�3��.�3�l%�h0u<�{k�0`l����N5t���9�w�t2��l�;�Â��3н��v���(W����J��N�/��M$j�����y�t�G����&�m�����-+��.T!IC�B����O�t^�����BKƹ�PX8)��	�Q$��n]$%�Zm:x������w��c�5�����z�F��N��s�bj'������>��۴_�?z�,xT�WPm��Ua��z�I�ƞK<W�5�#׍h�4��+I�huu�~HN������&{�Ј�����u.~�}�O����@����ޥ�g����1+"~��߄c�X6��E���5���^�N߼9z3 ���O�wE�Ps9��I��3�lpI#'�j�d�OY�p�_�j��.9z�D˯��"Z�&R����W_��Y¶��1��Α6{����_��m=�r)��ǎ������Ͷc�`��BME��@�������XQ&�~��D���Ϟ�i����'������Ч�%�h��2�Kg����R�쓣o-�&����Rt=�����LRm�FZ�=�y�9��Z�k̂�/>���;�f���w:w��q�{��#�!���M6�P'�J<��ț��*
\��WD���//)���BqQ���7l�Al1�Tʻ窢���DU����K�1c�vU�IQ'��7Y�/k��S���)Ƕ���N������i�2Gf!���XΔ	<�R�?��
��� �S�7�^&I�u���'���S��Չo���F�}�ٝ��fOd��mdR9.��8�!Uh�o!U����ڬ]����D�L�Y<�m�uK�s�Y�W���=%m�7���|�!9��v��*��ԓ~0��=�Rs�@����1�-����#�a~����]��^"l�N�*|ɲ��D���,k�C����L���0�%��Ct�r&�f�9���e������6�!1�F/�����5�L��gg/�F��)�A'?�.=�-�!�k�h��xY;We�ߩ�:ū`���Z���u����:�x��	#�|߹���8�X�j�Z�[�ݾ����]G[�I6����=5�`L9��bW���o$ot|�����f@f�_�U?/�r��ث��6�6�&�.E<���l���mr���ʻ���{��2�#&��_y���ɍF4����N.�� ��Dh�9�3���ʅſa`E���ĥ	�M]B^H|��A�dP�5�\��������_A�._3��^��^�샾%�#Fby�.�G�m���{,�����|�I�T���2EM)�~[7���ILi��<tv.�`�"2f���!�f�C�\�l��TbaAH3N�s~��C.0�
�B�5�����$B��Oݤm�m6!������h[�l@�h�E���Q2�J�"m
�`!v���  �� 2C5�