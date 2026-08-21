import React from 'react';

const TLIdeasTab = ({ 
    activeTab, 
    showArchived, 
    setShowArchived, 
    fetchIdeas, 
    filteredIdeas, // ✅ Pasaremos la lista ya filtrada desde el padre
    generateMondaySummary, 
    handleSaveAnalysis, 
    handleIdeaVerdict, 
    handleArchiveIdea, 
    handleDeleteIdea, 
    handleRestoreIdea, 
    handleAnalysisChange 
}) => {
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {activeTab === 'ideas' ? '🧠 Laboratorio de Ideas' : '👨‍💻 Tickets de Soporte & Bugs'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Estado: <span className="text-indigo-400 font-bold">{showArchived ? 'ARCHIVADOS' : 'ACTIVOS'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab === 'ideas' && (
                        <button onClick={generateMondaySummary} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors shadow-lg flex items-center gap-2 border border-indigo-400/50">
                            📋 RESUMEN
                        </button>
                    )}
                    <button onClick={() => setShowArchived(!showArchived)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${showArchived ? 'bg-slate-700 text-white border-slate-500' : 'bg-black/40 text-slate-500 border-slate-700 hover:text-white'}`}>
                        {showArchived ? '👁️ Ver Activos' : '📦 Ver Archivados'}
                    </button>
                    <button onClick={fetchIdeas} className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-xs text-slate-300 border border-white/10">↻</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIdeas.map(idea => {
                    const isApproved = idea.status === 'approved'; 
                    const isRejected = idea.status === 'rejected'; 
                    const isPending = idea.status === 'new'; 
                    const isDevType = idea.type === 'dev';
                    
                    return (
                        <div key={idea.id} className={`bg-slate-900 border rounded-xl p-5 flex flex-col gap-3 relative group transition-all animate-fadeIn hover:shadow-xl ${isDevType ? 'border-purple-500/20 shadow-[0_0_10px_rgba(147,51,234,0.05)]' : 'border-white/10'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold text-sm ${isDevType ? 'text-purple-300 font-mono' : 'text-white'}`}>{idea.userName}</h4>
                                        {isDevType && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-purple-900/30 text-purple-300 border-purple-500/30">BUG/DEV</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{idea.timestampStr}</p>
                                </div>
                                {isApproved && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20 font-bold">✓ APROBADA</span>} 
                                {isRejected && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-500/20 font-bold">✕ RECHAZADA</span>} 
                                {isPending && <span className="text-[10px] bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 font-bold">⏳ PENDIENTE</span>}
                            </div>
                            
                            <div className={`p-4 rounded-lg border min-h-[80px] ${isDevType ? 'bg-black/60 border-purple-900/30 font-mono text-xs text-green-400' : 'bg-black/30 border-white/5 text-sm text-slate-300 italic'}`}>
                                "{idea.content}"
                            </div>
                            
                            {!isDevType && (
                                <div className="space-y-2 mt-2">
                                    <div className="relative">
                                        <span className="absolute top-2 left-2 text-[10px] text-green-500 font-bold">PROS</span>
                                        <textarea className="w-full bg-slate-950 border border-white/10 rounded p-2 pt-6 text-xs text-slate-300 focus:border-green-500 outline-none h-16 resize-none" value={idea.analysis?.pros || ''} onChange={(e) => handleAnalysisChange(idea.id, 'pros', e.target.value)} />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute top-2 left-2 text-[10px] text-red-500 font-bold">CONS</span>
                                        <textarea className="w-full bg-slate-950 border border-white/10 rounded p-2 pt-6 text-xs text-slate-300 focus:border-red-500 outline-none h-16 resize-none" value={idea.analysis?.cons || ''} onChange={(e) => handleAnalysisChange(idea.id, 'cons', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                                {!isDevType && <button onClick={() => handleSaveAnalysis(idea.id, idea.analysis)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold py-2 rounded transition-colors">💾 Guardar</button>}
                                
                                {isPending && (
                                    <>
                                        <button onClick={() => handleIdeaVerdict(idea, 'approved')} className="flex-1 bg-green-600/20 hover:bg-green-600 hover:text-white text-green-400 text-xs font-bold py-2 rounded transition-colors border border-green-600/30">👍 Aprobar</button>
                                        <button onClick={() => handleIdeaVerdict(idea, 'rejected')} className="w-10 flex items-center justify-center bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded transition-colors border border-red-600/30">👎</button>
                                    </>
                                )}
                                
                                {(isApproved || isRejected) && !showArchived && (
                                    <>
                                        <button onClick={() => handleArchiveIdea(idea.id)} className="w-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded transition-colors border border-slate-600" title="Archivar">📦</button>
                                        <button onClick={() => handleDeleteIdea(idea.id)} className="w-10 flex items-center justify-center bg-red-900/20 hover:bg-red-900/80 text-red-500 hover:text-white font-bold rounded transition-colors border border-red-900/30" title="Eliminar">🗑️</button>
                                    </>
                                )}
                                
                                {showArchived && <button onClick={() => handleRestoreIdea(idea.id)} className="w-full flex items-center justify-center bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-2 rounded transition-colors border border-blue-500/20">♻️ Restaurar</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TLIdeasTab;