import { Lead, LeadActivity } from '../types';

export interface LeadScoreInfo {
  score: number;
  level: 'vip' | 'hot' | 'warm' | 'cold';
  label: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  icon: string;
}

export interface StagnantLeadAlert {
  lead: Lead;
  daysInStage: number;
  urgency: 'warning' | 'critical';
  stageLabel: string;
  recommendedAction: string;
  urgencyLabel: string;
  badgeClass: string;
  cardBorderClass: string;
}

export const STAGE_LABELS: Record<Lead['stage'], string> = {
  prospecting: 'Prospecção / Inbound',
  contacted: 'Contato Inicial',
  proposal_sent: 'Proposta Enviada',
  negotiation: 'Em Negociação',
  won: 'Contrato Fechado',
  lost: 'Perdido'
};

export const STAGE_RECOMMENDED_ACTIONS: Record<Lead['stage'], string> = {
  prospecting: 'Ligar para o líder da comissão ou enviar WhatsApp de apresentação dos diferenciais da WM2.',
  contacted: 'Enviar o catálogo/portfólio de eventos e agendar uma reunião presencial ou por vídeo com a comissão.',
  proposal_sent: 'Entrar em contato para tirar dúvidas sobre a proposta e oferecer bonificação em cenografia para adesão rápida.',
  negotiation: 'Oferecer condição especial de parcelamento ou flexibilização de convites extras para fechamento imediato.',
  won: 'Contrato fechado. Nenhuma ação pendente.',
  lost: 'Oportunidade perdida.'
};

/**
 * Computes how many days a lead has been in its current stage
 */
