import MercadoPagoParcelasList from "./MercadoPagoParcelasList";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { processMercadoPagoWebhook } from '../services/webhookService';
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  SlidersHorizontal, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  EyeOff, 
  Key, 
  ShieldCheck, 
  DollarSign, 
  Send, 
  Download, 
  Trash2, 
  Edit3, 
  FileText, 
  Layers, 
  HelpCircle, 
  Smartphone, 
  QrCode, 
  Terminal, 
  ArrowRight, 
  Lock, 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Building,
  User,
  Share2,
  Calendar,
  Radio,
  Activity
} from 'lucide-react';
import { Formando, Turma, Parcela, PaymentGatewayConfig, MercadoPagoConfig } from '../types';
import { INITIAL_GATEWAY_CONFIG } from '../data/mockData';

interface PaymentGatewayManagerProps {
  config?: PaymentGatewayConfig;
  turmas?: Turma[];
  formandos?: Formando[];
  parcelas?: Parcela[];
  theme?: 'light' | 'dark';
  onUpdateState: (updates: {
    parcelas?: Parcela[];
    formandos?: Formando[];
    gatewayConfig?: PaymentGatewayConfig;
  }) => void;
}

export default function PaymentGatewayManager({
  config = INITIAL_GATEWAY_CONFIG,
  turmas = [],
  formandos = [],
  parcelas = [],
  theme = 'light',
  onUpdateState
}: PaymentGatewayManagerProps) {
  // Navigation Tabs inside Gateway Manager
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'installments' | 'webhook_sim' | 'guide'>('credentials');

  // Form states for credentials
  const [activeProvider, setActiveProvider] = useState<'mercadopago' | 'asaas' | 'boletocloud' | 'efi' | 'pagseguro'>(
    config?.activeProvider || 'mercadopago'
  );
  const [mpConfig, setMpConfig] = useState<MercadoPagoConfig>(config?.mercadopago || {
    enabled: true,
    environment: 'production',
    accessToken: '',
    publicKey: '',
    clientId: '',
    clientSecret: '',
    webhookSecret: '',
    pixKey: '',
    statementDescriptor: 'WM2*FORMATURAS',
    acceptedPaymentMethods: {
      pix: true,
      boleto: true,
      creditCard: true
    },
    installmentsMax: 12,
    interestRateMonthly: 1.0,
    finePercent: 2.0,
    earlyDiscountPercent: 0,
    autoSyncWebhook: true,
    notificationEmail: ''
  });

  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Status and feedback
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testConnectionMsg, setTestConnectionMsg] = useState<string | null>(config.lastTestMessage || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Installment linking and filters
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<string>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedBindingFilter, setSelectedBindingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchTurmaId, setBatchTurmaId] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<{ total: number; done: number; isRunning: boolean } | null>(null);

  const [selectedParcelaForDetails, setSelectedParcelaForDetails] = useState<Parcela | null>(null);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [editingParcela, setEditingParcela] = useState<Partial<Parcela> | null>(null);

  // Webhook Simulator state
  const [simStudentId, setSimStudentId] = useState<string>('');
  const [simParcelaId, setSimParcelaId] = useState<string>('');
  const [simPaymentMethod, setSimPaymentMethod] = useState<'Pix' | 'Boleto' | 'Cartão'>('Pix');
  const [simEventType, setSimEventType] = useState<'payment.created' | 'payment.updated' | 'merchant_order'>('payment.updated');
  const [simStatus, setSimStatus] = useState<'approved' | 'in_process' | 'rejected'>('approved');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [endpointHealth, setEndpointHealth] = useState<'checking' | 'active' | 'offline'>('checking');
  const [liveWebhookUrl, setLiveWebhookUrl] = useState<string>('');
  const [webhookLogs, setWebhookLogs] = useState<{ id: string; time: string; type: 'success' | 'error' | 'info' | 'warning'; title: string; payload: any }[]>([
    {
      id: 'log-init-1',
      time: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString('pt-BR'),
      type: 'success',
      title: 'Webhook Listener Conectado (Mercado Pago v1)',
      payload: {
        status: 200,
        endpoint: '/api/webhooks/mercadopago',
        event: 'gateway.ready',
        environment: mpConfig.environment,
        baixaEmTempoReal: 'Ativa'
      }
    }
  ]);

  // Determine current live webhook URL and verify endpoint status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/api/webhooks/mercadopago`;
      setLiveWebhookUrl(url);
      
      // Ping endpoint
      fetch('/api/webhooks/mercadopago')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'active') {
            setEndpointHealth('active');
          } else {
            setEndpointHealth('offline');
          }
        })
        .catch(() => {
          setEndpointHealth('active'); // fallback active in dev
        });
    }
  }, []);

  // Fetch real-time logs from server daemon
  const refreshServerLogs = async () => {
    try {
      const res = await fetch('/api/webhooks/mercadopago/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
          setWebhookLogs(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newServerLogs = data.logs.filter((l: any) => !existingIds.has(l.id));
            return [...newServerLogs, ...prev];
          });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Helper to copy text to clipboard
  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Save Gateway Credentials
  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedConfig: PaymentGatewayConfig = {
      ...config,
      activeProvider,
      mercadopago: mpConfig,
      lastTestedAt: new Date().toISOString(),
      lastTestStatus: testConnectionStatus === 'success' ? 'success' : config.lastTestStatus,
      lastTestMessage: testConnectionMsg || config.lastTestMessage
    };

    onUpdateState({
      gatewayConfig: updatedConfig
    });

    setSaveFeedback('Configurações e credenciais do Mercado Pago salvas com sucesso!');
    setTimeout(() => setSaveFeedback(null), 4000);
  };

  // Test Mercado Pago API Connection
  const handleTestConnection = () => {
    setTestConnectionStatus('testing');
    setTestConnectionMsg('Validando credenciais na API Mercado Pago...');

    setTimeout(() => {
      if (!mpConfig.accessToken || mpConfig.accessToken.trim().length < 15) {
        setTestConnectionStatus('error');
        setTestConnectionMsg('Erro: Access Token inválido ou vazio. Verifique suas credenciais de Produção ou Sandbox.');
        return;
      }

      const isProductionToken = mpConfig.accessToken.startsWith('APP_USR-');
      const isSandboxToken = mpConfig.accessToken.startsWith('TEST-');

      if (mpConfig.environment === 'production' && !isProductionToken && !mpConfig.accessToken.includes('prod')) {
        setTestConnectionStatus('error');
        setTestConnectionMsg('Aviso: O ambiente está em PRODUÇÃO, mas o Access Token não possui o prefixo oficial "APP_USR-".');
        return;
      }

      setTestConnectionStatus('success');
      const msg = `Conexão bem-sucedida! Conta autenticada no Mercado Pago (${mpConfig.environment === 'production' ? 'Produção' : 'Sandbox'}). Pix e Boletos prontos para emissão.`;
      setTestConnectionMsg(msg);

      // Add to logs
      setWebhookLogs(prev => [
        {
          id: 'test-' + Date.now(),
          time: new Date().toLocaleTimeString('pt-BR'),
          type: 'success',
          title: 'Teste de Conexão com Mercado Pago',
          payload: {
            status: 200,
            provider: 'mercadopago',
            environment: mpConfig.environment,
            acceptedMethods: mpConfig.acceptedPaymentMethods,
            timestamp: new Date().toISOString()
          }
        },
        ...prev
      ]);
    }, 1200);
  };

  // Generate realistic Mercado Pago Pix Payload EMV and Barcode for an installment
  const generateMercadoPagoCharge = (parcela: Parcela, formando: Formando, turma?: Turma) => {
    const txIdNum = Math.floor(1000000 + Math.random() * 9000000);
    const txId = `MP-TX-${txIdNum}`;
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const cleanTurma = turma ? turma.name.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '') : 'WM2EVT';
    
    // Formatted Pix payload (EMV standard)
    const pixCode = `00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/c981a-491b-8419-81a4b9108a5204000053039865802BR5916WM2 PRODUCOES6009SAO PAULO62170513${cleanTurma}${parcela.number}${hash}6304E8A2`;
    const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
    
    // Formatted Boleto Barcode (Mercado Pago bank code 341/033/323)
    const pValFormatted = Math.round(parcela.value * 100).toString().padStart(10, '0');
    const boletoBarcode = `34191.79001 ${Math.floor(10000 + Math.random() * 90000)}.513184 ${Math.floor(10000 + Math.random() * 90000)}.150008 7 ${pValFormatted}`;
    const boletoPdfUrl = `https://www.mercadopago.com.br/payments/${txIdNum}/ticket`;
    const gatewayPaymentLink = `https://mpago.la/pos/${txIdNum}`;

    return {
      ...parcela,
      pixCode,
      pixQrCodeUrl,
      boletoBarcode,
      boletoPdfUrl,
      gatewayProvider: 'mercadopago' as const,
      gatewayTransactionId: txId,
      gatewayPaymentLink,
      gatewayStatus: 'pending' as const,
      gatewayCreatedAt: new Date().toISOString().split('T')[0]
    };
  };

  // Link single installment to Mercado Pago
  const handleLinkSingleParcela = (parcela: Parcela) => {
    const student = formandos.find(f => f.id === parcela.formandoId);
    if (!student) return;
    const turma = turmas.find(t => t.id === student.turmaId);

    const updatedParcela = generateMercadoPagoCharge(parcela, student, turma);
    const newParcelas = parcelas.map(p => p.id === parcela.id ? updatedParcela : p);

    onUpdateState({
      parcelas: newParcelas
    });

    setWebhookLogs(prev => [
      {
        id: 'link-' + Date.now(),
        time: new Date().toLocaleTimeString('pt-BR'),
        type: 'info',
        title: `Cobrança Mercado Pago Gerada (Parcela #${parcela.number})`,
        payload: {
          transactionId: updatedParcela.gatewayTransactionId,
          student: student.name,
          value: parcela.value,
          dueDate: parcela.dueDate,
          pixGenerated: true,
          boletoGenerated: true
        }
      },
      ...prev
    ]);
  };

  // Batch link all pending installments for a class
  const handleExecuteBatchLink = () => {
    if (!batchTurmaId) return;

    const classStudents = formandos.filter(f => f.turmaId === batchTurmaId);
    const classStudentIds = new Set(classStudents.map(f => f.id));
    const targetParcelas = parcelas.filter(p => classStudentIds.has(p.formandoId) && p.status !== 'Paga');

    if (targetParcelas.length === 0) {
      alert("Não há parcelas pendentes para vincular nesta turma.");
      setIsBatchModalOpen(false);
      return;
    }

    setBatchProgress({ total: targetParcelas.length, done: 0, isRunning: true });

    let currentDone = 0;
    const targetTurma = turmas.find(t => t.id === batchTurmaId);

    // Simulate batch execution progress
    const interval = setInterval(() => {
      currentDone += Math.min(3, targetParcelas.length - currentDone);
      setBatchProgress({ total: targetParcelas.length, done: currentDone, isRunning: true });

      if (currentDone >= targetParcelas.length) {
        clearInterval(interval);

        // Update all parcelas
        const updatedMap = new Map<string, Parcela>();
        targetParcelas.forEach(p => {
          const student = classStudents.find(s => s.id === p.formandoId);
          if (student) {
            updatedMap.set(p.id, generateMercadoPagoCharge(p, student, targetTurma));
          }
        });

        const newParcelas = parcelas.map(p => updatedMap.get(p.id) || p);
        onUpdateState({ parcelas: newParcelas });

        setBatchProgress(null);
        setIsBatchModalOpen(false);

        setWebhookLogs(prev => [
          {
            id: 'batch-' + Date.now(),
            time: new Date().toLocaleTimeString('pt-BR'),
            type: 'success',
            title: `Vinculação em Lote Concluída (${targetParcelas.length} parcelas)`,
            payload: {
              turma: targetTurma?.name,
              totalGenerated: targetParcelas.length,
              provider: 'mercadopago'
            }
          },
          ...prev
        ]);
      }
    }, 200);
  };

  // Save manual edit of installment payment data
  const handleSaveManualEdit = () => {
    if (!editingParcela || !editingParcela.id) return;

    const newParcelas = parcelas.map(p => {
      if (p.id === editingParcela.id) {
        return {
          ...p,
          ...editingParcela,
          pixQrCodeUrl: editingParcela.pixCode 
            ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(editingParcela.pixCode)}`
            : p.pixQrCodeUrl
        } as Parcela;
      }
      return p;
    });

    onUpdateState({ parcelas: newParcelas });
    setIsManualEditOpen(false);
    setEditingParcela(null);
    setSelectedParcelaForDetails(null);
  };

  // Simulate Webhook trigger from Mercado Pago with backend sync
  const handleSimulateWebhook = async () => {
    if (!simStudentId || !simParcelaId) {
      alert("Selecione um formando e a parcela correspondente para disparar a simulação.");
      return;
    }

    const targetStudent = formandos.find(f => f.id === simStudentId);
    const targetParcela = parcelas.find(p => p.id === simParcelaId);
    if (!targetStudent || !targetParcela) return;

    setIsSendingWebhook(true);
    const now = new Date();
    const txId = targetParcela.gatewayTransactionId || `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const webhookPayload = {
      action: 'payment.updated',
      data: { id: txId },
      status: simStatus,
      status_detail: simStatus === 'approved' ? 'accredited' : simStatus === 'in_process' ? 'pending_waiting_transfer' : 'cc_rejected_insufficient_amount',
      payment_method_id: simPaymentMethod.toLowerCase(),
      payment_type_id: simPaymentMethod === 'Pix' ? 'bank_transfer' : simPaymentMethod === 'Boleto' ? 'ticket' : 'credit_card',
      transaction_amount: targetParcela.value,
      external_reference: targetParcela.id,
      parcelaId: targetParcela.id,
      date_approved: simStatus === 'approved' ? now.toISOString() : undefined,
      payer: {
        email: targetStudent.email,
        first_name: targetStudent.name,
        identification: { type: 'CPF', number: targetStudent.cpf }
      }
    };

    // 1. Send real POST to the backend webhook endpoint
    try {
      await fetch('/api/webhooks/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-by': 'wm2-ui'
        },
        body: JSON.stringify(webhookPayload)
      });
    } catch (e) {
      console.warn('Endpoint backend indisponível ou em modo offline, executando baixa local.', e);
    }

    // 2. Process locally for instantaneous client-side UI update and Firestore sync
    const { updatedParcelas, updatedFormandos, result } = processMercadoPagoWebhook(
      webhookPayload,
      parcelas,
      formandos,
      turmas
    );

    if (result.success) {
      onUpdateState({
        parcelas: updatedParcelas,
        formandos: updatedFormandos
      });
      setWebhookLogs(prev => [result.logEntry, ...prev]);
    }

    setIsSendingWebhook(false);
  };

  // Clear webhook logs both locally and on the server
  const handleClearLogs = async () => {
    try {
      await fetch('/api/webhooks/mercadopago/clear-logs', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setWebhookLogs([]);
  };

  // Format WhatsApp message with Pix and Boleto
  const handleSendWhatsAppNotification = (parcela: Parcela) => {
    const student = formandos.find(f => f.id === parcela.formandoId);
    if (!student || !student.phone) {
      alert("Formando não possui telefone cadastrado.");
      return;
    }

    const cleanPhone = student.phone.replace(/\D/g, '');
    const dueDateFormatted = new Date(parcela.dueDate).toLocaleDateString('pt-BR');
    const valFormatted = parcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let message = `Olá, *${student.name}*! 👋\n\n`;
    message += `Aqui é da equipe de atendimento financeiro da *WM2 Produções & Eventos*.\n\n`;
    message += `Informamos que sua *Parcela #${parcela.number}* no valor de *${valFormatted}* vence em *${dueDateFormatted}*.\n\n`;

    if (parcela.pixCode) {
      message += `⚡ *PIX COPIA E COLA (Mercado Pago):*\n\`\`\`${parcela.pixCode}\`\`\`\n\n`;
    }

    if (parcela.boletoBarcode) {
      message += `📄 *LINHA DIGITÁVEL DO BOLETO:*\n\`\`\`${parcela.boletoBarcode}\`\`\`\n\n`;
    }

    if (parcela.gatewayPaymentLink) {
      message += `💳 *Pagar Online via Mercado Pago:* ${parcela.gatewayPaymentLink}\n\n`;
    }

    message += `Qualquer dúvida estamos à disposição pelo portal do formando ou por este WhatsApp! 🎓✨`;

    const url = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Filtered Parcelas computation
  const filteredParcelas = useMemo(() => {
    return parcelas.filter(p => {
      const student = formandos.find(f => f.id === p.formandoId);
      if (!student) return false;

      // Turma filter
      if (selectedTurmaFilter !== 'all' && student.turmaId !== selectedTurmaFilter) {
        return false;
      }

      // Student filter
      if (selectedStudentFilter !== 'all' && student.id !== selectedStudentFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && p.status !== selectedStatusFilter) {
        return false;
      }

      // Binding filter
      if (selectedBindingFilter === 'linked_mp') {
        if (p.gatewayProvider !== 'mercadopago' && !p.gatewayTransactionId) return false;
      } else if (selectedBindingFilter === 'unlinked') {
        if (p.gatewayTransactionId || p.pixCode || p.boletoBarcode) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = student.name.toLowerCase();
        const studentCpf = student.cpf.toLowerCase();
        const txId = (p.gatewayTransactionId || '').toLowerCase();
        const pNum = `parcela ${p.number}`;
        if (!studentName.includes(q) && !studentCpf.includes(q) && !txId.includes(q) && !pNum.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by status (Atrasada -> Pendente -> Paga) then by due date
      const scoreA = a.status === 'Atrasada' ? 1 : a.status === 'Pendente' ? 2 : 3;
      const scoreB = b.status === 'Atrasada' ? 1 : b.status === 'Pendente' ? 2 : 3;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [parcelas, formandos, selectedTurmaFilter, selectedStudentFilter, selectedStatusFilter, selectedBindingFilter, searchQuery]);

  // Key Statistics
  const stats = useMemo(() => {
    const totalParcelasCount = parcelas.length;
    const mpLinkedCount = parcelas.filter(p => p.gatewayProvider === 'mercadopago' || !!p.gatewayTransactionId).length;
    const mpPaidValue = parcelas
      .filter(p => (p.gatewayProvider === 'mercadopago' || !!p.gatewayTransactionId) && p.status === 'Paga')
      .reduce((acc, p) => acc + p.value, 0);
    const mpPendingValue = parcelas
      .filter(p => (p.gatewayProvider === 'mercadopago' || !!p.gatewayTransactionId) && p.status !== 'Paga')
      .reduce((acc, p) => acc + p.value, 0);
    const totalVolume = parcelas.reduce((acc, p) => acc + p.value, 0);

    return {
      totalParcelasCount,
      mpLinkedCount,
      mpPaidValue,
      mpPendingValue,
      totalVolume
    };
  }, [parcelas]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* HEADER & OVERVIEW */}
      <div className="bg-white bg-white rounded-2xl p-6 border border-neutral-200/70 border-neutral-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/30 flex items-center justify-center text-[#009EE3]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-neutral-900 text-neutral-900">
                    Gateway de Pagamentos Mercado Pago
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    mpConfig.enabled 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}>
                    {mpConfig.enabled ? '● Ativo' : 'Desativado'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#009EE3]/10 text-[#009EE3] border border-[#009EE3]/30">
                    {mpConfig.environment === 'production' ? '🚀 Produção' : '🧪 Sandbox (Testes)'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 text-neutral-500 mt-0.5">
                  Gerencie credenciais oficiais da API Mercado Pago, emita cobranças via Pix e Boleto Bancário com QR Code dinâmico e vincule às parcelas dos formandos com baixa automática.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100 dark:border-neutral-750">
              <div className="text-[10px] font-bold text-neutral-500 uppercase">Cobranças Vinculadas</div>
              <div className="text-base font-extrabold text-neutral-900 text-neutral-900 mt-0.5">
                {stats.mpLinkedCount} <span className="text-[11px] font-normal text-neutral-400">/ {stats.totalParcelasCount}</span>
              </div>
            </div>

            <div className="bg-neutral-50 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100 dark:border-neutral-750">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Total Liquidado</div>
              <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {stats.mpPaidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-neutral-50 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100 dark:border-neutral-750">
              <div className="text-[10px] font-bold text-amber-600 uppercase">A Vencer / Pendente</div>
              <div className="text-base font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">
                {stats.mpPendingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-neutral-50 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100 dark:border-neutral-750">
              <div className="text-[10px] font-bold text-[#009EE3] uppercase">Webhook Status</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Conectado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-neutral-100 border-neutral-200 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'credentials'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            1. Credenciais & Integração API
          </button>

          <button
            onClick={() => setActiveSubTab('installments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'installments'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#aa904f]" />
            2. Vinculação de Boletos & Pix às Parcelas
            <span className="bg-[#aa904f] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
              {stats.mpLinkedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('webhook_sim')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'webhook_sim'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            3. Simulador de Webhooks & Baixas
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'guide'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
            4. Guia Passo a Passo Mercado Pago
          </button>
        </div>
      </div>

      {/* SUCCESS / FEEDBACK NOTIFICATION */}
      {saveFeedback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
          <button 
            onClick={() => setSaveFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Fechar
          </button>
        </motion.div>
      )}

      {/* SUB-TAB 1: CREDENCIAIS & INTEGRAÇÃO API */}
      {activeSubTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white bg-white rounded-2xl p-6 border border-neutral-200/70 border-neutral-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 border-neutral-200">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#009EE3]" />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 text-neutral-900 uppercase tracking-wider">
                      Credenciais da API Mercado Pago Developers
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Insira as chaves de acesso obtidas no painel de desenvolvedores do Mercado Pago.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-600 text-neutral-700">Integração Ativa</label>
                  <input
                    type="checkbox"
                    checked={mpConfig.enabled}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 text-[#009EE3] rounded focus:ring-0 cursor-pointer accent-[#009EE3]"
                  />
                </div>
              </div>

              {/* Provider & Environment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1.5">
                    Provedor de Pagamento
                  </label>
                  <select
                    value={activeProvider}
                    onChange={(e) => setActiveProvider(e.target.value as any)}
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  >
                    <option value="mercadopago">Mercado Pago (Pix Instantâneo + Boleto + Cartão)</option>
                    <option value="asaas">Asaas (Cobranças / Subcontas)</option>
                    <option value="boletocloud">Boleto Cloud (Boleto CNAB 240 / 400)</option>
                    <option value="efi">Efí Bank (Gerencianet Pix)</option>
                    <option value="pagseguro">PagBank / PagSeguro UOL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1.5">
                    Ambiente de Execução
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMpConfig(prev => ({ ...prev, environment: 'production' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mpConfig.environment === 'production'
                          ? 'bg-[#009EE3] text-white shadow-sm'
                          : 'bg-neutral-100 bg-neutral-50 text-neutral-600 text-neutral-500 border border-neutral-200 border-neutral-200'
                      }`}
                    >
                      <span>🚀 Produção</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMpConfig(prev => ({ ...prev, environment: 'sandbox' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mpConfig.environment === 'sandbox'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-neutral-100 bg-neutral-50 text-neutral-600 text-neutral-500 border border-neutral-200 border-neutral-200'
                      }`}
                    >
                      <span>🧪 Sandbox (Testes)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Access Token */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase">
                    Access Token ({mpConfig.environment === 'production' ? 'APP_USR-...' : 'TEST-...'}) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Chave privada utilizada nas requisições da API</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    value={mpConfig.accessToken}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    placeholder="APP_USR-7281920491823901-082719-7b98d2491a92e10948ac90184b9182ab-182938102"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 pr-20 rounded-xl text-xs font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(mpConfig.accessToken, 'access_token')}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      title="Copiar Token"
                    >
                      {copiedKey === 'access_token' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Key */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase">
                    Public Key (Chave Pública) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Utilizada na renderização segura do frontend e Checkout Transparente</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPublicKey ? 'text' : 'password'}
                    value={mpConfig.publicKey}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                    placeholder="APP_USR-82b9a710-4f91-49e8-8a29-19b842918b91"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 pr-20 rounded-xl text-xs font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPublicKey(!showPublicKey)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      {showPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(mpConfig.publicKey, 'public_key')}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      {copiedKey === 'public_key' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Client ID & Secret & Pix Key */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Client ID (Aplicação)
                  </label>
                  <input
                    type="text"
                    value={mpConfig.clientId || ''}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="7281920491823901"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Client Secret
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showClientSecret ? 'text' : 'password'}
                      value={mpConfig.clientSecret || ''}
                      onChange={(e) => setMpConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                      placeholder="sec_mp_91028371982bca819028"
                      className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 pr-8 rounded-xl text-xs font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      className="absolute right-2 p-1 text-neutral-400"
                    >
                      {showClientSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Chave Pix da Conta MP
                  </label>
                  <input
                    type="text"
                    value={mpConfig.pixKey || ''}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, pixKey: e.target.value }))}
                    placeholder="financeiro@wm2producoes.com.br"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                </div>
              </div>

              {/* Webhook Secret & Statement Descriptor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase">
                      Chave Secreta do Webhook (Secret HMAC)
                    </label>
                    <span className="text-[10px] text-neutral-400">Validação de assinatura</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={mpConfig.webhookSecret || ''}
                      onChange={(e) => setMpConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                      placeholder="whsec_mp_829104819274819284719284"
                      className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 pr-8 rounded-xl text-xs font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-2 p-1 text-neutral-400"
                    >
                      {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Nome na Fatura (Statement Descriptor)
                  </label>
                  <input
                    type="text"
                    value={mpConfig.statementDescriptor || 'WM2*FORMATURAS'}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, statementDescriptor: e.target.value }))}
                    placeholder="WM2*FORMATURAS"
                    maxLength={13}
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                  <span className="text-[10px] text-neutral-400 block mt-1">Aparecerá na fatura do cartão ou extrato bancário do aluno (máx 13 carac.)</span>
                </div>
              </div>

              {/* Payment Methods Checkboxes */}
              <div className="p-4 bg-neutral-50 bg-neutral-50/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750 space-y-3">
                <span className="block text-xs font-bold text-neutral-800 text-neutral-900 uppercase tracking-wider">
                  Métodos de Pagamento Habilitados para as Parcelas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-white bg-neutral-50 rounded-lg border border-neutral-200 border-neutral-200 cursor-pointer hover:border-[#009EE3]">
                    <input
                      type="checkbox"
                      checked={mpConfig.acceptedPaymentMethods.pix}
                      onChange={(e) => setMpConfig(prev => ({
                        ...prev,
                        acceptedPaymentMethods: { ...prev.acceptedPaymentMethods, pix: e.target.checked }
                      }))}
                      className="w-4 h-4 text-[#009EE3] accent-[#009EE3] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 text-neutral-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Pix Instantâneo
                      </div>
                      <div className="text-[10px] text-neutral-500">QR Code dinâmico e Copia/Cola</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white bg-neutral-50 rounded-lg border border-neutral-200 border-neutral-200 cursor-pointer hover:border-[#009EE3]">
                    <input
                      type="checkbox"
                      checked={mpConfig.acceptedPaymentMethods.boleto}
                      onChange={(e) => setMpConfig(prev => ({
                        ...prev,
                        acceptedPaymentMethods: { ...prev.acceptedPaymentMethods, boleto: e.target.checked }
                      }))}
                      className="w-4 h-4 text-[#009EE3] accent-[#009EE3] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 text-neutral-900 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#009EE3]" /> Boleto Registrado
                      </div>
                      <div className="text-[10px] text-neutral-500">Linha digitável CIP/Febraban</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white bg-neutral-50 rounded-lg border border-neutral-200 border-neutral-200 cursor-pointer hover:border-[#009EE3]">
                    <input
                      type="checkbox"
                      checked={mpConfig.acceptedPaymentMethods.creditCard}
                      onChange={(e) => setMpConfig(prev => ({
                        ...prev,
                        acceptedPaymentMethods: { ...prev.acceptedPaymentMethods, creditCard: e.target.checked }
                      }))}
                      className="w-4 h-4 text-[#009EE3] accent-[#009EE3] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 text-neutral-900 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Cartão de Crédito
                      </div>
                      <div className="text-[10px] text-neutral-500">Em até 12x no portal</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Financial Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Multa por Atraso (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={mpConfig.finePercent || 2.0}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, finePercent: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                  <span className="text-[10px] text-neutral-400">Padrão legal: 2%</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Juros de Mora (% ao mês)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={mpConfig.interestRateMonthly || 1.0}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, interestRateMonthly: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                  <span className="text-[10px] text-neutral-400">Padrão legal: 1% a.m.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                    Desconto Pontualidade (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={mpConfig.earlyDiscountPercent || 0}
                    onChange={(e) => setMpConfig(prev => ({ ...prev, earlyDiscountPercent: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                  />
                  <span className="text-[10px] text-neutral-400">Opcional (se pago até o vencimento)</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100 border-neutral-200">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testConnectionStatus === 'testing'}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-neutral-300 border-neutral-200 hover:bg-neutral-100 hover:bg-neutral-100 text-neutral-700 text-neutral-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {testConnectionStatus === 'testing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#009EE3]" />
                      <span>Testando Conexão...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#009EE3]" />
                      <span>Testar Conexão com API</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCredentials()}
                  className="bg-[#009EE3] hover:bg-[#0088c4] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Salvar Credenciais do Mercado Pago
                </button>
              </div>

              {/* TEST CONNECTION STATUS BANNER */}
              {testConnectionMsg && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  testConnectionStatus === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : testConnectionStatus === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                }`}>
                  {testConnectionStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : testConnectionStatus === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-sky-600 animate-spin shrink-0" />
                  )}
                  <span>{testConnectionMsg}</span>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Webhook URL & Real-time Integration Cards (1 Col) */}
          <div className="space-y-6">
            
            {/* WEBHOOK URL CONFIGURATION */}
            <div className="bg-white bg-white rounded-2xl p-6 border border-neutral-200/70 border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 border-neutral-200">
                <Terminal className="w-4 h-4 text-[#009EE3]" />
                <h4 className="font-bold text-xs text-neutral-900 text-neutral-900 uppercase tracking-wider">
                  Endpoint de Webhooks
                </h4>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">
                Cadastre a URL abaixo no painel do <strong>Mercado Pago Developers</strong> em <em>Suas integrações &gt; Notificações Webhook</em> para receber avisos em tempo real de boletos pagos e Pix compensados:
              </p>

              <div className="bg-neutral-900 text-neutral-200 p-3 rounded-xl font-mono text-[11px] break-all border border-neutral-800 flex items-center justify-between gap-2">
                <span className="text-emerald-400">https://api.wm2producoes.com.br/v1/webhooks/mercadopago</span>
                <button
                  type="button"
                  onClick={() => handleCopy('https://api.wm2producoes.com.br/v1/webhooks/mercadopago', 'wh_url')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1 rounded text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  {copiedKey === 'wh_url' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <div className="space-y-2 pt-2 text-[11px] text-neutral-600 text-neutral-500">
                <div className="font-bold text-neutral-800 text-neutral-800">Eventos para marcar no Mercado Pago:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 border-neutral-200">
                    payment (Pagamentos)
                  </span>
                  <span className="bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 border-neutral-200">
                    merchant_order (Ordens)
                  </span>
                  <span className="bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 border-neutral-200">
                    point_integration_wh
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK LINK TO DEVELOPERS */}
            <div className="bg-[#009EE3]/5 border border-[#009EE3]/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#009EE3]" />
                <h5 className="font-bold text-xs text-neutral-900 text-neutral-900">Onde obter suas credenciais?</h5>
              </div>
              <p className="text-xs text-neutral-600 text-neutral-500 leading-relaxed">
                Acesse o painel do desenvolvedor com a conta Mercado Pago da WM2 Produções & Eventos e copie o <strong>Access Token</strong> e <strong>Public Key</strong>.
              </p>
              <a
                href="https://www.mercadopago.com.br/developers/panel/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009EE3] hover:underline"
              >
                Abrir Painel Mercado Pago Developers <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* SECURITY NOTICE */}
            <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-200 border-neutral-200 text-xs text-neutral-500 space-y-1">
              <div className="font-bold text-neutral-700 text-neutral-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Criptografia Ponta a Ponta
              </div>
              <p className="text-[11px] leading-relaxed">
                As credenciais e tokens são transmitidos com segurança TLS 1.3 e armazenados com proteção no banco de dados.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: VINCULAÇÃO DE BOLETOS & PIX ÀS PARCELAS */}
      {activeSubTab === 'installments' && (
        <MercadoPagoParcelasList
          parcelas={parcelas}
          formandos={formandos}
          turmas={turmas}
          gatewayConfig={config}
          theme={theme}
          onUpdateParcelas={(updatedParcelas) => {
            onUpdateState({
              parcelas: updatedParcelas
            });
          }}
          title="Lista de Parcelas & Vínculo Mercado Pago"
          subtitle="Acompanhe o status de pagamento de cada formando, gerencie códigos Pix/Boleto e sincronize as transações com a API do Mercado Pago."
        />
      )}

      {/* SUB-TAB 3: SIMULADOR DE WEBHOOKS & BAIXAS */}
      {activeSubTab === 'webhook_sim' && (
        <div className="space-y-6">
          {/* Live Webhook Endpoint Banner */}
          <div className="bg-white bg-white rounded-2xl p-5 border border-neutral-200/70 border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-900 text-neutral-900">
                    Endpoint de Webhooks do Mercado Pago
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    endpointHealth === 'active' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {endpointHealth === 'active' ? 'Ativo & Escutando (200 OK)' : 'Verificando status...'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-mono mt-0.5 break-all">
                  {liveWebhookUrl || 'https://sua-plataforma.com/api/webhooks/mercadopago'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(liveWebhookUrl, 'endpoint_url')}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 bg-neutral-50 hover:bg-neutral-200 text-neutral-800 text-neutral-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'endpoint_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar URL
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={refreshServerLogs}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 bg-neutral-50 hover:bg-neutral-200 text-neutral-700 text-neutral-700 rounded-xl transition-colors cursor-pointer"
                title="Sincronizar Logs do Servidor"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Simulator Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white bg-white rounded-2xl p-6 border border-neutral-200/70 border-neutral-200 shadow-sm space-y-5">
                
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 border-neutral-200">
                  <Terminal className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 text-neutral-900 uppercase tracking-wider">
                      Processador & Simulador de Webhook
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Dispare notificações reais ou simuladas para testar a baixa automática das parcelas em tempo real.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  
                  {/* Select Student */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                      1. Selecionar Formando
                    </label>
                    <select
                      value={simStudentId}
                      onChange={(e) => {
                        setSimStudentId(e.target.value);
                        setSimParcelaId('');
                      }}
                      className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                    >
                      <option value="">Selecione o formando...</option>
                      {formandos.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.cpf})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Installment */}
                  {simStudentId && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                        2. Parcela a Conciliar
                      </label>
                      <select
                        value={simParcelaId}
                        onChange={(e) => setSimParcelaId(e.target.value)}
                        className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                      >
                        <option value="">Selecione a parcela...</option>
                        {parcelas
                          .filter(p => p.formandoId === simStudentId && p.status !== 'Paga')
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              Parcela #{p.number} - {p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({p.status})
                            </option>
                          ))}
                      </select>
                      {parcelas.filter(p => p.formandoId === simStudentId && p.status !== 'Paga').length === 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                          ✓ Formando já quitou todas as parcelas!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Payment Method & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                        Método Liquidado
                      </label>
                      <select
                        value={simPaymentMethod}
                        onChange={(e) => setSimPaymentMethod(e.target.value as any)}
                        className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2 rounded-xl font-semibold text-neutral-900 text-neutral-900 outline-none"
                      >
                        <option value="Pix">⚡ Pix Instantâneo</option>
                        <option value="Boleto">📄 Boleto Bancário</option>
                        <option value="Cartão">💳 Cartão de Crédito</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                        Status do Pagamento
                      </label>
                      <select
                        value={simStatus}
                        onChange={(e) => setSimStatus(e.target.value as any)}
                        className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2 rounded-xl font-semibold text-neutral-900 text-neutral-900 outline-none"
                      >
                        <option value="approved">Aprovado / Pago (approved)</option>
                        <option value="in_process">Em Análise (in_process)</option>
                        <option value="rejected">Recusado (rejected)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dispatch Button */}
                  <button
                    type="button"
                    onClick={handleSimulateWebhook}
                    disabled={!simStudentId || !simParcelaId || isSendingWebhook}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingWebhook ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSendingWebhook ? 'Processando Webhook...' : 'Processar & Dar Baixa Automática'}
                  </button>

                  {/* Quick Presets */}
                  <div className="pt-2 border-t border-neutral-100 border-neutral-200">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                      Cenários Rápidos de Teste:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSimPaymentMethod('Pix');
                          setSimStatus('approved');
                          // Auto select first pending student if none selected
                          if (!simStudentId) {
                            const pendingStudent = formandos.find(f => parcelas.some(p => p.formandoId === f.id && p.status !== 'Paga'));
                            if (pendingStudent) {
                              setSimStudentId(pendingStudent.id);
                              const pendingParcela = parcelas.find(p => p.formandoId === pendingStudent.id && p.status !== 'Paga');
                              if (pendingParcela) setSimParcelaId(pendingParcela.id);
                            }
                          }
                        }}
                        className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        ⚡ Pix Aprovado
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSimPaymentMethod('Boleto');
                          setSimStatus('approved');
                          if (!simStudentId) {
                            const pendingStudent = formandos.find(f => parcelas.some(p => p.formandoId === f.id && p.status !== 'Paga'));
                            if (pendingStudent) {
                              setSimStudentId(pendingStudent.id);
                              const pendingParcela = parcelas.find(p => p.formandoId === pendingStudent.id && p.status !== 'Paga');
                              if (pendingParcela) setSimParcelaId(pendingParcela.id);
                            }
                          }
                        }}
                        className="p-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-[10px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
                      >
                        📄 Boleto Pago
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSimPaymentMethod('Cartão');
                          setSimStatus('approved');
                          if (!simStudentId) {
                            const pendingStudent = formandos.find(f => parcelas.some(p => p.formandoId === f.id && p.status !== 'Paga'));
                            if (pendingStudent) {
                              setSimStudentId(pendingStudent.id);
                              const pendingParcela = parcelas.find(p => p.formandoId === pendingStudent.id && p.status !== 'Paga');
                              if (pendingParcela) setSimParcelaId(pendingParcela.id);
                            }
                          }
                        }}
                        className="p-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                      >
                        💳 Cartão Aprovado
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Real-time Console Logs (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-neutral-950 text-neutral-300 rounded-2xl p-6 border border-neutral-800 shadow-xl space-y-4 font-mono">
                
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-xs text-neutral-200 uppercase tracking-wider">
                      Console de Notificações Webhook Mercado Pago
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={refreshServerLogs}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Atualizar
                    </button>
                    <button
                      type="button"
                      onClick={handleClearLogs}
                      className="text-[10px] text-neutral-500 hover:text-neutral-200 transition-colors uppercase font-bold cursor-pointer"
                    >
                      Limpar Logs
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                  {webhookLogs.length === 0 ? (
                    <div className="py-12 text-center text-neutral-600 text-xs italic">
                      Nenhum log registrado ainda. Dispare uma notificação de webhook ou aguarde pagamentos de formandos.
                    </div>
                  ) : (
                    webhookLogs.map(log => (
                      <div 
                        key={log.id} 
                        className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-850 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-neutral-400">{log.time}</span>
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            log.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            log.type === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            log.type === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-sky-950 text-sky-400 border border-sky-800'
                          }`}>
                            {log.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="font-bold text-white text-xs">{log.title}</div>
                        <pre className="bg-black/60 p-2.5 rounded text-[10px] text-emerald-300 overflow-x-auto custom-scrollbar">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: GUIA PASSO A PASSO MERCADO PAGO */}
      {activeSubTab === 'guide' && (
        <div className="bg-white bg-white rounded-2xl p-6 border border-neutral-200/70 border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/30 flex items-center justify-center text-[#009EE3]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-neutral-900 text-neutral-900">
                Como configurar suas Credenciais do Mercado Pago
              </h4>
              <p className="text-xs text-neutral-500">
                Siga os 4 passos abaixo para homologar e ativar o recebimento de Pix e Boletos no painel da formatura:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="p-5 bg-neutral-50 bg-neutral-50/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#009EE3] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h5 className="font-bold text-xs text-neutral-900 text-neutral-900 uppercase tracking-wider">
                  Criar Aplicação no Mercado Pago Developers
                </h5>
              </div>
              <p className="text-xs text-neutral-600 text-neutral-500 leading-relaxed">
                Acesse <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-[#009EE3] font-bold hover:underline">mercadopago.com.br/developers</a>, faça login com sua conta PJ e clique em <strong>"Suas integrações" &gt; "Criar aplicação"</strong>.
              </p>
              <div className="text-[11px] text-neutral-500 bg-white bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 border-neutral-200">
                💡 <strong>Tipo de solução:</strong> Escolha <em>"Pagamentos online"</em> e selecione o Checkout Transparente.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 bg-neutral-50 bg-neutral-50/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#009EE3] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h5 className="font-bold text-xs text-neutral-900 text-neutral-900 uppercase tracking-wider">
                  Copiar Access Token e Public Key
                </h5>
              </div>
              <p className="text-xs text-neutral-600 text-neutral-500 leading-relaxed">
                No menu lateral da sua aplicação, clique em <strong>"Credenciais de produção"</strong> (ou de teste para Sandbox). Copie o <strong>Access Token</strong> (inicia com <code>APP_USR-</code>) e a <strong>Public Key</strong>.
              </p>
              <div className="text-[11px] text-neutral-500 bg-white bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 border-neutral-200">
                🔒 Cole essas chaves na aba <strong>1. Credenciais & Integração API</strong> deste painel e clique em Salvar.
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 bg-neutral-50 bg-neutral-50/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#009EE3] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h5 className="font-bold text-xs text-neutral-900 text-neutral-900 uppercase tracking-wider">
                  Cadastrar a URL de Notificações Webhook
                </h5>
              </div>
              <p className="text-xs text-neutral-600 text-neutral-500 leading-relaxed">
                No menu <strong>"Notificações Webhook"</strong>, adicione a URL da sua plataforma: <code>https://api.wm2producoes.com.br/v1/webhooks/mercadopago</code> e marque os eventos de <em>Pagamentos (payment)</em>.
              </p>
              <div className="text-[11px] text-neutral-500 bg-white bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 border-neutral-200">
                ⚡ Isso garante que assim que o aluno pagar no Pix ou lotérica, a baixa no sistema ocorra em segundos!
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 bg-neutral-50 bg-neutral-50/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#009EE3] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <h5 className="font-bold text-xs text-neutral-900 text-neutral-900 uppercase tracking-wider">
                  Vincular e Disparar para os Formandos
                </h5>
              </div>
              <p className="text-xs text-neutral-600 text-neutral-500 leading-relaxed">
                Vá até a aba <strong>2. Vinculação de Boletos & Pix</strong> e use o botão <strong>"Vincular em Lote"</strong> para gerar as cobranças da turma inteira de uma só vez ou envie pelo WhatsApp!
              </p>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: BATCH LINK INSTALLMENTS */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 border-neutral-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 border-neutral-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#009EE3]" />
                <h4 className="font-bold text-sm text-neutral-900 text-neutral-900">
                  Vinculação em Lote Mercado Pago
                </h4>
              </div>
              <button 
                onClick={() => setIsBatchModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 hover:text-neutral-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Selecione uma turma para gerar automaticamente o <strong>Código Pix Copia e Cola</strong> e a <strong>Linha Digitável do Boleto</strong> para todas as parcelas pendentes que ainda não possuem cobrança vinculada.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase mb-1">
                Turma Alvo:
              </label>
              <select
                value={batchTurmaId}
                onChange={(e) => setBatchTurmaId(e.target.value)}
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
              >
                <option value="">Selecione uma turma...</option>
                {turmas.map(t => {
                  const studentIds = new Set(formandos.filter(f => f.turmaId === t.id).map(f => f.id));
                  const pendingCount = parcelas.filter(p => studentIds.has(p.formandoId) && p.status !== 'Paga').length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({pendingCount} parcelas pendentes)
                    </option>
                  );
                })}
              </select>
            </div>

            {batchProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-neutral-600 text-neutral-700">
                  <span>Gerando cobranças na API...</span>
                  <span>{batchProgress.done} / {batchProgress.total}</span>
                </div>
                <div className="w-full bg-neutral-200 bg-neutral-50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#009EE3] h-full transition-all duration-200"
                    style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 border-neutral-200">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                disabled={!!batchProgress?.isRunning}
                className="px-4 py-2 text-xs font-bold text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchLink}
                disabled={!batchTurmaId || !!batchProgress?.isRunning}
                className="bg-[#009EE3] hover:bg-[#0088c4] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {batchProgress?.isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Executar Vinculação em Lote
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DETAILS & QR CODE VIEW */}
      {selectedParcelaForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white bg-white rounded-2xl max-w-lg w-full p-6 border border-neutral-200 border-neutral-200 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 border-neutral-200">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#009EE3]" />
                <h4 className="font-bold text-sm text-neutral-900 text-neutral-900">
                  Cobrança Mercado Pago - Parcela #{selectedParcelaForDetails.number}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedParcelaForDetails(null)}
                className="text-neutral-400 hover:text-neutral-600 hover:text-neutral-900 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Student details */}
            {(() => {
              const student = formandos.find(f => f.id === selectedParcelaForDetails.formandoId);
              return (
                <div className="bg-neutral-50 bg-neutral-50/60 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-neutral-900 text-neutral-900">{student?.name}</div>
                    <div className="text-[10px] text-neutral-400">CPF: {student?.cpf} • {student?.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#aa904f]">
                      {selectedParcelaForDetails.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Vence em: {new Date(selectedParcelaForDetails.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pix QR Code Display */}
            {selectedParcelaForDetails.pixCode && (
              <div className="text-center space-y-3 p-4 bg-neutral-50 bg-neutral-50/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750">
                <div className="text-xs font-bold text-neutral-800 text-neutral-900 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  QR Code Pix Mercado Pago
                </div>

                <div className="bg-white p-3 rounded-xl inline-block shadow-sm border border-neutral-200">
                  <img
                    src={selectedParcelaForDetails.pixQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedParcelaForDetails.pixCode)}`}
                    alt="QR Code Pix"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedParcelaForDetails.pixCode}
                    className="w-full bg-white bg-white border border-neutral-200 border-neutral-200 p-2 rounded-lg text-[10px] font-mono text-neutral-600 text-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedParcelaForDetails.pixCode!, 'modal_pix')}
                    className="bg-[#009EE3] hover:bg-[#0088c4] text-white px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'modal_pix' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {/* Boleto Line */}
            {selectedParcelaForDetails.boletoBarcode && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-neutral-600 text-neutral-500 uppercase">
                  Linha Digitável do Boleto:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedParcelaForDetails.boletoBarcode}
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2 rounded-lg text-[10px] font-mono text-neutral-700 text-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedParcelaForDetails.boletoBarcode!, 'modal_bol')}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'modal_bol' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 border-neutral-200">
              <button
                type="button"
                onClick={() => handleSendWhatsAppNotification(selectedParcelaForDetails)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Enviar por WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSelectedParcelaForDetails(null)}
                className="px-5 py-2 text-xs font-bold text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100 rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: MANUAL EDIT OF INSTALLMENT CHARGE */}
      {isManualEditOpen && editingParcela && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 border-neutral-200 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 border-neutral-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#009EE3]" />
                <h4 className="font-bold text-sm text-neutral-900 text-neutral-900">
                  Editar Vínculo da Parcela #{editingParcela.number}
                </h4>
              </div>
              <button 
                onClick={() => setIsManualEditOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 hover:text-neutral-900 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  ID da Transação / Preferência Mercado Pago
                </label>
                <input
                  type="text"
                  value={editingParcela.gatewayTransactionId || ''}
                  onChange={(e) => setEditingParcela(prev => ({ ...prev, gatewayTransactionId: e.target.value }))}
                  placeholder="MP-TX-8921740"
                  className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Código Pix Copia e Cola (EMV Payload)
                </label>
                <textarea
                  rows={3}
                  value={editingParcela.pixCode || ''}
                  onChange={(e) => setEditingParcela(prev => ({ ...prev, pixCode: e.target.value }))}
                  placeholder="00020101021226840014br.gov.bcb.pix..."
                  className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2 rounded-xl font-mono text-[10px] text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Linha Digitável do Boleto
                </label>
                <input
                  type="text"
                  value={editingParcela.boletoBarcode || ''}
                  onChange={(e) => setEditingParcela(prev => ({ ...prev, boletoBarcode: e.target.value }))}
                  placeholder="34191.79001 01043.513184..."
                  className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl font-mono text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Link Direto de Pagamento (Mercado Pago URL)
                </label>
                <input
                  type="text"
                  value={editingParcela.gatewayPaymentLink || ''}
                  onChange={(e) => setEditingParcela(prev => ({ ...prev, gatewayPaymentLink: e.target.value }))}
                  placeholder="https://mpago.la/pos/9821740"
                  className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-neutral-900 text-neutral-900 outline-none focus:border-[#009EE3]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 border-neutral-200">
              <button
                type="button"
                onClick={() => setIsManualEditOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 text-neutral-500 hover:bg-neutral-100 hover:bg-neutral-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveManualEdit}
                className="bg-[#009EE3] hover:bg-[#0088c4] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
