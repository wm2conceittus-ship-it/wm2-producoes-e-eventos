import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Copy, 
  Download, 
  Building, 
  Users, 
  DollarSign, 
  Layers, 
  Sparkles, 
  List, 
  LayoutGrid, 
  CheckCircle2, 
  FileSpreadsheet,
  Tag,
  ArrowUpDown,
  Filter,
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { Pacote, Turma, Formando, Parcela, Evento, Fornecedor } from '../types';

interface PackagesManagerProps {
  turmas: Turma[];
  formandos: Formando[];
  parcelas: Parcela[];
  eventos: Evento[];
  fornecedores: Fornecedor[];
  pacotes: Pacote[];
  onUpdateState: (newState: any) => void;
  presetTurmaId?: string | null;
  onClearPresetTurma?: () => void;
}

export const COMMON_PACKAGE_ITEMS_SUGGESTIONS = [
  '🎓 Beca Oficial & Capelo',
  '🎉 Baile de Gala (10 Convites)',
  '🎉 Baile de Gala (5 Convites)',
  '📸 Álbum Fotográfico Encadernado de Luxo',
  '📷 Ensaio Fotográfico Externo Individual',
  '🏛️ Colação de Grau Oficial Solene',
  '🍸 Coquetel & Jantar de Recepção',
  '🍹 Open Bar Internacional com Drinks',
  '🎵 Atração Principal Banda Baile + DJ',
  '🏆 Placa de Formatura em Aço Escovado',
  '💌 Convite de Gala Digital e Físico Luxo',
  '🎁 Kit Formando (Caneca Térmica, Tirante e Brindes)',
  '🎬 Cobertura de Vídeo e Teaser Cinematográfico',
  '✨ Cenografia Temática e Decoração Floral',
  '🛡️ Segurança Privada, Recepcionistas e Staff Completo'
];

