import React, { useState, useEffect } from 'react';
import { formatTime, parseTimeStringToMs } from '../../utils/helpers';

const SyncTool = ({ tasks, syncTasksTime, themeClasses }) => {
    const [webWorkInput, setWebWorkInput] = useState('');
    const [mode, setMode] = useState('all'); // 'all' | 'single'
    const [selectedTaskId, setSelectedTaskId] = useState('');

    // 1. Calcular el tiempo total actual en la App
    const totalAppTime = tasks.reduce((acc, t) => acc + t.elapsedTime, 0);

    // 2. Calcular el tiempo objetivo basado en lo que escribes (HH:MM o minutos)
    const targetMs = parseTimeStringToMs(webWorkInput);
    
    // 3. Calcular la diferencia
    const difference = targetMs - totalAppTime;
    
    // Seleccionar la primera tarea por defecto si cambiamos a modo 'single'
    useEffect(() => {
        if (mode === 'single' && !selectedTaskId && tasks.length > 0) {
            setSelectedTaskId(tasks[0].id);
        }
    }, [mode, tasks, selectedTaskId]);

    const handleSync = () => {
        if (Math.abs(difference) < 1000) return; // Evitar clics si no hay diferencia
        syncTasksTime(webWorkInput, mode, selectedTaskId);
    };

    // Helpers de estilo
    const isNegative = difference < 0;
    const diffColor = isNegative ? 'text-red-400' : 'text-green-400';
    const buttonColor = isNegative ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
    const buttonText = isNegative ? 'Restar Tiempo' : 'Añadir Tiempo';

    return (
        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
             <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 text-center ${themeClasses.secondaryText}`}>Sincronizador de Tiempo</h3>
             
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Total en App:</label>
                    {/* CORRECCIÓN: Usamos formatTime para que no salga el número gigante */}
                    <div className="text-xl font-mono text-white font-bold tracking-wider">
                        {formatTime(totalAppTime)}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Timer Webwork (HH:MM):</label>
                    <input 
                        type="text" 
                        value={webWorkInput}
                        onChange={(e) => setWebWorkInput(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:border-blue-500 outline-none font-mono text-lg"
                        placeholder="Ej: 10:00"
                    />
                </div>
             </div>

             {/* Caja de Diferencia */}
             <div className={`border rounded-lg p-3 transition-colors duration-300 ${isNegative ? 'border-red-500/30 bg-red-500/10' : 'border-blue-500/30 bg-blue-500/10'}`}>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400 font-semibold">Diferencia:</span>
                    {/* CORRECCIÓN: Formateamos también la diferencia */}
                    <span className={`text-lg font-bold font-mono ${diffColor}`}>
                        {difference > 0 ? '+' : ''}{formatTime(difference)}
                    </span>
                </div>

                {/* Selector de Modo */}
                <div className="flex bg-gray-800 rounded-lg p-1 mb-3">
                    <button 
                        onClick={() => setMode('single')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${mode === 'single' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Una Tarea
                    </button>
                    <button 
                        onClick={() => setMode('all')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${mode === 'all' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Todas
                    </button>
                </div>

                {/* Dropdown solo si es Una Tarea */}
                {mode === 'single' && (
                    <select 
                        value={selectedTaskId} 
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-xs text-white mb-3 outline-none focus:border-blue-500"
                    >
                        {tasks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                )}

                <div className="text-[10px] text-gray-500 text-center mb-3 italic">
                    {mode === 'all' 
                        ? `Se repartirán ${difference > 0 ? '+' : ''}${Math.round(difference / 1000 / 60)} min uniformemente.` 
                        : `Se ajustará solo a la tarea seleccionada.`}
                </div>

                <button 
                    onClick={handleSync}
                    disabled={Math.abs(difference) < 1000}
                    className={`w-full py-2.5 rounded-lg font-bold text-white transition-all shadow-lg ${buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {buttonText}
                </button>
             </div>
        </div>
    );
};

export default SyncTool;