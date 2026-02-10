import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Busca estos datos en la configuración de tu proyecto en Firebase
const firebaseConfig = {
    apiKey: "AIzaSyADgIdomw9VmyRWyDJrB5kIGwLXke0FSAo",
    authDomain: "task-manager-tl.firebaseapp.com",
    projectId: "task-manager-tl",
    storageBucket: "task-manager-tl.firebasestorage.app",
    messagingSenderId: "1042228665130",
    appId: "1:1042228665130:web:69f8244f16145e6cc65c53",
    measurementId: "G-WLH41TME67"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();