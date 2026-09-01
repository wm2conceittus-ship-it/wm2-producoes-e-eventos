import React, { useState, useMemo } from 'react';
import {
  VisitorTracking,
  SiteVisitor
} from '../types';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileCode,
  RefreshCw,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  ChevronRight,
  Zap,
  Radio,
  Sliders,
  X,
  Copy,
  Check,
  Send,
  AlertCircle,
  Award
} from 'lucide-react';

interface AccessLogsManagerProps {
  visitorTracking?: VisitorTracking;
  onSimulateEvent?: (newEvent: SiteVisitor) => void;
}

export const AccessLogsManager: React.FC<AccessLogsManagerProps> = ({
  visitorTracking,
  onSimulateEvent
}) => {
  // Local state for interactive logs (enables dynamic additions via simulation)
  const initialVisitors = visitorTracking?.recentVisitors || [];
  const [logsList, setLogsList] = useState<SiteVisitor[]>(initialVisitors);
  
  // Active Filter Tabs
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'failed' | 'commission' | 'portal' | 'admin'
  >('all');

  // Secondary Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'blocked'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop' | 'tablet'>('all');

  // Modal & Toast States
  const [selectedAuditLog, setSelectedAuditLog] = useState<SiteVisitor | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if external visitorTracking changes
  React.useEffect(() => {
    if (visitorTracking?.recentVisitors) {
      setLogsList(visitorTracking.recentVisitors);
    }
  }, [visitorTracking]);

  // Show temporary toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // KPIs & Counts Calculation
  const stats = useMemo(() => {
    const total = logsList.length;
    const failedLogins = logsList.filter(
      (l) => l.eventType === 'login_failed' || l.authStatus === 'failed' || l.authStatus === 'blocked'
    ).length;
    const commissionAccess = logsList.filter(
      (l) => l.eventType === 'commission_access' || l.userRole === 'comissao'
    ).length;
    const studentPortalAccess = logsList.filter(
      (l) => l.eventType === 'portal_access' || (l.userRole === 'formando' && l.authStatus === 'success')
    ).length;
    const adminAccess = logsList.filter(
      (l) => l.eventType === 'admin_access' || l.userRole === 'admin'
    ).length;
    const highRisk = logsList.filter((l) => l.securityRisk === 'high').length;
    const safeRatio = total > 0 ? Math.round(((total - failedLogins) / total) * 100) : 100;

    return {
      total,
      failedLogins,
      commissionAccess,
      studentPortalAccess,
      adminAccess,
      highRisk,
      safeRatio
    };
  }, [logsList]);

  // Filtered List based on search and category filters
  const filteredLogs = useMemo(() => {
    return logsList.filter((log) => {
      // 1. Category Filter
      if (categoryFilter === 'failed') {
        const isFail =
          log.eventType === 'login_failed' ||
          log.authStatus === 'failed' ||
          log.authStatus === 'blocked';
        if (!isFail) return false;
      } else if (categoryFilter === 'commission') {
        const isComm =
          log.eventType === 'commission_access' ||
          log.userRole === 'comissao' ||
          (log.commissionRole && log.commissionRole.length > 0);
        if (!isComm) return false;
      } else if (categoryFilter === 'portal') {
        const isPortal =
          log.eventType === 'portal_access' ||
          log.path?.includes('portal') ||
          log.userRole === 'formando';
        if (!isPortal) return false;
      } else if (categoryFilter === 'admin') {
        const isAdmin =
          log.eventType === 'admin_access' ||
          log.path?.includes('admin') ||
          log.userRole === 'admin';
        if (!isAdmin) return false;
      }

      // 2. Risk Filter
      if (riskFilter !== 'all' && log.securityRisk !== riskFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'success' && log.authStatus !== 'success') return false;
        if (statusFilter === 'failed' && log.authStatus !== 'failed') return false;
        if (statusFilter === 'blocked' && log.authStatus !== 'blocked') return false;
      }

      // 4. Device Filter
      if (deviceFilter !== 'all' && log.device !== deviceFilter) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = log.userName?.toLowerCase().includes(q);
        const matchEmail = log.userEmail?.toLowerCase().includes(q);
        const matchCity = log.city?.toLowerCase().includes(q);
        const matchIp = log.ip?.toLowerCase().includes(q);
        const matchTurma = log.turmaName?.toLowerCase().includes(q);
        const matchAction = log.attemptedAction?.toLowerCase().includes(q);
        const matchReason = log.failureReason?.toLowerCase().includes(q);
        const matchPath = log.path?.toLowerCase().includes(q);
        const matchComm = log.commissionRole?.toLowerCase().includes(q);

        if (
          !matchName &&
          !matchEmail &&
          !matchCity &&
          !matchIp &&
          !matchTurma &&
          !matchAction &&
          !matchReason &&
          !matchPath &&
          !matchComm
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logsList, categoryFilter, riskFilter, statusFilter, deviceFilter, searchQuery]);

  // Simulation: Add Failed Login Attempt
  const handleSimulateFailedLogin = () => {
    const fakeIps = ['189.44.210.89', '177.108.92.15', '201.82.90.4', '186.250.33.11'];
    const fakeCities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Botucatu', state: 'SP' },
      { city: 'Ribeirão Preto', state: 'SP' },
      { city: 'Campinas', state: 'SP' }
    ];
    const chosenLoc = fakeCities[Math.floor(Math.random() * fakeCities.length)];
    const chosenIp = fakeIps[Math.floor(Math.random() * fakeIps.length)];
    const randomSec = Math.floor(Math.random() * 900) + 100;

    const reasons = [
      'Senha incorreta digitada 3 vezes consecutivas',
      'Tentativa de login com CPF não localizado na turma',
      'Token de sessão expirado ou forjado',
      'Bloqueio preventivo: limite de requisições excedido'
    ];
    const chosenReason = reasons[Math.floor(Math.random() * reasons.length)];

    const newLog: SiteVisitor = {
      id: `vis-alert-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'mobile',
      browser: 'Chrome Mobile 128',
      os: 'Android 14',
      screenResolution: '390x844',
      referrer: 'https://app.wm2.com.br/login',
      path: '/portal-formando/login',
      source: 'Tentativa Direta',
      city: chosenLoc.city,
      state: chosenLoc.state,
      country: 'Brasil',
      ip: chosenIp,
      eventType: 'login_failed',
      authStatus: 'failed',
      userEmail: `usuario.alerta${randomSec}@email.com`,
      userName: `Tentativa Malsucedida (CPF: ${randomSec}.***.***-${Math.floor(Math.random() * 90) + 10})`,
      userRole: 'formando',
      turmaName: 'Medicina UNESP 2026',
      attemptedAction: 'Tentativa de autenticação com credencial inválida',
      failureReason: chosenReason,
      securityRisk: 'high',
      sessionDuration: '0 min'
    };

    setLogsList([newLog, ...logsList]);
    if (onSimulateEvent) onSimulateEvent(newLog);
    triggerToast('🚨 Tentativa de login malsucedida simulada e registrada com sucesso!');
  };

  // Simulation: Add Commission Member Access
  const handleSimulateCommissionAccess = () => {
    const commissionMembers = [
      {
        name: 'Lucas Mendes',
        email: 'lucas.mendes.comissao@unesp.br',
        role: 'Presidente da Comissão',
        turma: 'Medicina UNESP 2026',
        action: 'Acesso à Área da Comissão: Consulta ao DRE e aprovação da grade de shows',
        city: 'Botucatu',
        state: 'SP',
        ip: '189.44.112.98'
      },
      {
        name: 'Mariana Costa',
        email: 'mariana.costa@direito.usp.br',
        role: 'Tesoureira da Comissão',
        turma: 'Direito USP 2025',
        action: 'Acesso ao Painel Financeiro: Baixa de parcelas em aberto e conciliação Asaas',
        city: 'São Paulo',
        state: 'SP',
        ip: '201.82.15.60'
      },
      {
        name: 'Rodrigo Alencar',
        email: 'rodrigo.alencar@unicamp.br',
        role: 'Secretário da Comissão',
        turma: 'Engenharia Mecânica UNICAMP 2027',
        action: 'Acesso às Enquetes: Publicação de votação de fornecedor de bartenders',
        city: 'Campinas',
        state: 'SP',
        ip: '187.55.90.14'
      },
      {
        name: 'Beatriz Nogueira',
        email: 'beatriz.nogueira@usp.br',
        role: 'Membro da Comissão',
        turma: 'Administração ESALQ 2026',
        action: 'Acesso à Galeria de Contratos: Visualização do briefing de cenografia',
        city: 'Piracicaba',
        state: 'SP',
        ip: '177.89.210.4'
      }
    ];

    const chosen = commissionMembers[Math.floor(Math.random() * commissionMembers.length)];

    const newLog: SiteVisitor = {
      id: `vis-comm-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      device: 'desktop',
      browser: 'Chrome 128',
      os: 'macOS Sonoma',
      screenResolution: '1920x1080',
      referrer: 'https://comissao.wm2.com.br',
      path: '/comissao',
      source: 'Acesso Direto',
      city: chosen.city,
      state: chosen.state,
      country: 'Brasil',
      ip: chosen.ip,
      eventType: 'commission_access',
      authStatus: 'success',
      userEmail: chosen.email,
      userName: chosen.name,
      userRole: 'comissao',
      commissionRole: chosen.role,
      turmaName: chosen.turma,
      attemptedAction: chosen.action,
      securityRisk: 'low',
      sessionDuration: '32 min'
    };

    setLogsList([newLog, ...logsList]);
    if (onSimulateEvent) onSimulateEvent(newLog);
    triggerToast(`👑 Acesso do membro da comissão (${chosen.name} - ${chosen.role}) registrado!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Data/Hora',
      'Tipo de Evento',
      'Status Auth',
      'Usuario',
      'Email',
      'Papel',
      'Cargo Comissao',
      'Turma',
      'Acao / Tentativa',
      'Motivo Falha',
      'Risco',
      'IP',
      'Cidade',
      'UF',
      'Dispositivo',
      'Navegador'
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.eventType || 'page_view',
      l.authStatus || 'info',
      `"${l.userName || 'Visitante'}"`,
      l.userEmail || '-',
      l.userRole || 'visitante',
      `"${l.commissionRole || '-'}"`,
      `"${l.turmaName || '-'}"`,
      `"${(l.attemptedAction || l.path || '').replace(/"/g, '""')}"`,
      `"${(l.failureReason || '').replace(/"/g, '""')}"`,
      l.securityRisk || 'low',
      l.ip || '-',
      `"${l.city || '-'}"`,
      l.state || '-',
      l.device,
      `"${l.browser || '-'}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `relatorio_logs_acesso_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
    triggerToast('📥 Relatório CSV de logs exportado com sucesso!');
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `auditoria_seguranca_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('📄 Arquivo JSON de auditoria exportado com sucesso!');
  };

  // Format Relative Time
  const formatTimeRelative = (isoString?: string) => {
    if (!isoString) return 'Agora';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Há ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Há ${diffDays} d`;
    } catch {
      return 'Recentemente';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#ffe29a]" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950 p-6 md:p-8 rounded-3xl border border-neutral-700/60 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#aa904f]/30 to-amber-600/10 border border-[#aa904f]/50 text-[#ffe29a] flex items-center justify-center shadow-lg shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white font-sans">
                Log Detalhado de Acessos & Auditoria
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Monitoramento em Tempo Real
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl font-medium">
              Auditoria de segurança para rastreamento de tentativas de login malsucedidas, sessões ativas de membros da comissão e acessos de formandos e administradores via <code className="text-[#ffe29a] font-mono text-[11px]">visitorTracking</code>.
            </p>
          </div>
        </div>

        {/* Action Buttons: Simulation & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateFailedLogin}
            className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Simular tentativa de login inválida com senha incorreta ou CPF divergente"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Simular Falha de Login</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateCommissionAccess}
            className="px-3.5 py-2 bg-[#aa904f]/25 hover:bg-[#aa904f]/40 text-[#ffe29a] border border-[#aa904f]/50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Simular acesso recente de membro da comissão (Presidente, Tesoureiro, etc.)"
          >
            <Award className="w-4 h-4 text-[#ffe29a]" />
            <span>Simular Acesso Comissão</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Exportar registros filtrados para formato CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Exportar JSON para auditoria externa"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Events */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-bold">
            <span>Total de Eventos</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-sans">
              {stats.total}
            </span>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
              Registros no banco
            </p>
          </div>
        </div>

        {/* Card 2: Failed Login Attempts (ALERT) */}
        <div
          onClick={() => setCategoryFilter('failed')}
          className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
            categoryFilter === 'failed'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-bold">
            <span>Falhas de Login</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-sans">
                {stats.failedLogins}
              </span>
              {stats.highRisk > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {stats.highRisk} crítico
                </span>
              )}
            </div>
            <p className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5 font-medium">
              Tentativas bloqueadas/erro
            </p>
          </div>
        </div>

        {/* Card 3: Commission Member Access */}
        <div
          onClick={() => setCategoryFilter('commission')}
          className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
            categoryFilter === 'commission'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-[#aa904f] ring-2 ring-[#aa904f]/30'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-[#aa904f]'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold">
            <span>Acessos da Comissão</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#aa904f] font-sans">
              {stats.commissionAccess}
            </span>
            <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5 font-medium">
              Presidente, Tesouraria & Staff
            </p>
          </div>
        </div>

        {/* Card 4: Formandos & Portal Access */}
        <div
          onClick={() => setCategoryFilter('portal')}
          className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
            categoryFilter === 'portal'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-bold">
            <span>Portal do Formando</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-sans">
              {stats.studentPortalAccess}
            </span>
            <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-0.5 font-medium">
              Adesões, Boletos & Mural
            </p>
          </div>
        </div>

        {/* Card 5: Safe Connection Ratio */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span>Índice de Segurança</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                {stats.safeRatio}%
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                estável
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
              Sem incidentes críticos
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs & Filter Navigation */}
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        {/* Main Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Todos os Eventos ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('failed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'failed'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>⚠️ Falhas de Login ({stats.failedLogins})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('commission')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'commission'
                ? 'bg-[#aa904f] text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>👑 Membros da Comissão ({stats.commissionAccess})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('portal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'portal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>🎓 Portal do Formando ({stats.studentPortalAccess})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>🛡️ Acessos Admin ({stats.adminAccess})</span>
          </button>
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, e-mail, IP, cidade, ação ou motivo da falha..."
              className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#aa904f]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white font-medium focus:outline-hidden"
            >
              <option value="all">Status: Todos</option>
              <option value="success">✅ Sucesso</option>
              <option value="failed">❌ Falha / Erro</option>
              <option value="blocked">⛔ Bloqueado</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="md:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white font-medium focus:outline-hidden"
            >
              <option value="all">Risco: Todos</option>
              <option value="low">🟢 Baixo</option>
              <option value="medium">🟡 Médio</option>
              <option value="high">🔴 Alto / Crítico</option>
            </select>
          </div>

          {/* Device Filter */}
          <div className="md:col-span-2">
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white font-medium focus:outline-hidden"
            >
              <option value="all">Aparelho: Todos</option>
              <option value="mobile">📱 Celular (Mobile)</option>
              <option value="desktop">💻 Computador (Desktop)</option>
              <option value="tablet">📟 Tablet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Access Logs Table / Cards */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white font-sans flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#aa904f]" /> Registros de Acesso Filtrados
            </h3>
            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredLogs.length} eventos
            </span>
          </div>

          {filteredLogs.length !== logsList.length && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setSearchQuery('');
                setRiskFilter('all');
                setStatusFilter('all');
                setDeviceFilter('all');
              }}
              className="text-xs text-[#aa904f] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Limpar Filtros
            </button>
          )}
        </div>

        {/* Events List */}
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 space-y-2">
            <ShieldAlert className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
              Nenhum evento de acesso encontrado para os filtros selecionados.
            </p>
            <p className="text-xs text-neutral-400">
              Tente redefinir a busca ou selecione outra categoria acima.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {filteredLogs.map((log) => {
              const isFailed =
                log.eventType === 'login_failed' ||
                log.authStatus === 'failed' ||
                log.authStatus === 'blocked';
              const isCommission =
                log.eventType === 'commission_access' ||
                log.userRole === 'comissao' ||
                (log.commissionRole && log.commissionRole.length > 0);
              const isAdmin =
                log.eventType === 'admin_access' || log.userRole === 'admin';

              return (
                <div
                  key={log.id}
                  className={`p-4 md:p-5 transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isFailed
                      ? 'bg-rose-50/30 dark:bg-rose-950/10'
                      : isCommission
                      ? 'bg-amber-50/20 dark:bg-amber-950/5'
                      : ''
                  }`}
                >
                  {/* Left Column: Status Badge, User Info & Action Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Status Icon Indicator */}
                    <div className="shrink-0 mt-0.5">
                      {isFailed ? (
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                            log.authStatus === 'blocked'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      ) : isCommission ? (
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#aa904f] dark:bg-amber-900/40 dark:text-[#ffe29a] border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shadow-xs">
                          <Award className="w-5 h-5" />
                        </div>
                      ) : isAdmin ? (
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shadow-xs">
                          <KeyRound className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Name, Badges and Role */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs md:text-sm font-extrabold text-neutral-900 dark:text-white truncate">
                          {log.userName || 'Visitante Anônimo'}
                        </span>

                        {/* Role / Commission Pill */}
                        {isCommission && (
                          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#aa904f]" />
                            {log.commissionRole || 'Membro da Comissão'}
                          </span>
                        )}

                        {isFailed && (
                          <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-rose-300 dark:border-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {log.authStatus === 'blocked' ? 'Bloqueio Preventivo' : 'Falha de Autenticação'}
                          </span>
                        )}

                        {isAdmin && (
                          <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-purple-300 dark:border-purple-700">
                            Administrador
                          </span>
                        )}

                        {log.userRole === 'formando' && !isCommission && !isFailed && (
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-300 dark:border-blue-700">
                            Formando
                          </span>
                        )}

                        {/* Turma Tag */}
                        {log.turmaName && (
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                            • {log.turmaName}
                          </span>
                        )}
                      </div>

                      {/* Attempted Action or Failure Reason */}
                      <div>
                        {log.failureReason ? (
                          <div className="bg-rose-100/70 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-xs font-semibold flex items-start gap-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                            <span>
                              <strong>Motivo:</strong> {log.failureReason}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                            {log.attemptedAction || `Navegou em ${log.path}`}
                          </p>
                        )}
                      </div>

                      {/* Technical Meta: Email, IP, City, UF */}
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap pt-0.5">
                        {log.userEmail && (
                          <span className="font-mono">{log.userEmail}</span>
                        )}
                        {log.ip && (
                          <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-neutral-600 dark:text-neutral-300">
                            IP: {log.ip}
                          </span>
                        )}
                        {(log.city || log.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#aa904f]" />
                            {log.city || 'Local indefinido'}
                            {log.state ? `, ${log.state}` : ''}
                          </span>
                        )}
                        {log.sessionDuration && (
                          <span className="text-neutral-400">
                            Duração: {log.sessionDuration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Device, Timestamp & Audit Button */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800">
                    {/* Time & Relative Timestamp */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white justify-end">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{formatTimeRelative(log.timestamp)}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • {log.date}
                      </span>
                    </div>

                    {/* Device & Security Risk Badge */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                        {log.device === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5" />
                        ) : log.device === 'tablet' ? (
                          <Tablet className="w-3.5 h-3.5" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{log.browser || log.device}</span>
                      </div>

                      {/* Security Risk Badge */}
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          log.securityRisk === 'high'
                            ? 'bg-rose-600 text-white'
                            : log.securityRisk === 'medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        Risco {log.securityRisk === 'high' ? 'Alto' : log.securityRisk === 'medium' ? 'Médio' : 'Baixo'}
                      </span>

                      {/* Inspect Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedAuditLog(log)}
                        className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#aa904f] hover:text-white dark:hover:bg-[#aa904f] text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        title="Ver auditoria detalhada e cabeçalhos"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Auditar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Detailed Security & Event Audit Inspection */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#aa904f]/20 border border-[#aa904f]/40 flex items-center justify-center text-[#ffe29a]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-sans text-white">
                    Inspeção de Auditoria de Acesso
                  </h3>
                  <p className="text-xs text-neutral-300">
                    ID do Registro: <code className="text-[#ffe29a]">{selectedAuditLog.id}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="text-neutral-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-neutral-800 dark:text-neutral-200 text-left text-xs">
              {/* Event Summary Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  selectedAuditLog.authStatus === 'failed' || selectedAuditLog.authStatus === 'blocked'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {selectedAuditLog.authStatus === 'failed' || selectedAuditLog.authStatus === 'blocked' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  <span>
                    Status: {selectedAuditLog.authStatus === 'failed' ? 'Falha de Acesso / Erro' : selectedAuditLog.authStatus === 'blocked' ? 'Bloqueio Preventivo' : 'Autenticação / Acesso Autorizado'}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium">
                  {selectedAuditLog.failureReason || selectedAuditLog.attemptedAction}
                </p>
              </div>

              {/* Grid of Key Properties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Usuário / Identidade</span>
                  <span className="font-extrabold text-neutral-900 dark:text-white mt-0.5 block">
                    {selectedAuditLog.userName || 'Anônimo'}
                  </span>
                  <span className="text-neutral-500 font-mono text-[10px]">{selectedAuditLog.userEmail || 'Sem e-mail'}</span>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Papel / Turma</span>
                  <span className="font-extrabold text-[#aa904f] mt-0.5 block">
                    {selectedAuditLog.commissionRole || selectedAuditLog.userRole?.toUpperCase() || 'VISITANTE'}
                  </span>
                  <span className="text-neutral-500 text-[10px]">{selectedAuditLog.turmaName || 'Geral'}</span>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Endereço IP & Local</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white mt-0.5 block">
                    {selectedAuditLog.ip || '127.0.0.1'}
                  </span>
                  <span className="text-neutral-500 text-[10px]">{selectedAuditLog.city} - {selectedAuditLog.state}, {selectedAuditLog.country}</span>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Ambiente & Dispositivo</span>
                  <span className="font-bold text-neutral-900 dark:text-white mt-0.5 block capitalize">
                    {selectedAuditLog.device} ({selectedAuditLog.os || 'Desconhecido'})
                  </span>
                  <span className="text-neutral-500 text-[10px]">{selectedAuditLog.browser} • {selectedAuditLog.screenResolution || 'Auto'}</span>
                </div>
              </div>

              {/* Technical Code Payload */}
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase">
                    Payload Técnico JSON
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedAuditLog, null, 2));
                      triggerToast('📋 JSON do evento copiado para a área de transferência!');
                    }}
                    className="text-xs text-[#aa904f] hover:underline font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copiar JSON
                  </button>
                </div>
                <pre className="p-3 bg-neutral-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-neutral-800 max-h-48">
                  {JSON.stringify(selectedAuditLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold hover:bg-neutral-300 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
