// src/services/reportService.js
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Calcula las métricas y guarda el reporte en Firebase.
 * Retorna el objeto del reporte guardado y las monedas ganadas.
 */
export const saveDailyReport = async (user, tasks, dateStr, userProfile) => {
    if (!user) throw new Error("No user");

    // 1. Cálculos de Tiempos y Métricas (Lógica pura)
    const totalMs = tasks.reduce((acc, t) => {
        const currentSession = t.running ? (Date.now() - t.lastTime) : 0;
        return acc + t.elapsedTime + currentSession;
    }, 0);

    const taskBreakdown = tasks.map(task => { 
        const quantity = parseInt(task.quantity) || 0;
        const currentSession = task.running ? (Date.now() - task.lastTime) : 0;
        const taskMs = task.elapsedTime + currentSession;
        const hours = taskMs / 3600000;
        const speed = (hours > 0) ? (quantity / hours).toFixed(2) : "0.00";
        
        return { 
            id: task.id, 
            name: task.rawTaskName || task.text, 
            category: task.category || 'General', 
            count: quantity, 
            timeMs: taskMs, 
            speed: speed 
        };
    });

    // 2. Preparar Payload para Firebase
    const userTeam = userProfile?.team || 'default';
    const userName = userProfile?.name || user.displayName || user.email;
    const formattedTimestamp = new Date().toLocaleString('es-AR');

    const reportData = { 
        uid: user.uid, 
        userName, 
        team: userTeam, 
        date: dateStr, 
        lastUpdated: Date.now(), 
        metrics: { 
            totalTasks: tasks.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0), 
            totalTimeMs: totalMs, 
            globalSpeed: totalMs > 0 ? (tasks.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0) / (totalMs / 3600000)).toFixed(2) : "0.00" 
        }, 
        taskBreakdown, 
        timestampStr: formattedTimestamp 
    };

    // 3. Guardar en Firebase
    await setDoc(doc(db, "daily_reports", `${user.uid}_${dateStr}`), reportData);

    // 4. Calcular Recompensa (Lógica de Gamificación)
    const hoursWorked = totalMs / (1000 * 60 * 60);
    const coinsEarned = Math.floor(hoursWorked * 10);
    const totalReward = coinsEarned + 15; // Base + Horas

    return { totalReward, reportData };
};