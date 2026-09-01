export type Role = 'admin' | 'comissao' | 'formando' | 'public';

export interface Turma {
  id: string;
  name: string;
  institution: string;
  year: number;
  totalStudents: number;
  targetStudents: number;
  packagePrice: number;
  contractNumber: string;
  status: 'Ativo' | 'Em Negociação' | 'Concluído';
  image: string;
  location: string;
  extraInvitePrice?: number;
  extraInviteStartDate?: string;
  contractType?: 'turma' | 'individual';
  individualService?: string;
  individualCourse?: string;
}

export interface FormandoExtraPackage {
  id: string;
  name: string;
  price: number; // Valor Total (quantidade * unitPrice)
  unitPrice?: number; // Valor Unitário
  quantity?: number; // Quantidade contratada (padrão 1)
  category?: 'foto_video' | 'convites' | 'beca_vestuario' | 'mesas_acessos' | 'personalizados' | 'outros';
  itemType?: 'item_avulso' | 'pacote_avulso' | 'servico_customizado';
  status?: 'Confirmado' | 'Pendente' | 'Cancelado';
  description?: string;
  items?: string[];
  createdAt?: string;
}

export interface Formando {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  turmaId: string;
  role: 'formando' | 'comissao';
  packageSelected: string; // e.g. "Completo (Baile + Colação + Fotos)"
  extraPackages?: FormandoExtraPackage[]; // Pacotes adicionais exclusivos deste formando
  extraInvites: number;
  status: 'Ativo' | 'Pendente' | 'Inadimplente';
  joinedDate: string;
  totalPaid: number;
  totalDue: number;
  address?: string;
  studentCode?: string; // Unique student login access code
  password?: string; // Optional student password
  photoUrl?: string; // Profile picture URL
  convidados?: { id: string; name: string; cpf?: string }[];
  guestListFile?: { url: string; name: string; uploadedAt: string };
}

export interface Parcela {
  id: string;
  formandoId: string;
  number: number;
  value: number;
  dueDate: string;
  payDate?: string;
  status: 'Paga' | 'Pendente' | 'Atrasada';
  type: 'Pix' | 'Boleto' | 'Cartão';
  pixCode?: string;
  pixQrCodeUrl?: string;
  boletoBarcode?: string;
  boletoPdfUrl?: string;
  description?: string; // e.g. "Pacote Base" ou "Pacote Exclusivo: Ensaio Fotos"
  // Campos de integração com Gateway de Pagamento
  gatewayProvider?: 'mercadopago' | 'asaas' | 'boletocloud' | 'efi' | 'pagseguro' | 'manual';
  gatewayTransactionId?: string;
  gatewayPaymentLink?: string;
  gatewayStatus?: 'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled' | 'refunded';
  gatewayCreatedAt?: string;
  discountValue?: number;
  fineValue?: number;
  interestValue?: number;
  lastBillingSentAt?: string;
  lastBillingChannel?: 'whatsapp' | 'email' | 'both';
  billingSentCount?: number;
}

export interface Evento {
  id: string;
  turmaId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  suppliers: { name: string; service: string; status: 'Confirmado' | 'Pendente' }[];
  staff?: { name: string; role: string; phone: string; status: 'Confirmado' | 'Pendente'; photoUrl?: string }[];
}

export interface EnqueteOption {
  text: string;
  votes: number;
}

export interface Enquete {
  id: string;
  turmaId: string;
  question: string;
  options: EnqueteOption[];
  createdBy: string;
  endDate: string;
  active: boolean;
  votedStudentIds: string[]; // Keep track of who voted
}

export interface Album {
  id: string;
  turmaId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: string;
}

export interface Foto {
  id: string;
  turmaId: string;
  albumId?: string;
  formandoId?: string; // Optional: if present, this photo is exclusive to this student
  eventName: string;
  url: string;
  thumbnailUrl?: string; // Lightweight micro-thumbnail for instant blur-up placeholder
  caption: string;
  likes: number;
  comments: { author: string; text: string; date: string }[];
}

