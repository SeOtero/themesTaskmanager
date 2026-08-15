// src/components/ui/DailyBriefingModal.jsx
//
// "¿Qué tenés que saber hoy?" — se abre automáticamente al iniciar la app si
// hay anuncios/tareas pendientes para hoy. Pensado como red de contención para
// agentes olvidadizos: recordatorios y tareas puntuales del día, tildables.
// Si se completa todo, otorga la medalla "Flawless" y suma a la racha.
import React from 'react';

const DailyBriefingModal = ({
    isOpen,
    onClose,
    userName,
    items,
    checkedIds,
    isComplete,
    streak,
    history,
    toggleItem,
    onOpenAvailability,
    onOpenReport,
}) => {
    if (!isOpen) return null;

    const completedCount = items.filter((it) => checkedIds.includes(it.id)).length;
    const greetingName = userName || 'Agente';

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-b border-white/10">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-white font-black text-lg">
                                👋 Hola {greetingName}, esto es lo que tenés que saber para arrancar tu día hoy
                            </h2>
                            <p className="text-slate-400 text-xs mt-1">
                                {completedCount}/{items.length} completadas
                            </p>
                        </div>
                        {streak > 0 && (
                            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 px-3 py-1.5 rounded-full flex-shrink-0">
                                <span className="text-lg">🏅</span>
                                <span className="text-amber-300 font-bold text-xs whitespace-nowrap">
                                    Racha: {streak} {streak === 1 ? 'día' : 'días'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Banner de completado */}
                {isComplete && (
                    <div className="px-5 pt-4">
                        <div className="bg-emerald-900/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2 animate-fadeIn">
                            <span className="text-2xl">🏅</span>
                            <span className="text-emerald-200 text-sm font-bold">
                                ¡Día Flawless! Completaste todo lo de hoy.
                            </span>
                        </div>
                    </div>
                )}

                {/* Checklist */}
                <div className="p-5 flex flex-col gap-2 max-h-[45vh] overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">
                            No hay anuncios para hoy. ¡Buen día! 🎧
                        </p>
                    ) : (
                                        items.map((item) => {
                            const checked = checkedIds.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                        checked
                                            ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200'
                                            : 'bg-white/5 border-white/10 text-slate-200'
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                    >
                                        <span
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                                checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                                            }`}
                                        >
                                            {checked && <span className="text-[11px] text-white">✓</span>}
                                        </span>
                                        <span className={`text-sm ${checked ? 'line-through opacity-70' : ''}`}>
                                            {item.text}
                                        </span>
                                    </button>
                                    {item.actionType === 'availability' && onOpenAvailability && (
                                        <button
                                            onClick={() => onOpenAvailability()}
                                            className="text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex-shrink-0 whitespace-nowrap"
                                        >
                                            📅 Cargar
                                        </button>
                                    )}
                                    {item.actionType === 'eod_report' && onOpenReport && (
                                        <button
                                            onClick={() => onOpenReport()}
                                            className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex-shrink-0 whitespace-nowrap"
                                        >
                                            📝 Grabar EOD
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Historial reciente (colapsable simple) */}
                {history.length > 0 && (
                    <details className="px-5 pb-2">
                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300">
                            Ver historial de días flawless ({history.length})
                        </summary>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {[...history].reverse().slice(0, 20).map((date) => (
                                <span key={date} className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-full">
                                    🏅 {date}
                                </span>
                            ))}
                        </div>
                    </details>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
                    >
                        {isComplete || items.length === 0 ? 'Cerrar' : 'Ya lo leí, seguir después'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyBriefingModal;
