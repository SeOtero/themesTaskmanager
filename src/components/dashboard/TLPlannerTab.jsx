import React, { useState } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const KNOWN_TASKS = ["Columna CONFIRMADO", "Columna UPSELL", "Columna DATOS ENTREGA", "Columna RESPONDER", "Columna REMINDER", "Chat en vivo (filtro Pendiente)", "Columna LATE VERIFICATION", "Chat en vivo (filtro Abiertos)", "Ordenes confirmadas sheet (CHECK info)", "CHAT Pending Orders", "CALL Pending Orders", "Facebook/Instagram Comments & Chats"];
const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_MAP = { "Lunes": "Monday", "Martes": "Tuesday", "Miércoles": "Wednesday", "Jueves": "Thursday", "Viernes": "Friday", "Sábado": "Saturday", "Domingo": "Sunday" };
const ENGLISH_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TLPlannerTab = ({ 
    squad, 
    weeklyPlan, 
    setWeeklyPlan, 
    agentSchedules, 
    visibleShops, 
    nextWeekId,      
    targetWeek,      
    setTargetWeek    
}) => {
    
    const [viewMode, setViewMode] = useState('kanban'); 
    const [selectedPlanDay, setSelectedPlanDay] = useState("Lunes");
    const [draggedAgent, setDraggedAgent] = useState(null);

    // --- HANDLERS DRAG & DROP ---
    const handleDragStart = (e, agent) => {
        setDraggedAgent(agent);
        e.dataTransfer.setData("agent", JSON.stringify(agent));
    };

    const handleDrop = async (e, taskName, shopName) => {
        e.preventDefault();
        try {
            const agentData = JSON.parse(e.dataTransfer.getData("agent"));
            const newPlan = { ...weeklyPlan };
            if (!newPlan[selectedPlanDay]) newPlan[selectedPlanDay] = {};
            if (!newPlan[selectedPlanDay][taskName]) newPlan[selectedPlanDay][taskName] = {};
            if (!newPlan[selectedPlanDay][taskName][shopName]) newPlan[selectedPlanDay][taskName][shopName] = [];

            const currentAssigns = newPlan[selectedPlanDay][taskName][shopName];

            if (agentData.id === 'ALL') {
                squad.forEach(member => {
                    if (!currentAssigns.find(a => a.id === member.id)) {
                        currentAssigns.push({ id: member.userName || member.name || member.email });
                    }
                });
            } else {
                if (!currentAssigns.find(a => a.id === agentData.id)) {
                    currentAssigns.push({ id: agentData.id, name: agentData.userName || agentData.name || agentData.email });
                }
            }

            setWeeklyPlan(newPlan);
            await setDoc(doc(db, "weekly_plans", nextWeekId), { 
                weekId: nextWeekId, 
                plan: newPlan,
                updatedAt: Date.now()
            }, { merge: true });

        } catch (err) { console.error(err); alert("Error de permisos."); }
    };

    const removeAssign = async (taskName, shopName, agentId) => {
        const newPlan = { ...weeklyPlan };
        newPlan[selectedPlanDay][taskName][shopName] = newPlan[selectedPlanDay][taskName][shopName].filter(a => a.id !== agentId);
        setWeeklyPlan(newPlan);
        try { await setDoc(doc(db, "weekly_plans", nextWeekId), { plan: newPlan }, { merge: true }); } catch (err) { console.error(err); }
    };

    return (
        <div className="flex flex-col h-[85vh] animate-fadeIn gap-4">
            
            {/* --- BARRA DE HERRAMIENTAS (SIN CAMPANA) --- */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/30 p-1 rounded-lg border border-white/5">
                        <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}><span>🧩</span> Asignar</button>
                        <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}><span>📅</span> Planilla</button>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 hidden sm:block">Editando:</span>
                        <div className="flex bg-black/30 p-1 rounded-lg border border-white/5">
                            <button onClick={() => setTargetWeek('current')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${targetWeek === 'current' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Semana Actual</button>
                            <button onClick={() => setTargetWeek('next')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${targetWeek === 'next' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Próxima Semana</button>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 border border-white/5 px-2 py-1 rounded bg-black/20" title="ID de la semana en base de datos">ID: {nextWeekId}</span>
                    </div>
                </div>
            </div>

            {/* --- VISTA KANBAN --- */}
            {viewMode === 'kanban' && (
                <div className="flex gap-6 flex-1 overflow-hidden">
                    <div className="w-64 min-w-[250px] bg-slate-900 border border-white/10 rounded-xl p-4 overflow-y-auto flex flex-col gap-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Mi Squad</h3>
                        <div draggable onDragStart={(e) => handleDragStart(e, { id: 'ALL', name: 'TODOS' })} className="bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded-lg cursor-grab active:cursor-grabbing font-bold text-center border border-yellow-400 shadow-lg mb-4 flex items-center justify-center gap-2"><span>👥</span> ASIGNAR A TODOS</div>
                        {squad.map(agent => {
                            const engDay = DAY_MAP[selectedPlanDay]; 
                            const schedule = agentSchedules[agent.id];
                            const spanDay = selectedPlanDay; 
                            const todaySchedule = schedule ? (schedule[engDay] || schedule[spanDay]) : null;
                            let statusBadge = <span className="text-[9px] text-slate-600">?</span>;
                            if (todaySchedule) {
                                if (todaySchedule.off) statusBadge = <span className="text-[9px] bg-red-900/40 text-red-400 px-1 rounded font-bold border border-red-500/20">OFF</span>;
                                else statusBadge = <span className="text-[9px] bg-green-900/40 text-green-400 px-1 rounded font-bold border border-green-500/20">{todaySchedule.hours}h</span>;
                            }
                            return (
                                <div key={agent.id} draggable onDragStart={(e) => handleDragStart(e, { id: agent.id, userName: agent.userName, name: agent.name, email: agent.email })} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg cursor-grab active:cursor-grabbing border border-white/5 flex items-center gap-3 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">{(agent.userName || agent.name || agent.email).substring(0,2).toUpperCase()}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm truncate font-medium text-slate-300">{agent.userName || agent.name || agent.email}</div>
                                        <div className="flex justify-end">{statusBadge}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex-1 flex flex-col bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        <div className="flex bg-black/40 border-b border-white/10">{WEEK_DAYS.map(d => (<button key={d} onClick={()=>setSelectedPlanDay(d)} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${selectedPlanDay===d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{d}</button>))}</div>
                        <div className="flex-1 overflow-auto p-4 bg-[#0b0e14]">
                            <table className="w-full border-collapse">
                                <thead><tr><th className="text-left p-3 text-slate-500 text-xs uppercase w-48 min-w-[200px] border-b border-white/10 sticky top-0 bg-[#0b0e14] z-10">Tarea</th>{visibleShops.map(s => (<th key={s} className="p-3 text-indigo-400 text-xs uppercase border-l border-white/5 min-w-[180px] text-center border-b border-white/10 sticky top-0 bg-[#0b0e14] z-10">{s}</th>))}</tr></thead>
                                <tbody>{KNOWN_TASKS.map(t => (<tr key={t} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="p-3 text-xs font-medium text-slate-300">{t}</td>{visibleShops.map(s => (<td key={s} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, t, s)} className="p-2 border-l border-white/5 min-h-[50px] relative hover:bg-white/5 transition-colors"><div className="min-h-[40px] rounded p-1 flex flex-wrap gap-1">{weeklyPlan[selectedPlanDay]?.[t]?.[s]?.map(a => (<div key={a.id} className="bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold shadow-sm">{a.name} <button onClick={()=>removeAssign(t,s,a.id)} className="ml-1 text-indigo-400 hover:text-red-400 font-bold">×</button></div>))}</div></td>))}</tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VISTA PLANILLA --- */}
            {viewMode === 'table' && (
                <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-4 bg-black/20 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-green-400 flex items-center gap-2">📅 Disponibilidad Global</h3>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-900/50 border border-green-500/30 rounded"></div><span className="text-xs text-slate-400">Disponible</span><div className="w-3 h-3 bg-red-900/50 border border-red-500/30 rounded ml-2"></div><span className="text-xs text-slate-400">Franco (OFF)</span></div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0b0e14] sticky top-0 z-10"><tr><th className="p-4 text-xs font-bold text-slate-400 uppercase border-b border-white/10 w-64 bg-[#0b0e14] sticky left-0 z-20 border-r border-white/5">Agente</th>{WEEK_DAYS.map(day => (<th key={day} className="p-4 text-xs font-bold text-slate-400 uppercase border-b border-white/10 text-center min-w-[100px]">{day}</th>))}</tr></thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {squad.map(user => {
                                    const userSchedule = agentSchedules[user.id];
                                    return (
                                        <tr key={user.id} className="hover:bg-white/[0.02]">
                                            <td className="p-4 bg-slate-900 sticky left-0 z-10 border-r border-white/5"><div className="font-bold text-white">{user.userName || user.name || user.email}</div><div className="text-[10px] text-slate-500 uppercase">{user.team}</div></td>
                                            {ENGLISH_DAYS.map((engDay, index) => {
                                                const spanDay = WEEK_DAYS[index]; 
                                                const dayData = userSchedule?.[engDay] || userSchedule?.[spanDay];
                                                let cellContent = <span className="text-slate-700">-</span>;
                                                let cellClass = "";
                                                if (dayData) { if (dayData.off) { cellContent = <span className="font-bold text-[10px]">OFF</span>; cellClass = "bg-red-900/20 text-red-400 border border-red-500/10"; } else if (dayData.hours) { cellContent = <span className="font-mono font-bold">{dayData.hours}hs</span>; cellClass = "bg-green-900/20 text-green-400 border border-green-500/10"; } }
                                                return (<td key={engDay} className="p-1 text-center border-l border-white/5"><div className={`h-8 flex items-center justify-center rounded ${cellClass} mx-1`}>{cellContent}</div></td>);
                                            })}
                                        </tr>
                                    );
                                })}
                                {squad.length === 0 && (<tr><td colSpan={8} className="p-10 text-center text-slate-500 italic">No hay agentes en este equipo.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TLPlannerTab;