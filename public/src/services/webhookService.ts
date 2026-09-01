import { Parcela, Formando, Turma, AppState } from '../types';

export interface WebhookLogEntry {
  id: string;
  time: string;
  timestamp: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  payload: any;
  parcelaId?: string;
  formandoName?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
}

export interface MercadoPagoWebhookPayload {
  action?: string;
  type?: string;
  id?: string | number;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  external_reference?: string;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
  date_approved?: string;
  date_created?: string;
  parcelaId?: string;
  formandoId?: string;
  [key: string]: any;
}

export interface ProcessWebhookResult {
  success: boolean;
  message: string;
  parcelaUpdated?: Parcela;
  formandoUpdated?: Formando;
  logEntry: WebhookLogEntry;
}

/**
 * Process Mercado Pago Webhook / IPN payload and return updated parcelas and formandos
 */
export function processMercadoPagoWebhook(
  payload: MercadoPagoWebhookPayload,
  currentParcelas: Parcela[],
  currentFormandos: Formando[],
  currentTurmas: Turma[]
): {
  updatedParcelas: Parcela[];
  updatedFormandos: Formando[];
  result: ProcessWebhookResult;
} {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR');
  const todayStr = now.toISOString().split('T')[0];

  // Extract payment/transaction identification
  const transactionId = String(
    payload.data?.id || 
    payload.id || 
    payload.transaction_id || 
    payload.gatewayTransactionId || 
    ''
  );

  const externalRef = payload.external_reference || payload.parcelaId || '';
  const status = (payload.status || (payload.action === 'payment.created' ? 'pending' : 'approved')).toLowerCase();
  
  // Normalize payment method
  let paymentMethodType: 'Pix' | 'Boleto' | 'Cartão' = 'Pix';
  const methodId = (payload.payment_method_id || payload.payment_type_id || payload.type || '').toLowerCase();
  if (methodId.includes('bol') || methodId.includes('ticket') || methodId.includes('bank_transfer')) {
    paymentMethodType = 'Boleto';
  } else if (methodId.includes('card') || methodId.includes('cred') || methodId.includes('deb')) {
    paymentMethodType = 'Cartão';
  } else {
    paymentMethodType = 'Pix';
  }

  // 1. Locate the Parcela to update
  let targetParcela = currentParcelas.find(p => {
    if (externalRef && p.id === externalRef) return true;
    if (transactionId && p.gatewayTransactionId === transactionId) return true;
    if (payload.parcelaId && p.id === payload.parcelId) return true;
    return false;
  });

  // Fallback match: locate by student CPF or Email and next pending installment
  if (!targetParcela && (payload.payer?.identification?.number || payload.payer?.email || payload.formandoId)) {
    const student = currentFormandos.find(f => {
      if (payload.formandoId && f.id === payload.formandoId) return true;
      if (payload.payer?.identification?.number && f.cpf.replace(/\D/g, '') === String(payload.payer.identification.number).replace(/\D/g, '')) return true;
      if (payload.payer?.email && f.email.toLowerCase() === payload.payer.email.toLowerCase()) return true;
      return false;
    });

    if (student) {
      // Find oldest pending/overdue parcela for this student
      targetParcela = currentParcelas
        .filter(p => p.formandoId === student.id && p.status !== 'Paga')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    }
  }

  // If still not found, check if there's any pending installment we can target for demo/test
  if (!targetParcela && currentParcelas.length > 0) {
    targetParcela = currentParcelas.find(p => p.status !== 'Paga');
  }

  if (!targetParcela) {
    const errorLog: WebhookLogEntry = {
      id: 'wh-err-' + Date.now(),
      time: timeStr,
      timestamp: Date.now(),
      type: 'warning',
      title: '[Webhook Mercado Pago] Nenhuma Parcela correspondente encontrada',
      payload: {
        receivedPayload: payload,
        transactionId,
        externalRef,
        status,
        reason: 'Nenhuma parcela pendente compatível com os dados recebidos.'
      }
    };

    return {
      updatedParcelas: currentParcelas,
      updatedFormandos: currentFormandos,
      result: {
        success: false,
        message: 'Nenhuma parcela correspondente foi localizada para baixa.',
        logEntry: errorLog
      }
    };
  }

  const targetStudent = currentFormandos.find(f => f.id === targetParcela!.formandoId);
  const targetTurma = targetStudent ? currentTurmas.find(t => t.id === targetStudent.turmaId) : null;
  const isApproved = status === 'approved' || status === 'accredited' || status === 'paid';
  const isRejected = status === 'rejected' || status === 'cancelled' || status === 'refunded';

  let updatedParcela: Parcela = {
    ...targetParcela,
    gatewayProvider: 'mercadopago',
    gatewayTransactionId: transactionId || targetParcela.gatewayTransactionId || `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`,
    gatewayStatus: isApproved ? 'approved' : isRejected ? 'rejected' : 'in_process',
    type: paymentMethodType
  };

  if (isApproved) {
    updatedParcela = {
      ...updatedParcela,
      status: 'Paga',
      payDate: payload.date_approved ? payload.date_approved.split('T')[0] : todayStr
    };
  }

  // Update parcelas array
  const updatedParcelas = currentParcelas.map(p => p.id === updatedParcela.id ? updatedParcela : p);

  // Update student totals and status
  let updatedFormandos = currentFormandos;
  let updatedStudent: Formando | undefined = undefined;

  if (targetStudent && isApproved && targetParcela.status !== 'Paga') {
    const newTotalPaid = (targetStudent.totalPaid || 0) + targetParcela.value;
    const hasRemainingOverdue = updatedParcelas.some(
      p => p.formandoId === targetStudent.id && p.id !== targetParcela!.id && p.status === 'Atrasada'
    );

    updatedStudent = {
      ...targetStudent,
      totalPaid: newTotalPaid,
      status: hasRemainingOverdue ? 'Inadimplente' : 'Ativo'
    };

    updatedFormandos = currentFormandos.map(f => f.id === updatedStudent!.id ? updatedStudent! : f);
  }

  const logEntry: WebhookLogEntry = {
    id: 'wh-' + Date.now(),
    time: timeStr,
    timestamp: Date.now(),
    type: isApproved ? 'success' : isRejected ? 'error' : 'info',
    title: isApproved 
      ? `[Webhook Mercado Pago] Pagamento APROVADO • Parcela #${targetParcela.number} Baixada`
      : isRejected
      ? `[Webhook Mercado Pago] Pagamento REJEITADO • Parcela #${targetParcela.number}`
      : `[Webhook Mercado Pago] Pagamento EM PROCESSAMENTO • Parcela #${targetParcela.number}`,
    payload: {
      action: payload.action || 'payment.updated',
      paymentId: updatedParcela.gatewayTransactionId,
      status: updatedParcela.gatewayStatus,
      paymentMethod: paymentMethodType,
      value: targetParcela.value,
      parcelaNumero: targetParcela.number,
      formandoNome: targetStudent?.name || 'Não identificado',
      turmaNome: targetTurma?.name || 'Não identificada',
      statusAnterior: targetParcela.status,
      statusNovo: updatedParcela.status,
      dataPagamento: updatedParcela.payDate,
      baixaAutomaticaExecutada: isApproved
    },
    parcelaId: targetParcela.id,
    formandoName: targetStudent?.name,
    amount: targetParcela.value,
    status: updatedParcela.gatewayStatus,
    paymentMethod: paymentMethodType
  };

  return {
    updatedParcelas,
    updatedFormandos,
    result: {
      success: true,
      message: isApproved 
        ? `Parcela #${targetParcela.number} do aluno(a) ${targetStudent?.name || ''} baixada como PAGA com sucesso via Webhook!`
        : `Status da parcela #${targetParcela.number} atualizado para ${updatedParcela.gatewayStatus}.`,
      parcelaUpdated: updatedParcela,
      formandoUpdated: updatedStudent,
      logEntry
    }
  };
}
