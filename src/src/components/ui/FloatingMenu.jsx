// src/components/ui/FloatingMenu.jsx
//
// Menú único que reemplaza los botones flotantes que antes estaban dispersos
// por toda la pantalla (Ajustes, Tienda, Disponibilidad/Soporte, Calculadora
// de Salario, Ideas/Bugs, Ideas del Lunes, Panel de Líder). Se abre desde un
// único botón flotante (FAB) y muestra el nombre de usuario + saldo de Lofi
// Coins arriba de todo.
import React, { useState, useEffect, useRef } from 'react';
import { openQuickNotes } from '../tools/QuickNotesWidget';

const MenuItem = ({ icon, label, badge, onClick, accent = 'default' }) => {
    const accentClasses = {
        default: 'hover:bg-white/10 text-slate-200',
        purple: 'hover:bg-purple-500/20 text-purple-200',
        yellow: 'hover:bg-yellow-500/20 text-yellow-200',
        blue: 'hover:bg-blue-500/20 text-blue-200',
        green: 'hover:bg-green-500/20 text-green-200',
        gold: 'hover:bg-amber-500/20 text-amber-200',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${accentClasses[accent]}`}
        >
            <span className="text-xl w-6 text-center flex-shrink-0">{icon}</span>
            <span className="flex-1 min-w-0 font-semibold text-sm break-words">{label}</span>
            {badge && (
                <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
};

const FloatingMenu = ({
    userProfile,
    lofiCoins,
    isLeader,
    onOpenSettings,
    onOpenShop,
    onOpenAvailability,
    onOpenSalaryCalculator,
    onOpenIdeas,
    setIdeaType,
    onOpenDashboard,
    onOpenBriefing,
    briefingPendingCount = 0,
    briefingStreak = 0,
    onOpenQuickLinks,
    onOpenHelp,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Cerrar al hacer click afuera o con Escape (mejor accesibilidad que los botones sueltos de antes)
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (e) => { if (e.key === 'Escape') setIsOpen(false); };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const displayName = userProfile?.userName || userProfile?.email?.split('@')[0] || 'Agente';
    const displayCoins = typeof lofiCoins === 'number' ? lofiCoins : 0;
    const initials = displayName.slice(0, 2).toUpperCase();

    const go = (action) => {
        action();
        setIsOpen(false);
    };

    return (
        <div ref={panelRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[90] flex flex-col items-end gap-3">
            {isOpen && (
                <div className="w-72 max-w-[85vw] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                    {/* Header: usuario + saldo */}
                    <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 overflow-hidden">
                            {userProfile?.photoURL ? (
                                <img src={userProfile.photoURL} alt={displayName} className="w-full h-full object-cover" />
                            ) : initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white font-bold text-sm truncate">{displayName}</p>
                            <div className="flex items-center gap-1 text-amber-300 text-xs font-bold">
                                <span>🪙</span>
                                <span className="tabular-nums">{displayCoins.toLocaleString()}</span>
                                <span className="text-slate-400 font-normal">Lofi Coins</span>
                            </div>
                            {briefingStreak > 0 && (
                                <div className="flex items-center gap-1 text-amber-200 text-[11px] font-semibold mt-0.5">
                                    <span>🏅</span>
                                    <span>Racha: {briefingStreak} {briefingStreak === 1 ? 'día' : 'días'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="p-2 flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto">
                        <MenuItem
                            icon="📋"
                            label="Tablón de Hoy"
                            badge={briefingPendingCount > 0 ? briefingPendingCount : null}
                            onClick={() => go(onOpenBriefing)}
                            accent="blue"
                        />
                        <MenuItem icon="🛒" label="Tienda" onClick={() => go(onOpenShop)} accent="gold" />
                        <MenuItem icon="🔗" label="Enlaces Rápidos" onClick={() => go(onOpenQuickLinks)} accent="blue" />
                        <MenuItem icon="📝" label="Notas Rápidas" onClick={() => go(openQuickNotes)} accent="yellow" />
                        <MenuItem icon="⚙️" label="Ajustes" onClick={() => go(onOpenSettings)} />
                        <MenuItem icon="📅" label="Disponibilidad / Soporte" onClick={() => go(onOpenAvailability)} accent="blue" />
                        <MenuItem icon="💰" label="Calculadora de Salario" onClick={() => go(onOpenSalaryCalculator)} accent="green" />
                        <MenuItem
                            icon="👨‍💻"
                            label="Bugs / Ideas de la App"
                            onClick={() => go(() => { setIdeaType('dev'); onOpenIdeas(); })}
                            accent="purple"
                        />
                        <MenuItem
                            icon="💡"
                            label="Ideas del Lunes"
                            onClick={() => go(() => { setIdeaType('monday'); onOpenIdeas(); })}
                            accent="yellow"
                        />
                        <div className="h-px bg-white/10 my-1 mx-2" />
                        <MenuItem icon="📖" label="Manual de Usuario" onClick={() => go(onOpenHelp)} accent="default" />
                        {isLeader && (
                            <>
                                <div className="h-px bg-white/10 my-1 mx-2" />
                                <MenuItem
                                    icon="👑"
                                    label="Panel de Líder"
                                    onClick={() => go(() => onOpenDashboard('dashboard'))}
                                    accent="purple"
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Botón flotante único (reemplaza los ~6 botones que había antes) */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-900 transition-all duration-300 active:scale-95 hover:scale-110 ${
                    isOpen ? 'bg-slate-700 rotate-90' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
                title="Menú"
            >
                <span className="text-2xl text-white transition-transform">
                    {isOpen ? '✕' : '☰'}
                </span>
            </button>
        </div>
    );
};

export default FloatingMenu;
