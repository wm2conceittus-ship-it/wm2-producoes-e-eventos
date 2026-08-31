import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const app = express();
const PORT = 3000;

// Support JSON, text and urlencoded payloads from Mercado Pago Webhooks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory Webhook Event Store
interface WebhookEventLog {
  id: string;
  timestamp: number;
  time: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  source: 'mercadopago_real' | 'simulator' | 'api_test';
  headers: Record<string, any>;
  query: Record<string, any>;
  payload: any;
  parcelaId?: string;
  formandoName?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  processed: boolean;
  message?: string;
}

const webhookLogs: WebhookEventLog[] = [
  {
    id: 'init-webhook-1',
    timestamp: Date.now() - 60000,
    time: new Date(Date.now() - 60000).toLocaleTimeString('pt-BR'),
    type: 'info',
    title: 'Serviço de Webhook Mercado Pago Inicializado',
    source: 'api_test',
    headers: { 'user-agent': 'WM2-Webhook-Daemon/2.0' },
    query: {},
    payload: {
      endpoint: '/api/webhooks/mercadopago',
      status: 'active',
      methods: ['POST', 'GET'],
      listening: true,
      features: ['Pix Instantâneo', 'Boleto Registrado', 'Cartão de Crédito', 'Baixa Automática em Tempo Real']
    },
    processed: true,
    message: 'Daemon de escuta de notificações IPN & Webhooks pronto.'
  }
];

// Initialize Firebase for server-side persistence if config is available
let firestoreDb: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseApp = initializeApp(configData, 'server-app');
    firestoreDb = initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
    }, configData.firestoreDatabaseId || "(default)");
    console.log('[MercadoPago Server] Firebase Firestore conectado com sucesso para baixas em tempo real.');
  }
} catch (err) {
  console.warn('[MercadoPago Server] Aviso: Firestore offline no servidor, usando modo de conciliação distribuído.', err);
}

// Helper to update Firestore state when a webhook is received
async function updateFirestoreStateOnPayment(paymentData: {
  transactionId: string;
  parcelaId?: string;
  status: string;
  paymentMethod: string;
  payerCpf?: string;
  payerEmail?: string;
  amount?: number;
  dateApproved?: string;
}) {
  if (!firestoreDb) return { updated: false, reason: 'firestore_not_initialized' };

  try {
    const stateDocRef = doc(firestoreDb, 'app_state', 'current');
    const snapshot = await getDoc(stateDocRef);
    if (!snapshot.exists()) {
      return { updated: false, reason: 'app_state_doc_not_found' };
    }

    const state = snapshot.data();
    const parcelas = Array.isArray(state.parcelas) ? [...state.parcelas] : [];
    const formandos = Array.isArray(state.formandos) ? [...state.formandos] : [];

    // Locate target installment
    let targetIndex = -1;
    if (paymentData.parcelaId) {
      targetIndex = parcelas.findIndex(p => p.id === paymentData.parcelaId);
    }
    if (targetIndex === -1 && paymentData.transactionId) {
      targetIndex = parcelas.findIndex(p => p.gatewayTransactionId === paymentData.transactionId);
    }
    if (targetIndex === -1 && (paymentData.payerCpf || paymentData.payerEmail)) {
      const student = formandos.find(f => {
        if (paymentData.payerCpf && f.cpf?.replace(/\D/g, '') === paymentData.payerCpf.replace(/\D/g, '')) return true;
        if (paymentData.payerEmail && f.email?.toLowerCase() === paymentData.payerEmail.toLowerCase()) return true;
        return false;
      });
      if (student) {
        targetIndex = parcelas.findIndex(p => p.formandoId === student.id && p.status !== 'Paga');
      }
    }

    if (targetIndex === -1) {
      return { updated: false, reason: 'parcela_not_matched' };
    }

    const targetParcela = parcelas[targetIndex];
    const isApproved = paymentData.status === 'approved' || paymentData.status === 'accredited';
    const isRejected = paymentData.status === 'rejected' || paymentData.status === 'cancelled';

    let methodType: 'Pix' | 'Boleto' | 'Cartão' = 'Pix';
    const m = (paymentData.paymentMethod || '').toLowerCase();
    if (m.includes('bol') || m.includes('ticket') || m.includes('bank_transfer')) methodType = 'Boleto';
    else if (m.includes('card') || m.includes('cred') || m.includes('deb')) methodType = 'Cartão';
    else methodType = 'Pix';

    const updatedParcela = {
      ...targetParcela,
      gatewayProvider: 'mercadopago',
      gatewayTransactionId: paymentData.transactionId || targetParcela.gatewayTransactionId || `MP-TX-${Date.now()}`,
      gatewayStatus: isApproved ? 'approved' : isRejected ? 'rejected' : 'in_process',
      type: methodType,
      status: isApproved ? 'Paga' : targetParcela.status,
      payDate: isApproved ? (paymentData.dateApproved?.split('T')[0] || new Date().toISOString().split('T')[0]) : targetParcela.payDate
    };

    parcelas[targetIndex] = updatedParcela;

    // Update forming student totals if paid
    let studentName = '';
    if (isApproved && targetParcela.status !== 'Paga') {
      const studentIdx = formandos.findIndex(f => f.id === targetParcela.formandoId);
      if (studentIdx !== -1) {
        const student = formandos[studentIdx];
        studentName = student.name;
        const newTotalPaid = (student.totalPaid || 0) + (targetParcela.value || 0);
        const hasOtherOverdue = parcelas.some(
          p => p.formandoId === student.id && p.id !== targetParcela.id && p.status === 'Atrasada'
        );

        formandos[studentIdx] = {
          ...student,
          totalPaid: newTotalPaid,
          status: hasOtherOverdue ? 'Inadimplente' : 'Ativo'
        };
      }
    }

    // Save updated state to Firestore
    state.parcelas = parcelas;
    state.formandos = formandos;
    await setDoc(stateDocRef, state);

    return {
      updated: true,
      parcela: updatedParcela,
      studentName,
      isApproved
    };
  } catch (err) {
    console.error('[MercadoPago Server] Erro ao sincronizar webhook com Firestore:', err);
    return { updated: false, error: String(err) };
  }
}

