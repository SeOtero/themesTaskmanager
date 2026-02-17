import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager,
    getFirestore 
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyADgIdomw9VmyRWyDJrB5kIGwLXke0FSAo",
    authDomain: "task-manager-tl.firebaseapp.com",
    projectId: "task-manager-tl",
    storageBucket: "task-manager-tl.firebasestorage.app",
    messagingSenderId: "1042228665130",
    appId: "1:1042228665130:web:69f8244f16145e6cc65c53",
    measurementId: "G-WLH41TME67"
};

// 1. Patrón Singleton para la App (Evita reinicializar si ya existe)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Inicialización Segura de Firestore
let db;
try {
    // Intentamos activar la caché persistente (Ahorro de datos)
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager() 
        })
    });
} catch (e) {
    // Si falla porque "ya estaba inicializada" (Hot Reload), usamos la existente
    // Esto silencia el error rojo y permite que la app siga funcionando
    db = getFirestore(app);
}

// 3. Inicializar Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { db };