export interface MuralItem {
  id: string;
  turmaId: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'Geral' | 'Financeiro' | 'Evento' | 'Aviso Importante';
  imageUrl?: string;
  comments?: { id: string; author: string; text: string; date: string }[];
  pinned?: boolean;
}

export interface Fornecedor {
  id: string;
  name: string;
  service: string;
  phone: string;
  email: string;
  status: 'Ativo' | 'Em Prospecção';
  logoUrl?: string;
}

export interface Pacote {
  id: string;
  turmaId: string;
  name: string;
  description: string;
  price: number;
  items: string[];
}

export interface Depoimento {
  id: string;
  turmaId: string;
  formandoId: string;
  authorName: string;
  text: string;
  date: string;
  approved?: boolean;
}

export interface PushDevice {
  id: string;
  formandoId: string;
  token: string;
  browser: string;
  date: string;
  status: 'Ativo' | 'Simulado';
}

export interface TurmaMessage {
  id: string;
  turmaId: string;
  authorId: string;
  authorName: string;
  authorRole: 'formando' | 'comissao' | 'admin';
  authorPhotoUrl?: string;
  content: string;
  createdAt: string;
  category?: 'Geral' | 'Dúvida' | 'Comissão' | 'Sugestão' | 'Aviso' | 'Financeiro' | 'Evento';
  pinned?: boolean;
  replyTo?: {
    id: string;
    authorName: string;
    content: string;
    authorRole?: 'formando' | 'comissao' | 'admin';
  };
  reactions?: { [emoji: string]: string[] };
  status?: 'Pendente' | 'Respondida' | 'Em Análise';
  statusNote?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  category: 'Boleto' | 'Mural' | 'Geral';
  targetTurmaId: string | 'all';
  readBy: string[];
}

export interface Reuniao {
  id: string;
  turmaId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  link?: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  type: 'call' | 'whatsapp' | 'meeting' | 'email' | 'note' | 'proposal';
  description: string;
  date: string;
  author?: string;
  nextFollowUpDate?: string;
}

export interface Lead {
  id: string;
  name: string;
  institution: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  isComissao?: boolean;
  contactRoleTitle?: string;
  estimatedStudents: number;
  estimatedValue: number;
  stage: 'prospecting' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  packageId?: string;
  packageIds?: string[];
  contractType?: 'turma' | 'individual';
  convertedTurmaId?: string;
  convertedFormandoId?: string;
  activities?: LeadActivity[];
  leadScore?: number;
  priority?: 'alta' | 'media' | 'baixa';
  lossReason?: string;
  lossDetails?: string;
  stageUpdatedAt?: string;
  customTags?: string[];
}

export interface Expense {
  id: string;
  description: string;
  category: 
    | 'Aluguel & Condomínio'
    | 'Água, Luz & Consumo'
    | 'Internet, Telefone & TI'
    | 'Funcionários, Folha & Salários'
    | 'Fornecedores de Eventos'
    | 'Local / Espaço de Evento'
    | 'Buffet / A&B'
    | 'Equipe & Staff'
    | 'Decoração & Cenografia'
    | 'Segurança & Logística'
    | 'Marketing & Publicidade'
    | 'Impostos & Taxas'
    | 'Outras Despesas';
  amount: number;
  date: string;
  turmaId?: string;
  eventId?: string;
  eventName?: string;
  supplierName?: string;
  status: 'Pago' | 'Pendente' | 'Agendado';
  paymentMethod?: 'Pix' | 'Boleto' | 'Cartão' | 'Transferência' | 'Dinheiro';
  notes?: string;
  createdAt: string;
}

export interface StudentContract {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  content: string;
  templateId: string;
  theme: string;
  totalDue: number;
  sentAt: string;
  status: 'Pendente' | 'Assinado';
  signedAt?: string;
  signedHash?: string;
  signedIp?: string;
  signatureText?: string;
  signatureImage?: string;
  signatureMode?: string;
  isNewSignature?: boolean;
  adminViewedAt?: string;
}

