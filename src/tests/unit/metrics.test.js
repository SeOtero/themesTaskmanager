import { describe, it, expect } from 'vitest';
import { calculateAgentMetrics } from '../../src/utils/metrics';

describe('calculateAgentMetrics', () => {
    it('calcula métricas correctamente con tareas completadas', () => {
        const tasks = [
            { completed: true, elapsedTime: 3600000 }, // 1h
            { completed: true, elapsedTime: 3600000 }, // 1h
            { completed: false, elapsedTime: 1800000 }, // 30m, no cuenta como completada
        ];
        const metrics = calculateAgentMetrics(tasks);

        expect(metrics.totalTasks).toBe(2);
        expect(metrics.totalHours).toBe('2.50'); // (1h+1h+0.5h) = 2.5h de tiempo total
        expect(metrics.tasksPerHour).toBe('0.80'); // 2 tareas / 2.5h
    });

    it('avgHandlingTime da "0.0" cuando la tarea completada tuvo 0ms (no lanza NaN); tasksPerHour sí da 0 numérico porque depende de totalHours, no de totalTasksCount', () => {
        const tasks = [{ completed: true, elapsedTime: 0 }];
        const metrics = calculateAgentMetrics(tasks);

        expect(metrics.tasksPerHour).toBe(0);
        expect(metrics.avgHandlingTime).toBe('0.0');
    });

    it('no divide por cero cuando no hay tareas completadas', () => {
        const tasks = [{ completed: false, elapsedTime: 3600000 }];
        const metrics = calculateAgentMetrics(tasks);

        expect(metrics.totalTasks).toBe(0);
        expect(metrics.avgHandlingTime).toBe(0);
    });

    it('el efficiencyScore nunca supera 100', () => {
        // 20 tareas completadas en 1 hora => 20 tareas/h, muy por encima de la meta de 5
        const tasks = Array.from({ length: 20 }, () => ({ completed: true, elapsedTime: 180000 })); // 3 min c/u
        const metrics = calculateAgentMetrics(tasks);

        expect(metrics.efficiencyScore).toBeLessThanOrEqual(100);
    });

    it('maneja un array vacío sin lanzar error', () => {
        expect(() => calculateAgentMetrics([])).not.toThrow();
        const metrics = calculateAgentMetrics([]);
        expect(metrics.totalTasks).toBe(0);
    });
});
