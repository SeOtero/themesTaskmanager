import React from 'react';
import myLogo from '../../assets/logo.png'; 

// Nota: el botón de "Tienda" que vivía acá se movió al FloatingMenu unificado
// para evitar tener dos accesos distintos a la misma acción en pantalla.
const EconomyBar = ({ coins }) => {
    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center bg-[#0B0F19]/90 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl animate-fadeIn">
            
            {/* --- ZONA DE MONEDAS --- */}
            <div className="flex items-center gap-3 px-4 py-1">
                <div className="w-8 h-8 bg-[#d1c4e9] rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                    <img 
                        src={myLogo} 
                        alt="Coins" 
                        className="w-full h-full object-cover scale-[1.7]" 
                        onError={(e) => e.target.style.display='none'} 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Lofi Coins
                    </span>
                    <span className="text-lg font-black text-white leading-none">
                        {coins?.toLocaleString() || 0}
                    </span>
                </div>
            </div>

        </div>
    );
};

export default EconomyBar;
