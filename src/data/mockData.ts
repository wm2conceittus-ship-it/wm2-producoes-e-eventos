import { Turma, Formando, Parcela, Evento, Enquete, Foto, Album, MuralItem, Fornecedor, Pacote, Depoimento, Reuniao, Lead, VisitorTracking, TurmaMessage, AdminTask, PaymentGatewayConfig } from '../types';

export const INITIAL_GATEWAY_CONFIG: PaymentGatewayConfig = {
  activeProvider: 'mercadopago',
  defaultDueDays: 5,
  webhookUrl: 'https://api.wm2producoes.com.br/v1/webhooks/mercadopago',
  lastTestedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  lastTestStatus: 'success',
  lastTestMessage: 'Conexão validada com sucesso na API Mercado Pago v1 (Access Token Autenticado e Ativo).',
  mercadopago: {
    enabled: true,
    environment: 'production',
    accessToken: 'APP_USR-7281920491823901-082719-7b98d2491a92e10948ac90184b9182ab-182938102',
    publicKey: 'APP_USR-82b9a710-4f91-49e8-8a29-19b842918b91',
    clientId: '7281920491823901',
    clientSecret: 'sec_mp_91028371982bca819028',
    webhookSecret: 'whsec_mp_829104819274819284719284',
    pixKey: 'financeiro@wm2producoes.com.br',
    statementDescriptor: 'WM2*FORMATURAS',
    acceptedPaymentMethods: {
      pix: true,
      boleto: true,
      creditCard: true
    },
    installmentsMax: 12,
    interestRateMonthly: 1.0,
    finePercent: 2.0,
    earlyDiscountPercent: 0,
    autoSyncWebhook: true,
    notificationEmail: 'cobrancas@wm2producoes.com.br'
  }
};

