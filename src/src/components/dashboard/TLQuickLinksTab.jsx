// src/components/dashboard/TLQuickLinksTab.jsx
//
// Panel del Team Leader para cargar "Enlaces Rápidos": accesos directos a
// páginas web externas que quiera unificar para todo el equipo.
import React from 'react';

const TLQuickLinksTab = ({ links, newLinkLabel, setNewLinkLabel, newLinkUrl, setNewLinkUrl, addLink, deleteLink }) => {
    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 p-6 rounded-xl border border-white/10 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value)}
                        placeholder='Nombre (ej: "Planilla de turnos")'
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none"
                    />
                    <input
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }}
                        placeholder="https://..."
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none"
                    />
                    <button
                        onClick={addLink}
                        className="bg-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-500 flex-shrink-0"
                    >
                        Agregar
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                    Estos enlaces aparecen para todos los agentes en su menú (☰ → 🔗 Enlaces Rápidos).
                </p>
            </div>

            <div className="space-y-3">
                {links.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">Todavía no cargaste ningún enlace.</p>
                ) : (
                    links.map((link) => (
                        <div
                            key={link.id}
                            className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{link.label}</p>
                                <p className="text-xs text-slate-500 truncate">{link.url}</p>
                            </div>
                            <button
                                onClick={() => deleteLink(link.id)}
                                className="text-red-400 hover:text-red-300 text-xs flex-shrink-0 ml-4"
                            >
                                Borrar
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TLQuickLinksTab;
