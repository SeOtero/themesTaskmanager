import React, { useState } from 'react';
import { MARKET_ITEMS } from '../../data/marketItems'; 
import myLogo from '../../assets/logo.png'; 

const MarketplaceModal = ({ 
    isOpen, onClose, userCoins, ownedItems, currentTheme, 
    activePet, activeBorder, activeEffect, onBuy, onEquip, 
    onPreview 
}) => {
    
    const [filter, setFilter] = useState('theme'); 

    if (!isOpen) return null;

    // Filtros
    const filteredItems = MARKET_ITEMS.filter(item => {
        if (filter === 'theme') return !item.category || item.category === 'theme';
        return item.category === filter;
    });

    const isOwned = (itemId) => {
        const item = MARKET_ITEMS.find(i => i.id === itemId);
        return ownedItems.includes(itemId) || itemId === 'default' || (item && item.price === 0);
    };
    
    const isActive = (item) => {
        if (!item.category || item.category === 'theme') return currentTheme === item.id;
        if (item.category === 'pet') return activePet === item.id;
        if (item.category === 'border') return activeBorder === item.id;
        if (item.category === 'effect') return activeEffect === item.id;
        return false;
    };

    const TABS = [
        { id: 'theme', label: 'Temas', icon: '🎨' },
        { id: 'border', label: 'Marcos', icon: '🖼️' },
        { id: 'effect', label: 'Efectos', icon: '✨' },
        { id: 'pet', label: 'Mascotas', icon: '🐾' },
    ];

    // 🔥 DEFINICIÓN DE LA COLECCIÓN ESPECIAL
    const LANTERN_IDS = ['beach', 'beach_night', 'beach_spirit'];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-6xl bg-[#0B0F19] rounded-3xl shadow-2xl border border-white/5 flex flex-col h-[85vh] overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F19]">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Tienda LofiDex
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Mejora tu espacio de trabajo</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                            <div className="w-8 h-8 bg-[#d1c4e9] rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-500/50 p-0.5">
                                <img src={myLogo} alt="Coins" className="w-full h-full object-cover scale-110" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
                                <span className="hidden text-lg">💰</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">COINS</span>
                                <span className="text-lg font-bold text-white leading-none">{userCoins}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all">✕</button>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex px-8 py-6 gap-4 bg-[#0B0F19] overflow-x-auto">
                    {TABS.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
                                filter === tab.id 
                                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- GRID --- */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar bg-[#0B0F19]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {filteredItems.map((item) => {
                            const owned = isOwned(item.id); 
                            const active = isActive(item);
                            const canBuy = userCoins >= (item.price || 0);
                            
                            // Detectamos tipos especiales
                            const isSignature = item.id.includes('signature');
                            const isLantern = LANTERN_IDS.includes(item.id);

                            // Estilos Dinámicos
                            let cardBorderClass = "border-white/5";
                            let cardBgClass = "bg-[#131b2e]";
                            let hoverClass = "hover:border-white/10 hover:shadow-xl hover:-translate-y-1";

                            if (isSignature) {
                                cardBgClass = "bg-gradient-to-br from-amber-900/40 via-black to-black";
                                cardBorderClass = "border-yellow-500/30";
                                hoverClass = "hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]";
                            } else if (isLantern) {
                                // ✨ ESTILO LANTERN COLLECTION ✨
                                cardBgClass = "bg-gradient-to-b from-orange-900/10 to-[#131b2e]";
                                cardBorderClass = "border-orange-500/40";
                                hoverClass = "hover:border-orange-400 hover:shadow-[0_0_25px_rgba(255,100,0,0.2)] hover:-translate-y-1";
                            }

                            return (
                                <div key={item.id} className={`group relative rounded-2xl p-5 border transition-all flex flex-col h-full ${cardBgClass} ${cardBorderClass} ${hoverClass}`}>
                                    
                                    {/* 🔥 BADGE LANTERN COLLECTION 🔥 */}
                                    {isLantern && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-orange-900/50 border border-orange-400 z-20 whitespace-nowrap">
                                            Lanterns Collection
                                        </div>
                                    )}

                                    {/* Badge Signature */}
                                    {isSignature && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-transparent text-black text-[9px] font-black px-3 py-1 uppercase tracking-widest z-10">
                                            Signature
                                        </div>
                                    )}

                                    {/* Precio / Estado */}
                                    <div className="absolute top-4 right-4 z-10">
                                        {active ? (
                                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-green-900/50">En Uso</span>
                                        ) : owned ? (
                                            <span className="bg-blue-900/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Adquirido</span>
                                        ) : (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${isSignature ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30' : isLantern ? 'bg-orange-900/40 text-orange-200 border-orange-500/30' : 'bg-black/40 text-slate-300 border-white/10'}`}>
                                                {item.price === 0 ? 'FREE' : `${item.price} 💰`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Icono Grande */}
                                    <div className="mb-4 mt-2 flex justify-center">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner border transition-all duration-500 ${isLantern ? 'bg-orange-900/20 border-orange-500/20 text-orange-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]' : isSignature ? 'bg-gradient-to-br from-yellow-600/20 to-amber-900/20 border-yellow-500/30 text-yellow-400' : 'bg-black/30 border-white/5 text-slate-200'}`}>
                                            {item.emoji || item.icon || '🎨'}
                                        </div>
                                    </div>

                                    {/* Textos */}
                                    <div className="mb-6 flex-1 text-center sm:text-left">
                                        <h3 className={`font-bold text-base mb-1 ${isSignature ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500' : isLantern ? 'text-orange-100' : 'text-white'}`}>
                                            {item.name}
                                        </h3>
                                        <p className={`text-xs leading-relaxed ${isSignature ? 'text-yellow-100/60' : isLantern ? 'text-orange-200/60' : 'text-slate-400'}`}>
                                            {item.description || "Personaliza tu experiencia visual."}
                                        </p>
                                    </div>

                                    {/* Botones */}
                                    <div className="mt-auto space-y-2">
                                        {owned ? (
                                            active ? (
                                                <button disabled className="w-full py-3 rounded-lg bg-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-default border border-white/5">Equipado</button>
                                            ) : (
                                                <button onClick={() => onEquip(item)} className={`w-full py-3 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${isLantern ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border border-orange-500/30' : isSignature ? 'bg-gradient-to-r from-yellow-700 to-amber-600 hover:from-yellow-600 hover:to-amber-500 border border-yellow-500/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}>Equipar</button>
                                            )
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => onBuy(item)} disabled={!canBuy} className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${!canBuy ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' : isLantern ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:to-orange-500 text-white shadow-orange-900/30' : isSignature ? 'bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-[length:200%_auto] hover:bg-right text-white border-yellow-400/30 shadow-yellow-600/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}>
                                                    <span>{isSignature ? 'Obtener' : 'Comprar'}</span>
                                                </button>
                                                <button onClick={() => onPreview(item)} className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">Vista Previa</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="py-3 bg-[#0B0F19] border-t border-white/5 text-center shrink-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">LofiDex Marketplace</p>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceModal;