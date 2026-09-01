import React, { useState, useEffect, useRef } from 'react';
import { loadState, saveState, INITIAL_VISITOR_TRACKING, INITIAL_GATEWAY_CONFIG } from './data/mockData';
import { Role, Turma, Formando, Parcela, Evento, Enquete, Foto, MuralItem, Fornecedor, Pacote, Reuniao, VisitorTracking, SiteVisitor, PaymentGatewayConfig } from './types';
import LandingPage from './components/LandingPage';
import StudentPortal from './components/StudentPortal';
import AdminPanel from './components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, AlertCircle, Cloud, CloudLightning, RefreshCw } from 'lucide-react';
import { db, cleanUndefined, optimizeStateForStorage } from './lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { injectTrackingScripts, extractUTMParameters } from './lib/pixelTracker';

export default function App() {
  // Load initial local/mock state on mount
  const [state, setState] = useState(() => loadState());
  
  // Keep a synchronous ref to current state to prevent race conditions during sync
  const stateRef = useRef(state);
  stateRef.current = state;

  // Active view role
  const [currentRole, setCurrentRole] = useState<Role>('public');
  
  // Logged-in student ID (for student/comissao views)
  const [currentStudentId, setCurrentStudentId] = useState<string | undefined>(undefined);

  // Connection and synchronization status
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => new Date());
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(() => {
    return localStorage.getItem('firebase_quota_exceeded') === 'true';
  });
  
  // Prevent saving local state to Firebase before the initial load/creation completes
  const isLoadedFromFirebase = useRef(false);

  const isQuotaExceededRef = useRef(isQuotaExceeded);
  isQuotaExceededRef.current = isQuotaExceeded;

  // Track the stringified JSON of the last saved/loaded state to prevent echo loops
  const lastSavedJsonRef = useRef<string>('');

  // Helper to check for Firebase quota / write exhaustion errors
  const isQuotaError = (err: any): boolean => {
    if (!err) return false;
    const message = (err.message || String(err)).toLowerCase();
    const code = (err.code || '').toLowerCase();
    return code.includes('resource-exhausted') || 
           code.includes('quota') ||
           message.includes('quota') || 
           message.includes('exhausted') || 
           message.includes('billing') ||
           message.includes('limit') ||
           message.includes('write stream') ||
           message.includes('queued writes');
  };

  // 1. Listen to real-time updates from Firebase Firestore with exponential backoff retry
  useEffect(() => {
    if (isQuotaExceeded) {
      isLoadedFromFirebase.current = true;
      setSyncError("Limite de cota excedido. Usando modo local offline.");
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    // Safety timer: mark as loaded after 2.5 seconds so UI is never stuck
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        isLoadedFromFirebase.current = true;
      }
    }, 2500);

    const connectFirestore = (retryCount = 0) => {
      if (!isMounted || isQuotaExceededRef.current) return;
      try {
        const docRef = doc(db, "app_state", "current");
        unsubscribe = onSnapshot(
          docRef,
          async (snapshot) => {
            if (!isMounted) return;
            const defaultState = loadState();

            if (snapshot.exists()) {
              const firebaseData = snapshot.data();
              const localState = stateRef.current;

              const mergedState = {
                ...defaultState,
                ...firebaseData,
                turmas: Array.isArray(firebaseData?.turmas) ? firebaseData.turmas : defaultState.turmas,
                formandos: Array.isArray(firebaseData?.formandos) ? firebaseData.formandos : defaultState.formandos,
                parcelas: Array.isArray(firebaseData?.parcelas) ? firebaseData.parcelas : defaultState.parcelas,
                eventos: Array.isArray(firebaseData?.eventos) ? firebaseData.eventos : defaultState.eventos,
                enquetes: Array.isArray(firebaseData?.enquetes) ? firebaseData.enquetes : defaultState.enquetes,
                albums: Array.isArray(firebaseData?.albums) ? firebaseData.albums : (localState?.albums || defaultState.albums || []),
                fotos: Array.isArray(firebaseData?.fotos) ? firebaseData.fotos : (localState?.fotos || defaultState.fotos || []),
                mural: Array.isArray(firebaseData?.mural) ? firebaseData.mural : (localState?.mural || defaultState.mural || []),
                fornecedores: Array.isArray(firebaseData?.fornecedores) ? firebaseData.fornecedores : defaultState.fornecedores,
                pacotes: Array.isArray(firebaseData?.pacotes) ? firebaseData.pacotes : defaultState.pacotes,
                depoimentos: Array.isArray(firebaseData?.depoimentos) ? firebaseData.depoimentos : defaultState.depoimentos,
                notifications: Array.isArray(firebaseData?.notifications) ? firebaseData.notifications : defaultState.notifications,
                reunioes: Array.isArray(firebaseData?.reunioes) ? firebaseData.reunioes : defaultState.reunioes,
                leads: Array.isArray(firebaseData?.leads) ? firebaseData.leads : defaultState.leads,
                pushTokens: Array.isArray(firebaseData?.pushTokens) ? firebaseData.pushTokens : defaultState.pushTokens,
                turmaMessages: Array.isArray(firebaseData?.turmaMessages) ? firebaseData.turmaMessages : (localState?.turmaMessages || defaultState.turmaMessages || []),
                portfolioAlbums: Array.isArray(firebaseData?.portfolioAlbums) ? firebaseData.portfolioAlbums : (localState?.portfolioAlbums || defaultState.portfolioAlbums || []),
                productGalleries: (typeof firebaseData?.productGalleries === 'object' && firebaseData?.productGalleries !== null) ? firebaseData.productGalleries : (localState?.productGalleries || defaultState.productGalleries || {}),
                visitorTracking: (typeof firebaseData?.visitorTracking === 'object' && firebaseData?.visitorTracking !== null) ? firebaseData.visitorTracking : (localState?.visitorTracking || defaultState.visitorTracking || INITIAL_VISITOR_TRACKING),
                adminTasks: Array.isArray(firebaseData?.adminTasks) ? firebaseData.adminTasks : (localState?.adminTasks || defaultState.adminTasks || []),
                gatewayConfig: (typeof firebaseData?.gatewayConfig === 'object' && firebaseData?.gatewayConfig !== null) ? firebaseData.gatewayConfig : (localState?.gatewayConfig || defaultState.gatewayConfig),
                theme: (firebaseData?.theme === 'dark' || firebaseData?.theme === 'light') ? firebaseData.theme : (localState?.theme || defaultState.theme || 'light'),
              };

              const jsonStr = JSON.stringify(mergedState);
              // Avoid re-triggering if data is unchanged
              if (jsonStr !== lastSavedJsonRef.current) {
                lastSavedJsonRef.current = jsonStr;
                setState(mergedState as any);
              }
              isLoadedFromFirebase.current = true;
              setIsSynced(true);
              setLastSyncTime(new Date());
              setSyncError(null);
            } else {
              try {
                const currentJson = JSON.stringify(stateRef.current);
                lastSavedJsonRef.current = currentJson;
                await setDoc(docRef, cleanUndefined(stateRef.current));
                if (!isMounted) return;
                isLoadedFromFirebase.current = true;
                setIsSynced(true);
                setLastSyncTime(new Date());
                setSyncError(null);
              } catch (err: any) {
                console.warn("Erro ao inicializar estado no Firebase:", err);
                isLoadedFromFirebase.current = true;
                if (isQuotaError(err)) {
                  setIsQuotaExceeded(true);
                  localStorage.setItem('firebase_quota_exceeded', 'true');
                  setIsSynced(false);
                  setSyncError("Limite de cota excedido. Usando modo local offline.");
                  if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
                  }
                } else {
                  setSyncError("Modo local ativo.");
                }
              }
            }
          },
          (error) => {
            if (!isMounted) return;
            isLoadedFromFirebase.current = true;
            if (isQuotaError(error)) {
              console.warn("Quota do Firebase excedida (onSnapshot):", error);
              setIsQuotaExceeded(true);
              localStorage.setItem('firebase_quota_exceeded', 'true');
              setIsSynced(false);
              setSyncError("Limite de cota excedido. Modo local ativo.");
              if (unsubscribe) {
                unsubscribe();
                unsubscribe = null;
              }
              return;
            }

            const errorMessage = error instanceof Error ? error.message : String(error);
            const isTransient = errorMessage.toLowerCase().includes("unavailable") || 
                                errorMessage.toLowerCase().includes("offline") ||
                                errorMessage.toLowerCase().includes("temporarily");

            if (isTransient && retryCount < 3) {
              const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
              console.warn(`Firestore temporariamente indisponível. Tentando novamente em ${Math.round(delay)}ms...`);
              setSyncError("Conectado localmente. Tentando sincronizar com Firebase...");
              setIsSynced(false);
              
              if (unsubscribe) {
                unsubscribe();
              }
              timeoutId = setTimeout(() => {
                connectFirestore(retryCount + 1);
              }, delay);
            } else {
              console.error("Erro de conexão com Firestore:", error);
              setSyncError("Conectado localmente.");
              setIsSynced(false);
            }
          }
        );
      } catch (err: any) {
        console.error("Erro ao configurar Firestore onSnapshot:", err);
        isLoadedFromFirebase.current = true;
        setSyncError("Modo local ativo.");
      }
    };

    connectFirestore();

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (unsubscribe) unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isQuotaExceeded]);

  // 2. Synchronize changes to Firebase and LocalStorage with retry on transient failures
  useEffect(() => {
    // Save to local storage as fallback
    saveState(state);

    if (isQuotaExceeded) {
      setIsSynced(false);
      return;
    }

    // Save to Firebase only if we've successfully loaded from it first
    if (isLoadedFromFirebase.current) {
      const currentJson = JSON.stringify(state);

      // Prevent redundant saves if state hasn't changed since last load/save
      if (currentJson === lastSavedJsonRef.current) {
        setIsSynced(true);
        return;
      }

      // Immediately show syncing loading state
      setIsSynced(false);

      let isMounted = true;
      let retryCount = 0;
      let timeoutId: NodeJS.Timeout | null = null;

      const saveRemote = async () => {
        if (isQuotaExceededRef.current) {
          setIsSynced(false);
          return;
        }
        try {
          let currentState = stateRef.current;
          let jsonStr = JSON.stringify(currentState);
          if (jsonStr.length > 350000) {
            currentState = await optimizeStateForStorage(currentState);
            jsonStr = JSON.stringify(currentState);
          }
          const docRef = doc(db, "app_state", "current");
          await setDoc(docRef, cleanUndefined(currentState));
          
          lastSavedJsonRef.current = jsonStr;
          if (!isMounted) return;
          setIsSynced(true);
          setLastSyncTime(new Date());
          setSyncError(null);
        } catch (err: any) {
          if (!isMounted) return;
          if (isQuotaError(err)) {
            console.warn("Cota excedida ao gravar no Firebase:", err);
            setIsQuotaExceeded(true);
            localStorage.setItem('firebase_quota_exceeded', 'true');
            setIsSynced(false);
            setSyncError("Cota excedida. Suas alterações foram salvas localmente!");
            return;
          }

          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes("exceeds the maximum allowed size") || errorMessage.includes("1,048,576")) {
            console.warn("Tamanho do documento excedeu 1MB. Otimizando imagens em Base64...");
            try {
              const optimized = await optimizeStateForStorage(stateRef.current);
              const optJson = JSON.stringify(optimized);
              setState(optimized);
              const docRef = doc(db, "app_state", "current");
              await setDoc(docRef, cleanUndefined(optimized));
              lastSavedJsonRef.current = optJson;
              if (!isMounted) return;
              setIsSynced(true);
              setSyncError(null);
              return;
            } catch (optErr) {
              console.error("Erro na otimização de emergência de estado:", optErr);
            }
          }

          const isTransient = errorMessage.toLowerCase().includes("unavailable") || 
                              errorMessage.toLowerCase().includes("offline") ||
                              errorMessage.toLowerCase().includes("temporarily");

          if (isTransient && retryCount < 3) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
            console.warn(`Erro temporário ao sincronizar dados (setDoc). Tentando novamente em ${Math.round(delay)}ms...`);
            timeoutId = setTimeout(saveRemote, delay);
          } else {
            console.error("Erro ao sincronizar dados com Firebase:", err);
            setSyncError("Erro ao sincronizar alterações em tempo real.");
            setIsSynced(false);
          }
        }
      };
      
      // Debounce to batch rapid UI updates and prevent hammering Firestore
      const initialTimeoutId = setTimeout(saveRemote, 1200);
      return () => {
        isMounted = false;
        clearTimeout(initialTimeoutId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [state, isQuotaExceeded]);

  // 2b. Synchronize document root theme class
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // 3. Visitor Tracking - Record visit session automatically with City & State geolocation and UTM Campaigns
  useEffect(() => {
    let isMounted = true;

    // Inject active marketing pixels (Meta Pixel, Google Ads, GA4, TikTok)
    injectTrackingScripts();

    const recordVisit = async () => {
      try {
        const sessionRecorded = sessionStorage.getItem('wm2_session_visit_recorded');
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const userAgent = navigator.userAgent;
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent);
        const deviceType: 'mobile' | 'desktop' | 'tablet' = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

        let browserName = 'Navegador Web';
        if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) browserName = 'Google Chrome';
        else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) browserName = 'Apple Safari';
        else if (userAgent.indexOf('Firefox') > -1) browserName = 'Mozilla Firefox';
        else if (userAgent.indexOf('Edg') > -1) browserName = 'Microsoft Edge';

        let osName = 'Desktop OS';
        if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) osName = 'iOS';
        else if (userAgent.indexOf('Android') > -1) osName = 'Android';
        else if (userAgent.indexOf('Windows') > -1) osName = 'Windows';
        else if (userAgent.indexOf('Macintosh') > -1) osName = 'macOS';
        else if (userAgent.indexOf('Linux') > -1) osName = 'Linux';

        const referrer = document.referrer;
        let source = 'Acesso Direto';

        // Check for active UTM parameters from paid traffic campaigns
        const utmInfo = extractUTMParameters();
        if (utmInfo.hasUTM && utmInfo.utm_source) {
          const sourceClean = utmInfo.utm_source.replace(/_/g, ' ');
          const campaignClean = utmInfo.utm_campaign ? ` (${utmInfo.utm_campaign.replace(/_/g, ' ')})` : '';
          source = `${sourceClean}${campaignClean}`;
        } else if (referrer.includes('instagram.com')) source = 'Instagram';
        else if (referrer.includes('google.com') || referrer.includes('google.com.br')) source = 'Google Busca';
        else if (referrer.includes('whatsapp') || referrer.includes('wa.me')) source = 'WhatsApp';
        else if (referrer.includes('facebook.com')) source = 'Facebook';
        else if (referrer.includes('tiktok.com')) source = 'TikTok';
        else if (referrer) source = 'Link Externo';

        // Attempt IP Geolocation lookup (free, client-side, zero-config)
        let detectedCity = 'São Paulo';
        let detectedState = 'SP';
        let detectedCountry = 'Brasil';
        let detectedIp = '';

        try {
          // Fast timeout geo fetch
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          
          const geoRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.city) detectedCity = geoData.city;
            if (geoData.region_code || geoData.region) detectedState = geoData.region_code || geoData.region;
            if (geoData.country_name) detectedCountry = geoData.country_name;
            if (geoData.ip) detectedIp = geoData.ip;
          }
        } catch {
          // Fallback or offline default
          detectedCity = 'São Paulo';
          detectedState = 'SP';
        }

        if (!isMounted) return;

        const newVisitor: SiteVisitor = {
          id: 'vis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          timestamp: now.toISOString(),
          date: todayStr,
          device: deviceType,
          browser: browserName,
          os: osName,
          screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
          referrer: referrer || undefined,
          path: window.location.pathname || '/',
          source: source,
          city: detectedCity,
          state: detectedState,
          country: detectedCountry,
          ip: detectedIp ? `${detectedIp.split('.')[0]}.${detectedIp.split('.')[1]}.*.*` : undefined
        };

        setState(prev => {
          const currentTracking = prev.visitorTracking || INITIAL_VISITOR_TRACKING;
          const isNewSession = !sessionRecorded;

          // Daily stats update
          const existingDailyIndex = currentTracking.dailyStats.findIndex(d => d.date === todayStr);
          let updatedDailyStats = [...currentTracking.dailyStats];
          
          if (existingDailyIndex >= 0) {
            const item = updatedDailyStats[existingDailyIndex];
            updatedDailyStats[existingDailyIndex] = {
              ...item,
              visits: item.visits + 1,
              uniques: isNewSession ? item.uniques + 1 : item.uniques
            };
          } else {
            updatedDailyStats.push({
              date: todayStr,
              visits: 1,
              uniques: 1
            });
            // Keep last 30 days
            if (updatedDailyStats.length > 30) {
              updatedDailyStats = updatedDailyStats.slice(-30);
            }
          }

          // Device breakdown
          const updatedDevice = {
            ...currentTracking.deviceBreakdown,
            [deviceType]: (currentTracking.deviceBreakdown[deviceType] || 0) + 1
          };

          // Recent visitors (keep last 30)
          const updatedRecent = [newVisitor, ...(currentTracking.recentVisitors || [])].slice(0, 30);

          // Top pages
          const pageKey = window.location.pathname || '/';
          const pageNameMap: Record<string, string> = {
            '/': 'Página Inicial (Landing Page)',
            '/portal-formando': 'Portal do Formando',
            '/admin': 'Painel de Gestão WM2',
            '/galeria': 'Galeria de Fotos',
            '/eventos': 'Eventos & Cerimonial'
          };
          const pageTitle = pageNameMap[pageKey] || 'Página do Site';
          const existingPageIndex = currentTracking.topPages.findIndex(p => p.path === pageKey);
          let updatedTopPages = [...currentTracking.topPages];
          if (existingPageIndex >= 0) {
            updatedTopPages[existingPageIndex] = {
              ...updatedTopPages[existingPageIndex],
              views: updatedTopPages[existingPageIndex].views + 1
            };
          } else {
            updatedTopPages.push({ path: pageKey, name: pageTitle, views: 1 });
          }

          // City breakdown
          let updatedCityBreakdown = [...(currentTracking.cityBreakdown || [])];
          const cityIndex = updatedCityBreakdown.findIndex(c => c.city.toLowerCase() === detectedCity.toLowerCase());
          if (cityIndex >= 0) {
            updatedCityBreakdown[cityIndex] = {
              ...updatedCityBreakdown[cityIndex],
              visits: updatedCityBreakdown[cityIndex].visits + 1
            };
          } else {
            updatedCityBreakdown.push({ city: detectedCity, state: detectedState, visits: 1 });
          }
          updatedCityBreakdown.sort((a, b) => b.visits - a.visits);

          // State breakdown
          let updatedStateBreakdown = [...(currentTracking.stateBreakdown || [])];
          const stateIndex = updatedStateBreakdown.findIndex(s => s.state.toUpperCase() === detectedState.toUpperCase());
          if (stateIndex >= 0) {
            updatedStateBreakdown[stateIndex] = {
              ...updatedStateBreakdown[stateIndex],
              visits: updatedStateBreakdown[stateIndex].visits + 1
            };
          } else {
            updatedStateBreakdown.push({ state: detectedState, name: detectedState, visits: 1 });
          }
          updatedStateBreakdown.sort((a, b) => b.visits - a.visits);

          return {
            ...prev,
            visitorTracking: {
              totalVisits: (currentTracking.totalVisits || 0) + 1,
              uniqueVisitors: isNewSession ? (currentTracking.uniqueVisitors || 0) + 1 : currentTracking.uniqueVisitors,
              lastVisitAt: now.toISOString(),
              dailyStats: updatedDailyStats,
              recentVisitors: updatedRecent,
              deviceBreakdown: updatedDevice,
              topPages: updatedTopPages,
              cityBreakdown: updatedCityBreakdown,
              stateBreakdown: updatedStateBreakdown
            }
          };
        });

        sessionStorage.setItem('wm2_session_visit_recorded', 'true');

        // Dispatch global real-time visitor event
        window.dispatchEvent(new CustomEvent('wm2_new_visitor', { detail: newVisitor }));
      } catch (e) {
        console.warn('Could not record visitor tracking', e);
      }
    };

    recordVisit();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEnterPortal = (role: Role, studentId?: string) => {
    setCurrentRole(role);
    setCurrentStudentId(studentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentRole('public');
    setCurrentStudentId(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe wrapper to update state fragments from children
  const handleUpdateState = (updates: Partial<typeof state>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Find currently logged-in student profile
  const loggedInStudent = state.formandos.find(f => f.id === currentStudentId);

  return (
    <div className="min-h-screen bg-white dark:bg-white transition-colors duration-300">
      
      {/* Firebase Quota Alert Banner */}
      {isQuotaExceeded && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white py-3 px-4 text-xs sm:text-sm font-medium shadow-md flex items-center justify-center font-sans">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <CloudLightning className="w-5 h-5 text-amber-200 animate-pulse shrink-0" />
              <span>
                <strong>Limite de Cota do Firebase Atingido:</strong> O limite de gravações diárias gratuitas do Firebase foi atingido para este projeto. O aplicativo continuará funcionando normalmente no <strong>Modo Local Offline</strong> — todas as alterações serão salvas localmente no seu navegador e não serão perdidas!
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <a 
                href="https://console.firebase.google.com/project/app-conceittus-formaturas/firestore/databases/ai-studio-wm2produesevento-14fd2c2a-e7fb-4d7f-84eb-8a8a4ab525f4/data?openUpgradeDialog=true"
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-rose-700 hover:bg-rose-50 px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all whitespace-nowrap animate-pulse"
              >
                Ver Banco Firebase
              </a>
              <button 
                onClick={() => {
                  localStorage.removeItem('firebase_quota_exceeded');
                  setIsQuotaExceeded(false);
                  window.location.reload();
                }}
                className="bg-rose-800 text-white hover:bg-rose-900 border border-rose-500/50 px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all whitespace-nowrap"
              >
                Tentar Reconectar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Visual Debug Switcher for easy evaluation / testing */}
      {currentRole !== 'public' && (
        <div className="bg-[#dfd1a1]/10 border-b border-[#aa904f]/25 py-2 px-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#aa904f]" />
                Modo de Simulação Ativo: <strong className="text-neutral-900 dark:text-neutral-800 uppercase">{currentRole}</strong>
              </span>
              
              {/* Firebase Sync Indicator */}
              {isSynced ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 font-sans shadow-2xs">
                  <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Firebase Conectado</span>
                  <span className="w-10 bg-emerald-200 rounded-full h-1 overflow-hidden inline-block ml-1">
                    <span className="bg-emerald-600 h-full rounded-full w-full block" />
                  </span>
                </span>
              ) : syncError ? (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200 font-sans">
                  <CloudLightning className="w-3 h-3 text-amber-500 animate-pulse shrink-0" /> {syncError}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 font-sans shadow-2xs">
                  <RefreshCw className="w-3 h-3 text-amber-700 animate-spin shrink-0" />
                  <span>Sincronizando com Firebase...</span>
                  <span className="w-12 bg-amber-200 rounded-full h-1.5 overflow-hidden inline-block border border-amber-300 ml-1">
                    <span className="bg-amber-600 h-full rounded-full w-full block animate-pulse" />
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-4 font-sans">
              <button 
                onClick={handleLogout}
                className="hover:text-[#aa904f] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Voltar para o Portal Público
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Views Router */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRole + (currentStudentId || '')}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {currentRole === 'public' && (
            <LandingPage 
              onEnterPortal={handleEnterPortal} 
              formandos={state.formandos} 
              portfolioAlbums={state.portfolioAlbums}
              productGalleries={state.productGalleries}
            />
          )}

          {currentRole === 'admin' && (
            <AdminPanel 
              turmas={state.turmas || []}
              formandos={state.formandos || []}
              parcelas={state.parcelas || []}
              eventos={state.eventos || []}
              fornecedores={state.fornecedores || []}
              pacotes={state.pacotes || []}
              albums={state.albums || []}
              fotos={state.fotos || []}
              notifications={state.notifications || []}
              pushTokens={state.pushTokens || []}
              mural={state.mural || []}
              reunioes={state.reunioes || []}
              leads={state.leads || []}
              portfolioAlbums={state.portfolioAlbums || []}
              productGalleries={state.productGalleries || {}}
              visitorTracking={state.visitorTracking || INITIAL_VISITOR_TRACKING}
              adminTasks={state.adminTasks || []}
              gatewayConfig={state.gatewayConfig || INITIAL_GATEWAY_CONFIG}
              theme={state.theme || 'light'}
              isSynced={isSynced}
              syncError={syncError}
              isQuotaExceeded={isQuotaExceeded}
              lastSyncTime={lastSyncTime}
              onUpdateState={handleUpdateState}
              onLogout={handleLogout}
            />
          )}

          {(currentRole === 'formando' || currentRole === 'comissao') && loggedInStudent && (
            <StudentPortal 
              currentStudent={loggedInStudent}
              turmas={state.turmas}
              parcelas={state.parcelas}
              eventos={state.eventos}
              enquetes={state.enquetes}
              albums={state.albums || []}
              fotos={state.fotos}
              mural={state.mural}
              formandos={state.formandos}
              pacotes={state.pacotes || []}
              depoimentos={state.depoimentos || []}
              notifications={state.notifications || []}
              pushTokens={state.pushTokens || []}
              turmaMessages={state.turmaMessages || []}
              reunioes={state.reunioes || []}
              gatewayConfig={state.gatewayConfig || INITIAL_GATEWAY_CONFIG}
              onUpdateState={handleUpdateState}
              onLogout={handleLogout}
            />
          )}

          {/* Fallback if student session is lost or corrupted */}
          {(currentRole === 'formando' || currentRole === 'comissao') && !loggedInStudent && (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Erro de Sessão</h2>
              <p className="text-neutral-500 text-sm max-w-sm mb-6">
                Não foi possível carregar as credenciais do formando. Por favor, retorne à página inicial e selecione um perfil de demonstração.
              </p>
              <button
                onClick={handleLogout}
                className="bg-neutral-900 text-white hover:bg-neutral-850 px-6 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Ir para o Início
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
