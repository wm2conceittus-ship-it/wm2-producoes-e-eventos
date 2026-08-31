import React, { useState } from 'react';
import { FormandoExtraPackage, Turma } from '../types';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Camera,
  Mail,
  GraduationCap,
  Wine,
  Gift,
  Package,
  Layers,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';

interface StudentExtraItemsManagerProps {
  studentName: string;
  turma?: Turma;
  basePackageName: string;
  basePackagePrice: number;
  extraPackages: FormandoExtraPackage[];
  totalDue: number;
  totalPaid: number;
  onOpenAddModal: () => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onUpdateUnitPrice: (id: string, newUnitPrice: number) => void;
  onToggleStatus: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onQuickAddPreset: (preset: {
    name: string;
    unitPrice: number;
    quantity: number;
    category: FormandoExtraPackage['category'];
    itemType: FormandoExtraPackage['itemType'];
    description: string;
  }) => void;
}

export const CATEGORY_LABELS: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  foto_video: { label: 'Foto & Vídeo', icon: Camera, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  convites: { label: 'Convites Extras', icon: Mail, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  beca_vestuario: { label: 'Beca & Vestuário', icon: GraduationCap, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  mesas_acessos: { label: 'Mesas & Acessos VIP', icon: Wine, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  personalizados: { label: 'Lembranças & Personalizados', icon: Gift, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  outros: { label: 'Outros Serviços', icon: Package, color: 'text-neutral-700', bg: 'bg-neutral-100', border: 'border-neutral-200' }
};

export const QUICK_PRESETS = [
  {
    name: 'Convite Individual Extra',
    unitPrice: 150,
    quantity: 2,
    category: 'convites' as const,
    itemType: 'item_avulso' as const,
    description: 'Acesso completo ao baile com buffet e open bar premium.'
  },
  {
    name: 'Ensaio Fotográfico VIP em Estúdio',
    unitPrice: 1200,
    quantity: 1,
    category: 'foto_video' as const,
    itemType: 'servico_customizado' as const,
    description: 'Sessão individual com figurino completo e 30 fotos em alta resolução.'
  },
  {
    name: 'Álbum Panorâmico de Luxo 30x30',
    unitPrice: 1800,
    quantity: 1,
    category: 'foto_video' as const,
    itemType: 'item_avulso' as const,
    description: 'Encadernação artesanal em couro legítimo com estojo gravado a laser.'
  },
  {
    name: 'Mesa VIP Adicional (10 Lugares)',
    unitPrice: 2400,
    quantity: 1,
    category: 'mesas_acessos' as const,
    itemType: 'pacote_avulso' as const,
    description: 'Mesa reservada em setor nobre com garçom exclusivo.'
  },
  {
    name: 'Kit Beca & Canudo Aveludado',
    unitPrice: 350,
    quantity: 1,
    category: 'beca_vestuario' as const,
    itemType: 'item_avulso' as const,
    description: 'Beca sob medida higienizada com faixa na cor oficial do curso.'
  },
  {
    name: 'Produção Make & Penteado VIP',
    unitPrice: 600,
    quantity: 1,
    category: 'personalizados' as const,
    itemType: 'servico_customizado' as const,
    description: 'Maquiagem de alta durabilidade e penteado profissional no camarim.'
  }
];

export const StudentExtraItemsManager: React.FC<StudentExtraItemsManagerProps> = ({
  studentName = '',
  basePackageName = '',
  basePackagePrice = 0,
  extraPackages = [],
  totalPaid = 0,
  onOpenAddModal,
  onUpdateQuantity,
  onUpdateUnitPrice,
  onToggleStatus,
  onRemoveItem,
  onQuickAddPreset
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceInput, setTempPriceInput] = useState<number>(0);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const safeExtraPackages = Array.isArray(extraPackages) ? extraPackages : [];
  const extrasSum = safeExtraPackages.reduce((sum, ep) => sum + (Number(ep.price) || 0), 0);
  const grandTotal = (Number(basePackagePrice) || 0) + extrasSum;
  const remaining = Math.max(0, grandTotal - (Number(totalPaid) || 0));

  const filteredItems = categoryFilter === 'all'
    ? safeExtraPackages
    : safeExtraPackages.filter(ep => (ep.category || 'outros') === categoryFilter);

  return (
    <div className="space-y-4">
      {/* Financial Top Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-neutral-200/90 p-3 rounded-xl shadow-xs">
          <div className="text-[9px] font-bold text-neutral-400 uppercase">Pacote Base da Turma</div>
          <div className="text-sm font-black text-neutral-800 mt-1">
            R$ {basePackagePrice.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] text-neutral-500 truncate mt-0.5">
            {basePackageName || 'Nenhum'}
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl shadow-xs">
          <div className="text-[9px] font-bold text-[#aa904f] uppercase flex items-center justify-between">
            <span>Itens Extras ({extraPackages.length})</span>
            <Sparkles className="w-3 h-3 text-[#aa904f]" />
          </div>
          <div className="text-sm font-black text-[#aa904f] mt-1">
            + R$ {extrasSum.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] text-amber-700/80 truncate mt-0.5">
            Personalizados para o formando
          </div>
        </div>

        <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-xs">
          <div className="text-[9px] font-bold text-neutral-400 uppercase">Total Geral Contratado</div>
          <div className="text-sm font-black text-amber-400 mt-1">
            R$ {grandTotal.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] text-neutral-400 truncate mt-0.5">
            Base + Todos os Extras
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl shadow-xs">
          <div className="text-[9px] font-bold text-emerald-600 uppercase">Saldo Restante</div>
          <div className="text-sm font-black text-emerald-800 mt-1">
            R$ {remaining.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] text-emerald-600 truncate mt-0.5">
            Pago: R$ {totalPaid.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Main Header with Add Button */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#aa904f]" />
              Itens Extras & Pacotes Customizados
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Gerencie pacotes avulsos, serviços ou produtos específicos contratados por <strong>{studentName}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> + Adicionar Item ou Pacote Extra
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'
            }`}
          >
            Todos ({extraPackages.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => {
            const count = extraPackages.filter(ep => (ep.category || 'outros') === catKey).length;
            const IconComp = catInfo.icon;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  categoryFilter === catKey
                    ? 'bg-[#aa904f] text-white shadow-xs'
                    : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'
                }`}
              >
                <IconComp className="w-3 h-3" />
                {catInfo.label} {count > 0 && <span className="opacity-80 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* List of Extra Items */}
      {extraPackages.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-neutral-200 p-8 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-[#aa904f]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-neutral-800">Nenhum item extra customizado cadastrado</h5>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              Este formando possui atualmente apenas o pacote base da turma. Adicione serviços avulsos, convites extras, ensaios VIP ou itens personalizados.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Incluir Primeiro Item Extra
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-50 p-6 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
          Nenhum item encontrado nesta categoria selecionada.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const cat = CATEGORY_LABELS[item.category || 'outros'] || CATEGORY_LABELS.outros;
            const CatIcon = cat.icon;
            const qty = Math.max(1, Number(item.quantity) || 1);
            const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (Number(item.price) / qty);
            const isEditingPrice = editingPriceId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-neutral-200/90 hover:border-[#aa904f]/60 rounded-xl p-3.5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5"
              >
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${cat.bg} ${cat.color} ${cat.border} border`}>
                      <CatIcon className="w-3 h-3" />
                      {cat.label}
                    </span>

                    {item.itemType && (
                      <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 text-[9.5px] font-semibold px-2 py-0.5 rounded-md">
                        {item.itemType === 'item_avulso' ? 'Item Avulso' : item.itemType === 'pacote_avulso' ? 'Pacote Avulso' : 'Serviço Customizado'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        item.status === 'Pendente'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                      title="Clique para alternar o status do item"
                    >
                      {item.status === 'Pendente' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {item.status || 'Confirmado'}
                    </button>
                  </div>

                  <h5 className="font-extrabold text-neutral-900 text-sm">{item.name}</h5>

                  {item.description && (
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{item.description}</p>
                  )}

                  {item.items && item.items.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.items.map((sub, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium">
                          ✓ {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Quantity, Unit Price and Total */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 shrink-0">
                  {/* Quantity Counter */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8.5px] font-bold text-neutral-400 uppercase mb-0.5">Qtd</span>
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, qty - 1)}
                        disabled={qty <= 1}
                        className="px-2 py-1 text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-black text-neutral-800 min-w-[20px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, qty + 1)}
                        className="px-2 py-1 text-neutral-600 hover:bg-neutral-200 cursor-pointer font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="flex flex-col items-end min-w-[90px]">
                    <span className="text-[8.5px] font-bold text-neutral-400 uppercase mb-0.5">Unitário</span>
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={tempPriceInput}
                          onChange={(e) => setTempPriceInput(Math.max(0, Number(e.target.value)))}
                          className="w-16 bg-white border border-[#aa904f] px-1 py-0.5 rounded text-xs font-bold text-right outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateUnitPrice(item.id, tempPriceInput);
                            setEditingPriceId(null);
                          }}
                          className="bg-[#aa904f] text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPriceId(item.id);
                          setTempPriceInput(unitPrice);
                        }}
                        className="text-xs text-neutral-600 hover:text-[#aa904f] font-semibold underline decoration-dotted cursor-pointer"
                        title="Clique para editar valor unitário"
                      >
                        R$ {unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </button>
                    )}
                  </div>

                  {/* Total Value */}
                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className="text-[8.5px] font-bold text-[#aa904f] uppercase mb-0.5">Total</span>
                    <span className="text-sm font-black text-[#aa904f]">
                      R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete({ id: item.id, name: item.name });
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir item extra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Remover Item Extra</h4>
            </div>
            <p className="text-sm text-neutral-600">
              Deseja realmente remover o item <span className="font-semibold text-neutral-900">"{itemToDelete.name}"</span> deste formando?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Quick Add Presets Grid */}
      <div className="bg-slate-50 border border-neutral-200/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#aa904f]" />
            <h5 className="font-bold text-xs text-neutral-800 uppercase tracking-wider">
              Atalhos Rápidos de Itens Populares (1 Clique)
            </h5>
          </div>
          <span className="text-[10px] text-neutral-400">Adiciona instantaneamente ao formando</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {QUICK_PRESETS.map((preset, idx) => {
            const cat = CATEGORY_LABELS[preset.category] || CATEGORY_LABELS.outros;
            const CatIcon = cat.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickAddPreset(preset)}
                className="bg-white hover:bg-amber-50/50 border border-neutral-200 hover:border-[#aa904f]/60 p-3 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.color} flex items-center gap-1`}>
                      <CatIcon className="w-2.5 h-2.5" />
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#aa904f]">
                      R$ {preset.unitPrice.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h6 className="font-bold text-xs text-neutral-900 group-hover:text-[#aa904f] transition-colors line-clamp-1">
                    {preset.name}
                  </h6>
                  <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-[#aa904f] font-bold">
                  <span>+ Incluir {preset.quantity}x</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
