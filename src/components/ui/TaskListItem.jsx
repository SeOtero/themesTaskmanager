import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../../utils/helpers';
import { shopOptions } from '../../data/constants';

const TaskListItem = ({ task, toggleTimer, deleteTask, updateTaskDetails, themeClasses, resetTaskTimer, celebrationThemeName }) => {
    // Estados locales para la edición
    const [isEditingTime, setIsEditingTime] = useState(false); 
    const [editedTime, setEditedTime] = useState(''); 
    
    const [isEditingQuantity, setIsEditingQuantity] = useState(false); 
    const [editedQuantity, setEditedQuantity] = useState(task.quantity || ''); 
    
    const [isEditingShop, setIsEditingShop] = useState(false); 
    const [editedShop, setEditedShop] = useState(task.shop); 
    
    const [isEditingName, setIsEditingName] = useState(false); 
    const [editedName, setEditedName] = useState(task.rawTaskName);
    
    // Estados de confirmación
    const [isConfirmingReset, setIsConfirmingReset] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // --- CORRECCIÓN CLAVE ---
    // No calculamos el tiempo aquí. Confiamos 100% en 'task.elapsedTime' que ya viene calculado "en vivo" desde useTasks.js
    // Esto evita desincronizaciones y "saltos" de tiempo.
    const displayTime = formatTime(task.elapsedTime);

    // Sincronizar el input de edición solo al abrir el modo edición
    useEffect(() => {
        if (isEditingTime) {
            setEditedTime(displayTime);
        }
    }, [isEditingTime]); // Quitamos displayTime de dep, solo actualizamos al abrir

    const isCustomTask = task.isCustom; 

    // --- HANDLERS ---

    const handleTimeEdit = () => { 
        const parts = editedTime.split(':').map(Number); 
        if (parts.length === 3 && !parts.some(isNaN)) { 
            const totalMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000; 
            // Al guardar manual, si está corriendo, reseteamos el lastTime para evitar saltos
            updateTaskDetails(task.id, { 
                elapsedTime: totalMs, 
                lastTime: task.running ? Date.now() : null 
            }); 
        } 
        setIsEditingTime(false); 
    };

    const handleQuantityEdit = () => { 
        updateTaskDetails(task.id, { quantity: parseInt(editedQuantity) || 0 }); 
        setIsEditingQuantity(false); 
    };

    const handleShopEdit = () => { 
        if (editedShop) updateTaskDetails(task.id, { shop: editedShop }); 
        setIsEditingShop(false); 
    };

    const handleNameEdit = () => { 
        const nameToUpdate = editedName.trim() || 'Tarea sin Nombre'; 
        updateTaskDetails(task.id, { rawTaskName: nameToUpdate }); 
        setIsEditingName(false); 
    };

    const handleResetClick = () => { 
        resetTaskTimer(task.id); 
        setIsConfirmingReset(false); 
    };
    
    const handleDeleteConfirm = () => { 
        deleteTask(task.id); 
        setIsConfirmingDelete(false); 
    };

    // --- ESTILOS ---
    const runningBorderClass = task.running 
        ? (celebrationThemeName === 'biancaBday' ? 'border-l-4 border-pink-400' : 'border-l-4 border-green-500') 
        : 'border-l-4 border-gray-600';
        
    const buttonIncrementClass = task.running 
        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
        : 'bg-gray-600 hover:bg-gray-500 text-gray-200';

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:gap-4 sm:p-4 rounded-xl shadow-md transition-all duration-300 ${themeClasses.itemBg} ${runningBorderClass}`}>
            
            {/* IZQUIERDA: DATOS */}
            <div className="flex flex-col gap-1 min-w-0 flex-grow">
                {/* Tienda */}
                {isEditingShop ? (
                    <select 
                        value={editedShop} 
                        onChange={(e) => setEditedShop(e.target.value)} 
                        onBlur={handleShopEdit} 
                        className={`px-2 py-1 border-b-2 bg-gray-900 focus:outline-none w-full sm:w-40 rounded ${themeClasses.accentText} border-pink-500 text-xs sm:text-sm font-bold`} 
                        autoFocus
                    >
                        {shopOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : ( 
                    <span 
                        className={`font-bold text-xs sm:text-sm uppercase tracking-wider opacity-80 cursor-pointer hover:text-white transition-colors ${themeClasses.accentText}`} 
                        onClick={() => { setEditedShop(task.shop); setIsEditingShop(true); }}
                    >
                        {task.shop || 'Sin Tienda'}
                    </span> 
                )}
                
                {/* Nombre */}
                {isEditingName && isCustomTask ? (
                    <input 
                        type="text" 
                        value={editedName} 
                        onChange={(e) => setEditedName(e.target.value)} 
                        onBlur={handleNameEdit} 
                        onKeyPress={(e) => e.key === 'Enter' && handleNameEdit()} 
                        className={`font-medium text-base sm:text-lg border-b-2 bg-transparent focus:outline-none w-full ${themeClasses.secondaryText} border-pink-500`} 
                        autoFocus 
                    />
                ) : ( 
                    <span 
                        className={`font-medium text-base sm:text-lg break-words ${isCustomTask ? 'cursor-pointer hover:underline decoration-dashed' : ''} ${themeClasses.secondaryText}`} 
                        onClick={() => { if (isCustomTask) { setEditedName(task.rawTaskName); setIsEditingName(true); } }}
                    >
                        {task.rawTaskName || task.name}
                    </span> 
                )}
                
                {/* Cantidad */}
                <div className="flex items-center gap-3 mt-1">
                    {isEditingQuantity ? (
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Cant:</span>
                            <input 
                                type="number" 
                                value={editedQuantity} 
                                onChange={(e) => setEditedQuantity(e.target.value)} 
                                onBlur={handleQuantityEdit} 
                                onKeyPress={(e) => e.key === 'Enter' && handleQuantityEdit()} 
                                className={`font-mono text-sm sm:text-base border-b-2 bg-gray-800/50 focus:outline-none w-16 sm:w-20 text-center rounded px-1 ${themeClasses.primaryText} border-blue-500`} 
                                autoFocus 
                            />
                        </div>
                    ) : ( 
                        <div className="flex items-center gap-2 bg-gray-900/40 px-2 py-1 rounded-lg border border-gray-700/50"> 
                            <span 
                                className={`font-mono text-sm sm:text-base cursor-pointer hover:text-white transition-colors ${themeClasses.secondaryText}`} 
                                onClick={() => { setEditedQuantity(task.quantity || ''); setIsEditingQuantity(true); }}
                            >
                                {task.quantity ? `${task.quantity} órdenes` : '0 órdenes'}
                            </span> 
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateTaskDetails(task.id, { quantity: (task.quantity || 0) + 1 });
                                }} 
                                className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm transition-transform active:scale-95 ${buttonIncrementClass}`}
                            > +1 </button> 
                        </div> 
                    )}
                </div>
            </div>

            {/* DERECHA: TIEMPO */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t border-gray-700/30 sm:border-none mt-2 sm:mt-0">
                
                {isEditingTime ? ( 
                    <input 
                        type="text" 
                        value={editedTime} 
                        onChange={(e) => setEditedTime(e.target.value)} 
                        onBlur={handleTimeEdit} 
                        onKeyPress={(e) => e.key === 'Enter' && handleTimeEdit()} 
                        className={`font-mono text-xl sm:text-2xl border-b-2 bg-gray-900 focus:outline-none w-28 sm:w-32 text-center rounded ${themeClasses.primaryText} border-blue-500 tracking-widest`} 
                        autoFocus 
                    /> 
                ) : ( 
                    <span 
                        className={`font-mono text-xl sm:text-2xl cursor-pointer hover:scale-105 transition-transform tracking-widest ${task.running ? 'text-green-400 font-bold' : themeClasses.primaryText}`} 
                        onClick={() => { setIsEditingTime(true); }}
                    >
                        {displayTime}
                    </span> 
                )}
                
                <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                        onClick={() => toggleTimer(task.id)} 
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-lg active:scale-95 ${task.running ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        {task.running ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        )}
                    </button>

                    <div className="flex flex-col gap-1">
                        {isConfirmingReset ? ( 
                            <button onClick={handleResetClick} className="text-red-500 hover:text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded">Conf?</button>
                        ) : ( 
                            <button onClick={() => { setIsConfirmingReset(true); setIsConfirmingDelete(false); }} className="text-gray-500 hover:text-gray-300 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2A8.001 8.001 0 0019.418 15m0 0H15" /></svg>
                            </button> 
                        )}
                        
                        {isConfirmingDelete ? (
                            <button onClick={handleDeleteConfirm} className="text-red-500 hover:text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded">Borrar?</button>
                        ) : (
                            <button onClick={() => { setIsConfirmingDelete(true); setIsConfirmingReset(false); }} className="text-gray-500 hover:text-red-500 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskListItem;