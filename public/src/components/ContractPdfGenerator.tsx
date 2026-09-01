import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  User, 
  Check, 
  Copy, 
  Edit3, 
  X, 
  ShieldCheck, 
  Award, 
  FileCheck, 
  Sparkles, 
  Eye, 
  Settings,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  Tag,
  Plus,
  RefreshCw,
  QrCode,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  Lock,
  Layers,
  Palette,
  Send
} from 'lucide-react';
import { Formando, Turma } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from './Logo';

export interface ContractTemplate {
  id: string;
  title: string;
  category: 'Adesão' | 'Prestação de Serviços' | 'Quitação' | 'Fotografia & Álbum' | 'Termo Aditivo';
  description: string;
  content: string;
}

export type DocumentTheme = 'wm2_gold' | 'executive_dark' | 'classic_serif';

const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'adesao_padrao',
    title: 'Termo de Adesão e Contrato de Formatura',
    category: 'Adesão',
    description: 'Contrato principal de prestação de serviços de eventos de formatura e baile de gala.',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS E TERMO DE ADESÃO INDIVIDUAL À FORMATURA

CONTRATADA:
WM2 PRODUÇÕES & EVENTOS LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 12.345.678/0001-99, com sede na Alameda dos Eventos, nº 1000, São Paulo/SP.

CONTRATANTE:
{NOME_FORMANDO}, pessoa física, inscrito(a) no CPF sob o nº {CPF_FORMANDO}, e-mail {EMAIL_FORMANDO}, telefone {TELEFONE_FORMANDO}, residente e domiciliado(a) em {ENDERECO_FORMANDO}, portador(a) do código de aluno nº {CODIGO_ALUNO} ({ROLE_FORMANDO}).

DADOS DA TURMA E INSTITUIÇÃO:
Turma {NOME_TURMA}, referente ao curso de {CURSO}, ministrado na instituição de ensino {INSTITUICAO}, com previsão de conclusão no ano de {ANO_FORMATURA} e sob o Contrato Geral de Turma nº {NUMERO_CONTRATO_TURMA}.

CLÁUSULA PRIMEIRA - DO OBJETO
O presente instrumento tem por objeto a prestação de serviços de planejamento, organização, produção e execução dos eventos festivos de formatura da turma {NOME_TURMA}, contemplando o pacote individual selecionado pelo(a) CONTRATANTE.

CLÁUSULA SEGUNDA - DO PACOTE E VALORES
1. O CONTRATANTE aderiu formalmente ao pacote: {PACOTE_SELECIONADO}.
2. O valor total contratado é de {VALOR_TOTAL}.
3. O montante quitado até a presente data é de {VALOR_PAGO}, restando o saldo de {VALOR_PENDENTE}.
4. Situação Financeira do Contratante no Sistema: {SITUACAO_FINANCEIRA}.

CLÁUSULA TERCEIRA - DOS CONVITES E DIREITO DE ACESSO
O CONTRATANTE terá direito aos ingressos, credenciais e convites estipulados no seu pacote contratado, bem como ao código individual de acesso ({CODIGO_ALUNO}) para gestão no portal do formando WM2.

CLÁUSULA QUARTA - DAS DISPOSIÇÕES GERAIS E VALIDADE DIGITAL
As partes declaram ciência e concordância integral com todas as cláusulas e condições estabelecidas neste contrato e no regulamento geral da comissão de formatura. O presente documento possui validade jurídica respaldada por registro eletrônico no sistema WM2 DocEngine.

E, por estarem assim justos e contratados, firmam o presente instrumento para que produza seus jurídicos e legais efeitos.

São Paulo, {DATA_HOJE}.`
  },
  {
    id: 'fotografia_album',
    title: 'Contrato de Pacote Fotográfico & Álbum de Formatura',
    category: 'Fotografia & Álbum',
    description: 'Contrato exclusivo de cobertura fotográfica individual, ensaio de estúdio e álbum encadernado.',
    content: `CONTRATO DE COBERTURA FOTOGRÁFICA E ÁLBUM DE LUXO DE FORMATURA

CONTRATADA:
WM2 PRODUÇÕES & EVENTOS LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 12.345.678/0001-99, com sede na Alameda dos Eventos, nº 1000, São Paulo/SP.

CONTRATANTE:
{NOME_FORMANDO}, pessoa física, inscrito(a) no CPF sob o nº {CPF_FORMANDO}, e-mail {EMAIL_FORMANDO}, telefone {TELEFONE_FORMANDO}, residente e domiciliado(a) em {ENDERECO_FORMANDO}, código de aluno nº {CODIGO_ALUNO}.

