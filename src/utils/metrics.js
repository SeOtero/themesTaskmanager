// src/utils/metrics.js

export const calculateAgentMetrics = (tasks) => {
    // Filtramos solo las tareas completadas o que se trabajaron hoy
    // (Asumimos que 'tasks' son las del día actual)
    
    const finishedTasks = tasks.filter(t => t.completed);
    const totalTasksCount = finishedTasks.length;
    
    // Sumamos el tiempo total trabajado (elapsedTime está en milisegundos)
    const totalTimeMs = tasks.reduce((acc, t) => acc + (t.elapsedTime || 0), 0);
    
    // Conversiones
    const totalHours = totalTimeMs / (1000 * 60 * 60);
    const totalMinutes = totalTimeMs / (1000 * 60);

    // --- MÉTRICAS CLAVE PARA EL TEAM LEADER ---
    
    // 1. Velocidad (Tareas por Hora) - Evitamos división por cero
    const tasksPerHour = totalHours > 0 ? (totalTasksCount / totalHours).toFixed(2) : 0;

    // 2. Tiempo Promedio de Manejo (AHT - Average Handling Time) en minutos
    const avgHandlingTime = totalTasksCount > 0 ? (totalMinutes / totalTasksCount).toFixed(1) : 0;

    return {
        totalTasks: totalTasksCount,
        totalTimeMs: totalTimeMs,
        totalHours: totalHours.toFixed(2),
        tasksPerHour: tasksPerHour, // Ej: "4.5" tareas/hora
        avgHandlingTime: avgHandlingTime, // Ej: "12.5" min/tarea
        efficiencyScore: calculateEfficiency(tasksPerHour) // Un puntaje del 1 al 100
    };
};

// Función auxiliar para "gamificar" la eficiencia (opcional)
const calculateEfficiency = (tph) => {
    const TARGET_TPH = 5; // Meta hipotética de 5 tareas por hora
    let score = (tph / TARGET_TPH) * 100;
    return Math.min(Math.round(score), 100); // Tope de 100%
};