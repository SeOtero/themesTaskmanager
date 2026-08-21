// src/components/ui/QuickLinksModal.jsx
import React from 'react';

const QuickLinksModal = ({ isOpen, onClose, links, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-b border-white/10">
                    <h2 className="text-white font-black text-lg">🔗 Enlaces Rápidos</h2>
                    <p className="text-slate-400 text-xs mt-1">Accesos directos cargados por tu Team Leader</p>
                </div>

                <div className="p-4 flex flex-col gap-2 max-h-[55vh] overflow-y-auto">
                    {loading ? (
                        <p className="text-slate-500 text-sm text-center py-6">Cargando...</p>
                    ) : links.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">
                            Todavía no hay enlaces cargados.
                        </p>
                    ) : (
                        links.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-200"
                            >
                                <span className="text-lg flex-shrink-0">🔗</span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-semibold truncate">{link.label}</span>
                                    <span className="block text-[11px] text-slate-500 truncate">{link.url}</span>
                                </span>
                                <span className="text-slate-500 text-xs flex-shrink-0">↗</span>
                            </a>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickLinksModal;