DADOS DA TURMA E INSTITUIÇÃO:
Turma {NOME_TURMA}, referente ao curso de {CURSO}, ministrado na instituição de ensino {INSTITUICAO} ({ANO_FORMATURA}).

1. DO OBJETO E COBERTURA FOTOGRÁFICA
A CONTRATADA compromete-se a realizar a cobertura fotográfica das solenidades e eventos de formatura, disponibilizando o ensaio fotográfico de beca, tratamento digital de imagens e confecção do álbum de luxo encadernado para o(a) CONTRATANTE.

2. ESPECIFICAÇÕES DO PACOTE FOTOGRÁFICO
• Pacote Selecionado: {PACOTE_SELECIONADO}
• Eventos Cobertos: Ensaio de Beca + Colação de Grau + Baile de Gala
• Acesso à Galeria Digital: {CODIGO_ALUNO} via Portal WM2

3. DO VALOR E FORMA DE ADESÃO
O investimento total estipulado para a cobertura e álbum fotográfico é de {VALOR_TOTAL}, constando atualmente {VALOR_PAGO} quitados e saldo restante de {VALOR_PENDENTE}.

4. DIREITOS DE IMAGEM E AUTORIZAÇÃO
O(A) CONTRATANTE autoriza o uso de sua imagem exclusivamente para fins de confecção do álbum e divulgação nos canais oficiais de portfólio da CONTRATADA.

São Paulo, {DATA_HOJE}.`
  },
  {
    id: 'termo_quitacao',
    title: 'Termo de Quitação e Entrega de Convites',
    category: 'Quitação',
    description: 'Recibo oficial declarando quitação do saldo do formando e protocolo de entrega de convites.',
    content: `TERMO DE QUITAÇÃO FINANCEIRA E RECEBIMENTO DE CONVITES DE FORMATURA

DECLARANTE / CONTRATADA:
WM2 PRODUÇÕES & EVENTOS LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 12.345.678/0001-99, com sede na Alameda dos Eventos, nº 1000, São Paulo/SP.

BENEFICIÁRIO / CONTRATANTE:
{NOME_FORMANDO}, pessoa física, inscrito(a) no CPF sob o nº {CPF_FORMANDO}, e-mail {EMAIL_FORMANDO}, telefone {TELEFONE_FORMANDO}, residente e domiciliado(a) em {ENDERECO_FORMANDO}, aluno(a) da turma {NOME_TURMA} ({INSTITUICAO}) - {CURSO}.

A WM2 Produções & Eventos declara, para os devidos fins de direito, que o(a) formando(a) {NOME_FORMANDO}, inscrito(a) no CPF sob o nº {CPF_FORMANDO}, integrante da turma {NOME_TURMA}, efetuou a quitação integral do saldo referente ao pacote {PACOTE_SELECIONADO}, no montante total de {VALOR_TOTAL}.

STATUS FINANCEIRO REGISTRADO: {SITUACAO_FINANCEIRA} (Total Pago: {VALOR_PAGO})
CÓDIGO DE ACESSO DO ALUNO: {CODIGO_ALUNO}

Pelo presente termo, o(a) formando(a) confirma o recebimento dos convites, pulseiras e credenciais relativas aos eventos festivos de sua formatura, nada mais tendo a reclamar sobre o contrato de adesão.

Dado e passado em São Paulo, no dia {DATA_HOJE}.`
  },
  {
    id: 'termo_aditivo',
    title: 'Termo Aditivo - Convites Extras & Mesa Preferencial',
    category: 'Termo Aditivo',
    description: 'Aditivo para inclusão de convites extras, escolha de mesa no baile ou alteração de pacote.',
    content: `TERMO ADITIVO AO CONTRATO DE ADESÃO DE FORMATURA

CONTRATADA:
WM2 PRODUÇÕES & EVENTOS LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 12.345.678/0001-99, com sede na Alameda dos Eventos, nº 1000, São Paulo/SP.

CONTRATANTE:
{NOME_FORMANDO}, pessoa física, inscrito(a) no CPF sob o nº {CPF_FORMANDO}, e-mail {EMAIL_FORMANDO}, telefone {TELEFONE_FORMANDO}, residente e domiciliado(a) em {ENDERECO_FORMANDO}, integrante da turma {NOME_TURMA} ({INSTITUICAO}).

As partes acima qualificadas resolvem aditar o contrato principal de adesão referente à formatura da turma {NOME_TURMA}, mediante as seguintes cláusulas:

