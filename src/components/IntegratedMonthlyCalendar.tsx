import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Printer,
  Sparkles,
  Edit,
  Trash2,
  Info,
  CalendarCheck,
  Tag,
  CheckSquare,
  Building,
  GraduationCap,
  GripVertical,
  Move,
  RotateCcw
} from 'lucide-react';
import { Evento, Reuniao, Turma } from '../types';

export interface CalendarScheduleItem {
  id: string;
  type: 'evento' | 'reuniao' | 'prazo' | 'convite';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  venue?: string;
  description?: string;
  turmaId: string;
  turmaName?: string;
  status?: string;
  link?: string;
  priority?: 'alta' | 'media' | 'baixa';
  rawEvento?: Evento;
  rawReuniao?: Reuniao;
  rawTask?: any;
}

interface IntegratedMonthlyCalendarProps {
  eventos: Evento[];
  reunioes?: Reuniao[];
  turmas: Turma[];
  tasks?: any[];
  currentTurmaId?: string; // If specified, locks/filters to this turma (e.g. Student Portal)
  isStudentView?: boolean;
  onAddEvento?: (date?: string) => void;
  onAddReuniao?: (date?: string) => void;
  onEditEvento?: (evento: Evento) => void;
  onDeleteEvento?: (id: string) => void;
  onEditReuniao?: (reuniao: Reuniao) => void;
  onDeleteReuniao?: (id: string) => void;
  onPrintAttendance?: (evento: Evento) => void;
  onPrintExecutionSheet?: (evento: Evento) => void;
  onMoveItem?: (item: CalendarScheduleItem, targetDate: string) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const IntegratedMonthlyCalendar: React.FC<IntegratedMonthlyCalendarProps> = ({
  eventos = [],
  reunioes = [],
  turmas = [],
  tasks = [],
  currentTurmaId,
  isStudentView = false,
  onAddEvento,
  onAddReuniao,
  onEditEvento,
  onDeleteEvento,
  onEditReuniao,
  onDeleteReuniao,
  onPrintAttendance,
  onPrintExecutionSheet,
  onMoveItem
}) => {
  // Calendar Navigation State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Filters State
  const [typeFilter, setTypeFilter] = useState<'all' | 'evento' | 'reuniao' | 'prazo'>('all');
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<string>(currentTurmaId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Day & Item Modal
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<CalendarScheduleItem | null>(null);
  const [showAddMenuForDate, setShowAddMenuForDate] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<CalendarScheduleItem | null>(null);
  const [dragOverDayString, setDragOverDayString] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    message: string;
    item: CalendarScheduleItem;
    previousDate: string;
    newDate: string;
  } | null>(null);

  // Auto-dismiss Toast after 6s
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: CalendarScheduleItem) => {
    if (isStudentView || item.type === 'convite') {
      e.preventDefault();
      return;
    }
    setDraggedItem(item);
    setHoveredTooltip(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, type: item.type, date: item.date, title: item.title }));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverDayString(null);
  };

  const handleDayDragOver = (e: React.DragEvent, dateString: string) => {
    if (isStudentView || !draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDayString !== dateString) {
      setDragOverDayString(dateString);
    }
  };

  const handleDayDragLeave = (e: React.DragEvent, dateString: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverDayString === dateString) {
      setDragOverDayString(null);
    }
  };

  const handleDayDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDayString(null);
    if (!draggedItem || isStudentView) return;

    const sourceItem = draggedItem;
    const oldDate = sourceItem.date;
    setDraggedItem(null);

    if (oldDate === targetDate) return;

    // Trigger update
    if (onMoveItem) {
      onMoveItem(sourceItem, targetDate);
    } else {
      if (sourceItem.type === 'evento' && sourceItem.rawEvento && onEditEvento) {
        onEditEvento({ ...sourceItem.rawEvento, date: targetDate });
      } else if (sourceItem.type === 'reuniao' && sourceItem.rawReuniao && onEditReuniao) {
        onEditReuniao({ ...sourceItem.rawReuniao, date: targetDate });
      }
    }

    const formattedOldDate = oldDate.split('-').reverse().join('/');
    const formattedNewDate = targetDate.split('-').reverse().join('/');

    setToastNotification({
      id: `toast-${Date.now()}`,
      message: `"${sourceItem.title}" reagendado para ${formattedNewDate}`,
      item: sourceItem,
      previousDate: oldDate,
      newDate: targetDate
    });
  };

  const handleUndoMove = () => {
    if (!toastNotification) return;
    const { item, previousDate } = toastNotification;
    if (onMoveItem) {
      onMoveItem(item, previousDate);
    } else if (item.type === 'evento' && item.rawEvento && onEditEvento) {
      onEditEvento({ ...item.rawEvento, date: previousDate });
    } else if (item.type === 'reuniao' && item.rawReuniao && onEditReuniao) {
      onEditReuniao({ ...item.rawReuniao, date: previousDate });
    }
    setToastNotification(null);
  };

  // Interactive Hover Tooltip State
  interface HoveredTooltipInfo {
    item: CalendarScheduleItem;
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  }
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredTooltipInfo | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const handleItemMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: CalendarScheduleItem) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipEstimatedHeight = 240;
    const viewportWidth = window.innerWidth;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left + tooltipWidth > viewportWidth - 16) {
      left = viewportWidth - tooltipWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    let top = rect.top - tooltipEstimatedHeight - 8;
    let placement: 'top' | 'bottom' = 'top';

    if (rect.top < tooltipEstimatedHeight + 20) {
      top = rect.bottom + 8;
      placement = 'bottom';
    }

    setHoveredTooltip({
      item,
      top: Math.max(8, top),
      left,
      placement
    });
  };

  const handleItemMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTooltip(null);
    }, 100);
  };

  useEffect(() => {
    const handleDismiss = () => {
      setHoveredTooltip(null);
    };
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, []);

  // Turma map for quick name resolution
  const turmaMap = useMemo(() => {
    const map = new Map<string, Turma>();
    turmas.forEach(t => map.set(t.id, t));
    return map;
  }, [turmas]);

  // Consolidate all calendar items
  const allItems: CalendarScheduleItem[] = useMemo(() => {
    const items: CalendarScheduleItem[] = [];

    // 1. Eventos & Cerimoniais
    eventos.forEach(evt => {
      if (!evt.date) return;
      const turma = turmaMap.get(evt.turmaId);
      items.push({
        id: `evt-${evt.id}`,
        type: 'evento',
        title: evt.title,
        date: evt.date.trim(),
        time: evt.time || '19:00',
        venue: evt.venue,
        description: evt.description,
        turmaId: evt.turmaId,
        turmaName: turma ? turma.name : 'Turma Geral',
        status: 'Confirmado',
        rawEvento: evt
      });
    });

    // 2. Reuniões da Comissão
    reunioes.forEach(reu => {
      if (!reu.date) return;
      const turma = turmaMap.get(reu.turmaId);
      items.push({
        id: `reu-${reu.id}`,
        type: 'reuniao',
        title: reu.title,
        date: reu.date.trim(),
        time: reu.time || '19:30',
        description: reu.description,
        turmaId: reu.turmaId,
        turmaName: turma ? turma.name : 'Comissão de Formatura',
        status: reu.status || 'Agendada',
        link: reu.link,
        rawReuniao: reu
      });
    });

    // 3. Prazos / Pendências Importantes
    tasks.forEach(tsk => {
      if (!tsk.dueDate || tsk.status === 'completed') return;
      const turma = tsk.turmaId ? turmaMap.get(tsk.turmaId) : null;
      items.push({
        id: `tsk-${tsk.id}`,
        type: 'prazo',
        title: tsk.title,
        date: tsk.dueDate.trim(),
        description: tsk.description,
        turmaId: tsk.turmaId || '',
        turmaName: turma ? turma.name : 'Operacional',
        status: tsk.status === 'in_progress' ? 'Em Andamento' : 'Pendente',
        priority: tsk.priority,
        rawTask: tsk
      });
    });

    // 4. Início de Venda de Convites Extras por Turma
    turmas.forEach(turma => {
      if (turma.extraInviteStartDate) {
        items.push({
          id: `convite-${turma.id}`,
          type: 'convite',
          title: `Início de Convites Extras: ${turma.name}`,
          date: turma.extraInviteStartDate.trim(),
          description: `Abertura oficial das vendas de ingressos/convites extras para os formandos da turma ${turma.name}.`,
          turmaId: turma.id,
          turmaName: turma.name,
          status: 'Marco Oficial'
        });
      }
    });

    return items;
  }, [eventos, reunioes, tasks, turmas, turmaMap]);

  // Filter items based on active criteria
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Turma filter
      const activeTurma = currentTurmaId || selectedTurmaFilter;
      if (activeTurma !== 'all' && item.turmaId && item.turmaId !== activeTurma) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesVenue = item.venue ? item.venue.toLowerCase().includes(q) : false;
        const matchesTurma = item.turmaName ? item.turmaName.toLowerCase().includes(q) : false;
        const matchesDesc = item.description ? item.description.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesVenue && !matchesTurma && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, currentTurmaId, selectedTurmaFilter, typeFilter, searchQuery]);

  // Items mapped by Date String (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarScheduleItem[]>();
    filteredItems.forEach(item => {
      // Normalize date to YYYY-MM-DD
      const d = item.date.split('T')[0];
      const existing = map.get(d) || [];
      map.set(d, [...existing, item]);
    });
    return map;
  }, [filteredItems]);

  // Generate calendar days matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: Array<{
      date: Date;
      dateString: string;
      isCurrentMonth: boolean;
      dayNumber: number;
      isToday: boolean;
    }> = [];

    // Prepend padding days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(prevDate.getDate()).padStart(2, '0');
      days.push({
        date: prevDate,
        dateString: `${y}-${m}-${d}`,
        isCurrentMonth: false,
        dayNumber: prevDate.getDate(),
        isToday: false
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(currentYear, currentMonth, d);
      const y = curDate.getFullYear();
      const m = String(curDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${y}-${m}-${dayStr}`;

      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === d;

      days.push({
        date: curDate,
        dateString,
        isCurrentMonth: true,
        dayNumber: d,
        isToday
      });
    }

    // Append padding days to finish 6-row or 5-row full week grid (42 days total)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(nextDate.getDate()).padStart(2, '0');
      days.push({
        date: nextDate,
        dateString: `${y}-${m}-${d}`,
        isCurrentMonth: false,
        dayNumber: i,
        isToday: false
      });
    }

    return days;
  }, [currentYear, currentMonth, today]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDayString(`${y}-${m}-${d}`);
  };

  // Month stats
  const monthStats = useMemo(() => {
    const curYearStr = String(currentYear);
    const curMonthStr = String(currentMonth + 1).padStart(2, '0');
    const prefix = `${curYearStr}-${curMonthStr}`;

    let eventsCount = 0;
    let meetingsCount = 0;
    let deadlinesCount = 0;

    filteredItems.forEach(it => {
      if (it.date.startsWith(prefix)) {
        if (it.type === 'evento') eventsCount++;
        else if (it.type === 'reuniao') meetingsCount++;
        else if (it.type === 'prazo' || it.type === 'convite') deadlinesCount++;
      }
    });

    return { eventsCount, meetingsCount, deadlinesCount, total: eventsCount + meetingsCount + deadlinesCount };
  }, [filteredItems, currentYear, currentMonth]);

  // Helper for badge style per item type
  const getItemBadgeStyle = (item: CalendarScheduleItem) => {
    switch (item.type) {
      case 'evento':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 border-amber-300 text-amber-950 dark:text-amber-200',
          dot: 'bg-amber-600',
          icon: CalendarIcon,
          label: 'Evento / Solenidade'
        };
      case 'reuniao':
        return {
          bg: 'bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 border-sky-300 text-sky-950 dark:text-sky-200',
          dot: 'bg-sky-600',
          icon: Video,
          label: 'Reunião Comissão'
        };
      case 'prazo':
        return {
          bg: 'bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 border-rose-300 text-rose-950 dark:text-rose-200',
          dot: 'bg-rose-600',
          icon: CheckSquare,
          label: 'Prazo / Pendência'
        };
      case 'convite':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 border-emerald-300 text-emerald-950 dark:text-emerald-200',
          dot: 'bg-emerald-600',
          icon: Tag,
          label: 'Marco de Convites'
        };
    }
  };

  // Selected Day Items
  const selectedDayItems = selectedDayString ? (itemsByDate.get(selectedDayString) || []) : [];

  return (
    <div className="space-y-4" id="integrated-monthly-calendar">
      {/* Drag & Drop Active Helper Banner */}
      <AnimatePresence>
        {draggedItem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-500 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-md border border-amber-600 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 animate-bounce text-neutral-900" />
              <span>
                Arrastando: <strong>{draggedItem.title}</strong> (Data atual: {draggedItem.date.split('-').reverse().join('/')})
              </span>
            </div>
            <span className="text-[11px] font-semibold bg-white/40 px-2 py-0.5 rounded-md">
              Solte em qualquer dia do mês para reagendar
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Mês anterior"
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer shadow-none hover:shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToToday}
                title="Ir para o mês atual"
                className="px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer shadow-none hover:shadow-xs"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Próximo mês"
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer shadow-none hover:shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                {MONTH_NAMES[currentMonth]} <span className="text-[#8d1811]">{currentYear}</span>
              </h3>

              {/* Month Jump Dropdown */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>{name}</option>
                ))}
              </select>

              {/* Year Jump Dropdown */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                {Array.from({ length: 7 }, (_, i) => today.getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
            {/* Admin Drag and Drop Guidance Pill */}
            {!isStudentView && (
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/90 px-2.5 py-1 rounded-lg">
                <GripVertical className="w-3.5 h-3.5 text-[#8d1811]" />
                <span>Arraste os eventos para reagendar</span>
              </div>
            )}

            {/* Badges of current month counts */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <strong>{monthStats.eventsCount}</strong> Eventos
              </span>
              <span className="bg-sky-50 text-sky-900 border border-sky-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <strong>{monthStats.meetingsCount}</strong> Reuniões
              </span>
              <span className="bg-rose-50 text-rose-900 border border-rose-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <strong>{monthStats.deadlinesCount}</strong> Prazos
              </span>
            </div>

            {/* Admin Add Quick Action Button */}
            {!isStudentView && (onAddEvento || onAddReuniao) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenuForDate(showAddMenuForDate ? null : 'header')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Novo Agendamento</span>
                </button>

                {showAddMenuForDate === 'header' && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                    {onAddEvento && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMenuForDate(null);
                          onAddEvento();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-amber-50 text-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>Agendar Evento / Solenidade</span>
                      </button>
                    )}
                    {onAddReuniao && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMenuForDate(null);
                          onAddReuniao();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-sky-50 text-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>Agendar Reunião de Comissão</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos ({filteredItems.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('evento')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                typeFilter === 'evento'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Eventos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('reuniao')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                typeFilter === 'reuniao'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : 'bg-sky-50/70 text-sky-900 border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Reuniões
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('prazo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                typeFilter === 'prazo'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50/70 text-rose-900 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Prazos
            </button>
          </div>

          {/* Turma Filter & Search Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Turma Dropdown (Admin only) */}
            {!currentTurmaId && turmas.length > 0 && (
              <select
                value={selectedTurmaFilter}
                onChange={(e) => setSelectedTurmaFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold outline-none focus:border-slate-400 cursor-pointer max-w-[180px] truncate shadow-2xs"
              >
                <option value="all">Todas as Turmas</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            {/* Search Input */}
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar data, evento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-8 pr-6 py-1 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-400 shadow-2xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Grid Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-black text-slate-700 tracking-wider uppercase">
          {WEEK_DAYS.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? 'text-amber-700' : 'text-slate-600'}>
              {day}
            </div>
          ))}
        </div>

        {/* 42 Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-white">
          {calendarDays.map((calDay) => {
            const dayItems = itemsByDate.get(calDay.dateString) || [];
            const isSelected = selectedDayString === calDay.dateString;
            const isDragOver = dragOverDayString === calDay.dateString;
            const hasItems = dayItems.length > 0;

            return (
              <div
                key={calDay.dateString}
                onClick={() => setSelectedDayString(calDay.dateString)}
                onDragOver={(e) => handleDayDragOver(e, calDay.dateString)}
                onDragLeave={(e) => handleDayDragLeave(e, calDay.dateString)}
                onDrop={(e) => handleDayDrop(e, calDay.dateString)}
                className={`min-h-[105px] md:min-h-[120px] p-1.5 md:p-2 transition-all flex flex-col justify-between relative group ${
                  isDragOver
                    ? 'bg-amber-50/90 ring-2 ring-inset ring-[#8d1811] z-20 scale-[1.01]'
                    : !calDay.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-400 opacity-60'
                    : 'bg-white hover:bg-slate-50 text-slate-800'
                } ${
                  isSelected && !isDragOver ? 'ring-2 ring-inset ring-slate-900 bg-slate-50' : ''
                } cursor-pointer`}
              >
                {/* Drag Target Highlight Indicator Overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-[#8d1811]/10 border-2 border-dashed border-[#8d1811] rounded-xl flex flex-col items-center justify-center p-1.5 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-[#8d1811] text-white text-[9.5px] font-black px-2 py-1 rounded-md shadow-md flex items-center gap-1 text-center">
                      <CalendarCheck className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>Soltar em {calDay.dayNumber}/{currentMonth + 1}</span>
                    </div>
                  </div>
                )}

                {/* Day Header (Number + Today Badge + Quick Add) */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-xs font-black inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                      calDay.isToday
                        ? 'bg-[#8d1811] text-white shadow-xs'
                        : isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 group-hover:text-black'
                    }`}
                  >
                    {calDay.dayNumber}
                  </span>

                  {/* Day Quick Add Trigger (Admin only on hover) */}
                  {!isStudentView && calDay.isCurrentMonth && (onAddEvento || onAddReuniao) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMenuForDate(showAddMenuForDate === calDay.dateString ? null : calDay.dateString);
                      }}
                      title="Adicionar evento/reunião neste dia"
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 rounded text-slate-500 transition-opacity cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day Menu Popover */}
                {showAddMenuForDate === calDay.dateString && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-7 left-2 right-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-1.5 text-xs space-y-1 animate-in fade-in"
                  >
                    <div className="flex justify-between items-center px-1 font-bold text-[10px] text-slate-400 uppercase">
                      <span>{calDay.dateString.split('-').reverse().join('/')}</span>
                      <button onClick={() => setShowAddMenuForDate(null)} className="hover:text-rose-600 font-bold">✕</button>
                    </div>
                    {onAddEvento && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMenuForDate(null);
                          onAddEvento(calDay.dateString);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <CalendarIcon className="w-3 h-3 text-amber-600" /> + Evento
                      </button>
                    )}
                    {onAddReuniao && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMenuForDate(null);
                          onAddReuniao(calDay.dateString);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-sky-50 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Video className="w-3 h-3 text-sky-600" /> + Reunião
                      </button>
                    )}
                  </div>
                )}

                {/* Day Items List (Chips) */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayItems.slice(0, 3).map((item) => {
                    const style = getItemBadgeStyle(item);
                    const isItemBeingDragged = draggedItem?.id === item.id;
                    const canDrag = !isStudentView && item.type !== 'convite';

                    return (
                      <div
                        key={item.id}
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredTooltip(null);
                          setSelectedItemDetail(item);
                          setSelectedDayString(calDay.dateString);
                        }}
                        onMouseEnter={(e) => handleItemMouseEnter(e, item)}
                        onMouseLeave={handleItemMouseLeave}
                        title={canDrag ? "Arraste para reagendar para outro dia" : undefined}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border truncate flex items-center gap-1 transition-all duration-150 ${style.bg} ${
                          canDrag
                            ? 'cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:shadow-xs'
                            : 'cursor-pointer hover:scale-[1.02]'
                        } ${
                          isItemBeingDragged ? 'opacity-30 ring-2 ring-[#8d1811] scale-95' : ''
                        }`}
                      >
                        {canDrag && (
                          <GripVertical className="w-2.5 h-2.5 opacity-40 group-hover:opacity-90 shrink-0 text-slate-500" />
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                        {item.time && <span className="font-bold shrink-0 opacity-80">{item.time}h</span>}
                        <span className="truncate">{item.title}</span>
                      </div>
                    );
                  })}

                  {/* Overflow badge if more than 3 items */}
                  {dayItems.length > 3 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredTooltip(null);
                        setSelectedDayString(calDay.dateString);
                      }}
                      className="text-[9.5px] font-bold text-slate-500 hover:text-slate-900 px-1 cursor-pointer transition-colors"
                    >
                      +{dayItems.length - 3} mais itens...
                    </div>
                  )}
                </div>

                {/* Bottom dot indicator on mobile if space is tight */}
                {hasItems && (
                  <div className="flex md:hidden items-center justify-center gap-0.5 pt-0.5">
                    {dayItems.slice(0, 4).map((it, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${getItemBadgeStyle(it).dot}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Day Drawer / Detail View */}
      {/* 3. Selected Day Schedule Drawer / Quick Panel */}
      {selectedDayString && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-5 h-5 text-[#8d1811]" />
              <div>
                <h4 className="font-black text-sm text-slate-900">
                  Programação do Dia: {selectedDayString.split('-').reverse().join('/')}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedDayItems.length} compromisso(s) e marco(s) agendados nesta data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isStudentView && onAddEvento && (
                <button
                  type="button"
                  onClick={() => onAddEvento(selectedDayString)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Evento
                </button>
              )}
              {!isStudentView && onAddReuniao && (
                <button
                  type="button"
                  onClick={() => onAddReuniao(selectedDayString)}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Reunião
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDayString(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs p-1 cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>
          </div>

          {/* List of items on this day */}
          {selectedDayItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Nenhum compromisso marcado para este dia.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3.5">
              {selectedDayItems.map(item => {
                const style = getItemBadgeStyle(item);
                const Icon = style.icon;
                const canDrag = !isStudentView && item.type !== 'convite';
                const isItemBeingDragged = draggedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    draggable={canDrag}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 hover:shadow-xs transition-all ${
                      canDrag ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${isItemBeingDragged ? 'opacity-30 ring-2 ring-[#8d1811] scale-95' : ''}`}
                  >
                    <div className="space-y-2">
                      {/* Top Badges & Drag handle */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {canDrag && (
                            <span className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="Arraste para outro dia no calendário">
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${style.bg}`}>
                            <Icon className="w-3 h-3" />
                            {style.label}
                          </span>
                        </div>
                        {item.turmaName && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {item.turmaName}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h5 className="font-bold text-sm text-slate-900">
                        {item.title}
                      </h5>

                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Info Row: Time & Venue */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                        {item.time && (
                          <div className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-[#8d1811]" />
                            <span>{item.time}h</span>
                          </div>
                        )}
                        {item.venue && (
                          <div className="flex items-center gap-1 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span className="truncate max-w-[200px]">{item.venue}</span>
                          </div>
                        )}
                        {item.status && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.status}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      {/* Left Specific Action */}
                      {item.type === 'reuniao' && item.link ? (
                        <a
                          href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" /> Acessar Reunião Online
                        </a>
                      ) : item.type === 'evento' && item.rawEvento && !isStudentView ? (
                        <div className="flex items-center gap-1.5">
                          {onPrintAttendance && (
                            <button
                              type="button"
                              onClick={() => onPrintAttendance(item.rawEvento!)}
                              className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2 py-1 rounded border border-sky-200 flex items-center gap-1 cursor-pointer"
                              title="Lista de Presença"
                            >
                              <Printer className="w-3 h-3" /> Presença
                            </button>
                          )}
                          {onPrintExecutionSheet && (
                            <button
                              type="button"
                              onClick={() => onPrintExecutionSheet(item.rawEvento!)}
                              className="text-[11px] font-bold text-slate-700 hover:text-black bg-slate-50 px-2 py-1 rounded border border-slate-200 flex items-center gap-1 cursor-pointer"
                              title="Ficha de Execução"
                            >
                              <Printer className="w-3 h-3" /> Execução
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedItemDetail(item)}
                          className="text-[11px] font-bold text-[#8d1811] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" /> Ver Detalhes Completos
                        </button>
                      )}

                      {/* Right Admin Controls */}
                      {!isStudentView && (
                        <div className="flex items-center gap-1">
                          {item.type === 'evento' && item.rawEvento && onEditEvento && (
                            <button
                              type="button"
                              onClick={() => onEditEvento(item.rawEvento!)}
                              className="p-1 hover:bg-amber-100 rounded text-amber-700 cursor-pointer"
                              title="Editar Evento"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.type === 'evento' && item.rawEvento && onDeleteEvento && (
                            <button
                              type="button"
                              onClick={() => onDeleteEvento(item.rawEvento!.id)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-700 cursor-pointer"
                              title="Excluir Evento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.type === 'reuniao' && item.rawReuniao && onEditReuniao && (
                            <button
                              type="button"
                              onClick={() => onEditReuniao(item.rawReuniao!)}
                              className="p-1 hover:bg-sky-100 rounded text-sky-700 cursor-pointer"
                              title="Editar Reunião"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {item.type === 'reuniao' && item.rawReuniao && onDeleteReuniao && (
                            <button
                              type="button"
                              onClick={() => onDeleteReuniao(item.rawReuniao!.id)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-700 cursor-pointer"
                              title="Excluir Reunião"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* 4. Complete Item Details Modal */}
      <AnimatePresence>
        {selectedItemDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1.5 ${getItemBadgeStyle(selectedItemDetail).bg}`}>
                    {getItemBadgeStyle(selectedItemDetail).label}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">
                    {selectedItemDetail.title}
                  </h4>
                  {selectedItemDetail.turmaName && (
                    <p className="text-xs text-[#8d1811] font-bold">
                      {selectedItemDetail.turmaName}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItemDetail(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Data</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {selectedItemDetail.date.split('-').reverse().join('/')}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Horário</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {selectedItemDetail.time ? `${selectedItemDetail.time}h` : 'A definir'}
                  </span>
                </div>

                {selectedItemDetail.venue && (
                  <div className="col-span-2 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Local / Espaço</span>
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {selectedItemDetail.venue}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedItemDetail.description && (
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pauta & Observações</span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedItemDetail.description}
                  </p>
                </div>
              )}

              {/* Suppliers List for Eventos */}
              {selectedItemDetail.rawEvento?.suppliers && selectedItemDetail.rawEvento.suppliers.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Fornecedores Vinculados</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedItemDetail.rawEvento.suppliers.map((sup, sIdx) => (
                      <div key={sIdx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs">
                        <span className="font-semibold text-slate-800">{sup.name} ({sup.service})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sup.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sup.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Link Action */}
              {selectedItemDetail.link && (
                <a
                  href={selectedItemDetail.link.startsWith('http') ? selectedItemDetail.link : `https://${selectedItemDetail.link}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Video className="w-4 h-4" /> Entrar na Sala da Reunião
                </a>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Interactive Event Hover Tooltip */}
      <AnimatePresence>
        {hoveredTooltip && !selectedItemDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: hoveredTooltip.placement === 'top' ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: hoveredTooltip.top,
              left: hoveredTooltip.left,
              zIndex: 9999,
              width: 320,
              maxWidth: 'calc(100vw - 32px)'
            }}
            className="pointer-events-none drop-shadow-2xl"
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xl text-slate-800 space-y-2.5">
              {/* Header with Type Badge & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${getItemBadgeStyle(hoveredTooltip.item).bg}`}>
                  {React.createElement(getItemBadgeStyle(hoveredTooltip.item).icon, { className: 'w-3 h-3' })}
                  {getItemBadgeStyle(hoveredTooltip.item).label}
                </span>
                {hoveredTooltip.item.status && (
                  <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {hoveredTooltip.item.status}
                  </span>
                )}
              </div>

              {/* Title & Turma */}
              <div>
                <h5 className="font-black text-sm text-slate-900 leading-snug">
                  {hoveredTooltip.item.title}
                </h5>
                {hoveredTooltip.item.turmaName && (
                  <p className="text-[11px] font-bold text-[#8d1811] flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3 shrink-0" />
                    <span className="truncate">{hoveredTooltip.item.turmaName}</span>
                  </p>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <CalendarIcon className="w-2.5 h-2.5 text-[#8d1811]" /> Data
                  </span>
                  <span className="font-extrabold text-slate-900 text-[11px] block">
                    {hoveredTooltip.item.date.split('-').reverse().join('/')}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#8d1811]" /> Horário
                  </span>
                  <span className="font-extrabold text-slate-900 text-[11px] block">
                    {hoveredTooltip.item.time ? `${hoveredTooltip.item.time}h` : 'A definir'}
                  </span>
                </div>

                {hoveredTooltip.item.venue && (
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" /> Local / Espaço
                    </span>
                    <span className="font-bold text-slate-900 text-[11px] block truncate">
                      {hoveredTooltip.item.venue}
                    </span>
                  </div>
                )}
              </div>

              {/* Contextual Badges (Suppliers, Staff, Video Link, Notes) */}
              {hoveredTooltip.item.rawEvento?.suppliers && hoveredTooltip.item.rawEvento.suppliers.length > 0 && (
                <div className="text-[10.5px] text-slate-700 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <Building className="w-3 h-3 text-[#8d1811] shrink-0" />
                  <span className="truncate">
                    <strong>{hoveredTooltip.item.rawEvento.suppliers.length}</strong> fornecedor(es) vinculado(s)
                  </span>
                </div>
              )}

              {hoveredTooltip.item.rawEvento?.staff && hoveredTooltip.item.rawEvento.staff.length > 0 && (
                <div className="text-[10.5px] text-slate-700 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <Users className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">
                    <strong>{hoveredTooltip.item.rawEvento.staff.length}</strong> profissional(is) na equipe
                  </span>
                </div>
              )}

              {hoveredTooltip.item.link && (
                <div className="text-[10.5px] text-sky-800 flex items-center gap-1.5 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                  <Video className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="font-bold truncate">Reunião online com link disponível</span>
                </div>
              )}

              {hoveredTooltip.item.description && (
                <p className="text-[10.5px] text-slate-600 italic line-clamp-2 leading-relaxed">
                  "{hoveredTooltip.item.description}"
                </p>
              )}

              {/* Bottom Click Hint */}
              <div className="text-[9px] font-extrabold text-[#8d1811] flex items-center justify-center gap-1 pt-1.5 border-t border-slate-100 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Clique para abrir detalhes completos
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Drag and Drop Reorder Undo Toast */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Data atualizada com sucesso!</p>
                <p className="text-slate-400 mt-0.5">{toastNotification.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndoMove}
                className="bg-white/10 hover:bg-white/20 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Desfazer</span>
              </button>
              <button
                type="button"
                onClick={() => setToastNotification(null)}
                className="text-slate-500 hover:text-slate-300 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
