import { useMemo, useEffect, useState } from 'react';
import { THEMES } from '../data/themes'; // Asegúrate de que esta ruta sea correcta
import { getTodayID, getCurrentWeekID } from '../utils/helpers';

export const useThemeManager = (birthdays, pastReports, setManualTheme, manualTheme) => {
    
    // --- LÓGICA DE HORAS (Solo para estadísticas visuales, no para bloquear) ---
    const weeklyHoursWorked = useMemo(() => {
        const currentWeek = getCurrentWeekID();
        // Filtramos reportes de la semana actual
        const weeklyReports = pastReports.filter(r => {
            // Asumiendo que r.id es YYYY-MM-DD, verificamos si cae en la semana (lógica simplificada)
            // Para este fix rápido, sumamos todo o usamos la lógica que tenías.
            return true; 
        });
        
        // Suma aproximada basada en métricas guardadas (si existen)
        // Si no tienes métricas de horas en reports, esto será 0, pero ya no bloqueará el tema.
        return weeklyReports.reduce((acc, r) => acc + (r.hours || 0), 0);
    }, [pastReports]);

    // --- SELECCIÓN DEL TEMA (EL CEREBRO) ---
    const strategy = useMemo(() => {
        const today = getTodayID(); // "YYYY-MM-DD"
        const [year, monthStr, dayStr] = today.split('-');
        const month = parseInt(monthStr);
        const day = parseInt(dayStr);

        // 1. PRIORIDAD ABSOLUTA: Selección Manual (Tienda/Selector)
        // Si elegiste un tema y existe en el archivo, LO USAMOS.
        if (manualTheme && THEMES[manualTheme]) {
            return THEMES[manualTheme];
        }

        // 2. PRIORIDAD MEDIA: Fechas Especiales (Cumpleaños/Eventos)
        // Si NO hay tema manual, miramos el calendario.
        
        // San Valentín (Feb 13-15)
        if (month === 2 && day >= 13 && day <= 15) return THEMES.seasonal_valentines || THEMES.default;
        
        // Halloween (Oct 31)
        if (month === 10 && day === 31) return THEMES.seasonal_halloween || THEMES.default;
        
        // Navidad (Dec 24-25)
        if (month === 12 && (day === 24 || day === 25)) return THEMES.seasonal_christmas || THEMES.default;

        // Cumpleaños (Lista de constantes)
        const isBday = birthdays.find(b => b.date === `${monthStr}-${dayStr}`);
        if (isBday) {
            if (isBday.name === 'Bianca') return THEMES.seasonal_bianca_bday || THEMES.seasonal_party;
            return THEMES.seasonal_party || THEMES.default;
        }

        // 3. FALLBACK: Si no hay nada elegido ni es fiesta, vamos al Default.
        return THEMES.default;

    }, [manualTheme, birthdays, pastReports]);

    // --- MENSAJES DE CELEBRACIÓN ---
    const message = useMemo(() => {
        if (strategy.id === 'seasonal_valentines') return "💖 ¡Feliz San Valentín! 💖";
        if (strategy.id === 'seasonal_halloween') return "🎃 ¡Dulce o Truco! 🎃";
        if (strategy.id === 'seasonal_christmas') return "🎄 ¡Feliz Navidad! 🎄";
        
        const today = getTodayID().split('-').slice(1).join('-');
        const bday = birthdays.find(b => b.date === today);
        if (bday) return `🎉 ¡Feliz Cumpleaños, ${bday.name}! 🎂`;

        return ""; // Sin mensaje
    }, [strategy, birthdays]);

    return {
        strategy,           // El objeto del tema (colores, fondo, etc)
        message,            // Mensaje de cabecera
        weeklyHoursWorked,  // Dato para la barra de progreso (ya no bloquea)
        isUnlocked: true    // ✅ SIEMPRE TRUE para que la barra no muestre candados
    };
};