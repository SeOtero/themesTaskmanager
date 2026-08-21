// src/firebase.js
// Configuración ÚNICA de Firebase para toda la app.
//
// SEGURIDAD: Las claves ya NO están hardcodeadas en el código fuente.
// Se leen desde variables de entorno (archivo .env, no versionado en Git).
// Ver .env.example para la lista de variables requeridas.
//
// Nota: la apiKey de Firebase para apps web NO es un secreto en el sentido
// tradicional (viaja igualmente al navegador del usuario final). La protección
// real de tus datos vive en las Firestore Security Rules (ver firestore.rules).
// Aun así, sacarla del código fuente es buena práctica: evita que quede
// expuesta en el historial de Git, facilita rotarla, y permite tener
// configuraciones distintas por entorno (dev/staging/prod).
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    getFirestore
} from "firebase/firestore";

const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const missing = requiredVars.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
    // Falla rápido y con un mensaje claro en vez de un error críptico de Firebase.
    throw new Error(
        `[firebase.js] Faltan variables de entorno: ${missing.join(', ')}.\n` +
        `Copia .env.example a .env y completa los valores de tu proyecto Firebase.`
    );
}

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && {
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }),
};

// Patrón Singleton para la App (evita reinicializar si ya existe, p.ej. en Hot Reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización segura de Firestore con caché persistente (ahorro de lecturas / soporte offline)
let db;
try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
} catch (e) {
    // Si falla porque "ya estaba inicializada" (Hot Reload), usamos la instancia existente.
    db = getFirestore(app);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { db };
