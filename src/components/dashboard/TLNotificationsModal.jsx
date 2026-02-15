import React, { useState } from 'react';

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TLNotificationsModal = ({ 
    isOpen, 
    onClose, 
    scheduleRequests, 
    pendingIdeas, 
    handleApproveRequest, 
    handleRejectRequest,
    onNavigate // <--- NUEVA PROP: Para redirigir al módulo
}) => {
    
    const [activeTab, setActiveTab] = useState('schedule'); 

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
                
                {/* HEADER */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔔</span>
                        <h3 className="text-lg font-bold text-white">Centro de Notificaciones</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-white/5 bg-black/20">
                    <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === 'schedule' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        📅 Horarios ({scheduleRequests.length})
                    </button>
                    <button onClick={() => setActiveTab('ideas')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === 'ideas' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        💡 Ideas ({pendingIdeas.length})
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-[#0b0e14]">
                    
                    {/* --- PESTAÑA 1: HORARIOS (Igual que antes) --- */}
                    {activeTab === 'schedule' && (
                        <>
                            {scheduleRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500"><span className="text-2xl mb-2">✅</span><p className="text-sm">Todo al día.</p></div>
                            ) : (
                                scheduleRequests.map(req => {
                                    const isUrgent = req.type === 'urgent';
                                    const showComparison = !!req.currentSchedule;
                                    return (
                                        <div key={req.id} className={`bg-white/5 border rounded-xl p-4 flex flex-col gap-3 ${isUrgent ? 'border-orange-500/30' : 'border-white/5'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-white flex items-center gap-2">{req.userName} {isUrgent && <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded animate-pulse">URGENTE</span>}</h4>
                                                    <p className={`text-xs mt-1 font-bold ${isUrgent ? 'text-orange-400' : 'text-blue-300'}`}>{req.message || "Solicitud de cambio"}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">Semana ID: {req.weekId}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveRequest(req)} className="bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded text-xs font-bold text-white shadow-lg">✓ APROBAR</button>
                                                    <button onClick={() => handleRejectRequest(req.id)} className="bg-red-900/50 hover:bg-red-600 px-3 py-1.5 rounded text-xs font-bold text-red-200 hover:text-white border border-red-500/30">✕ RECHAZAR</button>
                                                </div>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-lg space-y-2">
                                                {showComparison && renderScheduleRow(req.currentSchedule, "ACTUAL", true)}
                                                {renderScheduleRow(req.proposedSchedule, showComparison ? "NUEVO" : "HORARIO")}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </>
                    )}

                    {/* --- PESTAÑA 2: IDEAS (MODIFICADA) --- */}
                    {activeTab === 'ideas' && (
                        <>
                            {pendingIdeas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                    <span className="text-2xl mb-2">🧠</span>
                                    <p className="text-sm">Sin ideas nuevas.</p>
                                </div>
                            ) : (
                                pendingIdeas.map(idea => (
                                    <div key={idea.id} className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 flex justify-between items-center hover:bg-indigo-900/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center text-xl border border-indigo-500/30">
                                                💡
                                            </div>
                                            <div>
                                                {/* 🔥 MENSAJE DE NOTIFICACIÓN 🔥 */}
                                                <h4 className="font-bold text-indigo-200 text-sm">
                                                    <span className="text-white">{idea.userName}</span> tuvo una nueva idea
                                                </h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{idea.timestampStr}</p>
                                                <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">"{idea.content}"</p>
                                            </div>
                                        </div>
                                        
                                        {/* 🔥 BOTÓN DE NAVEGACIÓN 🔥 */}
                                        <button 
                                            onClick={() => onNavigate('ideas')} 
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg border border-indigo-400/50 flex items-center gap-2 transition-all active:scale-95"
                                        >
                                            VER EN LAB ➔
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper interno (sin cambios)
const renderScheduleRow = (schedule, label, isComparison = false) => (
    <div className="flex items-center gap-2">
        <div className={`w-16 text-[9px] font-bold text-right uppercase ${isComparison ? 'text-slate-500' : 'text-indigo-300'}`}>{label}</div>
        <div className="grid grid-cols-7 gap-1 flex-1">
            {WEEK_DAYS.map(day => {
                const data = schedule?.[day];
                if (!data) return <div key={day} className="text-center opacity-20"><div className="text-[8px]">{day.substring(0,2)}</div>-</div>;
                const offStyle = isComparison ? 'text-slate-500 bg-slate-800/50' : 'text-red-300 bg-red-900/30 font-bold';
                const onStyle = isComparison ? 'text-slate-400 bg-slate-800/50' : 'text-green-300 bg-green-900/30 font-bold';
                if (data.off) return <div key={day} className={`text-center rounded p-1 ${offStyle}`}><div className="text-[8px] opacity-70">{day.substring(0,2)}</div><div className="text-[9px]">OFF</div></div>;
                if (data.hours > 0) return <div key={day} className={`text-center rounded p-1 ${onStyle}`}><div className="text-[8px] opacity-70">{day.substring(0,2)}</div><div className="text-[9px]">{data.hours}h</div></div>;
                return <div key={day} className="text-center opacity-20"><div className="text-[8px]">{day.substring(0,2)}</div>-</div>;
            })}
        </div>
    </div>
);

export default TLNotificationsModal;