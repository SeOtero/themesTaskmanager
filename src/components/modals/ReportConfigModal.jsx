import React, { useState, useEffect, useMemo } from 'react';

const ReportConfigModal = ({ isOpen, onClose, onGenerate, tasks, distributeTasksTime, themeClasses, selectedReportDate, setSelectedReportDate, pastReports = [] }) => {
    
    if (!isOpen) return null;

    // --- ESTADOS ---
    const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
    const [webWorkTime, setWebWorkTime] = useState(''); 
    const [appTotalString, setAppTotalString] = useState("00:00:00");
    const [selectedTaskIds, setSelectedTaskIds] = useState([]); 

    // --- CÁLCULOS EN VIVO ---
    const currentTotalMs = useMemo(() => {
        return tasks.reduce((acc, t) => {
            const currentSession = t.running ? (Date.now() - t.lastTime) : 0;
            return acc + t.elapsedTime + currentSession;
        }, 0);
    }, [tasks, isOpen]);

    useEffect(() => {
        const h = Math.floor(currentTotalMs / 3600000).toString().padStart(2, '0');
        const m = Math.floor((currentTotalMs % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((currentTotalMs % 60000) / 1000).toString().padStart(2, '0');
        setAppTotalString(`${h}:${m}:${s}`);
    }, [currentTotalMs]);

    // --- HELPERS ---
    const getFormattedDate = (isoDate) => {
        if (!isoDate) return "DD/MM/YYYY";
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const parseTimeStringToMs = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':').map(Number);
        let h = 0, m = 0, s = 0;
        if (parts.length === 3) { [h, m, s] = parts; }      
        else if (parts.length === 2) { [h, m] = parts; }    
        return ((h * 3600) + (m * 60) + s) * 1000;
    };

    const formatMs = (ms) => {
        const absMs = Math.abs(ms);
        const h = Math.floor(absMs / 3600000).toString().padStart(2, '0');
        const m = Math.floor((absMs % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((absMs % 60000) / 1000).toString().padStart(2, '0');
        return `${ms < 0 ? '-' : ''}${h}:${m}:${s}`;
    };

    const targetMs = parseTimeStringToMs(webWorkTime);
    const differenceMs = targetMs - currentTotalMs; 

    // --- HANDLERS ---
    
    // ✅ CORRECCIÓN AQUÍ: Solo llamamos a onGenerate(), no intentamos generar el texto aquí.
    const handleConfirmClick = () => {
        const reportExists = Array.isArray(pastReports) && pastReports.some(r => r.id === selectedReportDate);
        
        if (reportExists) { 
            setShowOverwriteWarning(true); 
        } else { 
            // Simplemente avisamos al padre (App.jsx) que proceda
            onGenerate(); 
        }
    };

    const handleTimeChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 6) val = val.slice(0, 6);
        if (val.length > 4) val = val.replace(/^(\d{2})(\d{2})(\d{0,2})/, '$1:$2:$3');
        else if (val.length > 2) val = val.replace(/^(\d{2})(\d{0,2})/, '$1:$2');
        setWebWorkTime(val); 
    };

    const toggleTaskSelection = (taskId) => {
        setSelectedTaskIds(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTaskIds.length === tasks.length) setSelectedTaskIds([]);
        else setSelectedTaskIds(tasks.map(t => t.id));
    };

    const handleSmartSync = () => {
        if (differenceMs === 0) return;
        if (selectedTaskIds.length === 0) { alert("Por favor selecciona al menos una tarea."); return; }
        distributeTasksTime(selectedTaskIds, differenceMs);
        const accion = differenceMs > 0 ? "repartido" : "descontado";
        alert(`Se han ${accion} ${formatMs(Math.abs(differenceMs))} entre las ${selectedTaskIds.length} tareas seleccionadas.`);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className={`relative w-full max-w-lg p-6 rounded-2xl shadow-2xl ${themeClasses.modalBg || 'bg-gray-800 border-gray-600'} border-2 modal-content max-h-[90vh] overflow-y-auto flex flex-col`}>
                
                {showOverwriteWarning ? (
                    <div className="flex flex-col items-center text-center animate-pulse">
                        <div className="bg-red-500/20 p-4 rounded-full mb-3 border-2 border-red-500">⚠️</div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">¡Cuidado!</h3>
                        <p className="text-gray-300 mb-6">Ya existe un reporte para esta fecha.</p>
                        <div className="flex flex-col gap-3 w-full">
                            {/* ✅ CORRECCIÓN: Aquí también solo llamamos a onGenerate */}
                            <button onClick={() => onGenerate()} className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg">Sí, Sobreescribir</button>
                            <button onClick={() => setShowOverwriteWarning(false)} className="w-full py-3 rounded-xl font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition">Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className={`text-xl font-bold mb-4 text-center ${themeClasses.primaryText}`}>Preparar Reporte</h2>
                        
                        <div className="mb-4 flex justify-center">
                            <div className="relative group cursor-pointer border border-cyan-500/30 bg-black/40 px-4 py-2 rounded-lg flex items-center gap-2">
                                <span className="text-white font-mono">{getFormattedDate(selectedReportDate)}</span>
                                <span className="text-cyan-400">📅</span>
                                <input type="date" value={selectedReportDate} onChange={(e) => setSelectedReportDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Sincronización</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-2 bg-black/20 rounded-lg">
                                    <label className="text-[10px] text-gray-500 block">TIEMPO APP</label>
                                    <span className="text-lg font-mono font-bold text-white">{appTotalString}</span>
                                </div>
                                <div className="text-center">
                                    <label className="text-[10px] text-cyan-400 block mb-1">WEBWORK (HH:MM:SS)</label>
                                    <input type="text" value={webWorkTime} onChange={handleTimeChange} placeholder="00:00:00" maxLength={8} className={`w-full bg-black/50 border ${themeClasses.inputBorder} text-cyan-300 text-lg font-mono p-1 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-cyan-500`} />
                                </div>
                            </div>

                            {webWorkTime.length >= 4 && (
                                <div className={`text-center mb-4 text-sm font-bold py-1 rounded ${differenceMs > 0 ? 'bg-green-900/30 text-green-400' : (differenceMs < 0 ? 'bg-red-900/30 text-red-400' : 'text-gray-500')}`}>
                                    {differenceMs > 0 ? `Faltan cargar: ${formatMs(differenceMs)}` : (differenceMs < 0 ? `Te pasaste por: ${formatMs(differenceMs)}` : '¡Sincronizado!')}
                                </div>
                            )}

                            {differenceMs !== 0 && (
                                <div className="animate-fadeIn">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-gray-400">{differenceMs > 0 ? 'Elige dónde SUMAR tiempo:' : 'Elige dónde RESTAR tiempo:'}</p>
                                        <button onClick={handleSelectAll} className="text-[10px] text-cyan-400 hover:text-cyan-300 underline">{selectedTaskIds.length === tasks.length ? 'Deseleccionar' : 'Todos'}</button>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar border border-white/5 rounded-lg bg-black/20 p-2 space-y-1">
                                        {tasks.map(task => (
                                            <div key={task.id} onClick={() => toggleTaskSelection(task.id)} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedTaskIds.includes(task.id) ? (differenceMs > 0 ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-red-900/30 border border-red-500/30') : 'hover:bg-white/5 border border-transparent'}`}>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedTaskIds.includes(task.id) ? (differenceMs > 0 ? 'bg-emerald-500 border-emerald-500' : 'bg-red-500 border-red-500') : 'border-gray-600'}`}>{selectedTaskIds.includes(task.id) && <span className="text-black text-[10px] font-bold">✓</span>}</div>
                                                <div className="flex-1 min-w-0"><p className="text-sm text-gray-200 truncate">{task.text || task.name}</p></div>
                                                <span className="text-xs font-mono text-gray-500">{formatMs(task.elapsedTime)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-center mt-2 text-cyan-200/70">{differenceMs > 0 ? 'Se sumarán' : 'Se restarán'} <span className="font-bold">{selectedTaskIds.length > 0 ? formatMs(Math.abs(differenceMs / selectedTaskIds.length)) : '00:00:00'}</span> {differenceMs > 0 ? 'a' : 'de'} cada tarea seleccionada.</p>
                                </div>
                            )}

                            <button onClick={handleSmartSync} disabled={webWorkTime.length < 4 || (differenceMs !== 0 && selectedTaskIds.length === 0)} className={`w-full mt-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${differenceMs === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : differenceMs > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'}`}>{differenceMs > 0 ? '⚡ Repartir (Sumar)' : (differenceMs < 0 ? '✂️ Recortar (Restar)' : 'Perfecto')}</button>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={handleConfirmClick} className={`flex-1 py-3 rounded-full font-bold text-white shadow-lg ${themeClasses.buttonAction}`}>Generar Reporte</button>
                            <button onClick={onClose} className="px-6 py-3 rounded-full font-bold text-gray-300 bg-gray-700 hover:bg-gray-600">Cancelar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportConfigModal;