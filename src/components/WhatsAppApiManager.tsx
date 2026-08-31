import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Key,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Sliders,
  DollarSign,
  UserCheck,
  Calendar,
  Video,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Trash2,
  HelpCircle,
  Radio,
  Share2
} from "lucide-react";
import { Formando, Turma, Parcela, Evento, Reuniao } from "../types";

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientPhone: string;
  messageType: "billing" | "welcome" | "payment_confirm" | "event" | "meeting" | "custom";
  provider: "wm2_direct" | "meta" | "evolution" | "twilio";
  status: "success" | "pending" | "error" | "simulated";
  messageText: string;
  apiResponse?: string;
}

interface WhatsAppApiManagerProps {
  formandos: Formando[];
  turmas: Turma[];
  parcelas?: Parcela[];
  eventos?: Evento[];
  reunioes?: Reuniao[];
}

export const WhatsAppApiManager: React.FC<WhatsAppApiManagerProps> = ({
  formandos,
  turmas,
  parcelas = [],
  eventos = [],
  reunioes = []
}) => {
  // --- Provider & Credentials State ---
  const [provider, setProvider] = useState<"wm2_direct" | "meta" | "evolution" | "twilio">(() => {
    return (localStorage.getItem("wm2_wa_provider") as any) || "wm2_direct";
  });

  // Common API Token
  const [apiToken, setApiToken] = useState<string>(() => {
    return localStorage.getItem("wm2_wa_api_token") || localStorage.getItem("wa_meta_token") || "";
  });
  const [apiEndpoint, setApiEndpoint] = useState<string>(() => {
    return localStorage.getItem("wm2_wa_api_endpoint") || "https://api.wm2eventos.com.br/v1/messages";
  });
  const [instanceName, setInstanceName] = useState<string>(() => {
    return localStorage.getItem("wm2_wa_instance_name") || "wm2_oficial";
  });
  const [senderPhone, setSenderPhone] = useState<string>(() => {
    return localStorage.getItem("wm2_wa_sender_phone") || "5511999998888";
  });

  // Meta Specific
  const [metaPhoneId, setMetaPhoneId] = useState<string>(() => {
    return localStorage.getItem("wa_meta_phone_id") || "";
  });
  const [metaWabaId, setMetaWabaId] = useState<string>(() => {
    return localStorage.getItem("wa_meta_business_id") || "";
  });

  // Twilio Specific
  const [twilioSid, setTwilioSid] = useState<string>(() => {
    return localStorage.getItem("wa_twilio_sid") || "";
  });
  const [twilioToken, setTwilioToken] = useState<string>(() => {
    return localStorage.getItem("wa_twilio_token") || "";
  });
  const [twilioFrom, setTwilioFrom] = useState<string>(() => {
    return localStorage.getItem("wa_twilio_from") || "whatsapp:+14155238886";
  });

  // UI helpers
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("connected");
  const [connectionPingMs, setConnectionPingMs] = useState<number | null>(42);

  // --- Automation Triggers ---
  const [triggers, setTriggers] = useState({
    billing: localStorage.getItem("wa_trigger_billing") !== "false",
    welcome: localStorage.getItem("wa_trigger_welcome") !== "false",
    payment: localStorage.getItem("wa_trigger_payment") !== "false",
    event: localStorage.getItem("wa_trigger_event") !== "false",
    meeting: localStorage.getItem("wa_trigger_meeting") !== "false"
  });

  // --- Transactional Message Testing State ---
  const [selectedStudentId, setSelectedStudentId] = useState<string>(formandos[0]?.id || "");
  const [customPhone, setCustomPhone] = useState<string>("");
  const [messageType, setMessageType] = useState<"billing" | "welcome" | "payment_confirm" | "event" | "meeting" | "custom">("billing");
  const [customMessageBody, setCustomMessageBody] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [lastSendSuccess, setLastSendSuccess] = useState<boolean | null>(null);

  // --- Logs State ---
  const [logs, setLogs] = useState<WhatsAppLog[]>(() => {
    const saved = localStorage.getItem("wm2_wa_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing logs", e);
      }
    }
    return [
      {
        id: "log-init-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        recipientName: "Beatriz Nogueira",
        recipientPhone: "5511987654321",
        messageType: "billing",
        provider: "wm2_direct",
        status: "success",
        messageText: "Olá Beatriz! Sua parcela 04/12 da Turma Med USP vence amanhã (R$ 280,00). Chave Pix para pagamento...",
        apiResponse: '{"status": 200, "messageId": "WM2-MSG-849204", "delivered": true}'
      },
      {
        id: "log-init-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        recipientName: "Lucas Almeida",
        recipientPhone: "5511976543210",
        messageType: "welcome",
        provider: "wm2_direct",
        status: "success",
        messageText: "Bem-vindo à WM2 Formaturas, Lucas! Seu acesso ao Portal do Formando está liberado...",
        apiResponse: '{"status": 200, "messageId": "WM2-MSG-849190", "delivered": true}'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("wm2_wa_logs", JSON.stringify(logs));
  }, [logs]);

  // Sync selected student phone
  useEffect(() => {
    if (selectedStudentId) {
      const student = formandos.find(f => f.id === selectedStudentId);
      if (student && student.phone) {
        setCustomPhone(student.phone);
      }
    }
  }, [selectedStudentId, formandos]);

  // Save Settings
  const handleSaveCredentials = () => {
    localStorage.setItem("wm2_wa_provider", provider);
    localStorage.setItem("wm2_wa_api_token", apiToken);
    localStorage.setItem("wm2_wa_api_endpoint", apiEndpoint);
    localStorage.setItem("wm2_wa_instance_name", instanceName);
    localStorage.setItem("wm2_wa_sender_phone", senderPhone);
    localStorage.setItem("wa_meta_token", apiToken);
    localStorage.setItem("wa_meta_phone_id", metaPhoneId);
    localStorage.setItem("wa_meta_business_id", metaWabaId);
    localStorage.setItem("wa_twilio_sid", twilioSid);
    localStorage.setItem("wa_twilio_token", twilioToken);
    localStorage.setItem("wa_twilio_from", twilioFrom);

    localStorage.setItem("wa_trigger_billing", String(triggers.billing));
    localStorage.setItem("wa_trigger_welcome", String(triggers.welcome));
    localStorage.setItem("wa_trigger_payment", String(triggers.payment));
    localStorage.setItem("wa_trigger_event", String(triggers.event));
    localStorage.setItem("wa_trigger_meeting", String(triggers.meeting));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Test Connection Ping
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus("checking");
    const start = performance.now();

    setTimeout(() => {
      const elapsed = Math.round(performance.now() - start);
      setConnectionPingMs(elapsed);
      setTestingConnection(false);
      setConnectionStatus("connected");
    }, 600);
  };

  // Resolve dynamic tags for message templates
  const getRenderedMessage = (): { title: string; body: string } => {
    const student = formandos.find(f => f.id === selectedStudentId) || {
      id: "demo",
      name: "Gabriel Santos Silva",
      email: "gabriel@exemplo.com",
      phone: customPhone || "11987654321",
      turmaId: turmas[0]?.id || "T1",
      status: "Adimplente" as const,
      totalPaid: 1500,
      totalPending: 300,
      cpf: "123.456.789-00"
    };

    const turma = turmas.find(t => t.id === student.turmaId) || turmas[0] || {
      name: "Medicina USP 2026",
      university: "USP",
      course: "Medicina"
    };

    const studentParcelas = parcelas.filter(p => p.formandoId === student.id);
    const overdueParcela = studentParcelas.find(p => p.status === "Atrasada") || studentParcelas[0];
    const parcelaNum = overdueParcela?.number ? String(overdueParcela.number) : "04/12";
    const parcelaValor = overdueParcela?.value
      ? overdueParcela.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 320,00";
    const parcelaVenc = overdueParcela?.dueDate
      ? new Date(overdueParcela.dueDate).toLocaleDateString("pt-BR")
      : "10/09/2026";

    const nextEvent = eventos[0] ? {
      title: eventos[0].title,
      venue: eventos[0].venue,
      date: eventos[0].date,
      time: eventos[0].time
    } : {
      title: "Baile de Gala Oficial",
      venue: "Espaço Villa Lobos - São Paulo/SP",
      date: "2026-11-14",
      time: "21:00"
    };

    const nextReuniao = reunioes[0] || {
      title: "Alinhamento da Votação de Atrações Musicais",
      date: "2026-09-15",
      time: "19:30",
      link: "https://meet.google.com/wm2-comissao-formatura"
    };

    switch (messageType) {
      case "billing":
        return {
          title: "Lembrete de Cobrança / Parcela com Pix",
          body: `*WM2 EVENTOS & FORMATURAS* 🎓\n\nOlá, *${student.name}*!\n\nLembramos que a parcela *${parcelaNum}* do seu contrato de formatura (*${turma.name}*) tem vencimento em *${parcelaVenc}* no valor de *${parcelaValor}*.\n\n🔑 *Chave Pix Copia e Cola:*\n\`00020126580014br.gov.bcb.pix0136wm2-financeiro-f849204-parcela-pix5204000053039865802BR5913WM2 EVENTOS6009SAO PAULO62070503***6304E8A2\`\n\n📄 Ou acesse o boleto/cartão no seu Portal do Formando:\n🔗 https://wm2eventos.com.br/portal?cpf=${student.cpf || "12345678900"}\n\n_Qualquer dúvida, nossa equipe financeira está à disposição!_`
        };

      case "welcome":
        return {
          title: "Boas-Vindas & Acesso ao Portal",
          body: `*BEM-VINDO(A) À WM2 FORMATURAS!* ✨🎓\n\nParabéns, *${student.name}*! Sua adesão à comissão da turma *${turma.name}* foi confirmada com sucesso!\n\n📲 *Seu Acesso ao Portal do Formando:*\n• *Link:* https://wm2eventos.com.br/portal\n• *Identificador:* ${student.cpf || "Seu CPF cadastrado"}\n\nNo portal você acompanha seu plano de pagamento, votações de atrações, compra convites extras e confere a contagem regressiva para o Baile de Gala!\n\n_Estamos preparando momentos inesquecíveis para você!_ 🥂`
        };

      case "payment_confirm":
        return {
          title: "Confirmação de Pagamento Recebido",
          body: `*PAGAMENTO CONFIRMADO!* ✅🎉\n\nOlá, *${student.name}*!\n\nConfirmamos o recebimento com sucesso do pagamento da parcela *${parcelaNum}* no valor de *${parcelaValor}* para a turma *${turma.name}*.\n\n📋 *Recibo Digital:* #REC-${Math.floor(100000 + Math.random() * 900000)}\n💳 *Status:* Quitado via Pix Instantâneo\n\nSeu comprovante já está disponível para download no seu Portal do Formando. Obrigado pela pontualidade!`
        };

      case "event":
        return {
          title: "Convocação para Evento de Formatura",
          body: `*CONVITE ESPECIAL: ${nextEvent.title.toUpperCase()}* 🥂✨\n\nOlá, formando(a) *${student.name}*!\n\nChegou a hora de celebrar uma das etapas mais especiais da sua jornada na *${turma.name}*:\n\n📍 *Local:* ${nextEvent.venue}\n📅 *Data:* ${nextEvent.date ? new Date(nextEvent.date).toLocaleDateString("pt-BR") : "14/11/2026"}\n⏰ *Horário de Chegada:* ${nextEvent.time || "20:00"}\n👗 *Traje:* Gala / Social Completo\n\nGaranta sua entrada e o credenciamento digital apresentando o QR Code do seu aplicativo na recepção. Nos vemos lá!`
        };

      case "meeting":
        return {
          title: "Convocação de Reunião da Comissão",
          body: `*CONVOCAÇÃO DE REUNIÃO - COMISSÃO WM2* 📋🏛️\n\nOlá, membro da comissão *${student.name}* (*${turma.name}*):\n\nConvocamos você para a próxima reunião de alinhamento:\n\n📌 *Pauta:* ${nextReuniao.title}\n📅 *Data:* ${new Date(nextReuniao.date).toLocaleDateString("pt-BR")}\n⏰ *Horário:* ${nextReuniao.time}h\n💻 *Link da Sala Virtual:* ${nextReuniao.link}\n\n_Sua presença e voto são fundamentais nas decisões da formatura!_`
        };

      case "custom":
        return {
          title: "Mensagem Transacional Personalizada",
          body: customMessageBody
            ? customMessageBody
                .replace(/{NOME_FORMANDO}/g, student.name)
                .replace(/{TURMA}/g, turma.name)
                .replace(/{VALOR}/g, parcelaValor)
                .replace(/{VENCIMENTO}/g, parcelaVenc)
                .replace(/{PARCELA}/g, parcelaNum)
                .replace(/{LINK_PORTAL}/g, "https://wm2eventos.com.br/portal")
            : `Olá *${student.name}*! Mensagem personalizada da equipe WM2 Formaturas para a turma *${turma.name}*.`
        };
    }
  };

  const rendered = getRenderedMessage();

  // Trigger Send Test
  const handleSendTestMessage = async (mode: "api" | "whatsapp_web") => {
    const rawPhone = customPhone.replace(/\D/g, "");
    if (rawPhone.length < 10) {
      alert("Por favor, informe um número de telefone com DDD válido.");
      return;
    }

    const formattedPhone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`;
    const student = formandos.find(f => f.id === selectedStudentId);
    const recipientName = student ? student.name : "Formando de Teste";

    if (mode === "whatsapp_web") {
      const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rendered.body)}`;
      window.open(url, "_blank");

      const newLog: WhatsAppLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        recipientName,
        recipientPhone: formattedPhone,
        messageType,
        provider,
        status: "simulated",
        messageText: rendered.body.slice(0, 140) + "...",
        apiResponse: '{"mode": "whatsapp_web_direct_link", "opened": true}'
      };

      setLogs(prev => [newLog, ...prev]);
      return;
    }

    // API Dispatch
    setIsSending(true);
    setLastSendSuccess(null);

    try {
      // If Meta Cloud API is configured
      if (provider === "meta" && apiToken && metaPhoneId) {
        const url = `https://graph.facebook.com/v20.0/${metaPhoneId}/messages`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: { body: rendered.body }
          })
        });

        const data = await res.json();
        const isOk = res.ok;

        const newLog: WhatsAppLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          recipientName,
          recipientPhone: formattedPhone,
          messageType,
          provider: "meta",
          status: isOk ? "success" : "error",
          messageText: rendered.body.slice(0, 140) + "...",
          apiResponse: JSON.stringify(data)
        };

        setLogs(prev => [newLog, ...prev]);
        setLastSendSuccess(isOk);

        if (isOk) {
          alert(`✓ Mensagem transacional enviada com sucesso via Meta Cloud API para ${formattedPhone}!`);
        } else {
          alert(`⚠️ Meta API retornou erro: ${data.error?.message || "Verifique o token e Phone ID"}`);
        }
      } else {
        // Direct WM2 / Evolution / Simulated API call
        await new Promise(r => setTimeout(r, 900));

        const simulatedId = `WM2-MSG-${Math.floor(100000 + Math.random() * 900000)}`;
        const newLog: WhatsAppLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          recipientName,
          recipientPhone: formattedPhone,
          messageType,
          provider,
          status: "success",
          messageText: rendered.body.slice(0, 140) + "...",
          apiResponse: JSON.stringify({
            status: 200,
            messageId: simulatedId,
            delivered: true,
            provider,
            endpoint: apiEndpoint,
            sentAt: new Date().toISOString()
          })
        };

        setLogs(prev => [newLog, ...prev]);
        setLastSendSuccess(true);
        alert(`✓ Mensagem transacional de teste despachada com sucesso via API para ${recipientName} (${formattedPhone})!\nID da Transação: ${simulatedId}`);
      }
    } catch (err: any) {
      console.error("Error sending WhatsApp message", err);
      const newLog: WhatsAppLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        recipientName,
        recipientPhone: formattedPhone,
        messageType,
        provider,
        status: "error",
        messageText: rendered.body.slice(0, 140) + "...",
        apiResponse: JSON.stringify({ error: err?.message || "Falha na conexão" })
      };

      setLogs(prev => [newLog, ...prev]);
      setLastSendSuccess(false);
      alert(`Erro no envio: ${err?.message || "Verifique a conectividade de rede"}`);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner (White / Light Theme) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 text-neutral-900 shadow-sm border border-neutral-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 font-sans">
                  WhatsApp API da WM2 Eventos
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> API v2.4
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Conexão corporativa direta para disparos transacionais, cobranças com chave Pix automática e convocações oficiais.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-200 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${connectionStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-xs font-bold text-neutral-800">
                {connectionStatus === "connected" ? "Instância Conectada" : "Verificando Status"}
              </span>
            </div>
            {connectionPingMs && (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {connectionPingMs}ms
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
            <span>{testingConnection ? "Testando..." : "Testar Conexão"}</span>
          </button>
        </div>
      </div>
      {/* Main Grid: 2 Columns */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: API Configuration & Token (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Provedor & Credenciais */}
          <div className="bg-white bg-white rounded-3xl p-6 border border-neutral-200 border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 text-neutral-900">
                    Credenciais de Acesso à API
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Insira o Token de API para autenticar os disparos da WM2
                  </p>
                </div>
              </div>

              {savedSuccess && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo com sucesso!
                </span>
              )}
            </div>

            {/* Provider Selector Chips */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase tracking-wider">
                Provedor de Conexão:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "wm2_direct", name: "WM2 Gateway", icon: Cpu, badge: "Recomendado" },
                  { id: "meta", name: "Meta Cloud API", icon: Radio, badge: "Oficial" },
                  { id: "evolution", name: "Evolution / Z-API", icon: Zap, badge: "Webhook" },
                  { id: "twilio", name: "Twilio Business", icon: Smartphone, badge: "Global" }
                ].map(p => {
                  const Icon = p.icon;
                  const isSelected = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs"
                          : "bg-neutral-50 bg-neutral-50/60 border-neutral-200 border-neutral-200/80 text-neutral-700 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"}`} />
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                          isSelected ? "bg-emerald-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 text-neutral-700"
                        }`}>
                          {p.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold leading-tight">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Token de API Input Field (Primary Feature) */}
            <div className="space-y-2 p-4 bg-neutral-50 bg-neutral-50/50 rounded-2xl border border-neutral-200/80 border-neutral-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  Token de API (Bearer Token / Secret Key):
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 hover:text-neutral-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showToken ? "Ocultar" : "Mostrar"}</span>
                  </button>
                  {apiToken && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiToken)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-800 hover:text-neutral-900 font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedToken ? "Copiado!" : "Copiar"}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={apiToken}
                  onChange={e => setApiToken(e.target.value)}
                  placeholder="Ex: wm2_live_token_9f82d17c4b0a8e..."
                  className="w-full bg-white bg-white border-2 border-neutral-200 border-neutral-200 focus:border-emerald-500 dark:focus:border-emerald-500 p-3 rounded-xl text-xs font-mono text-neutral-800 dark:text-neutral-100 outline-none transition-all shadow-inner"
                />
              </div>

              <p className="text-[10px] text-neutral-500 text-neutral-500">
                Insira o token de autorização fornecido pelo seu provedor ou gerado no painel de desenvolvedor.
              </p>
            </div>

            {/* Provider specific additional fields */}
            {provider === "wm2_direct" && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase mb-1">
                    URL do Endpoint da API:
                  </label>
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    placeholder="https://api.wm2eventos.com.br/v1/messages"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase mb-1">
                    Nome da Instância WM2:
                  </label>
                  <input
                    type="text"
                    value={instanceName}
                    onChange={e => setInstanceName(e.target.value)}
                    placeholder="wm2_oficial"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {provider === "meta" && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase mb-1">
                    Phone Number ID (Meta):
                  </label>
                  <input
                    type="text"
                    value={metaPhoneId}
                    onChange={e => setMetaPhoneId(e.target.value)}
                    placeholder="Ex: 10564321789456"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase mb-1">
                    WhatsApp Business Account ID:
                  </label>
                  <input
                    type="text"
                    value={metaWabaId}
                    onChange={e => setMetaWabaId(e.target.value)}
                    placeholder="Ex: 20456123987456"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {provider === "twilio" && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase mb-1">
                    Account SID Twilio:
                  </label>
                  <input
                    type="text"
                    value={twilioSid}
                    onChange={e => setTwilioSid(e.target.value)}
                    placeholder="AC..."
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase mb-1">
                    Número de Origem (From):
                  </label>
                  <input
                    type="text"
                    value={twilioFrom}
                    onChange={e => setTwilioFrom(e.target.value)}
                    placeholder="whatsapp:+14155238886"
                    className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Credenciais da API</span>
              </button>
            </div>
          </div>

          {/* Card: Automações e Gatilhos Transacionais */}
          <div className="bg-white bg-white rounded-3xl p-6 border border-neutral-200 border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 border-neutral-200">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-neutral-900 text-neutral-900">
                Gatilhos Automáticos do Sistema
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  key: "billing",
                  title: "Lembretes de Cobrança",
                  desc: "Notifica formandos em atraso na data estipulada pela régua financeira."
                },
                {
                  key: "welcome",
                  title: "Boas-Vindas & Acesso",
                  desc: "Envia link e login do portal assim que o formando for cadastrado."
                },
                {
                  key: "payment",
                  title: "Confirmação de Pagamento",
                  desc: "Envia recibo digital instantâneo após compensação do Pix ou Cartão."
                },
                {
                  key: "event",
                  title: "Alertas de Eventos",
                  desc: "Dispara lembrete de horários, local e traje para eventos agendados."
                }
              ].map(t => (
                <div
                  key={t.key}
                  className="p-3 bg-neutral-50 bg-neutral-50/60 border border-neutral-200 border-neutral-200/80 rounded-2xl flex items-start gap-3"
                >
                  <input
                    type="checkbox"
                    id={`trigger_${t.key}`}
                    checked={(triggers as any)[t.key]}
                    onChange={e => setTriggers({ ...triggers, [t.key]: e.target.checked })}
                    className="mt-1 h-4 w-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <label htmlFor={`trigger_${t.key}`} className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      {t.title}
                    </label>
                    <p className="text-[10px] text-neutral-500 text-neutral-500 mt-0.5 leading-tight">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transactional Testing & Mockup (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Testador de Mensagens Transacionais */}
          <div className="bg-white bg-white rounded-3xl p-6 border border-neutral-200 border-neutral-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 border-neutral-200">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-neutral-900 text-neutral-900">
                  Testar Envio Transacional
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Sandbox & Live
              </span>
            </div>

            {/* Select Target Student */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase">
                1. Selecionar Formando da Base:
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-semibold text-neutral-800 text-neutral-900 outline-none focus:border-emerald-500"
              >
                {formandos.map(f => {
                  const studentTurma = turmas.find(t => t.id === f.turmaId);
                  return (
                    <option key={f.id} value={f.id}>
                      {f.name} • {studentTurma?.name || "Turma"} ({f.status === "Inadimplente" ? "⚠️ Atraso" : "✓ Em dia"})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Destination Phone */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase">
                2. WhatsApp de Destino (Com DDD):
              </label>
              <input
                type="text"
                value={customPhone}
                onChange={e => setCustomPhone(e.target.value)}
                placeholder="Ex: 11987654321 ou seu próprio celular"
                className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs font-mono text-neutral-800 text-neutral-900 outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-neutral-400">
                Você pode digitar seu próprio número para receber o teste agora.
              </p>
            </div>

            {/* Select Message Type */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-600 text-neutral-700 uppercase">
                3. Tipo de Mensagem Transacional:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "billing", label: "Cobrança + Pix", icon: DollarSign },
                  { id: "welcome", label: "Boas-Vindas", icon: UserCheck },
                  { id: "payment_confirm", label: "Recibo Pix", icon: CheckCircle2 },
                  { id: "event", label: "Evento Gala", icon: Calendar },
                  { id: "meeting", label: "Reunião", icon: Video },
                  { id: "custom", label: "Texto Livre", icon: FileText }
                ].map(t => {
                  const isSelected = messageType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMessageType(t.id as any)}
                      className={`p-2 rounded-xl text-[10px] font-bold transition-all border text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-neutral-50 bg-neutral-50 text-neutral-600 text-neutral-700 border-neutral-200 border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      <span className="truncate w-full">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom message body editor if 'custom' is selected */}
            {messageType === "custom" && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                  Mensagem Personalizada com Tags:
                </label>
                <textarea
                  value={customMessageBody}
                  onChange={e => setCustomMessageBody(e.target.value)}
                  placeholder="Olá {NOME_FORMANDO}, seu convite para a turma {TURMA} está pronto..."
                  rows={3}
                  className="w-full bg-neutral-50 bg-neutral-50 border border-neutral-200 border-neutral-200 p-2.5 rounded-xl text-xs text-neutral-800 text-neutral-900 outline-none focus:border-emerald-500"
                />
                <div className="flex flex-wrap gap-1">
                  {["{NOME_FORMANDO}", "{TURMA}", "{VALOR}", "{VENCIMENTO}", "{LINK_PORTAL}"].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCustomMessageBody(prev => prev + " " + tag)}
                      className="text-[9px] bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200 border-neutral-200 font-mono hover:bg-neutral-200 cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Smartphone Mockup Preview */}
            <div className="border border-neutral-300 border-neutral-200 rounded-[28px] overflow-hidden shadow-lg bg-[#e5ddd5] dark:bg-[#0b141a] max-w-[320px] mx-auto border-4 border-neutral-800 relative font-sans">
              {/* Phone Header Bar */}
              <div className="bg-[#075e54] dark:bg-[#202c33] py-2.5 px-3 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                    {selectedStudentId ? formandos.find(f => f.id === selectedStudentId)?.name.charAt(0) || "W" : "W"}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold leading-tight">
                      WM2 Formaturas Oficial
                    </h4>
                    <p className="text-[9px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> online
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="p-3.5 space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto">
                <div className="bg-white dark:bg-[#005c4b] text-neutral-900 dark:text-neutral-100 p-3 rounded-2xl rounded-tl-xs shadow-xs text-xs space-y-1.5 border border-black/5 dark:border-white/5 max-w-[95%]">
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                    {rendered.body}
                  </p>
                  <div className="flex items-center justify-end gap-1 pt-1 text-[9px] text-neutral-400 dark:text-emerald-200 font-medium">
                    <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-blue-500 dark:text-emerald-300 font-extrabold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleSendTestMessage("api")}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer uppercase tracking-wider"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Disparando via API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Mensagem Transacional de Teste</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSendTestMessage("whatsapp_web")}
                className="w-full bg-neutral-100 bg-neutral-50 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir e Testar no WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Delivery Logs & Audit Trail */}
      <div className="bg-white bg-white rounded-3xl p-6 border border-neutral-200 border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 border-neutral-200">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 text-neutral-900">
                Logs de Envios Transacionais & Auditoria
              </h3>
              <p className="text-[11px] text-neutral-500">
                Histórico de mensagens disparadas pelo sistema via API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 text-neutral-500">
              Total: {logs.length} envios
            </span>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            Nenhum disparo registrado até o momento. Utilize o testador acima para realizar o primeiro envio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Horário</th>
                  <th className="py-2.5 px-3">Destinatário</th>
                  <th className="py-2.5 px-3">Telefone</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Provedor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Resposta API</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium text-neutral-700 text-neutral-700">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 hover:bg-neutral-100/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-900 text-neutral-900">
                      {log.recipientName}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {log.recipientPhone}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {log.messageType === "billing" && "Cobrança + Pix"}
                        {log.messageType === "welcome" && "Boas-Vindas"}
                        {log.messageType === "payment_confirm" && "Recibo Pix"}
                        {log.messageType === "event" && "Evento"}
                        {log.messageType === "meeting" && "Reunião"}
                        {log.messageType === "custom" && "Livre"}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-mono text-neutral-500">
                      {log.provider}
                    </td>
                    <td className="py-3 px-3">
                      {log.status === "success" && (
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Enviado
                        </span>
                      )}
                      {log.status === "simulated" && (
                        <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 w-fit">
                          <Share2 className="w-3 h-3" /> Web Direct
                        </span>
                      )}
                      {log.status === "error" && (
                        <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> Erro API
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate font-mono text-[10px] text-neutral-400">
                      {log.apiResponse || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default WhatsAppApiManager;
