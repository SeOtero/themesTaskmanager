import React from 'react';
import myLogo from '../../assets/logo.png'; // ✅ Mantenemos tu logo

const EconomyBar = ({ coins, onOpenShop }) => {
    // 🔥 LÓGICA DE PROTECCIÓN:
    // Si 'coins' llega como null, undefined o un objeto raro, mostramos 0.
    // Si llega un número, lo mostramos.
    const displayCoins = (typeof coins === 'number') ? coins : 0;

    return (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
            {/* Contenedor Principal: Efecto Cristal Oscuro */}
            <div className="flex items-center gap-1 p-1.5 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                
                {/* --- SECCIÓN 1: SALDO --- */}
                <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 pr-6">
                    <div className="w-8 h-8 rounded-full bg-[#d1c4e9] flex items-center justify-center overflow-hidden border border-white/20 shadow-inner">
                        <img 
                            src={myLogo} 
                            alt="Coin" 
                            className="w-full h-full object-cover transform scale-[1.7]" 
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lofi Coins</span>
                        <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 leading-tight tabular-nums">
                            {/* ✅ USAMOS LA VARIABLE SEGURA AQUÍ */}
                            {displayCoins.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Separador Vertical */}
                <div className="w-px h-6 bg-white/10 mx-1"></div>

                {/* --- SECCIÓN 2: ACCIONES (Solo Tienda) --- */}
                
                {/* Botón TIENDA */}
                <button 
                    onClick={onOpenShop}
                    className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 transition-all duration-300"
                    title="Abrir Tienda"
                >
                    <span className="text-xl filter drop-shadow-md group-hover:scale-110 transition-transform">🛒</span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Tienda</span>
                </button>

            </div>
        </div>
    );
};

export default EconomyBar;