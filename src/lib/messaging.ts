import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const VAPID_KEY = 'BJp_iW67-EAnm01LgA7R017S49K_jXW6e2jY9wLpY_6R99U69wz'; // Example public VAPID key

export interface PushDevice {
  id: string;
  formandoId: string;
  token: string;
  browser: string;
  date: string;
  status: 'Ativo' | 'Simulado';
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  category: 'Boleto' | 'Mural' | 'Geral';
  targetTurmaId: string | 'all';
  readBy: string[];
}

/**
 * Request permission for push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações desktop.');
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificações:', error);
    return 'denied';
  }
}

/**
 * Register FCM Service Worker and retrieve FCM Token
 */
export async function getFCMToken(): Promise<string | null> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    return null;
  }

  try {
    // Attempt real FCM token registration
    // We try to fetch the service worker registration
    const registration = await navigator.serviceWorker.ready;
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: VAPID_KEY
    });
    return token;
  } catch (error) {
    console.warn('Não foi possível obter o token real do FCM (comum em sandboxes de iframe):', error);
    return null;
  }
}

/**
 * In-app foreground notification handler
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const messaging = getMessaging();
    return onMessage(messaging, (payload) => {
      console.log('Mensagem em primeiro plano recebida:', payload);
      callback(payload);
    });
  } catch (error) {
    console.warn('Ouvinte do FCM em primeiro plano não inicializado:', error);
    return () => {};
  }
}

/**
 * Generate a high-fidelity simulated token for sandbox environments
 */
export function generateSimulatedToken(formandoId: string): string {
  const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `simulated_fcm_token_${formandoId}_${hash}`;
}
