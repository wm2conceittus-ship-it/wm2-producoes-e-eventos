import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  LayoutGrid, 
  List, 
  Tag, 
  User, 
  Building, 
  Briefcase, 
  DollarSign, 
  Camera, 
  FileText, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileSpreadsheet, 
  RefreshCw,
  Flame,
  Check,
  X,
  SlidersHorizontal,
  Layers,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Users,
  GraduationCap
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
  Legend 
} from 'recharts';
import { AdminTask, AdminTaskChecklistItem, Turma, Formando } from '../types';

interface TaskManagerProps {
  tasks: AdminTask[];
  turmas: Turma[];
  formandos?: Formando[];
  onUpdateTasks: (updatedTasks: AdminTask[]) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgLight: string }> = {
  Financeiro: { 
    label: 'Financeiro', 
    icon: DollarSign, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  Eventos: { 
    label: 'Eventos', 
    icon: Calendar, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  Fornecedores: { 
    label: 'Fornecedores', 
    icon: Briefcase, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  Fotografia: { 
    label: 'Fotografia', 
    icon: Camera, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  Contratos: { 
    label: 'Contratos', 
    icon: FileText, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  Atendimento: { 
    label: 'Atendimento', 
    icon: User, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  },
  Geral: { 
    label: 'Geral', 
    icon: CheckSquare, 
    color: '#64748b',
    bgLight: 'bg-neutral-50 text-neutral-700 border-neutral-200'
  }
};

const PRIORITY_CONFIG: Record<string, { label: string; badge: string; dotColor: string }> = {
  alta: { 
    label: 'Alta', 
    badge: 'bg-neutral-50 text-neutral-700 border-neutral-200', 
    dotColor: 'bg-neutral-500' 
  },
  media: { 
    label: 'Média', 
    badge: 'bg-neutral-50 text-neutral-700 border-neutral-200', 
    dotColor: 'bg-neutral-400' 
  },
  baixa: { 
    label: 'Normal', 
    badge: 'bg-neutral-50 text-neutral-700 border-neutral-200', 
    dotColor: 'bg-neutral-300' 
  }
};

const STAGE_CONFIG = [
  { id: 'todo' as const, label: 'A Fazer', dotColor: 'bg-slate-400', color: '#64748b', borderHover: 'border-slate-400' },
  { id: 'in_progress' as const, label: 'Em Andamento', dotColor: 'bg-amber-500', color: '#f59e0b', borderHover: 'border-amber-400' },
  { id: 'completed' as const, label: 'Concluídas', dotColor: 'bg-emerald-500', color: '#10b981', borderHover: 'border-emerald-400' },
  { id: 'delivered' as const, label: 'Entregue', dotColor: 'bg-blue-500', color: '#3b82f6', borderHover: 'border-blue-400' }
];

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks = [],
  turmas = [],
  formandos = [],
  onUpdateTasks
}) => {
  // View mode matching CRM: kanban, table, timeline, charts
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'timeline' | 'charts'>('kanban');
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

  // Search & Multi-Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [turmaFilter, setTurmaFilter] = useState<string>('all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const [sortOrder, setSortOrder] = useState<'dueDate_asc' | 'priority_desc' | 'newest' | 'title_asc'>('dueDate_asc');

  // Drag and drop states matching CRM
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Quick inline add per column
  const [quickAddColumn, setQuickAddColumn] = useState<'todo' | 'in_progress' | 'completed' | 'delivered' | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Bulk operations (Table view)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<AdminTask['status']>('completed');
  const [bulkPriorityModal, setBulkPriorityModal] = useState(false);
  const [bulkTargetPriority, setBulkTargetPriority] = useState<AdminTask['priority']>('media');
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Deletion Confirmation Modal
  const [taskToDelete, setTaskToDelete] = useState<AdminTask | null>(null);

  // Modal State for full create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);

  // Form states for modal
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPersonName, setFormPersonName] = useState('');
  const [formCourseName, setFormCourseName] = useState('');
  const [formStatus, setFormStatus] = useState<'todo' | 'in_progress' | 'completed' | 'delivered'>('todo');
  const [formPriority, setFormPriority] = useState<'alta' | 'media' | 'baixa'>('media');
  const [formCategory, setFormCategory] = useState<AdminTask['category']>('Geral');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('');
  const [formTurmaId, setFormTurmaId] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formChecklist, setFormChecklist] = useState<AdminTaskChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState('');

  // Sub-checklist expansion
  const [expandedChecklistTaskId, setExpandedChecklistTaskId] = useState<string | null>(null);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  // KPI Calculations
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const deliveredCount = tasks.filter(t => t.status === 'delivered').length;
  const percentDone = totalTasks > 0 ? Math.round(((completedCount + deliveredCount) / totalTasks) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && t.status !== 'delivered' && t.dueDate && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && t.status !== 'delivered' && t.dueDate && t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const highPriorityTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && t.status !== 'delivered' && t.priority === 'alta');
  }, [tasks]);

  // Urgent alerts for banner
  const urgentAlerts = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed' && t.status !== 'delivered' && (t.priority === 'alta' || (t.dueDate && t.dueDate <= todayStr)))
      .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  }, [tasks, todayStr]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        const matchPerson = (task.personName || '').toLowerCase().includes(q);
        const matchCourse = (task.courseName || '').toLowerCase().includes(q);
        const matchAssignee = (task.assignedTo || '').toLowerCase().includes(q);
        const matchTags = (task.tags || []).some(t => t.toLowerCase().includes(q));
        const matchedTurma = turmas.find(t => t.id === task.turmaId);
        const matchTurma = matchedTurma && (
          matchedTurma.name.toLowerCase().includes(q) || 
          matchedTurma.institution.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchDesc && !matchPerson && !matchCourse && !matchAssignee && !matchTags && !matchTurma) return false;
      }

      // Status
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Turma
      if (turmaFilter !== 'all' && task.turmaId !== turmaFilter) return false;

      // Due Date Filter
      if (dueDateFilter !== 'all') {
        const isDone = task.status === 'completed' || task.status === 'delivered';
        if (dueDateFilter === 'overdue') {
          if (isDone || !task.dueDate || task.dueDate >= todayStr) return false;
        } else if (dueDateFilter === 'today') {
          if (isDone || !task.dueDate || task.dueDate !== todayStr) return false;
        } else if (dueDateFilter === 'upcoming') {
          if (isDone || !task.dueDate || task.dueDate <= todayStr) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'dueDate_asc') {
        const dateA = a.dueDate || '9999-99-99';
        const dateB = b.dueDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      }
      if (sortOrder === 'priority_desc') {
        const prioRank: Record<string, number> = { alta: 3, media: 2, baixa: 1 };
        return (prioRank[b.priority] || 2) - (prioRank[a.priority] || 2);
      }
      if (sortOrder === 'newest') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (sortOrder === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, searchQuery, statusFilter, categoryFilter, priorityFilter, turmaFilter, dueDateFilter, sortOrder, todayStr, turmas]);

  // Tasks grouped for Kanban
  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === 'todo'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter(t => t.status === 'in_progress'), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.status === 'completed'), [filteredTasks]);
  const deliveredTasks = useMemo(() => filteredTasks.filter(t => t.status === 'delivered'), [filteredTasks]);

  // Analytics Chart Data
  const categoryChartData = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    Object.keys(CATEGORY_CONFIG).forEach(cat => {
      counts[cat] = { total: 0, done: 0 };
    });
    tasks.forEach(t => {
      const cat = t.category || 'Geral';
      if (!counts[cat]) counts[cat] = { total: 0, done: 0 };
      counts[cat].total += 1;
      if (t.status === 'completed' || t.status === 'delivered') counts[cat].done += 1;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      total: data.total,
      done: data.done,
      pending: data.total - data.done,
      color: CATEGORY_CONFIG[name]?.color || '#64748b'
    })).filter(c => c.total > 0);
  }, [tasks]);

  const statusPieData = useMemo(() => {
    return [
      { name: 'A Fazer', value: todoCount, color: '#64748b' },
      { name: 'Em Andamento', value: inProgressCount, color: '#f59e0b' },
      { name: 'Concluídas', value: completedCount, color: '#10b981' },
      { name: 'Entregues', value: deliveredCount, color: '#3b82f6' }
    ].filter(d => d.value > 0);
  }, [todoCount, inProgressCount, completedCount, deliveredCount]);

  const priorityChartData = useMemo(() => {
    return [
      { name: 'Alta Prioridade', total: tasks.filter(t => t.priority === 'alta').length, done: tasks.filter(t => t.priority === 'alta' && (t.status === 'completed' || t.status === 'delivered')).length, color: '#ef4444' },
      { name: 'Média Prioridade', total: tasks.filter(t => t.priority === 'media').length, done: tasks.filter(t => t.priority === 'media' && (t.status === 'completed' || t.status === 'delivered')).length, color: '#f59e0b' },
      { name: 'Normal / Baixa', total: tasks.filter(t => t.priority === 'baixa').length, done: tasks.filter(t => t.priority === 'baixa' && (t.status === 'completed' || t.status === 'delivered')).length, color: '#64748b' }
    ];
  }, [tasks]);

  // Handlers
  const handleUpdateStatus = (taskId: string, newStatus: AdminTask['status']) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: (newStatus === 'completed' || newStatus === 'delivered') 
            ? (t.completedAt || new Date().toISOString().split('T')[0]) 
            : undefined
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleToggleTaskDone = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const isDone = target.status === 'completed' || target.status === 'delivered';
    handleUpdateStatus(taskId, isDone ? 'todo' : 'completed');
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId && t.checklist) {
        const newChecklist = t.checklist.map(ci => ci.id === itemId ? { ...ci, done: !ci.done } : ci);
        return {
          ...t,
          checklist: newChecklist
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (taskOrId: string | AdminTask) => {
    if (typeof taskOrId === 'string') {
      const found = tasks.find(t => t.id === taskOrId);
      if (found) {
        setTaskToDelete(found);
      }
    } else {
      setTaskToDelete(taskOrId);
    }
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const targetId = taskToDelete.id;
    const updated = tasks.filter(t => t.id !== targetId);
    onUpdateTasks(updated);
    setSelectedTaskIds(prev => prev.filter(id => id !== targetId));
    setTaskToDelete(null);
    if (editingTask?.id === targetId) {
      setIsModalOpen(false);
      setEditingTask(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: AdminTask['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleUpdateStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Inline Quick Add
  const handleQuickAdd = (status: AdminTask['status']) => {
    if (!quickAddTitle.trim()) {
      setQuickAddColumn(null);
      return;
    }
    const newTask: AdminTask = {
      id: `task-${Date.now()}`,
      title: quickAddTitle.trim(),
      status: status,
      priority: 'media',
      category: 'Geral',
      createdAt: new Date().toISOString().split('T')[0]
    };
    onUpdateTasks([newTask, ...tasks]);
    setQuickAddTitle('');
    setQuickAddColumn(null);
  };

  // Modal open helpers
  const handleOpenCreateModal = (defaultStatus: AdminTask['status'] = 'todo') => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPersonName('');
    setFormCourseName('');
    setFormStatus(defaultStatus);
    setFormPriority('media');
    setFormCategory('Geral');
    setFormDueDate('');
    setFormDueTime('');
    setFormTurmaId('');
    setFormAssignedTo('Admin WM2');
    setFormChecklist([]);
    setNewChecklistText('');
    setFormTags([]);
    setNewTagText('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: AdminTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormPersonName(task.personName || '');
    setFormCourseName(task.courseName || '');
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormCategory(task.category || 'Geral');
    setFormDueDate(task.dueDate || '');
    setFormDueTime(task.dueTime || '');
    setFormTurmaId(task.turmaId || '');
    setFormAssignedTo(task.assignedTo || '');
    setFormChecklist(task.checklist ? [...task.checklist] : []);
    setNewChecklistText('');
    setFormTags(task.tags ? [...task.tags] : []);
    setNewTagText('');
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Resolve course name if turmaId is chosen but courseName wasn't typed manually
    let resolvedCourseName = formCourseName.trim();
    if (!resolvedCourseName && formTurmaId) {
      const foundTurma = turmas.find(t => t.id === formTurmaId);
      if (foundTurma) {
        resolvedCourseName = `${foundTurma.name} (${foundTurma.institution})`;
      }
    }

    if (editingTask) {
      const updated = tasks.map(t => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            title: formTitle.trim(),
            description: formDesc.trim() || undefined,
            personName: formPersonName.trim() || undefined,
            courseName: resolvedCourseName || undefined,
            status: formStatus,
            priority: formPriority,
            category: formCategory,
            dueDate: formDueDate || undefined,
            dueTime: formDueTime || undefined,
            turmaId: formTurmaId || undefined,
            assignedTo: formAssignedTo.trim() || undefined,
            checklist: formChecklist.length > 0 ? formChecklist : undefined,
            tags: formTags.length > 0 ? formTags : undefined,
            completedAt: formStatus === 'completed' && !t.completedAt ? new Date().toISOString().split('T')[0] : (formStatus !== 'completed' ? undefined : t.completedAt)
          };
        }
        return t;
      });
      onUpdateTasks(updated);
    } else {
      const newTask: AdminTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        personName: formPersonName.trim() || undefined,
        courseName: resolvedCourseName || undefined,
        status: formStatus,
        priority: formPriority,
        category: formCategory,
        dueDate: formDueDate || undefined,
        dueTime: formDueTime || undefined,
        turmaId: formTurmaId || undefined,
        assignedTo: formAssignedTo.trim() || undefined,
        checklist: formChecklist.length > 0 ? formChecklist : undefined,
        tags: formTags.length > 0 ? formTags : undefined,
        createdAt: new Date().toISOString().split('T')[0],
        completedAt: formStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
      };
      onUpdateTasks([newTask, ...tasks]);
    }

    setIsModalOpen(false);
  };

  // Checklist helper in modal
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const item: AdminTaskChecklistItem = {
      id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newChecklistText.trim(),
      done: false
    };
    setFormChecklist([...formChecklist, item]);
    setNewChecklistText('');
  };

  // Tag helper in modal
  const handleAddTag = () => {
    if (!newTagText.trim()) return;
    const cleanTag = newTagText.trim().replace(/^#/, '');
    if (!formTags.includes(cleanTag)) {
      setFormTags([...formTags, cleanTag]);
    }
    setNewTagText('');
  };

  // Bulk actions
  const handleToggleSelectTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  const handleApplyBulkStatus = () => {
    if (selectedTaskIds.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const updated = tasks.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        return {
          ...t,
          status: bulkTargetStatus,
          completedAt: bulkTargetStatus === 'completed' ? today : undefined
        };
      }
      return t;
    });
    onUpdateTasks(updated);
    setBulkStatusModal(false);
    setSelectedTaskIds([]);
  };

  const handleApplyBulkPriority = () => {
    if (selectedTaskIds.length === 0) return;
    const updated = tasks.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        return {
          ...t,
          priority: bulkTargetPriority
        };
      }
      return t;
    });
    onUpdateTasks(updated);
    setBulkPriorityModal(false);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    setBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    const updated = tasks.filter(t => !selectedTaskIds.includes(t.id));
    onUpdateTasks(updated);
    setSelectedTaskIds([]);
    setBulkDeleteModal(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Título / Pendência', 'Pessoa / Formando', 'Curso / Turma', 'Status', 'Prioridade', 'Categoria', 'Prazo de Entrega', 'Horário', 'Responsável WM2', 'Checklist'];
    const rows = tasks.map(t => {
      const turmaObj = turmas.find(turma => turma.id === t.turmaId);
      const courseStr = t.courseName || (turmaObj ? turmaObj.name : '');
      const personStr = t.personName || t.assignedTo || '';
      const checklistStr = (t.checklist || []).map(c => `[${c.done ? 'X' : ' '}] ${c.text}`).join(' | ');
      return [
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${personStr.replace(/"/g, '""')}"`,
        `"${courseStr.replace(/"/g, '""')}"`,
        t.status === 'completed' ? 'Concluída' : t.status === 'in_progress' ? 'Em Andamento' : 'A Fazer',
        t.priority.toUpperCase(),
        t.category || 'Geral',
        t.dueDate || '',
        t.dueTime || '',
        `"${(t.assignedTo || '').replace(/"/g, '""')}"`,
        `"${checklistStr.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pendencias-wm2-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setTurmaFilter('all');
    setDueDateFilter('all');
    setSortOrder('dueDate_asc');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || turmaFilter !== 'all' || dueDateFilter !== 'all';

  // Helper for due date badge
  const getDueDateBadge = (dueDate?: string, dueTime?: string, status?: AdminTask['status']) => {
    if (!dueDate) {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] text-neutral-400 italic">
          <Calendar className="w-3 h-3 text-neutral-400" /> Sem prazo
        </span>
      );
    }
    const isCompleted = status === 'completed';
    const isDelivered = status === 'delivered';
    const isOverdue = dueDate < todayStr && !isCompleted && !isDelivered;
    const isToday = dueDate === todayStr && !isCompleted && !isDelivered;
    const parts = dueDate.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dueDate;
    const timeStr = dueTime ? ` às ${dueTime}h` : '';

    if (isDelivered) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
          <span>Entregue: {formattedDate}{timeStr}</span>
        </span>
      );
    }

    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Concluído: {formattedDate}{timeStr}</span>
        </span>
      );
    }

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Atrasada: {formattedDate}{timeStr}</span>
        </span>
      );
    }

    if (isToday) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Vence Hoje: {formattedDate}{timeStr}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-[10.5px] text-neutral-600 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded-md font-medium">
        <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
        <span>Prazo: {formattedDate}{timeStr}</span>
      </span>
    );
  };

  // Render a Single Card (Kanban & Timeline)
  const renderTaskCard = (task: AdminTask) => {
    const catConfig = CATEGORY_CONFIG[task.category || 'Geral'] || CATEGORY_CONFIG['Geral'];
    const CatIcon = catConfig.icon;
    const prioConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['media'];
    const matchedTurma = turmas.find(t => t.id === task.turmaId);
    const courseDisplayName = task.courseName || (matchedTurma ? `${matchedTurma.name} (${matchedTurma.institution || matchedTurma.year})` : null);
    const personDisplayName = task.personName || task.assignedTo || null;

    const checklistItems = task.checklist || [];
    const checklistDone = checklistItems.filter(c => c.done).length;
    const hasChecklist = checklistItems.length > 0;
    const isExpanded = expandedChecklistTaskId === task.id;

    const isCompleted = task.status === 'completed';
    const isDelivered = task.status === 'delivered';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        key={task.id}
        draggable
        onDragStart={(e: any) => handleDragStart(e, task.id)}
        className={`group bg-white border rounded-xl p-3.5 transition-all duration-200 relative cursor-grab active:cursor-grabbing flex flex-col justify-between ${
          isDelivered
            ? 'border-neutral-200 bg-white shadow-2xs hover:shadow-md'
            : isCompleted
            ? 'border-neutral-200 bg-white opacity-90 hover:opacity-100 shadow-2xs hover:shadow-md'
            : 'border-neutral-200 hover:border-neutral-300 shadow-2xs hover:shadow-md'
        }`}
      >
        <div>
          {/* Top Badges & Actions */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${catConfig.bgLight}`}>
                <CatIcon className="w-2.5 h-2.5 text-neutral-400" />
                {catConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${prioConfig.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${prioConfig.dotColor}`} />
                {prioConfig.label}
              </span>
              {isDelivered && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border bg-neutral-50 text-neutral-700 border-neutral-200">
                  <CheckCircle2 className="w-2.5 h-2.5 text-neutral-400" />
                  Entregue
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleOpenEditModal(task)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Editar Pendência"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 text-neutral-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                title="Excluir Pendência"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 1. O QUE É A PENDÊNCIA (Título, Checkbox & Descrição) */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <button
              type="button"
              onClick={() => handleToggleTaskDone(task.id)}
              className={`mt-0.5 shrink-0 rounded transition-colors cursor-pointer ${
                isDelivered
                  ? 'text-neutral-600'
                  : isCompleted
                  ? 'text-neutral-600'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title={isDelivered || isCompleted ? 'Reabrir pendência' : 'Marcar como concluída'}
            >
              {isDelivered || isCompleted ? (
                <CheckCircle2 className="w-4 h-4 fill-neutral-200 text-neutral-600" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-[9.5px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5 flex items-center gap-1">
                <span>Pendência:</span>
              </div>
              <h4
                onClick={() => handleOpenEditModal(task)}
                className={`text-xs font-bold leading-snug cursor-pointer transition-colors ${
                  isDelivered || isCompleted
                    ? 'line-through text-neutral-400'
                    : 'text-neutral-900 hover:text-neutral-600'
                }`}
              >
                {task.title}
              </h4>

              {task.description && (
                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* 2 & 3. PESSOA E CURSO (Destaques Claros em Cards Brancos) */}
          <div className="space-y-1.5 mb-2.5">
            {/* 2. NOME DA PESSOA */}
            <div className="flex items-center gap-2 text-[11px] bg-white border border-neutral-200/90 px-2.5 py-1.5 rounded-lg shadow-2xs">
              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <div className="truncate flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase text-neutral-400 block leading-tight">
                  Pessoa / Formando
                </span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {personDisplayName || 'Não especificada'}
                </span>
              </div>
            </div>

            {/* 3. CURSO / TURMA */}
            <div className="flex items-center gap-2 text-[11px] bg-white border border-neutral-200/90 px-2.5 py-1.5 rounded-lg shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <div className="truncate flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase text-neutral-400 block leading-tight">
                  Curso / Turma
                </span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {courseDisplayName || 'Geral (Todas as Turmas)'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Checklist Section */}
          {hasChecklist && (
            <div className="mb-2.5 bg-white border border-neutral-200/90 rounded-lg p-2 shadow-2xs">
              <div
                onClick={() => setExpandedChecklistTaskId(isExpanded ? null : task.id)}
                className="flex items-center justify-between text-[10.5px] font-semibold text-neutral-700 cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3 h-3 text-neutral-400" /> Checklist ({checklistDone}/{checklistItems.length})
                </span>
                <span className="text-neutral-400 hover:text-neutral-700">
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </div>

              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-neutral-500 h-full transition-all duration-300"
                  style={{ width: `${(checklistDone / checklistItems.length) * 100}%` }}
                />
              </div>

              {isExpanded && (
                <div className="mt-2 space-y-1 pt-1 border-t border-neutral-100">
                  {checklistItems.map(ci => (
                    <div
                      key={ci.id}
                      onClick={() => handleToggleChecklistItem(task.id, ci.id)}
                      className="flex items-center gap-2 text-[10.5px] cursor-pointer hover:text-neutral-900"
                    >
                      <button
                        type="button"
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          ci.done
                            ? 'bg-neutral-800 border-neutral-800 text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {ci.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <span className={`truncate ${ci.done ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                        {ci.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {task.tags.map((t, idx) => (
                <span key={idx} className="text-[9.5px] bg-neutral-50 text-neutral-600 px-1.5 py-0.5 rounded font-medium border border-neutral-200">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. PRAZO DA ENTREGA (Rodapé em Destaque) */}
        <div className="pt-2.5 border-t border-neutral-100 space-y-2">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] font-bold text-neutral-400 uppercase">Prazo:</span>
              {getDueDateBadge(task.dueDate, task.dueTime, task.status)}
            </div>

            {/* Quick Stage Flow Buttons (Neutral & Colorless) */}
            {task.status === 'todo' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                className="text-[10.5px] font-semibold text-neutral-700 bg-white hover:bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Mover para Em Andamento"
              >
                <span>Andamento</span> <ArrowRight className="w-3 h-3 text-neutral-400" />
              </button>
            )}

            {task.status === 'in_progress' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(task.id, 'todo')}
                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer"
                  title="Voltar para A Fazer"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(task.id, 'completed')}
                  className="text-[10.5px] font-semibold text-neutral-700 bg-white hover:bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Concluir"
                >
                  <span>Concluir</span> <Check className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
            )}

            {task.status === 'completed' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer"
                  title="Voltar para Em Andamento"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(task.id, 'delivered')}
                  className="text-[10.5px] font-semibold text-neutral-700 bg-white hover:bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Marcar como Entregue"
                >
                  <span>Entregar</span> <Check className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
            )}

            {task.status === 'delivered' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(task.id, 'completed')}
                  className="text-[10.5px] font-semibold text-neutral-700 bg-white hover:bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Voltar para Concluídas"
                >
                  <RefreshCw className="w-3 h-3 text-neutral-400" /> <span>Reabrir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4" id="task-manager-container">
      {/* Header Bar matching CRM */}
      <div className="flex justify-between items-center flex-wrap gap-3 pb-1 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#aa904f]" />
            Gestão de Pendências & Checklist Operacional
          </h3>
          <p className="text-xs text-neutral-500">
            Fluxos de produção, cronogramas de baile, pagamentos e controle diário de entregas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              showAnalyticsPanel 
                ? 'bg-[#543d03] text-[#ebe0b2] border-[#543d03]'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-2xs'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5 text-neutral-500" />
            Métricas & Diagnóstico
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="Exportar pendências em planilha CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" /> Exportar CSV
          </button>

          <button
            onClick={() => handleOpenCreateModal('todo')}
            className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer border-none transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Pendência
          </button>
        </div>
      </div>

      {/* KPI Cards Row - Clean White Style matching CRM */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
        {/* Total Pendencias */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Total de Pendências</span>
          <div className="text-base font-black text-neutral-900 mt-0.5">
            {totalTasks}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Cadastradas no sistema</span>
        </div>

        {/* A Fazer */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">A Fazer (Backlog)</span>
          <div className="text-base font-black text-neutral-800 mt-0.5">
            {todoCount}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Aguardando início</span>
        </div>

        {/* Em Andamento */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Em Andamento</span>
          <div className="text-base font-black text-amber-600 mt-0.5">
            {inProgressCount}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Em execução ativa</span>
        </div>

        {/* Concluídas */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Concluídas</span>
          <div className="text-base font-black text-emerald-600 mt-0.5">
            {completedCount}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Etapa finalizada</span>
        </div>

        {/* Entregue */}
        <div className="bg-white border border-neutral-200/90 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 block">Entregue</span>
          <div className="text-base font-black text-blue-600 mt-0.5">
            {deliveredCount}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Conclusão entregue</span>
        </div>

        {/* Atrasadas */}
        <div className={`p-3.5 rounded-xl border transition-all shadow-2xs bg-white ${
          overdueTasks.length > 0 ? 'border-rose-300 ring-1 ring-rose-400/20' : 'border-neutral-200/90'
        }`}>
          <span className="text-[11px] font-semibold text-neutral-500 block">Atrasadas</span>
          <div className={`text-base font-black mt-0.5 ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-neutral-900'}`}>
            {overdueTasks.length} {overdueTasks.length === 1 ? 'Pendência' : 'Pendências'}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">Prazo expirado</span>
        </div>

        {/* Vencem Hoje / Alta Prioridade */}
        <div 
          onClick={() => setDueDateFilter(dueDateFilter === 'today' ? 'all' : 'today')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs bg-white ${
            todayTasks.length > 0
              ? dueDateFilter === 'today'
                ? 'border-amber-500 ring-2 ring-amber-400/30'
                : 'border-amber-300 hover:border-amber-400'
              : 'border-neutral-200/90'
          }`}
          title="Clique para filtrar apenas pendências para hoje"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 block">Vencem Hoje</span>
            {todayTasks.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
          </div>
          <div className={`text-base font-black mt-0.5 ${todayTasks.length > 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
            {todayTasks.length} {todayTasks.length === 1 ? 'Pendência' : 'Pendências'}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
            {highPriorityTasks.length} com prioridade alta
          </span>
        </div>
      </div>

      {/* Dynamic Urgent / Overdue Tasks Alert Banner */}
      {urgentAlerts.length > 0 && showAlertBanner && (
        <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold shrink-0">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                  <span>Atenção Operacional: {urgentAlerts.length} {urgentAlerts.length === 1 ? 'pendência prioritária ou com prazo crítico' : 'pendências prioritárias ou com prazos críticos'}</span>
                  {overdueTasks.length > 0 && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200">
                      {overdueTasks.length} atrasada{overdueTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-neutral-600">
                  Acompanhe e conclua estas entregas para evitar atrasos na produção dos eventos e atendimento aos formandos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDueDateFilter(dueDateFilter === 'overdue' ? 'all' : 'overdue')}
                className="text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg border border-neutral-200 cursor-pointer transition-colors"
              >
                {dueDateFilter === 'overdue' ? 'Exibir Todas' : 'Filtrar Apenas Atrasadas'}
              </button>
              <button
                type="button"
                onClick={() => setShowAlertBanner(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-bold px-1.5 py-0.5 cursor-pointer"
                title="Ocultar banner"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Alert Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 border-t border-neutral-100">
            {urgentAlerts.slice(0, 3).map(task => {
              const matchedTurma = turmas.find(t => t.id === task.turmaId);
              return (
                <div key={task.id} className="bg-white border border-neutral-200 rounded-lg p-2.5 flex flex-col justify-between text-xs space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-neutral-900 truncate max-w-[170px]" title={task.title}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                        task.dueDate < todayStr ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.dueDate < todayStr ? 'Atrasada' : 'Hoje'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    {matchedTurma ? `Turma: ${matchedTurma.name}` : (task.category || 'Geral')} • {task.assignedTo || 'Sem responsável'}
                  </p>
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(task)}
                      className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                    >
                      Editar / Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer border-none shadow-2xs"
                    >
                      <Check className="w-2.5 h-2.5" /> Concluir Agora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Diagnostics Panel (Collapsible) */}
      <AnimatePresence>
        {showAnalyticsPanel && (
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
                  Diagnóstico Operacional & Distribuição de Pendências
                </h4>
              </div>
              <button
                onClick={() => setShowAnalyticsPanel(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-medium cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any, name: any) => [`${val} pendência(s)`, name]}
                      contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {categoryChartData.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px]">
                      <strong className="text-emerald-700">{cat.done}</strong> / {cat.total} concluídas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control & Filter Toolbar */}
      <div className="bg-white border border-neutral-200 p-4 rounded-2xl space-y-3.5 shadow-2xs">
        {/* Row 1: Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por título, formando, curso, responsável, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-50/70 border border-neutral-200 pl-10 pr-8 py-2.5 rounded-xl w-full outline-none text-neutral-800 placeholder-neutral-400 font-medium text-xs focus:border-[#aa904f] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 shadow-2xs shrink-0 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'kanban'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'table'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'timeline'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Linha do Tempo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('charts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                viewMode === 'charts'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Gráficos
            </button>
          </div>
        </div>

        {/* Row 2: Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setDueDateFilter('all');
              setPriorityFilter('all');
            }}
            className={`px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === 'all' && dueDateFilter === 'all' && priorityFilter === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            Todas ({tasks.length})
          </button>

          {overdueTasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setDueDateFilter(dueDateFilter === 'overdue' ? 'all' : 'overdue');
                if (dueDateFilter !== 'overdue') setStatusFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                dueDateFilter === 'overdue'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>🚨 Atrasadas</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-200/70 text-rose-900">
                {overdueTasks.length}
              </span>
            </button>
          )}

          {todayTasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setDueDateFilter(dueDateFilter === 'today' ? 'all' : 'today');
                if (dueDateFilter !== 'today') setStatusFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                dueDateFilter === 'today'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>⏰ Vencem Hoje</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200/70 text-amber-900">
                {todayTasks.length}
              </span>
            </button>
          )}

          {highPriorityTasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPriorityFilter(priorityFilter === 'alta' ? 'all' : 'alta');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                priorityFilter === 'alta'
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <span>🔴 Alta Prioridade</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                {highPriorityTasks.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
              statusFilter === 'in_progress'
                ? 'bg-neutral-800 text-white border-neutral-800'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <span>⚡ Em Andamento</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
              {inProgressCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
              statusFilter === 'completed'
                ? 'bg-neutral-800 text-white border-neutral-800'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <span>✅ Concluídas</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Row 3: Structured Filter Selects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-neutral-100">
          {/* 1. Status Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-50/70 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="todo">📋 A Fazer</option>
              <option value="in_progress">⚡ Em Andamento</option>
              <option value="completed">✅ Concluídas</option>
              <option value="delivered">📦 Entregue</option>
            </select>
          </div>

          {/* 2. Category Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-neutral-50/70 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Eventos">Eventos</option>
              <option value="Fornecedores">Fornecedores</option>
              <option value="Fotografia">Fotografia</option>
              <option value="Contratos">Contratos</option>
              <option value="Atendimento">Atendimento</option>
              <option value="Geral">Geral</option>
            </select>
          </div>

          {/* 3. Priority Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Prioridade
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-neutral-50/70 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="alta">🔴 Alta Prioridade</option>
              <option value="media">🟡 Média Prioridade</option>
              <option value="baixa">🟢 Normal / Baixa</option>
            </select>
          </div>

          {/* 4. Turma Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Turma
            </label>
            <select
              value={turmaFilter}
              onChange={(e) => setTurmaFilter(e.target.value)}
              className="w-full bg-neutral-50/70 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] focus:bg-white transition-all cursor-pointer truncate"
            >
              <option value="all">Todas as Turmas</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* 5. Due Date Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Prazo
            </label>
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as any)}
              className="w-full bg-neutral-50/70 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todos os Prazos</option>
              <option value="overdue">🚨 Apenas Atrasadas</option>
              <option value="today">⏰ Vencem Hoje</option>
              <option value="upcoming">📅 Próximas Entregas</option>
            </select>
          </div>

          {/* 6. Sort Order */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Ordenar por
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-neutral-50/70 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="dueDate_asc">Prazo Mais Próximo</option>
              <option value="priority_desc">Maior Prioridade</option>
              <option value="newest">Mais Recentes</option>
              <option value="title_asc">Alfabética (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Row 4: Active Filter Badges & Reset Button & Table Bulk Selection */}
        {(hasActiveFilters || (selectedTaskIds.length > 0 && viewMode === 'table')) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-100 text-[11px]">
            <div className="flex flex-wrap items-center gap-2 text-neutral-600 font-medium">
              {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-neutral-500">Filtros aplicados:</span>
                  {statusFilter !== 'all' && (
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200 text-[10.5px] flex items-center gap-1">
                      Status: {statusFilter}
                      <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-rose-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200 text-[10.5px] flex items-center gap-1">
                      Cat: {categoryFilter}
                      <button type="button" onClick={() => setCategoryFilter('all')} className="hover:text-rose-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {priorityFilter !== 'all' && (
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200 text-[10.5px] flex items-center gap-1">
                      Prio: {priorityFilter}
                      <button type="button" onClick={() => setPriorityFilter('all')} className="hover:text-rose-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {turmaFilter !== 'all' && (
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200 text-[10.5px] flex items-center gap-1">
                      Turma: {turmas.find(t => t.id === turmaFilter)?.name || turmaFilter}
                      <button type="button" onClick={() => setTurmaFilter('all')} className="hover:text-rose-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {dueDateFilter !== 'all' && (
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200 text-[10.5px] flex items-center gap-1">
                      Prazo: {dueDateFilter}
                      <button type="button" onClick={() => setDueDateFilter('all')} className="hover:text-rose-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200 text-[10.5px] flex items-center gap-1">
                      Busca: "{searchQuery}"
                      <button type="button" onClick={() => setSearchQuery('')} className="hover:text-rose-600 cursor-pointer">×</button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer ml-1"
                  >
                    Limpar tudo
                  </button>
                </div>
              )}
            </div>

            {selectedTaskIds.length > 0 && viewMode === 'table' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900">
                  {selectedTaskIds.length} selecionada(s)
                </span>
                <button
                  type="button"
                  onClick={() => setBulkStatusModal(true)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-2.5 py-1 rounded-md border border-neutral-300 cursor-pointer"
                >
                  Alterar Status
                </button>
                <button
                  type="button"
                  onClick={() => setBulkPriorityModal(true)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-2.5 py-1 rounded-md border border-neutral-300 cursor-pointer"
                >
                  Alterar Prioridade
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md border border-rose-200 cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: KANBAN BOARD (HTML5 Drag & Drop) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {STAGE_CONFIG.map(stage => {
            const columnTasks = 
              stage.id === 'todo' 
                ? todoTasks 
                : stage.id === 'in_progress' 
                ? inProgressTasks 
                : stage.id === 'completed' 
                ? completedTasks 
                : deliveredTasks;
            const isDragOver = dragOverColumn === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`bg-white border rounded-2xl p-3.5 flex flex-col space-y-3 min-h-[550px] shadow-2xs transition-all duration-200 ${
                  isDragOver 
                    ? 'border-[#aa904f] bg-[#fdfaf2]/90 ring-2 ring-[#aa904f]/20 shadow-md' 
                    : 'border-neutral-200'
                }`}
              >
                {/* Column Header matching CRM */}
                <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      {stage.label}
                    </h4>
                    <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-200/80">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddColumn(stage.id);
                      setQuickAddTitle('');
                    }}
                    className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Adicionar pendência rápida nesta coluna"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {/* Inline Quick Add */}
                {quickAddColumn === stage.id && (
                  <div className="bg-white p-3 rounded-xl border border-neutral-300 shadow-sm space-y-2">
                    <input
                      type="text"
                      autoFocus
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAdd(stage.id);
                        if (e.key === 'Escape') setQuickAddColumn(null);
                      }}
                      placeholder={`Nova pendência em "${stage.label}"...`}
                      className="w-full text-xs font-semibold bg-transparent outline-none text-neutral-900"
                    />
                    <div className="flex items-center justify-end gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setQuickAddColumn(null)}
                        className="px-2.5 py-1 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(stage.id)}
                        className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-md shadow-xs cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                )}

                {/* Task List in column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[75vh] pr-0.5">
                  <AnimatePresence>
                    {columnTasks.map(task => renderTaskCard(task))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && quickAddColumn !== stage.id && (
                    <div className="py-16 text-center text-neutral-400 text-xs flex flex-col items-center justify-center">
                      <CheckSquare className="w-8 h-8 text-neutral-300 mb-2 stroke-[1.5]" />
                      <span>Nenhuma pendência nesta etapa</span>
                      <button
                        onClick={() => {
                          setQuickAddColumn(stage.id);
                          setQuickAddTitle('');
                        }}
                        className="mt-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 hover:underline"
                      >
                        + Criar pendência aqui
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW WITH BULK SELECTION (Matching CRM Table) */}
      {viewMode === 'table' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleToggleSelectAll}
                      className="accent-[#aa904f] rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Pendência (O que é)</th>
                  <th className="py-3 px-4">Pessoa / Formando</th>
                  <th className="py-3 px-4">Curso / Turma</th>
                  <th className="py-3 px-4">Prazo de Entrega</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Responsável WM2</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-neutral-400 font-medium italic">
                      Nenhuma pendência encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    const matchedTurma = turmas.find(t => t.id === task.turmaId);
                    const courseDisplayName = task.courseName || (matchedTurma ? matchedTurma.name : 'Geral');
                    const personDisplayName = task.personName || task.assignedTo || 'Não especificada';
                    const catConfig = CATEGORY_CONFIG[task.category || 'Geral'] || CATEGORY_CONFIG['Geral'];
                    const CatIcon = catConfig.icon;
                    const prioConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['media'];

                    return (
                      <tr key={task.id} className={`hover:bg-neutral-50/80 transition-colors ${isSelected ? 'bg-amber-50/50' : ''}`}>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectTask(task.id)}
                            className="accent-[#aa904f] rounded cursor-pointer"
                          />
                        </td>

                        {/* Title & Checkbox */}
                        <td className="py-3.5 px-4 font-bold text-neutral-900 max-w-[240px]">
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskDone(task.id)}
                              className={`mt-0.5 shrink-0 cursor-pointer ${
                                task.status === 'delivered'
                                  ? 'text-blue-600'
                                  : task.status === 'completed'
                                  ? 'text-emerald-600'
                                  : 'text-neutral-400 hover:text-[#aa904f]'
                              }`}
                            >
                              {task.status === 'delivered' ? (
                                <CheckCircle2 className="w-4 h-4 fill-blue-500/20 text-blue-600" />
                              ) : task.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 fill-emerald-500/20 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <span 
                                onClick={() => handleOpenEditModal(task)}
                                className={`cursor-pointer hover:underline block leading-snug ${
                                  task.status === 'completed' || task.status === 'delivered'
                                    ? 'line-through text-neutral-400' 
                                    : 'text-neutral-900'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-[10px] text-neutral-500 font-normal line-clamp-1 mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Pessoa / Formando */}
                        <td className="py-3.5 px-4 text-neutral-800">
                          <div className="flex items-center gap-1.5 font-semibold text-xs truncate max-w-[150px]" title={personDisplayName}>
                            <User className="w-3 h-3 text-[#aa904f] shrink-0" />
                            <span className="truncate">{personDisplayName}</span>
                          </div>
                        </td>

                        {/* Curso / Turma */}
                        <td className="py-3.5 px-4 text-neutral-700">
                          <div className="flex items-center gap-1.5 text-xs truncate max-w-[150px]" title={courseDisplayName}>
                            <GraduationCap className="w-3 h-3 text-[#8d1811] shrink-0" />
                            <span className="font-semibold text-neutral-900 truncate">{courseDisplayName}</span>
                          </div>
                        </td>

                        {/* Prazo */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getDueDateBadge(task.dueDate, task.dueTime, task.status)}
                        </td>

                        {/* Categoria */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${catConfig.bgLight}`}>
                            <CatIcon className="w-2.5 h-2.5" /> {catConfig.label}
                          </span>
                        </td>

                        {/* Prioridade */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${prioConfig.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${prioConfig.dotColor}`} />
                            {prioConfig.label}
                          </span>
                        </td>

                        {/* Responsável */}
                        <td className="py-3.5 px-4 text-neutral-700 text-xs">
                          {task.assignedTo ? (
                            <span className="font-semibold">{task.assignedTo}</span>
                          ) : (
                            <span className="text-neutral-400 italic">Não atribuído</span>
                          )}
                        </td>

                        {/* Status Switcher */}
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider outline-none border cursor-pointer ${
                              task.status === 'delivered'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : task.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : task.status === 'in_progress'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="todo">A Fazer</option>
                            <option value="in_progress">Em Andamento</option>
                            <option value="completed">Concluída</option>
                            <option value="delivered">Entregue</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1 text-neutral-400 hover:text-neutral-800 rounded hover:bg-neutral-200/50"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
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
      )}

      {/* VIEW 3: TIMELINE / CHRONOLOGICAL VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Pendências Vencidas ({overdueTasks.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {overdueTasks.map(task => renderTaskCard(task))}
              </div>
            </div>
          )}

          {/* Today Section */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" /> Para Entregar Hoje ({todayTasks.length})
            </h4>
            {todayTasks.length === 0 ? (
              <p className="text-xs text-amber-800/70 italic py-2">Nenhuma pendência com prazo para hoje.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayTasks.map(task => renderTaskCard(task))}
              </div>
            )}
          </div>

          {/* Future / Backlog Section */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#aa904f]" /> Próximas Entregas & Backlog
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTasks
                .filter(t => !overdueTasks.includes(t) && !todayTasks.includes(t))
                .map(task => renderTaskCard(task))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CHARTS & ANALYTICS VIEW */}
      {viewMode === 'charts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Performance BarChart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#aa904f]" /> Pendências por Categoria (Concluídas vs Total)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="done" name="Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Distribution Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#aa904f]" /> Distribuição por Prioridade
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="total" name="Total Cadastradas" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="done" name="Finalizadas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#aa904f]">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {editingTask ? 'Editar Pendência Operacional' : 'Cadastrar Nova Pendência'}
                  </h4>
                  <p className="text-[10px] text-neutral-500">Defina título, categoria, prazos, turmas e sub-checklists</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              {/* Title & Description */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  O que é a Pendência (Título) *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Assinatura de termo de colação, Pagamento de taxa extra..."
                  className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded-lg text-xs font-bold outline-none focus:border-[#aa904f] text-neutral-900 focus:bg-white transition-all"
                />
              </div>

              {/* Person & Course Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#fdfaf2] border border-[#d2c595]/80 p-3 rounded-xl">
                <div>
                  <label className="block text-[10px] font-extrabold text-[#705510] uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#aa904f]" /> Nome da Pessoa / Formando
                  </label>
                  <input
                    type="text"
                    value={formPersonName}
                    onChange={(e) => setFormPersonName(e.target.value)}
                    placeholder="Ex: Beatriz Lima, Lucas Andrade..."
                    className="w-full bg-white border border-[#d2c595] p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] text-neutral-900 shadow-2xs"
                  />
                  {formandos && formandos.length > 0 && (
                    <div className="mt-1">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const found = formandos.find(f => f.id === val || f.name === val);
                            if (found) {
                              setFormPersonName(found.name);
                              if (found.turmaId) {
                                setFormTurmaId(found.turmaId);
                                const fTurma = turmas.find(t => t.id === found.turmaId);
                                if (fTurma) {
                                  setFormCourseName(`${fTurma.name} (${fTurma.institution || fTurma.year})`);
                                }
                              }
                            }
                          }
                        }}
                        className="w-full text-[10px] text-neutral-600 bg-white/80 border border-neutral-200 rounded px-1.5 py-1 outline-none cursor-pointer"
                      >
                        <option value="">-- Ou selecione um formando cadastrado --</option>
                        {formandos.map(f => {
                          const fTurma = turmas.find(t => t.id === f.turmaId);
                          return (
                            <option key={f.id} value={f.id}>
                              {f.name} {fTurma ? `(${fTurma.name})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-[#705510] uppercase mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-[#8d1811]" /> Curso / Turma
                  </label>
                  <input
                    type="text"
                    value={formCourseName}
                    onChange={(e) => setFormCourseName(e.target.value)}
                    placeholder="Ex: Medicina 2026 - FAMERP, Direito USP..."
                    className="w-full bg-white border border-[#d2c595] p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] text-neutral-900 shadow-2xs"
                  />
                  {turmas && turmas.length > 0 && (
                    <div className="mt-1">
                      <select
                        value={formTurmaId}
                        onChange={(e) => {
                          const tId = e.target.value;
                          setFormTurmaId(tId);
                          if (tId) {
                            const foundT = turmas.find(t => t.id === tId);
                            if (foundT) {
                              setFormCourseName(`${foundT.name} (${foundT.institution || foundT.year})`);
                            }
                          }
                        }}
                        className="w-full text-[10px] text-neutral-600 bg-white/80 border border-neutral-200 rounded px-1.5 py-1 outline-none cursor-pointer"
                      >
                        <option value="">-- Ou selecione da lista de Turmas --</option>
                        {turmas.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.institution})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Descrição / Orientações da Pendência
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detalhes operacionais sobre o que deve ser feito..."
                  className="w-full bg-slate-50 border border-neutral-200 p-2.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 focus:bg-white transition-all"
                />
              </div>

              {/* Status, Priority & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] text-neutral-900"
                  >
                    <option value="todo">📋 A Fazer</option>
                    <option value="in_progress">⚡ Em Andamento</option>
                    <option value="completed">✅ Concluída</option>
                    <option value="delivered">📦 Entregue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] text-neutral-900"
                  >
                    <option value="alta">🔴 Alta Prioridade</option>
                    <option value="media">🟡 Média</option>
                    <option value="baixa">🟢 Normal / Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f] text-neutral-900"
                  >
                    <option value="Financeiro">💰 Financeiro</option>
                    <option value="Eventos">🎉 Eventos</option>
                    <option value="Fornecedores">🤝 Fornecedores</option>
                    <option value="Fotografia">📸 Fotografia</option>
                    <option value="Contratos">📄 Contratos</option>
                    <option value="Atendimento">💬 Atendimento</option>
                    <option value="Geral">📦 Geral</option>
                  </select>
                </div>
              </div>

              {/* Due Date, Time & Assigned To */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Prazo de Entrega (Data)
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Horário Limite
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Responsável WM2
                  </label>
                  <input
                    type="text"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    placeholder="Ex: Financeiro WM2..."
                    className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                  />
                </div>
              </div>

              {/* Sub-Checklist Builder */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                  Sub-itens de Checklist
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    placeholder="Adicionar etapa ou item do checklist..."
                    className="flex-1 bg-slate-50 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                  >
                    + Adicionar
                  </button>
                </div>

                {formChecklist.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto bg-neutral-50 border border-neutral-200 rounded-lg p-2">
                    {formChecklist.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded border border-neutral-200 text-[11px] text-neutral-800">
                        <span className="truncate flex items-center gap-1.5">
                          <span className="text-[#aa904f] font-bold">#{idx + 1}</span> {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormChecklist(formChecklist.filter(ci => ci.id !== item.id))}
                          className="text-neutral-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-bold text-neutral-600 uppercase">
                  Tags / Marcadores
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ex: Cobrança, Fotos, Baile..."
                    className="flex-1 bg-slate-50 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                  >
                    + Tag
                  </button>
                </div>

                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10.5px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setFormTags(formTags.filter(t => t !== tag))}
                          className="text-neutral-400 hover:text-rose-600 ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTaskToDelete(editingTask);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Excluir Pendência
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#aa904f] hover:bg-[#967e3a] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {editingTask ? 'Salvar Alterações' : 'Cadastrar Pendência'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SINGLE TASK MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900">
                  Excluir Pendência?
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir permanentemente a pendência <strong className="text-neutral-900 break-words">"{taskToDelete.title}"</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-3.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK DELETE MODAL */}
      {bulkDeleteModal && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900">
                  Excluir Pendências Selecionadas?
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir as <strong className="text-rose-600 font-extrabold">{selectedTaskIds.length}</strong> pendências selecionadas? Esta ação é irreversível.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBulkDeleteModal(false)}
                className="px-3.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir {selectedTaskIds.length} Itens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK STATUS MODAL */}
      {bulkStatusModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-4">
            <h4 className="text-sm font-bold text-neutral-900">
              Alterar Status em Massa ({selectedTaskIds.length} selecionadas)
            </h4>
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Novo Status:</label>
              <select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f]"
              >
                <option value="todo">📋 A Fazer</option>
                <option value="in_progress">⚡ Em Andamento</option>
                <option value="completed">✅ Concluídas</option>
                <option value="delivered">📦 Entregue</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBulkStatusModal(false)}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyBulkStatus}
                className="px-3.5 py-1.5 bg-[#aa904f] hover:bg-[#967e3a] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PRIORITY MODAL */}
      {bulkPriorityModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-4">
            <h4 className="text-sm font-bold text-neutral-900">
              Alterar Prioridade em Massa ({selectedTaskIds.length} selecionadas)
            </h4>
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Nova Prioridade:</label>
              <select
                value={bulkTargetPriority}
                onChange={(e) => setBulkTargetPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-neutral-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-[#aa904f]"
              >
                <option value="alta">🔴 Alta Prioridade</option>
                <option value="media">🟡 Média</option>
                <option value="baixa">🟢 Normal / Baixa</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBulkPriorityModal(false)}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyBulkPriority}
                className="px-3.5 py-1.5 bg-[#aa904f] hover:bg-[#967e3a] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
