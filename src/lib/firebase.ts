import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with dedicated database ID
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || "(default)");

// Initialize Storage
export const storage = getStorage(app);

import { cleanUndefined, optimizeStateForStorage } from './imageOptimizer';

export { cleanUndefined, optimizeStateForStorage };

export async function saveToFirebase(state: any) {
  try {
    const docRef = doc(db, "app_state", "current");
    let optimized = state;
    if (JSON.stringify(state).length > 600000) {
      optimized = await optimizeStateForStorage(state);
    }
    const cleanedState = cleanUndefined(optimized);
    await setDoc(docRef, cleanedState);
  } catch (err) {
    console.error("Erro ao salvar dados no Firebase:", err);
  }
}

