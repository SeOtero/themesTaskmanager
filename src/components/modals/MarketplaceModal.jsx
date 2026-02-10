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
                            const owned = isOwned(item.id);
                            const active = isActive(item);

                            return (
                                <div key={item.id} className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col h-full bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.07] hover:to-white/[0.02] hover:-translate-y-1 ${active ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-white/5 hover:border-white/20 hover:shadow-lg'}`}>
                                    
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-2xl border border-white/5 shadow-inner">{item.icon}</div>
                                        {active && <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 uppercase tracking-wide">En uso</span>}
                                        {owned && !active && <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wide">Adquirido</span>}
                                    </div>

                                    <h3 className="font-semibold text-white text-sm tracking-wide mb-1 group-hover:text-purple-300 transition-colors">{item.name}</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{item.description}</p>
                                    
                                    <div className="mt-auto pt-3 border-t border-white/5">
                                        {owned ? (
                                            <button onClick={() => onEquip(item)} className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${active ? 'bg-white/5 text-slate-500 cursor-default' : 'bg-blue-600/80 hover:bg-blue-500 text-white shadow-md'}`}>
                                                {active ? 'Equipado' : 'Equipar'}
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => onPreview(item)} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors" title="Vista previa">👁️</button>
                                                
                                                {/* --- NUEVO BOTÓN DE COMPRA: VIOLETA ELEGANTE --- */}
                                                <button 
                                                    onClick={() => onBuy(item)} 
                                                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white shadow-lg flex items-center justify-center gap-2 group/btn transition-all border border-white/10"
                                                >
                                                    <span className="text-xs font-bold uppercase tracking-wider">Comprar</span>
                                                    <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-mono text-violet-200 group-hover/btn:text-white">
                                                        {item.price}
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