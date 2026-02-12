import { useState, useEffect, useCallback } from 'react';
import { useFirestoreDoc } from './useFirestore'; 
import { commonTaskOptions, shopSpecificCallTasks } from '../data/constants';

export const useTasks = (user) => {
    // Usamos Firestore para persistir tareas
    const [tasks, setTasks] = useFirestoreDoc('data', 'tasks', [], user); 
    const [errorMessage, setErrorMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState(null); 
    
    // Timer para actualizar la interfaz cada segundo si hay tareas corriendo
    useEffect(() => {
        const interval = setInterval(() => {
            if (tasks && tasks.some(t => t.running)) {
                // Forzamos re-render pasando una copia nueva del array
                setTasks([...tasks]); 
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [tasks, setTasks]);
    
    // --- AGREGAR MÚLTIPLES TAREAS ---
    const addMultipleTasks = useCallback((newTasksData) => {
        const tasksToAdd = [];
        const currentTaskNames = new Set(tasks.map(t => t.name.toLowerCase()));
        let duplicateCount = 0;

        newTasksData.forEach((data, index) => {
            const { shopInput, taskName } = data;
            const fullTaskName = `${taskName} [${shopInput}]`;

            if (currentTaskNames.has(fullTaskName.toLowerCase())) {
                duplicateCount++;
                return;
            }

            const isCustom = !commonTaskOptions.includes(taskName) && !Object.values(shopSpecificCallTasks).includes(taskName);
            
            const newTask = { 
                id: Date.now() + index + Math.random(), 
                name: fullTaskName, 
                rawTaskName: taskName, 
                shop: shopInput, 
                quantity: null, 
                elapsedTime: 0, 
                running: false, 
                lastTime: null, 
                isCustom 
            };

            tasksToAdd.push(newTask);
            currentTaskNames.add(fullTaskName.toLowerCase());
        });

        if (tasksToAdd.length > 0) {
            setTasks([...tasks, ...tasksToAdd]);
            setErrorMessage('');
            return true;
        } else if (duplicateCount > 0) {
            setErrorMessage('Esas tareas ya existen en la lista.');
            return false;
        }
        return false;
    }, [tasks, setTasks]);

    const addTask = useCallback((taskData) => {
        return addMultipleTasks([taskData]);
    }, [addMultipleTasks]);
    
    const deleteTask = useCallback((id) => setTasks(tasks.filter(t => t.id !== id)), [tasks, setTasks]);
    
    const deleteAllTasks = useCallback(() => { 
        setTasks([]); 
        setErrorMessage(''); 
    }, [setTasks]);
    
    const toggleTimer = useCallback((id) => {
        const now = Date.now();
        const updatedTasks = tasks.map(t => {
            if (t.running && t.id !== id) return { ...t, running: false, elapsedTime: t.elapsedTime + (now - t.lastTime), lastTime: null };
            if (t.id === id) {
                const newRunning = !t.running;
                return { ...t, running: newRunning, elapsedTime: newRunning ? t.elapsedTime : (t.elapsedTime + (now - t.lastTime)), lastTime: newRunning ? now : null };
            }
            return t;
        });
        setTasks(updatedTasks);
    }, [tasks, setTasks]);

    const stopAllTimers = useCallback(() => {
        let tasksStopped = false;
        let lastRunningTaskId = null;
        const now = Date.now();
        
        const newTasks = tasks.map(t => {
            if (t.running) {
                tasksStopped = true;
                lastRunningTaskId = t.id;
                return { ...t, running: false, elapsedTime: t.elapsedTime + (now - t.lastTime), lastTime: null };
            }
            return t;
        });

        if (!tasksStopped) { 
            setStatusMessage({ text: 'No hay tareas activas.', taskIdToResume: null }); 
            return; 
        }
        
        setTasks(newTasks);
        setStatusMessage({ text: `Tareas detenidas.`, taskIdToResume: lastRunningTaskId });
    }, [tasks, setTasks]);

    const resumeStoppedTimers = useCallback(() => { 
        if (!statusMessage || statusMessage.taskIdToResume === null) return; 
        toggleTimer(statusMessage.taskIdToResume); 
        setStatusMessage(null); 
    }, [statusMessage, toggleTimer]);

    const clearStatusMessage = useCallback(() => { setStatusMessage(null); }, []);
    
    const resetTaskTimer = useCallback((id) => { 
        setTasks(tasks.map(t => t.id === id ? { ...t, elapsedTime: 0, running: false, lastTime: null, quantity: null } : t)); 
    }, [tasks, setTasks]);
    
    const updateTaskDetails = useCallback((id, newDetails) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                const newRawTaskName = newDetails.rawTaskName !== undefined ? newDetails.rawTaskName : t.rawTaskName;
                const newShop = newDetails.shop !== undefined ? newDetails.shop : t.shop;
                const newFullName = newRawTaskName ? `${newRawTaskName} [${newShop}]` : t.name;
                return { ...t, ...newDetails, rawTaskName: newRawTaskName, shop: newShop, name: newFullName };
            }
            return t;
        }));
    }, [tasks, setTasks]);

    const sortTasksByShop = useCallback(() => setTasks([...tasks].sort((a, b) => a.shop.localeCompare(b.shop))), [tasks, setTasks]);
    
    // -----------------------------------------------------------------------
    // ✅ CORRECCIÓN CRÍTICA: distributeTasksTime
    // Calculamos el array nuevo completo ANTES de llamar a setTasks.
    // Esto evita el error "Unsupported field value: a function" en Firebase.
    // -----------------------------------------------------------------------
    const distributeTasksTime = useCallback((taskIds, totalMs) => {
        if (!taskIds || taskIds.length === 0) return;

        const msPerTask = Math.floor(totalMs / taskIds.length);
        const remainder = totalMs % taskIds.length;
        let remainderApplied = false;

        // Usamos 'tasks' directamente (que está en el scope del hook)
        const updatedTasks = tasks.map(task => {
            if (taskIds.includes(task.id)) {
                let adjustment = msPerTask;

                if (!remainderApplied) {
                    adjustment += remainder;
                    remainderApplied = true;
                }

                // Sumamos (o restamos si es negativo) y evitamos que baje de 0
                const newTime = Math.max(0, task.elapsedTime + adjustment);
                return { ...task, elapsedTime: newTime };
            }
            return task;
        });

        // ✅ Pasamos el array directo, NO una función
        setTasks(updatedTasks);
    }, [tasks, setTasks]);

    // -----------------------------------------------------------------------
    // ✅ CORRECCIÓN CRÍTICA: syncTasksTime
    // Misma corrección: usar datos directos en lugar de setTasks(prev => ...)
    // -----------------------------------------------------------------------
    const syncTasksTime = useCallback((input, mode, specificTaskId) => {
        // CASO 1: Ajuste directo por número (Diferencia total)
        if (typeof input === 'number') {
            const difference = input;
            if (tasks.length === 0) return;
            
            const split = Math.floor(difference / tasks.length);
            const remainder = difference % tasks.length;
            let remainderApplied = false;

            const updatedTasks = tasks.map((t, i) => {
                let adjustment = split;
                if (!remainderApplied) { adjustment += remainder; remainderApplied = true; }
                const newTime = Math.max(0, t.elapsedTime + adjustment);
                return { ...t, elapsedTime: newTime };
            });
            
            setTasks(updatedTasks);
            return;
        }

        // Modo Legacy (input texto)
        let targetMs = 0;
        const strVal = input.toString().trim();

        if (strVal.includes(':')) {
            const parts = strVal.split(':');
            const h = parseInt(parts[0] || '0', 10);
            const m = parseInt(parts[1] || '0', 10);
            targetMs = (h * 3600 * 1000) + (m * 60 * 1000);
        } else {
            const minutes = parseFloat(strVal);
            if (!isNaN(minutes)) targetMs = minutes * 60 * 1000;
        }

        const currentTotalMs = tasks.reduce((acc, t) => acc + t.elapsedTime, 0);
        const difference = targetMs - currentTotalMs;

        if (Math.abs(difference) < 1000) return;

        let updatedTasks = [...tasks];

        if (mode === 'all') {
            if (updatedTasks.length === 0) return;
            const count = updatedTasks.length;
            const sharePerTask = Math.floor(difference / count);
            const remainder = difference % count;

            updatedTasks = updatedTasks.map((t, index) => {
                let addAmount = sharePerTask + (index === 0 ? remainder : 0);
                let newTime = Math.max(0, t.elapsedTime + addAmount);
                return { ...t, elapsedTime: newTime };
            });

        } else if (mode === 'single' && specificTaskId) {
            updatedTasks = updatedTasks.map(t => {
                if (t.id === specificTaskId) {
                    let newTime = Math.max(0, t.elapsedTime + difference);
                    return { ...t, elapsedTime: newTime };
                }
                return t;
            });
        }

        setTasks(updatedTasks);
        
    }, [tasks, setTasks]);

    return { 
        tasks, 
        errorMessage, setErrorMessage, 
        addTask, addMultipleTasks, 
        deleteTask, deleteAllTasks, 
        toggleTimer, updateTaskDetails, 
        sortTasksByShop, resetTaskTimer, stopAllTimers, 
        statusMessage, resumeStoppedTimers, clearStatusMessage, 
        syncTasksTime,
        distributeTasksTime
    };
};