import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase/config';

const LoginScreen = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (e) {
            console.error("Google Auth Error:", e);
            if (e.code === 'auth/unauthorized-domain') {
                setError(`Dominio no autorizado. Agrega "${window.location.hostname}" en Firebase Console.`);
            } else if (e.code === 'auth/popup-closed-by-user') {
                setError("Ventana cerrada por el usuario.");
            } else {
                setError("Error al iniciar con Google. Verifica la consola.");
            }
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (e) {
            console.error("Email Auth Error:", e);
            let msg = "Error de autenticación.";
            if (e.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
            if (e.code === 'auth/user-not-found') msg = "Usuario no encontrado.";
            if (e.code === 'auth/email-already-in-use') msg = "El correo ya está registrado.";
            if (e.code === 'auth/weak-password') msg = "La contraseña es muy débil.";
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-white mb-2">Bienvenido</h1>
                        <p className="text-gray-400 text-sm">Task Manager TL - Secured</p>
                    </div>
                    
                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition shadow-md mb-6">
                        {loading ? "Cargando..." : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Iniciar con Google
                            </>
                        )}
                    </button>

                    <div className="relative flex py-2 items-center mb-6">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">O usa tu correo</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        {error && <p className="text-red-400 text-xs text-center font-bold bg-red-900/50 p-2 rounded">{error}</p>}
                        <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-bold text-white transition shadow-lg ${isRegistering ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? "Procesando..." : (isRegistering ? "Registrarse" : "Iniciar Sesión")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-gray-400 hover:text-white underline">
                            {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
                        </button>
                    </div>
                </div>
                <div className="bg-gray-700/30 p-4 text-center border-t border-gray-700">
                    <p className="text-xs text-gray-500">🔒 Tus datos se guardan seguros en Firebase</p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;