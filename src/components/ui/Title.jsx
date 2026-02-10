import React from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase/config';

const Title = ({ themeClasses, celebrationMessage }) => { 
    const shadowStyle = themeClasses.name === 'halloween' ? '[text-shadow:0_0_8px_rgba(255,165,0,0.6)]' : themeClasses.name === 'party' ? '[text-shadow:0_0_10px_rgba(217,70,239,0.7)]' : themeClasses.name === 'biancaBday' ? '[text-shadow:0_0_12px_rgba(236,72,153,0.6)]' : '';
    const [leftIcon, rightIcon] = themeClasses.iconPair || [null, null];
    const isLofiDex = themeClasses.name === 'lofi';

    const handleLogout = () => {
        if(confirm("¿Seguro que quieres cerrar sesión?")) {
            signOut(auth);
        }
    };

    return (
        <div className="text-center mb-4 flex flex-col items-center relative">
            <button onClick={handleLogout} className="absolute top-0 right-0 text-xs bg-red-900/50 hover:bg-red-800 text-red-200 px-2 py-1 rounded border border-red-800 transition">Salir</button>

            {isLofiDex && (
                <div className="mb-2 animate-bounce-slow">
                    <img src="https://i.imgur.com/0YBh5gg.png" alt="LofiDex Logo" className="w-32 h-32 object-cover rounded-full border-4 border-[#C084FC] shadow-lg hover:scale-105 transition-transform duration-500" onError={(e) => {e.target.onerror = null; e.target.style.display = 'none';}} />
                </div>
            )}

            <h1 className={`text-4xl font-extrabold transition-colors duration-500 ${themeClasses.primaryText} ${themeClasses.titleFont} ${shadowStyle}`}>
                {leftIcon && <span className="inline-block transform -rotate-12 scale-110 mr-2 text-3xl">{leftIcon}</span>}
                {isLofiDex ? "Task Manager" : "Task Manager TL"}
                {rightIcon && <span className="inline-block transform rotate-12 scale-110 ml-2 text-3xl">{rightIcon}</span>}
            </h1>
            
            {isLofiDex && (
                <div className="mt-2 bg-[#FDFCDC] text-[#2E1065] px-3 py-1 rounded-full text-xs font-bold font-lofidex tracking-widest uppercase border border-[#C084FC] shadow-md flex items-center gap-1 animate-pulse">
                    <span>✨ Powered by LofiDex ✨</span>
                </div>
            )}

            {celebrationMessage && <p className={`mt-2 text-lg font-semibold animate-pulse ${themeClasses.accentText}`}>{celebrationMessage}</p>}
        </div>
    );
};

export default Title;