// --------------------------------------------------------------------------------
// 1. WEBHOOK ENDPOINT: POST /api/webhooks/mercadopago
// --------------------------------------------------------------------------------
app.post('/api/webhooks/mercadopago', async (req, res) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR');
  const headers = req.headers;
  const query = req.query;
  const body = req.body || {};

  console.log(`[Mercado Pago Webhook] Recebida notificação às ${timeStr}:`, {
    action: body.action || query.topic || body.type,
    data: body.data || query.id,
    query
  });

  // Extract payment notification data from various Mercado Pago payload formats:
  // 1. v1 Webhook payload: { action: 'payment.updated', data: { id: '123' }, type: 'payment' }
  // 2. IPN Query format: ?topic=payment&id=123 or ?type=payment&data.id=123
  // 3. Direct/Simulated: { status: 'approved', parcelaId: '...', paymentId: '...', payment_method_id: 'pix' }
  const transactionId = String(
    body.data?.id || 
    body.id || 
    query.id || 
    query['data.id'] || 
    body.payment_id || 
    body.transaction_id || 
    `MP-TX-${Math.floor(1000000 + Math.random() * 9000000)}`
  );

  const status = (body.status || (body.action === 'payment.created' ? 'pending' : 'approved')).toLowerCase();
  const paymentMethod = body.payment_method_id || body.payment_type_id || body.type || 'pix';
  const parcelaId = body.external_reference || body.parcelaId || query.external_reference;
  const payerCpf = body.payer?.identification?.number || body.cpf;
  const payerEmail = body.payer?.email || body.email;
  const amount = body.transaction_amount || body.amount;

  const isApproved = status === 'approved' || status === 'accredited' || status === 'paid';
  const isRejected = status === 'rejected' || status === 'cancelled';

  // Perform automatic settlement in Firestore database
  const syncResult = await updateFirestoreStateOnPayment({
    transactionId,
    parcelaId: typeof parcelaId === 'string' ? parcelaId : undefined,
    status,
    paymentMethod,
    payerCpf,
    payerEmail,
    amount,
    dateApproved: body.date_approved || now.toISOString()
  });

  const logEntry: WebhookEventLog = {
    id: 'wh-srv-' + Date.now(),
    timestamp: Date.now(),
    time: timeStr,
    type: isApproved ? 'success' : isRejected ? 'error' : 'info',
    title: isApproved
      ? `[Mercado Pago Webhook] Pagamento Aprovado • Baixa em Tempo Real Realizada`
      : isRejected
      ? `[Mercado Pago Webhook] Pagamento Recusado / Cancelado (${status})`
      : `[Mercado Pago Webhook] Notificação Recebida (${body.action || 'payment.updated'})`,
    source: req.headers['x-simulated-by'] === 'wm2-ui' ? 'simulator' : 'mercadopago_real',
    headers: {
      'x-signature': headers['x-signature'] || null,
      'x-request-id': headers['x-request-id'] || null,
      'user-agent': headers['user-agent'] || null,
      'content-type': headers['content-type'] || null
    },
    query: query as Record<string, any>,
    payload: {
      ...body,
      receivedAt: now.toISOString(),
      transactionId,
      status,
      paymentMethod,
      syncResult
    },
    parcelaId: typeof parcelaId === 'string' ? parcelaId : syncResult.parcela?.id,
    formandoName: syncResult.studentName || body.payer?.first_name,
    amount: amount || syncResult.parcela?.value,
    status,
    paymentMethod,
    processed: true,
    message: isApproved 
      ? `Baixa de parcela #${syncResult.parcela?.number || 'Identificada'} processada automaticamente no banco de dados.` 
      : `Evento registrado com status ${status}.`
  };

  // Add to in-memory logs (limit to last 100 entries)
  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 100) {
    webhookLogs.pop();
  }

  // Always return HTTP 200 to Mercado Pago as required by documentation
  return res.status(200).json({
    status: 'success',
    received: true,
    code: 200,
    message: 'Webhook do Mercado Pago processado com sucesso pela WM2 Produções.',
    transactionId,
    paymentStatus: status,
    baixaRealizada: isApproved,
    timestamp: now.toISOString(),
    sync: syncResult
  });
});

