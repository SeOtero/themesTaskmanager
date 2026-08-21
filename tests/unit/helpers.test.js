import { describe, it, expect } from 'vitest';
import {
    formatTime,
    parseTimeStringToMs,
    getTodayID,
    getDateIdOffset,
    parseHoursFromReport,
    getCurrentWeekID,
    getNextWeekID,
    generateEODRContent,
} from '../../src/utils/helpers';

describe('formatTime', () => {
    it('formatea milisegundos a HH:MM:SS', () => {
        expect(formatTime(0)).toBe('00:00:00');
        expect(formatTime(1000)).toBe('00:00:01');
        expect(formatTime(61000)).toBe('00:01:01');
        expect(formatTime(3661000)).toBe('01:01:01');
    });

    it('devuelve 00:00:00 para valores negativos (no debe romper con NaN ni negativos)', () => {
        expect(formatTime(-500)).toBe('00:00:00');
    });
});

describe('parseTimeStringToMs', () => {
    it('parsea formato HH:MM:SS', () => {
        expect(parseTimeStringToMs('01:30:00')).toBe((1 * 3600 + 30 * 60) * 1000);
    });

    it('parsea formato HH:MM (dos segmentos = horas y minutos, NO minutos y segundos)', () => {
        expect(parseTimeStringToMs('05:00')).toBe(5 * 3600 * 1000);
    });

    it('parsea un número plano como minutos', () => {
        expect(parseTimeStringToMs('10')).toBe(10 * 60 * 1000);
    });

    it('devuelve 0 para valores vacíos/inválidos', () => {
        expect(parseTimeStringToMs('')).toBe(0);
        expect(parseTimeStringToMs(null)).toBe(0);
    });
});

describe('getTodayID', () => {
    it('devuelve la fecha local en formato YYYY-MM-DD', () => {
        const id = getTodayID();
        expect(id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('getDateIdOffset (usado para calcular rachas del Tablón de Anuncios)', () => {
    it('offset 0 es igual a getTodayID', () => {
        expect(getDateIdOffset(0)).toBe(getTodayID());
    });

    it('offset -1 (ayer) es un día antes que hoy', () => {
        const today = new Date(getTodayID() + 'T00:00:00');
        const yesterday = new Date(getDateIdOffset(-1) + 'T00:00:00');
        const diffDays = Math.round((today - yesterday) / 86400000);
        expect(diffDays).toBe(1);
    });

    it('tiene formato YYYY-MM-DD', () => {
        expect(getDateIdOffset(-5)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(getDateIdOffset(5)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('parseHoursFromReport', () => {
    it('extrae horas de un reporte en inglés ("Hours worked: Xh Ym")', () => {
        expect(parseHoursFromReport('Hours worked: 2h 30m')).toBe(2.5);
    });

    it('extrae horas de un reporte en español ("Tiempo Total: Xh Ym")', () => {
        expect(parseHoursFromReport('Tiempo Total: 1h 15m')).toBeCloseTo(1.25, 5);
    });

    it('devuelve 0 si no hay match o el contenido está vacío', () => {
        expect(parseHoursFromReport('')).toBe(0);
        expect(parseHoursFromReport('texto sin formato de horas')).toBe(0);
    });
});

describe('getCurrentWeekID / getNextWeekID (ISO 8601)', () => {
    it('tienen el formato YYYY-Wnn', () => {
        expect(getCurrentWeekID()).toMatch(/^\d{4}-W\d{2}$/);
        expect(getNextWeekID()).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('getNextWeekID nunca es igual a getCurrentWeekID', () => {
        expect(getNextWeekID()).not.toBe(getCurrentWeekID());
    });
});

describe('generateEODRContent', () => {
    it('calcula correctamente el total de tareas y tiempo de tareas detenidas', () => {
        const tasks = [
            { rawTaskName: 'Tarea A', quantity: 5, elapsedTime: 3600000, running: false },
            { rawTaskName: 'Tarea B', quantity: 3, elapsedTime: 1800000, running: false },
        ];
        const content = generateEODRContent(tasks, '2026-08-12', 'default');

        expect(content).toContain('Total Tareas: 8');
        expect(content).toContain('Tiempo Total: 1h 30m');
        expect(content).toContain('Tarea A (5): 1h 0m');
        expect(content).toContain('Tarea B (3): 0h 30m');
    });

    it('usa el emoji de café en el tema lofi', () => {
        const tasks = [{ rawTaskName: 'X', quantity: 1, elapsedTime: 0, running: false }];
        const content = generateEODRContent(tasks, '2026-08-12', 'lofi');
        expect(content).toContain('☕ X');
    });

    it('no lanza error con lista de tareas vacía (evita división por cero en velocidad)', () => {
        expect(() => generateEODRContent([], '2026-08-12', 'default')).not.toThrow();
        expect(generateEODRContent([], '2026-08-12', 'default')).toContain('Velocidad: 0.00 tareas/h');
    });
});
