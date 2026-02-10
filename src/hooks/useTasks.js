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
                setTasks(prev => [...prev]); // Forzamos re-render
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
    const deleteAllTasks = useCallback(() => { setTasks([]); setErrorMessage(''); }, [setTasks]);
    
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

        if (!tasksStopped) { setStatusMessage({ text: 'No hay tareas activas.', taskIdToResume: null }); return; }
        setTasks(newTasks);
        setStatusMessage({ text: `Tareas detenidas.`, taskIdToResume: lastRunningTaskId });
    }, [tasks, setTasks]);

    const resumeStoppedTimers = useCallback(() => { if (!statusMessage || statusMessage.taskIdToResume === null) return; toggleTimer(statusMessage.taskIdToResume); setStatusMessage(null); }, [statusMessage, toggleTimer]);
    const clearStatusMessage = useCallback(() => { setStatusMessage(null); }, []);
    
    const resetTaskTimer = useCallback((id) => { setTasks(tasks.map(t => t.id === id ? { ...t, elapsedTime: 0, running: false, lastTime: null, quantity: null } : t)); }, [tasks, setTasks]);
    
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
    // 🔥 LÓGICA CORREGIDA DEL SINCRONIZADOR DE TIEMPO
    // -----------------------------------------------------------------------
    const syncTasksTime = useCallback((targetTimeStr, mode, specificTaskId) => {
        // 1. Calcular el tiempo objetivo en milisegundos (Soporta "HH:MM" y minutos enteros "100")
        let targetMs = 0;
        const strVal = targetTimeStr.toString().trim();

        if (strVal.includes(':')) {
            // Formato HH:MM
            const parts = strVal.split(':');
            const h = parseInt(parts[0] || '0', 10);
            const m = parseInt(parts[1] || '0', 10);
            targetMs = (h * 3600 * 1000) + (m * 60 * 1000);
        } else {
            // Formato Minutos (ej: "1000" o "90")
            const minutes = parseFloat(strVal);
            if (!isNaN(minutes)) {
                targetMs = minutes * 60 * 1000;
            }
        }

        // 2. Obtener tiempo actual total de la app
        const currentTotalMs = tasks.reduce((acc, t) => acc + t.elapsedTime, 0);
        
        // 3. Calcular la diferencia exacta
        const difference = targetMs - currentTotalMs;

        // Si la diferencia es casi cero, no hacemos nada
        if (Math.abs(difference) < 1000) return;

        let updatedTasks = [...tasks];

        if (mode === 'all') {
            if (updatedTasks.length === 0) return;

            // Repartir uniformemente (división entera)
            const count = updatedTasks.length;
            const sharePerTask = Math.floor(difference / count);
            const remainder = difference % count; // Lo que sobra se lo damos al primero

            updatedTasks = updatedTasks.map((t, index) => {
                let addAmount = sharePerTask;
                
                // Sumar el resto a la primera tarea para que la suma sea exacta
                if (index === 0) addAmount += remainder;

                let newTime = t.elapsedTime + addAmount;
                // Protección: El tiempo nunca puede ser negativo
                if (newTime < 0) newTime = 0;

                return { ...t, elapsedTime: newTime };
            });

        } else if (mode === 'single' && specificTaskId) {
            // Asignar toda la diferencia a una sola tarea
            updatedTasks = updatedTasks.map(t => {
                if (t.id === specificTaskId) {
                    let newTime = t.elapsedTime + difference;
                    if (newTime < 0) newTime = 0;
                    return { ...t, elapsedTime: newTime };
                }
                return t;
            });
        }

        setTasks(updatedTasks);
        console.log(`Sincronización completa. Objetivo: ${targetMs}ms, Diferencia aplicada: ${difference}ms`);
        
    }, [tasks, setTasks]);

    return { 
        tasks, errorMessage, setErrorMessage, 
        addTask, addMultipleTasks, 
        deleteTask, deleteAllTasks, toggleTimer, updateTaskDetails, 
        sortTasksByShop, resetTaskTimer, stopAllTimers, 
        statusMessage, resumeStoppedTimers, clearStatusMessage, 
        syncTasksTime 
    };
};