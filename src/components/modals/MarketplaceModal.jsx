import React, { useState } from 'react';
import { MARKET_ITEMS } from '../../data/marketItems';

// IMPORTA TU LOGO
import myLogo from '../../assets/logo.png'; 

const MarketplaceModal = ({ 
    isOpen, onClose, userCoins, ownedItems, currentTheme, 
    activePet, activeBorder, activeEffect, onBuy, onEquip, 
    onPreview 
}) => {
    const [filter, setFilter] = useState('theme'); 

    if (!isOpen) return null;

    const filteredItems = MARKET_ITEMS.filter(item => item.category === filter);
    const isOwned = (itemId) => ownedItems.includes(itemId) || itemId === 'default';
    
    const isActive = (item) => {
        if (item.category === 'theme') return currentTheme === item.id;
        if (item.category === 'pet') return activePet === item.id;
        if (item.category === 'border') return activeBorder === item.id;
        if (item.category === 'effect') return activeEffect === item.id;
        return false;
    };

    const TABS = [
        { id: 'theme', label: 'Temas', icon: '🎨' },
        { id: 'border', label: 'Marcos', icon: '🖼️' },
        { id: 'effect', label: 'Efectos', icon: '✨' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-6xl bg-[#0B0F19] rounded-3xl shadow-2xl border border-white/5 flex flex-col max-h-[85vh] overflow-hidden relative">
                
                {/* --- HEADER --- */}
                <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center shrink-0 bg-black/20">
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white tracking-tight">
                            Tienda LofiDex
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5 font-light">Mejora tu espacio de trabajo</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            <div className="w-8 h-8 bg-[#d1c4e9] rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-white/20">
                                <img src={myLogo} alt="Lofi Coins" className="w-full h-full object-cover transform scale-[1.7]" />
                            </div>
                            <div className="flex flex-col items-start mr-1">
                                <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider leading-none opacity-80">COINS</span>
                                <span className="text-lg font-bold text-white leading-none">{userCoins}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/5">✕</button>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex px-6 py-4 gap-3 shrink-0 bg-white/[0.02]">
                    {TABS.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${filter === tab.id ? 'bg-purple-600/20 border-purple-500/50 text-purple-100 shadow-[0_0_10px_rgba(147,51,234,0.1)]' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span className="text-base">{tab.icon}</span>{tab.label}
                        </button>
                    ))}
                </div>

                {/* --- GRID --- */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                       {filteredItems.map((item) => {
    // 1. Detectamos si es el ítem especial
    const isSignature = item.id === 'signature_mickey_bianca';
    
    // 2. Lógica normal
    const owned = ownedItems.includes(item.id) || item.id === 'default'; // Corrección pequeña: ownedItems suele ser array de strings
    
    // Lógica de "Activo" (revisamos la función isActive que ya tenías fuera del map, 
    // pero para asegurar acceso al scope, la replicamos o usamos la variable externa si el scope lo permite.
    // En tu código original 'isActive' estaba definida arriba, así que la llamamos directo:
    const active = isActive(item); 
    
    // 3. Clases Dinámicas (La Magia Visual)
    const cardClasses = isSignature
        ? "bg-gradient-to-br from-amber-900/80 via-yellow-900/20 to-black border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:border-yellow-300 transform hover:-translate-y-2"
        : "bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.07] hover:to-white/[0.02] border-white/5 hover:border-white/20 hover:shadow-lg hover:-translate-y-1";

    return (
        <div key={item.id} className={`group relative p-4 rounded-2xl border transition-all duration-500 flex flex-col h-full overflow-hidden ${cardClasses} ${active ? (isSignature ? 'border-yellow-400 shadow-yellow-500/20' : 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]') : ''}`}>
            
            {/* --- EFECTOS DE FONDO (Solo Signature) --- */}
            {isSignature && (
                <>
                    {/* Brillo ambiental */}
                    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent"></div>
                    {/* Destello al pasar el mouse */}
                    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                    {/* Partículas flotantes (simuladas con puntos) */}
                    <div className="absolute top-2 right-2 text-[8px] animate-pulse text-yellow-200">✨</div>
                    <div className="absolute bottom-4 left-4 text-[8px] animate-pulse delay-700 text-yellow-400">✨</div>
                </>
            )}

            {/* --- HEADER DE LA TARJETA --- */}
            <div className="relative z-20 flex justify-between items-start mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110 ${isSignature ? 'bg-gradient-to-br from-yellow-600 to-amber-800 border border-yellow-400/30 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'bg-black/40 border border-white/5'}`}>
                    {item.icon}
                </div>
                
                {active && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${isSignature ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>En uso</span>}
                
                {owned && !active && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${isSignature ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>Adquirido</span>}
                
                {!owned && isSignature && <span className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg animate-pulse border border-yellow-300/30">EXCLUSIVO</span>}
            </div>

            {/* --- INFO --- */}
            <div className="relative z-20 mb-4 flex-1">
                <h3 className={`font-bold text-sm tracking-wide mb-1 transition-colors ${isSignature ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 drop-shadow-sm' : 'text-white group-hover:text-purple-300'}`}>
                    {item.name}
                </h3>
                <p className={`text-xs leading-relaxed line-clamp-3 ${isSignature ? 'text-yellow-100/70' : 'text-slate-400'}`}>
                    {item.description}
                </p>
            </div>
            
            {/* --- ACCIONES --- */}
            <div className={`relative z-20 mt-auto pt-3 border-t ${isSignature ? 'border-yellow-500/20' : 'border-white/5'}`}>
                {owned ? (
                    <button 
                        onClick={() => onEquip(item)} 
                        disabled={active}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                            active 
                                ? 'bg-white/5 text-slate-500 cursor-default' 
                                : isSignature 
                                    ? 'bg-gradient-to-r from-yellow-700 to-amber-600 hover:from-yellow-600 hover:to-amber-500 text-white border border-yellow-400/30 shadow-yellow-900/40' 
                                    : 'bg-blue-600/80 hover:bg-blue-500 text-white'
                        }`}
                    >
                        {active ? 'Equipado' : 'Equipar'}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        {/* Botón Preview */}
                        <button onClick={() => onPreview(item)} className={`px-3 py-2 rounded-lg transition-colors border ${isSignature ? 'bg-yellow-900/20 text-yellow-200 border-yellow-500/30 hover:bg-yellow-900/40' : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white'}`} title="Vista previa">👁️</button>
                        
                        {/* Botón Comprar */}
                        <button 
                            onClick={() => onBuy(item)} 
                            className={`flex-1 py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 group/btn transition-all border ${
                                isSignature 
                                    ? 'bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-[length:200%_auto] hover:bg-right text-white border-yellow-400/30 shadow-yellow-600/20' 
                                    : 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border-white/10'
                            }`}
                        >
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSignature ? 'text-shadow-sm' : ''}`}>
                                {isSignature ? 'Obtener' : 'Comprar'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isSignature ? 'bg-black/40 text-yellow-200' : 'bg-black/30 text-violet-200 group-hover/btn:text-white'}`}>
                                {item.price === 0 && isSignature ? 'FREE' : item.price}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
})}
                    </div>
                </div>

                <div className="py-3 bg-black/40 border-t border-white/5 text-center shrink-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">LofiDex Marketplace</p>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceModal;