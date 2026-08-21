import React from 'react';

const TLNewsTab = ({ 
    newsList, 
    newNewsText, 
    setNewNewsText, 
    newNewsType, 
    setNewNewsType, 
    addNews, 
    deleteNews 
}) => {
    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 p-6 rounded-xl border border-white/10 mb-6">
                <div className="flex gap-4">
                    <input 
                        value={newNewsText} 
                        onChange={e => setNewNewsText(e.target.value)} 
                        placeholder="Mensaje..." 
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none" 
                    />
                    <select 
                        value={newNewsType} 
                        onChange={e => setNewNewsType(e.target.value)} 
                        className="bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                    >
                        <option value="info">Info</option>
                        <option value="critical">Crítico</option>
                        <option value="party">Fiesta</option>
                    </select>
                    <button onClick={addNews} className="bg-indigo-600 px-6 rounded-lg font-bold hover:bg-indigo-500">Publicar</button>
                </div>
            </div>
            <div className="space-y-3">
                {newsList.map(n => (
                    <div key={n.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${n.type==='critical'?'bg-red-900 text-red-300':n.type==='party'?'bg-yellow-900 text-yellow-300':'bg-blue-900 text-blue-300'}`}>
                                {n.type}
                            </span>
                            <span className="text-sm">{n.text}</span>
                        </div>
                        <button onClick={() => deleteNews(n.id)} className="text-red-400 hover:text-red-300 text-xs">Borrar</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TLNewsTab;