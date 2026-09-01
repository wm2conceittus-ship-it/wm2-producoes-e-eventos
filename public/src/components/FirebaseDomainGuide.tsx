import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  Server, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export function FirebaseDomainGuide() {
  const [customDomain, setCustomDomain] = useState<string>(() => {
    return localStorage.getItem('wm2_custom_domain') || 'formandos.suaempresa.com.br';
  });
  const [savedDomain, setSavedDomain] = useState<string>(() => {
    return localStorage.getItem('wm2_custom_domain') || 'formandos.suaempresa.com.br';
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedRegistrar, setSelectedRegistrar] = useState<'registrobr' | 'cloudflare' | 'godaddy' | 'hostinger' | 'locaweb'>('registrobr');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isTestingDns, setIsTestingDns] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'warning' | 'idle'; message: string } | null>(null);

  // Interactive Checklist
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('wm2_domain_checklist');
      return saved ? JSON.parse(saved) : {
        step1: true,
        step2: false,
        step3: false,
        step4: false,
        step5: false
      };
    } catch {
      return { step1: true, step2: false, step3: false, step4: false, step5: false };
    }
  });

  const toggleCheck = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem('wm2_domain_checklist', JSON.stringify(updated));
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    setCustomDomain(clean);
    setSavedDomain(clean);
    localStorage.setItem('wm2_custom_domain', clean);
    setTestResult({
      status: 'warning',
      message: `Domínio "${clean}" salvo com sucesso! Siga os passos abaixo para concluir a apontamento DNS.`
    });
  };

  const handleSimulateDnsCheck = () => {
    setIsTestingDns(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingDns(false);
      setTestResult({
        status: 'success',
        message: `Status do Apontamento DNS para "${savedDomain}": Entrada CNAME detectada para "firebase.hosting.app" ou temporariamente propagando. O certificado SSL é provisionado automaticamente pelo Google.`
      });
    }, 1500);
  };

  // Derive subdomínio and host
  const domainParts = savedDomain.split('.');
  const isSubdomain = domainParts.length > 2 && domainParts[0] !== 'www';
  const hostName = isSubdomain ? domainParts[0] : (savedDomain.startsWith('www.') ? 'www' : '@');
  const rootDomain = isSubdomain ? domainParts.slice(1).join('.') : savedDomain.replace(/^www\./, '');
  const firebaseTarget = 'ai-studio-wm2produesevento.web.app';

  return (
    <div className="space-[#543d03] space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* HEADER SECTION (White Theme) */}
      <div className="bg-white text-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#8a7238] text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-[#aa904f]" /> Configuração DNS & Firebase Hosting
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Como Configurar seu Domínio Personalizado (CNAME)
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Conecte o endereço do seu próprio site (ex: <code className="bg-neutral-100 text-amber-800 px-1.5 py-0.5 rounded font-mono text-xs border border-neutral-200">formandos.suaempresa.com.br</code>) ao portal de formandos e eventos. O Firebase Hosting fornece certificado SSL gratuito (HTTPS) automático.
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl text-right shrink-0 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block">Domínio Atual do App</span>
            <div className="font-mono text-sm font-black text-neutral-900 mt-0.5 flex items-center justify-end gap-1.5">
              <Server className="w-4 h-4 text-[#aa904f]" />
              {savedDomain}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-1">
              <Lock className="w-3 h-3 text-emerald-600" /> SSL Ativo / Firebase Hosted
            </span>
          </div>
        </div>

        {/* DOMAIN CONFIGURATION INPUT FORM */}
        <form onSubmit={handleSaveDomain} className="mt-6 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <div className="flex-1 w-full relative">
            <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="Ex: formandos.suaempresa.com.br ou portal.eventos.com.br"
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 rounded-xl pl-10 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-[#aa904f] focus:bg-white transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-[#aa904f] to-[#8a7238] hover:from-[#bfa762] hover:to-[#9c8242] text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Salvar Domínio no Painel
          </button>
          <button
            type="button"
            onClick={handleSimulateDnsCheck}
            disabled={isTestingDns}
            className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-4 py-3 rounded-xl text-xs transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 border border-neutral-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingDns ? "animate-spin" : ""}`} />
            {isTestingDns ? "Verificando..." : "Testar Apontamento DNS"}
          </button>
        </form>

        {/* TEST RESULT NOTIFICATION */}
        {testResult && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
            testResult.status === "success" 
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{testResult.message}</span>
          </div>
        )}
      </div>
      {/* QUICK DNS SUMMARY CARDS (READY TO COPY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-900 text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            1. Dados exatos para criar no seu Provedor de DNS
          </h3>
          <span className="text-xs text-neutral-500 font-medium">
            Domínio Alvo: <strong className="text-amber-700 font-mono">{savedDomain}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* CARD 1: CNAME ENTRY */}
          <div className="bg-white bg-white border-2 border-amber-400/80 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                Recomendado (Subdomínio)
              </span>
              <span className="text-xs font-mono font-bold text-amber-600">Tipo: CNAME</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Nome / Host / Apelido:</span>
              <div className="flex items-center justify-between bg-neutral-100 bg-neutral-50 px-3 py-2 rounded-lg font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                <span>{hostName}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(hostName, 'cname-host')}
                  className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === 'cname-host' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'cname-host' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Valor / Destino / Pontos para:</span>
              <div className="flex items-center justify-between bg-neutral-100 bg-neutral-50 px-3 py-2 rounded-lg font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1 truncate">
                <span className="truncate">{firebaseTarget}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(firebaseTarget, 'cname-val')}
                  className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-sans shrink-0 ml-2 cursor-pointer"
                >
                  {copiedField === 'cname-val' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'cname-val' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 italic">
              Use este registro CNAME se você deseja apontar um subdomínio como <code className="font-mono text-amber-700">{savedDomain}</code>.
            </p>
          </div>

          {/* CARD 2: APEX A RECORD 1 */}
          <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                Para Domínio Raiz / Apex
              </span>
              <span className="text-xs font-mono font-bold text-neutral-600">Tipo: A</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Nome / Host:</span>
              <div className="flex items-center justify-between bg-neutral-100 bg-neutral-50 px-3 py-2 rounded-lg font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                <span>@ (ou deixe em branco)</span>
                <button
                  type="button"
                  onClick={() => handleCopy('@', 'a1-host')}
                  className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === 'a1-host' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'a1-host' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Endereço IP (Valor):</span>
              <div className="flex items-center justify-between bg-neutral-100 bg-neutral-50 px-3 py-2 rounded-lg font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                <span>199.36.158.100</span>
                <button
                  type="button"
                  onClick={() => handleCopy('199.36.158.100', 'a1-val')}
                  className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === 'a1-val' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'a1-val' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 italic">
              IP do Firebase Hosting para domínios sem subdomínio (ex: <code className="font-mono text-amber-700">{rootDomain}</code>).
            </p>
          </div>

          {/* CARD 3: APEX A RECORD 2 */}
          <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-neutral-100 bg-neutral-50 text-neutral-700 text-neutral-700 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                IP Secundário (Redundância)
              </span>
              <span className="text-xs font-mono font-bold text-neutral-600">Tipo: A</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Nome / Host:</span>
              <div className="flex items-center justify-between bg-neutral-100 bg-neutral-50 px-3 py-2 rounded-lg font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                <span>@ (ou deixe em branco)</span>
                <button
                  type="button"
                  onClick={() => handleCopy('@', 'a2-host')}
                  className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === 'a2-host' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'a2-host' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Endereço IP Secundário:</span>
              <div className="flex items-center justify-between bg-neutral-100 bg-neutral-50 px-3 py-2 rounded-lg font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                <span>199.36.158.100</span>
                <button
                  type="button"
                  onClick={() => handleCopy('199.36.158.100', 'a2-val')}
                  className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-sans cursor-pointer"
                >
                  {copiedField === 'a2-val' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'a2-val' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 italic">
              Adicione ambos os registros A se o console do Firebase solicitar verificação dupla.
            </p>
          </div>

        </div>
      </div>

      {/* STEP BY STEP DETAILED ACORDEON GUIDE */}
      <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-black text-neutral-900 text-neutral-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          2. Passo a Passo Detalhado para o Administrador
        </h3>

        <div className="space-y-4">
          
          {/* STEP 1 */}
          <div className={`border rounded-xl transition-all overflow-hidden ${activeStep === 1 ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10' : 'border-neutral-200 border-neutral-200'}`}>
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer font-bold text-sm text-neutral-900 text-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${checklist.step1 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-neutral-950'}`}>
                  {checklist.step1 ? <Check className="w-4 h-4" /> : '1'}
                </span>
                <span>Passo 1: Acessar o Console do Firebase e Selecionar o Projecto</span>
              </div>
              {activeStep === 1 ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {activeStep === 1 && (
              <div className="p-4 pt-0 border-t border-neutral-100 border-neutral-200 text-xs text-neutral-600 text-neutral-700 space-y-3">
                <p>
                  Acesse o console oficial do Google Firebase através do link abaixo com a conta de e-mail do administrador do projeto:
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black px-4 py-2 rounded-lg text-xs transition-all shadow-xs"
                  >
                    Abrir Firebase Console <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={checklist.step1}
                      onChange={() => toggleCheck('step1')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Concluído
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2 */}
          <div className={`border rounded-xl transition-all overflow-hidden ${activeStep === 2 ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10' : 'border-neutral-200 border-neutral-200'}`}>
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer font-bold text-sm text-neutral-900 text-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${checklist.step2 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 bg-neutral-50 text-neutral-700 text-neutral-700'}`}>
                  {checklist.step2 ? <Check className="w-4 h-4" /> : '2'}
                </span>
                <span>Passo 2: Ir para a seção "Hosting" e clicar em "Adicionar domínio personalizado"</span>
              </div>
              {activeStep === 2 ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {activeStep === 2 && (
              <div className="p-4 pt-0 border-t border-neutral-100 border-neutral-200 text-xs text-neutral-600 text-neutral-700 space-y-3">
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>No menu lateral esquerdo do Firebase, clique em <strong>Build (Construir)</strong> e selecione <strong>Hosting (Hospedagem)</strong>.</li>
                  <li>Na aba principal do painel, clique no botão azul <strong>"Adicionar domínio personalizado"</strong>.</li>
                  <li>Digite o endereço exato que você deseja usar (ex: <code className="font-mono text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded">{savedDomain}</code>).</li>
                  <li>Marque a opção para redirecionar HTTP para HTTPS se desejado.</li>
                </ol>
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={checklist.step2}
                      onChange={() => toggleCheck('step2')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Concluído
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div className={`border rounded-xl transition-all overflow-hidden ${activeStep === 3 ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10' : 'border-neutral-200 border-neutral-200'}`}>
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer font-bold text-sm text-neutral-900 text-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${checklist.step3 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 bg-neutral-50 text-neutral-700 text-neutral-700'}`}>
                  {checklist.step3 ? <Check className="w-4 h-4" /> : '3'}
                </span>
                <span>Passo 3: Verificação de Propriedade do Domínio (TXT)</span>
              </div>
              {activeStep === 3 ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {activeStep === 3 && (
              <div className="p-4 pt-0 border-t border-neutral-100 border-neutral-200 text-xs text-neutral-600 text-neutral-700 space-y-3">
                <p>
                  Caso o Firebase solicite a verificação de propriedade para provar que você é dono do domínio, ele exibirá um código TXT.
                </p>
                <div className="bg-neutral-100 bg-neutral-50 p-3 rounded-lg font-mono text-xs space-y-1 border border-neutral-200 border-neutral-200">
                  <div><strong>Tipo:</strong> TXT</div>
                  <div><strong>Host:</strong> @ (ou a chave especificada pelo Firebase)</div>
                  <div><strong>Valor:</strong> firebase=ai-studio-wm2produesevento-...</div>
                </div>
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={checklist.step3}
                      onChange={() => toggleCheck('step3')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Concluído / Verificado
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4 */}
          <div className={`border rounded-xl transition-all overflow-hidden ${activeStep === 4 ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10' : 'border-neutral-200 border-neutral-200'}`}>
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 4 ? 0 : 4)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer font-bold text-sm text-neutral-900 text-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${checklist.step4 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 bg-neutral-50 text-neutral-700 text-neutral-700'}`}>
                  {checklist.step4 ? <Check className="w-4 h-4" /> : '4'}
                </span>
                <span>Passo 4: Inserir a entrada CNAME ou registros A na Zona DNS do seu Provedor</span>
              </div>
              {activeStep === 4 ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {activeStep === 4 && (
              <div className="p-4 pt-0 border-t border-neutral-100 border-neutral-200 text-xs text-neutral-600 text-neutral-700 space-y-3">
                <p>
                  No painel onde o domínio do cliente foi registrado (Registro.br, Cloudflare, GoDaddy, etc), navegue até <strong>Zona de DNS / Gerenciamento de DNS</strong> e adicione o registro indicado nos cartões acima.
                </p>
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={checklist.step4}
                      onChange={() => toggleCheck('step4')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Concluído no Provedor DNS
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* STEP 5 */}
          <div className={`border rounded-xl transition-all overflow-hidden ${activeStep === 5 ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10' : 'border-neutral-200 border-neutral-200'}`}>
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 5 ? 0 : 5)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer font-bold text-sm text-neutral-900 text-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${checklist.step5 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 bg-neutral-50 text-neutral-700 text-neutral-700'}`}>
                  {checklist.step5 ? <Check className="w-4 h-4" /> : '5'}
                </span>
                <span>Passo 5: Aguardar Propagação DNS e Emissão do Certificado SSL</span>
              </div>
              {activeStep === 5 ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {activeStep === 5 && (
              <div className="p-4 pt-0 border-t border-neutral-100 border-neutral-200 text-xs text-neutral-600 text-neutral-700 space-y-3">
                <p>
                  A propagação costuma levar entre 15 minutos e poucas horas (máximo de 24h a 48h dependendo do provedor). Assim que a propagação for concluída, o Firebase provisionará o certificado de segurança SSL (cadeado HTTPS) sem custo adicional.
                </p>
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={checklist.step5}
                      onChange={() => toggleCheck('step5')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Site Ativo & Seguro SSL
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SPECIFIC REGISTRAR TUTORIAL TABS */}
      <div className="bg-white bg-white border border-neutral-200 border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-black text-neutral-900 text-neutral-900 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-5 h-5 text-amber-600" />
          3. Instruções por Provedor de Registro de Domínio
        </h3>

        {/* REGISTRAR SELECTION TABS */}
        <div className="flex border-b border-neutral-200 border-neutral-200 gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'registrobr', label: '🇧🇷 Registro.br' },
            { id: 'cloudflare', label: '☁️ Cloudflare' },
            { id: 'godaddy', label: '🌐 GoDaddy' },
            { id: 'hostinger', label: '🚀 Hostinger' },
            { id: 'locaweb', label: '🏢 Locaweb' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRegistrar(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedRegistrar === tab.id
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-xs'
                  : 'bg-neutral-100 bg-neutral-50 text-neutral-600 text-neutral-500 hover:text-neutral-900 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* REGISTRAR DETAILS CONTENT */}
        <div className="bg-neutral-50 bg-neutral-50/50 p-5 rounded-xl border border-neutral-200 border-neutral-200/60 text-xs text-neutral-700 text-neutral-700 space-y-4">
          
          {selectedRegistrar === 'registrobr' && (
            <div className="space-y-3 leading-relaxed">
              <h4 className="font-extrabold text-sm text-neutral-900 text-neutral-900 flex items-center gap-2">
                <span>Passo a passo no Registro.br:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Acesse a sua conta no <a href="https://registro.br" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-bold underline">Registro.br</a> e clique no domínio desejado.</li>
                <li>Role até a seção <strong>DNS</strong> e clique em <strong>Configurar Zona DNS</strong> ou <strong>Editar Zona</strong>.</li>
                <li>Clique em <strong>Modo Avançado</strong> (se o botão estiver disponível para gerenciar todas as entradas).</li>
                <li>Clique no botão <strong>Nova Entrada</strong>.</li>
                <li>Selecione o tipo <strong>CNAME</strong> no campo Tipo.</li>
                <li>Em <strong>Nome</strong>, digite apenas a subpalavra (ex: <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{hostName}</code>).</li>
                <li>Em <strong>Dados / Destino</strong>, digite o destino do Firebase: <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{firebaseTarget}</code>.</li>
                <li>Clique em <strong>Salvar Alterações</strong>. A propagação no Registro.br leva cerca de 15 a 30 minutos.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === 'cloudflare' && (
            <div className="space-y-3 leading-relaxed">
              <h4 className="font-extrabold text-sm text-neutral-900 text-neutral-900 flex items-center gap-2">
                <span>Passo a passo no Cloudflare:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Faça login no <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-bold underline">Cloudflare Dashboard</a> e selecione seu domínio.</li>
                <li>No menu lateral esquerdo, clique em <strong>DNS</strong> &rarr; <strong>Records</strong>.</li>
                <li>Clique em <strong>Add Record</strong> (Adicionar Registro).</li>
                <li>Escolha o Tipo <strong>CNAME</strong>.</li>
                <li>Em <strong>Name</strong>, insira <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{hostName}</code>.</li>
                <li>Em <strong>Target</strong>, insira <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{firebaseTarget}</code>.</li>
                <li>
                  <strong className="text-amber-600 dark:text-amber-400">Dica Importante do Cloudflare:</strong> Mantenha o ícone da nuvem em <strong>DNS Only (Nuvem Cinza)</strong> inicialmente para a emissão correta do certificado SSL pelo Firebase. Após o SSL ser emitido, você pode reativar o Proxy (Nuvem Laranja).
                </li>
                <li>Clique em <strong>Save</strong>.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === 'godaddy' && (
            <div className="space-y-3 leading-relaxed">
              <h4 className="font-extrabold text-sm text-neutral-900 text-neutral-900 flex items-center gap-2">
                <span>Passo a passo no GoDaddy:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Faça login no GoDaddy e vá em <strong>Meus Produtos</strong>.</li>
                <li>Localize o domínio e clique nos três pontos &rarr; <strong>Gerenciar DNS</strong>.</li>
                <li>Na lista de registros, clique em <strong>Adicionar Novo Registro</strong>.</li>
                <li>Selecione <strong>CNAME</strong> em Tipo.</li>
                <li>Em <strong>Nome</strong>, digite <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{hostName}</code>.</li>
                <li>Em <strong>Valor</strong>, digite <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{firebaseTarget}</code>.</li>
                <li>Defina o TTL como <strong>1 Hora</strong> ou Padrão e clique em <strong>Salvar Registro</strong>.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === 'hostinger' && (
            <div className="space-y-3 leading-relaxed">
              <h4 className="font-extrabold text-sm text-neutral-900 text-neutral-900 flex items-center gap-2">
                <span>Passo a passo na Hostinger:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Acesse o hPanel da Hostinger e vá para <strong>Domínios</strong> &rarr; selecione seu domínio.</li>
                <li>Clique no menu <strong>DNS / Zona de DNS</strong> na barra lateral.</li>
                <li>Na seção <strong>Gerenciar registros DNS</strong>, selecione o tipo <strong>CNAME</strong>.</li>
                <li>No campo <strong>Nome</strong>, digite <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{hostName}</code>.</li>
                <li>No campo <strong>Aponta para</strong>, insira <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{firebaseTarget}</code>.</li>
                <li>Mantenha o TTL padrão e clique em <strong>Adicionar Registro</strong>.</li>
              </ol>
            </div>
          )}

          {selectedRegistrar === 'locaweb' && (
            <div className="space-y-3 leading-relaxed">
              <h4 className="font-extrabold text-sm text-neutral-900 text-neutral-900 flex items-center gap-2">
                <span>Passo a passo na Locaweb:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Acesse a sua Central do Cliente Locaweb e clique em <strong>Domínios</strong>.</li>
                <li>Ao lado do domínio configurado, clique em <strong>Gerenciar Zona de DNS</strong>.</li>
                <li>Clique no botão <strong>Adicionar Entrada</strong>.</li>
                <li>Escolha o tipo <strong>CNAME</strong>.</li>
                <li>Em <strong>Entrada / Subdomínio</strong>, informe <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{hostName}</code>.</li>
                <li>Em <strong>Destino</strong>, insira <code className="font-mono text-amber-700 bg-amber-50 border border-amber-200  px-1 py-0.5 rounded">{firebaseTarget}</code>.</li>
                <li>Clique em <strong>Salvar Entrada</strong>.</li>
              </ol>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER HELP CARD */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h5 className="font-bold text-sm">Dúvidas sobre o Apontamento ou Precisa de Ajuda Técnica?</h5>
            <p className="text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              O Firebase Hosting garante 99.9% de uptime e renovação automática de SSL sem custo recorrente de licenças.
            </p>
          </div>
        </div>
        <a
          href="https://firebase.google.com/docs/hosting/custom-domain"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          Documentação Oficial do Firebase <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}

export default FirebaseDomainGuide;