export function getLeadDaysInStage(lead: Lead, referenceDate: Date = new Date()): number {
  const dateStr = lead.stageUpdatedAt || lead.lastContactDate || lead.createdAt;
  if (!dateStr) return 0;

  try {
    const stageDate = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    if (isNaN(stageDate.getTime())) return 0;

    const diffMs = referenceDate.getTime() - stageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch (e) {
    return 0;
  }
}

/**
 * Checks if a lead has been in the same active stage for longer than thresholdDays (default 7 days)
 */
export function isLeadStagnant(lead: Lead, thresholdDays: number = 7, referenceDate: Date = new Date()): boolean {
  if (lead.stage === 'won' || lead.stage === 'lost') return false;
  return getLeadDaysInStage(lead, referenceDate) >= thresholdDays;
}

/**
 * Retrieves all stagnant leads (stuck in same stage for >= thresholdDays)
 * Sorted by urgency (critical first, then highest days and highest value)
 */
export function getStagnantLeads(leads: Lead[], thresholdDays: number = 7, referenceDate: Date = new Date()): StagnantLeadAlert[] {
  return leads
    .filter(lead => isLeadStagnant(lead, thresholdDays, referenceDate))
    .map(lead => {
      const days = getLeadDaysInStage(lead, referenceDate);
      const isCritical = days >= 14;
      const urgency: 'warning' | 'critical' = isCritical ? 'critical' : 'warning';
      const stageLabel = STAGE_LABELS[lead.stage] || lead.stage;
      const recommendedAction = STAGE_RECOMMENDED_ACTIONS[lead.stage] || 'Entrar em contato imediatamente para destravar o processo.';

      return {
        lead,
        daysInStage: days,
        urgency,
        stageLabel,
        recommendedAction,
        urgencyLabel: isCritical ? `🚨 Crítico: ${days} dias sem avanço` : `⚠️ Atenção: ${days} dias nesta etapa`,
        badgeClass: isCritical
          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 animate-pulse'
          : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        cardBorderClass: isCritical
          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/10'
          : 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/10'
      };
    })
    .sort((a, b) => {
      // Critical first
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
      // Then most days in stage
      if (b.daysInStage !== a.daysInStage) return b.daysInStage - a.daysInStage;
      // Then highest value
      return (b.lead.estimatedValue || 0) - (a.lead.estimatedValue || 0);
    });
}

/**
 * Builds a personalized WhatsApp follow-up message to reactivate a stale lead
 */
export function getStaleLeadFollowUpText(lead: Lead, daysInStage: number): string {
  const contact = lead.contactName || 'Comissão';
  const turma = lead.name || 'Formatura';
  const instituicao = lead.institution ? ` da ${lead.institution}` : '';

  if (lead.stage === 'proposal_sent') {
    return `Olá ${contact}! Tudo bem? Sou consultor da WM2 Produções & Eventos. Vi que enviamos a proposta para a turma de ${turma}${instituicao} há alguns dias e gostaríamos de saber se vocês tiveram tempo de avaliar com os formandos. Conseguimos agendar uma rápida conversa de 10 minutinhos para alinhar eventuais ajustes no pacote e garantir a data preferida de vocês?`;
  }

  if (lead.stage === 'negotiation') {
    return `Oi ${contact}, tudo bem? Passando para atualizar o status da proposta da turma de ${turma}${instituicao}. Nossa diretoria liberou algumas condições exclusivas de parcelamento e itens bônus de cenografia para as turmas confirmadas neste mês. Vamos fechar a parceria?`;
  }

  if (lead.stage === 'contacted') {
    return `Olá ${contact}! Tudo bem? Conversamos recentemente sobre a formatura da turma de ${turma}${instituicao}. Preparamos uma apresentação visual incrível com nossos espaços e serviços. Gostaria de receber o PDF com o projeto completo?`;
  }

  return `Olá ${contact}! Sou consultor da WM2 Produções & Eventos. Gostaríamos de retomar o contato com a comissão da turma de ${turma}${instituicao} para apresentar nossos pacotes e estrutura para formatura. Como podemos ajudar vocês nesta etapa?`;
}

/**
 * Calculates lead quality score (0 to 100) based on commercial factors:
 * - Commission involvement (isComissao / contact role)
 * - Estimated student volume
 * - Estimated pipeline value
 * - Contact completeness
 * - Interaction frequency
 * - Recency of contact
 */
export function calculateLeadScore(lead: Lead): LeadScoreInfo {
  let score = 20; // Base score for any registered lead

  // 1. Commission Leadership Factor (+25 pts)
  if (lead.isComissao !== false) {
    score += 20;
    const roleLower = (lead.contactRoleTitle || '').toLowerCase();
    if (
      roleLower.includes('presidente') ||
      roleLower.includes('financeiro') ||
      roleLower.includes('líder') ||
      roleLower.includes('lider') ||
      roleLower.includes('coordenador')
    ) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // 2. Student Volume Factor (up to +20 pts)
  const students = lead.estimatedStudents || 0;
  if (students >= 60) score += 20;
  else if (students >= 40) score += 15;
  else if (students >= 20) score += 10;
  else if (students >= 10) score += 5;

  // 3. Pipeline Financial Value (up to +20 pts)
  const value = lead.estimatedValue || 0;
  if (value >= 150000) score += 20;
  else if (value >= 80000) score += 15;
  else if (value >= 40000) score += 10;
  else if (value >= 15000) score += 5;

  // 4. Contact Data Completeness (+10 pts)
  const hasPhone = Boolean(lead.contactPhone && lead.contactPhone.replace(/\D/g, '').length >= 10);
  const hasEmail = Boolean(lead.contactEmail && lead.contactEmail.includes('@'));
  if (hasPhone && hasEmail) score += 10;
  else if (hasPhone || hasEmail) score += 5;

  // 5. Interaction engagement (+10 pts)
  const actCount = (lead.activities || []).length;
  if (actCount >= 4) score += 15;
  else if (actCount >= 2) score += 10;
  else if (actCount >= 1) score += 5;

  // 6. Recency penalty (if neglected for > 10 days)
  if (lead.lastContactDate && lead.stage !== 'won' && lead.stage !== 'lost') {
    const lastDate = new Date(lead.lastContactDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 14) score -= 15;
    else if (diffDays > 7) score -= 8;
  }

  // Clamp score between 5 and 100
  score = Math.max(5, Math.min(100, score));

  if (score >= 75) {
    return {
      score,
      level: 'vip',
      label: 'VIP',
      badgeColor: 'text-amber-800 dark:text-amber-300',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      icon: ''
    };
  }

  if (score >= 55) {
    return {
      score,
      level: 'hot',
      label: 'Quente',
      badgeColor: 'text-orange-800 dark:text-orange-300',
      badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
      badgeBorder: 'border-orange-200 dark:border-orange-800',
      icon: ''
    };
  }

  if (score >= 35) {
    return {
      score,
      level: 'warm',
      label: 'Morno',
      badgeColor: 'text-blue-800 dark:text-blue-300',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      icon: ''
    };
  }

  return {
    score,
    level: 'cold',
    label: 'Frio',
    badgeColor: 'text-neutral-600 dark:text-neutral-400',
    badgeBg: 'bg-neutral-100 dark:bg-neutral-800',
    badgeBorder: 'border-neutral-200 dark:border-neutral-700',
    icon: ''
  };
}

/**
 * Probability of closing sale per pipeline stage
 */
export const STAGE_PROBABILITIES: Record<Lead['stage'], number> = {
  prospecting: 0.15,
  contacted: 0.30,
  proposal_sent: 0.60,
  negotiation: 0.85,
  won: 1.00,
  lost: 0.00
};

/**
 * Calculates weighted pipeline value (Forecast)
 */
export function calculateWeightedPipeline(leads: Lead[]): number {
  return leads.reduce((sum, lead) => {
    const prob = STAGE_PROBABILITIES[lead.stage] || 0;
    return sum + (lead.estimatedValue || 0) * prob;
  }, 0);
}

/**
 * Standard reasons for losing a deal
 */
export const LOSS_REASONS = [
  { id: 'preco_alto', label: 'Preço / Fora do Orçamento', icon: '💸', desc: 'Valor da adesão acima da meta da turma' },
  { id: 'concorrencia', label: 'Fechou com Concorrente', icon: '🥊', desc: 'Optaram por outra empresa de eventos' },
  { id: 'poucos_alunos', label: 'Falta de Quórum / Poucos Alunos', icon: '👥', desc: 'Turma pequena ou desistências' },
  { id: 'sem_comissao', label: 'Comissão Dissolvida / Sem Líder', icon: '🏛️', desc: 'Não conseguiram organizar a comissão' },
  { id: 'cancelaram_festa', label: 'Cancelaram a Festa / Só Colação', icon: '🚫', desc: 'Decidiram não realizar baile' },
  { id: 'sem_resposta', label: 'Sem Resposta / Desengajamento', icon: '⏳', desc: 'Não responderam após vários follow-ups' },
  { id: 'outro', label: 'Outro Motivo', icon: '📝', desc: 'Motivo específico descrito nas notas' }
];

/**
 * WhatsApp message templates with smart variable replacement
 */
export const WHATSAPP_CRM_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Apresentação & Portfólio WM2',
    shortDesc: 'Primeiro contato caloroso e apresentação institucional',
    template: 'Olá {contato}! Tudo bem? Sou consultor da WM2 Produções & Eventos. Vi o interesse em realizar a formatura da turma de {turma} ({instituicao}). Preparamos projetos exclusivos e inovadores com estrutura de alta qualidade. Gostaria de agendar uma breve conversa para apresentar nossa proposta?'
  },
  {
    id: 'proposal',
    title: 'Envio de Proposta & Valores',
    shortDesc: 'Envio de orçamento completo e condições de adesão',
    template: 'Olá {contato}! Acabamos de estruturar a proposta comercial personalizada para a formatura da turma de {turma} ({instituicao}), no valor estimado de {valor}. Estamos com condições promocionais de lançamento para os primeiros formandos. Posso enviar o PDF detalhado para a comissão?'
  },
  {
    id: 'meeting',
    title: 'Convite para Reunião com a Comissão',
    shortDesc: 'Agendamento de alinhamento presencial ou videoconferência',
    template: 'Olá {contato}! Gostaria de convidar você e a comissão de formatura da turma de {turma} para uma breve reunião de apresentação. Vamos demonstrar nossa estrutura, cardápios, cenografia e tirar todas as dúvidas. Qual o melhor dia e horário para vocês nesta semana?'
  },
  {
    id: 'followup',
    title: 'Follow-up Suave / Tirar Dúvidas',
    shortDesc: 'Retorno para verificar status da análise da proposta',
    template: 'Oi {contato}, tudo bem? Passando para saber como estão as conversas com os alunos sobre a proposta da formatura de {turma}. Ficou alguma dúvida sobre os itens inclusos ou formas de pagamento parcelado que possamos esclarecer?'
  },
  {
    id: 'urgent_bonus',
    title: 'Condição Especial por Tempo Limitado',
    shortDesc: 'Gatilho de urgência com bônus para a comissão',
    template: 'Olá {contato}! Consegui com nossa diretoria uma condição especial exclusiva para a turma de {turma}: bônus em itens de cenografia e condições facilitadas no boleto caso consigamos fechar a data nesta semana. Vamos agendar para fechar?'
  },
  {
    id: 'contract_won',
    title: 'Boas-vindas & Assinatura de Contrato',
    shortDesc: 'Mensagem de celebração de contrato fechado',
    template: '🎉 Parabéns {contato}! É com imensa alegria que oficializamos a parceria da WM2 Produções & Eventos com a turma de {turma} ({instituicao})! O contrato já está pronto para assinatura digital. Vamos juntos fazer a melhor formatura da história!'
  }
];