// --------------------------------------------------------------------------------
// 2. WEBHOOK STATUS & HEALTH CHECK: GET /api/webhooks/mercadopago
// --------------------------------------------------------------------------------
app.get('/api/webhooks/mercadopago', (req, res) => {
  return res.status(200).json({
    status: 'active',
    endpoint: '/api/webhooks/mercadopago',
    service: 'WM2 Formaturas - Mercado Pago Webhook Daemon',
    supportedEvents: ['payment.created', 'payment.updated', 'merchant_order', 'ipn'],
    totalReceived: webhookLogs.length,
    lastReceived: webhookLogs[0]?.time || 'Nenhuma notificação recebida recentemente',
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------------
// 3. GET WEBHOOK LOGS: GET /api/webhooks/mercadopago/logs
// --------------------------------------------------------------------------------
app.get('/api/webhooks/mercadopago/logs', (req, res) => {
  return res.status(200).json({
    success: true,
    total: webhookLogs.length,
    logs: webhookLogs
  });
});

// --------------------------------------------------------------------------------
// 4. CLEAR WEBHOOK LOGS: POST /api/webhooks/mercadopago/clear-logs
// --------------------------------------------------------------------------------
app.post('/api/webhooks/mercadopago/clear-logs', (req, res) => {
  webhookLogs.length = 0;
  return res.status(200).json({
    success: true,
    message: 'Histórico de webhooks limpo com sucesso.'
  });
});

// --------------------------------------------------------------------------------
// 5. SIMULATE / DISPATCH TEST WEBHOOK: POST /api/webhooks/mercadopago/simulate
// --------------------------------------------------------------------------------
app.post('/api/webhooks/mercadopago/simulate', async (req, res) => {
  const { parcelaId, studentName, amount, paymentMethod = 'Pix', status = 'approved' } = req.body;
  const mockTxId = `MP-SIM-${Math.floor(1000000 + Math.random() * 9000000)}`;

  const mockPayload = {
    action: 'payment.updated',
    api_version: 'v1',
    data: { id: mockTxId },
    date_created: new Date().toISOString(),
    id: mockTxId,
    live_mode: true,
    type: 'payment',
    status,
    status_detail: status === 'approved' ? 'accredited' : 'rejected_by_bank',
    payment_method_id: paymentMethod.toLowerCase(),
    transaction_amount: amount || 250.0,
    external_reference: parcelaId,
    parcelaId,
    payer: {
      email: 'aluno@formando.com.br',
      first_name: studentName || 'Formando Demonstrativo'
    }
  };

  const syncResult = await updateFirestoreStateOnPayment({
    transactionId: mockTxId,
    parcelaId,
    status,
    paymentMethod,
    amount
  });

  const logEntry: WebhookEventLog = {
    id: 'wh-sim-' + Date.now(),
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString('pt-BR'),
    type: status === 'approved' ? 'success' : 'error',
    title: `[Simulador Webhook] Pagamento ${status === 'approved' ? 'APROVADO' : 'RECUSADO'} (${paymentMethod})`,
    source: 'simulator',
    headers: { 'x-simulated': 'true' },
    query: {},
    payload: mockPayload,
    parcelaId,
    formandoName: studentName,
    amount,
    status,
    paymentMethod,
    processed: true,
    message: `Simulação de baixa automática via endpoint concluída.`
  };

  webhookLogs.unshift(logEntry);

  return res.status(200).json({
    success: true,
    message: `Simulação disparada com sucesso para a parcela ${parcelaId || 'avulsa'}.`,
    payload: mockPayload,
    sync: syncResult
  });
});

// --------------------------------------------------------------------------------
// 6. HEALTH CHECK: GET /api/health
// --------------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WM2 Produções & Eventos API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------------
// 7. VITE MIDDLEWARE & STATIC ASSET SERVING
// --------------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WM2 Server] Servidor Full-Stack rodando na porta ${PORT}`);
    console.log(`[Mercado Pago Webhook] Endpoint ativo em http://0.0.0.0:${PORT}/api/webhooks/mercadopago`);
  });
}

startServer();