export const PackagesManager: React.FC<PackagesManagerProps> = ({
  turmas,
  formandos,
  parcelas,
  eventos,
  fornecedores,
  pacotes,
  onUpdateState,
  presetTurmaId,
  onClearPresetTurma
}) => {
  // Filters & State
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<string>(presetTurmaId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'name' | 'students_desc'>('price_desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Form Fields
  const [formTurmaId, setFormTurmaId] = useState<string>(turmas[0]?.id || '');
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(8500);
  const [formItems, setFormItems] = useState<string[]>([]);
  const [newItemInput, setNewItemInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [showQuickItems, setShowQuickItems] = useState<boolean>(true);

  // Custom Delete Confirm Dialog
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Synchronize presetTurmaId if passed
  React.useEffect(() => {
    if (presetTurmaId) {
      setSelectedTurmaFilter(presetTurmaId);
      setFormTurmaId(presetTurmaId);
    }
  }, [presetTurmaId]);

  // Calculations & Analytics
  const studentPackageCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    formandos.forEach(std => {
      if (std.packageSelected) {
        // Formandos might have package string matching name or composite "Pacote X + Pacote Y"
        pacotes.forEach(p => {
          if (std.packageSelected.includes(p.name)) {
            map[p.id] = (map[p.id] || 0) + 1;
          }
        });
      }
    });
    return map;
  }, [formandos, pacotes]);

  // Filtered and Sorted Packages
  const filteredPackages = useMemo(() => {
    let result = pacotes.filter(pkg => {
      // Turma filter
      if (selectedTurmaFilter !== 'all' && pkg.turmaId !== selectedTurmaFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const turma = turmas.find(t => t.id === pkg.turmaId);
        const turmaName = turma?.name?.toLowerCase() || '';
        const name = pkg.name?.toLowerCase() || '';
        const desc = pkg.description?.toLowerCase() || '';
        const items = (pkg.items || []).join(' ').toLowerCase();
        return name.includes(query) || desc.includes(query) || items.includes(query) || turmaName.includes(query);
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'students_desc') {
        const countA = studentPackageCountMap[a.id] || 0;
        const countB = studentPackageCountMap[b.id] || 0;
        return countB - countA;
      }
      return 0;
    });

    return result;
  }, [pacotes, selectedTurmaFilter, searchQuery, sortBy, turmas, studentPackageCountMap]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCount = pacotes.length;
    const avgPrice = totalCount > 0 ? pacotes.reduce((sum, p) => sum + p.price, 0) / totalCount : 0;
    
    // Find most popular
    let mostPopularPkg: Pacote | null = null;
    let maxSubscribers = -1;
    pacotes.forEach(p => {
      const count = studentPackageCountMap[p.id] || 0;
      if (count > maxSubscribers) {
        maxSubscribers = count;
        mostPopularPkg = p;
      }
    });

    const uniqueTurmasWithPackages = new Set(pacotes.map(p => p.turmaId)).size;
    const totalStudentsSubscribed = Object.values(studentPackageCountMap).reduce((a, b) => a + b, 0);

    return {
      totalCount,
      avgPrice,
      mostPopularPkg,
      maxSubscribers: maxSubscribers > 0 ? maxSubscribers : 0,
      uniqueTurmasWithPackages,
      totalStudentsSubscribed
    };
  }, [pacotes, studentPackageCountMap]);

  // Handlers for Add / Edit / Delete
  const handleOpenCreateModal = (targetTurmaId?: string) => {
    setEditingPackageId(null);
    setFormTurmaId(targetTurmaId || (selectedTurmaFilter !== 'all' ? selectedTurmaFilter : turmas[0]?.id || ''));
    setFormName('');
    setFormDescription('');
    setFormPrice(8500);
    setFormItems([
      'Baile de Gala Oficial (10 Convites)',
      'Colação de Grau Solene',
      'Beca Oficial Completa'
    ]);
    setNewItemInput('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: Pacote) => {
    setEditingPackageId(pkg.id);
    setFormTurmaId(pkg.turmaId);
    setFormName(pkg.name);
    setFormDescription(pkg.description || '');
    setFormPrice(pkg.price);
    setFormItems(pkg.items ? [...pkg.items] : []);
    setNewItemInput('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDuplicatePackage = (pkg: Pacote) => {
    const newPkg: Pacote = {
      id: `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      turmaId: pkg.turmaId,
      name: `${pkg.name} (Cópia)`,
      description: pkg.description,
      price: pkg.price,
      items: pkg.items ? [...pkg.items] : []
    };

    const updated = [...pacotes, newPkg];
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updated
    });
  };

  const handleAddItemToForm = (itemToAdd?: string) => {
    const item = (itemToAdd || newItemInput).trim();
    if (!item) return;
    if (formItems.includes(item)) {
      setNewItemInput('');
      return;
    }
    setFormItems(prev => [...prev, item]);
    setNewItemInput('');
  };

  const handleRemoveItemFromForm = (indexToRemove: number) => {
    setFormItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSavePackageForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Por favor, informe o nome do pacote.');
      return;
    }
    if (!formTurmaId) {
      setFormError('Por favor, selecione a turma de destino.');
      return;
    }
    if (formPrice <= 0) {
      setFormError('O valor do pacote deve ser maior que zero.');
      return;
    }

    let updatedPacotes: Pacote[];

    if (editingPackageId) {
      // Update existing
      updatedPacotes = pacotes.map(p => {
        if (p.id === editingPackageId) {
          return {
            ...p,
            turmaId: formTurmaId,
            name: formName.trim(),
            description: formDescription.trim(),
            price: Number(formPrice),
            items: formItems
          };
        }
        return p;
      });
    } else {
      // Create new
      const newPackage: Pacote = {
        id: `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        turmaId: formTurmaId,
        name: formName.trim(),
        description: formDescription.trim(),
        price: Number(formPrice),
        items: formItems
      };
      updatedPacotes = [...pacotes, newPackage];
    }

    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updatedPacotes
    });

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    const updated = pacotes.filter(p => p.id !== confirmDeleteId);
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updated
    });
    setConfirmDeleteId(null);
  };

  // Generate Standard Packages for a Turma
  const handleGenerateStandardPackages = (targetTurmaId: string) => {
    const targetTurma = turmas.find(t => t.id === targetTurmaId);
    const basePrice = targetTurma?.packagePrice || 9000;

    const standardPackages: Pacote[] = [
      {
        id: `pkg-${Date.now()}-1`,
        turmaId: targetTurmaId,
        name: 'Pacote Master VIP (Completo)',
        description: 'Baile de Gala + Colação Oficial + Ensaio Fotográfico + Álbum Impresso Premium',
        price: Math.round(basePrice * 1.3),
        items: [
          'Baile de Gala (10 Convites de Pista)',
          'Colação de Grau Oficial Solene',
          'Álbum Fotográfico Encadernado Luxo (50 fotos)',
          'Ensaio Fotográfico Individual de Estúdio e Externo',
          'Beca Oficial Completa com Capelo e Faixa',
          'Open Bar de Coquetelaria Internacional',
          'Jantar Gastronômico com Sobremesas Finas',
          'Placa de Homenagem em Aço Escovado'
        ]
      },
      {
        id: `pkg-${Date.now()}-2`,
        turmaId: targetTurmaId,
        name: 'Pacote Executivo (Baile + Colação)',
        description: 'Baile de Gala Oficial + Colação de Grau + Beca Completa',
        price: basePrice,
        items: [
          'Baile de Gala (5 Convites de Pista)',
          'Colação de Grau Oficial Solene',
          'Beca Oficial Completa com Capelo e Faixa',
          'Open Bar de Coquetelaria Internacional',
          'Jantar Gastronômico com Sobremesas Finas'
        ]
      },
      {
        id: `pkg-${Date.now()}-3`,
        turmaId: targetTurmaId,
        name: 'Pacote Básico (Apenas Colação & Beca)',
        description: 'Adesão essencial para Colação de Grau Solene e Beca Oficial',
        price: Math.round(basePrice * 0.45),
        items: [
          'Colação de Grau Oficial Solene',
          'Beca Oficial Completa com Capelo e Faixa',
          'Acesso aos registros digitais da colação'
        ]
      }
    ];

    const updated = [...pacotes, ...standardPackages];
    onUpdateState({
      turmas,
      formandos,
      parcelas,
      eventos,
      fornecedores,
      pacotes: updated
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Turma', 'Instituição', 'Ano', 'Nome do Pacote', 'Valor Total (R$)', 'Descrição', 'Itens Inclusos', 'Alunos Aderidos'];
    const rows = filteredPackages.map(pkg => {
      const turma = turmas.find(t => t.id === pkg.turmaId);
      const studentCount = studentPackageCountMap[pkg.id] || 0;
      return [
        turma?.name || 'Turma não identificada',
        turma?.institution || '',
        turma?.year || '',
        pkg.name,
        pkg.price.toFixed(2),
        pkg.description || '',
        (pkg.items || []).join(' | '),
        studentCount
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pacotes_formatura_wm2_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Header */}
      <div className="bg-[#ebe0b2] border border-[#d2c595] p-5 sm:p-6 rounded-2xl shadow-sm text-[#543d03]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#8d1811] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Exclusivo Administrador
              </span>
              {presetTurmaId && (
                <span className="bg-[#543d03] text-[#dfd1a1] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  Filtrado por Turma
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#3c2a01] mt-1.5 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#705510]" />
              Gestão de Pacotes de Formatura
            </h2>
            <p className="text-xs sm:text-sm text-[#543d03]/80 mt-1 max-w-2xl">
              Crie, personalize, edite e remova os tipos de pacotes de adesão oferecidos aos formandos, definindo valores, itens inclusos e detalhes de cada contrato.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/70 hover:bg-white text-[#543d03] border border-[#d2c595] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Exportar planilha de pacotes"
            >
              <Download className="w-4 h-4 text-[#705510]" /> Exportar Planilha
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] hover:brightness-105 text-neutral-950 font-black text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-[#aa904f]/40"
            >
              <Plus className="w-4 h-4 text-neutral-950" /> Criar Novo Pacote
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-[#ebe0b2] border border-[#d2c595] p-4 rounded-xl shadow-xs text-[#543d03]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-[#705510]">Total de Pacotes</span>
            <div className="p-2 bg-white/50 rounded-lg text-[#705510] border border-[#d2c595]/50">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#3c2a01] mt-1">{stats.totalCount}</div>
          <span className="text-[10px] text-[#543d03]/70 font-semibold block mt-0.5">
            Cadastrados no sistema
          </span>
        </div>

        <div className="bg-[#ebe0b2] border border-[#d2c595] p-4 rounded-xl shadow-xs text-[#543d03]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-[#705510]">Média de Preço</span>
            <div className="p-2 bg-white/50 rounded-lg text-emerald-800 border border-[#d2c595]/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1">
            {stats.avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-[#543d03]/70 font-semibold block mt-0.5">
            Ticket médio por pacote
          </span>
        </div>

        <div className="bg-[#ebe0b2] border border-[#d2c595] p-4 rounded-xl shadow-xs text-[#543d03]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-[#705510]">Pacote Mais Aderido</span>
            <div className="p-2 bg-white/50 rounded-lg text-amber-800 border border-[#d2c595]/50">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-black text-[#3c2a01] mt-1 truncate" title={stats.mostPopularPkg?.name || 'Nenhum'}>
            {stats.mostPopularPkg?.name || 'Aguardando adesões'}
          </div>
          <span className="text-[10px] text-amber-900 font-bold block mt-0.5">
            {stats.maxSubscribers} formando(s) escolheram
          </span>
        </div>

        <div className="bg-[#ebe0b2] border border-[#d2c595] p-4 rounded-xl shadow-xs text-[#543d03]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-[#705510]">Turmas Cobertas</span>
            <div className="p-2 bg-white/50 rounded-lg text-[#705510] border border-[#d2c595]/50">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#3c2a01] mt-1">
            {stats.uniqueTurmasWithPackages} <span className="text-xs text-[#543d03]/70 font-normal">/ {turmas.length} turmas</span>
          </div>
          <span className="text-[10px] text-[#543d03]/70 font-semibold block mt-0.5">
            Com planos configurados
          </span>
        </div>

      </div>

      {/* Control Filters & Search Bar */}
      <div className="bg-[#fdfaf2] border border-[#d2c595] p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome do pacote, descrição, item incluso ou turma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#d2c595] pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-medium shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters and View mode */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Turma filter */}
            <div className="flex items-center gap-1.5 bg-white border border-[#d2c595] px-2.5 py-1.5 rounded-xl shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-[#705510]" />
              <select
                value={selectedTurmaFilter}
                onChange={(e) => {
                  setSelectedTurmaFilter(e.target.value);
                  if (onClearPresetTurma && e.target.value === 'all') {
                    onClearPresetTurma();
                  }
                }}
                className="bg-transparent text-xs font-bold text-[#543d03] outline-none cursor-pointer"
              >
                <option value="all">🎓 Todas as Turmas ({turmas.length})</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.institution})</option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 bg-white border border-[#d2c595] px-2.5 py-1.5 rounded-xl shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#705510]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-[#543d03] outline-none cursor-pointer"
              >
                <option value="price_desc">Maior Valor</option>
                <option value="price_asc">Menor Valor</option>
                <option value="name">Ordem Alfabética</option>
                <option value="students_desc">Mais Aderidos</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-[#ebe0b2] p-0.5 rounded-xl border border-[#d2c595]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-[#8d1811] shadow-xs' : 'text-[#543d03] hover:text-neutral-900'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#8d1811] shadow-xs' : 'text-[#543d03] hover:text-neutral-900'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Selected Turma Action Banner if filtered to 1 specific turma */}
        {selectedTurmaFilter !== 'all' && (
          <div className="bg-[#ebe0b2]/60 border border-[#d2c595] p-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-[#543d03]">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#705510]" />
              <span>
                Visualizando pacotes da turma: <strong>{turmas.find(t => t.id === selectedTurmaFilter)?.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {filteredPackages.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleGenerateStandardPackages(selectedTurmaFilter)}
                  className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer border-none"
                >
                  <Sparkles className="w-3 h-3 text-amber-200" /> Gerar 3 Pacotes Padrão
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenCreateModal(selectedTurmaFilter)}
                className="px-3 py-1 bg-[#8d1811] hover:bg-[#70130d] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer border-none"
              >
                <Plus className="w-3 h-3" /> + Pacote para esta Turma
              </button>

              <button
                type="button"
                onClick={() => setSelectedTurmaFilter('all')}
                className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 underline ml-1"
              >
                Ver Todas as Turmas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {filteredPackages.length === 0 ? (
        <div className="bg-[#fdfaf2] border border-[#d2c595] rounded-2xl p-12 text-center text-[#543d03] space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-[#ebe0b2] border border-[#d2c595] rounded-full flex items-center justify-center mx-auto text-[#705510]">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#3c2a01]">Nenhum pacote encontrado</h3>
            <p className="text-xs text-[#543d03]/80 max-w-md mx-auto mt-1">
              {searchQuery
                ? `Nenhum pacote corresponde aos termos pesquisados "${searchQuery}".`
                : selectedTurmaFilter !== 'all'
                ? 'Esta turma ainda não possui nenhum pacote de formatura configurado.'
                : 'Você ainda não cadastrou nenhum pacote no sistema.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {selectedTurmaFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleGenerateStandardPackages(selectedTurmaFilter)}
                className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-900 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-200" /> Criar Pacotes Automáticos (Master, Executivo, Básico)
              </button>
            )}
            <button
              type="button"
              onClick={() => handleOpenCreateModal(selectedTurmaFilter !== 'all' ? selectedTurmaFilter : undefined)}
              className="px-4 py-2 bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] text-neutral-950 text-xs font-extrabold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Cadastrar Novo Pacote
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const turma = turmas.find(t => t.id === pkg.turmaId);
            const studentCount = studentPackageCountMap[pkg.id] || 0;
            const installmentValue = pkg.price / 10;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#ebe0b2] border border-[#d2c595] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-[#543d03]"
              >
                <div>
                  {/* Turma and Badge */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#d2c595]/60">
                    <div className="flex items-center gap-1.5 text-xs text-[#543d03]/90 font-bold truncate">
                      <Building className="w-3.5 h-3.5 text-[#705510] shrink-0" />
                      <span className="truncate" title={turma?.name || 'Turma não identificada'}>
                        {turma?.name || 'Turma não vinculada'}
                      </span>
                    </div>

                    <span className="bg-[#8d1811] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                      {turma?.institution || 'WM2'}
                    </span>
                  </div>

                  {/* Package Title & Price */}
                  <div className="pt-3">
                    <h3 className="font-black text-base text-[#3c2a01] leading-tight">
                      {pkg.name}
                    </h3>
                    
                    {pkg.description && (
                      <p className="text-xs text-[#543d03]/80 mt-1 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>
                    )}

                    <div className="mt-3 p-3 bg-white/70 border border-[#d2c595] rounded-xl">
                      <span className="text-[9px] font-bold text-[#705510] uppercase tracking-wider block">
                        Valor Total de Adesão
                      </span>
                      <div className="text-xl font-black text-[#3c2a01] mt-0.5">
                        {pkg.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                        ou em até 10x de {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  </div>

                  {/* Included Items Section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#705510] uppercase tracking-wider">
                      <span>Itens & Benefícios Inclusos:</span>
                      <span className="bg-[#d2c595]/50 px-1.5 py-0.5 rounded text-[#3c2a01]">
                        {pkg.items?.length || 0} itens
                      </span>
                    </div>

                    {(!pkg.items || pkg.items.length === 0) ? (
                      <span className="text-[11px] text-[#543d03]/60 italic block">
                        Nenhum item discriminado individualmente.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {pkg.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-white/80 border border-[#d2c595]/70 text-[#3c2a01] text-[10.5px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span className="line-clamp-1">{item}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="pt-4 mt-4 border-t border-[#d2c595]/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-[#543d03] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#705510]" />
                    <span>{studentCount} aluno{studentCount !== 1 ? 's' : ''} aderido{studentCount !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicatePackage(pkg)}
                      className="p-1.5 bg-white/70 hover:bg-white text-[#543d03] border border-[#d2c595] rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Duplicar este pacote"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#705510]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(pkg)}
                      className="px-2.5 py-1.5 bg-[#8d1811] hover:bg-[#70130d] text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer border-none"
                      title="Editar Pacote"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(pkg.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Excluir Pacote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#fdfaf2] border border-[#d2c595] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#ebe0b2] border-b border-[#d2c595] text-[#3c2a01] uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-4">Turma / Instituição</th>
                  <th className="py-3 px-4">Nome do Pacote</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Itens Inclusos</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Adesões</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d2c595]/50">
                {filteredPackages.map((pkg) => {
                  const turma = turmas.find(t => t.id === pkg.turmaId);
                  const studentCount = studentPackageCountMap[pkg.id] || 0;

                  return (
                    <tr key={pkg.id} className="hover:bg-[#f5ebd0]/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#3c2a01]">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#705510]" />
                          <span>{turma?.name || 'Geral'}</span>
                        </div>
                        <span className="text-[10px] text-[#543d03]/70 font-normal block mt-0.5">
                          {turma?.institution} • {turma?.year}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-black text-[#3c2a01] text-xs">
                        {pkg.name}
                      </td>

                      <td className="py-3 px-4 text-[#543d03] max-w-[200px] truncate" title={pkg.description}>
                        {pkg.description || '—'}
                      </td>

                      <td className="py-3 px-4 text-[#543d03]">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {(pkg.items || []).slice(0, 3).map((it, idx) => (
                            <span key={idx} className="bg-white/80 border border-[#d2c595] px-1.5 py-0.5 rounded text-[9.5px] font-semibold truncate max-w-[130px]">
                              {it}
                            </span>
                          ))}
                          {(pkg.items?.length || 0) > 3 && (
                            <span className="text-[9.5px] text-[#705510] font-bold self-center">
                              +{pkg.items.length - 3} mais
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-[#3c2a01] text-sm">
                        {pkg.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="bg-[#543d03]/10 text-[#543d03] font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {studentCount} aluno(s)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicatePackage(pkg)}
                            className="p-1.5 text-[#543d03] hover:bg-white/80 rounded transition-colors cursor-pointer"
                            title="Duplicar"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(pkg)}
                            className="p-1.5 text-[#8d1811] hover:bg-white/80 rounded transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(pkg.id)}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT PACKAGE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 max-h-[90vh] flex flex-col font-sans"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#dfd1a1] via-[#c5b072] to-[#967e3a] p-4 flex justify-between items-center border-b border-[#aa904f]/40">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-neutral-950" />
                  <h3 className="font-extrabold text-sm text-neutral-950">
                    {editingPackageId ? 'Editar Pacote de Formatura' : 'Cadastrar Novo Pacote de Formatura'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-800 hover:text-neutral-950 bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSavePackageForm} className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-800 flex-1">
                
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Turma and Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Turma de Destino *
                    </label>
                    <select
                      required
                      value={formTurmaId}
                      onChange={(e) => setFormTurmaId(e.target.value)}
                      className="w-full bg-slate-50 border border-neutral-300 p-2.5 rounded-xl outline-none focus:border-[#aa904f] font-semibold text-neutral-900"
                    >
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.institution} - {t.year})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Nome do Pacote *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pacote Diamante - Baile + Fotos + Beca"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-neutral-300 p-2.5 rounded-xl outline-none focus:border-[#aa904f] font-bold text-neutral-900"
                    />
                  </div>
                </div>

                {/* Price and Installment Simulation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                      Valor Total do Pacote (BRL) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">R$</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="10"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-neutral-300 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-[#aa904f] font-black text-neutral-900 text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-neutral-200 p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-neutral-400">Simulação Parcelada (10x):</span>
                    <div className="text-sm font-black text-emerald-700 mt-0.5">
                      10 parcelas de {(formPrice / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Descrição Detalhada / Resumo do Pacote
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Pacote completo contemplando acesso a todos os eventos solenes, baile de gala com 10 convites, ensaio fotográfico e kit formando..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-neutral-300 p-2.5 rounded-xl outline-none focus:border-[#aa904f] font-medium text-neutral-900 resize-none"
                  />
                </div>

                {/* Items & Inclusions Manager */}
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-extrabold text-neutral-700 uppercase tracking-wider">
                      Itens Inclusos no Pacote ({formItems.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickItems(!showQuickItems)}
                      className="text-[10.5px] font-bold text-[#8d1811] hover:underline cursor-pointer"
                    >
                      {showQuickItems ? 'Ocultar Sugestões Rápidas' : '+ Ver Sugestões Prontas'}
                    </button>
                  </div>

                  {/* Add item input row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite um item (ex: Baile de Gala 10 convites, Beca Oficial) e pressione Enter..."
                      value={newItemInput}
                      onChange={(e) => setNewItemInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItemToForm();
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-neutral-300 px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#aa904f] font-medium text-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItemToForm()}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>

                  {/* Quick Suggestions Chips */}
                  {showQuickItems && (
                    <div className="p-3 bg-[#fdfaf2] border border-[#d2c595] rounded-xl space-y-1.5 animate-fade-in">
                      <span className="text-[9.5px] font-bold text-[#705510] uppercase block">
                        Clique para incluir rapidamente:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto">
                        {COMMON_PACKAGE_ITEMS_SUGGESTIONS.map((item, idx) => {
                          const isAlreadyAdded = formItems.includes(item);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (isAlreadyAdded) {
                                  setFormItems(prev => prev.filter(it => it !== item));
                                } else {
                                  handleAddItemToForm(item);
                                }
                              }}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                isAlreadyAdded 
                                  ? 'bg-[#8d1811] border-[#8d1811] text-white'
                                  : 'bg-white border-[#d2c595] text-[#543d03] hover:bg-[#ebe0b2]'
                              }`}
                            >
                              {isAlreadyAdded ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Included items list pills */}
                  <div className="p-3 bg-slate-50 border border-neutral-200 rounded-xl min-h-[80px]">
                    {formItems.length === 0 ? (
                      <p className="text-neutral-400 text-xs italic text-center py-3">
                        Nenhum item adicionado ainda. Digite acima ou clique nas sugestões para montar a grade de benefícios deste pacote.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-neutral-300 text-neutral-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs group"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromForm(idx)}
                              className="text-neutral-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                              title="Remover este item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold px-6 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-[#dfd1a1]" />
                    {editingPackageId ? 'Salvar Alterações' : 'Cadastrar Pacote'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-200 p-6 text-neutral-850 font-sans space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-extrabold text-base text-neutral-900">Excluir Pacote de Formatura?</h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Tem certeza que deseja remover este pacote? Os formandos que já aderiram manterão o histórico de suas adesões, mas o pacote não estará mais disponível para novas seleções.
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-neutral-100 text-xs">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow transition-colors cursor-pointer"
                >
                  Sim, Excluir Pacote
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
