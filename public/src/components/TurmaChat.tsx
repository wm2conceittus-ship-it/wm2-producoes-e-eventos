import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Pin, 
  PinOff, 
  Trash2, 
  CornerDownRight, 
  X, 
  Sparkles, 
  Crown, 
  User, 
  Building, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Filter, 
  Search, 
  Smile, 
  AlertCircle,
  Megaphone,
  Check,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';
import { Formando, Turma, TurmaMessage } from '../types';

interface TurmaChatProps {
  currentStudent?: Formando;
  turma?: Turma;
  turmaMessages?: TurmaMessage[];
  onSendMessage: (newMessage: Omit<TurmaMessage, 'id' | 'createdAt'>) => void;
  onDeleteMessage?: (messageId: string) => void;
  onTogglePin?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onUpdateStatus?: (messageId: string, status: 'Pendente' | 'Respondida' | 'Em Análise', statusNote?: string) => void;
}

const CATEGORIES: { id: TurmaMessage['category']; label: string; icon: any; color: string; bg: string; border: string }[] = [
  { id: 'Geral', label: 'Geral', icon: MessageSquare, color: 'text-neutral-700 dark:text-neutral-800', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  { id: 'Dúvida', label: 'Dúvida', icon: HelpCircle, color: 'text-amber-800 dark:text-amber-900', bg: 'bg-amber-100/80', border: 'border-amber-300' },
  { id: 'Comissão', label: 'Comissão', icon: Crown, color: 'text-amber-900 font-bold', bg: 'bg-[#ebdca8]', border: 'border-[#c5b072]' },
  { id: 'Aviso', label: 'Aviso Oficial', icon: Megaphone, color: 'text-blue-800 dark:text-blue-900', bg: 'bg-blue-100/80', border: 'border-blue-300' },
  { id: 'Sugestão', label: 'Sugestão', icon: Sparkles, color: 'text-purple-800 dark:text-purple-900', bg: 'bg-purple-100/80', border: 'border-purple-300' },
  { id: 'Financeiro', label: 'Financeiro', icon: DollarSign, color: 'text-emerald-800 dark:text-emerald-900', bg: 'bg-emerald-100/80', border: 'border-emerald-300' },
  { id: 'Evento', label: 'Evento', icon: Calendar, color: 'text-indigo-800 dark:text-indigo-900', bg: 'bg-indigo-100/80', border: 'border-indigo-300' },
];

const AVAILABLE_EMOJIS = ['👍', '❤️', '👏', '🎉', '💡', '🙏', '🔥'];

const QUICK_PROMPTS = [
  'Dúvida sobre convites extras e valores',
  'Qual o horário oficial da colação de grau?',
  'Quando começam as provas de beca?',
  'Dúvida sobre formas de pagamento Pix/Boleto'
];

export default function TurmaChat({
  currentStudent,
  turma,
  turmaMessages = [],
  onSendMessage,
  onDeleteMessage,
  onTogglePin,
  onToggleReaction,
  onUpdateStatus
}: TurmaChatProps) {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TurmaMessage['category']>('Geral');
  const [pinOnSend, setPinOnSend] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TurmaMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pinned' | 'comissao' | 'duvidas' | 'sugestoes'>('all');
  const [selectedEmojiPickerMsgId, setSelectedEmojiPickerMsgId] = useState<string | null>(null);
  const [statusEditMsgId, setStatusEditMsgId] = useState<string | null>(null);
  const [statusEditNote, setStatusEditNote] = useState('');
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);

  const isComissaoOrAdmin = currentStudent?.role === 'comissao' || (currentStudent as any)?.role === 'admin';

  // Filter messages specifically for this turma
  const currentTurmaMessages = useMemo(() => {
    if (!turma?.id) return [];
    return (turmaMessages || []).filter(m => m.turmaId === turma.id);
  }, [turmaMessages, turma?.id]);

  // Filter and search
  const filteredMessages = useMemo(() => {
    return currentTurmaMessages.filter(msg => {
      // Filter by tab
      if (filterTab === 'pinned' && !msg.pinned) return false;
      if (filterTab === 'comissao' && msg.authorRole !== 'comissao' && msg.category !== 'Comissão') return false;
      if (filterTab === 'duvidas' && msg.category !== 'Dúvida') return false;
      if (filterTab === 'sugestoes' && msg.category !== 'Sugestão') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchContent = msg.content.toLowerCase().includes(q);
        const matchAuthor = msg.authorName.toLowerCase().includes(q);
        const matchCategory = msg.category?.toLowerCase().includes(q);
        return matchContent || matchAuthor || matchCategory;
      }

      return true;
    }).sort((a, b) => {
      // Sort pinned to the top first, then chronological
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [currentTurmaMessages, filterTab, searchQuery]);

  const pinnedCount = useMemo(() => currentTurmaMessages.filter(m => m.pinned).length, [currentTurmaMessages]);
  const comissaoCount = useMemo(() => currentTurmaMessages.filter(m => m.authorRole === 'comissao' || m.category === 'Comissão').length, [currentTurmaMessages]);
  const duvidasCount = useMemo(() => currentTurmaMessages.filter(m => m.category === 'Dúvida').length, [currentTurmaMessages]);
  const sugestoesCount = useMemo(() => currentTurmaMessages.filter(m => m.category === 'Sugestão').length, [currentTurmaMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      turmaId: turma.id,
      authorId: currentStudent.id,
      authorName: currentStudent.name,
      authorRole: currentStudent.role as any,
      content: inputText.trim(),
      category: selectedCategory,
      pinned: isComissaoOrAdmin && pinOnSend,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        authorName: replyingTo.authorName,
        content: replyingTo.content.length > 80 ? replyingTo.content.substring(0, 80) + '...' : replyingTo.content,
        authorRole: replyingTo.authorRole
      } : undefined,
      status: selectedCategory === 'Dúvida' ? 'Pendente' : undefined
    });

    setInputText('');
    setReplyingTo(null);
    setPinOnSend(false);
    setSelectedCategory('Geral');
  };

  const handleReactionClick = (msgId: string, emoji: string) => {
    if (onToggleReaction) {
      onToggleReaction(msgId, emoji);
    }
    setSelectedEmojiPickerMsgId(null);
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 p-6 rounded-2xl text-white shadow-md border border-[#aa904f]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#dfd1a1]">
              <MessageSquare className="w-4 h-4 text-[#aa904f]" />
              Canal Oficial de Comunicação & Chat da Turma
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {turma.name}
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              Espaço interativo para recados, dúvidas sobre colação e baile, sugestões e alinhamento direto entre os formandos e a <strong>Comissão de Formatura</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2 text-xs text-neutral-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>{currentTurmaMessages.length}</strong> mensagens na turma</span>
            </div>
            {isComissaoOrAdmin && (
              <div className="bg-[#705510] text-[#ebe0b2] px-3 py-1.5 rounded-xl border border-[#aa904f]/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-[#dfd1a1]" />
                Modo Comissão Ativo
              </div>
            )}
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#aa904f]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-white border border-neutral-200 dark:border-neutral-300 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Todos ({currentTurmaMessages.length})
            </button>

            <button
              onClick={() => setFilterTab('pinned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'pinned'
                  ? 'bg-[#705510] text-[#ebe0b2] shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Pin className="w-3.5 h-3.5 text-[#aa904f]" />
              Fixados ({pinnedCount})
            </button>

            <button
              onClick={() => setFilterTab('comissao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'comissao'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              Comissão ({comissaoCount})
            </button>

            <button
              onClick={() => setFilterTab('duvidas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'duvidas'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              Dúvidas ({duvidasCount})
            </button>

            <button
              onClick={() => setFilterTab('sugestoes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'sugestoes'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Sugestões ({sugestoesCount})
            </button>
          </div>

          {/* Live Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar mensagem ou autor..."
              className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#aa904f] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Messages List Feed */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 max-h-[620px] overflow-y-auto bg-neutral-50/40">
          
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#aa904f] mb-3 shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">
                {searchQuery ? 'Nenhum comentário encontrado para a busca.' : 'Nenhuma mensagem neste filtro ainda.'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                {searchQuery
                  ? 'Tente pesquisar por outros termos ou limpe a busca.'
                  : 'Seja o primeiro a enviar uma dúvida ou sugestão para a comissão e formandos!'}
              </p>
              
              {/* Quick suggestions if empty */}
              {!searchQuery && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-md">
                  {QUICK_PROMPTS.slice(0, 2).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(prompt);
                        setSelectedCategory('Dúvida');
                      }}
                      className="bg-white hover:bg-amber-50 text-neutral-700 hover:text-amber-900 border border-neutral-200 hover:border-amber-300 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      💬 "{prompt}"
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isAuthor = msg.authorId === currentStudent.id;
              const isCommissionMsg = msg.authorRole === 'comissao' || msg.category === 'Comissão';
              const isAdminMsg = msg.authorRole === 'admin';
              const categoryConfig = CATEGORIES.find(c => c.id === msg.category) || CATEGORIES[0];
              const CategoryIcon = categoryConfig.icon;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative rounded-2xl p-4 sm:p-5 transition-all shadow-xs border ${
                    msg.pinned
                      ? 'bg-[#fcfaf2] border-[#c5b072]/60 ring-2 ring-[#aa904f]/20'
                      : isCommissionMsg
                      ? 'bg-amber-50/50 border-amber-300/70'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Pinned Marker Banner */}
                  {msg.pinned && (
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-[#705510] mb-2.5 pb-2 border-b border-amber-200/60 uppercase tracking-wider">
                      <Pin className="w-3.5 h-3.5 fill-[#aa904f] text-[#aa904f]" />
                      Mensagem Fixada pela Comissão
                    </div>
                  )}

                  {/* Header: Author info, Role Badge, Category, Date, Actions */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    
                    {/* Author identity */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                          isCommissionMsg
                            ? 'bg-gradient-to-tr from-[#705510] to-[#aa904f] text-[#ebe0b2]'
                            : isAdminMsg
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {msg.authorName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-neutral-900">
                            {msg.authorName}
                          </span>
                          
                          {/* Role Badge */}
                          {isCommissionMsg && (
                            <span className="inline-flex items-center gap-1 bg-[#705510] text-[#ebe0b2] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                              <Crown className="w-3 h-3 text-[#dfd1a1]" />
                              Comissão
                            </span>
                          )}

                          {isAdminMsg && (
                            <span className="inline-flex items-center gap-1 bg-neutral-900 text-[#ebe0b2] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <Building className="w-3 h-3 text-[#aa904f]" />
                              WM2 Produções
                            </span>
                          )}

                          {/* Category Tag */}
                          {msg.category && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryConfig.bg} ${categoryConfig.color} ${categoryConfig.border}`}>
                              <CategoryIcon className="w-3 h-3" />
                              {msg.category}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls Menu */}
                    <div className="flex items-center gap-1">
                      
                      {/* Pin/Unpin (Comissao/Admin only) */}
                      {isComissaoOrAdmin && onTogglePin && (
                        <button
                          onClick={() => onTogglePin(msg.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            msg.pinned
                              ? 'bg-[#705510] text-[#ebe0b2] hover:bg-[#543d03]'
                              : 'text-neutral-400 hover:text-[#aa904f] hover:bg-amber-50'
                          }`}
                          title={msg.pinned ? 'Desafixar mensagem' : 'Fixar no topo'}
                        >
                          {msg.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Reply button */}
                      <button
                        onClick={() => {
                          setReplyingTo(msg);
                          // Scroll to input if needed
                        }}
                        className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Responder a esta mensagem"
                      >
                        <CornerDownRight className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="hidden sm:inline">Responder</span>
                      </button>

                      {/* Delete button (Author or Comissao) */}
                      {(isAuthor || isComissaoOrAdmin) && onDeleteMessage && (
                        <button
                          onClick={() => {
                            setMsgToDelete(msg.id);
                          }}
                          className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Excluir mensagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply Quote Banner if replyingTo exists */}
                  {msg.replyTo && (
                    <div className="mt-2.5 ml-2 pl-3 border-l-2 border-[#aa904f] bg-neutral-100/70 p-2 rounded-r-lg text-xs text-neutral-600 flex items-start gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#aa904f] shrink-0 mt-0.5" />
                      <div className="truncate">
                        <span className="font-bold text-neutral-800">
                          {msg.replyTo.authorName}
                          {msg.replyTo.authorRole === 'comissao' ? ' (👑 Comissão)' : ''}:
                        </span>{' '}
                        <span className="italic text-neutral-600">{msg.replyTo.content}</span>
                      </div>
                    </div>
                  )}

                  {/* Message Body Content */}
                  <div className="mt-3 text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Question Status Banner (for Dúvida) */}
                  {msg.category === 'Dúvida' && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {msg.status === 'Respondida' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Dúvida Respondida pela Comissão
                          </span>
                        ) : msg.status === 'Em Análise' ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Em análise com a comissão / WM2
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-full font-medium text-[11px]">
                            <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                            Aguardando resposta da Comissão
                          </span>
                        )}
                        {msg.statusNote && (
                          <span className="text-[11px] text-neutral-500 italic">
                            • {msg.statusNote}
                          </span>
                        )}
                      </div>

                      {/* Comissão Quick Status Toggle */}
                      {isComissaoOrAdmin && onUpdateStatus && (
                        <div className="flex items-center gap-1">
                          {msg.status !== 'Respondida' && (
                            <button
                              onClick={() => onUpdateStatus(msg.id, 'Respondida')}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Marcar Respondida
                            </button>
                          )}
                          {msg.status !== 'Em Análise' && (
                            <button
                              onClick={() => onUpdateStatus(msg.id, 'Em Análise', 'Comissão verificando com o cerimonial.')}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                            >
                              Em Análise
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reactions Section */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center gap-1.5">
                    
                    {/* Existing reactions pills */}
                    {Object.entries(msg.reactions || {}).map(([emoji, users]) => {
                      if (!users || users.length === 0) return null;
                      const hasReacted = users.includes(currentStudent.name);

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReactionClick(msg.id, emoji)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            hasReacted
                              ? 'bg-amber-100 border border-[#aa904f] text-[#705510] font-bold shadow-xs'
                              : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                          }`}
                          title={`Reagiram: ${users.join(', ')}`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[11px]">{users.length}</span>
                        </button>
                      );
                    })}

                    {/* Add Reaction Button & Popup */}
                    <div className="relative">
                      <button
                        onClick={() => setSelectedEmojiPickerMsgId(selectedEmojiPickerMsgId === msg.id ? null : msg.id)}
                        className="text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Adicionar reação"
                      >
                        <Smile className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold pr-1">+</span>
                      </button>

                      {/* Emoji Quick Picker Dropdown */}
                      <AnimatePresence>
                        {selectedEmojiPickerMsgId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className="absolute bottom-full left-0 mb-1 z-30 bg-white border border-neutral-300 rounded-full shadow-lg p-1.5 flex items-center gap-1"
                          >
                            {AVAILABLE_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(msg.id, emoji)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 rounded-full text-sm hover:scale-125 transition-transform cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-neutral-100/80 border-t border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-neutral-400 uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#aa904f]" /> Sugestões rápidas:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(prompt);
                setSelectedCategory('Dúvida');
              }}
              className="bg-white hover:bg-amber-50 text-neutral-600 hover:text-amber-900 border border-neutral-200 hover:border-amber-300 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-neutral-200 space-y-3">
          
          {/* Replying-To Banner */}
          {replyingTo && (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 truncate">
                <CornerDownRight className="w-4 h-4 text-[#aa904f] shrink-0" />
                <span className="font-bold">Respondendo a {replyingTo.authorName}:</span>
                <span className="italic truncate text-neutral-600">{replyingTo.content}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-neutral-400 hover:text-rose-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Category Selector Chips & Options */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs font-bold text-neutral-500 flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5 text-neutral-400" /> Tipo:
              </span>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? `${cat.bg} ${cat.color} ${cat.border} border shadow-xs font-bold ring-1 ring-amber-400/40`
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Pin Checkbox (Comissão/Admin only) */}
            {isComissaoOrAdmin && (
              <label className="flex items-center gap-1.5 text-xs text-neutral-700 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinOnSend}
                  onChange={(e) => setPinOnSend(e.target.checked)}
                  className="rounded text-[#aa904f] focus:ring-[#aa904f] border-neutral-300 w-3.5 h-3.5"
                />
                <Pin className="w-3 h-3 text-[#aa904f]" />
                <span>Fixar este aviso no topo</span>
              </label>
            )}
          </div>

          {/* Input text area and send button */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  selectedCategory === 'Dúvida'
                    ? `Escreva sua dúvida para a comissão de formatura...`
                    : selectedCategory === 'Sugestão'
                    ? `Compartilhe uma ideia ou sugestão para o evento...`
                    : `Escreva uma mensagem para a turma... (Pressione Enter para enviar)`
                }
                rows={2}
                className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-[#aa904f] rounded-xl p-3 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#aa904f]/20 transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-2 right-2 text-[10px] text-neutral-400 font-mono pointer-events-none">
                {inputText.length > 0 && `${inputText.length} caracteres`}
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-[#705510] to-[#aa904f] hover:from-[#543d03] hover:to-[#8c7438] disabled:opacity-40 disabled:cursor-not-allowed text-[#ebe0b2] px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0 h-[58px]"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>

          {/* User footer identity hint */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#aa904f]" />
              Publicando como: <strong>{currentStudent.name}</strong>{' '}
              {isComissaoOrAdmin ? (
                <span className="text-[#705510] font-black bg-amber-100 px-1.5 py-0.2 rounded">👑 Comissão</span>
              ) : (
                <span className="text-neutral-600 font-semibold">(🎓 Formando)</span>
              )}
            </span>
            <span className="text-[10px] text-neutral-400">Turma: {turma.name}</span>
          </div>

        </form>

      </div>

      {/* Delete Confirmation Modal */}
      {msgToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">Excluir Mensagem</h4>
            </div>
            <p className="text-sm text-neutral-600">
              Tem certeza que deseja excluir esta mensagem do mural da turma? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMsgToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMessage && msgToDelete) {
                    onDeleteMessage(msgToDelete);
                  }
                  setMsgToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
