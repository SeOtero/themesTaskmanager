import React, { useState, useEffect, useMemo } from 'react';
import { commonTaskOptions, shopSpecificCallTasks, shopOptions } from '../../data/constants';

const TaskInputForm = ({ addTask, addMultipleTasks, errorMessage, setErrorMessage, themeClasses }) => {
    const [shopInput, setShopInput] = useState(''); 
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [customTaskName, setCustomTaskName] = useState(''); 
    const [isGridOpen, setIsGridOpen] = useState(false);
    
    // Al cambiar de tienda, limpiamos selección
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
        
        // Preparamos el paquete de tareas para enviar
        const tasksPayload = [];

        selectedTasks.forEach(taskName => {
            let finalName = taskName;
            
            // Lógica para tarea personalizada
            if (taskName === "OTHER_CUSTOM_TASK") {
                if (!customTaskName.trim()) return; // Ignorar si está vacío
                finalName = customTaskName.trim();
            }
            
            tasksPayload.push({
                shopInput,
                taskName: finalName,
                quantity: null // Sin cantidad inicial
            });
        });

        // Enviamos todo junto para evitar errores de estado
        // Usamos addMultipleTasks si existe (nueva versión), sino fallback a loop
        if (addMultipleTasks) {
            const success = addMultipleTasks(tasksPayload);
            if (success) {
                // Limpiar formulario si hubo éxito
                setSelectedTasks([]);
                setCustomTaskName('');
                setErrorMessage('');
            }
        } else {
            // Fallback por si no has actualizado el hook todavía
            tasksPayload.forEach(t => addTask(t));
            setSelectedTasks([]);
            setErrorMessage('');
        }
    };
    
    const optionClasses = `bg-gray-800 text-white`; // Fallback simple para opciones
    const isCustomSelected = selectedTasks.includes("OTHER_CUSTOM_TASK");

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 w-full">
                {/* SELECTOR DE TIENDA */}
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
                            <button 
                                type="button" 
                                onClick={() => setIsGridOpen(!isGridOpen)} 
                                className={`text-[10px] font-bold px-2 py-1 rounded border border-gray-600 ${themeClasses.secondaryText} hover:bg-gray-700 transition`}
                            >
                                {isGridOpen ? 'OCULTAR ▲' : 'MOSTRAR ▼'}
                            </button>
                        </div>
                        
                        {isGridOpen && (
                            <div className={`p-3 rounded-xl border ${themeClasses.inputBorder} ${themeClasses.cardBg} max-h-60 overflow-y-auto task-scroll`}>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {availableTasks.map(task => {
                                        const isSelected = selectedTasks.includes(task);
                                        return ( 
                                            <button 
                                                key={task} 
                                                type="button" 
                                                onClick={() => toggleTaskSelection(task)} 
                                                className={`text-xs px-3 py-2 rounded-lg font-medium transition-all border 
                                                    ${isSelected 
                                                        ? 'bg-green-600 text-white border-green-400 shadow-md transform scale-105' 
                                                        : `bg-transparent ${themeClasses.secondaryText} ${themeClasses.inputBorder} hover:bg-gray-700 hover:text-white`
                                                    }`}
                                            >
                                                {task}
                                            </button> 
                                        );
                                    })}
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
                        )}
                    </div>
                )}

                {/* CAMPO DE NOMBRE PERSONALIZADO */}
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
                
                {/* --- INPUT DE CANTIDAD ELIMINADO --- */}
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