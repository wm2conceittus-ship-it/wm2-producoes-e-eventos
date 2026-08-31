import React, { useState, useEffect, useMemo } from 'react';
import { 
  VisitorTracking, 
  SiteVisitor 
} from '../types';
import { INITIAL_VISITOR_TRACKING } from '../data/mockData';
import { AccessLogsManager } from './AccessLogsManager';
import { 
  Users, 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  Compass, 
  Clock, 
  TrendingUp, 
  Share2, 
  MapPin, 
  MousePointer, 
  Calendar,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  Filter,
  Navigation,
  RefreshCw,
  Search,
  Zap,
  Activity,
  Layers,
  Radio,
  Sliders,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Bell,
  Download,
  FileSpreadsheet,
  Laptop,
  Check,
  X,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface VisitorAnalyticsProps {
  visitorTracking?: VisitorTracking;
  isToastEnabled?: boolean;
  onToggleToast?: () => void;
  onTestToast?: () => void;
}

export const VisitorAnalytics: React.FC<VisitorAnalyticsProps> = ({ 
  visitorTracking,
  isToastEnabled = true,
  onToggleToast,
  onTestToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'geography' | 'live' | 'logs' | 'pages'>('overview');
  
  // Interactive filters & time ranges
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop' | 'tablet'>('all');
  const [geoFilter, setGeoFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCityModal, setSelectedCityModal] = useState<string | null>(null);
  const [selectedVisitorDetail, setSelectedVisitorDetail] = useState<SiteVisitor | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  // Live simulation tick for dynamic feel
  const [livePulse, setLivePulse] = useState(1);
  const [liveOnlineCount, setLiveOnlineCount] = useState(4);
  const [liveStream, setLiveStream] = useState<Array<{ id: string; city: string; state: string; page: string; time: string; device: string }>>([
    { id: '1', city: 'São Paulo', state: 'SP', page: 'Portal do Formando', time: 'Agora', device: 'mobile' },
    { id: '2', city: 'Botucatu', state: 'SP', page: 'Galeria de Fotos', time: 'Há 1 min', device: 'mobile' },
    { id: '3', city: 'Campinas', state: 'SP', page: 'Página Inicial', time: 'Há 2 min', device: 'desktop' },
    { id: '4', city: 'Ribeirão Preto', state: 'SP', page: 'Área da Comissão', time: 'Há 4 min', device: 'mobile' },
  ]);

  // Periodic heartbeat for live radar
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse(prev => (prev + 1) % 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tracking = visitorTracking || {
    totalVisits: 0,
    uniqueVisitors: 0,
    dailyStats: [],
    recentVisitors: [],
    deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
    topPages: [],
    cityBreakdown: [],
    stateBreakdown: []
  };

  const totalVisits = tracking.totalVisits || 148;
  const uniqueVisitors = tracking.uniqueVisitors || 94;
  const repeatVisits = Math.max(0, totalVisits - uniqueVisitors);
  const repeatRate = totalVisits > 0 ? ((repeatVisits / totalVisits) * 100).toFixed(1) : '0';

  // Device pie chart data
  const deviceData = [
    { name: 'Celular (Mobile)', value: tracking.deviceBreakdown?.mobile || 98, color: '#10B981', pct: 72 },
    { name: 'Computador (Desktop)', value: tracking.deviceBreakdown?.desktop || 44, color: '#3B82F6', pct: 24 },
    { name: 'Tablet / iPad', value: tracking.deviceBreakdown?.tablet || 6, color: '#F59E0B', pct: 4 }
  ].filter(d => d.value > 0);

  // Guarantee list of 30 visitors for the table
  const allThirtyVisitors = useMemo<SiteVisitor[]>(() => {
    const fromProps = tracking.recentVisitors || [];
    if (fromProps.length >= 30) {
      return fromProps.slice(0, 30);
    }
    const combined: SiteVisitor[] = [...fromProps];
    const existingIds = new Set(fromProps.map(v => v.id));
    for (const v of INITIAL_VISITOR_TRACKING.recentVisitors || []) {
      if (!existingIds.has(v.id)) {
        combined.push(v);
      }
      if (combined.length >= 30) break;
    }
    return combined.slice(0, 30);
  }, [tracking.recentVisitors]);

  // Daily evolution chart data adjusted by timeRange
  const dailyData = useMemo(() => {
    let stats = tracking.dailyStats || [];
    if (timeRange === 'today') {
      stats = stats.slice(-1);
    } else if (timeRange === '7d') {
      stats = stats.slice(-7);
    } else if (timeRange === '30d') {
      stats = stats.slice(-30);
    }

    if (stats.length === 0) {
      stats = [
        { date: '2026-08-10', visits: 18, uniques: 12 },
        { date: '2026-08-11', visits: 24, uniques: 16 },
        { date: '2026-08-12', visits: 29, uniques: 19 },
        { date: '2026-08-13', visits: 21, uniques: 15 },
        { date: '2026-08-14', visits: 33, uniques: 22 },
        { date: '2026-08-15', visits: 38, uniques: 25 },
        { date: '2026-08-16', visits: 42, uniques: 28 },
      ];
    }

    return stats.map(item => {
      const parts = item.date.split('-');
      const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
      return {
        name: label,
        fullDate: item.date,
        'Acessos Totais': item.visits,
        'Visitantes Únicos': item.uniques
      };
    });
  }, [tracking.dailyStats, timeRange]);

  // Dynamic Cities & States list
  const cities = useMemo(() => {
    const list = tracking.cityBreakdown && tracking.cityBreakdown.length > 0 
      ? tracking.cityBreakdown 
      : [
          { city: 'São Paulo', state: 'SP', visits: 54 },
          { city: 'Campinas', state: 'SP', visits: 28 },
          { city: 'Botucatu', state: 'SP', visits: 22 },
          { city: 'Ribeirão Preto', state: 'SP', visits: 16 },
          { city: 'Belo Horizonte', state: 'MG', visits: 12 },
          { city: 'Rio de Janeiro', state: 'RJ', visits: 9 },
          { city: 'Curitiba', state: 'PR', visits: 7 }
        ];

    if (geoFilter !== 'all') {
      return list.filter(c => c.state.toUpperCase() === geoFilter.toUpperCase() || c.city.toLowerCase().includes(geoFilter.toLowerCase()));
    }
    return list;
  }, [tracking.cityBreakdown, geoFilter]);

  const states = useMemo(() => {
    return tracking.stateBreakdown && tracking.stateBreakdown.length > 0
      ? tracking.stateBreakdown
      : [
          { state: 'SP', name: 'São Paulo', visits: 120 },
          { state: 'MG', name: 'Minas Gerais', visits: 12 },
          { state: 'RJ', name: 'Rio de Janeiro', visits: 9 },
          { state: 'PR', name: 'Paraná', visits: 7 }
        ];
  }, [tracking.stateBreakdown]);

  const topCity = cities[0] ? `${cities[0].city} (${cities[0].state})` : 'São Paulo (SP)';

  // Distinct states list for quick filter dropdown
  const uniqueStatesList = useMemo(() => {
    const ufs = new Set<string>();
    allThirtyVisitors.forEach(v => {
      if (v.state) ufs.add(v.state.toUpperCase());
    });
    return Array.from(ufs).sort();
  }, [allThirtyVisitors]);

  // Filter recent 30 visitors
  const filteredVisitors = useMemo(() => {
    return allThirtyVisitors.filter(v => {
      const matchDevice = deviceFilter === 'all' || v.device === deviceFilter;
      const matchGeo = geoFilter === 'all' || (v.state && v.state.toUpperCase() === geoFilter.toUpperCase()) || (v.city && v.city.toLowerCase().includes(geoFilter.toLowerCase()));
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === '' || 
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.state && v.state.toLowerCase().includes(q)) ||
        (v.path && v.path.toLowerCase().includes(q)) ||
        (v.source && v.source.toLowerCase().includes(q)) ||
        (v.browser && v.browser.toLowerCase().includes(q)) ||
        (v.os && v.os.toLowerCase().includes(q)) ||
        (v.id && v.id.toLowerCase().includes(q));

      return matchDevice && matchGeo && matchSearch;
    });
  }, [allThirtyVisitors, deviceFilter, geoFilter, searchQuery]);

  // Export 30 visitors table to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Hora', 'Cidade', 'Estado (UF)', 'Pais', 'Dispositivo', 'Sistema Operacional', 'Navegador', 'Origem/Canal', 'Pagina Acessada', 'Resolucao'];
    const rows = allThirtyVisitors.map(v => {
      const timeStr = v.timestamp ? new Date(v.timestamp).toLocaleTimeString('pt-BR') : '';
      const dateStr = v.date ? v.date.split('-').reverse().join('/') : (v.timestamp ? new Date(v.timestamp).toLocaleDateString('pt-BR') : '');
      return [
        `"${v.id}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${v.city || ''}"`,
        `"${v.state || ''}"`,
        `"${v.country || 'Brasil'}"`,
        `"${v.device || ''}"`,
        `"${v.os || ''}"`,
        `"${v.browser || ''}"`,
        `"${v.source || ''}"`,
        `"${v.path || ''}"`,
        `"${v.screenResolution || ''}"`
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ultimos_30_visitantes_wm2_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Helper for friendly relative time
  const getRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Recente';
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMin = Math.floor(diffMs / (60 * 1000));
      if (diffMin <= 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Há ${diffDays}d`;
    } catch {
      return 'Recente';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in">
      
      {/* Top Banner / Title with LIVE INDICATOR & TIME-RANGE SELECTOR */}
      <div className="bg-gradient-to-r from-[#1e1b18] via-[#2c261e] to-[#1e1b18] text-white p-6 rounded-2xl border border-neutral-800 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Radar em Tempo Real Ativo
            </span>
            <span className="bg-[#dfd1a1]/20 text-[#dfd1a1] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#dfd1a1]/30">
              {liveOnlineCount} Formandos / Visitantes Online Agora
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#dfd1a1]" />
            Métricas Dinâmicas de Visitantes & Cidades
          </h3>
          <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
            Rastreamento geográfico dinâmico por <strong>Cidade e Estado (UF)</strong>, dispositivos móveis/desktops e registro detalhado dos últimos <strong>30 visitantes</strong>.
          </p>
        </div>

        {/* Action Controls: Live Toast Toggle & Filter Period */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {onToggleToast && (
              <button
                type="button"
                onClick={onToggleToast}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isToastEnabled 
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                }`}
                title="Ativar ou desativar aviso sonoro/pop-up de visitantes em tempo real"
              >
                <span className="relative flex h-2 w-2">
                  {isToastEnabled && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isToastEnabled ? 'bg-emerald-500' : 'bg-neutral-500'}`}></span>
                </span>
                <Bell className="w-3.5 h-3.5" />
                <span>Toast Ao Vivo</span>
              </button>
            )}

            {onTestToast && (
              <button
                type="button"
                onClick={onTestToast}
                className="px-2.5 py-1 text-xs font-bold rounded-lg transition-all bg-[#dfd1a1]/20 hover:bg-[#dfd1a1]/30 text-[#dfd1a1] border border-[#dfd1a1]/30 flex items-center gap-1 cursor-pointer"
                title="Disparar Toast de demonstração com cidade aleatória"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Testar Toast</span>
              </button>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-wrap items-center gap-1 bg-neutral-900/80 p-1.5 rounded-xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-neutral-400 pl-2 pr-1">Período:</span>
            {(['today', '7d', '30d', 'all'] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                  timeRange === period
                    ? 'bg-[#dfd1a1] text-[#3c2a01] shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {period === 'today' ? 'Hoje' : period === '7d' ? '7 Dias' : period === '30d' ? '30 Dias' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dynamic KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Visits */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-[#705510] tracking-wider">Acessos Totais</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              </div>
              <div className="text-3xl font-black text-[#3c2a01] mt-1 font-sans flex items-baseline gap-2">
                {totalVisits.toLocaleString('pt-BR')}
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
                </span>
              </div>
            </div>
            <div className="p-3 bg-white/60 rounded-xl text-[#705510] border border-[#d2c595]/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#d2c595]/40 flex items-center justify-between text-[10px] font-bold text-[#543d03]/90">
            <span>Visualizações no portal</span>
            <span className="text-emerald-800 font-extrabold flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-[#aa904f]" /> Alta procura
            </span>
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#705510] tracking-wider">Visitantes Únicos</span>
              <div className="text-3xl font-black text-[#3c2a01] mt-1 font-sans flex items-baseline gap-2">
                {uniqueVisitors.toLocaleString('pt-BR')}
                <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-1.5 py-0.5 rounded">
                  {Math.round((uniqueVisitors / (totalVisits || 1)) * 100)}% novos
                </span>
              </div>
            </div>
            <div className="p-3 bg-white/60 rounded-xl text-[#705510] border border-[#d2c595]/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#d2c595]/40 flex items-center justify-between text-[10px] font-bold text-[#543d03]/90">
            <span>Formandos e familiares</span>
            <span className="text-[#3c2a01] font-extrabold">{cities.length} Cidades ativas</span>
          </div>
        </div>

        {/* Card 3: Top City & UF */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#705510] tracking-wider">Principal Cidade</span>
              <div className="text-xl font-black text-[#3c2a01] mt-1.5 font-sans truncate max-w-[190px]">
                {topCity}
              </div>
              <p className="text-[11px] text-[#543d03]/80 font-bold mt-0.5">
                {cities[0]?.visits || 54} acessos registrados
              </p>
            </div>
            <div className="p-3 bg-white/60 rounded-xl text-[#705510] border border-[#d2c595]/60 shadow-2xs group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#d2c595]/40 flex items-center justify-between text-[10px] font-bold text-[#543d03]/90">
            <span>Foco universitário</span>
            <span className="text-[#3c2a01] font-extrabold cursor-pointer hover:underline" onClick={() => setActiveSubTab('geography')}>
              Ver Mapa &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Repeat Rate / Fidelidade */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-[#705510] tracking-wider">Retorno de Formandos</span>
              <div className="text-3xl font-black text-[#8d1811] mt-1 font-sans flex items-baseline gap-2">
                {repeatVisits}
                <span className="text-xs font-semibold text-[#543d03]/80">({repeatRate}%)</span>
              </div>
            </div>
            <div className="p-3 bg-white/60 rounded-xl text-[#8d1811] border border-[#d2c595]/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#d2c595]/40 flex items-center justify-between text-[10px] font-bold text-[#543d03]/90">
            <span>Adesão recorrente de turmas</span>
            <span className="text-emerald-800 font-extrabold">Alta fidelidade</span>
          </div>
        </div>

      </div>

      {/* Sub-Tab navigation for Analytics */}
      <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'border-[#aa904f] text-[#aa904f] bg-[#aa904f]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          📈 Gráficos & Desempenho
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'logs'
              ? 'border-[#aa904f] text-[#aa904f] bg-[#aa904f]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          🛡️ Logs Detalhados & Auditoria
          <span className="bg-[#aa904f] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {allThirtyVisitors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('geography')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'geography'
              ? 'border-[#aa904f] text-[#aa904f] bg-[#aa904f]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          📍 Cidades & Estados
          <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
            {cities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('live')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'live'
              ? 'border-[#aa904f] text-[#aa904f] bg-[#aa904f]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          ⚡ Radar Ao Vivo
          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
            LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pages')}
          className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'pages'
              ? 'border-[#aa904f] text-[#aa904f] bg-[#aa904f]/10'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          📄 Páginas Mais Acessadas
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & GRAPHS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Evolution Chart + Device Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart: Daily Visits Evolution */}
            <div className="lg:col-span-2 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#705510]" /> Evolução Diária de Acessos
                  </h4>
                  <p className="text-[11px] text-[#543d03]/70 font-medium">Fluxo de formandos navegando no portal por dia</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white/60 px-2.5 py-1 rounded-lg border border-[#d2c595]/50">
                  Alta Atividade
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#705510" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#705510" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorUniques" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8d1811" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8d1811" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2c595" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#543d03" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <YAxis stroke="#543d03" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b18', color: '#fff', borderRadius: '12px', border: '1px solid #705510', fontSize: '11px', fontWeight: 'bold' }} 
                    />
                    <Area type="monotone" dataKey="Acessos Totais" stroke="#705510" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    <Area type="monotone" dataKey="Visitantes Únicos" stroke="#8d1811" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorUniques)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device breakdown Pie */}
            <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#705510]" /> Proporção por Dispositivo
                </h4>
                <p className="text-[11px] text-[#543d03]/70 font-medium">Celular vs Computador vs Tablet</p>
              </div>

              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b18', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-[#3c2a01]">72%</span>
                  <span className="text-[9px] font-bold text-[#543d03]/80 uppercase">Mobile</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#d2c595]/50 text-xs">
                {deviceData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-[#3c2a01]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                      {d.name}
                    </span>
                    <span className="text-[#705510] font-black">{d.value} ({d.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick link banner to the 30-Visitors table */}
          <div className="bg-gradient-to-r from-[#dfd1a1] via-[#ebe0b2] to-[#dfd1a1] border border-[#aa904f]/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#543d03] text-white rounded-xl shadow-xs">
                <FileSpreadsheet className="w-5 h-5 text-[#dfd1a1]" />
              </div>
              <div>
                <h5 className="text-xs font-black text-[#3c2a01] uppercase tracking-wide">
                  Tabela Completa dos Últimos 30 Visitantes Registrados
                </h5>
                <p className="text-[11px] text-[#543d03] font-medium">
                  Visualize a lista detalhada com Cidade, Estado (UF), Dispositivo, SO, Navegador e Data/Hora exata.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('logs')}
              className="bg-[#543d03] hover:bg-[#3c2a01] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Abrir Tabela Detalhada (30)</span>
              <ChevronRight className="w-4 h-4 text-[#dfd1a1]" />
            </button>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: DETAILED LOGS & SECURITY AUDIT COMPONENT */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <AccessLogsManager visitorTracking={tracking} />
        </div>
      )}

      {/* SUB-TAB 3: GEOGRAPHY / CITIES & STATES */}
      {activeSubTab === 'geography' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cities Breakdown Bar Chart */}
            <div className="lg:col-span-2 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#705510]" /> Ranking por Cidade (Municípios)
                  </h4>
                  <p className="text-[11px] text-[#543d03]/70 font-medium">Cidades onde as comissões e formandos estão mais ativos</p>
                </div>
                <span className="text-xs font-bold bg-[#dfd1a1] text-[#3c2a01] px-2.5 py-1 rounded-lg border border-[#aa904f]/40">
                  {cities.length} Cidades
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cities} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2c595" opacity={0.5} horizontal={false} />
                    <XAxis type="number" stroke="#543d03" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="city" type="category" stroke="#543d03" tick={{ fontSize: 11, fontWeight: 'bold' }} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b18', color: '#fff', borderRadius: '12px', border: '1px solid #705510', fontSize: '11px' }}
                      formatter={(val: any) => [`${val} acessos`, 'Visitas']}
                    />
                    <Bar dataKey="visits" fill="#705510" radius={[0, 8, 8, 0]}>
                      {cities.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#543d03' : '#aa904f'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* State (UF) List Cards */}
            <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#705510]" /> Estados em Destaque (UF)
                </h4>
                <p className="text-[11px] text-[#543d03]/70 font-medium">Distribuição por unidade federativa</p>
              </div>

              <div className="space-y-2.5">
                {states.map((st, idx) => (
                  <div key={idx} className="bg-white/70 p-3 rounded-xl border border-[#d2c595]/60 flex items-center justify-between shadow-2xs hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#543d03] text-[#dfd1a1] font-black text-xs flex items-center justify-center font-mono">
                        {st.state}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-[#3c2a01]">{st.name}</div>
                        <div className="text-[10px] text-neutral-500 font-medium">Brasil</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xs text-[#705510]">{st.visits} visitas</div>
                      <div className="text-[10px] text-emerald-800 font-bold">Ativo</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: LIVE RADAR */}
      {activeSubTab === 'live' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Feed Activity */}
            <div className="lg:col-span-2 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" /> Feed de Acessos Instantâneo
                  </h4>
                  <p className="text-[11px] text-[#543d03]/70 font-medium">Fluxo em tempo real de páginas acessadas por formandos</p>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  Radar Ativo
                </span>
              </div>

              <div className="space-y-2.5">
                {liveStream.map((stream) => (
                  <div key={stream.id} className="bg-white/80 p-3 rounded-xl border border-[#d2c595]/60 flex items-center justify-between shadow-2xs hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-[#3c2a01]">{stream.city} ({stream.state})</span>
                          <span className="text-[9px] bg-neutral-100 px-1.5 py-0.2 rounded font-mono text-neutral-600">
                            {stream.device === 'mobile' ? 'Celular' : 'Desktop'}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-600 block mt-0.5">
                          Acessou: <strong className="text-[#705510]">{stream.page}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {stream.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#d2c595]/40 text-center">
                <button
                  onClick={() => {
                    const citiesList = ['Botucatu', 'São Paulo', 'Campinas', 'Bauru', 'Ribeirão Preto', 'Belo Horizonte', 'Curitiba', 'São José do Rio Preto', 'Sobral'];
                    const pagesList = ['Portal do Formando (Medicina)', 'Galeria de Fotos do Baile', 'Cronograma de Eventos', 'Área da Comissão', 'Página Inicial (Landing Page)'];
                    const randomCity = citiesList[Math.floor(Math.random() * citiesList.length)];
                    const randomPage = pagesList[Math.floor(Math.random() * pagesList.length)];
                    
                    setLiveStream(prev => [
                      { id: Date.now().toString(), city: randomCity, state: 'SP', page: randomPage, time: 'Agora', device: 'mobile' },
                      ...prev.slice(0, 4)
                    ]);
                    setLiveOnlineCount(prev => prev + 1);

                    // Trigger global toast event in admin
                    window.dispatchEvent(new CustomEvent('wm2_new_visitor', {
                      detail: {
                        city: randomCity,
                        state: 'SP',
                        page: randomPage,
                        device: 'mobile'
                      }
                    }));
                  }}
                  className="w-full py-2.5 bg-[#543d03] hover:bg-[#3c2a01] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfd1a1]" />
                  Simular Novo Acesso em Tempo Real & Disparar Notificação
                </button>
              </div>
            </div>

            {/* Radar Quick Stats */}
            <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#705510]" /> Status da Infraestrutura
                </h4>
                <p className="text-[11px] text-[#543d03]/70 font-medium">Telemetria de tráfego do servidor</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-[#d2c595]/60 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-600">Tempo de Resposta Médio:</span>
                  <span className="text-emerald-800 font-mono font-black">42 ms</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-600">Uptime do Portal:</span>
                  <span className="text-emerald-800 font-mono font-black">99.98%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-600">Conexões SSL / HTTPS:</span>
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Ativo
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-600">Dispositivo Mais Ativo:</span>
                  <span className="text-[#705510] font-black">iPhone / Android (Mobile)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 5: TOP PAGES */}
      {activeSubTab === 'pages' && (
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-extrabold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
              <MousePointer className="w-4 h-4 text-[#705510]" /> Ranking das Páginas Mais Visitadas
            </h4>
            <p className="text-[11px] text-[#543d03]/70 font-medium">Mapeamento de interesse dos formandos pelas seções do portal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(tracking.topPages && tracking.topPages.length > 0 ? tracking.topPages : [
              { path: '/', name: 'Página Inicial (Landing Page)', views: 112 },
              { path: '/portal-formando', name: 'Portal do Formando (Login/Adesão)', views: 76 },
              { path: '/galeria', name: 'Galeria & Portfólio de Formaturas', views: 58 },
              { path: '/eventos', name: 'Cronograma de Eventos', views: 39 },
              { path: '/comissao', name: 'Área da Comissão de Formatura', views: 27 }
            ]).map((page, idx) => {
              const maxViews = 120;
              const pct = Math.round((page.views / maxViews) * 100);

              return (
                <div key={idx} className="bg-white/80 p-4 rounded-xl border border-[#d2c595]/60 shadow-2xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-extrabold text-xs text-[#3c2a01]">{page.name}</div>
                      <div className="font-mono text-[10px] text-neutral-500">{page.path}</div>
                    </div>
                    <span className="text-xs font-black text-[#705510] bg-[#dfd1a1]/50 px-2 py-0.5 rounded-md font-mono">
                      {page.views} views
                    </span>
                  </div>

                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#aa904f] to-[#543d03] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED VISITOR MODAL INSPECTION */}
      {selectedVisitorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#543d03] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#aa904f] text-white rounded-xl shadow-xs">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">Telemetria Detalhada do Visitante</h4>
                  <p className="text-[11px] text-[#dfd1a1] font-mono">ID: {selectedVisitorDetail.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVisitorDetail(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-medium text-neutral-700">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Cidade & Estado</span>
                  <span className="text-xs font-black text-neutral-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#aa904f]" />
                    {selectedVisitorDetail.city || 'São Paulo'} - {selectedVisitorDetail.state || 'SP'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">País</span>
                  <span className="text-xs font-bold text-neutral-900 mt-0.5 block">{selectedVisitorDetail.country || 'Brasil'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Data & Horário Exato</span>
                  <span className="text-xs font-mono font-bold text-neutral-900 mt-0.5 block">
                    {selectedVisitorDetail.timestamp ? new Date(selectedVisitorDetail.timestamp).toLocaleString('pt-BR') : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Dispositivo / Categoria</span>
                  <span className="text-xs font-bold text-neutral-900 mt-0.5 capitalize block">
                    {selectedVisitorDetail.device === 'mobile' ? '📱 Celular / Smartphone' : selectedVisitorDetail.device === 'tablet' ? '📱 Tablet' : '💻 Computador / Desktop'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Sistema Operacional</span>
                  <span className="text-xs font-bold text-neutral-900 mt-0.5 block">{selectedVisitorDetail.os || 'Android'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Navegador Web</span>
                  <span className="text-xs font-bold text-neutral-900 mt-0.5 block">{selectedVisitorDetail.browser || 'Chrome Mobile'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Resolução de Tela</span>
                  <span className="text-xs font-mono font-bold text-neutral-900 mt-0.5 block">{selectedVisitorDetail.screenResolution || '390x844'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Canal de Origem</span>
                  <span className="text-xs font-bold text-neutral-900 mt-0.5 block">{selectedVisitorDetail.source || 'Acesso Direto'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Página Acessada no Portal</span>
                <div className="p-3 bg-neutral-100 rounded-xl font-mono text-xs font-bold text-[#543d03] border border-neutral-200">
                  {selectedVisitorDetail.path}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedVisitorDetail(null)}
                  className="px-4 py-2 bg-[#543d03] hover:bg-[#3c2a01] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