export const INITIAL_ADMIN_TASKS: AdminTask[] = [
  {
    id: 'task-1',
    title: 'Disparar lembrete de vencimento das parcelas de Setembro',
    description: 'Enviar régua de cobrança automática via WhatsApp e E-mail para os alunos com boletos a vencer.',
    status: 'todo',
    priority: 'alta',
    category: 'Financeiro',
    personName: 'Juliana Rocha (Presidente da Comissão)',
    courseName: 'Medicina USP 2026',
    assignedTo: 'Financeiro WM2',
    dueDate: '2026-09-05',
    dueTime: '10:00',
    turmaId: 't1',
    createdAt: '2026-08-20',
    tags: ['Cobrança', 'Boletos', 'WhatsApp'],
    checklist: [
      { id: 'c1', text: 'Gerar relatório de boletos a vencer', done: true },
      { id: 'c2', text: 'Revisar template de mensagem personalizada', done: true },
      { id: 'c3', text: 'Efetuar disparo via WhatsApp API', done: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Reunião de alinhamento com Buffet Villa Bisutti',
    description: 'Definir cardápio final, horário de montagem e quantidade de convidados extras para o Baile de Gala.',
    status: 'in_progress',
    priority: 'alta',
    category: 'Fornecedores',
    personName: 'Roberto Alencar (Gerente de Eventos Villa Bisutti)',
    courseName: 'Medicina USP 2026',
    assignedTo: 'Produtor Chefe',
    dueDate: '2026-08-28',
    dueTime: '14:30',
    turmaId: 't1',
    createdAt: '2026-08-21',
    tags: ['Buffet', 'Espaço', 'Alinhamento'],
    checklist: [
      { id: 'c4', text: 'Enviar lista estimada de convidados', done: true },
      { id: 'c5', text: 'Degustação do cardápio com a comissão', done: false },
      { id: 'c6', text: 'Assinar termo de liberação de carga e descarga', done: false }
    ]
  },
  {
    id: 'task-3',
    title: 'Agendar sessão de fotos de estúdio VIP',
    description: 'Confirmar maquiador, fotógrafo de estúdio e horários individuais de cada formando.',
    status: 'in_progress',
    priority: 'media',
    category: 'Fotografia',
    personName: 'Lucas Mendes (Tesoureiro da Comissão)',
    courseName: 'Odontologia UNESP 2025',
    assignedTo: 'Coordenação de Fotos',
    dueDate: '2026-09-02',
    dueTime: '09:00',
    turmaId: 't2',
    createdAt: '2026-08-22',
    tags: ['Estúdio', 'Fotos VIP', 'Agendamento'],
    checklist: [
      { id: 'c7', text: 'Publicar link da grade de horários para os alunos', done: true },
      { id: 'c8', text: 'Contratar equipe de beleza & maquiagem', done: true },
      { id: 'c9', text: 'Separar becas e capelos higienizados', done: false }
    ]
  },
  {
    id: 'task-4',
    title: 'Revisar e aprovar minutas de contratos aditivos de convites extras',
    description: 'Verificar solicitações de compra de mesas extras e emitir aditivos contratuais.',
    status: 'todo',
    priority: 'media',
    category: 'Contratos',
    personName: 'Dra. Camila Nogueira (Advogada da Comissão)',
    courseName: 'Direito Mackenzie 2025',
    assignedTo: 'Jurídico / Administrativo',
    dueDate: '2026-09-10',
    dueTime: '17:00',
    turmaId: 't3',
    createdAt: '2026-08-23',
    tags: ['Contratos', 'Mesas Extras'],
    checklist: [
      { id: 'c10', text: 'Conferir saldo de mesas disponíveis no salão', done: true },
      { id: 'c11', text: 'Validar dados cadastrais dos compradores', done: false }
    ]
  },
  {
    id: 'task-5',
    title: 'Contratar equipe de segurança credenciada e brigadistas',
    description: 'Solicitar alvará e documentação da empresa de segurança para o evento de Colação e Baile.',
    status: 'todo',
    priority: 'alta',
    category: 'Eventos',
    personName: 'Capitão Fernando (Grupo Force Segurança)',
    courseName: 'Medicina USP 2026',
    assignedTo: 'Operações de Eventos',
    dueDate: '2026-09-15',
    dueTime: '16:00',
    turmaId: 't1',
    createdAt: '2026-08-24',
    tags: ['Segurança', 'Alvará', 'Bombeiros']
  },
  {
    id: 'task-6',
    title: 'Aprovar layout das placas de mesa em aço escovado e canudos aveludados',
    description: 'Revisar provas digitais com a gráfica e confirmar nomes dos formandos e homenageados.',
    status: 'completed',
    priority: 'baixa',
    category: 'Geral',
    personName: 'Marcio Silva (Diretor Gráfica Nobre)',
    courseName: 'Engenharia Poli USP 2025',
    assignedTo: 'Designer WM2',
    dueDate: '2026-08-20',
    dueTime: '18:00',
    completedAt: '2026-08-20',
    createdAt: '2026-08-15',
    tags: ['Gráfica', 'Placas', 'Brindes'],
    checklist: [
      { id: 'c12', text: 'Conferir grafia dos nomes com lista oficial', done: true },
      { id: 'c13', text: 'Aprovação formal da comissão de formatura', done: true },
      { id: 'c14', text: 'Envio para produção na gráfica', done: true }
    ]
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Odontologia UNESP - Araraquara 2027',
    institution: 'UNESP Araraquara',
    contactName: 'Juliana Mendes',
    contactPhone: '(16) 99221-3344',
    contactEmail: 'juliana.mendes@unesp.br',
    isComissao: true,
    contactRoleTitle: 'Presidente da Comissão',
    estimatedStudents: 60,
    estimatedValue: 540000,
    stage: 'prospecting',
    notes: 'Interesse em pacote completo com baile de gala para 60 alunos. Solicitaram reunião presencial para agosto.',
    lastContactDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stageUpdatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'lead-2',
    name: 'Direito PUC - Campinas 2026',
    institution: 'PUC Campinas',
    contactName: 'Rodrigo Alencar',
    contactPhone: '(19) 98124-7788',
    contactEmail: 'rodrigo.alencar@puc.br',
    isComissao: true,
    contactRoleTitle: 'Tesoureiro da Comissão',
    estimatedStudents: 110,
    estimatedValue: 935000,
    stage: 'negotiation',
    notes: 'Negociando o valor do convite extra e número máximo de parcelas sem juros. Gostaram muito do nosso portfólio de decoração.',
    lastContactDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stageUpdatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'lead-3',
    name: 'Arquitetura USP - 2027',
    institution: 'Universidade de São Paulo',
    contactName: 'Clarissa Ramos',
    contactPhone: '(11) 97112-4455',
    contactEmail: 'clarissa.ramos@usp.br',
    estimatedStudents: 40,
    estimatedValue: 360000,
    stage: 'proposal_sent',
    notes: 'Proposta comercial enviada há alguns dias. Clarissa informou que a comissão de formatura ia se reunir para votar.',
    lastContactDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stageUpdatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'lead-4',
    name: 'Medicina Albert Einstein - 2028',
    institution: 'Faculdade Albert Einstein',
    contactName: 'Vitor Konda',
    contactPhone: '(11) 98888-9900',
    contactEmail: 'vitor.konda@einstein.br',
    estimatedStudents: 80,
    estimatedValue: 1040000,
    stage: 'contacted',
    notes: 'Primeiro contato por telefone bastante positivo. Explicamos o formato de captação financeira individualizada da WM2. Solicitaram envio do nosso media kit.',
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    stageUpdatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'lead-5',
    name: 'Psicologia Mackenzie - 2026',
    institution: 'Universidade Presbiteriana Mackenzie',
    contactName: 'Fernanda Costa',
    contactPhone: '(11) 99345-2211',
    contactEmail: 'fernanda.costa@mackenzie.br',
    estimatedStudents: 75,
    estimatedValue: 675000,
    stage: 'won',
    notes: 'Contrato fechado com sucesso! Iniciando a transição da comissão de formatura e coleta dos termos de adesão dos alunos.',
    lastContactDate: new Date().toISOString().split('T')[0],
    stageUpdatedAt: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'turma-med-unesp-2026',
    name: 'Medicina UNESP - Turma LIV',
    institution: 'Universidade Estadual Paulista',
    year: 2026,
    totalStudents: 45,
    targetStudents: 60,
    packagePrice: 12000,
    contractNumber: 'CONTR-2026-0042',
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=88&w=1600',
    location: 'Botucatu - SP'
  },
  {
    id: 'turma-dir-usp-2026',
    name: 'Direito USP - São Francisco',
    institution: 'Universidade de São Paulo',
    year: 2026,
    totalStudents: 124,
    targetStudents: 150,
    packagePrice: 8500,
    contractNumber: 'CONTR-2026-0078',
    status: 'Ativo',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=88&w=1600',
    location: 'São Paulo - SP'
  },
  {
    id: 'turma-eng-mack-2027',
    name: 'Engenharia Mackenzie - Turma A',
    institution: 'Universidade Presbiteriana Mackenzie',
    year: 2027,
    totalStudents: 85,
    targetStudents: 100,
    packagePrice: 9500,
    contractNumber: 'CONTR-2027-0102',
    status: 'Em Negociação',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=88&w=1600',
    location: 'São Paulo - SP'
  }
];

export const INITIAL_FORMANDOS: Formando[] = [
  // Medicine UNESP Students
  {
    id: 'std-1',
    name: 'Ana Beatriz Silva',
    email: 'anabeatriz@unesp.br',
    cpf: '123.456.789-00',
    phone: '(14) 99123-4567',
    turmaId: 'turma-med-unesp-2026',
    role: 'comissao',
    packageSelected: 'Pacote Master (Baile + Colação + Coquetel + Álbum)',
    extraInvites: 4,
    status: 'Ativo',
    joinedDate: '2023-03-15',
    totalPaid: 9000,
    totalDue: 12000,
    address: 'Av. Nações Unidas, 15-40 - Jardim das Nações, Bauru - SP',
    studentCode: 'MED-ANA-123'
  },
  {
    id: 'std-2',
    name: 'Carlos Eduardo Santos',
    email: 'carlos.eduardo@unesp.br',
    cpf: '234.567.890-11',
    phone: '(14) 99765-4321',
    turmaId: 'turma-med-unesp-2026',
    role: 'formando',
    packageSelected: 'Pacote Master (Baile + Colação + Coquetel + Álbum)',
    extraInvites: 2,
    status: 'Ativo',
    joinedDate: '2023-03-20',
    totalPaid: 8000,
    totalDue: 12000,
    address: 'Rua Getúlio Vargas, 220 - Centro, Botucatu - SP',
    studentCode: 'MED-CAR-456'
  },
  {
    id: 'std-3',
    name: 'Mariana Costa Oliveira',
    email: 'mariana.costa@unesp.br',
    cpf: '345.678.901-22',
    phone: '(14) 98112-2334',
    turmaId: 'turma-med-unesp-2026',
    role: 'formando',
    packageSelected: 'Pacote Executivo (Baile + Colação)',
    extraInvites: 0,
    status: 'Inadimplente',
    joinedDate: '2023-04-02',
    totalPaid: 4000,
    totalDue: 9500,
    address: 'Av. Vital Brasil, 850 - Jardim Paraíso, Botucatu - SP',
    studentCode: 'MED-MAR-789'
  },
  // Direito USP Students
  {
    id: 'std-4',
    name: 'Gabriel Mendes Rocha',
    email: 'gabriel.mendes@usp.br',
    cpf: '456.789.012-33',
    phone: '(11) 98877-6655',
    turmaId: 'turma-dir-usp-2026',
    role: 'comissao',
    packageSelected: 'Pacote Premium (Baile + Colação + Coquetel + Sessão Fotos)',
    extraInvites: 6,
    status: 'Ativo',
    joinedDate: '2023-02-10',
    totalPaid: 6500,
    totalDue: 8500,
    address: 'Largo São Francisco, 95 - Sé, São Paulo - SP',
    studentCode: 'DIR-GAB-111'
  },
  {
    id: 'std-5',
    name: 'Beatriz Almeida Prado',
    email: 'beatriz.prado@usp.br',
    cpf: '567.890.123-44',
    phone: '(11) 97766-5544',
    turmaId: 'turma-dir-usp-2026',
    role: 'formando',
    packageSelected: 'Pacote Premium (Baile + Colação + Coquetel + Sessão Fotos)',
    extraInvites: 1,
    status: 'Ativo',
    joinedDate: '2023-02-18',
    totalPaid: 6500,
    totalDue: 8500,
    address: 'Rua Bela Cintra, 1450 - Consolação, São Paulo - SP',
    studentCode: 'DIR-BEA-222'
  },
  {
    id: 'std-6',
    name: 'Lucas Ferreira Lima',
    email: 'lucas.lima@usp.br',
    cpf: '678.901.234-55',
    phone: '(11) 96655-4433',
    turmaId: 'turma-dir-usp-2026',
    role: 'formando',
    packageSelected: 'Pacote Básico (Colação de Grau)',
    extraInvites: 0,
    status: 'Pendente',
    joinedDate: '2023-05-10',
    totalPaid: 1000,
    totalDue: 3500,
    address: 'Av. Brigadeiro Luís Antônio, 3400 - Jardim Paulista, São Paulo - SP',
    studentCode: 'DIR-LUC-333'
  },
  // Mackenzie Students (negotiating)
  {
    id: 'std-7',
    name: 'Felipe Augusto Antunes',
    email: 'felipe.augusto@mackenzie.br',
    cpf: '789.012.345-66',
    phone: '(11) 95544-3322',
    turmaId: 'turma-eng-mack-2027',
    role: 'comissao',
    packageSelected: 'Pacote Completo (A definir)',
    extraInvites: 0,
    status: 'Pendente',
    joinedDate: '2024-02-05',
    totalPaid: 0,
    totalDue: 9500,
    address: 'Rua Maria Antônia, 400 - Vila Buarque, São Paulo - SP',
    studentCode: 'ENG-FEL-444'
  }
];

export const INITIAL_VISITOR_TRACKING: VisitorTracking = {
  totalVisits: 148,
  uniqueVisitors: 94,
  lastVisitAt: new Date().toISOString(),
  dailyStats: [
    { date: '2026-08-10', visits: 18, uniques: 12 },
    { date: '2026-08-11', visits: 24, uniques: 16 },
    { date: '2026-08-12', visits: 29, uniques: 19 },
    { date: '2026-08-13', visits: 21, uniques: 15 },
    { date: '2026-08-14', visits: 33, uniques: 22 },
    { date: '2026-08-15', visits: 38, uniques: 25 },
    { date: '2026-08-16', visits: 42, uniques: 28 },
  ],
  recentVisitors: [
    {
      id: 'vis-01',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      screenResolution: '390x844',
      referrer: 'https://instagram.com',
      path: '/portal-formando',
      source: 'Instagram Stories',
      city: 'Botucatu',
      state: 'SP',
      country: 'Brasil',
      ip: '189.44.120.45',
      eventType: 'login_success',
      authStatus: 'success',
      userEmail: 'gabriel.santos@medunesp.com.br',
      userName: 'Gabriel Santos Silva',
      userRole: 'formando',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Login com CPF no Portal do Formando & Consulta de 2ª via do Boleto',
      securityRisk: 'low',
      sessionDuration: '14 min'
    },
    {
      id: 'vis-02',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS 18 (iPhone 15)',
      screenResolution: '430x932',
      referrer: 'https://app.wm2.com.br/login',
      path: '/portal-formando',
      source: 'Direto',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      ip: '177.18.230.12',
      eventType: 'login_failed',
      authStatus: 'failed',
      userEmail: 'mariana.costa.tentativa@gmail.com',
      userName: 'Usuário Desconhecido (CPF: 412.***.***-89)',
      userRole: 'formando',
      turmaName: 'Direito USP 2025',
      attemptedAction: 'Tentativa de autenticação com senha incorreta (2ª tentativa)',
      failureReason: 'Senha incorreta (credenciais divergentes do cadastro)',
      securityRisk: 'medium',
      sessionDuration: '1 min'
    },
    {
      id: 'vis-03',
      timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Chrome 128',
      os: 'Windows 11',
      screenResolution: '1920x1080',
      referrer: 'https://comissao.wm2.com.br',
      path: '/comissao',
      source: 'Link Direto (Favoritos)',
      city: 'Botucatu',
      state: 'SP',
      country: 'Brasil',
      ip: '189.44.112.98',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'lucas.mendes.comissao@unesp.br',
      userName: 'Lucas Mendes',
      userRole: 'comissao',
      commissionRole: 'Presidente da Comissão',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Acesso à Área da Comissão: Consulta da Ata de Reunião & Aprovação de Fornecedor de Som',
      securityRisk: 'low',
      sessionDuration: '48 min'
    },
    {
      id: 'vis-04',
      timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Chrome 128',
      os: 'macOS Sonoma',
      screenResolution: '2560x1440',
      referrer: 'https://comissao.wm2.com.br/financeiro',
      path: '/comissao',
      source: 'Acesso Direto',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      ip: '201.82.15.60',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'mariana.costa@direito.usp.br',
      userName: 'Mariana Costa',
      userRole: 'comissao',
      commissionRole: 'Tesoureira da Comissão',
      turmaName: 'Direito USP 2025',
      attemptedAction: 'Acesso ao Painel Financeiro: Relatório de Inadimplência e Extrato Bancário da Turma',
      securityRisk: 'low',
      sessionDuration: '35 min'
    },
    {
      id: 'vis-05',
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS 18',
      screenResolution: '390x844',
      referrer: 'https://app.wm2.com.br/admin',
      path: '/admin',
      source: 'Direto',
      city: 'Ribeirão Preto',
      state: 'SP',
      country: 'Brasil',
      ip: '179.108.45.210',
      eventType: 'login_failed',
      authStatus: 'blocked',
      userEmail: 'admin.root@desconhecido.com',
      userName: 'IP Bloqueado (Múltiplas Requisições)',
      userRole: 'visitante',
      attemptedAction: 'Tentativa de login administrativo com usuário inexistente',
      failureReason: 'Usuário e-mail inexistente + Força bruta detectada (5 tentativas em 30s)',
      securityRisk: 'high',
      sessionDuration: '0 min'
    },
    {
      id: 'vis-06',
      timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Edge 128',
      os: 'Windows 11',
      screenResolution: '1920x1080',
      referrer: 'WhatsApp Web',
      path: '/comissao',
      source: 'WhatsApp',
      city: 'Campinas',
      state: 'SP',
      country: 'Brasil',
      ip: '187.55.90.14',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'rodrigo.alencar@unicamp.br',
      userName: 'Rodrigo Alencar',
      userRole: 'comissao',
      commissionRole: 'Secretário da Comissão',
      turmaName: 'Engenharia Mecânica UNICAMP 2027',
      attemptedAction: 'Acesso à Votação da Comissão: Enquete de Escolha do Espaço de Eventos',
      securityRisk: 'low',
      sessionDuration: '22 min'
    },
    {
      id: 'vis-07',
      timestamp: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      screenResolution: '412x915',
      referrer: 'WhatsApp',
      path: '/portal-formando',
      source: 'WhatsApp Link',
      city: 'Bauru',
      state: 'SP',
      country: 'Brasil',
      ip: '177.36.190.77',
      eventType: 'login_success',
      authStatus: 'success',
      userEmail: 'juliana.fernandes@unesp.br',
      userName: 'Juliana Fernandes',
      userRole: 'formando',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Assinatura digital do Termo de Adesão & Upload de Comprovante Pix',
      securityRisk: 'low',
      sessionDuration: '18 min'
    },
    {
      id: 'vis-08',
      timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS 17',
      screenResolution: '393x852',
      referrer: 'Direto',
      path: '/portal-formando',
      source: 'Direto',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      ip: '189.19.45.88',
      eventType: 'login_failed',
      authStatus: 'failed',
      userEmail: 'pedro.henrique.med@gmail.com',
      userName: 'Pedro Henrique (CPF: 388.***.***-12)',
      userRole: 'formando',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Tentativa de login no Portal com CPF não cadastrado na turma',
      failureReason: 'CPF não localizado na base de formandos ativos',
      securityRisk: 'medium',
      sessionDuration: '2 min'
    },
    {
      id: 'vis-09',
      timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Chrome 128',
      os: 'macOS Sonoma',
      screenResolution: '1920x1080',
      referrer: 'https://wm2eventos.com.br',
      path: '/admin',
      source: 'Direto',
      city: 'Botucatu',
      state: 'SP',
      country: 'Brasil',
      ip: '189.44.110.1',
      eventType: 'admin_access',
      authStatus: 'success',
      userEmail: 'contato@wm2eventos.com.br',
      userName: 'Administrador Master WM2',
      userRole: 'admin',
      attemptedAction: 'Acesso com Privilégios Totais: Configuração de Gateways de Pagamento e DRE',
      securityRisk: 'low',
      sessionDuration: '1h 15 min'
    },
    {
      id: 'vis-10',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      screenResolution: '360x800',
      referrer: 'WhatsApp',
      path: '/comissao',
      source: 'WhatsApp',
      city: 'Piracicaba',
      state: 'SP',
      country: 'Brasil',
      ip: '177.89.210.4',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'beatriz.nogueira@usp.br',
      userName: 'Beatriz Nogueira',
      userRole: 'comissao',
      commissionRole: 'Membro da Comissão',
      turmaName: 'Administração ESALQ 2026',
      attemptedAction: 'Acesso à Galeria de Fornecedores: Avaliação de Propostas de Decoração',
      securityRisk: 'low',
      sessionDuration: '15 min'
    },
    {
      id: 'vis-11',
      timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Firefox 129',
      os: 'Windows 10',
      screenResolution: '1920x1080',
      referrer: 'https://google.com.br',
      path: '/comissao',
      source: 'Google',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      ip: '200.150.32.18',
      eventType: 'login_failed',
      authStatus: 'failed',
      userEmail: 'tentativa.externa@ufrj.br',
      userName: 'Acesso Não Autorizado',
      userRole: 'visitante',
      attemptedAction: 'Tentativa de acesso direto à URL restrita /comissao sem autenticação prévia',
      failureReason: 'Sessão inválida ou expirada (HTTP 401 Unauthorized)',
      securityRisk: 'medium',
      sessionDuration: '0 min'
    },
    {
      id: 'vis-12',
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS 18',
      screenResolution: '390x844',
      referrer: 'WhatsApp',
      path: '/portal-formando',
      source: 'WhatsApp',
      city: 'Santos',
      state: 'SP',
      country: 'Brasil',
      ip: '179.220.10.95',
      eventType: 'login_success',
      authStatus: 'success',
      userEmail: 'felipe.alves@direito.usp.br',
      userName: 'Felipe Alves',
      userRole: 'formando',
      turmaName: 'Direito USP 2025',
      attemptedAction: 'Acesso ao Mural de Avisos e Confirmação de Presença no Baile',
      securityRisk: 'low',
      sessionDuration: '9 min'
    },
    {
      id: 'vis-13',
      timestamp: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Chrome 128',
      os: 'macOS Sonoma',
      screenResolution: '2560x1080',
      referrer: 'https://comissao.wm2.com.br',
      path: '/comissao',
      source: 'Direto',
      city: 'Botucatu',
      state: 'SP',
      country: 'Brasil',
      ip: '189.44.112.98',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'lucas.mendes.comissao@unesp.br',
      userName: 'Lucas Mendes',
      userRole: 'comissao',
      commissionRole: 'Presidente da Comissão',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Download do Relatório Consolidado de Vendas de Convites Extras',
      securityRisk: 'low',
      sessionDuration: '28 min'
    },
    {
      id: 'vis-14',
      timestamp: new Date(Date.now() - 270 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      screenResolution: '412x915',
      referrer: 'https://instagram.com',
      path: '/galeria',
      source: 'Instagram Stories',
      city: 'Araraquara',
      state: 'SP',
      country: 'Brasil',
      ip: '177.100.80.33',
      eventType: 'page_view',
      authStatus: 'info',
      userName: 'Visitante Anônimo',
      userRole: 'visitante',
      attemptedAction: 'Visualização da Galeria de Fotos e Álbum Oficial da Formatura',
      securityRisk: 'low',
      sessionDuration: '6 min'
    },
    {
      id: 'vis-15',
      timestamp: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Edge',
      os: 'Windows 11',
      screenResolution: '1920x1080',
      referrer: 'Direto',
      path: '/admin/login',
      source: 'Direto',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      ip: '186.250.12.8',
      eventType: 'login_failed',
      authStatus: 'failed',
      userEmail: 'suporte@empresaexterna.com',
      userName: 'Tentativa Não Autorizada',
      userRole: 'visitante',
      attemptedAction: 'Tentativa de login administrativo com token de autenticação expirado',
      failureReason: 'Token de autenticação JWT inválido ou expirado',
      securityRisk: 'medium',
      sessionDuration: '1 min'
    },
    {
      id: 'vis-16',
      timestamp: new Date(Date.now() - 380 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS 18',
      screenResolution: '430x932',
      referrer: 'WhatsApp',
      path: '/comissao',
      source: 'WhatsApp',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      ip: '201.82.15.60',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'mariana.costa@direito.usp.br',
      userName: 'Mariana Costa',
      userRole: 'comissao',
      commissionRole: 'Tesoureira da Comissão',
      turmaName: 'Direito USP 2025',
      attemptedAction: 'Aprovação de Pagamento de Fornecedor de Cenografia via Chave Pix',
      securityRisk: 'low',
      sessionDuration: '12 min'
    },
    {
      id: 'vis-17',
      timestamp: new Date(Date.now() - 440 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'tablet',
      browser: 'Safari iPad',
      os: 'iPadOS 17',
      screenResolution: '1024x768',
      referrer: 'Direto',
      path: '/produtos',
      source: 'Acesso Direto',
      city: 'Jundiaí',
      state: 'SP',
      country: 'Brasil',
      ip: '189.60.25.14',
      eventType: 'page_view',
      authStatus: 'info',
      userName: 'Visitante Anônimo',
      userRole: 'visitante',
      attemptedAction: 'Navegação no Catálogo de Produtos e Convites Luxo',
      securityRisk: 'low',
      sessionDuration: '8 min'
    },
    {
      id: 'vis-18',
      timestamp: new Date(Date.now() - 500 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Chrome Mobile',
      os: 'Android 14',
      screenResolution: '384x854',
      referrer: 'https://instagram.com',
      path: '/portal-formando',
      source: 'Instagram Reels',
      city: 'Franca',
      state: 'SP',
      country: 'Brasil',
      ip: '177.20.150.88',
      eventType: 'login_success',
      authStatus: 'success',
      userEmail: 'camila.rocha@unesp.br',
      userName: 'Camila Rocha',
      userRole: 'formando',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Seleção do Pacote Premium & Escolha de 15 Fotos para Álbum Físico',
      securityRisk: 'low',
      sessionDuration: '24 min'
    },
    {
      id: 'vis-19',
      timestamp: new Date(Date.now() - 580 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Safari',
      os: 'macOS',
      screenResolution: '1440x900',
      referrer: 'https://google.com',
      path: '/eventos',
      source: 'Google',
      city: 'Uberlândia',
      state: 'MG',
      country: 'Brasil',
      ip: '187.120.40.19',
      eventType: 'page_view',
      authStatus: 'info',
      userName: 'Visitante Anônimo',
      userRole: 'visitante',
      attemptedAction: 'Consulta do Cronograma Geral de Eventos e Festas',
      securityRisk: 'low',
      sessionDuration: '5 min'
    },
    {
      id: 'vis-20',
      timestamp: new Date(Date.now() - 650 * 60 * 1000).toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS 17',
      screenResolution: '390x844',
      referrer: 'WhatsApp',
      path: '/comissao',
      source: 'WhatsApp',
      city: 'Campinas',
      state: 'SP',
      country: 'Brasil',
      ip: '187.55.90.14',
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: 'rodrigo.alencar@unicamp.br',
      userName: 'Rodrigo Alencar',
      userRole: 'comissao',
      commissionRole: 'Secretário da Comissão',
      turmaName: 'Engenharia Mecânica UNICAMP 2027',
      attemptedAction: 'Criação de Nova Enquete sobre Tema do Pré-Evento',
      securityRisk: 'low',
      sessionDuration: '19 min'
    }
  ],
  deviceBreakdown: {
    mobile: 98,
    desktop: 44,
    tablet: 6
  },
  topPages: [
    { path: '/', name: 'Página Inicial (Landing Page)', views: 112 },
    { path: '/portal-formando', name: 'Portal do Formando (Login/Adesão)', views: 76 },
    { path: '/galeria', name: 'Galeria & Portfólio de Formaturas', views: 58 },
    { path: '/eventos', name: 'Cronograma de Eventos', views: 39 },
    { path: '/comissao', name: 'Área da Comissão de Formatura', views: 27 }
  ],
  cityBreakdown: [
    { city: 'São Paulo', state: 'SP', visits: 54 },
    { city: 'Campinas', state: 'SP', visits: 28 },
    { city: 'Botucatu', state: 'SP', visits: 22 },
    { city: 'Ribeirão Preto', state: 'SP', visits: 16 },
    { city: 'Belo Horizonte', state: 'MG', visits: 12 },
    { city: 'Rio de Janeiro', state: 'RJ', visits: 9 },
    { city: 'Curitiba', state: 'PR', visits: 7 }
  ],
  stateBreakdown: [
    { state: 'SP', name: 'São Paulo', visits: 120 },
    { state: 'MG', name: 'Minas Gerais', visits: 12 },
    { state: 'RJ', name: 'Rio de Janeiro', visits: 9 },
    { state: 'PR', name: 'Paraná', visits: 7 }
  ]
};

export const INITIAL_PARCELAS: Parcela[] = [
  // Ana Beatriz Silva (std-1) - Total 12000, 10x 1200. Paid 9000 (7.5 installments paid)
  { id: 'p-1-1', formandoId: 'std-1', number: 1, value: 1200, dueDate: '2025-01-10', payDate: '2025-01-08', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018241', gatewayStatus: 'approved' },
  { id: 'p-1-2', formandoId: 'std-1', number: 2, value: 1200, dueDate: '2025-02-10', payDate: '2025-02-09', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018242', gatewayStatus: 'approved' },
  { id: 'p-1-3', formandoId: 'std-1', number: 3, value: 1200, dueDate: '2025-03-10', payDate: '2025-03-10', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018243', gatewayStatus: 'approved' },
  { id: 'p-1-4', formandoId: 'std-1', number: 4, value: 1200, dueDate: '2025-04-10', payDate: '2025-04-05', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018244', gatewayStatus: 'approved' },
  { id: 'p-1-5', formandoId: 'std-1', number: 5, value: 1200, dueDate: '2025-05-10', payDate: '2025-05-09', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018245', gatewayStatus: 'approved' },
  { id: 'p-1-6', formandoId: 'std-1', number: 6, value: 1200, dueDate: '2025-06-10', payDate: '2026-06-08', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018246', gatewayStatus: 'approved' },
  { 
    id: 'p-1-7', 
    formandoId: 'std-1', 
    number: 7, 
    value: 1200, 
    dueDate: '2026-07-10', 
    status: 'Pendente', 
    type: 'Pix', 
    pixCode: '00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2 PRODUCOES6009SAO PAULO62070503***6304E8A2', 
    pixQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2%20PRODUCOES6009SAO%20PAULO62070503***6304E8A2',
    gatewayProvider: 'mercadopago',
    gatewayTransactionId: 'MP-TX-9821740',
    gatewayPaymentLink: 'https://mpago.la/pos/9821740',
    gatewayStatus: 'pending',
    gatewayCreatedAt: '2026-06-01'
  },
  { 
    id: 'p-1-8', 
    formandoId: 'std-1', 
    number: 8, 
    value: 1200, 
    dueDate: '2026-08-10', 
    status: 'Pendente', 
    type: 'Boleto', 
    boletoBarcode: '34191.79001 01043.513184 91020.150008 7 94220000120000',
    boletoPdfUrl: 'https://www.mercadopago.com.br/payments/9821741/ticket',
    gatewayProvider: 'mercadopago',
    gatewayTransactionId: 'MP-TX-9821741',
    gatewayPaymentLink: 'https://mpago.la/pos/9821741',
    gatewayStatus: 'pending',
    gatewayCreatedAt: '2026-06-01'
  },
  
  // Carlos Eduardo (std-2) - Total 12000, 10x 1200. Paid 8000
  { id: 'p-2-1', formandoId: 'std-2', number: 1, value: 1200, dueDate: '2025-01-10', payDate: '2025-01-10', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018251', gatewayStatus: 'approved' },
  { id: 'p-2-2', formandoId: 'std-2', number: 2, value: 1200, dueDate: '2025-02-10', payDate: '2025-02-09', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018252', gatewayStatus: 'approved' },
  { id: 'p-2-3', formandoId: 'std-2', number: 3, value: 1200, dueDate: '2025-03-10', payDate: '2025-03-05', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018253', gatewayStatus: 'approved' },
  { id: 'p-2-4', formandoId: 'std-2', number: 4, value: 1200, dueDate: '2025-04-10', payDate: '2025-04-10', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018254', gatewayStatus: 'approved' },
  { 
    id: 'p-2-5', 
    formandoId: 'std-2', 
    number: 5, 
    value: 1200, 
    dueDate: '2025-05-10', 
    status: 'Atrasada', 
    type: 'Pix', 
    pixCode: '00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2 PRODUCOES6009SAO PAULO62070503***6304E8A2', 
    pixQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2%20PRODUCOES6009SAO%20PAULO62070503***6304E8A2',
    gatewayProvider: 'mercadopago',
    gatewayTransactionId: 'MP-TX-9821755',
    gatewayPaymentLink: 'https://mpago.la/pos/9821755',
    gatewayStatus: 'in_process',
    gatewayCreatedAt: '2025-04-20'
  },
  { 
    id: 'p-2-6', 
    formandoId: 'std-2', 
    number: 6, 
    value: 1200, 
    dueDate: '2025-06-10', 
    status: 'Atrasada', 
    type: 'Boleto', 
    boletoBarcode: '34191.79001 01043.513184 91020.150008 7 94220000120000',
    boletoPdfUrl: 'https://www.mercadopago.com.br/payments/9821756/ticket',
    gatewayProvider: 'mercadopago',
    gatewayTransactionId: 'MP-TX-9821756',
    gatewayPaymentLink: 'https://mpago.la/pos/9821756',
    gatewayStatus: 'in_process',
    gatewayCreatedAt: '2025-05-20'
  },

  // Mariana Costa (std-3) - Total 9500, 10x 950. Paid 4000. Late on payments.
  { id: 'p-3-1', formandoId: 'std-3', number: 1, value: 950, dueDate: '2025-01-10', payDate: '2025-01-12', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018261', gatewayStatus: 'approved' },
  { id: 'p-3-2', formandoId: 'std-3', number: 2, value: 950, dueDate: '2025-02-10', payDate: '2025-02-10', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018262', gatewayStatus: 'approved' },
  { id: 'p-3-3', formandoId: 'std-3', number: 3, value: 950, dueDate: '2025-03-10', status: 'Atrasada', type: 'Pix', pixCode: '00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2 PRODUCOES6009SAO PAULO62070503***6304E8A2', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9821763' },
  { id: 'p-3-4', formandoId: 'std-3', number: 4, value: 950, dueDate: '2025-04-10', status: 'Atrasada', type: 'Boleto', boletoBarcode: '34191.79001 01043.513184 91020.150008 7 94220000120000', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9821764' },

  // Gabriel Mendes (std-4) - USP - Total 8500, 10x 850. Paid 6500
  { id: 'p-4-1', formandoId: 'std-4', number: 1, value: 850, dueDate: '2025-01-15', payDate: '2025-01-14', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018271', gatewayStatus: 'approved' },
  { id: 'p-4-2', formandoId: 'std-4', number: 2, value: 850, dueDate: '2025-02-15', payDate: '2025-02-15', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018272', gatewayStatus: 'approved' },
  { id: 'p-4-3', formandoId: 'std-4', number: 3, value: 850, dueDate: '2025-03-15', payDate: '2025-03-10', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018273', gatewayStatus: 'approved' },
  { id: 'p-4-4', formandoId: 'std-4', number: 4, value: 850, dueDate: '2025-04-15', payDate: '2025-04-15', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018274', gatewayStatus: 'approved' },
  { id: 'p-4-5', formandoId: 'std-4', number: 5, value: 850, dueDate: '2025-05-15', payDate: '2025-05-12', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018275', gatewayStatus: 'approved' },
  { id: 'p-4-6', formandoId: 'std-4', number: 6, value: 850, dueDate: '2025-06-15', status: 'Pendente', type: 'Pix', pixCode: '00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2 PRODUCOES6009SAO PAULO62070503***6304E8A2', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9821776' },

  // Beatriz Prado (std-5) - USP - Total 8500, 10x 850. Paid 6500
  { id: 'p-5-1', formandoId: 'std-5', number: 1, value: 850, dueDate: '2025-01-15', payDate: '2025-01-15', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018281', gatewayStatus: 'approved' },
  { id: 'p-5-2', formandoId: 'std-5', number: 2, value: 850, dueDate: '2025-02-15', payDate: '2025-02-14', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018282', gatewayStatus: 'approved' },
  { id: 'p-5-3', formandoId: 'std-5', number: 3, value: 850, dueDate: '2025-03-15', payDate: '2025-03-15', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018283', gatewayStatus: 'approved' },
  { id: 'p-5-4', formandoId: 'std-5', number: 4, value: 850, dueDate: '2025-04-15', payDate: '2025-04-15', status: 'Paga', type: 'Pix', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018284', gatewayStatus: 'approved' },
  { id: 'p-5-5', formandoId: 'std-5', number: 5, value: 850, dueDate: '2025-05-15', payDate: '2025-05-11', status: 'Paga', type: 'Boleto', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9018285', gatewayStatus: 'approved' },
  { id: 'p-5-6', formandoId: 'std-5', number: 6, value: 850, dueDate: '2025-06-15', status: 'Pendente', type: 'Pix', pixCode: '00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2 PRODUCOES6009SAO PAULO62070503***6304E8A2', gatewayProvider: 'mercadopago', gatewayTransactionId: 'MP-TX-9821786' }
];

export const INITIAL_EVENTOS: Evento[] = [
  {
    id: 'evt-1',
    turmaId: 'turma-med-unesp-2026',
    title: 'Baile de Gala',
    date: '2026-11-14',
    time: '22:00',
    venue: 'Espaço Villa Noah, São Paulo - SP',
    description: 'O grande baile com jantar completo, open bar premium, banda show de projeção nacional e decoração exclusiva WM2.',
    suppliers: [
      { name: 'Buffet Villa Noah', service: 'Buffet & Bebidas', status: 'Confirmado' },
      { name: 'Banda Santa Maria', service: 'Atração Musical Principal', status: 'Confirmado' },
      { name: 'DecorArt Eventos', service: 'Decoração & Floricultura', status: 'Confirmado' },
      { name: 'Vip Security', service: 'Segurança & Manobristas', status: 'Pendente' }
    ],
    staff: [
      { name: 'Roberto Alencar', role: 'Coordenador Geral', phone: '(11) 98888-7777', status: 'Confirmado' },
      { name: 'Mariana Costa', role: 'Cerimonialista Chefe', phone: '(11) 97777-6666', status: 'Confirmado' },
      { name: 'Lucas Peixoto', role: 'Suporte Técnico Audiovisual', phone: '(11) 96666-5555', status: 'Pendente' }
    ]
  },
  {
    id: 'evt-2',
    turmaId: 'turma-med-unesp-2026',
    title: 'Colação de Grau Oficial',
    date: '2026-11-12',
    time: '19:30',
    venue: 'Auditório Principal da Unesp Rubião Júnior, Botucatu - SP',
    description: 'Solenidade oficial de colação com cerimonial completo WM2, capelo, beca, discursos e homenagens.',
    suppliers: [
      { name: 'WM2 Cenografia', service: 'Palco & Som', status: 'Confirmado' },
      { name: 'Mestre de Cerimônias André', service: 'Apresentador', status: 'Confirmado' },
      { name: 'Coral Harmonia', service: 'Música Solene', status: 'Confirmado' }
    ],
    staff: [
      { name: 'Mariana Costa', role: 'Cerimonialista Chefe', phone: '(11) 97777-6666', status: 'Confirmado' },
      { name: 'Carla Souza', role: 'Credenciamento & Recepção', phone: '(14) 95555-4444', status: 'Confirmado' }
    ]
  },
  {
    id: 'evt-3',
    turmaId: 'turma-med-unesp-2026',
    title: 'Churrasco Pré-Evento (100 Dias)',
    date: '2026-08-08',
    time: '12:00',
    venue: 'Chácara Recanto Verde, Botucatu - SP',
    description: 'Churrasco de confraternização celebrando os últimos 100 dias até a formatura. Samba ao vivo, chopp liberado e caneca personalizada.',
    suppliers: [
      { name: 'Churras do Chef', service: 'Catering de Churrasco', status: 'Confirmado' },
      { name: 'Grupo Sem Limite', service: 'Roda de Samba', status: 'Confirmado' }
    ]
  },
  // Direito USP
  {
    id: 'evt-4',
    turmaId: 'turma-dir-usp-2026',
    title: 'Baile de Gala das Arcadas',
    date: '2026-12-19',
    time: '23:00',
    venue: 'Clube Atlético Monte Líbano, São Paulo - SP',
    description: 'Tradicionalíssimo baile de formatura do Largo de São Francisco. Luxo, alta gastronomia e atrações inesquecíveis.',
    suppliers: [
      { name: 'Buffet Monte Líbano', service: 'Gastronomia', status: 'Confirmado' },
      { name: 'Banda Evidence', service: 'Atração Musical', status: 'Confirmado' },
      { name: 'Luz & Cena', service: 'Painéis de LED & Iluminação', status: 'Confirmado' }
    ]
  }
];

export const INITIAL_ENQUETES: Enquete[] = [
  {
    id: 'enq-1',
    turmaId: 'turma-med-unesp-2026',
    question: 'Qual deve ser a banda principal do Baile de Gala?',
    options: [
      { text: 'Banda Show Eva (Axé / Pop)', votes: 14 },
      { text: 'Banda Santa Maria (Orquestra & Pop internacional)', votes: 22 },
      { text: 'DJ Vintage Culture (Eletrônico / Dance)', votes: 9 }
    ],
    createdBy: 'Comissão de Formatura',
    endDate: '2026-07-15',
    active: true,
    votedStudentIds: ['std-1', 'std-2']
  },
  {
    id: 'enq-2',
    turmaId: 'turma-med-unesp-2026',
    question: 'Escolha da cor dominante nos arranjos florais da Colação de Grau:',
    options: [
      { text: 'Azul Real e Branco', votes: 12 },
      { text: 'Dourado, Marsala e Creme', votes: 28 },
      { text: 'Verde Esmeralda e Off-White', votes: 5 }
    ],
    createdBy: 'WM2 Cerimonial',
    endDate: '2026-05-30',
    active: false,
    votedStudentIds: ['std-1', 'std-2', 'std-3']
  }
];

export const INITIAL_ALBUMS: Album[] = [
  {
    id: 'alb-1',
    turmaId: 'turma-med-unesp-2026',
    name: 'Sessão de Fotos em Estúdio',
    description: 'Sessão oficial com beca, capelo e traje social de gala da turma de Medicina.',
    coverUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=88&w=1600',
    createdAt: '2026-04-10'
  },
  {
    id: 'alb-2',
    turmaId: 'turma-med-unesp-2026',
    name: 'Fotos Externas no Campus',
    description: 'Ensaio descontraído e divertido ao ar livre no parque botânico.',
    coverUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=88&w=1600',
    createdAt: '2026-05-15'
  },
  {
    id: 'alb-3',
    turmaId: 'turma-dir-usp-2026',
    name: 'Pranchas do Vestibular',
    description: 'Sessão de fotos individuais com toga tradicional das Arcadas.',
    coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=88&w=1600',
    createdAt: '2026-06-01'
  }
];

export const INITIAL_FOTOS: Foto[] = [
  {
    id: 'ft-1',
    turmaId: 'turma-med-unesp-2026',
    albumId: 'alb-1',
    eventName: 'Sessão de Fotos em Estúdio',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=88&w=1600',
    caption: 'Primeira sessão oficial de estúdio com capelo e becas oficiais da turma de Medicina.',
    likes: 38,
    comments: [
      { author: 'Ana Beatriz', text: 'Ficou maravilhosa essa foto de grupo!', date: '2026-04-12' },
      { author: 'Carlos Eduardo', text: 'Melhor equipe de fotografia!', date: '2026-04-13' }
    ]
  },
  {
    id: 'ft-2',
    turmaId: 'turma-med-unesp-2026',
    albumId: 'alb-2',
    eventName: 'Fotos Externas no Campus',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=88&w=1600',
    caption: 'Descontração e alegria na sessão externa realizada no parque botânico.',
    likes: 47,
    comments: []
  },
  {
    id: 'ft-3',
    turmaId: 'turma-dir-usp-2026',
    albumId: 'alb-3',
    eventName: 'Pranchas do Vestibular',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=88&w=1600',
    caption: 'Sessão de fotos individuais com toga tradicional das Arcadas.',
    likes: 29,
    comments: []
  }
];

export const INITIAL_MURAL: MuralItem[] = [
  {
    id: 'm-1',
    turmaId: 'turma-med-unesp-2026',
    title: 'Medidas de Beca para a Colação',
    content: 'Atenção formandos! Pedimos que todos compareçam à sala da comissão até o dia 20/07 para tirar as medidas finais de suas becas com o alfaiate da WM2 Produções. Evitem atrasos para garantir o ajuste perfeito.',
    author: 'Equipe WM2 Cerimonial',
    date: '2026-06-25',
    category: 'Aviso Importante'
  },
  {
    id: 'm-2',
    turmaId: 'turma-med-unesp-2026',
    title: 'Prazo Limite para Alteração de Pacotes',
    content: 'O prazo final para upgrade de pacotes e inclusão de mesa adicional para convidados no Baile de Gala será dia 15/08. Após essa data, o buffet fechará a contagem final e não poderemos realizar novas reservas.',
    author: 'Departamento Financeiro WM2',
    date: '2026-06-10',
    category: 'Financeiro'
  },
  {
    id: 'm-3',
    turmaId: 'turma-med-unesp-2026',
    title: 'Confirmação da Banda do Baile de Gala!',
    content: 'É com enorme satisfação que anunciamos que a Banda Santa Maria, vencedora da nossa última enquete de opinião com 48% dos votos, foi contratada oficialmente para animar a nossa noite mágica!',
    author: 'Comissão de Formatura',
    date: '2026-06-01',
    category: 'Geral'
  }
];

export const INITIAL_FORNECEDORES: Fornecedor[] = [
  { id: 'f-1', name: 'Buffet Villa Noah', service: 'Buffet Gastronômico de Gala', phone: '(11) 91122-3344', email: 'contato@villanoah.com.br', status: 'Ativo' },
  { id: 'f-2', name: 'Banda Santa Maria', service: 'Shows e Entretenimento Musical', phone: '(11) 92233-4455', email: 'agenda@bandasantamaria.com.br', status: 'Ativo' },
  { id: 'f-3', name: 'Luz & Cena Iluminação', service: 'Sonorização, Painel de LED e Cenografia', phone: '(11) 93344-5566', email: 'atendimento@luzecena.com.br', status: 'Ativo' },
  { id: 'f-4', name: 'Vip Security Ltda', service: 'Segurança Executiva, Bombeiros e Manobristas', phone: '(11) 94455-6677', email: 'contato@vipsecurity.com.br', status: 'Ativo' },
  { id: 'f-5', name: 'DecorArt Paisagismo', service: 'Arranjos de Flores e Cenografia Verde', phone: '(11) 95566-7788', email: 'projetos@decorart.com.br', status: 'Ativo' }
];

export const INITIAL_PACOTES: Pacote[] = [
  {
    id: 'pkg-med-1',
    turmaId: 'turma-med-unesp-2026',
    name: 'Pacote Master',
    description: 'Baile + Colação + Coquetel + Álbum de Fotos de Formatura',
    price: 12000,
    items: ['Baile de Gala (10 convites)', 'Colação de Grau Oficial', 'Coquetel Exclusivo', 'Álbum Fotográfico Encadernado']
  },
  {
    id: 'pkg-med-2',
    turmaId: 'turma-med-unesp-2026',
    name: 'Pacote Executivo',
    description: 'Baile + Colação de Grau',
    price: 8000,
    items: ['Baile de Gala (5 convites)', 'Colação de Grau Oficial']
  },
  {
    id: 'pkg-med-3',
    turmaId: 'turma-med-unesp-2026',
    name: 'Pacote Básico',
    description: 'Apenas Colação de Grau',
    price: 3500,
    items: ['Colação de Grau Oficial']
  },
  {
    id: 'pkg-dir-1',
    turmaId: 'turma-dir-usp-2026',
    name: 'Pacote Premium',
    description: 'Baile + Colação + Coquetel + Sessão de Fotos',
    price: 8500,
    items: ['Baile de Gala (8 convites)', 'Colação de Grau Oficial', 'Coquetel de Recepção', 'Sessão de Fotos Pré-evento']
  },
  {
    id: 'pkg-dir-2',
    turmaId: 'turma-dir-usp-2026',
    name: 'Pacote Básico',
    description: 'Apenas Colação de Grau',
    price: 3000,
    items: ['Colação de Grau Oficial']
  },
  {
    id: 'pkg-eng-1',
    turmaId: 'turma-eng-mack-2027',
    name: 'Pacote Completo',
    description: 'Baile + Colação + Coquetel (A definir)',
    price: 9500,
    items: ['Baile de Gala (6 convites)', 'Colação de Grau Oficial', 'Coquetel Integrado']
  }
];

export const INITIAL_DEPOIMENTOS: Depoimento[] = [
  {
    id: 'dep-1',
    turmaId: 'turma-med-unesp-2026',
    formandoId: 'std-1',
    authorName: 'Ana Beatriz Silva',
    text: 'Que orgulho ver a nossa caminhada até aqui! Cada ensaio fotográfico, cada reunião da comissão foi pensada com muito carinho para que a nossa formatura seja inesquecível. Obrigada a todos da turma pela confiança!',
    date: '2026-05-12',
    approved: true
  },
  {
    id: 'dep-2',
    turmaId: 'turma-med-unesp-2026',
    formandoId: 'std-2',
    authorName: 'Carlos Eduardo Santos',
    text: 'A parceria com a WM2 está sendo incrível. Os eventos prévios foram sensacionais e o atendimento das parcelas e dúvidas é super rápido no portal. Já estou ansioso pelo baile de gala!',
    date: '2026-06-20',
    approved: true
  },
  {
    id: 'dep-3',
    turmaId: 'turma-dir-usp-2026',
    formandoId: 'std-5',
    authorName: 'Beatriz Almeida Prado',
    text: 'Inesquecível! A colação de grau é um sonho que está se realizando da forma mais linda possível. Valeu cada esforço!',
    date: '2026-06-15',
    approved: true
  }
];

export const INITIAL_REUNIOES: Reuniao[] = [
  {
    id: 'reuniao-1',
    turmaId: 'turma-dir-usp-2026',
    title: 'Apresentação do Projeto de Decoração do Baile',
    description: 'Reunião de alinhamento com a comissão para aprovação do projeto cenográfico e do buffet do baile de gala.',
    date: '2026-07-15',
    time: '19:00',
    link: 'https://meet.google.com/abc-defg-hij',
    status: 'Agendada',
    createdAt: '2026-07-04T12:00:00Z'
  },
  {
    id: 'reuniao-2',
    turmaId: 'turma-med-unesp-2026',
    title: 'Cronograma de Ensaio Fotográfico',
    description: 'Definição do roteiro e horários para as fotos oficiais de estúdio e externas da comissão.',
    date: '2026-07-20',
    time: '14:30',
    link: 'https://meet.google.com/xyz-uvw-rst',
    status: 'Agendada',
    createdAt: '2026-07-04T11:30:00Z'
  }
];

export const INITIAL_TURMA_MESSAGES: TurmaMessage[] = [
  {
    id: 'msg-1',
    turmaId: 'turma-med-unesp-2026',
    authorId: 'std-1',
    authorName: 'Ana Beatriz Silva',
    authorRole: 'comissao',
    content: 'Olá pessoal da LIV! Criamos este canal interativo da turma para tirarmos dúvidas diretas sobre o Baile de Gala, fotos de estúdio, convites extras e prazos. Fiquem à vontade para comentar e perguntar!',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Aviso',
    pinned: true,
    reactions: {
      '👏': ['Carlos Eduardo Santos', 'Mariana Costa Oliveira', 'Ana Beatriz Silva'],
      '❤️': ['Carlos Eduardo Santos', 'Mariana Costa Oliveira']
    },
    status: 'Respondida'
  },
  {
    id: 'msg-2',
    turmaId: 'turma-med-unesp-2026',
    authorId: 'std-2',
    authorName: 'Carlos Eduardo Santos',
    authorRole: 'formando',
    content: 'Boa tarde Comissão! Uma dúvida sobre convidados: crianças menores de 10 anos precisam de convite extra ou têm isenção no buffet?',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Dúvida',
    pinned: false,
    reactions: {
      '👍': ['Mariana Costa Oliveira']
    },
    status: 'Respondida'
  },
  {
    id: 'msg-3',
    turmaId: 'turma-med-unesp-2026',
    authorId: 'std-1',
    authorName: 'Ana Beatriz Silva',
    authorRole: 'comissao',
    content: 'Oi Carlos! Confirmamos com a equipe da WM2 Produções: crianças até 6 anos têm entrada gratuita. De 7 a 11 anos pagam 50% do valor do convite extra na área do formando.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Comissão',
    pinned: false,
    replyTo: {
      id: 'msg-2',
      authorName: 'Carlos Eduardo Santos',
      content: 'crianças menores de 10 anos precisam de convite extra ou têm isenção no buffet?',
      authorRole: 'formando'
    },
    reactions: {
      '🙏': ['Carlos Eduardo Santos'],
      '❤️': ['Carlos Eduardo Santos', 'Mariana Costa Oliveira']
    },
    status: 'Respondida'
  },
  {
    id: 'msg-4',
    turmaId: 'turma-med-unesp-2026',
    authorId: 'std-3',
    authorName: 'Mariana Costa Oliveira',
    authorRole: 'formando',
    content: 'Comissão, quando vai sair o cronograma detalhado dos horários de foto por grupo no dia da colação?',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Evento',
    pinned: false,
    reactions: {
      '💡': ['Carlos Eduardo Santos']
    },
    status: 'Em Análise',
    statusNote: 'A comissão está alinhando a grade de horários com os fotógrafos da WM2.'
  },
  {
    id: 'msg-5',
    turmaId: 'turma-med-unesp-2026',
    authorId: 'std-1',
    authorName: 'Ana Beatriz Silva',
    authorRole: 'comissao',
    content: 'Lembrete a todos: a lista final de convidados para emissão dos QR Codes de acesso deve ser confirmada até 15 dias antes do baile.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'Aviso',
    pinned: false,
    reactions: {
      '👍': ['Carlos Eduardo Santos', 'Mariana Costa Oliveira']
    }
  }
];

// Helper to save and load state in local storage
export function loadState() {
  let initialPortfolioAlbums: any = undefined;
  let initialProdGalleries: any = undefined;

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Seja bem-vindo ao novo portal!',
      body: 'A comissão de formatura e a WM2 Produções dão as boas-vindas a todos os formandos ao novo portal.',
      date: '2026-07-03',
      category: 'Geral' as const,
      targetTurmaId: 'all',
      readBy: []
    },
    {
      id: 'notif-2',
      title: 'Aviso sobre vencimento de parcelas',
      body: 'Lembrete importante: verifique a aba "Financeiro" para conferir os vencimentos dos boletos deste mês.',
      date: '2026-07-02',
      category: 'Boleto' as const,
      targetTurmaId: 'all',
      readBy: []
    }
  ];

  try {
    const serialized = localStorage.getItem('wm2_graduation_state');
    const savedPortAlbums = localStorage.getItem('wm2_portfolio_albums');
    const savedProdGals = localStorage.getItem('wm2_product_galleries');
    
    if (savedPortAlbums) {
      try { initialPortfolioAlbums = JSON.parse(savedPortAlbums); } catch (e) {}
    }
    
    if (savedProdGals) {
      try { initialProdGalleries = JSON.parse(savedProdGals); } catch (e) {}
    }

    const savedThemePref = localStorage.getItem('wm2_admin_theme');
    const defaultTheme: 'light' | 'dark' = (savedThemePref === 'dark' || savedThemePref === 'light') ? savedThemePref : 'light';

    if (serialized === null) {
      return {
        turmas: INITIAL_TURMAS,
        formandos: INITIAL_FORMANDOS,
        parcelas: INITIAL_PARCELAS,
        eventos: INITIAL_EVENTOS,
        enquetes: INITIAL_ENQUETES,
        albums: INITIAL_ALBUMS,
        fotos: INITIAL_FOTOS,
        mural: INITIAL_MURAL,
        fornecedores: INITIAL_FORNECEDORES,
        pacotes: INITIAL_PACOTES,
        depoimentos: INITIAL_DEPOIMENTOS,
        notifications: INITIAL_NOTIFICATIONS,
        reunioes: INITIAL_REUNIOES,
        leads: INITIAL_LEADS,
        pushTokens: [],
        adminTasks: INITIAL_ADMIN_TASKS,
        turmaMessages: INITIAL_TURMA_MESSAGES,
        portfolioAlbums: initialPortfolioAlbums,
        productGalleries: initialProdGalleries,
        visitorTracking: INITIAL_VISITOR_TRACKING,
        gatewayConfig: INITIAL_GATEWAY_CONFIG,
        theme: defaultTheme
      };
    }
    const parsed = JSON.parse(serialized);
    if (parsed.gatewayConfig === undefined) {
      parsed.gatewayConfig = INITIAL_GATEWAY_CONFIG;
    }
    if (parsed.theme === undefined) {
      parsed.theme = defaultTheme;
    } else if (savedThemePref === 'dark' || savedThemePref === 'light') {
      parsed.theme = savedThemePref;
    }
    if (parsed.adminTasks === undefined) {
      parsed.adminTasks = INITIAL_ADMIN_TASKS;
    }
    if (parsed.albums === undefined) {
      parsed.albums = INITIAL_ALBUMS;
    }
    if (parsed.fotos === undefined) {
      parsed.fotos = INITIAL_FOTOS;
    }
    if (parsed.pacotes === undefined) {
      parsed.pacotes = INITIAL_PACOTES;
    }
    if (parsed.depoimentos === undefined) {
      parsed.depoimentos = INITIAL_DEPOIMENTOS;
    }
    if (parsed.notifications === undefined) {
      parsed.notifications = INITIAL_NOTIFICATIONS;
    }
    if (parsed.reunioes === undefined) {
      parsed.reunioes = INITIAL_REUNIOES;
    }
    if (parsed.leads === undefined) {
      parsed.leads = INITIAL_LEADS;
    }
    if (parsed.turmaMessages === undefined) {
      parsed.turmaMessages = INITIAL_TURMA_MESSAGES;
    }
    if (parsed.pushTokens === undefined) {
      parsed.pushTokens = [];
    }
    if (parsed.portfolioAlbums === undefined && initialPortfolioAlbums) {
      parsed.portfolioAlbums = initialPortfolioAlbums;
    }
    if (parsed.productGalleries === undefined && initialProdGalleries) {
      parsed.productGalleries = initialProdGalleries;
    }
    if (parsed.visitorTracking === undefined) {
      parsed.visitorTracking = INITIAL_VISITOR_TRACKING;
    }
    return parsed;
  } catch (err) {
    console.error("Could not load state from LocalStorage", err);
    return {
      turmas: INITIAL_TURMAS,
      formandos: INITIAL_FORMANDOS,
      parcelas: INITIAL_PARCELAS,
      eventos: INITIAL_EVENTOS,
      enquetes: INITIAL_ENQUETES,
      albums: INITIAL_ALBUMS,
      fotos: INITIAL_FOTOS,
      mural: INITIAL_MURAL,
      fornecedores: INITIAL_FORNECEDORES,
      pacotes: INITIAL_PACOTES,
      depoimentos: INITIAL_DEPOIMENTOS,
      notifications: INITIAL_NOTIFICATIONS,
      reunioes: INITIAL_REUNIOES,
      leads: INITIAL_LEADS,
      pushTokens: [],
      adminTasks: INITIAL_ADMIN_TASKS,
      turmaMessages: INITIAL_TURMA_MESSAGES,
      portfolioAlbums: initialPortfolioAlbums,
      productGalleries: initialProdGalleries,
      visitorTracking: INITIAL_VISITOR_TRACKING
    };
  }
}

export function saveState(state: any) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('wm2_graduation_state', serialized);
    if (state?.theme === 'dark' || state?.theme === 'light') {
      localStorage.setItem('wm2_admin_theme', state.theme);
    }
  } catch (err) {
    console.warn("LocalStorage quota exceeded or unavailable. Saving to IndexedDB backup:", err);
  }

  // Always save to IndexedDB as reliable asynchronous backup
  if (typeof window !== 'undefined') {
    import('../lib/indexedDbStorage').then(({ saveStateToIndexedDb }) => {
      saveStateToIndexedDb(state).catch(() => {});
    }).catch(() => {});
  }
}
