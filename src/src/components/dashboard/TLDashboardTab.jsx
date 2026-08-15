import React from 'react';

const TLDashboardTab = ({ 
    // DATOS
    processedData, 
    detectedTasks, 
    taskGoals, 
    selectedTeam,
    isLoading,
    
    // FILTROS
    selectedTaskFilter, 
    setSelectedTaskFilter, 
    viewMode, 
    setViewMode, 
    filterDate, 
    setFilterDate, 
    expandedReportId,
    
    // FUNCIONES
    fetchTeamData, 
    toggleRow, 
    formatTime, 
    getPerformanceColor 
}) => {

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* --- BARRA DE FILTROS --- */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-900 border border-white/10 p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 w-full xl:w-auto bg-black/30 p-1.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase px-2">Filtrar:</span>
                    <select 
                        value={selectedTaskFilter} 
                        onChange={(e) => setSelectedTaskFilter(e.target.value)} 
                        className="bg-transparent text-white text-xs font-bold outline-none w-full xl:w-64 cursor-pointer hover:text-indigo-400 transition-colors"
                    >
                        <option value="ALL" className="bg-slate-900">📋 TODAS LAS TAREAS</option>
                        {detectedTasks.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                    </select>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="flex bg-black/30 rounded-lg p-1 border border-white/5">
                        {['daily', 'weekly', 'monthly'].map(mode => (
                            <button 
                                key={mode} 
                                onClick={() => setViewMode(mode)} 
                                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {{ daily: 'Día', weekly: 'Semana', monthly: 'Mes' }[mode]}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-indigo-400 text-xs">📅</span>
                        </div>
                        <input 
                            type="date" 
                            value={filterDate} 
                            onChange={(e) => setFilterDate(e.target.value)} 
                            className="bg-black/30 border border-white/10 text-white text-xs font-bold rounded-lg py-2 pl-9 pr-3 outline-none focus:border-indigo-500 transition-all cursor-pointer hover:bg-black/50"
                        />
                    </div>
                    
                    <button 
                        onClick={fetchTeamData} 
                        disabled={isLoading} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-all shadow-lg active:scale-95 border border-indigo-400/50"
                    >
                        {isLoading ? '...' : '↻'}
                    </button>
                </div>
            </div>

            {/* --- TABLA DE RESULTADOS --- */}
            <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 text-slate-400 text-[10px] uppercase tracking-wider border-b border-white/5">
                                <th className="p-5 font-bold">Agente</th>
                                <th className="p-5 font-bold text-center">Tareas</th>
                                <th className="p-5 font-bold text-center text-indigo-400">Velocidad</th>
                                <th className="p-5 font-bold text-center">Tiempo</th>
                                <th className="p-5 font-bold text-center">Estado</th>
                                <th className="p-5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {processedData.length > 0 ? processedData.map((agent) => {
                                let displayCount = agent.metrics.totalTasks; 
                                let displaySpeed = agent.metrics.globalSpeed; 
                                let displayHours = agent.metrics.totalTimeMs; 
                                let speedColor = "text-slate-300";
                                
                                if (selectedTaskFilter !== 'ALL') { 
                                    const taskData = agent.taskBreakdown.find(t => t.name === selectedTaskFilter); 
                                    if (taskData) { 
                                        displayCount = taskData.count; 
                                        displaySpeed = taskData.speed; 
                                        displayHours = taskData.timeMs; 
                                        let goal = taskGoals[selectedTaskFilter]; 
                                        if (goal === undefined) goal = -1; 
                                        speedColor = getPerformanceColor(displaySpeed, goal); 
                                    } else { 
                                        displayCount = 0; 
                                        displaySpeed = "0.00"; 
                                        displayHours = 0; 
                                        speedColor = "text-slate-600"; 
                                    } 
                                } else { 
                                    speedColor = "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold"; 
                                }

                                return (
                                    <React.Fragment key={agent.id}>
                                        <tr className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => toggleRow(agent.id)}>
                                            <td className="p-5 font-medium text-slate-200 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-xs text-indigo-400 font-bold">{agent.userName?.charAt(0) || '?'}</div>
                                                <div>
                                                    <div>{agent.userName}</div>
                                                    {selectedTeam === 'ALL_TEAMS' && <div className="text-[9px] text-slate-500 uppercase">{agent.team}</div>}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center font-mono text-slate-300">{displayCount}</td>
                                            <td className="p-5 text-center">
                                                <span className={`text-lg ${speedColor}`}>{displaySpeed}</span>
                                                <span className="text-[10px] text-slate-600 ml-1">/h</span>
                                            </td>
                                            <td className="p-5 text-center text-slate-500 font-mono">{formatTime(displayHours)}</td>
                                            <td className="p-5 text-center"><span className="bg-green-900/30 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20">ACTIVO</span></td>
                                            <td className="p-5 text-right">
                                                <button className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded transition-all">
                                                    {expandedReportId === agent.id ? 'Cerrar ▲' : 'Ver ▼'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedReportId === agent.id && ( 
                                            <tr className="bg-black/30">
                                                <td colSpan={6} className="p-4">
                                                    <div className="bg-slate-900 rounded-xl p-4 border border-white/5 shadow-inner">
                                                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase flex items-center gap-2">🔍 Desglose Detallado</h4>
                                                        {agent.taskBreakdown?.length > 0 ? (
                                                            <table className="w-full text-xs">
                                                                <thead>
                                                                    <tr className="text-slate-600 border-b border-white/5 text-left">
                                                                        <th className="pb-2 pl-2">Tarea</th>
                                                                        <th className="pb-2 text-center">Cant.</th>
                                                                        <th className="pb-2 text-center">Tiempo</th>
                                                                        <th className="pb-2 text-right pr-4">Rendimiento</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {agent.taskBreakdown.map((t, idx) => { 
                                                                        let goal = taskGoals[t.name]; 
                                                                        if (goal === undefined) goal = -1; 
                                                                        const color = getPerformanceColor(t.speed, goal); 
                                                                        const isNoExp = goal === -1; 
                                                                        return (
                                                                            <tr key={idx} className={`text-slate-300 hover:bg-white/5 transition-colors ${selectedTaskFilter === t.name ? 'bg-indigo-900/20' : ''}`}>
                                                                                <td className="py-2 pl-2 font-medium">{t.name}</td>
                                                                                <td className="py-2 text-center font-mono text-slate-500">{t.count}</td>
                                                                                <td className="py-2 text-center font-mono text-slate-500">{formatTime(t.timeMs)}</td>
                                                                                <td className="py-2 text-right pr-4">
                                                                                    <span className={color}>{t.speed} /h</span> 
                                                                                    <span className="text-[9px] text-slate-600 ml-1">{isNoExp ? '' : `(Meta: ${goal})`}</span>
                                                                                </td>
                                                                            </tr>
                                                                        ); 
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        ) : <p className="text-xs text-slate-500 italic">Sin datos.</p>}
                                                    </div>
                                                </td>
                                            </tr> 
                                        )}
                                    </React.Fragment>
                                );
                            }) : (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500 text-sm italic border-t border-white/5">{isLoading ? 'Cargando datos...' : 'No hay actividad registrada en este periodo.'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TLDashboardTab;