CLÁUSULA 1ª - DAS ALTERAÇÕES SOLICITADAS
Fica registrada a solicitação e inclusão de itens adicionais ao pacote do(a) CONTRATANTE ({PACOTE_SELECIONADO}), com ajuste nos valores totais contratados para {VALOR_TOTAL} (Total pago: {VALOR_PAGO}).

CLÁUSULA 2ª - RATIFICAÇÃO
Permanecem inalteradas e ratificadas todas as demais cláusulas e condições do contrato original que não colidirem com o presente aditivo.

São Paulo, {DATA_HOJE}.`
  }
];

interface ContractPdfGeneratorProps {
  formandos?: Formando[];
  turmas?: Turma[];
  initialStudentId?: string | null;
  onClose?: () => void;
}

export const ContractPdfGenerator: React.FC<ContractPdfGeneratorProps> = ({
  formandos = [],
  turmas = [],
  initialStudentId,
  onClose
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (formandos && formandos.length > 0 ? formandos[0].id : '')
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('adesao_padrao');
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'comissao'>('all');
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'settings'>('preview');

  // Customization Options
  const [docTheme, setDocTheme] = useState<DocumentTheme>('wm2_gold');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [showStamp, setShowStamp] = useState<boolean>(true);

  const [studentContracts, setStudentContracts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('wm2_student_contracts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pdfPreviewRef = useRef<HTMLDivElement>(null);

  // Load saved templates from localStorage or fallback to defaults
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('wm2_contract_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((t: any) => t.content.includes('• Nome Completo:') || t.content.includes('• Turma:'))) {
          localStorage.setItem('wm2_contract_templates', JSON.stringify(DEFAULT_TEMPLATES));
          return DEFAULT_TEMPLATES;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEMPLATES;
  });

  // Current active template
  const currentTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Selected Student & Turma details
  const currentStudent = useMemo(() => {
    return formandos.find(f => f.id === selectedStudentId) || formandos[0];
  }, [formandos, selectedStudentId]);

  const currentTurma = useMemo(() => {
    if (!currentStudent) return null;
    return turmas.find(t => t.id === currentStudent.turmaId) || null;
  }, [turmas, currentStudent]);

  // Filter students based on search, turma, and status
  const filteredStudents = useMemo(() => {
    return formandos.filter(f => {
      const matchesTurma = selectedTurmaFilter === 'all' || f.turmaId === selectedTurmaFilter;
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'comissao' ? f.role === 'comissao' :
        f.status === 'Ativo';
      const matchesSearch = searchQueryMatches(f, searchStudentQuery);
      return matchesTurma && matchesStatus && matchesSearch;
    });
  }, [formandos, selectedTurmaFilter, statusFilter, searchStudentQuery]);

  function searchQueryMatches(f: Formando, query: string) {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const t = turmas.find(turma => turma.id === f.turmaId);
    return (
      f.name.toLowerCase().includes(q) ||
      f.cpf.includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.studentCode && f.studentCode.toLowerCase().includes(q)) ||
      (t && t.name.toLowerCase().includes(q))
    );
  }

  // Sync edited content when template changes
  React.useEffect(() => {
    if (currentTemplate) {
      setEditedContent(currentTemplate.content);
      setCustomTitle(currentTemplate.title);
    }
  }, [currentTemplate]);

  // Helper formatting function for BRL
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Replace variable tags with actual data
  const filledContractContent = useMemo(() => {
    let rawText = editedContent || currentTemplate?.content || '';

    const todayStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const studentName = currentStudent?.name || 'FORMANDO NÃO SELECIONADO';
    const studentCpf = currentStudent?.cpf || '000.000.000-00';
    const studentEmail = currentStudent?.email || 'email@exemplo.com';
    const studentPhone = currentStudent?.phone || '(00) 00000-0000';
    const studentAddress = currentStudent?.address || 'Endereço não cadastrado';
    const studentCode = currentStudent?.studentCode || 'WM2-ALUNO';
    const studentRole = currentStudent?.role === 'comissao' ? 'Membro da Comissão de Formatura' : 'Formando Aderente';

    const turmaName = currentTurma?.name || 'Turma não atribuída';
    const instituicao = currentTurma?.institution || 'Instituição de Ensino';
    const curso = currentTurma?.individualCourse || currentTurma?.individualService || 'Curso de Graduação';
    const anoFormatura = currentTurma?.year ? String(currentTurma.year) : '2026';
    const numContratoTurma = currentTurma?.contractNumber || 'WM2-2026-TURMA';

    const pacote = currentStudent?.packageSelected || currentTurma?.individualService || 'Pacote Completo de Formatura';
    const valorTotal = currentStudent ? formatBRL(currentStudent.totalDue) : 'R$ 0,00';
    const valorPago = currentStudent ? formatBRL(currentStudent.totalPaid) : 'R$ 0,00';
    const valorPendente = currentStudent ? formatBRL(Math.max(0, currentStudent.totalDue - currentStudent.totalPaid)) : 'R$ 0,00';
    const situacaoFin = currentStudent?.status === 'Ativo' ? 'Em dia (Adimplente)' : currentStudent?.status === 'Pendente' ? 'Aguardando quitação' : 'Pendente / Inadimplente';

    const replacements: Record<string, string> = {
      '{NOME_FORMANDO}': studentName,
      '{CPF_FORMANDO}': studentCpf,
      '{EMAIL_FORMANDO}': studentEmail,
      '{TELEFONE_FORMANDO}': studentPhone,
      '{ENDERECO_FORMANDO}': studentAddress,
      '{CODIGO_ALUNO}': studentCode,
      '{ROLE_FORMANDO}': studentRole,
      '{NOME_TURMA}': turmaName,
      '{CURSO}': curso,
      '{INSTITUICAO}': instituicao,
      '{ANO_FORMATURA}': anoFormatura,
      '{NUMERO_CONTRATO_TURMA}': numContratoTurma,
      '{PACOTE_SELECIONADO}': pacote,
      '{VALOR_TOTAL}': valorTotal,
      '{VALOR_PAGO}': valorPago,
      '{VALOR_PENDENTE}': valorPendente,
      '{SITUACAO_FINANCEIRA}': situacaoFin,
      '{DATA_HOJE}': todayStr,
      '{EMPRESA_NOME}': 'WM2 PRODUÇÕES & EVENTOS LTDA.',
      '{EMPRESA_CNPJ}': '12.345.678/0001-99'
    };

    Object.entries(replacements).forEach(([tag, value]) => {
      const regex = new RegExp(tag.replace(/[{}]/g, '\\$&'), 'g');
      rawText = rawText.replace(regex, value);
    });

    return rawText;
  }, [editedContent, currentTemplate, currentStudent, currentTurma]);

  // Available tags structured by category
  const categorizedTags = [
    {
      category: 'Formando',
      tags: [
        { tag: '{NOME_FORMANDO}', label: 'Nome Completo' },
        { tag: '{CPF_FORMANDO}', label: 'CPF' },
        { tag: '{EMAIL_FORMANDO}', label: 'E-mail' },
        { tag: '{TELEFONE_FORMANDO}', label: 'Telefone' },
        { tag: '{ENDERECO_FORMANDO}', label: 'Endereço' },
        { tag: '{CODIGO_ALUNO}', label: 'Código Acesso' },
        { tag: '{ROLE_FORMANDO}', label: 'Cargo (Comissão)' }
      ]
    },
    {
      category: 'Turma & Evento',
      tags: [
        { tag: '{NOME_TURMA}', label: 'Nome da Turma' },
        { tag: '{INSTITUICAO}', label: 'Faculdade / Instituição' },
        { tag: '{CURSO}', label: 'Curso' },
        { tag: '{ANO_FORMATURA}', label: 'Ano da Formatura' },
        { tag: '{NUMERO_CONTRATO_TURMA}', label: 'Nº Contrato Turma' }
      ]
    },
    {
      category: 'Valores & Contrato',
      tags: [
        { tag: '{PACOTE_SELECIONADO}', label: 'Pacote Contratado' },
        { tag: '{VALOR_TOTAL}', label: 'Valor Total' },
        { tag: '{VALOR_PAGO}', label: 'Valor Pago' },
        { tag: '{VALOR_PENDENTE}', label: 'Saldo Pendente' },
        { tag: '{SITUACAO_FINANCEIRA}', label: 'Status Financeiro' },
        { tag: '{DATA_HOJE}', label: 'Data Atual' }
      ]
    }
  ];

  const handleInsertTag = (tag: string) => {
    setEditedContent(prev => prev + ' ' + tag + ' ');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(filledContractContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleNativePrint = () => {
    window.print();
  };

  // High resolution PDF generation using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!pdfPreviewRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = pdfPreviewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Contrato_WM2_${currentStudent ? currentStudent.name.replace(/\s+/g, '_') : 'Formando'}_${currentTemplate.id}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o arquivo PDF. Utilize a opção "Imprimir / Salvar PDF" para salvar via navegador.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSaveTemplateChanges = () => {
    const updated = templates.map(t => {
      if (t.id === selectedTemplateId) {
        return {
          ...t,
          title: customTitle || t.title,
          content: editedContent
        };
      }
      return t;
    });
    setTemplates(updated);
    try {
      localStorage.setItem('wm2_contract_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    alert('Modelo de contrato salvo com sucesso!');
  };

  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendToPortal = () => {
    if (!currentStudent) return;
    const newContract = {
      id: `contract-${currentStudent.id}-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      title: customTitle || currentTemplate?.title || 'Contrato Oficial de Formatura',
      content: filledContractContent,
      templateId: selectedTemplateId,
      theme: docTheme,
      totalDue: currentStudent.totalDue || 0,
      sentAt: new Date().toISOString(),
      status: 'Pendente'
    };

    try {
      const existing = localStorage.getItem('wm2_student_contracts');
      const parsed = existing ? JSON.parse(existing) : [];
      const filtered = parsed.filter((c: any) => !(c.studentId === currentStudent.id && c.title === newContract.title && c.status === 'Pendente'));
      const updated = [newContract, ...filtered];
      localStorage.setItem('wm2_student_contracts', JSON.stringify(updated));
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetTemplateToDefault = () => {
    if (confirm('Deseja restaurar as cláusulas padrão deste modelo?')) {
      const def = DEFAULT_TEMPLATES.find(d => d.id === selectedTemplateId);
      if (def) {
        setEditedContent(def.content);
        setCustomTitle(def.title);
      }
    }
  };

  // Font size mapping for preview document
  const fontSizeClass = 
    fontSize === 'sm' ? 'text-[11px] leading-relaxed' :
    fontSize === 'lg' ? 'text-[13px] leading-loose' :
    'text-[12px] leading-relaxed';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-neutral-900 text-neutral-100 rounded-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden border border-[#aa904f]/40 shadow-2xl">
        
        {/* TOP BAR HEADER */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-4 border-b border-[#aa904f]/30 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-20 py-1 px-2 rounded-xl bg-neutral-950/80 border border-[#aa904f]/40 flex items-center justify-center shadow-lg shrink-0">
              <Logo variant="light" showSubtitle={false} className="w-full h-auto" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#ffe29a] tracking-tight flex items-center gap-2">
                WM2 DocEngine • Módulo Oficial de Contratos em PDF
                <span className="bg-[#aa904f]/25 text-[#ffe29a] border border-[#aa904f]/50 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                  Pro PDF
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Preenchimento automático inteligente com dados cadastrais e financeiros do formando
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSendToPortal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Enviar contrato para o Portal do Aluno para Assinatura Eletrônica"
            >
              {sendSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Send className="w-4 h-4" />}
              {sendSuccess ? 'Enviado para Portal do Aluno!' : 'Enviar p/ Portal do Aluno'}
            </button>

            <button
              onClick={handleCopyText}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Copiar texto do contrato"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              {copySuccess ? 'Texto Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleNativePrint}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-4 h-4 text-blue-400" /> Imprimir / PDF
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-gradient-to-r from-[#f3e7c4] via-[#d2c595] to-[#aa904f] text-neutral-950 hover:brightness-110 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPdf ? 'Processando PDF...' : 'Baixar PDF de Alta Resolução'}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors ml-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-neutral-900">
          
          {/* LEFT SIDEBAR CONTROLS (4 Cols) */}
          <div className="lg:col-span-4 border-r border-neutral-800 p-4 sm:p-5 overflow-y-auto space-y-5 bg-neutral-950/70">
            
            {/* TAB SELECTOR: PREVIEW vs EDITOR vs SETTINGS */}
            <div className="bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-[#d2c595] to-[#aa904f] text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Pré-visualizar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-gradient-to-r from-[#d2c595] to-[#aa904f] text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Cláusulas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-[#d2c595] to-[#aa904f] text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Layout
              </button>
            </div>

            {/* STEP 1: MODELO DE DOCUMENTO */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#ffe29a] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#aa904f]" /> 1. Modelo do Contrato:
                </span>
                <span className="text-[10px] font-normal text-neutral-400">
                  {templates.length} modelos disponíveis
                </span>
              </label>

              <div className="grid grid-cols-1 gap-1.5">
                {templates.map(tmpl => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-[#ffe29a] text-white shadow-md ring-1 ring-[#ffe29a]/40'
                          : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <div className="font-bold flex items-center gap-2 text-neutral-100">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-neutral-600'}`} />
                          {tmpl.title}
                        </div>
                        <p className="text-[10.5px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase bg-neutral-800 text-[#ffe29a] border border-[#aa904f]/30 px-2 py-0.5 rounded-full shrink-0">
                        {tmpl.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: SELEÇÃO DE FORMANDO */}
            <div className="space-y-2.5 pt-3 border-t border-neutral-800/80">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-[#ffe29a] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#aa904f]" /> 2. Formando Selecionado:
                </label>
                <span className="text-[10px] font-bold text-neutral-400">
                  {filteredStudents.length} resultado(s)
                </span>
              </div>

              {/* Filters & Search */}
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <select
                    value={selectedTurmaFilter}
                    onChange={(e) => setSelectedTurmaFilter(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700/80 text-neutral-200 p-2 rounded-xl text-xs font-medium focus:outline-none focus:border-[#aa904f]"
                  >
                    <option value="all">Todas as Turmas ({formandos.length})</option>
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-neutral-900 border border-neutral-700/80 text-neutral-200 p-2 rounded-xl text-xs font-medium focus:outline-none focus:border-[#aa904f]"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="ativo">Ativos</option>
                    <option value="comissao">Comissão</option>
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar nome, CPF ou código..."
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700/80 pl-8 pr-3 py-2 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#aa904f]"
                  />
                </div>
              </div>

              {/* Formando List Dropdown */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-neutral-800 rounded-xl p-1.5 bg-neutral-900/60">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500">
                    Nenhum formando localizado.
                  </div>
                ) : (
                  filteredStudents.map(std => {
                    const isSelected = std.id === selectedStudentId;
                    const stdTurma = turmas.find(t => t.id === std.turmaId);
                    const stdContracts = studentContracts.filter(c => c.studentId === std.id);
                    const signedContract = stdContracts.find(c => c.status === 'Assinado');

                    return (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => setSelectedStudentId(std.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#aa904f]/30 via-neutral-900 to-neutral-900 border-[#ffe29a] text-white shadow-sm'
                            : 'bg-neutral-900/80 border-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold truncate flex items-center gap-1.5 text-neutral-100">
                            {std.name}
                            {std.role === 'comissao' && (
                              <span className="text-[8.5px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0">
                                Comissão
                              </span>
                            )}
                            {signedContract && (
                              <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded shrink-0 flex items-center gap-0.5 ${
                                signedContract.isNewSignature
                                  ? 'bg-emerald-500 text-white animate-pulse shadow-2xs'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {signedContract.isNewSignature ? '✨ Novo Assinado' : 'Assinado'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                            CPF: {std.cpf || 'Não inf.'} • {stdTurma ? stdTurma.name.split(' - ')[0] : 'Sem turma'}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10.5px] font-extrabold text-emerald-400 block">
                            {formatBRL(std.totalDue)}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {std.studentCode || 'WM2-ALUNO'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* TAB: EDITOR CLAUSES & TAGS */}
            {activeTab === 'editor' && (
              <div className="space-y-4 pt-3 border-t border-neutral-800">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-neutral-300 uppercase">
                      Tags para Inserção Automática:
                    </label>
                    <button
                      type="button"
                      onClick={handleResetTemplateToDefault}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Restaurar Padrão
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {categorizedTags.map(cat => (
                      <div key={cat.category} className="space-y-1">
                        <span className="text-[9.5px] font-extrabold text-[#aa904f] uppercase tracking-wider block">
                          {cat.category}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.tags.map(item => (
                            <button
                              key={item.tag}
                              type="button"
                              onClick={() => handleInsertTag(item.tag)}
                              className="bg-neutral-800/90 hover:bg-[#aa904f]/30 hover:border-[#aa904f] border border-neutral-700/80 text-neutral-200 text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer"
                              title={`Inserir ${item.label}`}
                            >
                              + {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveTemplateChanges}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" /> Salvar Cláusulas para este Modelo
                  </button>
                </div>
              </div>
            )}

            {/* TAB: LAYOUT & DESIGN SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-4 pt-3 border-t border-neutral-800">
                <div>
                  <label className="text-[11px] font-bold text-[#ffe29a] uppercase tracking-wider block mb-2">
                    Estilo Visual do Documento:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'wm2_gold', name: 'Gala Ouro WM2 (Solenidade de Luxo)', desc: 'Moldura dourada com selo oficial e alta sofisticação' },
                      { id: 'executive_dark', name: 'Executivo Corporativo', desc: 'Design moderno e limpo com cabeçalho sóbrio' },
                      { id: 'classic_serif', name: 'Solenidade Clássica (Jurídico)', desc: 'Formatado no padrão clássico de imprensa e cartórios' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setDocTheme(theme.id as any)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                          docTheme === theme.id
                            ? 'bg-neutral-900 border-[#ffe29a] text-white shadow-md'
                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Palette className={`w-4 h-4 shrink-0 mt-0.5 ${docTheme === theme.id ? 'text-amber-400' : 'text-neutral-500'}`} />
                        <div>
                          <div className="font-bold">{theme.name}</div>
                          <p className="text-[10px] text-neutral-400">{theme.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase block">
                    Tamanho da Fonte das Cláusulas:
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'sm', label: 'Pequena (Compacta)' },
                      { id: 'md', label: 'Média (Padrão)' },
                      { id: 'lg', label: 'Grande (Legibilidade)' }
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setFontSize(sz.id as any)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          fontSize === sz.id
                            ? 'bg-[#aa904f] text-neutral-950 border-[#ffe29a]'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                        }`}
                      >
                        {sz.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase block">
                    Elementos de Segurança & Estética:
                  </label>
                  
                  <div className="space-y-1.5 text-xs text-neutral-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showWatermark}
                        onChange={(e) => setShowWatermark(e.target.checked)}
                        className="rounded border-neutral-700 text-[#aa904f] focus:ring-[#aa904f]"
                      />
                      Exibir Marca D'água "WM2 PRODUÇÕES"
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showQrCode}
                        onChange={(e) => setShowQrCode(e.target.checked)}
                        className="rounded border-neutral-700 text-[#aa904f] focus:ring-[#aa904f]"
                      />
                      Exibir QR Code de Autenticidade Digital
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showStamp}
                        onChange={(e) => setShowStamp(e.target.checked)}
                        className="rounded border-neutral-700 text-[#aa904f] focus:ring-[#aa904f]"
                      />
                      Exibir Carimbo de Validação de Registro
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSignatures}
                        onChange={(e) => setShowSignatures(e.target.checked)}
                        className="rounded border-neutral-700 text-[#aa904f] focus:ring-[#aa904f]"
                      />
                      Exibir Blocos de Assinatura Oficial
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* MAPPED STUDENT SUMMARY BADGE */}
            {currentStudent && (
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <label className="text-[11px] font-black text-[#ffe29a] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Vínculo Ativo com Sistema:
                </label>
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Formando:</span>
                    <span className="font-bold text-neutral-100">{currentStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">CPF:</span>
                    <span className="font-mono text-neutral-200">{currentStudent.cpf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Turma:</span>
                    <span className="font-bold text-amber-300">{currentTurma?.name || 'Geral'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Pacote / Valor:</span>
                    <span className="font-bold text-emerald-400">
                      {formatBRL(currentStudent.totalDue)}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT VIEWPORT: LIVE PDF DOCUMENT PREVIEW OR EDITOR (8 Cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 overflow-y-auto bg-neutral-950 flex flex-col items-center justify-start">
            
            {activeTab === 'editor' ? (
              /* EDITOR MODE */
              <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div>
                  <label className="block text-xs font-extrabold text-[#ffe29a] mb-1">Título do Documento:</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#aa904f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#ffe29a] mb-1">Redação das Cláusulas (com Variáveis Inteligentes):</label>
                  <textarea
                    rows={18}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 p-3.5 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:border-[#aa904f]"
                  />
                </div>
              </div>
            ) : (
              /* PDF DOCUMENT PREVIEW MODE (PRINT & CANVAS TARGET) */
              <div className="w-full flex flex-col items-center">
                
                {/* TOOLBAR OVER PREVIEW */}
                <div className="w-full max-w-[210mm] mb-3 flex flex-wrap items-center justify-between text-neutral-400 text-xs px-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-neutral-300">
                      Documento A4 Formatado para Impressão e Assinatura Eletrônica
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800 text-amber-300 font-bold">
                      Tema: {docTheme === 'wm2_gold' ? 'Gala Ouro' : docTheme === 'executive_dark' ? 'Executivo' : 'Solenidade'}
                    </span>
                  </div>
                </div>

                {/* THE A4 PRINTABLE CANVAS CONTAINER */}
                <div 
                  ref={pdfPreviewRef}
                  id="printable-contract-document"
                  className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-neutral-900 p-10 sm:p-14 shadow-2xl rounded-sm relative flex flex-col justify-between print:p-8 print:shadow-none print:w-full print:max-w-none transition-all ${
                    docTheme === 'wm2_gold' ? 'border-4 border-[#aa904f]' :
                    docTheme === 'executive_dark' ? 'border-t-8 border-t-neutral-900 border-x border-b border-neutral-300' :
                    'border border-neutral-300'
                  }`}
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  
                  {/* WATERMARK */}
                  {showWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none">
                      <div className="w-[220px] transform rotate-[-25deg]">
                        <Logo variant="dark" showSubtitle={true} className="w-full h-auto" />
                      </div>
                    </div>
                  )}

                  <div>
                    {/* DOCUMENT HEADER WITH WM2 LOGO */}
                    <div className={`pb-6 mb-8 flex justify-between items-start gap-4 ${
                      docTheme === 'wm2_gold' ? 'border-b-2 border-[#aa904f]' :
                      docTheme === 'executive_dark' ? 'border-b-2 border-neutral-900' :
                      'border-b border-neutral-400'
                    }`}>
                      <div className="flex items-start gap-3.5">
                        <div className="w-22 shrink-0 pt-0.5">
                          <Logo variant="color" showSubtitle={true} className="w-full h-auto" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-sans font-extrabold text-neutral-500 uppercase tracking-widest">
                              Eventos & Formaturas Premium
                            </span>
                          </div>
                          <h1 className="text-[18px] font-sans font-normal text-neutral-900 tracking-tight leading-tight">
                            {customTitle || currentTemplate?.title || 'Contrato Oficial de Formatura'}
                          </h1>
                          <p className="text-[11px] font-sans text-neutral-600 mt-0.5 font-medium">
                            Documento Oficial Registrado • Validação Eletrônica WM2 DocEngine
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-sans">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Nº do Registro / Contrato
                        </div>
                        <div className="text-xs font-mono font-bold text-neutral-800 mt-0.5">
                          {currentTurma?.contractNumber || 'WM2-2026'}-{currentStudent?.id ? currentStudent.id.substring(0, 6).toUpperCase() : 'DOC'}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1 font-semibold">
                          Emissão: {new Date().toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* FILLED CONTRACT BODY TEXT */}
                    <div className={`text-neutral-800 whitespace-pre-wrap font-sans space-y-4 text-justify ${fontSizeClass}`}>
                      {filledContractContent}
                    </div>

                    {/* OFFICIAL SIGNATURE BLOCKS */}
                    {showSignatures && (
                      <div className="mt-14 pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 font-sans">
                        <div className="text-center space-y-2">
                          <div className="border-b border-neutral-800 pb-1 h-12 flex items-end justify-center">
                            <span className="text-[10px] text-neutral-400 italic">
                              Assinado Digitalmente via Portal WM2
                            </span>
                          </div>
                          <div className="font-bold text-xs text-neutral-900">
                            {currentStudent?.name || 'CONTRATANTE'}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            CPF: {currentStudent?.cpf || '000.000.000-00'} • Contratante
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <div className="border-b border-neutral-800 pb-1 h-12 flex items-end justify-center">
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> WM2 Produções & Eventos LTDA.
                            </span>
                          </div>
                          <div className="font-bold text-xs text-neutral-900">
                            WM2 PRODUÇÕES & EVENTOS
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            CNPJ 12.345.678/0001-99 • Contratada
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DOCUMENT FOOTER & OFFICIAL SEAL */}
                  <div className="pt-8 border-t border-neutral-200 mt-10 font-sans text-[10px] text-neutral-500 flex justify-between items-end gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-neutral-700">
                        WM2 Produções & Eventos LTDA. • CNPJ 12.345.678/0001-99
                      </p>
                      <p>Alameda dos Eventos, 1000 - São Paulo/SP • Central: suporte@wm2eventos.com.br</p>
                      <p className="text-[9px] text-neutral-400">
                        Documento emitido automaticamente pelo WM2 DocEngine em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {showStamp && (
                        <div className="text-center border-2 border-dashed border-[#aa904f] p-2 rounded-lg bg-amber-50/40">
                          <div className="text-[8px] font-black uppercase text-[#543d03]">SELO DE REGISTRO</div>
                          <div className="text-[9px] font-bold text-neutral-800">AUTENTICADO</div>
                          <div className="text-[7.5px] font-mono text-neutral-500">WM2-REG-2026</div>
                        </div>
                      )}

                      {showQrCode && (
                        <div className="flex items-center gap-2 border border-neutral-300 p-2 rounded-lg bg-neutral-50">
                          <QrCode className="w-8 h-8 text-neutral-900" />
                          <div className="text-left text-[8.5px]">
                            <span className="font-bold text-neutral-800 block">Validação Digital</span>
                            <span className="text-neutral-500 font-mono block">wm2.app/v/{currentStudent?.id?.substring(0, 8) || '2026'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
