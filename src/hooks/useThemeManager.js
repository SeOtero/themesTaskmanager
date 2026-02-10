import { useState, useEffect, useMemo } from 'react';
import { getWeeklyHours } from '../utils/helpers';
import { THEMES } from '../data/themes'; // <--- USAMOS EL NUEVO ARCHIVO DE TEMAS

export const useThemeManager = (birthdaysList, pastReports, setManualTheme, manualTheme) => {
    const [message, setMessage] = useState('');

    // 1. Calcular horas trabajadas (Para la barra de progreso del Bonus)
    const weeklyHoursWorked = useMemo(() => {
        return getWeeklyHours(pastReports);
    }, [pastReports]);

    // 2. Lógica de Mensajes de Eventos (Cumpleaños y Festividades)
    // Solo mostramos el MENSAJE, no forzamos el cambio de tema para respetar tu compra en la tienda.
    useEffect(() => {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const todayString = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Buscar cumpleañero
        const birthday = birthdaysList.find(b => b.date === todayString);

        if (birthday) {
            if (birthday.name === "Bianca") {
                setMessage(`🦄 ¡Feliz Cumpleaños Bianca! 🐱`);
            } else {
                setMessage(`🎉 ¡Feliz Cumpleaños, ${birthday.name}! 🎂`);
            }
        } else if (month === 2 && day >= 13 && day <= 15) {
            setMessage('💖 ¡Feliz San Valentín! 💖');
        } else if (month === 10 && day === 31) {
            setMessage('🎃 ¡Feliz Halloween! 👻');
        } else if (month === 12 && day === 25) {
            setMessage('🎄 ¡Feliz Navidad! 🎅');
        } else {
            setMessage('');
        }

    }, [birthdaysList]);

    // 3. SELECCIÓN DE ESTRATEGIA (EL TEMA VISUAL)
    const strategy = useMemo(() => {
        // Buscamos el tema que seleccionaste en la TIENDA (manualTheme)
        // dentro de nuestro nuevo archivo de definiciones (THEMES).
        if (manualTheme && THEMES[manualTheme]) {
            return THEMES[manualTheme];
        }
        
        // Fallback: Si hay un error o el tema no existe, cargamos Default
        // Esto evita la pantalla blanca.
        return THEMES['default'];

    }, [manualTheme]);

    // "isUnlocked" ahora solo significa "Meta Cumplida" para efectos visuales de la barra,
    // ya no bloquea el tema. (Asumimos meta de 10h si no se pasa otra cosa, o se maneja en UI)
    const isUnlocked = weeklyHoursWorked >= 10; 

    return { 
        strategy, 
        message, 
        isUnlocked, 
        weeklyHoursWorked 
    };
};