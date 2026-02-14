import { useState, useEffect, useMemo } from 'react';
import { getWeeklyHours } from '../utils/helpers';
import { THEMES } from '../data/themes'; 

export const useThemeManager = (birthdaysList, pastReports, setManualTheme, manualTheme) => {
    
    // 1. Calcular Horas (Para barra de bonus)
    const weeklyHoursWorked = useMemo(() => getWeeklyHours(pastReports), [pastReports]);
    const isUnlocked = weeklyHoursWorked >= 10; 

    // 2. DETECTAR TEMA DE TEMPORADA (Logic Core)
    const seasonalData = useMemo(() => {
        const today = new Date();
        const month = today.getMonth() + 1; // 1-12
        const day = today.getDate();
        const todayString = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // A. CUMPLEAÑOS
        const birthday = birthdaysList.find(b => b.date === todayString);
        if (birthday) {
            if (birthday.name === "Bianca") {
                return { id: 'seasonal_bianca_bday', msg: `🦄 ¡Feliz Cumpleaños Bianca! 🐱` };
            }
            return { id: 'seasonal_party', msg: `🎉 ¡Feliz Cumpleaños, ${birthday.name}! 🎂` };
        } 
        
        // B. FECHAS ESPECIALES
        if (month === 2 && day >= 13 && day <= 15) return { id: 'seasonal_valentines', msg: '💖 ¡Feliz San Valentín! 💖' };
        if (month === 10 && day >= 25) return { id: 'seasonal_halloween', msg: '🎃 ¡Dulce o Truco! 👻' }; // Semana Halloween
        if (month === 12 && day >= 18 && day <= 26) return { id: 'seasonal_christmas', msg: '🎄 ¡Feliz Navidad! 🎅' };

        return null;
    }, [birthdaysList]);


    // 3. ESTRATEGIA FINAL (Season > Manual > Default)
    const themeResult = useMemo(() => {
        let targetThemeId = 'default';
        let finalMessage = '';

        // Prioridad 1: Temporada (Forzamos el cambio)
        if (seasonalData) {
            targetThemeId = seasonalData.id;
            finalMessage = seasonalData.msg;
        } 
        // Prioridad 2: Manual (Tienda)
        else if (manualTheme) {
            // Verificamos si es Lofi bloqueado
            if (manualTheme === 'lofi' && !isUnlocked) {
                targetThemeId = 'default';
            } else {
                targetThemeId = manualTheme;
            }
        }

        // Buscamos el objeto del tema en THEMES
        // (Si no existe, fallback a default para evitar crash)
        const strategy = THEMES[targetThemeId] || THEMES['default'];

        return { strategy, message: finalMessage };

    }, [seasonalData, manualTheme, isUnlocked]);

    return { 
        strategy: themeResult.strategy, 
        message: themeResult.message, 
        isUnlocked, 
        weeklyHoursWorked 
    };
};