export interface SiteVisitor {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  device: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  screenResolution?: string;
  referrer?: string;
  path: string;
  source: string; // Direct, Google, Instagram, WhatsApp, etc.
  country?: string;
  state?: string; // SP, RJ, MG, PR, etc.
  city?: string; // São Paulo, Campinas, Botucatu, etc.
  ip?: string;
  // Security, Access Logs & Commission Audit Fields
  eventType?:
    | 'page_view'
    | 'login_success'
    | 'login_failed'
    | 'commission_access'
    | 'admin_access'
    | 'portal_access';
  authStatus?: 'success' | 'failed' | 'blocked' | 'warning' | 'info';
  userEmail?: string;
  userName?: string;
  userRole?: 'comissao' | 'formando' | 'admin' | 'visitante';
  commissionRole?: string; // e.g. "Presidente", "Tesoureiro(a)", "Secretário(a)"
  turmaName?: string;
  attemptedAction?: string;
  failureReason?: string;
  securityRisk?: 'low' | 'medium' | 'high';
  sessionDuration?: string;
}

export interface VisitorTracking {
  totalVisits: number;
  uniqueVisitors: number;
  lastVisitAt?: string;
  dailyStats: {
    date: string;
    visits: number;
    uniques: number;
  }[];
  recentVisitors: SiteVisitor[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topPages: {
    path: string;
    name: string;
    views: number;
  }[];
  cityBreakdown?: {
    city: string;
    state: string;
    visits: number;
  }[];
  stateBreakdown?: {
    state: string;
    name: string;
    visits: number;
  }[];
}

export interface AdminTaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface AdminTask {
  id: string;
  title: string; // O que é a pendência
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'delivered';
  priority: 'alta' | 'media' | 'baixa';
  dueDate?: string; // Data do prazo de entrega
  dueTime?: string; // Horário do prazo de entrega
  turmaId?: string; // Link para a Turma / Curso
  courseName?: string; // Nome do Curso
  personName?: string; // Nome da Pessoa / Formando / Contato
  formandoId?: string; // Opcional: ID do formando vinculado
  assignedTo?: string; // Responsável interno
  category?: 'Financeiro' | 'Eventos' | 'Fornecedores' | 'Atendimento' | 'Fotografia' | 'Contratos' | 'Geral';
  completedAt?: string;
  createdAt: string;
  checklist?: AdminTaskChecklistItem[];
  tags?: string[];
}

export interface MercadoPagoConfig {
  enabled: boolean;
  environment: 'production' | 'sandbox';
  accessToken: string;
  publicKey: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  pixKey?: string;
  statementDescriptor?: string;
  acceptedPaymentMethods: {
    pix: boolean;
    boleto: boolean;
    creditCard: boolean;
  };
  installmentsMax?: number;
  interestRateMonthly?: number; // % juros mora ao mês
  finePercent?: number; // % multa por atraso
  earlyDiscountPercent?: number; // % desconto pontualidade
  autoSyncWebhook: boolean;
  notificationEmail?: string;
}

export interface PaymentGatewayConfig {
  activeProvider: 'mercadopago' | 'asaas' | 'boletocloud' | 'efi' | 'pagseguro';
  mercadopago: MercadoPagoConfig;
  defaultDueDays: number;
  webhookUrl: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'pending';
  lastTestMessage?: string;
}

export interface AppState {
  turmas: Turma[];
  formandos: Formando[];
  parcelas: Parcela[];
  eventos: Evento[];
  enquetes: Enquete[];
  albums: Album[];
  fotos: Foto[];
  mural: MuralItem[];
  fornecedores: Fornecedor[];
  pacotes: Pacote[];
  depoimentos: Depoimento[];
  notifications: SystemNotification[];
  reunioes: Reuniao[];
  leads: Lead[];
  pushTokens: PushDevice[];
  adminTasks?: AdminTask[];
  turmaMessages?: TurmaMessage[];
  portfolioAlbums?: any[];
  productGalleries?: Record<string, { url: string; title: string }[]>;
  visitorTracking?: VisitorTracking;
  gatewayConfig?: PaymentGatewayConfig;
  theme?: 'light' | 'dark';
}






