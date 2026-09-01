import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Check, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Target, 
  Percent, 
  MessageSquare, 
  Plus, 
  Video, 
  Briefcase, 
  FileText, 
  TrendingDown, 
  Wallet,
  ArrowRight,
  Filter,
  Flame,
  HelpCircle
} from 'lucide-react';
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
  Area 
} from 'recharts';
import { Turma, Formando, Parcela, Evento, Fornecedor, Pacote, Lead, Reuniao, Expense } from '../types';
import { getStagnantLeads, getStaleLeadFollowUpText, getWhatsAppDirectUrl } from '../utils/crmHelpers';

interface OverviewDashboardProps {
  turmas: Turma[];
  formandos: Formando[];
  parcelas: Parcela[];
  eventos: Evento[];
  fornecedores: Fornecedor[];
  pacotes: Pacote[];
  leads: Lead[];
  reunioes?: Reuniao[];
  expenses: Expense[];
  onNavigateTab: (tabId: string) => void;
  onOpenNewTurmaModal: () => void;
  onOpenNewFormandoModal: () => void;
  onOpenNewExpenseModal: () => void;
  onOpenNewLeadModal: () => void;
  onOpenLeadDetails: (lead: Lead) => void;
}

const COLORS = ['#10B981', '#F59E0B', '#E11D48', '#6366F1', '#8B5CF6'];
const LINE_COLORS = ['#aa904f', '#705510', '#543d03', '#d2c595', '#8d1811', '#c2410c'];

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  turmas = [],
  formandos = [],
  parcelas = [],
  eventos = [],
  fornecedores = [],
  pacotes = [],
  leads = [],
  reunioes = [],
  expenses = [],
  onNavigateTab,
  onOpenNewTurmaModal,
  onOpenNewFormandoModal,
  onOpenNewExpenseModal,
  onOpenNewLeadModal,
  onOpenLeadDetails
}) => {
  // Local Filters
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [activeAlertTab, setActiveAlertTab] = useState<'all' | 'inadimplencia' | 'leads' | 'eventos' | 'reunioes'>('all');
  const [salesChartMetric, setSalesChartMetric] = useState<'value' | 'count'>('value');
  const [salesChartType, setSalesChartType] = useState<'monthly' | 'cumulative'>('cumulative');

  // Available Graduation Years
  const graduationYears = useMemo(() => {
    const years = Array.from(new Set(turmas.map(t => t.year).filter(Boolean)));
    return years.sort((a, b) => b - a);
  }, [turmas]);

  // Filtered turmas based on year and turmaId
  const filteredTurmas = useMemo(() => {
    return turmas.filter(t => {
      const matchTurma = selectedTurmaId === 'all' || t.id === selectedTurmaId;
      const matchYear = selectedYear === 'all' || String(t.year) === String(selectedYear);
      return matchTurma && matchYear;
    });
  }, [turmas, selectedTurmaId, selectedYear]);

  const filteredTurmaIds = useMemo(() => filteredTurmas.map(t => t.id), [filteredTurmas]);

  // Filtered students
  const filteredFormandos = useMemo(() => {
    return formandos.filter(f => filteredTurmaIds.includes(f.turmaId));
  }, [formandos, filteredTurmaIds]);

  const filteredFormandoIds = useMemo(() => filteredFormandos.map(f => f.id), [filteredFormandos]);

  // Filtered installments
  const filteredParcelas = useMemo(() => {
    return parcelas.filter(p => filteredFormandoIds.includes(p.formandoId));
  }, [parcelas, filteredFormandoIds]);

  // Filtered events
  const filteredEventos = useMemo(() => {
    return eventos.filter(e => filteredTurmaIds.includes(e.turmaId));
  }, [eventos, filteredTurmaIds]);

  // Filtered meetings
  const filteredReunioes = useMemo(() => {
    return reunioes.filter(r => filteredTurmaIds.includes(r.turmaId));
  }, [reunioes, filteredTurmaIds]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => exp.turmaId === 'all' || filteredTurmaIds.includes(exp.turmaId));
  }, [expenses, filteredTurmaIds]);

  // --- Financial & Metric Calculations ---
  const activeStudentsCount = filteredFormandos.filter(f => f.status === 'Ativo').length;
  const pendingStudentsCount = filteredFormandos.filter(f => f.status === 'Pendente').length;
  const overdueStudentsCount = filteredFormandos.filter(f => f.status === 'Inadimplente').length;
  const totalFilteredStudents = filteredFormandos.length;

  const totalProjectedRevenue = filteredFormandos.reduce((acc, curr) => acc + curr.totalDue, 0);
  const totalCollectedRevenue = filteredFormandos.reduce((acc, curr) => acc + curr.totalPaid, 0);
  const pendingReceivables = Math.max(0, totalProjectedRevenue - totalCollectedRevenue);
  const collectionsRate = totalProjectedRevenue > 0 ? (totalCollectedRevenue / totalProjectedRevenue) * 100 : 0;

  const totalOverdueValue = filteredParcelas
    .filter(p => p.status === 'Atrasada')
    .reduce((sum, p) => sum + p.value, 0);

  const defaultOverdueRate = totalProjectedRevenue > 0 ? (totalOverdueValue / totalProjectedRevenue) * 100 : 0;

  const totalExpensesPaid = filteredExpenses
    .filter(e => e.status === 'Pago')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpensesPending = filteredExpenses
    .filter(e => e.status === 'Pendente')
    .reduce((sum, e) => sum + e.amount, 0);

  const netCashFlow = totalCollectedRevenue - totalExpensesPaid;

  // --- Overdue students for Urgent Action ---
  const overdueStudentsList = useMemo(() => {
    return filteredFormandos
      .filter(f => f.status === 'Inadimplente')
      .map(student => {
        const studentOverdueInstallments = parcelas.filter(p => p.formandoId === student.id && p.status === 'Atrasada');
        const overdueAmount = studentOverdueInstallments.reduce((sum, p) => sum + p.value, 0);
        const turma = turmas.find(t => t.id === student.turmaId);
        return {
          student,
          turma,
          overdueInstallments: studentOverdueInstallments,
          overdueAmount: overdueAmount > 0 ? overdueAmount : (student.totalDue - student.totalPaid)
        };
      })
      .filter(item => item.overdueAmount > 0)
      .slice(0, 5);
  }, [filteredFormandos, parcelas, turmas]);

  // --- Stagnant CRM Leads (> 7 days) ---
  const staleLeadAlerts = useMemo(() => getStagnantLeads(leads, 7), [leads]);
  const totalStaleValue = useMemo(() => staleLeadAlerts.reduce((sum, a) => sum + (a.lead.estimatedValue || 0), 0), [staleLeadAlerts]);

  // --- Upcoming Events with Countdown ---
  const upcomingEventsWithCountdown = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...filteredEventos]
      .filter(e => e.date)
      .map(e => {
        const evDate = new Date(e.date + 'T00:00:00');
        const diffTime = evDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const turma = turmas.find(t => t.id === e.turmaId);
        return {
          event: e,
          turma,
          diffDays,
          isUpcoming: diffDays >= 0,
          isUrgent: diffDays >= 0 && diffDays <= 30
        };
      })
      .sort((a, b) => {
        if (a.isUpcoming && !b.isUpcoming) return -1;
        if (!a.isUpcoming && b.isUpcoming) return 1;
        return a.diffDays - b.diffDays;
      })
      .slice(0, 4);
  }, [filteredEventos, turmas]);

  // --- Upcoming Meetings with Commission ---
  const upcomingMeetingsList = useMemo(() => {
    return [...filteredReunioes]
      .filter(r => r.status === 'Agendada')
      .slice(0, 3);
  }, [filteredReunioes]);

  // Total Action Items Count
  const totalAttentionItems = overdueStudentsList.length + staleLeadAlerts.length + upcomingEventsWithCountdown.filter(e => e.isUrgent).length + upcomingMeetingsList.length;

  // --- Turma Adherence Thermometer ---
  const turmasAdherence = useMemo(() => {
    return filteredTurmas.map(t => {
      const classStudents = formandos.filter(f => f.turmaId === t.id);
      const enrolled = classStudents.length;
      const target = t.targetStudents || 1;
      const pct = (enrolled / target) * 100;
      const collected = classStudents.reduce((sum, s) => sum + s.totalPaid, 0);
      const projected = classStudents.reduce((sum, s) => sum + s.totalDue, 0);

      let health: 'high' | 'medium' | 'low' = 'medium';
      if (pct >= 80) health = 'high';
      else if (pct < 50) health = 'low';

      return {
        turma: t,
        enrolled,
        target,
        pct: Math.min(100, pct),
        realPct: pct,
        collected,
        projected,
        health
      };
    }).sort((a, b) => b.realPct - a.realPct);
  }, [filteredTurmas, formandos]);

  // --- Charts Data ---
  const revenueChartData = useMemo(() => {
    return filteredTurmas.map(t => {
      const classStudents = formandos.filter(f => f.turmaId === t.id);
      const collected = classStudents.reduce((acc, curr) => acc + curr.totalPaid, 0);
      const projected = classStudents.reduce((acc, curr) => acc + curr.totalDue, 0);
      return {
        name: t.name.split(' - ')[0],
        'Arrecadado': collected,
        'Projetado': projected
      };
    });
  }, [filteredTurmas, formandos]);

  const studentsStatusChartData = [
    { name: 'Em Dia (Ativo)', value: activeStudentsCount },
    { name: 'Pendente', value: pendingStudentsCount },
    { name: 'Inadimplente', value: overdueStudentsCount }
  ];

  const timelineChartData = useMemo(() => {
    const paidParcelas = parcelas.filter(p => p.status === 'Paga' && p.payDate && filteredFormandoIds.includes(p.formandoId));
    const periodsSet = new Set<string>();
    
    paidParcelas.forEach(p => {
      if (p.payDate) {
        periodsSet.add(p.payDate.substring(0, 7)); // 'YYYY-MM'
      }
    });

    if (periodsSet.size === 0) {
      periodsSet.add('2025-01');
      periodsSet.add('2025-02');
      periodsSet.add('2025-03');
      periodsSet.add('2025-04');
      periodsSet.add('2025-05');
      periodsSet.add('2025-06');
    }

    const sortedPeriods = Array.from(periodsSet).sort();

    return sortedPeriods.map(period => {
      const [year, month] = period.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const formattedLabel = `${monthNames[parseInt(month, 10) - 1]}/${year.substring(2)}`;

      const dataPoint: { name: string; [key: string]: string | number } = {
        name: formattedLabel,
      };

      filteredTurmas.forEach(t => {
        const classStudentIds = formandos.filter(f => f.turmaId === t.id).map(f => f.id);
        const cumulativeSum = parcelas
          .filter(p => p.status === 'Paga' && p.payDate && classStudentIds.includes(p.formandoId) && p.payDate.substring(0, 7) <= period)
          .reduce((sum, p) => sum + p.value, 0);

        dataPoint[t.name.split(' - ')[0]] = cumulativeSum;
      });

      return dataPoint;
    });
  }, [parcelas, filteredFormandoIds, filteredTurmas, formandos]);

  // CRM Commercial Calculations
  const crmWonLeads = leads.filter(l => l.stage === 'won');
  const crmPendingLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost');
  const crmTotalLeadsCount = leads.length;
  const crmWonCount = crmWonLeads.length;
  const crmPendingCount = crmPendingLeads.length;
  const crmWonValue = crmWonLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const crmPendingValue = crmPendingLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const crmConversionRate = crmTotalLeadsCount > 0 ? (crmWonCount / crmTotalLeadsCount) * 100 : 0;

  const currentMonthYear = new Date().toISOString().substring(0, 7);
  const currentMonthWonLeads = leads.filter(l => l.stage === 'won' && l.createdAt && l.createdAt.startsWith(currentMonthYear));
  const currentMonthSalesTotal = currentMonthWonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const currentMonthSalesCount = currentMonthWonLeads.length;

  const averageTicketValue = crmWonLeads.length > 0
    ? crmWonValue / crmWonLeads.length
    : 0;

  const lastConvertedLeads = useMemo(() => {
    return [...leads]
      .filter(l => l.stage === 'won')
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);
  }, [leads]);

  const salesVolumeTimelineData = useMemo(() => {
    const monthsMap: { [key: string]: { wonVal: number; totalVal: number; wonCount: number; totalCount: number } } = {};
    
    leads.forEach(l => {
      const dateStr = l.createdAt || '';
      const monthKey = dateStr.substring(0, 7);
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        if (!monthsMap[monthKey]) {
          monthsMap[monthKey] = { wonVal: 0, totalVal: 0, wonCount: 0, totalCount: 0 };
        }
        monthsMap[monthKey].totalVal += l.estimatedValue || 0;
        monthsMap[monthKey].totalCount += 1;
        if (l.stage === 'won') {
          monthsMap[monthKey].wonVal += l.estimatedValue || 0;
          monthsMap[monthKey].wonCount += 1;
        }
      }
    });

    const defaultMonths = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
    defaultMonths.forEach(m => {
      if (!monthsMap[m]) {
        monthsMap[m] = { wonVal: 0, totalVal: 0, wonCount: 0, totalCount: 0 };
      }
    });

    const sortedMonthKeys = Object.keys(monthsMap).sort();
    let accumWonVal = 0;
    let accumTotalVal = 0;
    let accumWonCount = 0;
    let accumTotalCount = 0;

    return sortedMonthKeys.map(m => {
      const [year, monthNum] = m.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const label = `${monthNames[parseInt(monthNum, 10) - 1]}/${year.substring(2)}`;
      
      const data = monthsMap[m];
      accumWonVal += data.wonVal;
      accumTotalVal += data.totalVal;
      accumWonCount += data.wonCount;
      accumTotalCount += data.totalCount;

      return {
        month: m,
        label,
        wonValue: data.wonVal,
        totalValue: data.totalVal,
        wonCount: data.wonCount,
        totalCount: data.totalCount,
        cumulativeWonValue: accumWonVal,
        cumulativeTotalValue: accumTotalVal,
        cumulativeWonCount: accumWonCount,
        cumulativeTotalCount: accumTotalCount
      };
    });
  }, [leads]);

  return (
    <div className="space-y-6">

      {/* 1. ATALHOS RÁPIDOS DE 1 CLIQUE (QUICK ACTIONS BAR) */}
      <div className="bg-gradient-to-r from-[#2c2005] via-[#45330a] to-[#2c2005] text-[#ebe0b2] rounded-2xl p-4 sm:p-5 shadow-md border border-[#aa904f]/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#aa904f] text-[#2c2005] text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              Ações Rápidas
            </span>
            <span className="text-xs text-[#d2c595]/80 font-medium">Central Operacional</span>
          </div>
          <h2 className="text-lg font-black text-white font-sans mt-1">
            Painel Executivo WM2 Produções
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewTurmaModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#aa904f] hover:bg-[#c2a65d] text-[#2c2005] font-black text-xs rounded-lg shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Nova Turma
          </button>

          <button
            type="button"
            onClick={onOpenNewFormandoModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-lg border border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#d2c595]" /> + Novo Formando
          </button>

          <button
            type="button"
            onClick={onOpenNewExpenseModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-lg border border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> + Lançar Despesa
          </button>

          <button
            type="button"
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-lg border border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" /> + Novo Lead CRM
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('reunioes')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-lg border border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-sky-400" /> + Reunião Comissão
          </button>
        </div>
      </div>

      {/* 2. FILTROS GLOBAIS DE VISUALIZAÇÃO (TURMA & ANO DE FORMATURA) */}
      <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/60 rounded-lg text-[#705510]">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#3c2a01]">Filtro Geral do Dashboard</h3>
            <p className="text-[11px] text-[#543d03]/75 font-medium">
              Exibindo dados de <strong className="text-[#3c2a01]">{filteredTurmas.length} turmas</strong> e <strong className="text-[#3c2a01]">{filteredFormandos.length} formandos</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Graduation Year */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="overview-year-filter" className="text-xs font-bold uppercase text-[#3c2a01] whitespace-nowrap">
              Ano:
            </label>
            <select
              id="overview-year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-[#d2c595] text-[#543d03] text-xs font-bold rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#aa904f] cursor-pointer shadow-2xs"
            >
              <option value="all">Todos os Anos</option>
              {graduationYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Filter by Turma */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="overview-turma-filter" className="text-xs font-bold uppercase text-[#3c2a01] whitespace-nowrap">
              Turma:
            </label>
            <select
              id="overview-turma-filter"
              value={selectedTurmaId}
              onChange={(e) => setSelectedTurmaId(e.target.value)}
              className="bg-white border border-[#d2c595] text-[#543d03] text-xs font-bold rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#aa904f] cursor-pointer shadow-2xs max-w-[240px] truncate"
            >
              <option value="all">Todas as Turmas (Consolidado)</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {(selectedTurmaId !== 'all' || selectedYear !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedTurmaId('all');
                setSelectedYear('all');
              }}
              className="text-[11px] font-extrabold text-[#8d1811] hover:underline cursor-pointer px-1"
            >
              Limpar Filtros ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. CENTRAL DE AÇÕES IMEDIATAS ("O QUE PRECISA DE ATENÇÃO HOJE") */}
      <div className="bg-white dark:bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                  Central de Atenção Imediata
                </h3>
                {totalAttentionItems > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    {totalAttentionItems} pendência{totalAttentionItems > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 font-medium">
                Inadimplências críticas, leads parados, eventos próximos e reuniões que demandam ação rápida.
              </p>
            </div>
          </div>

          {/* Filter Pills for Alert Categories */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveAlertTab('all')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeAlertTab === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Todos ({totalAttentionItems})
            </button>
            <button
              type="button"
              onClick={() => setActiveAlertTab('inadimplencia')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeAlertTab === 'inadimplencia'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Inadimplência ({overdueStudentsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveAlertTab('leads')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeAlertTab === 'leads'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Leads CRM ({staleLeadAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveAlertTab('eventos')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeAlertTab === 'eventos'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              Eventos ({upcomingEventsWithCountdown.filter(e => e.isUrgent).length})
            </button>
          </div>
        </div>

        {/* Dynamic Alert Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* 1. Inadimplências */}
          {(activeAlertTab === 'all' || activeAlertTab === 'inadimplencia') && overdueStudentsList.map(({ student, turma, overdueAmount, overdueInstallments }) => {
            const rawPhone = student.phone ? student.phone.replace(/\D/g, '') : '';
            const msg = `Olá, ${student.name}! 🎓\n\nIdentificamos pendência referente às parcelas da sua formatura (${turma?.name || 'sua turma'}).\n\nValor em atraso: ${overdueAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.\n\nPor favor, acesse seu Portal do Aluno para regularizar via Pix ou Boleto ou entre em contato com nossa equipe financeira para parcelamento facilitado.\n\nAtenciosamente,\nWM2 Produções & Eventos`;
            const waUrl = rawPhone ? `https://api.whatsapp.com/send?phone=55${rawPhone}&text=${encodeURIComponent(msg)}` : '';

            return (
              <div
                key={`overdue-${student.id}`}
                className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                      Inadimplente
                    </span>
                    <span className="text-[11px] font-mono font-black text-rose-800">
                      {overdueAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{student.name}</h4>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {turma?.name || 'Turma não informada'} • {overdueInstallments.length} parcela(s) em atraso
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('formandos')}
                    className="text-[10px] font-bold text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Ver Ficha
                  </button>

                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 no-underline shadow-2xs transition-all"
                    >
                      <MessageSquare className="w-3 h-3" /> Cobrar no Zap
                    </a>
                  ) : (
                    <span className="text-[9px] text-neutral-400 font-medium italic">Sem telefone</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* 2. Leads Parados no CRM */}
          {(activeAlertTab === 'all' || activeAlertTab === 'leads') && staleLeadAlerts.map(alert => (
            <div
              key={`stale-${alert.lead.id}`}
              className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="bg-amber-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                    Lead Parado ({alert.daysInStage} dias)
                  </span>
                  <span className="text-[11px] font-mono font-black text-amber-800">
                    {(alert.lead.estimatedValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900 truncate">{alert.lead.name}</h4>
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                  {alert.lead.institution || 'Instituição'} • Etapa: <strong>{alert.stageLabel}</strong>
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLeadDetails(alert.lead)}
                  className="text-[10px] font-bold text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
                >
                  Ver Lead
                </button>

                {alert.lead.contactPhone && (
                  <a
                    href={getWhatsAppDirectUrl(alert.lead.contactPhone, getStaleLeadFollowUpText(alert.lead, alert.daysInStage))}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 no-underline shadow-2xs transition-all"
                  >
                    <MessageSquare className="w-3 h-3" /> Reativar Zap
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* 3. Próximos Eventos Críticos (<= 30 dias) */}
          {(activeAlertTab === 'all' || activeAlertTab === 'eventos') && upcomingEventsWithCountdown.filter(e => e.isUrgent).map(({ event, turma, diffDays }) => (
            <div
              key={`urgent-event-${event.id}`}
              className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="bg-sky-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                    {diffDays === 0 ? '🚨 Hoje!' : diffDays === 1 ? 'Amanhã!' : `Faltam ${diffDays} dias`}
                  </span>
                  <span className="text-[10px] font-bold text-sky-800">
                    {event.date ? event.date.split('-').reverse().join('/') : ''}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900 truncate">{event.title}</h4>
                <p className="text-[10px] text-neutral-500 truncate mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 shrink-0" /> {event.venue || 'Local a definir'} ({turma?.name || 'Turma'})
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-sky-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('eventos')}
                  className="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                >
                  Abrir Cerimonial →
                </button>
                <span className="text-[9px] font-semibold text-neutral-400">
                  {event.time ? `${event.time}h` : 'Horário livre'}
                </span>
              </div>
            </div>
          ))}

          {/* 4. Reuniões de Comissão Agendadas */}
          {(activeAlertTab === 'all' || activeAlertTab === 'reunioes') && upcomingMeetingsList.map(meeting => (
            <div
              key={`meeting-${meeting.id}`}
              className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                    Reunião Comissão
                  </span>
                  <span className="text-[10px] font-bold text-indigo-800">
                    {meeting.date.split('-').reverse().join('/')} às {meeting.time}h
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900 truncate">{meeting.title}</h4>
                <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                  {meeting.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-indigo-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('reunioes')}
                  className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  Gerenciar Reunião
                </button>
                {meeting.link && (
                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded flex items-center gap-1 no-underline"
                  >
                    Entrar <ArrowRight className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {totalAttentionItems === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-neutral-500 font-bold bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col items-center justify-center gap-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Tudo em dia! Nenhuma inadimplência crítica, lead parado ou evento urgente no momento.</span>
            </div>
          )}

        </div>
      </div>

      {/* 4. DRE COMPACTO & FLUXO DE CAIXA EXECUTIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Faturamento Projetado */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-[#705510] tracking-wider">Faturamento Total</span>
              <Building className="w-4 h-4 text-[#705510]" />
            </div>
            <div className="text-xl font-black text-[#3c2a01] font-sans">
              {totalProjectedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-[#543d03]/75 font-medium mt-1 block">
              Contratos ativos ({filteredTurmas.length} turmas)
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#d2c595]/50 flex justify-between text-[10px] font-bold text-[#543d03]">
            <span>Alunos: {totalFilteredStudents}</span>
            <span>Meta: {filteredTurmas.reduce((sum, t) => sum + (t.targetStudents || 0), 0)}</span>
          </div>
        </div>

        {/* Card 2: Total Arrecadado */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Arrecadado</span>
              <DollarSign className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xl font-black text-emerald-900 font-sans">
              {totalCollectedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-emerald-800 font-medium mt-1 block">
              {collectionsRate.toFixed(1)}% de adimplência geral
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#d2c595]/50">
            <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-700 h-full" style={{ width: `${Math.min(100, collectionsRate)}%` }} />
            </div>
          </div>
        </div>

        {/* Card 3: Inadimplência / Atraso */}
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Em Atraso</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-700 font-sans">
              {totalOverdueValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-rose-800 font-medium mt-1 block">
              {defaultOverdueRate.toFixed(1)}% da carteira em risco
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-200 flex justify-between text-[10px] font-bold text-rose-800">
            <span>Formandos: {overdueStudentsCount}</span>
            <button
              type="button"
              onClick={() => setActiveAlertTab('inadimplencia')}
              className="underline cursor-pointer hover:text-rose-950 font-black"
            >
              Cobrar →
            </button>
          </div>
        </div>

        {/* Card 4: Despesas Totais */}
        <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-[#8d1811] tracking-wider">Despesas Lançadas</span>
              <TrendingDown className="w-4 h-4 text-[#8d1811]" />
            </div>
            <div className="text-xl font-black text-[#8d1811] font-sans">
              {totalExpensesPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-[#543d03]/75 font-medium mt-1 block">
              + {totalExpensesPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} a pagar
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#d2c595]/50 flex justify-between text-[10px] font-bold text-[#543d03]">
            <span>{filteredExpenses.length} despesas</span>
            <button
              type="button"
              onClick={() => onNavigateTab('financeiro')}
              className="underline cursor-pointer hover:text-[#3c2a01]"
            >
              Ver DRE →
            </button>
          </div>
        </div>

        {/* Card 5: Saldo Líquido em Caixa */}
        <div className="bg-white dark:bg-white border border-neutral-200/90 text-neutral-900 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-[#aa904f] tracking-wider">Saldo Líquido Caixa</span>
              <Wallet className="w-4 h-4 text-[#8d712e]" />
            </div>
            <div className={`text-xl font-black font-sans ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netCashFlow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-neutral-500 font-medium mt-1 block">
              Recebido líquido menos despesas
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-100 flex justify-between text-[10px] font-bold text-neutral-400">
            <span>{netCashFlow >= 0 ? 'Superávit Caixa' : 'Déficit Momentâneo'}</span>
            <span className="text-emerald-600 font-bold">✓ Conciliado</span>
          </div>
        </div>

      </div>

      {/* 5. TERMÔMETRO DE ADESÃO DAS TURMAS (SAÚDE DOS CONTRATOS) & PRÓXIMOS EVENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Termômetro de Adesão das Turmas */}
        <div className="lg:col-span-7 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#705510]" /> Termômetro de Adesão das Turmas (Saúde Contratual)
              </h4>
              <p className="text-[11px] text-[#543d03]/75 font-medium">
                Acompanhamento em tempo real de metas atingidas por contrato e turma.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('turmas')}
              className="text-[11px] font-bold text-[#705510] hover:text-[#3c2a01] underline cursor-pointer whitespace-nowrap"
            >
              Gerenciar Turmas →
            </button>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {turmasAdherence.map(({ turma, enrolled, target, pct, health }) => {
              const badgeClass = health === 'high'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : health === 'medium'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300';

              const barFill = health === 'high'
                ? 'bg-emerald-600'
                : health === 'medium'
                ? 'bg-amber-500'
                : 'bg-rose-600';

              const label = health === 'high'
                ? '🟢 Alta Adesão'
                : health === 'medium'
                ? '🟡 Adesão Média'
                : '🔴 Baixa Adesão (Atenção)';

              return (
                <div key={turma.id} className="bg-white/50 border border-[#d2c595]/40 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-extrabold text-[#3c2a01] leading-tight truncate">
                        {turma.name}
                      </h5>
                      <span className="text-[10px] text-[#543d03]/70 font-medium">
                        {turma.institution} • Ano: {turma.year}
                      </span>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                      {label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-[#543d03]">
                      <span>{enrolled} de {target} alunos ({pct.toFixed(0)}%)</span>
                      <span>Meta: {target} alunos</span>
                    </div>
                    <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${barFill}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximos Eventos com Contagem Regressiva e Cerimonial */}
        <div className="lg:col-span-5 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#705510]" /> Próximos Eventos & Cerimonial
                </h4>
                <p className="text-[11px] text-[#543d03]/75 font-medium">
                  Contagem regressiva dos bailes e solenidades.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('eventos')}
                className="text-[11px] font-bold text-[#705510] hover:text-[#3c2a01] underline cursor-pointer"
              >
                Ver Todos →
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingEventsWithCountdown.length === 0 ? (
                <p className="text-xs italic text-[#543d03]/70 py-6 text-center">
                  Nenhum evento agendado para o filtro selecionado.
                </p>
              ) : (
                upcomingEventsWithCountdown.map(({ event, turma, diffDays }) => {
                  const evDate = new Date(event.date + 'T00:00:00');
                  const day = evDate.getDate();
                  const month = evDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

                  const countdownBadge = diffDays === 0
                    ? 'bg-rose-600 text-white'
                    : diffDays === 1
                    ? 'bg-amber-600 text-white'
                    : diffDays > 0 && diffDays <= 30
                    ? 'bg-sky-600 text-white'
                    : 'bg-[#543d03]/20 text-[#543d03]';

                  return (
                    <div
                      key={event.id}
                      className="bg-white/40 border border-[#d2c595]/30 rounded-lg p-2.5 flex items-center gap-3 hover:bg-white/60 transition-all"
                    >
                      <div className="flex flex-col items-center justify-center bg-white/70 text-[#543d03] font-black w-10 h-10 rounded-lg shrink-0 border border-[#d2c595]/40">
                        <span className="leading-none text-xs">{day}</span>
                        <span className="text-[8px] uppercase leading-none mt-0.5">{month}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-extrabold text-[#3c2a01] text-xs truncate leading-tight">
                            {event.title}
                          </h5>
                          <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${countdownBadge}`}>
                            {diffDays === 0 ? 'Hoje' : diffDays === 1 ? 'Amanhã' : diffDays > 0 ? `${diffDays}d` : 'Realizado'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#543d03]/75 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" /> {event.venue || 'Local não definido'} ({turma?.name.split(' - ')[0] || 'Turma'})
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 text-center border-t border-[#d2c595]/40">
            <span className="text-[9.5px] font-bold text-[#705510] uppercase tracking-wider block">
              Total de {filteredEventos.length} eventos planejados
            </span>
          </div>
        </div>

      </div>

      {/* 6. GRÁFICOS FINANCEIROS E DE ARRECADAÇÃO */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Faturamento por Turma (Projetado vs Arrecadado) */}
        <div className="lg:col-span-8 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-[#3c2a01] uppercase tracking-wider mb-4">
            Faturamento por Turma (Projetado vs Arrecadado)
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#543d03" />
                <XAxis dataKey="name" stroke="#543d03" fontSize={10} />
                <YAxis stroke="#543d03" fontSize={10} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Bar dataKey="Projetado" fill="#8d1811" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Arrecadado" fill="#543d03" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adimplência Pie Chart */}
        <div className="lg:col-span-4 bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-bold text-[#3c2a01] uppercase tracking-wider mb-4">
            Distribuição de Formandos
          </h4>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentsStatusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {studentsStatusChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {studentsStatusChartData.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-[#543d03]/80 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  {entry.name}
                </span>
                <span className="font-bold text-[#3c2a01]">{entry.value} formandos</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7. EVOLUÇÃO DE ARRECADAÇÃO ACUMULADA AO LONGO DO TEMPO */}
      <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-xs font-bold text-[#3c2a01] uppercase tracking-wider">
              Evolução de Arrecadação Acumulada por Turma
            </h4>
            <p className="text-[11px] text-[#543d03]/70 font-medium">
              Histórico acumulativo de parcelas recebidas mês a mês.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#aa904f] rounded-full" />
              Tendência Ouro
            </span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineChartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#543d03" />
              <XAxis dataKey="name" stroke="#543d03" fontSize={10} fontWeight="600" />
              <YAxis stroke="#543d03" fontSize={10} fontWeight="600" tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
              {filteredTurmas.map((t, idx) => {
                const nameKey = t.name.split(' - ')[0];
                return (
                  <Line
                    key={t.id}
                    type="monotone"
                    dataKey={nameKey}
                    name={nameKey}
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                    activeDot={{ r: 6 }}
                    strokeWidth={3}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 8. DESEMPENHO DE VENDAS & CRM COMERCIAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total de Vendas do Mês */}
        <div className="bg-white border border-neutral-200/85 text-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase text-[#aa904f] tracking-wider">Desempenho Comercial</span>
              <div className="p-1.5 bg-[#aa904f]/10 rounded-lg text-[#8d712e]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Vendas do Mês</h4>
            <div className="text-2xl font-black text-neutral-900 font-sans tracking-tight">
              {currentMonthSalesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1.5">
              Acumulado de <span className="font-bold text-neutral-800">{currentMonthSalesCount} contratos ganhos</span> em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-bold">
            <span>Mês Atual: {new Date().toLocaleDateString('pt-BR', { month: 'short' })}/26</span>
            <span className="text-emerald-600 font-bold">✓ Atualizado</span>
          </div>
        </div>

        {/* Card 2: Ticket Médio das Vendas */}
        <div className="bg-white border border-neutral-200/85 text-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase text-[#aa904f] tracking-wider">Ticket Médio</span>
              <div className="p-1.5 bg-[#aa904f]/10 rounded-lg text-[#8d712e]">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Ticket Médio Geral</h4>
            <div className="text-2xl font-black text-neutral-900 font-sans tracking-tight">
              {averageTicketValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1.5">
              Valor estimado médio por contrato ganho na plataforma comercial.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-bold">
            <span>Calculado de {crmWonLeads.length} contratos</span>
            <span className="text-neutral-500 font-semibold">Consolidado CRM</span>
          </div>
        </div>

        {/* Card 3: Taxa de Conversão */}
        <div className="bg-white border border-neutral-200/85 text-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase text-[#aa904f] tracking-wider">Eficiência de Conversão</span>
              <div className="p-1.5 bg-[#aa904f]/10 rounded-lg text-[#8d712e]">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Taxa de Conversão</h4>
            <div className="text-2xl font-black text-neutral-900 font-sans tracking-tight">
              {crmConversionRate.toFixed(1)}%
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-1.5">
              Percentual de oportunidades ganhas sobre o total de leads cadastrados.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-bold">
            <span>{crmWonCount} de {crmTotalLeadsCount} Leads</span>
            <span className={crmConversionRate > 15 ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
              {crmConversionRate > 15 ? "Alta Conversão" : "Conversão Estável"}
            </span>
          </div>
        </div>
      </div>

      {/* Evolução do Volume de Vendas & Pipeline */}
      <div className="bg-[#ebe0b2] border border-[#d2c595] text-[#543d03] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-xs font-bold text-[#3c2a01] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#705510]" /> Evolução do Volume de Vendas ao Longo do Tempo
            </h4>
            <p className="text-[11px] text-[#543d03]/70 font-medium">
              Visualização histórica das oportunidades conquistadas versus pipeline total gerado
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/45 p-1 rounded-lg border border-[#d2c595]/30">
              <button
                type="button"
                onClick={() => setSalesChartMetric('value')}
                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all border-none cursor-pointer ${
                  salesChartMetric === 'value'
                    ? 'bg-[#543d03] text-[#ebe0b2] shadow-sm'
                    : 'text-[#543d03]/70 hover:text-[#543d03]'
                }`}
              >
                Valores (R$)
              </button>
              <button
                type="button"
                onClick={() => setSalesChartMetric('count')}
                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all border-none cursor-pointer ${
                  salesChartMetric === 'count'
                    ? 'bg-[#543d03] text-[#ebe0b2] shadow-sm'
                    : 'text-[#543d03]/70 hover:text-[#543d03]'
                }`}
              >
                Quantidade
              </button>
            </div>

            <div className="flex items-center bg-white/45 p-1 rounded-lg border border-[#d2c595]/30">
              <button
                type="button"
                onClick={() => setSalesChartType('cumulative')}
                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all border-none cursor-pointer ${
                  salesChartType === 'cumulative'
                    ? 'bg-[#543d03] text-[#ebe0b2] shadow-sm'
                    : 'text-[#543d03]/70 hover:text-[#543d03]'
                }`}
              >
                Acumulado
              </button>
              <button
                type="button"
                onClick={() => setSalesChartType('monthly')}
                className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all border-none cursor-pointer ${
                  salesChartType === 'monthly'
                    ? 'bg-[#543d03] text-[#ebe0b2] shadow-sm'
                    : 'text-[#543d03]/70 hover:text-[#543d03]'
                }`}
              >
                Mensal
              </button>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesVolumeTimelineData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#aa904f" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#aa904f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#543d03" />
              <XAxis dataKey="label" stroke="#543d03" fontSize={10} fontWeight="bold" />
              <YAxis
                stroke="#543d03"
                fontSize={10}
                fontWeight="bold"
                tickFormatter={(val) => salesChartMetric === 'value' ? `R$ ${(val / 1000).toFixed(0)}k` : val.toString()}
              />
              <Tooltip
                formatter={(value: any, name: any) => {
                  const formattedName = name === 'won' 
                    ? (salesChartMetric === 'value' ? 'Vendas Ganhas (R$)' : 'Quantidade de Vendas')
                    : (salesChartMetric === 'value' ? 'Pipeline Total (R$)' : 'Oportunidades Totais');
                  
                  if (salesChartMetric === 'value') {
                    return [
                      Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
                      formattedName
                    ];
                  }
                  return [value, formattedName];
                }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #d2c595' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
              
              <Area
                type="monotone"
                dataKey={
                  salesChartType === 'cumulative'
                    ? (salesChartMetric === 'value' ? 'cumulativeTotalValue' : 'cumulativeTotalCount')
                    : (salesChartMetric === 'value' ? 'totalValue' : 'totalCount')
                }
                name="total"
                stroke="#aa904f"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey={
                  salesChartType === 'cumulative'
                    ? (salesChartMetric === 'value' ? 'cumulativeWonValue' : 'cumulativeWonCount')
                    : (salesChartMetric === 'value' ? 'wonValue' : 'wonCount')
                }
                name="won"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorWon)"
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 9. TABELA INTERATIVA DE ÚLTIMAS OPORTUNIDADES CONVERTIDAS */}
      <div className="bg-white border border-neutral-200/85 text-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-neutral-100 pb-3">
          <div>
            <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full" /> Últimas Oportunidades Convertidas (Contratos Ganhos)
            </h4>
            <p className="text-[11px] text-neutral-500 font-medium">
              As 5 conversões mais recentes registradas no CRM. Clique em qualquer linha para abrir os detalhes e proposta.
            </p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
            5 mais recentes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                <th className="py-3 px-4">Comissão de Formatura</th>
                <th className="py-3 px-4">Curso / Instituição</th>
                <th className="py-3 px-4 text-right">Valor Estimado</th>
                <th className="py-3 px-4 text-center">Data Cadastro</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {lastConvertedLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-bold">
                    Nenhuma oportunidade com status "Ganha" (won) cadastrada no CRM ainda.
                  </td>
                </tr>
              ) : (
                lastConvertedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onOpenLeadDetails(lead)}
                    className="hover:bg-[#aa904f]/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-neutral-900 group-hover:text-[#543d03]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <span className="block">{lead.name}</span>
                          <span className="text-[10px] font-semibold text-neutral-400 font-mono group-hover:text-[#aa904f]/70">
                            {lead.contactName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-medium">
                      <span className="block">{lead.institution}</span>
                      <span className="text-[10px] text-neutral-400 block">
                        {lead.contactPhone || lead.contactEmail || 'Sem contato cadastrado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      {lead.estimatedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-neutral-500">
                      {lead.createdAt ? lead.createdAt.split('T')[0].split('-').reverse().join('/') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#aa904f] group-hover:text-[#543d03] group-hover:underline">
                        Ver Proposta
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
