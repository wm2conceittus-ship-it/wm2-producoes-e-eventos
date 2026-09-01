import React, { useState } from 'react';
import { FormandoExtraPackage, Pacote, Turma } from '../types';
import {
  Sparkles,
  X,
  Zap,
  Package,
  Edit,
  CreditCard,
  Check,
  Camera,
  Mail,
  GraduationCap,
  Wine,
  Gift,
  Plus
} from 'lucide-react';
import { CATEGORY_LABELS } from './StudentExtraItemsManager';

interface AddExtraItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  turma?: Turma;
  catalogPackages: Pacote[];
  currentInstallmentCount: number;
  onConfirm: (
    itemData: {
      name: string;
      price: number;
      unitPrice?: number;
      quantity?: number;
      category?: FormandoExtraPackage['category'];
      itemType?: FormandoExtraPackage['itemType'];
      description?: string;
      items?: string[];
      status?: 'Confirmado' | 'Pendente';
    },
    splitMode: 'recalculate_all' | 'add_specific_installments' | 'none',
    splitCount: number
  ) => void;
}

export const AddExtraItemModal: React.FC<AddExtraItemModalProps> = ({
  isOpen,
  onClose,
  studentName,
  catalogPackages,
  currentInstallmentCount,
  onConfirm
}) => {
  const [mode, setMode] = useState<'preset' | 'catalog' | 'custom'>('preset');
  const [presetId, setPresetId] = useState<string>('ensaio');
  const [catalogId, setCatalogId] = useState<string>('');
  
  // Custom item states
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<FormandoExtraPackage['category']>('foto_video');
  const [customItemType, setCustomItemType] = useState<FormandoExtraPackage['itemType']>('item_avulso');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customUnitPrice, setCustomUnitPrice] = useState<number>(1000);
  const [customDesc, setCustomDesc] = useState<string>('');
  const [customStatus, setCustomStatus] = useState<'Confirmado' | 'Pendente'>('Confirmado');

  // Split options
  const [splitMode, setSplitMode] = useState<'recalculate_all' | 'add_specific_installments' | 'none'>('recalculate_all');
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);

  if (!isOpen) return null;

  const presetsList: Array<{
    id: string;
    name: string;
    unitPrice: number;
    quantity: number;
    category: FormandoExtraPackage['category'];
    itemType: FormandoExtraPackage['itemType'];
    desc: string;
  }> = [
    {
      id: 'ensaio',
      name: 'Ensaio Fotográfico VIP em Estúdio',
      unitPrice: 1200,
      quantity: 1,
      category: 'foto_video',
      itemType: 'servico_customizado',
      desc: 'Sessão fotográfica individual com figurino exclusivo, maquiagem e 30 fotos tratadas.'
    },
    {
      id: 'album',
      name: 'Álbum Panorâmico de Luxo 30x30',
      unitPrice: 1800,
      quantity: 1,
      category: 'foto_video',
      itemType: 'item_avulso',
      desc: '50 páginas laminadas em papel fotográfico HD com capa em couro e estojo gravado.'
    },
    {
      id: 'convites',
      name: 'Combo de Convites Adicionais (5 Unidades)',
      unitPrice: 750,
      quantity: 1,
      category: 'convites',
      itemType: 'pacote_avulso',
      desc: '5 convites com acesso completo ao baile de gala, jantar e open bar.'
    },
    {
      id: 'mesa',
      name: 'Mesa VIP Extra no Baile (10 Lugares)',
      unitPrice: 2400,
      quantity: 1,
      category: 'mesas_acessos',
      itemType: 'pacote_avulso',
      desc: 'Mesa reservada em área nobre com garçom dedicado e champanhe.'
    },
    {
      id: 'beca',
      name: 'Kit Beca, Canudo & Placa Homenagem',
      unitPrice: 650,
      quantity: 1,
      category: 'beca_vestuario',
      itemType: 'item_avulso',
      desc: 'Beca sob medida higienizada, canudo aveludado e placa de homenagem em inox.'
    },
    {
      id: 'teaser',
      name: 'Vídeo Teaser 4K & Cobertura Drone',
      unitPrice: 1500,
      quantity: 1,
      category: 'foto_video',
      itemType: 'servico_customizado',
      desc: 'Cobertura em vídeo 4K exclusiva com momentos do formando na colação e baile.'
    }
  ];

  const handleConfirmAction = () => {
    let itemData: {
      name: string;
      price: number;
      unitPrice: number;
      quantity: number;
      category: FormandoExtraPackage['category'];
      itemType: FormandoExtraPackage['itemType'];
      description: string;
      items?: string[];
      status: 'Confirmado' | 'Pendente';
    };

    if (mode === 'preset') {
      const selected = presetsList.find(p => p.id === presetId) || presetsList[0];
      const calculatedTotal = selected.quantity * selected.unitPrice;
      itemData = {
        name: selected.name,
        price: calculatedTotal,
        unitPrice: selected.unitPrice,
        quantity: selected.quantity,
        category: selected.category,
        itemType: selected.itemType,
        description: selected.desc,
        status: 'Confirmado'
      };
    } else if (mode === 'catalog') {
      const targetPkg = catalogPackages.find(p => p.id === (catalogId || catalogPackages[0]?.id));
      if (!targetPkg) {
        alert('Selecione um pacote do catálogo.');
        return;
      }
      itemData = {
        name: targetPkg.name,
        price: targetPkg.price,
        unitPrice: targetPkg.price,
        quantity: 1,
        category: 'outros',
        itemType: 'pacote_avulso',
        description: targetPkg.description || '',
        items: targetPkg.items || [],
        status: 'Confirmado'
      };
    } else {
      if (!customName.trim()) {
        alert('Por favor, informe o nome do item extra.');
        return;
      }
      const qty = Math.max(1, Number(customQuantity) || 1);
      const uPrice = Math.max(0, Number(customUnitPrice) || 0);
      itemData = {
        name: customName.trim(),
        price: qty * uPrice,
        unitPrice: uPrice,
        quantity: qty,
        category: customCategory,
        itemType: customItemType,
        description: customDesc.trim(),
        status: customStatus
      };
    }

    onConfirm(itemData, splitMode, installmentsCount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col my-8">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#aa904f]" />
              <h4 className="font-bold text-base text-white tracking-wide">Incluir Item Extra Customizado</h4>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Adicione pacotes avulsos ou serviços exclusivos para <strong className="text-amber-300">{studentName}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Origin Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Origem do Item / Pacote Extra:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('preset')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  mode === 'preset'
                    ? 'border-[#aa904f] bg-amber-50/60 text-[#8c7438] font-bold shadow-xs'
                    : 'border-neutral-200 bg-slate-50/50 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Zap className="w-4 h-4 text-[#aa904f]" />
                <span className="text-xs font-bold">Sugestões VIP</span>
                <span className="text-[9px] text-neutral-400">Itens pré-configurados</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('catalog')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  mode === 'catalog'
                    ? 'border-[#aa904f] bg-amber-50/60 text-[#8c7438] font-bold shadow-xs'
                    : 'border-neutral-200 bg-slate-50/50 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Package className="w-4 h-4 text-[#aa904f]" />
                <span className="text-xs font-bold">Catálogo Geral</span>
                <span className="text-[9px] text-neutral-400">Pacotes cadastrados</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  mode === 'custom'
                    ? 'border-[#aa904f] bg-amber-50/60 text-[#8c7438] font-bold shadow-xs'
                    : 'border-neutral-200 bg-slate-50/50 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Edit className="w-4 h-4 text-[#aa904f]" />
                <span className="text-xs font-bold">100% Personalizado</span>
                <span className="text-[9px] text-neutral-400">Item avulso livre</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Presets */}
          {mode === 'preset' && (
            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold text-neutral-500 uppercase">Escolha uma opção VIP sugerida:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presetsList.map((preset) => {
                  const isSelected = presetId === preset.id;
                  const cat = CATEGORY_LABELS[preset.category] || CATEGORY_LABELS.outros;
                  const CatIcon = cat.icon;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPresetId(preset.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#aa904f] bg-amber-50/40 ring-1 ring-[#aa904f] shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${cat.bg} ${cat.color} flex items-center gap-1`}>
                            <CatIcon className="w-2.5 h-2.5" />
                            {cat.label}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#aa904f] shrink-0" />}
                        </div>
                        <h6 className="font-bold text-xs text-neutral-900 mt-1">{preset.name}</h6>
                        <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{preset.desc}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-[9px] text-neutral-400 uppercase font-bold">Valor:</span>
                        <span className="font-extrabold text-xs text-[#aa904f]">
                          R$ {preset.unitPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Catalog */}
          {mode === 'catalog' && (
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-neutral-200">
              <span className="block text-[10px] font-bold text-neutral-500 uppercase">Selecione um pacote existente no sistema:</span>
              {catalogPackages.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">Nenhum pacote cadastrado no catálogo.</p>
              ) : (
                <div>
                  <select
                    value={catalogId || (catalogPackages[0]?.id || '')}
                    onChange={(e) => setCatalogId(e.target.value)}
                    className="w-full bg-white border border-neutral-300 p-2.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-semibold"
                  >
                    {catalogPackages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — R$ {p.price.toLocaleString('pt-BR')}
                      </option>
                    ))}
                  </select>

                  {(() => {
                    const currentCatalogPkg = catalogPackages.find(p => p.id === (catalogId || catalogPackages[0]?.id));
                    if (!currentCatalogPkg) return null;
                    return (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-neutral-200 text-xs space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-neutral-900">{currentCatalogPkg.name}</span>
                          <span className="text-[#aa904f]">R$ {currentCatalogPkg.price.toLocaleString('pt-BR')}</span>
                        </div>
                        {currentCatalogPkg.description && (
                          <p className="text-[10px] text-neutral-500">{currentCatalogPkg.description}</p>
                        )}
                        {currentCatalogPkg.items && currentCatalogPkg.items.length > 0 && (
                          <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1">
                            {currentCatalogPkg.items.map((it, i) => (
                              <span key={i} className="bg-slate-100 text-neutral-700 text-[9px] px-2 py-0.5 rounded-full font-medium">
                                ✓ {it}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Custom Item */}
          {mode === 'custom' && (
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-neutral-200">
              <span className="block text-[10px] font-bold text-neutral-500 uppercase">Configuração do Item Customizado:</span>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Nome do Item / Serviço</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Canecas de Chopp Personalizadas (10 un) ou Make & Cabelo"
                  className="w-full bg-white border border-neutral-200 p-2.5 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Categoria</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-800"
                  >
                    <option value="foto_video">📸 Foto & Vídeo</option>
                    <option value="convites">✉️ Convites Extras</option>
                    <option value="beca_vestuario">🎓 Beca & Vestuário</option>
                    <option value="mesas_acessos">🍸 Mesas & Acessos VIP</option>
                    <option value="personalizados">🎁 Lembranças & Personalizados</option>
                    <option value="outros">📦 Outros Serviços</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Tipo de Item</label>
                  <select
                    value={customItemType}
                    onChange={(e) => setCustomItemType(e.target.value as any)}
                    className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-800"
                  >
                    <option value="item_avulso">Item Avulso</option>
                    <option value="pacote_avulso">Pacote Avulso</option>
                    <option value="servico_customizado">Serviço Customizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={customUnitPrice}
                    onChange={(e) => setCustomUnitPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#aa904f] uppercase mb-1">Total Calculado</label>
                  <div className="w-full bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs font-black text-[#aa904f] flex items-center justify-center">
                    R$ {(customQuantity * customUnitPrice).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Descrição / Detalhes</label>
                <textarea
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Ex: Entregar canecas gravadas com nome do formando e curso na semana do evento."
                  className="w-full bg-white border border-neutral-200 p-2 rounded-lg text-xs outline-none focus:border-[#aa904f] text-neutral-900"
                />
              </div>
            </div>
          )}

          {/* SPLIT & PARCELING STRATEGY */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
            <label className="block text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#aa904f]" /> Como deseja parcelar este item no contrato do formando?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                onClick={() => setSplitMode('recalculate_all')}
                className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-all ${
                  splitMode === 'recalculate_all'
                    ? 'border-[#aa904f] bg-white ring-1 ring-[#aa904f] shadow-xs'
                    : 'border-amber-200/80 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'recalculate_all'}
                    onChange={() => setSplitMode('recalculate_all')}
                    className="accent-[#aa904f] mt-0.5"
                  />
                  <span className="font-bold text-xs text-neutral-900">Reparcelar Todo o Contrato</span>
                </div>
                <span className="text-[9.5px] text-neutral-500 block mt-1.5">
                  Soma tudo e redistribui em {currentInstallmentCount || 10} parcelas iguais.
                </span>
              </label>

              <label
                onClick={() => setSplitMode('add_specific_installments')}
                className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-all ${
                  splitMode === 'add_specific_installments'
                    ? 'border-[#aa904f] bg-white ring-1 ring-[#aa904f] shadow-xs'
                    : 'border-amber-200/80 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'add_specific_installments'}
                    onChange={() => setSplitMode('add_specific_installments')}
                    className="accent-[#aa904f] mt-0.5"
                  />
                  <span className="font-bold text-xs text-neutral-900">Parcelas Exclusivas</span>
                </div>
                <span className="text-[9.5px] text-neutral-500 block mt-1.5">
                  Gera parcelas separadas identificadas com o nome do item.
                </span>
              </label>

              <label
                onClick={() => setSplitMode('none')}
                className={`p-3 rounded-lg border flex flex-col justify-between cursor-pointer transition-all ${
                  splitMode === 'none'
                    ? 'border-[#aa904f] bg-white ring-1 ring-[#aa904f] shadow-xs'
                    : 'border-amber-200/80 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={splitMode === 'none'}
                    onChange={() => setSplitMode('none')}
                    className="accent-[#aa904f] mt-0.5"
                  />
                  <span className="font-bold text-xs text-neutral-900">Apenas Atualizar Saldo</span>
                </div>
                <span className="text-[9.5px] text-neutral-500 block mt-1.5">
                  Não altera o cronograma de parcelas atual.
                </span>
              </label>
            </div>

            {splitMode === 'add_specific_installments' && (
              <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                <span className="text-[10px] font-bold text-neutral-700 uppercase">Dividir este item em:</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-white border border-neutral-300 p-1 rounded-md text-xs font-bold text-center outline-none focus:border-[#aa904f]"
                />
                <span className="text-[10px] font-bold text-neutral-700 uppercase">parcela(s) exclusiva(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-neutral-200 p-4 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmAction}
            className="bg-[#aa904f] hover:bg-[#967e3a] text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Confirmar e Incluir no Formando
          </button>
        </div>
      </div>
    </div>
  );
};