/**
 * Replaces message placeholders with real lead values
 */
export function formatCrmMessage(template: string, lead: Lead): string {
  const contact = lead.contactName || lead.name || 'Comissão';
  const turma = lead.name || 'Formatura';
  const instituicao = lead.institution || 'Instituição';
  const valor = lead.estimatedValue
    ? lead.estimatedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    : 'R$ 0,00';
  const alunos = String(lead.estimatedStudents || 0);

  return template
    .replace(/\{contato\}/g, contact)
    .replace(/\{turma\}/g, turma)
    .replace(/\{instituicao\}/g, instituicao)
    .replace(/\{valor\}/g, valor)
    .replace(/\{alunos\}/g, alunos);
}

/**
 * Builds WhatsApp Web or App link
 */
export function getWhatsAppDirectUrl(phone: string, text: string): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (!cleanPhone) return '';
  let formattedPhone = cleanPhone;
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    formattedPhone = '55' + cleanPhone;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Checks follow-up date status
 */
export function checkFollowUpStatus(dateStr?: string): {
  status: 'overdue' | 'today' | 'upcoming' | 'none';
  label: string;
  colorClass: string;
  badgeClass: string;
} {
  if (!dateStr) {
    return {
      status: 'none',
      label: 'Sem follow-up',
      colorClass: 'text-neutral-400',
      badgeClass: 'bg-neutral-100 text-neutral-500'
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const targetDate = dateStr.split('T')[0];

  if (targetDate < todayStr) {
    return {
      status: 'overdue',
      label: `Atrasado (${dateStr.split('-').reverse().join('/')})`,
      colorClass: 'text-rose-600',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
    };
  }

  if (targetDate === todayStr) {
    return {
      status: 'today',
      label: 'Retornar Hoje!',
      colorClass: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
    };
  }

  return {
    status: 'upcoming',
    label: `Follow-up: ${dateStr.split('-').reverse().join('/')}`,
    colorClass: 'text-sky-700',
    badgeClass: 'bg-sky-50 text-sky-800 border border-sky-200'
  };
}
