import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Search,
  Filter,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Send,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Building,
  User,
  ShieldCheck,
  Calendar,
  DollarSign,
  QrCode,
  Sparkles,
  Layers,
  ArrowRight,
  Printer,
  FileSpreadsheet,
  CheckSquare,
  Square,
  CheckCircle,
  HelpCircle,
  X,
  MessageSquare,
  Mail,
  Share2,
  Smartphone,
  Bell,
  Link2,
  CheckCheck
} from 'lucide-react';
import { Parcela, Formando, Turma, PaymentGatewayConfig } from '../types';

interface MercadoPagoParcelasListProps {
  parcelas: Parcela[];
  formandos: Formando[];
  turmas: Turma[];
  gatewayConfig?: PaymentGatewayConfig;
  theme?: 'light' | 'dark';
  onUpdateParcelas: (updatedParcelas: Parcela[]) => void;
  title?: string;
  subtitle?: string;
  showFiltersHeader?: boolean;
}

export default function MercadoPagoParcelasList({
  parcelas,
  formandos,
  turmas,
  gatewayConfig,
  theme = 'light',
  onUpdateParcelas,
  title = "Gestão de Parcelas & Vínculo Mercado Pago",
  subtitle = "Acompanhamento do status de pagamento (Pendente / Pago / Atrasado) e vínculo direto aos registros e transações do Mercado Pago.",
  showFiltersHeader = true
}: MercadoPagoParcelasListProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, Paga, Pendente, Atrasada
  const [selectedMpBinding, setSelectedMpBinding] = useState<string>('all'); // all, linked, unlinked
  const [selectedType, setSelectedType] = useState<string>('all'); // all, Pix, Boleto, Cartão
  const [sortField, setSortField] = useState<'dueDate' | 'value' | 'student' | 'status' | 'number'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection for Batch Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchBillingOpen, setIsBatchBillingOpen] = useState(false);

  // Single Item Detail Modal
  const [selectedDetailParcela, setSelectedDetailParcela] = useState<Parcela | null>(null);

  // Billing Modal (WhatsApp, E-mail & Unique Mercado Pago Payment Link)
  const [billingTargetParcela, setBillingTargetParcela] = useState<Parcela | null>(null);
  const [customBillingMessage, setCustomBillingMessage] = useState<string>('');
  const [activeBillingChannelTab, setActiveBillingChannelTab] = useState<'whatsapp' | 'email' | 'link'>('whatsapp');
  const [showQrPreview, setShowQrPreview] = useState<boolean>(false);

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, key: string, label = 'Copiado!') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} copiado para a área de transferência.`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Helper map for students and turmas
  const formandosMap = useMemo(() => {
    const map = new Map<string, Formando>();
    formandos.forEach(f => map.set(f.id, f));
    return map;
  }, [formandos]);

  const turmasMap = useMemo(() => {
    const map = new Map<string, Turma>();
    turmas.forEach(t => map.set(t.id, t));
    return map;
  }, [turmas]);

  // Filtered and Sorted list
  const filteredParcelas = useMemo(() => {
    return parcelas.filter(p => {
      const student = formandosMap.get(p.formandoId);
      const turma = student ? turmasMap.get(student.turmaId) : null;

      // Turma filter
      if (selectedTurma !== 'all' && student?.turmaId !== selectedTurma) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }

      // MP Binding filter
      const isLinked = !!p.gatewayTransactionId || p.gatewayProvider === 'mercadopago';
      if (selectedMpBinding === 'linked' && !isLinked) return false;
      if (selectedMpBinding === 'unlinked' && isLinked) return false;

      // Payment Type filter
      if (selectedType !== 'all' && p.type !== selectedType) {
        return false;
      }

      // Search Query (Student name, CPF, MP ID, Parcela number, description)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const studentName = (student?.name || '').toLowerCase();
        const studentCpf = (student?.cpf || '').toLowerCase();
        const studentEmail = (student?.email || '').toLowerCase();
        const txId = (p.gatewayTransactionId || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const numStr = `parcela ${p.number} #${p.number} p${p.number}`;

        const matches =
          studentName.includes(q) ||
          studentCpf.includes(q) ||
          studentEmail.includes(q) ||
          txId.includes(q) ||
          desc.includes(q) ||
          numStr.includes(q);

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortField === 'value') {
        comparison = a.value - b.value;
      } else if (sortField === 'number') {
        comparison = a.number - b.number;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'student') {
        const nameA = formandosMap.get(a.formandoId)?.name || '';
        const nameB = formandosMap.get(b.formandoId)?.name || '';
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [parcelas, formandosMap, turmasMap, selectedTurma, selectedStatus, selectedMpBinding, selectedType, searchQuery, sortField, sortOrder]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalCount = parcelas.length;
    const totalAmount = parcelas.reduce((acc, p) => acc + p.value, 0);

    const paidParcelas = parcelas.filter(p => p.status === 'Paga');
    const paidCount = paidParcelas.length;
    const paidAmount = paidParcelas.reduce((acc, p) => acc + p.value, 0);

    const pendingParcelas = parcelas.filter(p => p.status === 'Pendente');
    const pendingCount = pendingParcelas.length;
    const pendingAmount = pendingParcelas.reduce((acc, p) => acc + p.value, 0);

    const overdueParcelas = parcelas.filter(p => p.status === 'Atrasada');
    const overdueCount = overdueParcelas.length;
    const overdueAmount = overdueParcelas.reduce((acc, p) => acc + p.value, 0);

    const mpLinkedParcelas = parcelas.filter(p => !!p.gatewayTransactionId || p.gatewayProvider === 'mercadopago');
    const mpLinkedCount = mpLinkedParcelas.length;
    const mpLinkedRate = totalCount > 0 ? (mpLinkedCount / totalCount) * 100 : 0;

    return {
      totalCount,
      totalAmount,
      paidCount,
      paidAmount,
      pendingCount,
      pendingAmount,
      overdueCount,
      overdueAmount,
      mpLinkedCount,
      mpLinkedRate,
      paidRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  }, [parcelas]);

  // Selection toggle
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredParcelas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredParcelas.map(p => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Actions on single parcela
  const handleToggleStatus = (parcela: Parcela) => {
    const isNowPaid = parcela.status !== 'Paga';
    const updated: Parcela[] = parcelas.map(p => {
      if (p.id === parcela.id) {
        return {
          ...p,
          status: (isNowPaid ? 'Paga' : 'Pendente') as 'Paga' | 'Pendente',
          payDate: isNowPaid ? (p.payDate || new Date().toISOString()) : undefined,
          gatewayStatus: (isNowPaid ? 'approved' : 'pending') as 'approved' | 'pending'
        };
      }
      return p;
    });
    onUpdateParcelas(updated);
    showToast(isNowPaid ? `Parcela #${parcela.number} baixada com sucesso!` : `Parcela #${parcela.number} reaberta como Pendente.`);
  };

  // Helper to ensure a parcela has a Mercado Pago payment link, Pix code, and barcode
  const ensureMercadoPagoLink = (parcela: Parcela): Parcela => {
    if (parcela.gatewayPaymentLink && parcela.pixCode && parcela.boletoBarcode && parcela.gatewayTransactionId) {
      return parcela;
    }
    const mockTxId = parcela.gatewayTransactionId || `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const mockPix = parcela.pixCode || `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925WM2 FORMATURAS EVENTOS6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`;
    const mockBoletoBarcode = parcela.boletoBarcode || `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.${Math.floor(100000 + Math.random() * 900000)} 91020.150008 7 ${Math.floor(80000000000000 + Math.random() * 10000000000000)}`;
    const mockPaymentLink = parcela.gatewayPaymentLink || `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockTxId}`;
    const qrUrl = parcela.pixQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPix)}`;
    const pdfUrl = parcela.boletoPdfUrl || `https://www.mercadopago.com.br/payments/ticket/${mockTxId}/pdf`;

    const updatedParcela: Parcela = {
      ...parcela,
      gatewayProvider: 'mercadopago',
      gatewayTransactionId: mockTxId,
      gatewayPaymentLink: mockPaymentLink,
      gatewayStatus: parcela.status === 'Paga' ? 'approved' : 'pending',
      gatewayCreatedAt: parcela.gatewayCreatedAt || new Date().toISOString(),
      pixCode: mockPix,
      pixQrCodeUrl: qrUrl,
      boletoBarcode: mockBoletoBarcode,
      boletoPdfUrl: pdfUrl
    };

    const newParcelas = parcelas.map(p => p.id === parcela.id ? updatedParcela : p);
    onUpdateParcelas(newParcelas);
    return updatedParcela;
  };

  // Open Billing Modal for a specific parcela
  const handleOpenBillingModal = (parcela: Parcela) => {
    const readyParcela = ensureMercadoPagoLink(parcela);
    const student = formandosMap.get(readyParcela.formandoId);
    const turma = student ? turmasMap.get(student.turmaId) : null;
    
    const formattedDueDate = new Date(readyParcela.dueDate + (readyParcela.dueDate.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('pt-BR');
    const formattedValue = readyParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const studentName = student?.name || 'Formando';
    const turmaName = turma?.name || 'Formatura';
    
    const defaultMsg = `Olá, ${studentName}! Tudo bem? Sou da WM2 Produções e Eventos.\n\nPassando para lembrar sobre a Parcela #${readyParcela.number} da formatura ${turmaName} no valor de ${formattedValue}, com vencimento em ${formattedDueDate}.\n\nPara sua comodidade e segurança, geramos seu link único do Mercado Pago com baixa automática instantânea via Pix, Boleto ou Cartão:\n${readyParcela.gatewayPaymentLink}\n\nCódigo Pix Copia e Cola:\n${readyParcela.pixCode}\n\nCaso já tenha efetuado o pagamento, desconsidere esta mensagem. Ficamos à disposição!`;
    
    setCustomBillingMessage(defaultMsg);
    setBillingTargetParcela(readyParcela);
    setActiveBillingChannelTab('whatsapp');
  };

  // Send Billing via WhatsApp
  const handleSendWhatsAppBilling = (parcela: Parcela, messageText: string) => {
    const student = formandosMap.get(parcela.formandoId);
    const cleanPhone = (student?.phone || '').replace(/\D/g, '');
    const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    
    window.open(waLink, '_blank', 'noopener,noreferrer');
    
    const now = new Date().toISOString();
    const updated = parcelas.map(p => {
      if (p.id === parcela.id) {
        return {
          ...p,
          lastBillingSentAt: now,
          lastBillingChannel: 'whatsapp' as const,
          billingSentCount: (p.billingSentCount || 0) + 1
        };
      }
      return p;
    });
    onUpdateParcelas(updated);
    
    if (billingTargetParcela && billingTargetParcela.id === parcela.id) {
      setBillingTargetParcela({
        ...billingTargetParcela,
        lastBillingSentAt: now,
        lastBillingChannel: 'whatsapp',
        billingSentCount: (billingTargetParcela.billingSentCount || 0) + 1
      });
    }
    showToast(`WhatsApp aberto para envio de cobrança a ${student?.name || 'Formando'}!`);
  };

  // Send Billing via Email
  const handleSendEmailBilling = (parcela: Parcela, messageText: string) => {
    const student = formandosMap.get(parcela.formandoId);
    const email = student?.email || '';
    const subject = `Lembrete de Cobrança - Parcela #${parcela.number} - WM2 Produções`;
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
    
    window.location.href = mailtoLink;
    
    const now = new Date().toISOString();
    const updated = parcelas.map(p => {
      if (p.id === parcela.id) {
        return {
          ...p,
          lastBillingSentAt: now,
          lastBillingChannel: 'email' as const,
          billingSentCount: (p.billingSentCount || 0) + 1
        };
      }
      return p;
    });
    onUpdateParcelas(updated);
    
    if (billingTargetParcela && billingTargetParcela.id === parcela.id) {
      setBillingTargetParcela({
        ...billingTargetParcela,
        lastBillingSentAt: now,
        lastBillingChannel: 'email',
        billingSentCount: (billingTargetParcela.billingSentCount || 0) + 1
      });
    }
    showToast(`E-mail de cobrança disparado para ${email}!`);
  };

  // Just record billing event as sent manually
  const handleRecordBillingSent = (parcela: Parcela, channel: 'whatsapp' | 'email' | 'both' = 'whatsapp') => {
    const now = new Date().toISOString();
    const updated = parcelas.map(p => {
      if (p.id === parcela.id) {
        return {
          ...p,
          lastBillingSentAt: now,
          lastBillingChannel: channel,
          billingSentCount: (p.billingSentCount || 0) + 1
        };
      }
      return p;
    });
    onUpdateParcelas(updated);
    if (billingTargetParcela && billingTargetParcela.id === parcela.id) {
      setBillingTargetParcela({
        ...billingTargetParcela,
        lastBillingSentAt: now,
        lastBillingChannel: channel,
        billingSentCount: (billingTargetParcela.billingSentCount || 0) + 1
      });
    }
    showToast('Cobrança registrada com sucesso no histórico da parcela.');
  };

  const handleLinkSingleMercadoPago = (parcela: Parcela) => {
    const student = formandosMap.get(parcela.formandoId);
    const mockTxId = `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const mockPix = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925WM2 FORMATURAS EVENTOS6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`;
    const mockBoletoBarcode = `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.${Math.floor(100000 + Math.random() * 900000)} 91020.150008 7 ${Math.floor(80000000000000 + Math.random() * 10000000000000)}`;
    const mockPaymentLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockTxId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPix)}`;
    const pdfUrl = `https://www.mercadopago.com.br/payments/ticket/${mockTxId}/pdf`;

    const updated = parcelas.map(p => {
      if (p.id === parcela.id) {
        return {
          ...p,
          gatewayProvider: 'mercadopago' as const,
          gatewayTransactionId: mockTxId,
          gatewayPaymentLink: mockPaymentLink,
          gatewayStatus: p.status === 'Paga' ? ('approved' as const) : ('pending' as const),
          gatewayCreatedAt: new Date().toISOString(),
          pixCode: p.pixCode || mockPix,
          pixQrCodeUrl: p.pixQrCodeUrl || qrUrl,
          boletoBarcode: p.boletoBarcode || mockBoletoBarcode,
          boletoPdfUrl: p.boletoPdfUrl || pdfUrl
        };
      }
      return p;
    });

    onUpdateParcelas(updated);
    showToast(`Cobrança Mercado Pago gerada e vinculada à Parcela #${parcela.number} do aluno ${student?.name || ''}!`);
  };

  const handleSyncWithMercadoPago = (parcela: Parcela) => {
    // Simulates an API call to Mercado Pago GET /v1/payments/{id}
    showToast(`Sincronizando com API Mercado Pago (ID: ${parcela.gatewayTransactionId || 'Gerando...'})`);
    setTimeout(() => {
      const updated = parcelas.map(p => {
        if (p.id === parcela.id) {
          return {
            ...p,
            gatewayProvider: 'mercadopago' as const,
            gatewayTransactionId: p.gatewayTransactionId || `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`,
            gatewayStatus: p.status === 'Paga' ? ('approved' as const) : ('pending' as const),
            gatewayCreatedAt: p.gatewayCreatedAt || new Date().toISOString()
          };
        }
        return p;
      });
      onUpdateParcelas(updated);
      showToast(`Status sincronizado com sucesso com os servidores do Mercado Pago.`);
    }, 400);
  };

  // Batch Linking
  const handleBatchLinkMercadoPago = () => {
    const targetIds = selectedIds.length > 0 ? selectedIds : filteredParcelas.filter(p => !p.gatewayTransactionId).map(p => p.id);
    if (targetIds.length === 0) {
      showToast('Nenhuma parcela selecionada ou pendente de vínculo.');
      return;
    }

    const updated = parcelas.map(p => {
      if (targetIds.includes(p.id)) {
        const mockTxId = p.gatewayTransactionId || `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const mockPix = p.pixCode || `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925WM2 FORMATURAS EVENTOS6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`;
        const mockBoletoBarcode = p.boletoBarcode || `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.${Math.floor(100000 + Math.random() * 900000)} 91020.150008 7 ${Math.floor(80000000000000 + Math.random() * 10000000000000)}`;
        return {
          ...p,
          gatewayProvider: 'mercadopago' as const,
          gatewayTransactionId: mockTxId,
          gatewayPaymentLink: p.gatewayPaymentLink || `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockTxId}`,
          gatewayStatus: p.status === 'Paga' ? ('approved' as const) : ('pending' as const),
          gatewayCreatedAt: p.gatewayCreatedAt || new Date().toISOString(),
          pixCode: mockPix,
          pixQrCodeUrl: p.pixQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPix)}`,
          boletoBarcode: mockBoletoBarcode,
          boletoPdfUrl: p.boletoPdfUrl || `https://www.mercadopago.com.br/payments/ticket/${mockTxId}/pdf`
        };
      }
      return p;
    });

    onUpdateParcelas(updated);
    setSelectedIds([]);
    setIsBatchModalOpen(false);
    showToast(`${targetIds.length} parcelas vinculadas e emitidas no Mercado Pago em lote!`);
  };

  // Batch Mark as Paid
  const handleBatchMarkAsPaid = () => {
    if (selectedIds.length === 0) return;
    const now = new Date().toISOString();
    const updated = parcelas.map(p => {
      if (selectedIds.includes(p.id)) {
        return {
          ...p,
          status: 'Paga' as const,
          payDate: p.payDate || now,
          gatewayStatus: 'approved' as const
        };
      }
      return p;
    });
    onUpdateParcelas(updated);
    const count = selectedIds.length;
    setSelectedIds([]);
    showToast(`${count} parcelas marcadas como PAGAS e conciliadas com sucesso!`);
  };

  // Batch Billing Execution
  const handleBatchBillingExecute = (channel: 'whatsapp' | 'email' | 'all' = 'whatsapp') => {
    const targetIds = selectedIds.length > 0
      ? selectedIds
      : filteredParcelas.filter(p => p.status !== 'Paga').map(p => p.id);

    if (targetIds.length === 0) {
      showToast('Nenhuma parcela inadimplente ou selecionada para cobrança.');
      return;
    }

    const now = new Date().toISOString();
    const updated = parcelas.map(p => {
      if (targetIds.includes(p.id)) {
        const mockTxId = p.gatewayTransactionId || `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const mockPix = p.pixCode || `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925WM2 FORMATURAS EVENTOS6009SAO PAULO62070503***6304${Math.floor(1000 + Math.random() * 9000)}`;
        const mockBoletoBarcode = p.boletoBarcode || `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.${Math.floor(100000 + Math.random() * 900000)} 91020.150008 7 ${Math.floor(80000000000000 + Math.random() * 10000000000000)}`;
        const mockPaymentLink = p.gatewayPaymentLink || `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockTxId}`;
        const qrUrl = p.pixQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPix)}`;
        const pdfUrl = p.boletoPdfUrl || `https://www.mercadopago.com.br/payments/ticket/${mockTxId}/pdf`;

        return {
          ...p,
          gatewayProvider: 'mercadopago' as const,
          gatewayTransactionId: mockTxId,
          gatewayPaymentLink: mockPaymentLink,
          gatewayStatus: p.status === 'Paga' ? ('approved' as const) : ('pending' as const),
          gatewayCreatedAt: p.gatewayCreatedAt || now,
          pixCode: mockPix,
          pixQrCodeUrl: qrUrl,
          boletoBarcode: mockBoletoBarcode,
          boletoPdfUrl: pdfUrl,
          lastBillingSentAt: now,
          lastBillingChannel: channel === 'all' ? ('both' as const) : channel,
          billingSentCount: (p.billingSentCount || 0) + 1
        };
      }
      return p;
    });

    onUpdateParcelas(updated);
    setIsBatchBillingOpen(false);
    setSelectedIds([]);
    showToast(`Cobrança em lote processada para ${targetIds.length} parcelas! Links Mercado Pago gerados.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID Parcela', 'Formando', 'CPF', 'Turma', 'Nº Parcela', 'Valor (R$)', 'Vencimento', 'Status Pagamento', 'Data Pagamento', 'Provedor Gateway', 'ID Transação Mercado Pago', 'Status MP', 'Código Pix', 'Código de Barras'];
    const rows = filteredParcelas.map(p => {
      const student = formandosMap.get(p.formandoId);
      const turma = student ? turmasMap.get(student.turmaId) : null;
      return [
        p.id,
        `"${student?.name || ''}"`,
        `"${student?.cpf || ''}"`,
        `"${turma?.name || ''}"`,
        p.number,
        p.value.toFixed(2),
        p.dueDate,
        p.status,
        p.payDate || '',
        p.gatewayProvider || 'manual',
        p.gatewayTransactionId || '',
        p.gatewayStatus || '',
        `"${p.pixCode || ''}"`,
        `"${p.boletoBarcode || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_parcelas_mercadopago_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório CSV de parcelas exportado com sucesso!');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with branding and quick stats */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-lg relative overflow-hidden">
        {/* Background decorative ambient */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#009EE3]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-[#aa904f]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-[#009EE3]/20 border border-[#009EE3]/40 flex items-center justify-center text-[#009EE3] shadow-inner">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
                {title}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#009EE3] text-white tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" /> Mercado Pago Sync
              </span>
            </div>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-neutral-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Exportar dados das parcelas para Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#aa904f]" />
              Exportar CSV
            </button>

            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="bg-[#009EE3] hover:bg-[#008cc9] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-sky-200" />
              Vincular MP em Lote
            </button>
          </div>
        </div>

        {/* 4 Financial & Gateway KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-neutral-800/80">
          {/* Total Parcelas */}
          <div className="bg-neutral-800/60 backdrop-blur-md rounded-2xl p-4 border border-neutral-700/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
              Total de Parcelas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{metrics.totalCount}</span>
              <span className="text-[11px] font-medium text-neutral-400">
                ({metrics.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
              <span>{filteredParcelas.length} exibidas no filtro</span>
            </div>
          </div>

          {/* Pagas */}
          <div className="bg-emerald-950/40 backdrop-blur-md rounded-2xl p-4 border border-emerald-800/50">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
              Pagas / Aprovadas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-300">{metrics.paidCount}</span>
              <span className="text-[11px] font-bold text-emerald-400">
                {metrics.paidRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-semibold">
              {metrics.paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          {/* Pendentes */}
          <div className="bg-amber-950/30 backdrop-blur-md rounded-2xl p-4 border border-amber-800/50">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
              Pendentes / A Vencer
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-300">{metrics.pendingCount}</span>
              <span className="text-[11px] font-bold text-amber-400">
                {metrics.totalCount > 0 ? ((metrics.pendingCount / metrics.totalCount) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-semibold">
              {metrics.pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          {/* Vinculadas MP */}
          <div className="bg-sky-950/40 backdrop-blur-md rounded-2xl p-4 border border-sky-800/60">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block mb-1 flex items-center justify-between">
              <span>Vínculo Mercado Pago</span>
              <span className="w-2 h-2 rounded-full bg-[#009EE3] animate-pulse"></span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-sky-300">{metrics.mpLinkedCount}</span>
              <span className="text-[11px] font-bold text-sky-400">
                {metrics.mpLinkedRate.toFixed(0)}% coberto
              </span>
            </div>
            <div className="text-[10px] text-sky-300/80 mt-1 font-semibold">
              {metrics.totalCount - metrics.mpLinkedCount} sem registro MP
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      {showFiltersHeader && (
        <div className="bg-white bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/70 border-neutral-200 shadow-sm space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar formando, CPF, Parcela # ou ID Mercado Pago..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 pl-9 pr-8 py-2 rounded-xl text-xs text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Turma Filter */}
            <div>
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 text-neutral-800 outline-none focus:border-[#009EE3]"
              >
                <option value="all">Todas as Turmas ({turmas.length})</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter (Pendente / Pago / Atrasado) */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 text-neutral-800 outline-none focus:border-[#009EE3]"
              >
                <option value="all">Todos os Status</option>
                <option value="Pendente">🟡 Pendentes</option>
                <option value="Paga">🟢 Pagas / Aprovadas</option>
                <option value="Atrasada">🔴 Atrasadas</option>
              </select>
            </div>

            {/* Mercado Pago Binding Filter */}
            <div>
              <select
                value={selectedMpBinding}
                onChange={(e) => setSelectedMpBinding(e.target.value)}
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 text-neutral-800 outline-none focus:border-[#009EE3]"
              >
                <option value="all">Vínculo: Todos</option>
                <option value="linked">⚡ Vinculadas Mercado Pago</option>
                <option value="unlinked">⚠️ Não Vinculadas / Sem ID</option>
              </select>
            </div>
          </div>

          {/* Secondary Sorting and Batch Selection Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 border-neutral-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 font-medium">
                Ordenar por:
              </span>
              <div className="flex items-center gap-1.5">
                {(['dueDate', 'student', 'value', 'status'] as const).map(field => {
                  const labels = { dueDate: 'Vencimento', student: 'Formando', value: 'Valor', status: 'Status' };
                  const isCurrent = sortField === field;
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => {
                        if (isCurrent) {
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField(field);
                          setSortOrder('asc');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#009EE3]/15 text-[#009EE3] border border-[#009EE3]/30'
                          : 'bg-neutral-100 bg-neutral-50 text-neutral-600 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {labels[field]}
                      {isCurrent && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Batch actions bar if items are selected */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-[#009EE3]/10 dark:bg-[#009EE3]/20 border border-[#009EE3]/40 px-3 py-1.5 rounded-xl animate-fade-in flex-wrap">
                <span className="font-bold text-[#009EE3] text-[11px]">
                  {selectedIds.length} selecionada{selectedIds.length > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBatchBillingOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  title="Enviar Notificação de Cobrança com link do Mercado Pago para selecionados"
                >
                  <Send className="w-3 h-3" /> Enviar Cobrança ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={handleBatchMarkAsPaid}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Baixar Pagas
                </button>
                <button
                  type="button"
                  onClick={handleBatchLinkMercadoPago}
                  className="bg-[#009EE3] hover:bg-[#0088c4] text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Zap className="w-3 h-3" /> Vincular ao MP
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-[10px] font-bold underline ml-1 cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table / List Card */}
      <div className="bg-white bg-white rounded-2xl border border-neutral-200/70 border-neutral-200 shadow-sm overflow-hidden">
        {/* Table summary bar */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200/70 border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {selectedIds.length > 0 && selectedIds.length === filteredParcelas.length ? (
                <CheckSquare className="w-4 h-4 text-[#009EE3]" />
              ) : selectedIds.length > 0 ? (
                <div className="w-4 h-4 rounded bg-[#009EE3] flex items-center justify-center text-white text-[10px] font-bold">-</div>
              ) : (
                <Square className="w-4 h-4 text-neutral-400" />
              )}
              <span>Selecionar Todos ({filteredParcelas.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pago ({filteredParcelas.filter(p => p.status === 'Paga').length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendente ({filteredParcelas.filter(p => p.status === 'Pendente').length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Atrasado ({filteredParcelas.filter(p => p.status === 'Atrasada').length})
            </span>
          </div>
        </div>

        {/* Empty state */}
        {filteredParcelas.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-neutral-300 mx-auto" />
            <h4 className="font-bold text-sm text-neutral-700 text-neutral-700">
              Nenhuma parcela encontrada
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Nenhuma cobrança corresponde aos filtros ou termo de busca informado. Tente limpar os filtros para visualizar os dados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTurma('all');
                setSelectedStatus('all');
                setSelectedMpBinding('all');
              }}
              className="bg-neutral-100 hover:bg-neutral-200 bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 text-neutral-900 px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-neutral-100/70 bg-neutral-50/60 text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase tracking-wider border-b border-neutral-200/70 border-neutral-200">
                  <th className="py-3 px-4 w-10 text-center">#</th>
                  <th className="py-3 px-4">Formando / Turma</th>
                  <th className="py-3 px-4">Parcela / Vencimento</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status Pagamento</th>
                  <th className="py-3 px-4">Registro Mercado Pago</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {filteredParcelas.map((p) => {
                  const student = formandosMap.get(p.formandoId);
                  const turma = student ? turmasMap.get(student.turmaId) : null;
                  const isLinked = !!p.gatewayTransactionId || p.gatewayProvider === 'mercadopago';
                  const isSelected = selectedIds.includes(p.id);

                  // Calculate overdue days or days until due
                  const dueDateObj = new Date(p.dueDate);
                  const todayObj = new Date();
                  todayObj.setHours(0, 0, 0, 0);
                  const diffTime = dueDateObj.getTime() - todayObj.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 hover:bg-neutral-100/50 transition-colors ${
                        isSelected ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(p.id)}
                          className="cursor-pointer text-neutral-400 hover:text-[#009EE3]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#009EE3]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Student & Turma */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 text-neutral-900 flex items-center gap-1.5">
                          <span>{student?.name || 'Formando Não Encontrado'}</span>
                          {student?.status === 'Inadimplente' && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                              Inadimplente
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span>CPF: {student?.cpf || '---'}</span>
                          <span>•</span>
                          <span className="text-[#aa904f] font-medium">{turma?.name || 'Sem Turma'}</span>
                        </div>
                      </td>

                      {/* Parcela & Due Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-800 text-neutral-800 flex items-center gap-1.5">
                          <span>Parcela #{p.number}</span>
                          <span className="text-[10px] font-normal text-neutral-400">
                            ({p.type || 'Pix/Boleto'})
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>Venc: {new Date(p.dueDate).toLocaleDateString('pt-BR')}</span>
                          {p.status !== 'Paga' && (
                            <span className={`font-semibold ${diffDays < 0 ? 'text-rose-500' : diffDays <= 5 ? 'text-amber-500' : 'text-neutral-400'}`}>
                              {diffDays < 0 ? `(${Math.abs(diffDays)}d atrasada)` : diffDays === 0 ? '(Vence hoje!)' : `(em ${diffDays}d)`}
                            </span>
                          )}
                        </div>

                        {/* Billing Sent info */}
                        {p.lastBillingSentAt && (
                          <div className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5" title={`Cobrança enviada em ${new Date(p.lastBillingSentAt).toLocaleDateString('pt-BR')} (${p.billingSentCount || 1}x)`}>
                            <Bell className="w-2.5 h-2.5" />
                            <span>Cobrado {new Date(p.lastBillingSentAt).toLocaleDateString('pt-BR')} ({p.lastBillingChannel || 'WhatsApp'})</span>
                          </div>
                        )}
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-neutral-900 text-neutral-900 text-sm">
                          {p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        {p.description && (
                          <div className="text-[9px] text-neutral-400 truncate max-w-[120px]" title={p.description}>
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Payment Status (Pendente / Pago / Atrasado) */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            p.status === 'Paga'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : p.status === 'Atrasada'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'Paga' ? 'bg-emerald-500' : p.status === 'Atrasada' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {p.status === 'Paga' ? 'Pago' : p.status === 'Atrasada' ? 'Atrasada' : 'Pendente'}
                          </span>

                          {p.status === 'Paga' && p.payDate && (
                            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Pago em {new Date(p.payDate).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Mercado Pago Record Link */}
                      <td className="py-3.5 px-4">
                        {isLinked ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-[#009EE3]/10 text-[#009EE3] border border-[#009EE3]/30 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-2.5 h-2.5" /> Mercado Pago
                              </span>
                              <span className="font-mono text-[10px] text-neutral-600 text-neutral-700 font-bold">
                                {p.gatewayTransactionId}
                              </span>
                            </div>

                            {/* Quick Pix / Boleto codes */}
                            <div className="flex items-center gap-2 text-[10px]">
                              {p.pixCode && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(p.pixCode!, `pix-${p.id}`, 'Pix Copia e Cola')}
                                  className="text-[#aa904f] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                                  title="Copiar Pix Copia e Cola"
                                >
                                  {copiedKey === `pix-${p.id}` ? '✓ Copiado' : '⚡ Copiar Pix'}
                                </button>
                              )}
                              {p.boletoBarcode && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(p.boletoBarcode!, `bol-${p.id}`, 'Código de Barras')}
                                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                                  title="Copiar Código de Barras"
                                >
                                  {copiedKey === `bol-${p.id}` ? '✓ Copiado' : '📄 Boleto'}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Sem registro MP
                            </span>
                            <button
                              type="button"
                              onClick={() => handleLinkSingleMercadoPago(p)}
                              className="bg-neutral-100 hover:bg-[#009EE3] hover:text-white text-neutral-700 bg-neutral-50 text-neutral-700 dark:hover:bg-[#009EE3] hover:text-neutral-900 px-2 py-0.5 rounded text-[10px] font-bold border border-neutral-200 border-neutral-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Zap className="w-3 h-3 text-[#009EE3]" />
                              Gerar no MP
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                          {/* Send Billing Button (WhatsApp / Email / Mercado Pago Link) */}
                          {p.status !== 'Paga' && (
                            <button
                              type="button"
                              onClick={() => handleOpenBillingModal(p)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                                p.status === 'Atrasada'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-[#009EE3] hover:bg-[#0088c4] text-white'
                              }`}
                              title="Enviar Cobrança com Link Único do Mercado Pago via WhatsApp ou E-mail"
                            >
                              <Send className="w-3 h-3" />
                              <span>Enviar Cobrança</span>
                            </button>
                          )}

                          {/* Toggle Paid / Pending */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              p.status === 'Paga'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
                            }`}
                            title={p.status === 'Paga' ? 'Reabrir como Pendente' : 'Dar Baixa Manual (Marcar como Pago)'}
                          >
                            {p.status === 'Paga' ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Sync with MP */}
                          {isLinked && (
                            <button
                              type="button"
                              onClick={() => handleSyncWithMercadoPago(p)}
                              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 text-neutral-700 border border-neutral-200 border-neutral-200 transition-all cursor-pointer"
                              title="Sincronizar status com a API do Mercado Pago"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Full Details Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailParcela(p)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-[#009EE3] text-sky-700 hover:text-white dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-[#009EE3] hover:text-neutral-900 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                            title="Ver detalhes da transação Mercado Pago"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL (Mercado Pago Transaction Inspection) */}
      <AnimatePresence>
        {selectedDetailParcela && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white bg-white rounded-3xl p-6 max-w-xl w-full border border-neutral-200 border-neutral-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {(() => {
                const student = formandosMap.get(selectedDetailParcela.formandoId);
                const turma = student ? turmasMap.get(student.turmaId) : null;
                const isLinked = !!selectedDetailParcela.gatewayTransactionId;

                return (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-100 border-neutral-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#009EE3]/15 text-[#009EE3] flex items-center justify-center font-bold">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-neutral-900 text-neutral-900">
                            Detalhes da Parcela #{selectedDetailParcela.number}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Registro de cobrança & integração Mercado Pago
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailParcela(null)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Student Info Card */}
                    <div className="bg-neutral-50 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-750 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Formando</span>
                        <span className="font-bold text-neutral-900 text-neutral-900">{student?.name || '---'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Turma</span>
                        <span className="font-bold text-[#aa904f]">{turma?.name || '---'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">CPF</span>
                        <span className="font-mono text-neutral-700 text-neutral-700">{student?.cpf || '---'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">E-mail</span>
                        <span className="text-neutral-700 text-neutral-700">{student?.email || '---'}</span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-neutral-100 bg-neutral-50 rounded-xl border border-neutral-200 border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Valor</span>
                        <span className="text-base font-black text-neutral-900 text-neutral-900">
                          {selectedDetailParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="p-3 bg-neutral-100 bg-neutral-50 rounded-xl border border-neutral-200 border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Vencimento</span>
                        <span className="text-xs font-bold text-neutral-800 text-neutral-800">
                          {new Date(selectedDetailParcela.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="p-3 bg-neutral-100 bg-neutral-50 rounded-xl border border-neutral-200 border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Status Atual</span>
                        <span className={`text-xs font-bold ${
                          selectedDetailParcela.status === 'Paga' ? 'text-emerald-600' : selectedDetailParcela.status === 'Atrasada' ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          {selectedDetailParcela.status}
                        </span>
                      </div>
                    </div>

                    {/* Mercado Pago Data Section */}
                    <div className="space-y-3 bg-sky-50/50 dark:bg-sky-950/20 p-4 rounded-2xl border border-sky-200/80 dark:border-sky-800/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#009EE3]">
                          <Sparkles className="w-4 h-4" />
                          <span>Registro no Mercado Pago</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {isLinked ? 'Vinculado' : 'Sem Registro'}
                        </span>
                      </div>

                      {isLinked ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-sky-100 dark:border-sky-900/50">
                            <span className="text-neutral-500">ID da Transação:</span>
                            <span className="font-mono font-bold text-neutral-800 text-neutral-900 flex items-center gap-1">
                              {selectedDetailParcela.gatewayTransactionId}
                              <button
                                type="button"
                                onClick={() => handleCopy(selectedDetailParcela.gatewayTransactionId!, 'modal-tx', 'ID de Transação')}
                                className="text-[#009EE3] hover:text-[#0088c4]"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-sky-100 dark:border-sky-900/50">
                            <span className="text-neutral-500">Status no Gateway:</span>
                            <span className="font-bold text-emerald-600">
                              {selectedDetailParcela.gatewayStatus || (selectedDetailParcela.status === 'Paga' ? 'approved' : 'pending')}
                            </span>
                          </div>

                          {selectedDetailParcela.pixCode && (
                            <div className="pt-2 space-y-1">
                              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Pix Copia e Cola:</span>
                              <div className="bg-white bg-neutral-50 p-2 rounded-lg border border-neutral-200 border-neutral-200 font-mono text-[10px] break-all flex justify-between items-center gap-2">
                                <span className="truncate">{selectedDetailParcela.pixCode}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(selectedDetailParcela.pixCode!, 'modal-pix', 'Pix Copia e Cola')}
                                  className="text-[#009EE3] shrink-0 font-bold"
                                >
                                  Copiar
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedDetailParcela.boletoBarcode && (
                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Linha Digitável Boleto:</span>
                              <div className="bg-white bg-neutral-50 p-2 rounded-lg border border-neutral-200 border-neutral-200 font-mono text-[10px] break-all flex justify-between items-center gap-2">
                                <span className="truncate">{selectedDetailParcela.boletoBarcode}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(selectedDetailParcela.boletoBarcode!, 'modal-bol', 'Código de Barras')}
                                  className="text-[#009EE3] shrink-0 font-bold"
                                >
                                  Copiar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-3 space-y-2">
                          <p className="text-xs text-neutral-500">
                            Esta parcela ainda não possui um registro vinculado no Mercado Pago.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              handleLinkSingleMercadoPago(selectedDetailParcela);
                              setSelectedDetailParcela(null);
                            }}
                            className="bg-[#009EE3] hover:bg-[#0088c4] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 mx-auto"
                          >
                            <Zap className="w-3.5 h-3.5" /> Gerar Registro Mercado Pago
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100 border-neutral-200 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {selectedDetailParcela.status !== 'Paga' && (
                          <button
                            type="button"
                            onClick={() => {
                              const p = selectedDetailParcela;
                              setSelectedDetailParcela(null);
                              handleOpenBillingModal(p);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar Cobrança</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(selectedDetailParcela)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            selectedDetailParcela.status === 'Paga'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {selectedDetailParcela.status === 'Paga' ? 'Reabrir como Pendente' : 'Dar Baixa como Pago'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDetailParcela(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 text-neutral-700 hover:bg-neutral-100 hover:bg-neutral-100 transition-all cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE BILLING MODAL (WhatsApp / E-mail / Unique Mercado Pago Link) */}
      <AnimatePresence>
        {billingTargetParcela && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white bg-white rounded-3xl p-6 max-w-2xl w-full border border-neutral-200 border-neutral-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {(() => {
                const student = formandosMap.get(billingTargetParcela.formandoId);
                const turma = student ? turmasMap.get(student.turmaId) : null;
                const formattedDueDate = new Date(billingTargetParcela.dueDate + (billingTargetParcela.dueDate.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('pt-BR');
                const formattedValue = billingTargetParcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const cleanPhone = (student?.phone || '').replace(/\D/g, '');

                return (
                  <>
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-100 border-neutral-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-neutral-900 text-neutral-900">
                              Enviar Notificação de Cobrança
                            </h3>
                            <span className="bg-[#009EE3]/15 text-[#009EE3] border border-[#009EE3]/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Mercado Pago Link
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400">
                            Dispare um lembrete com link único e baixa automática para o formando
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBillingTargetParcela(null)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Student & Parcela Summary Banner */}
                    <div className="bg-neutral-50 bg-neutral-50/60 rounded-2xl p-4 border border-neutral-200/70 border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Formando</span>
                        <span className="font-bold text-neutral-900 text-neutral-900 text-sm block truncate">{student?.name || '---'}</span>
                        <span className="text-[11px] text-neutral-500">{student?.phone || 'Sem telefone'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Turma & Parcela</span>
                        <span className="font-bold text-[#aa904f] block truncate">{turma?.name || 'Formatura'}</span>
                        <span className="text-neutral-700 text-neutral-700 font-semibold">Parcela #{billingTargetParcela.number}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Valor & Vencimento</span>
                        <span className="font-black text-rose-600 dark:text-rose-400 text-sm block">{formattedValue}</span>
                        <span className="text-neutral-500 font-medium">Vencimento: {formattedDueDate}</span>
                      </div>
                    </div>

                    {/* Channel Selector Tabs */}
                    <div className="flex border-b border-neutral-200 border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setActiveBillingChannelTab('whatsapp')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                          activeBillingChannelTab === 'whatsapp'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp Direto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveBillingChannelTab('email')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                          activeBillingChannelTab === 'email'
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>E-mail</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveBillingChannelTab('link')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                          activeBillingChannelTab === 'link'
                            ? 'border-[#009EE3] text-[#009EE3]'
                            : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                      >
                        <Link2 className="w-4 h-4" />
                        <span>Link Único & QR Pix</span>
                      </button>
                    </div>

                    {/* Tab Content: WhatsApp or Email Editable Message */}
                    {(activeBillingChannelTab === 'whatsapp' || activeBillingChannelTab === 'email') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-700 text-neutral-700 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#aa904f]" />
                            <span>Mensagem Personalizada da Cobrança:</span>
                          </label>
                          <span className="text-[10px] text-neutral-400">
                            {activeBillingChannelTab === 'whatsapp' ? 'Será enviada via WhatsApp' : 'Será enviada para o e-mail do aluno'}
                          </span>
                        </div>

                        <textarea
                          rows={6}
                          value={customBillingMessage}
                          onChange={(e) => setCustomBillingMessage(e.target.value)}
                          className="w-full text-xs font-mono p-3 rounded-2xl border border-neutral-300 border-neutral-200 bg-neutral-50/50 bg-neutral-50/50 text-neutral-800 text-neutral-800 focus:ring-2 focus:ring-[#009EE3] focus:border-transparent outline-hidden resize-y"
                          placeholder="Digite a mensagem de cobrança..."
                        />

                        {/* Quick Message Actions */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(customBillingMessage, 'cobranca-msg', 'Mensagem de cobrança')}
                              className="text-xs text-neutral-600 text-neutral-700 bg-neutral-100 bg-neutral-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-xl border border-neutral-200 border-neutral-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedKey === 'cobranca-msg' ? '✓ Copiado' : 'Copiar Texto'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(billingTargetParcela.gatewayPaymentLink || '', 'cobranca-link', 'Link Mercado Pago')}
                              className="text-xs text-[#009EE3] bg-[#009EE3]/10 hover:bg-[#009EE3]/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{copiedKey === 'cobranca-link' ? '✓ Link Copiado' : 'Copiar Somente Link'}</span>
                            </button>
                          </div>

                          {/* Trigger Button */}
                          {activeBillingChannelTab === 'whatsapp' ? (
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppBilling(billingTargetParcela, customBillingMessage)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Disparar WhatsApp (+55 {cleanPhone || 'Número'})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendEmailBilling(billingTargetParcela, customBillingMessage)}
                              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Disparar E-mail ({student?.email || 'Sem E-mail'})</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab Content: Unique Link & Pix QR */}
                    {activeBillingChannelTab === 'link' && (
                      <div className="space-y-4 bg-sky-50/50 dark:bg-sky-950/20 p-4 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 text-xs">
                        <div className="space-y-1.5">
                          <span className="font-bold text-neutral-700 text-neutral-700 block">Link de Checkout Único Mercado Pago:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={billingTargetParcela.gatewayPaymentLink || ''}
                              className="w-full text-xs font-mono p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-white bg-neutral-50 text-neutral-800 text-neutral-800"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopy(billingTargetParcela.gatewayPaymentLink || '', 'mp-unique-link', 'Link Mercado Pago')}
                              className="bg-[#009EE3] hover:bg-[#0088c4] text-white px-3 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedKey === 'mp-unique-link' ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                          </div>
                        </div>

                        {billingTargetParcela.pixCode && (
                          <div className="space-y-1.5">
                            <span className="font-bold text-neutral-700 text-neutral-700 block">Código Pix Copia e Cola:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={billingTargetParcela.pixCode}
                                className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-200 border-neutral-200 bg-white bg-neutral-50 text-neutral-800 text-neutral-800 truncate"
                              />
                              <button
                                type="button"
                                onClick={() => handleCopy(billingTargetParcela.pixCode!, 'mp-pix-code', 'Pix Copia e Cola')}
                                className="bg-[#aa904f] hover:bg-[#998044] text-white px-3 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copiedKey === 'mp-pix-code' ? 'Copiado!' : 'Copiar Pix'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Toggle QR code visual preview */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setShowQrPreview(!showQrPreview)}
                            className="text-xs font-bold text-[#009EE3] hover:underline flex items-center gap-1.5 cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>{showQrPreview ? 'Ocultar QR Code' : 'Visualizar QR Code Pix'}</span>
                          </button>

                          {showQrPreview && billingTargetParcela.pixQrCodeUrl && (
                            <div className="mt-3 p-4 bg-white bg-neutral-50 rounded-2xl border border-neutral-200 border-neutral-200 text-center space-y-2">
                              <img
                                src={billingTargetParcela.pixQrCodeUrl}
                                alt="QR Code Pix Mercado Pago"
                                className="w-40 h-40 mx-auto rounded-xl shadow-xs"
                                referrerPolicy="no-referrer"
                              />
                              <p className="text-[11px] text-neutral-500 font-semibold">
                                Escaneie com qualquer aplicativo bancário para pagar instantaneamente
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Historical Status & Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 border-neutral-200 flex-wrap gap-2 text-xs">
                      <div>
                        {billingTargetParcela.lastBillingSentAt ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                            <CheckCheck className="w-4 h-4" />
                            <span>Cobrado {billingTargetParcela.billingSentCount || 1}x (Última: {new Date(billingTargetParcela.lastBillingSentAt).toLocaleDateString('pt-BR')} via {billingTargetParcela.lastBillingChannel || 'WhatsApp'})</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400">Nenhuma cobrança registrada anteriormente para esta parcela.</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRecordBillingSent(billingTargetParcela, activeBillingChannelTab === 'email' ? 'email' : 'whatsapp')}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 border-neutral-200 text-neutral-600 text-neutral-700 hover:bg-neutral-100 hover:bg-neutral-100 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Marcar como Cobrado
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingTargetParcela(null)}
                          className="px-4 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH BILLING MODAL */}
      <AnimatePresence>
        {isBatchBillingOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white bg-white rounded-3xl p-6 max-w-md w-full border border-neutral-200 border-neutral-200 shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-base text-neutral-900 text-neutral-900">
                  Disparo de Cobrança em Massa
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedIds.length > 0
                    ? `Gerar links de pagamento do Mercado Pago e preparar cobrança para as ${selectedIds.length} parcelas selecionadas.`
                    : `Disparar para todas as ${filteredParcelas.filter(p => p.status !== 'Paga').length} parcelas inadimplentes/pendentes filtradas.`}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleBatchBillingExecute('whatsapp')}
                  className="w-full p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Disparar via WhatsApp</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleBatchBillingExecute('email')}
                  className="w-full p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300 font-bold hover:bg-sky-100 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>Disparar por E-mail</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleBatchBillingExecute('all')}
                  className="w-full p-3.5 rounded-2xl border border-neutral-200 border-neutral-200 bg-neutral-50 bg-neutral-50 text-neutral-800 text-neutral-800 font-bold hover:bg-neutral-100 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#009EE3]" />
                    <span>Gerar Links Mercado Pago & Registrar no Histórico</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchBillingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH LINKING CONFIRMATION MODAL */}
      <AnimatePresence>
        {isBatchModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white bg-white rounded-3xl p-6 max-w-md w-full border border-neutral-200 border-neutral-200 shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#009EE3]/15 text-[#009EE3] flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-base text-neutral-900 text-neutral-900">
                  Vinculação em Lote com Mercado Pago
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedIds.length > 0
                    ? `Deseja gerar registros e códigos Pix/Boleto do Mercado Pago para as ${selectedIds.length} parcelas selecionadas?`
                    : `Deseja gerar registros do Mercado Pago para todas as parcelas sem vínculo atual (${filteredParcelas.filter(p => !p.gatewayTransactionId).length} parcelas)?`}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 bg-neutral-50 rounded-2xl border border-neutral-200 border-neutral-200 text-xs space-y-1 text-neutral-600 text-neutral-700">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Emissão Automática de Códigos Pix & Boletos</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#009EE3] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Geração de Transaction ID & Link de Pagamento</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleBatchLinkMercadoPago}
                  className="bg-[#009EE3] hover:bg-[#0088c4] text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Confirmar Emissão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
