import React, { useState, useEffect, useMemo } from 'react';
import { commonTaskOptions, shopSpecificCallTasks, shopOptions } from '../../data/constants';

const TaskInputForm = ({ addTask, addMultipleTasks, errorMessage, setErrorMessage, themeClasses }) => {
    const [shopInput, setShopInput] = useState(''); 
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [customTaskName, setCustomTaskName] = useState(''); 
    const [isGridOpen, setIsGridOpen] = useState(false);
    
    useEffect(() => { setSelectedTasks([]); if (shopInput) setIsGridOpen(true); }, [shopInput]);

    const availableTasks = useMemo(() => {
        let options = [...commonTaskOptions];
        if (shopInput && shopSpecificCallTasks[shopInput]) { 
            options = [shopSpecificCallTasks[shopInput], ...options]; 
        }
        return options;
    }, [shopInput]);

    const handleShopChange = (e) => { setShopInput(e.target.value); };
    
    const toggleTaskSelection = (taskName) => {
        if (!shopInput) return;
        setSelectedTasks(prev => {
            if (prev.includes(taskName)) return prev.filter(t => t !== taskName);
            return [...prev, taskName];
        });
    };

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        if (!shopInput) { setErrorMessage('Primero selecciona una tienda.'); return; }
        if (selectedTasks.length === 0) { setErrorMessage('Selecciona al menos una tarea.'); return; }
        
        const tasksPayload = [];

        selectedTasks.forEach(taskName => {
            let finalName = taskName;
            if (taskName === "OTHER_CUSTOM_TASK") {
                if (!customTaskName.trim()) return; 
                finalName = customTaskName.trim();
            }
            tasksPayload.push({
                shopInput,
                taskName: finalName,
                quantity: null 
            });
        });

        if (addMultipleTasks) {
            const success = addMultipleTasks(tasksPayload);
            if (success) {
                setSelectedTasks([]);
                setCustomTaskName('');
                setErrorMessage('');
            }
        } else {
            tasksPayload.forEach(t => addTask(t));
            setSelectedTasks([]);
            setErrorMessage('');
        }
    };
    
    const getButtonStyles = (taskName, isSelected) => {
        const baseStyle = "text-xs px-3 py-2 rounded-lg font-medium transition-all border";
        if (isSelected) return `${baseStyle} bg-green-600 text-white border-green-400 shadow-md transform scale-105`;
        if (taskName.includes('CALL')) return `${baseStyle} border-pink-500 bg-pink-900/30 text-pink-200 hover:bg-pink-800/50`;
        if (taskName.toLowerCase().includes('chat')) return `${baseStyle} border-blue-500 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50`;
        return `${baseStyle} bg-transparent ${themeClasses.secondaryText} ${themeClasses.inputBorder} hover:bg-gray-700 hover:text-white`;
    };

    const optionClasses = `bg-gray-800 text-white`;
    const isCustomSelected = selectedTasks.includes("OTHER_CUSTOM_TASK");

    // LÓGICA DE AGRUPACIÓN
    const callTasks = availableTasks.filter(t => t.includes('CALL'));
    const chatTasks = availableTasks.filter(t => t.toLowerCase().includes('chat') && !t.includes('CALL'));
    const otherTasks = availableTasks.filter(t => !t.includes('CALL') && !t.toLowerCase().includes('chat'));

    // Función auxiliar para dibujar un botón individual sin repetir código
    const renderTaskButton = (task) => {
        const isSelected = selectedTasks.includes(task);
        return (
            <button key={task} type="button" onClick={() => toggleTaskSelection(task)} className={getButtonStyles(task, isSelected)}>
                {task}
            </button>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 w-full">
                <select 
                    value={shopInput} 
                    onChange={handleShopChange} 
                    className={`flex-1 px-5 py-3 border-2 ${themeClasses.cardBg} ${themeClasses.accentText} ${themeClasses.shopSelectBorder} rounded-full focus:outline-none transition-all font-semibold appearance-none cursor-pointer`} 
                    required
                >
                    <option value="" disabled className={optionClasses}>--- Seleccionar Tienda ---</option>
                    {shopOptions.map(o => (
                        <option key={o} value={o} className={optionClasses}>{o}</option>
                    ))}
                </select>

                {shopInput && (
                    <div className="flex flex-col gap-2 animate-fade-in">
                        <div className="flex justify-between items-center px-2">
                            <span className={`text-xs uppercase font-bold tracking-widest ${themeClasses.secondaryText} opacity-70`}>
                                Tareas Disponibles
                            </span>
                            <button type="button" onClick={() => setIsGridOpen(!isGridOpen)} className={`text-[10px] font-bold px-2 py-1 rounded border border-gray-600 ${themeClasses.secondaryText} hover:bg-gray-700 transition`}>
                                {isGridOpen ? 'OCULTAR ▲' : 'MOSTRAR ▼'}
                            </button>
                        </div>
                        
                        {isGridOpen && (
                            <div className={`p-4 rounded-xl border ${themeClasses.inputBorder} ${themeClasses.cardBg} max-h-80 overflow-y-auto task-scroll flex flex-col gap-4`}>
                                
                                {/* SECCIÓN: CHATS */}
                                {chatTasks.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-[10px] uppercase font-bold text-blue-400 border-b border-gray-700 pb-1">💬 Gestión de Chats</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {chatTasks.map(renderTaskButton)}
                                        </div>
                                    </div>
                                )}

                                {/* SECCIÓN: LLAMADAS */}
                                {callTasks.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-[10px] uppercase font-bold text-pink-400 border-b border-gray-700 pb-1">📞 Llamadas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {callTasks.map(renderTaskButton)}
                                        </div>
                                    </div>
                                )}

                                {/* SECCIÓN: OTRAS TAREAS */}
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-700 pb-1">📌 Otras Tareas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {otherTasks.map(renderTaskButton)}
                                        
                                        <button 
                                            type="button" 
                                            onClick={() => toggleTaskSelection("OTHER_CUSTOM_TASK")} 
                                            className={`text-xs px-3 py-2 rounded-lg font-medium transition-all border 
                                                ${isCustomSelected 
                                                    ? 'bg-purple-600 text-white border-purple-400 shadow-md' 
                                                    : `bg-transparent text-purple-300 border-purple-900/50 hover:bg-purple-900/20`
                                                }`}
                                        >
                                            + Otra
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                )}

                {isCustomSelected && isGridOpen && (
                    <input 
                        type="text" 
                        value={customTaskName} 
                        onChange={e => setCustomTaskName(e.target.value)} 
                        placeholder="Nombre de la tarea personalizada..." 
                        className={`flex-1 px-5 py-3 border-2 ${themeClasses.cardBg} ${themeClasses.secondaryText} ${themeClasses.inputBorder} rounded-full focus:outline-none transition-all animate-pulse`} 
                        required 
                    />
                )}
                
            </div>

            {errorMessage && (
                <p className="text-red-400 font-medium bg-red-900/50 p-3 rounded-xl text-center border border-red-500/30">
                    {errorMessage}
                </p>
            )}

            <button 
                type="submit" 
                className={`px-6 py-3 rounded-full font-semibold transition duration-300 shadow-lg w-full sm:w-auto ${themeClasses.buttonAdd} disabled:opacity-50 disabled:cursor-not-allowed`} 
                disabled={!shopInput || selectedTasks.length === 0}
            >
                {selectedTasks.length > 1 ? `Agregar ${selectedTasks.length} Tareas` : 'Agregar Tarea'}
            </button>
        </form>
    );
};

export default TaskInputForm;