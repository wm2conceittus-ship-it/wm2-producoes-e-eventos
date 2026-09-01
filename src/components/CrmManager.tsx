import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Users, 
  User, 
  DollarSign, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Clock, 
  Crown, 
  Package, 
  FileSpreadsheet, 
  FileText, 
  MessageSquare, 
  Send, 
  Phone, 
  Flame, 
  Zap, 
  Target, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  Filter, 
  List, 
  Kanban as KanbanIcon, 
  Check, 
  PieChart as PieChartIcon, 
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  Percent,
  Layers,
  ArrowDownRight,
  TrendingDown,
  CheckSquare,
  Square,
  RotateCcw,
  SlidersHorizontal,
  FileCheck,
  Tag,
  PhoneCall
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  ComposedChart, 
  Legend 
} from 'recharts';
import { Lead, LeadActivity, Pacote, Turma } from '../types';
import { 
  calculateLeadScore, 
  calculateWeightedPipeline, 
  LOSS_REASONS, 
  WHATSAPP_CRM_TEMPLATES, 
  formatCrmMessage, 
  getWhatsAppDirectUrl, 
  checkFollowUpStatus, 
  STAGE_PROBABILITIES,
  LeadScoreInfo,
  getStagnantLeads,
  isLeadStagnant,
  getLeadDaysInStage,
  getStaleLeadFollowUpText,
  STAGE_LABELS
} from '../utils/crmHelpers';

interface CrmManagerProps {
  leads: Lead[];
  turmas: Turma[];
  pacotes: Pacote[];
  onUpdateLeads: (updatedLeads: Lead[]) => void;
  onOpenNewLeadModal: () => void;
  onOpenEditLeadModal: (lead: Lead) => void;
  onOpenLeadDetails: (lead: Lead) => void;
  onConvertLeadToTurma: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onExportCSV: () => void;
  onOpenProposalModal?: (lead: Lead) => void;
}

export const CrmManager: React.FC<CrmManagerProps> = ({
  leads,
  turmas,
  pacotes,
  onUpdateLeads,
  onOpenNewLeadModal,
  onOpenEditLeadModal,
  onOpenLeadDetails,
  onConvertLeadToTurma,
  onDeleteLead,
  onExportCSV,
  onOpenProposalModal
}) => {
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'turma' | 'individual'>('all');
  const [comissaoFilter, setComissaoFilter] = useState<'all' | 'comissao' | 'formando'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'vip' | 'hot' | 'warm' | 'cold'>('all');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'overdue' | 'today' | 'stagnant'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'value_desc' | 'score_desc' | 'followup_asc' | 'stagnant_desc'>('score_desc');
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'timeline' | 'charts'>('kanban');
  const [showLossAnalytics, setShowLossAnalytics] = useState(false);
  const [funnelMetric, setFunnelMetric] = useState<'count' | 'value'>('count');
  const [conversionTimeframe, setConversionTimeframe] = useState<'6months' | '12months'>('6months');

  // Drag and Drop
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Quick Action Modals
  const [lossModalLead, setLossModalLead] = useState<Lead | null>(null);
  const [selectedLossReason, setSelectedLossReason] = useState(LOSS_REASONS[0].id);
  const [lossNotes, setLossNotes] = useState('');

  const [quickFollowUpLead, setQuickFollowUpLead] = useState<Lead | null>(null);
  const [quickFollowUpDate, setQuickFollowUpDate] = useState('');
  const [quickFollowUpNote, setQuickFollowUpNote] = useState('');

  const [quickWhatsAppLead, setQuickWhatsAppLead] = useState<Lead | null>(null);
  const [quickWhatsAppTemplateId, setQuickWhatsAppTemplateId] = useState('welcome');
  const [quickWhatsAppText, setQuickWhatsAppText] = useState('');

  // Quick Activity Logging Modal
  const [quickActivityLead, setQuickActivityLead] = useState<Lead | null>(null);
  const [quickActivityType, setQuickActivityType] = useState<LeadActivity['type']>('note');
  const [quickActivityDesc, setQuickActivityDesc] = useState('');
  const [quickActivityAuthor, setQuickActivityAuthor] = useState('Consultor Comercial');

  // Bulk operations for Table view
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStageModal, setBulkStageModal] = useState(false);
  const [bulkTargetStage, setBulkTargetStage] = useState<Lead['stage']>('proposal_sent');
  const [bulkFollowUpModal, setBulkFollowUpModal] = useState(false);
  const [bulkFollowUpDate, setBulkFollowUpDate] = useState('');

  // Kanban Stage configuration - clean, neutral-based aesthetic
  const stages: { id: Lead['stage']; label: string; dotColor: string; prob: string }[] = [
    { id: 'prospecting', label: 'Prospecção', dotColor: 'bg-neutral-400', prob: '15%' },
    { id: 'contacted', label: 'Primeiro Contato', dotColor: 'bg-blue-500', prob: '30%' },
    { id: 'proposal_sent', label: 'Proposta Enviada', dotColor: 'bg-purple-500', prob: '60%' },
    { id: 'negotiation', label: 'Negociação', dotColor: 'bg-amber-500', prob: '85%' },
    { id: 'won', label: 'Contrato Assinado', dotColor: 'bg-emerald-500', prob: '100%' },
    { id: 'lost', label: 'Perdido', dotColor: 'bg-rose-500', prob: '0%' }
  ];

  // Pipeline calculations
  const totalLeadsCount = leads.length;
  const activePipelineLeads = leads.filter(l => l.stage !== 'lost');
  const totalPipelineValue = activePipelineLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const weightedPipelineValue = calculateWeightedPipeline(leads.filter(l => l.stage !== 'lost' && l.stage !== 'won'));
  
  const wonLeads = leads.filter(l => l.stage === 'won');
  const wonCount = wonLeads.length;
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const lostLeads = leads.filter(l => l.stage === 'lost');
  const lostCount = lostLeads.length;

  const conversionRate = totalLeadsCount > 0 ? (wonCount / totalLeadsCount) * 100 : 0;
  const averageTicket = totalLeadsCount > 0 ? Math.round(totalPipelineValue / totalLeadsCount) : 0;

  const overdueLeads = leads.filter(l => {
    if (!l.nextFollowUpDate || l.stage === 'won' || l.stage === 'lost') return false;
    const today = new Date().toISOString().split('T')[0];
    return l.nextFollowUpDate < today;
  });

  const todayLeads = leads.filter(l => {
    if (!l.nextFollowUpDate || l.stage === 'won' || l.stage === 'lost') return false;
    const today = new Date().toISOString().split('T')[0];
    return l.nextFollowUpDate === today;
  });

  // Stagnant Leads (> 7 days in same stage)
  const stagnantAlerts = React.useMemo(() => getStagnantLeads(leads, 7), [leads]);
  const stagnantCount = stagnantAlerts.length;
  const stagnantValue = stagnantAlerts.reduce((sum, a) => sum + (a.lead.estimatedValue || 0), 0);
  const [showStagnantBanner, setShowStagnantBanner] = useState(true);

  // Calculate Lead Scores for all leads
  const scoredLeadsMap = React.useMemo(() => {
    const map = new Map<string, LeadScoreInfo>();
    leads.forEach(l => {
      map.set(l.id, calculateLeadScore(l));
    });
    return map;
  }, [leads]);

  // Stage change handler
  const handleUpdateStage = (leadId: string, newStage: Lead['stage']) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    if (newStage === 'lost') {
      setLossModalLead(targetLead);
      setSelectedLossReason(LOSS_REASONS[0].id);
      setLossNotes(targetLead.notes || '');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: newStage,
          lastContactDate: today,
          stageUpdatedAt: today
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
  };

  // Confirm Loss
  const handleConfirmLoss = () => {
    if (!lossModalLead) return;
    const today = new Date().toISOString().split('T')[0];
    const lossReasonItem = LOSS_REASONS.find(r => r.id === selectedLossReason);
    const reasonText = lossReasonItem ? lossReasonItem.label : 'Perda registrada';

    const newActivity: LeadActivity = {
      id: 'act-' + Date.now(),
      type: 'note',
      description: `❌ Oportunidade perdida. Motivo: ${reasonText}. ${lossNotes ? `Detalhes: ${lossNotes}` : ''}`,
      date: new Date().toISOString(),
      author: 'Consultor Comercial'
    };

    const updatedLeads = leads.map(l => {
      if (l.id === lossModalLead.id) {
        return {
          ...l,
          stage: 'lost' as const,
          lossReason: selectedLossReason,
          lossDetails: lossNotes,
          lastContactDate: today,
          activities: [newActivity, ...(l.activities || [])]
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
    setLossModalLead(null);
  };

  // Quick Follow-up Save
  const handleSaveQuickFollowUp = (daysToAdd?: number) => {
    if (!quickFollowUpLead) return;
    let targetDate = quickFollowUpDate;

    if (daysToAdd !== undefined) {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      targetDate = d.toISOString().split('T')[0];
    }

    if (!targetDate) {
      alert('Selecione uma data para o follow-up.');
      return;
    }

    const newActivity: LeadActivity = {
      id: 'act-' + Date.now(),
      type: 'note',
      description: `⏰ Follow-up agendado para ${targetDate.split('-').reverse().join('/')}${quickFollowUpNote ? `: ${quickFollowUpNote}` : ''}`,
      date: new Date().toISOString(),
      author: 'Consultor Comercial',
      nextFollowUpDate: targetDate
    };

    const updatedLeads = leads.map(l => {
      if (l.id === quickFollowUpLead.id) {
        return {
          ...l,
          nextFollowUpDate: targetDate,
          activities: [newActivity, ...(l.activities || [])]
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
    setQuickFollowUpLead(null);
    setQuickFollowUpDate('');
    setQuickFollowUpNote('');
  };

  // Open Quick WhatsApp Modal
  const handleOpenQuickWhatsApp = (lead: Lead, templateId = 'welcome') => {
    setQuickWhatsAppLead(lead);
    setQuickWhatsAppTemplateId(templateId);
    if (templateId === 'stale_reactivate') {
      setQuickWhatsAppText(getStaleLeadFollowUpText(lead, getLeadDaysInStage(lead)));
    } else {
      const tmpl = WHATSAPP_CRM_TEMPLATES.find(t => t.id === templateId) || WHATSAPP_CRM_TEMPLATES[0];
      setQuickWhatsAppText(formatCrmMessage(tmpl.template, lead));
    }
  };

  // Send WhatsApp message
  const handleSendWhatsApp = () => {
    if (!quickWhatsAppLead) return;
    const phone = quickWhatsAppLead.contactPhone;
    if (!phone) {
      alert('Este lead não possui telefone cadastrado.');
      return;
    }

    const url = getWhatsAppDirectUrl(phone, quickWhatsAppText);
    if (!url) {
      alert('Número de telefone inválido para o WhatsApp.');
      return;
    }

    // Register activity automatically
    const today = new Date().toISOString().split('T')[0];
    const newActivity: LeadActivity = {
      id: 'act-' + Date.now(),
      type: 'whatsapp',
      description: `💬 Disparo WhatsApp: "${quickWhatsAppText.slice(0, 100)}..."`,
      date: new Date().toISOString(),
      author: 'Consultor Comercial'
    };

    const updatedLeads = leads.map(l => {
      if (l.id === quickWhatsAppLead.id) {
        return {
          ...l,
          lastContactDate: today,
          activities: [newActivity, ...(l.activities || [])]
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
    window.open(url, '_blank');
    setQuickWhatsAppLead(null);
  };

  // Stage sequence for quick advance / retrocede
  const stageSequence: Lead['stage'][] = ['prospecting', 'contacted', 'proposal_sent', 'negotiation', 'won'];

  const handleAdvanceStage = (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentIndex = stageSequence.indexOf(lead.stage);
    if (currentIndex >= 0 && currentIndex < stageSequence.length - 1) {
      const nextStage = stageSequence[currentIndex + 1];
      handleUpdateStage(lead.id, nextStage);
    }
  };

  const handleRetrocedeStage = (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentIndex = stageSequence.indexOf(lead.stage);
    if (currentIndex > 0) {
      const prevStage = stageSequence[currentIndex - 1];
      handleUpdateStage(lead.id, prevStage);
    }
  };

  // Quick Activity Save
  const handleSaveQuickActivity = () => {
    if (!quickActivityLead || !quickActivityDesc.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const newActivity: LeadActivity = {
      id: 'act-' + Date.now(),
      type: quickActivityType,
      description: quickActivityDesc.trim(),
      date: new Date().toISOString(),
      author: quickActivityAuthor
    };

    const updatedLeads = leads.map(l => {
      if (l.id === quickActivityLead.id) {
        return {
          ...l,
          lastContactDate: today,
          activities: [newActivity, ...(l.activities || [])]
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
    setQuickActivityLead(null);
    setQuickActivityDesc('');
  };

  // Bulk actions for Table view
  const handleToggleSelectLead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleApplyBulkStage = () => {
    if (selectedLeadIds.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedLeads = leads.map(l => {
      if (selectedLeadIds.includes(l.id)) {
        return {
          ...l,
          stage: bulkTargetStage,
          stageUpdatedAt: today,
          lastContactDate: today
        };
      }
      return l;
    });
    onUpdateLeads(updatedLeads);
    setBulkStageModal(false);
    setSelectedLeadIds([]);
  };

  const handleApplyBulkFollowUp = () => {
    if (selectedLeadIds.length === 0 || !bulkFollowUpDate) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedLeads = leads.map(l => {
      if (selectedLeadIds.includes(l.id)) {
        const newAct: LeadActivity = {
          id: 'act-' + Date.now() + '-' + l.id,
          type: 'note',
          description: `⏰ Follow-up agendado em lote para ${bulkFollowUpDate.split('-').reverse().join('/')}`,
          date: new Date().toISOString(),
          author: 'Consultor Comercial',
          nextFollowUpDate: bulkFollowUpDate
        };
        return {
          ...l,
          nextFollowUpDate: bulkFollowUpDate,
          activities: [newAct, ...(l.activities || [])]
        };
      }
      return l;
    });
    onUpdateLeads(updatedLeads);
    setBulkFollowUpModal(false);
    setBulkFollowUpDate('');
    setSelectedLeadIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir os ${selectedLeadIds.length} leads selecionados?`)) {
      const updatedLeads = leads.filter(l => !selectedLeadIds.includes(l.id));
      onUpdateLeads(updatedLeads);
      setSelectedLeadIds([]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setComissaoFilter('all');
    setScoreFilter('all');
    setFollowUpFilter('all');
    setSortOrder('score_desc');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all' || comissaoFilter !== 'all' || scoreFilter !== 'all' || followUpFilter !== 'all';

  // Loss Reason Analytics Data
  const lossReasonChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    LOSS_REASONS.forEach(r => { counts[r.id] = 0; });
    lostLeads.forEach(l => {
      const rId = l.lossReason || 'outro';
      counts[rId] = (counts[rId] || 0) + 1;
    });

    return LOSS_REASONS.map(r => ({
      name: r.label,
      icon: r.icon,
      count: counts[r.id] || 0
    })).filter(item => item.count > 0);
  }, [lostLeads]);

  const LOSS_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#64748b', '#ec4899', '#3b82f6'];

  // Funnel Stages Analytics Data
  const funnelChartData = React.useMemo(() => {
    const stageDefs = [
      { id: 'prospecting', label: 'Prospecção', color: '#64748b', lightBg: 'bg-slate-100 text-slate-800' },
      { id: 'contacted', label: '1º Contato', color: '#3b82f6', lightBg: 'bg-blue-100 text-blue-800' },
      { id: 'proposal_sent', label: 'Proposta Enviada', color: '#8b5cf6', lightBg: 'bg-purple-100 text-purple-800' },
      { id: 'negotiation', label: 'Negociação', color: '#f59e0b', lightBg: 'bg-amber-100 text-amber-800' },
      { id: 'won', label: 'Contrato Ganho', color: '#10b981', lightBg: 'bg-emerald-100 text-emerald-800' },
      { id: 'lost', label: 'Perdido', color: '#ef4444', lightBg: 'bg-rose-100 text-rose-800' }
    ];

    const totalLeadsCount = leads.length || 1;
    const totalLeadsValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) || 1;

    return stageDefs.map((stg) => {
      const stageLeads = leads.filter(l => l.stage === stg.id);
      const count = stageLeads.length;
      const totalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
      const avgTicket = count > 0 ? Math.round(totalValue / count) : 0;
      const countPercentage = Number(((count / totalLeadsCount) * 100).toFixed(1));
      const valuePercentage = Number(((totalValue / totalLeadsValue) * 100).toFixed(1));

      return {
        id: stg.id,
        name: stg.label,
        count,
        value: totalValue,
        avgTicket,
        countPercentage,
        valuePercentage,
        color: stg.color,
        lightBg: stg.lightBg,
        leads: stageLeads
      };
    });
  }, [leads]);

  // Stage-to-Stage Funnel Flow Data (Sequential stages for conversion analysis)
  const funnelFlowData = React.useMemo(() => {
    const sequentialStageIds: Lead['stage'][] = ['prospecting', 'contacted', 'proposal_sent', 'negotiation', 'won'];
    const totalLeadsCount = leads.length || 1;

    return sequentialStageIds.map((stageId, idx) => {
      const stg = stages.find(s => s.id === stageId);
      const stageLeads = leads.filter(l => l.stage === stageId);
      const count = stageLeads.length;
      const totalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
      const pctOfTotal = Number(((count / totalLeadsCount) * 100).toFixed(1));

      // Calculate drop-off or conversion vs previous
      const prevStageCount = idx > 0 ? leads.filter(l => l.stage === sequentialStageIds[idx - 1]).length : count;
      const stepRatio = prevStageCount > 0 ? Number(((count / prevStageCount) * 100).toFixed(0)) : 100;

      return {
        stageId,
        label: stg ? stg.label : stageId,
        count,
        totalValue,
        pctOfTotal,
        stepRatio,
        color: stageId === 'won' ? '#10b981' : stageId === 'negotiation' ? '#f59e0b' : stageId === 'proposal_sent' ? '#8b5cf6' : stageId === 'contacted' ? '#3b82f6' : '#64748b'
      };
    });
  }, [leads, stages]);

  // Monthly Conversion & Timeline Chart Data
  const monthlyConversionChartData = React.useMemo(() => {
    const monthMap = new Map<string, {
      monthKey: string;
      label: string;
      totalLeads: number;
      wonLeads: number;
      lostLeads: number;
      inProgressLeads: number;
      wonValue: number;
      totalValue: number;
    }>();

    const now = new Date();
    const monthsBack = conversionTimeframe === '12months' ? 12 : 6;
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      const label = `${monthNames[d.getMonth()]}/${String(year).slice(2)}`;

      monthMap.set(key, {
        monthKey: key,
        label,
        totalLeads: 0,
        wonLeads: 0,
        lostLeads: 0,
        inProgressLeads: 0,
        wonValue: 0,
        totalValue: 0
      });
    }

    // Populate data from real leads
    leads.forEach(l => {
      const dateStr = l.createdAt || l.stageUpdatedAt || l.lastContactDate || new Date().toISOString();
      const key = dateStr.slice(0, 7);

      let entry = monthMap.get(key);
      if (!entry) {
        const [y, m] = key.split('-');
        if (y && m) {
          const mIndex = parseInt(m, 10) - 1;
          if (mIndex >= 0 && mIndex < 12) {
            entry = {
              monthKey: key,
              label: `${monthNames[mIndex]}/${y.slice(2)}`,
              totalLeads: 0,
              wonLeads: 0,
              lostLeads: 0,
              inProgressLeads: 0,
              wonValue: 0,
              totalValue: 0
            };
            monthMap.set(key, entry);
          }
        }
      }

      if (entry) {
        entry.totalLeads += 1;
        entry.totalValue += (l.estimatedValue || 0);
        if (l.stage === 'won') {
          entry.wonLeads += 1;
          entry.wonValue += (l.estimatedValue || 0);
        } else if (l.stage === 'lost') {
          entry.lostLeads += 1;
        } else {
          entry.inProgressLeads += 1;
        }
      }
    });

    const result = Array.from(monthMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    return result.map(m => {
      const rate = m.totalLeads > 0 ? Number(((m.wonLeads / m.totalLeads) * 100).toFixed(1)) : 0;
      return {
        ...m,
        conversionRate: rate
      };
    });
  }, [leads, conversionTimeframe]);

  // Overall Conversion KPIs
  const proposalLeadsCount = leads.filter(l => l.stage === 'proposal_sent' || l.stage === 'negotiation' || l.stage === 'won').length;
  const proposalToWonEfficiency = proposalLeadsCount > 0 ? ((wonCount / proposalLeadsCount) * 100).toFixed(1) : '0.0';

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchInst = lead.institution.toLowerCase().includes(q);
      const matchContact = (lead.contactName || '').toLowerCase().includes(q);
      const matchPhone = (lead.contactPhone || '').includes(q);
      if (!matchName && !matchInst && !matchContact && !matchPhone) return false;
    }

    // Status Filter
    if (statusFilter !== 'all' && lead.stage !== statusFilter) return false;

    // Type Filter
    if (typeFilter !== 'all' && (lead.contractType || 'turma') !== typeFilter) return false;

    // Comissao Filter
    if (comissaoFilter !== 'all') {
      if (comissaoFilter === 'comissao' && lead.isComissao === false) return false;
      if (comissaoFilter === 'formando' && lead.isComissao !== false) return false;
    }

    // Score Filter
    if (scoreFilter !== 'all') {
      const sc = scoredLeadsMap.get(lead.id);
      if (sc && sc.level !== scoreFilter) return false;
    }

    // Follow-up & Stagnancy Filter
    if (followUpFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      if (followUpFilter === 'stagnant') {
        if (!isLeadStagnant(lead, 7)) return false;
      } else {
        if (!lead.nextFollowUpDate) return false;
        if (followUpFilter === 'overdue' && lead.nextFollowUpDate >= today) return false;
        if (followUpFilter === 'today' && lead.nextFollowUpDate !== today) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }
    if (sortOrder === 'value_desc') {
      return (b.estimatedValue || 0) - (a.estimatedValue || 0);
    }
    if (sortOrder === 'score_desc') {
      const scA = scoredLeadsMap.get(a.id)?.score || 0;
      const scB = scoredLeadsMap.get(b.id)?.score || 0;
      return scB - scA;
    }
    if (sortOrder === 'followup_asc') {
      const fA = a.nextFollowUpDate || '9999-99-99';
      const fB = b.nextFollowUpDate || '9999-99-99';
      return fA.localeCompare(fB);
    }
    if (sortOrder === 'stagnant_desc') {
      const daysA = getLeadDaysInStage(a);
      const daysB = getLeadDaysInStage(b);
      return daysB - daysA;
    }
    return 0;
  });

  return (
    <div className="space-y-4" id="crm-manager-container">
      {/* Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3 pb-1 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Vendas & Gestão Comercial
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Funil de oportunidades, previsão de vendas e acompanhamento de propostas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLossAnalytics(!showLossAnalytics)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showLossAnalytics 
                ? 'bg-[#543d03] text-[#ebe0b2] border-[#543d03]'
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5 text-neutral-500" />
            Motivos de Perda {lostCount > 0 && `(${lostCount})`}
          </button>

          <button
            onClick={onExportCSV}
            className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Exportar planilha CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" /> Exportar CSV
          </button>

          <button
            onClick={onOpenNewLeadModal}
            className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer border-none transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Oportunidade
          </button>
        </div>
      </div>

      {/* KPI Cards Row - Clean White Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-[#f8f6f4] p-2.5 rounded-xl border border-[#ebe5dc]">
        {/* Pipeline Total */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Pipeline Ativo</span>
          <div className="text-base font-black text-neutral-900 mt-0.5">
            {totalPipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">{activePipelineLeads.length} oportunidades</span>
        </div>

        {/* Forecast Ponderado */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Forecast Ponderado</span>
          <div className="text-base font-black text-[#aa904f] mt-0.5">
            {weightedPipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Previsão por probabilidade</span>
        </div>

        {/* Contratos Fechados */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Ganhos ({wonCount})</span>
          <div className="text-base font-black text-emerald-600 mt-0.5">
            {wonValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Conversão: {conversionRate.toFixed(1)}%</span>
        </div>

        {/* Tíquete Médio */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Tíquete Médio</span>
          <div className="text-base font-black text-neutral-900 mt-0.5">
            {averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Média por lead</span>
        </div>

        {/* Follow-ups Pendentes */}
        <div className={`p-3.5 rounded-xl border transition-all shadow-2xs bg-white ${
          overdueLeads.length > 0
            ? 'border-rose-300'
            : 'border-neutral-200/90'
        }`}>
          <span className="text-[11px] font-semibold text-neutral-500 block">Follow-ups</span>
          <div className={`text-base font-black mt-0.5 ${overdueLeads.length > 0 ? 'text-rose-600' : 'text-neutral-900'}`}>
            {overdueLeads.length} Atrasado(s)
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">{todayLeads.length} agendado(s) hoje</span>
        </div>

        {/* Leads Parados > 7 Dias (Alerta Automático) */}
        <div 
          onClick={() => setFollowUpFilter(followUpFilter === 'stagnant' ? 'all' : 'stagnant')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs bg-white ${
            stagnantCount > 0
              ? followUpFilter === 'stagnant'
                ? 'border-amber-500 ring-2 ring-amber-400/30'
                : 'border-amber-300 hover:border-amber-400'
              : 'border-neutral-200/90'
          }`}
          title="Clique para filtrar apenas leads parados há mais de 7 dias"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 block">Parados &gt; 7d</span>
            {stagnantCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
          </div>
          <div className={`text-base font-black mt-0.5 ${stagnantCount > 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
            {stagnantCount} {stagnantCount === 1 ? 'Turma' : 'Turmas'}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
            {stagnantValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} em risco
          </span>
        </div>
      </div>

      {/* Dynamic Stagnant Leads Alert Banner */}
      {stagnantCount > 0 && showStagnantBanner && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 flex-wrap">
                  <span>Alerta Comercial: {stagnantCount} {stagnantCount === 1 ? 'oportunidade parada' : 'oportunidades paradas'} no funil há mais de 7 dias</span>
                  <span className="bg-amber-200/80 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                    {stagnantValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} estagnado
                  </span>
                </h4>
                <p className="text-[11px] text-amber-700">
                  Estes potenciais contratos não tiveram avanço de etapa comercial há mais de 7 dias. Clique para reativar via WhatsApp ou atualizar a etapa.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFollowUpFilter(followUpFilter === 'stagnant' ? 'all' : 'stagnant')}
                className="text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer transition-colors"
              >
                {followUpFilter === 'stagnant' ? 'Exibir Todos os Leads' : 'Filtrar Somente Parados'}
              </button>
              <button
                type="button"
                onClick={() => setShowStagnantBanner(false)}
                className="text-amber-600 hover:text-amber-800 text-xs font-bold px-1.5 py-0.5 cursor-pointer"
                title="Ocultar banner"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Stagnant Lead Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 border-t border-amber-200/70">
            {stagnantAlerts.slice(0, 3).map(alert => (
              <div key={alert.lead.id} className="bg-white border border-amber-200 rounded-lg p-2.5 flex flex-col justify-between text-xs space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-start gap-1">
                  <span className="font-bold text-neutral-900 truncate max-w-[170px]" title={alert.lead.name}>
                    {alert.lead.name}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                    alert.urgency === 'critical' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {alert.daysInStage} dias parados
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Etapa: <strong className="text-neutral-700">{alert.stageLabel}</strong> • {alert.lead.contactName || 'Sem contato'}
                </p>
                <div className="text-[10px] bg-amber-50 p-1.5 rounded text-amber-800 line-clamp-1 italic border border-amber-100">
                  💡 {alert.recommendedAction}
                </div>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenLeadDetails(alert.lead)}
                    className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                  {alert.lead.contactPhone && (
                    <button
                      type="button"
                      onClick={() => handleOpenQuickWhatsApp(alert.lead, 'stale_reactivate')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer border-none shadow-2xs"
                    >
                      <MessageSquare className="w-2.5 h-2.5" /> Reativar WhatsApp
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loss Analytics Panel (Collapsible) */}
      <AnimatePresence>
        {showLossAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3 overflow-hidden"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-neutral-500" />
                <h4 className="text-xs font-bold text-neutral-800">
                  Diagnóstico de Perdas ({lostCount} descartados)
                </h4>
              </div>
              <button
                onClick={() => setShowLossAnalytics(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-medium cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            {lostCount === 0 ? (
              <div className="text-center py-4 text-neutral-400 text-xs italic">
                Nenhum lead marcado como "Perdido" até o momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={lossReasonChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {lossReasonChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={LOSS_COLORS[index % LOSS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val} lead(s)`, name]}
                        contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {lossReasonChartData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-neutral-50 px-2.5 py-1.5 rounded-md text-xs border border-neutral-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LOSS_COLORS[idx % LOSS_COLORS.length] }}></span>
                        <span className="text-neutral-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-neutral-900">
                        {item.count} ({Math.round((item.count / lostCount) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar - Clean White Container */}
      <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-2xs space-y-2.5 text-xs text-neutral-700 w-full">
        {/* Top: Search + View Modes */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por turma, instituição, curso ou contato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 focus:border-[#aa904f] pl-9 pr-8 py-1.5 rounded-lg w-full outline-none text-neutral-900 placeholder-neutral-400 text-xs transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg shrink-0 w-full md:w-auto justify-center border border-neutral-200/60">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'kanban'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'timeline'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Linha do Tempo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('charts')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'charts'
                  ? 'bg-white text-[#aa904f] shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Gráficos & Funil
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 pt-2 border-t border-neutral-100 w-full items-center">
          {/* Status de Follow-up / Estagnação */}
          <select
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none font-semibold cursor-pointer text-xs w-full shadow-2xs"
          >
            <option value="all">Todos os Status</option>
            <option value="stagnant">⚠️ Parados &gt; 7d ({stagnantCount})</option>
            <option value="overdue">⏰ Atrasados ({overdueLeads.length})</option>
            <option value="today">📅 Agendados Hoje ({todayLeads.length})</option>
          </select>

          {/* Etapa */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none font-medium cursor-pointer text-xs w-full shadow-2xs"
          >
            <option value="all">Todas as Etapas</option>
            {stages.map(stg => (
              <option key={stg.id} value={stg.id}>{stg.label}</option>
            ))}
          </select>

          {/* Lead Scoring */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none font-medium cursor-pointer text-xs w-full shadow-2xs"
          >
            <option value="all">Todos os Scores</option>
            <option value="vip">VIP (75+)</option>
            <option value="hot">Quente (55+)</option>
            <option value="warm">Morno (35+)</option>
            <option value="cold">Frio (&lt;35)</option>
          </select>

          {/* Tipo de Contrato */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none font-medium cursor-pointer text-xs w-full shadow-2xs"
          >
            <option value="all">Todos os Tipos</option>
            <option value="turma">Turma de Formatura</option>
            <option value="individual">Cliente Individual</option>
          </select>

          {/* Vínculo */}
          <select
            value={comissaoFilter}
            onChange={(e) => setComissaoFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none font-medium cursor-pointer text-xs w-full shadow-2xs"
          >
            <option value="all">Todos os Vínculos</option>
            <option value="comissao">Membro da Comissão</option>
            <option value="formando">Apenas Formando</option>
          </select>

          {/* Ordem */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-lg outline-none font-medium cursor-pointer text-xs w-full shadow-2xs"
          >
            <option value="score_desc">Prioridade (Score)</option>
            <option value="stagnant_desc">⚠️ Mais Tempo Parado (+7d)</option>
            <option value="value_desc">Maior Valor</option>
            <option value="newest">Mais Recentes</option>
            <option value="followup_asc">Próximo Follow-up</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px]">
            <span className="text-neutral-500 font-medium">
              Filtro ativo: exibindo <strong>{filteredLeads.length}</strong> de <strong>{leads.length}</strong> oportunidades
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Visual Pipeline Funnel Navigation Ribbon */}
      <div className="bg-white border border-neutral-200 rounded-xl p-2.5 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((stg, idx) => {
            const stgLeads = leads.filter(l => l.stage === stg.id);
            const stgSumValue = stgLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
            const stgPercentage = totalLeadsCount > 0 ? Math.round((stgLeads.length / totalLeadsCount) * 100) : 0;
            const isSelected = statusFilter === stg.id;

            return (
              <div
                key={stg.id}
                onClick={() => setStatusFilter(statusFilter === stg.id ? 'all' : stg.id)}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#fcfaf7] border-[#aa904f] ring-2 ring-[#aa904f]/30 shadow-xs'
                    : 'bg-neutral-50/70 hover:bg-neutral-100/80 border-neutral-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${stg.dotColor} shrink-0`}></span>
                    <span className="text-[11px] font-bold text-neutral-800 truncate" title={stg.label}>
                      {stg.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-white border border-neutral-200/70 px-1.5 py-0.2 rounded text-neutral-700 shrink-0">
                    {stgLeads.length}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-1 mt-0.5">
                  <span className="text-[11px] font-black text-neutral-900">
                    {stgSumValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[9px] text-neutral-400 font-bold">
                    {stgPercentage}%
                  </span>
                </div>

                {/* Micro Progress Line */}
                <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full ${stg.dotColor}`}
                    style={{ width: `${Math.min(100, Math.max(8, stgPercentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main View: Kanban */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory min-h-[500px] no-scrollbar">
          {stages.map(col => {
            const colLeads = filteredLeads.filter(l => l.stage === col.id);
            const colSumValue = colLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
            const isTargetCol = dragOverStage === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(col.id);
                }}
                onDragLeave={() => {
                  if (dragOverStage === col.id) setDragOverStage(null);
                }}
                onDrop={() => {
                  if (draggedLeadId) {
                    handleUpdateStage(draggedLeadId, col.id);
                    setDraggedLeadId(null);
                    setDragOverStage(null);
                  }
                }}
                className={`w-72 shrink-0 rounded-xl border border-neutral-200/90 bg-[#f8f9fa] flex flex-col snap-start overflow-hidden transition-all shadow-2xs ${
                  isTargetCol ? 'ring-2 ring-[#aa904f]' : ''
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-neutral-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                    <h4 className="text-xs font-bold text-neutral-800 truncate">
                      {col.label}
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-medium">({colLeads.length})</span>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-900">
                    {colSumValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[520px] no-scrollbar">
                  {colLeads.length === 0 ? (
                    <div className="h-28 border border-neutral-200 rounded-lg flex items-center justify-center text-center p-3 bg-white/70 shadow-2xs">
                      <span className="text-[11px] text-neutral-400 font-medium">Nenhum lead nesta etapa</span>
                    </div>
                  ) : (
                    colLeads.map(lead => {
                      const alreadyHasTurma = turmas.some(t => t.name.toLowerCase() === lead.name.toLowerCase());
                      const scoreInfo = scoredLeadsMap.get(lead.id) || calculateLeadScore(lead);
                      const followUpInfo = checkFollowUpStatus(lead.nextFollowUpDate);

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={() => setDraggedLeadId(lead.id)}
                          onClick={() => onOpenLeadDetails(lead)}
                          className="bg-white hover:bg-neutral-50/80 border border-neutral-200/90 hover:border-neutral-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer relative group space-y-2"
                        >
                          {/* Top Row: Title + Score Badge + Permanent Actions */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <h5 className="font-bold text-neutral-900 text-xs leading-snug truncate hover:text-[#aa904f]">
                                {lead.name}
                              </h5>
                              <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
                                <span>{lead.institution}</span>
                                {lead.contractType === 'individual' && <span className="text-neutral-400 font-normal">• Individual</span>}
                              </div>
                            </div>

                            {/* Score & Actions */}
                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <span 
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${scoreInfo.badgeBg} ${scoreInfo.badgeColor} ${scoreInfo.badgeBorder}`}
                                title={`Lead Score: ${scoreInfo.score}/100`}
                              >
                                <span>{scoreInfo.score} pts</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => onOpenEditLeadModal(lead)}
                                className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer border-none bg-transparent transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteLead(lead.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer border-none bg-transparent transition-colors"
                                title="Excluir Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Estimates & Info */}
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-neutral-100">
                            <span className="text-[11px] text-neutral-500 font-medium">
                              {lead.estimatedStudents || 0} alunos
                            </span>
                            <span className="font-black text-neutral-900">
                              {(lead.estimatedValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </span>
                          </div>

                          {/* Contact Info & Follow-up */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-500">
                            <span className="truncate max-w-[140px]">
                              {lead.contactName || 'Sem contato'}
                            </span>
                            {lead.nextFollowUpDate && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${followUpInfo.badgeClass}`}>
                                {followUpInfo.label}
                              </span>
                            )}
                          </div>

                          {/* Stagnant Warning Chip */}
                          {isLeadStagnant(lead, 7) && (
                            <div className={`flex items-center justify-between gap-1 text-[10px] font-bold px-2 py-1 rounded border ${
                              getLeadDaysInStage(lead) >= 14
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{getLeadDaysInStage(lead)}d sem avançar</span>
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                {getLeadDaysInStage(lead) >= 14 ? 'Crítico' : 'Alerta'}
                              </span>
                            </div>
                          )}

                          {/* Stage Fast Switcher (< / >) & Quick Actions */}
                          <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between gap-1.5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1 flex-wrap">
                              {/* Backward Stage */}
                              {stageSequence.indexOf(lead.stage) > 0 && lead.stage !== 'lost' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRetrocedeStage(lead, e)}
                                  className="p-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-[10px] cursor-pointer border border-neutral-200/60"
                                  title="Voltar para etapa anterior"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}

                              {/* Forward Stage */}
                              {stageSequence.indexOf(lead.stage) >= 0 && stageSequence.indexOf(lead.stage) < stageSequence.length - 1 && lead.stage !== 'lost' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleAdvanceStage(lead, e)}
                                  className="p-1 bg-neutral-100 hover:bg-[#aa904f]/20 hover:text-[#aa904f] text-neutral-600 rounded text-[10px] cursor-pointer border border-neutral-200/60 font-bold flex items-center gap-0.5"
                                  title="Avançar para próxima etapa"
                                >
                                  <span className="text-[9px]">Avançar</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}

                              {/* Log Activity */}
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickActivityLead(lead);
                                  setQuickActivityDesc('');
                                }}
                                className="px-1.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer border border-neutral-200/60"
                                title="Registrar atividade rápida (ligação, reunião, nota)"
                              >
                                <Activity className="w-3 h-3 text-[#aa904f]" />
                              </button>

                              {lead.contactPhone && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickWhatsApp(lead, lead.stage === 'proposal_sent' ? 'proposal' : 'welcome')}
                                  className="px-1.5 py-1 bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer border border-neutral-200/60"
                                  title="Disparo WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setQuickFollowUpLead(lead);
                                  setQuickFollowUpDate(lead.nextFollowUpDate || new Date().toISOString().split('T')[0]);
                                }}
                                className="px-1.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer border border-neutral-200/60"
                                title="Agendar retorno"
                              >
                                <Clock className="w-3 h-3 text-neutral-500" />
                              </button>
                            </div>

                            {col.id === 'won' && !alreadyHasTurma && (
                              <button
                                type="button"
                                onClick={() => onConvertLeadToTurma(lead)}
                                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-0.5 rounded transition-all cursor-pointer border-none flex items-center gap-1 shrink-0"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" /> Converter
                              </button>
                            )}

                            {col.id === 'won' && alreadyHasTurma && (
                              <span className="text-[9px] text-emerald-600 font-semibold shrink-0">
                                ✓ Turma Ativa
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-3">
          {/* Floating Bulk Actions Bar */}
          {selectedLeadIds.length > 0 && (
            <div className="bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#aa904f] text-white text-xs font-black px-2 py-0.5 rounded-md">
                  {selectedLeadIds.length}
                </span>
                <span className="text-xs font-semibold text-neutral-200">
                  {selectedLeadIds.length === 1 ? 'lead selecionado' : 'leads selecionados'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setBulkStageModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border border-white/20 transition-all"
                >
                  <Tag className="w-3.5 h-3.5 text-[#aa904f]" /> Mudar Etapa
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkFollowUpDate(new Date().toISOString().split('T')[0]);
                    setBulkFollowUpModal(true);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border border-white/20 transition-all"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Agendar Follow-up
                </button>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border-none transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir ({selectedLeadIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLeadIds([])}
                  className="text-xs text-neutral-400 hover:text-white px-2 py-1 cursor-pointer border-none bg-transparent"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden text-neutral-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-black uppercase text-neutral-500 tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded border-neutral-300 text-[#aa904f] focus:ring-[#aa904f] cursor-pointer"
                        title="Selecionar Todos"
                      />
                    </th>
                    <th className="py-3 px-4">Nome do Lead / Turma</th>
                    <th className="py-3 px-4">Instituição</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Alunos Est.</th>
                    <th className="py-3 px-4 text-right">Valor Est.</th>
                    <th className="py-3 px-4">Etapa</th>
                    <th className="py-3 px-4">Próximo Follow-up</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-neutral-400 italic">
                        Nenhum lead encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map(lead => {
                      const stg = stages.find(s => s.id === lead.stage) || stages[0];
                      const scoreInfo = scoredLeadsMap.get(lead.id) || calculateLeadScore(lead);
                      const followUpInfo = checkFollowUpStatus(lead.nextFollowUpDate);
                      const isSelected = selectedLeadIds.includes(lead.id);

                      return (
                        <tr 
                          key={lead.id} 
                          className={`hover:bg-neutral-50/80 transition-colors ${
                            isSelected ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectLead(lead.id)}
                              className="rounded border-neutral-300 text-[#aa904f] focus:ring-[#aa904f] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-900">
                            <span 
                              className="hover:text-[#aa904f] transition-colors cursor-pointer block"
                              onClick={() => onOpenLeadDetails(lead)}
                            >
                              {lead.name}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-normal block">
                              {lead.contactName || 'Sem contato'} {lead.contactPhone ? `• ${lead.contactPhone}` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-neutral-700">
                            {lead.institution}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded border ${scoreInfo.badgeBg} ${scoreInfo.badgeColor} ${scoreInfo.badgeBorder}`}>
                              {scoreInfo.icon} {scoreInfo.score}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-neutral-800">
                            {lead.estimatedStudents || 0}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-neutral-900">
                            {(lead.estimatedValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                                <span className={`w-1.5 h-1.5 rounded-full ${stg.dotColor}`}></span>
                                {stg.label}
                              </span>
                              {isLeadStagnant(lead, 7) && (
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border block w-fit ${
                                  getLeadDaysInStage(lead) >= 14
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  <Clock className="w-2.5 h-2.5" />
                                  {getLeadDaysInStage(lead)}d parado
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {lead.nextFollowUpDate ? (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${followUpInfo.badgeClass}`}>
                                {followUpInfo.label}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[10px]">---</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Activity Button */}
                              <button
                                onClick={() => {
                                  setQuickActivityLead(lead);
                                  setQuickActivityDesc('');
                                }}
                                className="p-1 text-neutral-600 hover:text-[#aa904f] bg-neutral-100 hover:bg-neutral-200 rounded cursor-pointer border-none"
                                title="Registrar Atividade"
                              >
                                <Activity className="w-3.5 h-3.5 text-[#aa904f]" />
                              </button>

                              {lead.contactPhone && (
                                <button
                                  onClick={() => handleOpenQuickWhatsApp(lead)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer border-none"
                                  title="WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onOpenLeadDetails(lead)}
                                className="p-1 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded font-bold px-2 py-1 cursor-pointer border-none text-[10px]"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => onOpenEditLeadModal(lead)}
                                className="p-1 text-neutral-600 hover:text-[#aa904f] bg-neutral-100 hover:bg-neutral-200 rounded cursor-pointer border-none"
                                title="Editar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteLead(lead.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 rounded cursor-pointer border-none"
                                title="Excluir"
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
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-2xs flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#aa904f] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                  Linha do Tempo Comercial
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  Acompanhamento cronológico das oportunidades, contatos e interações registradas
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
              {filteredLeads.length} oportunidades
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#aa904f] before:to-transparent">
            {filteredLeads.map(lead => {
              const stg = stages.find(s => s.id === lead.stage) || stages[0];
              const scoreInfo = scoredLeadsMap.get(lead.id) || calculateLeadScore(lead);

              return (
                <div key={lead.id} className="relative group">
                  <div className={`absolute -left-[27px] sm:-left-[31px] top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${stg.dotColor}`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2 pb-2 border-b border-neutral-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900 hover:text-[#aa904f] cursor-pointer" onClick={() => onOpenLeadDetails(lead)}>
                          {lead.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                          <span className={`w-1.5 h-1.5 rounded-full ${stg.dotColor}`}></span>
                          {stg.label}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${scoreInfo.badgeBg} ${scoreInfo.badgeColor} ${scoreInfo.badgeBorder}`}>
                          {scoreInfo.score} pts
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenLeadDetails(lead)}
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded cursor-pointer border-none shadow-2xs"
                        >
                          Ficha Completa
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] uppercase text-neutral-400 block font-semibold">Instituição</span>
                        <span className="font-bold text-neutral-800">{lead.institution}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-neutral-400 block font-semibold">Valor Estimado</span>
                        <span className="font-black text-neutral-900">
                          {(lead.estimatedValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-neutral-400 block font-semibold">Contato Principal</span>
                        <span className="font-bold text-neutral-800">{lead.contactName || '---'} {lead.contactPhone ? `(${lead.contactPhone})` : ''}</span>
                      </div>
                    </div>

                    {lead.activities && lead.activities.length > 0 && (
                      <div className="bg-neutral-50 p-2.5 rounded-xl space-y-1.5 text-xs border border-neutral-200">
                        <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">
                          Últimas Atividades ({lead.activities.length}):
                        </span>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {lead.activities.slice(0, 3).map(act => (
                            <div key={act.id} className="bg-white p-1.5 rounded border border-neutral-200 text-[11px] flex justify-between shadow-2xs">
                              <span className="text-neutral-800 font-medium">{act.description}</span>
                              <span className="text-[9.5px] text-neutral-400 shrink-0 ml-2">
                                {act.date ? new Date(act.date).toLocaleDateString('pt-BR') : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHARTS & SALES FUNNEL ANALYTICS VIEW */}
      {viewMode === 'charts' && (
        <div className="space-y-4">
          {/* Top Performance Analytics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Conversion Rate Card */}
            <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Taxa Global de Conversão
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  {leads.length > 0 ? ((wonCount / leads.length) * 100).toFixed(1) : '0.0'}%
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  ({wonCount} de {leads.length} leads)
                </span>
              </div>
              <div className="mt-2.5 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${leads.length > 0 ? Math.min(100, (wonCount / leads.length) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Proposal to Won Efficiency */}
            <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Conversão de Propostas
                </span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600">
                  {proposalToWonEfficiency}%
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  ({wonCount} ganhos de {proposalLeadsCount} propostas)
                </span>
              </div>
              <div className="mt-2.5 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Number(proposalToWonEfficiency))}%` }}
                />
              </div>
            </div>

            {/* Total Won Value */}
            <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Volume Total Fechado
                </span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-neutral-900">
                  {leads
                    .filter(l => l.stage === 'won')
                    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block mt-2 font-medium">
                Ponderado pipeline: {weightedPipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Average Won Ticket */}
            <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Ticket Médio por Contrato
                </span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-neutral-900">
                  {(wonCount > 0 
                    ? Math.round(leads.filter(l => l.stage === 'won').reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / wonCount) 
                    : 0
                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block mt-2 font-medium">
                Média das {wonCount} turmas/contratos fechados
              </span>
            </div>
          </div>

          {/* Gráfico 1: Funil de Vendas Visual (Leads por Estágio & Volume) */}
          <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#aa904f]" />
                  Funil de Vendas Comercial (Distribuição por Estágio)
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Visualização da contagem de oportunidades ativas e o volume financeiro acumulado em cada etapa
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg shrink-0 border border-neutral-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFunnelMetric('count')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${
                    funnelMetric === 'count'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Qtd de Leads
                </button>
                <button
                  type="button"
                  onClick={() => setFunnelMetric('value')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${
                    funnelMetric === 'value'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Volume em R$
                </button>
              </div>
            </div>

            {/* Recharts Bar Visualization */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#888" />
                  <XAxis
                    dataKey="name"
                    stroke="#666"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (funnelMetric === 'value') {
                        return val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`;
                      }
                      return val.toString();
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-lg text-xs space-y-1.5 z-50">
                            <div className="flex items-center gap-2 font-bold text-neutral-900 border-b border-neutral-100 pb-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              <span>{data.name}</span>
                            </div>
                            <div className="space-y-1 text-neutral-600 text-[11px]">
                              <div className="flex justify-between gap-4">
                                <span className="text-neutral-500">Contagem de Leads:</span>
                                <span className="font-bold text-neutral-900">{data.count} ({data.countPercentage}% do funil)</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-neutral-500">Volume Total:</span>
                                <span className="font-bold text-neutral-900">
                                  {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-neutral-500">Ticket Médio:</span>
                                <span className="font-bold text-neutral-900">
                                  {data.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={funnelMetric === 'count' ? 'count' : 'value'}
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  >
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Visual Step-by-Step Funnel Progression Flow */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block mb-2.5">
                Fluxo de Conversão Sequencial entre Etapas:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {funnelFlowData.map((step, idx) => (
                  <div 
                    key={step.stageId} 
                    className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-bold text-neutral-800 truncate">
                        {step.label}
                      </span>
                      {idx > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                          {step.stepRatio}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-base font-black text-neutral-900">
                        {step.count} <span className="text-[10px] font-normal text-neutral-500">leads</span>
                      </span>
                      <span className="text-[10px] font-bold text-neutral-500">
                        {step.pctOfTotal}% do total
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block truncate mt-0.5">
                      {step.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${step.pctOfTotal}%`, backgroundColor: step.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráfico 2: Taxa de Conversão Mensal & Evolução Comercial (Recharts ComposedChart) */}
          <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Evolução da Taxa de Conversão Mensal & Novos Leads
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Acompanhamento da taxa percentual de conversão mensal em relação ao volume de oportunidades criadas
                </p>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg shrink-0 border border-neutral-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setConversionTimeframe('6months')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${
                    conversionTimeframe === '6months'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Últimos 6 Meses
                </button>
                <button
                  type="button"
                  onClick={() => setConversionTimeframe('12months')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${
                    conversionTimeframe === '12months'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Últimos 12 Meses
                </button>
              </div>
            </div>

            {/* Recharts Composed Chart: Leads (Bars) + Conversion Rate (Line) */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyConversionChartData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorTotalLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#aa904f" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#aa904f" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorWonLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#888" />
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                  />
                  {/* Left Axis: Leads Count */}
                  <YAxis
                    yAxisId="left"
                    stroke="#666"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  {/* Right Axis: Conversion Rate % */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    fontSize={11}
                    fontWeight={700}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-xl text-xs space-y-2 z-50">
                            <div className="font-bold text-neutral-900 border-b border-neutral-100 pb-1 flex justify-between gap-4">
                              <span>Mês: {label}</span>
                              <span className="text-emerald-600 font-extrabold">{data.conversionRate}% conversão</span>
                            </div>
                            <div className="space-y-1 text-neutral-600 text-[11px]">
                              <div className="flex justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-neutral-500">
                                  <span className="w-2 h-2 rounded-sm bg-[#aa904f]" /> Total de Leads Criados:
                                </span>
                                <span className="font-bold text-neutral-900">{data.totalLeads}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-neutral-500">
                                  <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Contratos Ganhos:
                                </span>
                                <span className="font-bold text-emerald-600">{data.wonLeads}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-neutral-500">
                                  <span className="w-2 h-2 rounded-sm bg-rose-500" /> Perdidos:
                                </span>
                                <span className="font-bold text-rose-500">{data.lostLeads}</span>
                              </div>
                              <div className="flex justify-between gap-4 pt-1 border-t border-neutral-100">
                                <span className="text-neutral-500">Volume Convertido:</span>
                                <span className="font-bold text-emerald-600">
                                  {data.wonValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                  />
                  
                  {/* Total Leads Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="totalLeads"
                    name="Leads Cadastrados"
                    fill="url(#colorTotalLeads)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />

                  {/* Won Leads Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="wonLeads"
                    name="Contratos Ganhos"
                    fill="url(#colorWonLeads)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />

                  {/* Monthly Conversion Rate Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversionRate"
                    name="Taxa de Conversão (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, fill: '#10b981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trend Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Média Mensal de Novos Leads
                </span>
                <span className="text-base font-black text-neutral-900">
                  {(monthlyConversionChartData.reduce((acc, m) => acc + m.totalLeads, 0) / (monthlyConversionChartData.length || 1)).toFixed(1)} leads/mês
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Média de Fechamentos
                </span>
                <span className="text-base font-black text-emerald-600">
                  {(monthlyConversionChartData.reduce((acc, m) => acc + m.wonLeads, 0) / (monthlyConversionChartData.length || 1)).toFixed(1)} contratos/mês
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Melhor Taxa de Conversão
                </span>
                <span className="text-base font-black text-purple-600">
                  {Math.max(...monthlyConversionChartData.map(m => m.conversionRate), 0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Tabela Analítica Detalhada dos Estágios (Substituindo a listagem puramente textual) */}
          <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Demonstrativo Detalhado por Estágio do Funil
                </h4>
                <p className="text-xs text-neutral-500">
                  Métricas de volume financeiro, ticket médio e acesso direto aos leads por estágio
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                    <th className="py-2.5 px-3">Estágio do Funil</th>
                    <th className="py-2.5 px-3 text-center">Contagem de Leads</th>
                    <th className="py-2.5 px-3 text-center">% do Pipeline</th>
                    <th className="py-2.5 px-3 text-right">Volume Estimado (R$)</th>
                    <th className="py-2.5 px-3 text-right">Ticket Médio</th>
                    <th className="py-2.5 px-3 text-center">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {funnelChartData.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                          <span className="font-bold text-neutral-900">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-neutral-900">
                        {row.count}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-700">
                          {row.countPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-neutral-900">
                        {row.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-neutral-600">
                        {row.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter(row.id);
                            setViewMode('kanban');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#aa904f] hover:text-[#543d03] bg-[#aa904f]/10 hover:bg-[#aa904f]/20 rounded-md transition-all cursor-pointer border-none"
                        >
                          Ver no Kanban →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUICK WHATSAPP MODAL */}
      <AnimatePresence>
        {quickWhatsAppLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-neutral-800"
            >
              {/* Header */}
              <div className="bg-emerald-700 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    Disparo de WhatsApp Instantâneo
                  </h4>
                </div>
                <button
                  onClick={() => setQuickWhatsAppLead(null)}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-emerald-800 cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950">{quickWhatsAppLead.contactName || quickWhatsAppLead.name}</span>
                    <span className="font-mono text-emerald-800 font-bold">{quickWhatsAppLead.contactPhone}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    Turma: {quickWhatsAppLead.name} • {quickWhatsAppLead.institution}
                  </span>
                </div>

                {/* Templates Selector */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5">
                    Modelos Rápidos de Mensagem:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WHATSAPP_CRM_TEMPLATES.map(tmpl => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setQuickWhatsAppTemplateId(tmpl.id);
                          setQuickWhatsAppText(formatCrmMessage(tmpl.template, quickWhatsAppLead));
                        }}
                        className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                          quickWhatsAppTemplateId === tmpl.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="font-black text-[11px] block truncate">{tmpl.title}</span>
                        <span className="text-[9.5px] opacity-70 block truncate">{tmpl.shortDesc}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setQuickWhatsAppTemplateId('stale_reactivate');
                        setQuickWhatsAppText(getStaleLeadFollowUpText(quickWhatsAppLead, getLeadDaysInStage(quickWhatsAppLead)));
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        quickWhatsAppTemplateId === 'stale_reactivate'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="font-black text-[11px] block truncate">⚠️ Reativação (+7d)</span>
                      <span className="text-[9.5px] opacity-70 block truncate">Retomada de contato</span>
                    </button>
                  </div>
                </div>

                {/* Custom Message Area */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                    Texto Personalizado da Mensagem:
                  </label>
                  <textarea
                    rows={5}
                    value={quickWhatsAppText}
                    onChange={(e) => setQuickWhatsAppText(e.target.value)}
                    className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none resize-none leading-relaxed text-neutral-800"
                    placeholder="Digite a mensagem..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setQuickWhatsAppLead(null)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer border-none"
                  >
                    <Send className="w-3.5 h-3.5" /> Abrir WhatsApp & Registrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK FOLLOW-UP RESCHEDULE MODAL */}
      <AnimatePresence>
        {quickFollowUpLead && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-neutral-800"
            >
              <div className="bg-[#543d03] text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#dfd1a1]" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#ebe0b2]">
                    Agendar Follow-up Comercial
                  </h4>
                </div>
                <button
                  onClick={() => setQuickFollowUpLead(null)}
                  className="text-white/80 hover:text-white p-1 rounded cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-neutral-600">
                  Defina a data para entrar em contato com <strong>{quickFollowUpLead.contactName || quickFollowUpLead.name}</strong> ({quickFollowUpLead.name}):
                </p>

                {/* Quick Date Buttons */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5">
                    Atalhos Rápidos:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveQuickFollowUp(1)}
                      className="p-2 bg-neutral-100 hover:bg-amber-100 hover:text-amber-950 font-bold rounded-lg text-xs transition-all cursor-pointer border-none"
                    >
                      Amanhã
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveQuickFollowUp(3)}
                      className="p-2 bg-neutral-100 hover:bg-amber-100 hover:text-amber-950 font-bold rounded-lg text-xs transition-all cursor-pointer border-none"
                    >
                      +3 Dias
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveQuickFollowUp(7)}
                      className="p-2 bg-neutral-100 hover:bg-amber-100 hover:text-amber-950 font-bold rounded-lg text-xs transition-all cursor-pointer border-none"
                    >
                      +1 Semana
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveQuickFollowUp(15)}
                      className="p-2 bg-neutral-100 hover:bg-amber-100 hover:text-amber-950 font-bold rounded-lg text-xs transition-all cursor-pointer border-none"
                    >
                      +15 Dias
                    </button>
                  </div>
                </div>

                {/* Specific Date input */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                    Ou selecione uma data específica:
                  </label>
                  <input
                    type="date"
                    value={quickFollowUpDate}
                    onChange={(e) => setQuickFollowUpDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none"
                  />
                </div>

                {/* Follow-up Note */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                    Motivo / Lembrete da Ligação:
                  </label>
                  <input
                    type="text"
                    value={quickFollowUpNote}
                    onChange={(e) => setQuickFollowUpNote(e.target.value)}
                    placeholder="Ex: Verificar se a comissão aprovou a proposta"
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setQuickFollowUpLead(null)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuickFollowUp()}
                    className="px-5 py-2 bg-[#8d1811] hover:bg-[#70130d] text-white font-black rounded-xl text-xs cursor-pointer border-none"
                  >
                    Salvar Follow-up
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOSS REASON MODAL */}
      <AnimatePresence>
        {lossModalLead && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-neutral-800"
            >
              <div className="bg-rose-700 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    Registrar Motivo de Perda do Lead
                  </h4>
                </div>
                <button
                  onClick={() => setLossModalLead(null)}
                  className="text-white/80 hover:text-white p-1 rounded cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-neutral-600">
                  Para gerar inteligência comercial e aprimorar as próximas propostas da WM2, selecione o motivo da perda de <strong>{lossModalLead.name}</strong>:
                </p>

                {/* Reasons Radio Grid */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {LOSS_REASONS.map(reason => (
                    <label
                      key={reason.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedLossReason === reason.id
                          ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lossReason"
                        value={reason.id}
                        checked={selectedLossReason === reason.id}
                        onChange={(e) => setSelectedLossReason(e.target.value)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-1.5 font-extrabold">
                          <span>{reason.icon}</span>
                          <span>{reason.label}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-normal block mt-0.5">{reason.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                    Detalhes Adicionais (Opcional):
                  </label>
                  <textarea
                    rows={3}
                    value={lossNotes}
                    onChange={(e) => setLossNotes(e.target.value)}
                    placeholder="Ex: Concorrente ofereceu brinde de totem de fotos ou turma decidiu adiar para o próximo ano..."
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setLossModalLead(null)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLoss}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs cursor-pointer border-none shadow-md"
                  >
                    Confirmar Perda do Lead
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK ACTIVITY LOGGER MODAL */}
      <AnimatePresence>
        {quickActivityLead && (
          <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-neutral-800 border border-neutral-200"
            >
              <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#aa904f]" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                      Registrar Atividade Comercial
                    </h4>
                    <span className="text-[11px] text-neutral-400 font-normal">
                      {quickActivityLead.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setQuickActivityLead(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">
                    Tipo de Atividade
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'call', label: 'Ligação', icon: Phone },
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                      { id: 'meeting', label: 'Reunião', icon: Users },
                      { id: 'note', label: 'Nota', icon: FileText },
                    ].map(item => {
                      const Icon = item.icon;
                      const isSelected = quickActivityType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setQuickActivityType(item.id as any)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-[#aa904f]/10 border-[#aa904f] text-[#846f38] font-bold shadow-2xs'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Descrição / Resumo do Contato
                  </label>
                  <textarea
                    rows={3}
                    value={quickActivityDesc}
                    onChange={(e) => setQuickActivityDesc(e.target.value)}
                    placeholder="Ex: Alinhado prévia de buffet com a comissão; solicitaram proposta atualizada com mais 20 convites..."
                    className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none resize-none focus:border-[#aa904f]"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setQuickActivityLead(null)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickActivity}
                    className="px-5 py-2 bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold rounded-xl text-xs cursor-pointer border-none shadow-xs"
                  >
                    Salvar Atividade
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK STAGE UPDATE MODAL */}
      <AnimatePresence>
        {bulkStageModal && (
          <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-neutral-800 border border-neutral-200"
            >
              <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#aa904f]" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Alterar Etapa de {selectedLeadIds.length} Leads
                  </h4>
                </div>
                <button
                  onClick={() => setBulkStageModal(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-neutral-600">
                  Selecione a nova etapa para aplicar a todos os <strong>{selectedLeadIds.length}</strong> leads selecionados:
                </p>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {stages.map(stg => (
                    <label
                      key={stg.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        bulkTargetStage === stg.id
                          ? 'bg-[#aa904f]/10 border-[#aa904f] text-neutral-900 font-bold'
                          : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bulkStage"
                        value={stg.id}
                        checked={bulkTargetStage === stg.id}
                        onChange={(e) => setBulkTargetStage(e.target.value as any)}
                        className="text-[#aa904f] focus:ring-[#aa904f]"
                      />
                      <span className={`w-2.5 h-2.5 rounded-full ${stg.dotColor}`}></span>
                      <span className="text-xs">{stg.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setBulkStageModal(false)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyBulkStage}
                    className="px-5 py-2 bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold rounded-xl text-xs cursor-pointer border-none shadow-xs"
                  >
                    Aplicar Mudança em Lote
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK FOLLOW-UP MODAL */}
      <AnimatePresence>
        {bulkFollowUpModal && (
          <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-neutral-800 border border-neutral-200"
            >
              <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Agendar Follow-up para {selectedLeadIds.length} Leads
                  </h4>
                </div>
                <button
                  onClick={() => setBulkFollowUpModal(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-neutral-600">
                  Defina a data limite para o próximo contato com os <strong>{selectedLeadIds.length}</strong> leads selecionados:
                </p>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Data de Retorno
                  </label>
                  <input
                    type="date"
                    value={bulkFollowUpDate}
                    onChange={(e) => setBulkFollowUpDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#aa904f]"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-400 font-bold">Atalhos:</span>
                  {[
                    { label: 'Amanhã', days: 1 },
                    { label: '+3 Dias', days: 3 },
                    { label: '+1 Semana', days: 7 },
                    { label: '+15 Dias', days: 15 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + preset.days);
                        setBulkFollowUpDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold rounded-lg cursor-pointer border-none"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setBulkFollowUpModal(false)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyBulkFollowUp}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer border-none shadow-xs"
                  >
                    Salvar Retorno em Lote
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
