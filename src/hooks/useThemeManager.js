import { useMemo } from 'react';
import { THEMES } from '../data/themes';
import { getTodayID } from '../utils/helpers';

export const useThemeManager = (birthdays, pastReports, setManualTheme, manualTheme) => {
    
    // --- LÓGICA DE HORAS SEMANALES ---
    const weeklyHoursWorked = useMemo(() => {
        if (!pastReports || pastReports.length === 0) return 0;

        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); 
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        let totalHours = 0;

        pastReports.forEach(report => {
            if (!report.id || !report.content) return;

            const reportDate = new Date(report.id + "T12:00:00"); 
            
            if (reportDate >= monday && reportDate <= sunday) {
                // 🔥 EXPRESIÓN BILINGÜE: Busca "Tiempo Total" o "Hours worked"
                const match1 = report.content.match(/(?:Tiempo Total|Hours worked)[^0-9]*(\d{1,2}):(\d{1,2}):(\d{1,2})/i);
                const match2 = report.content.match(/(?:Tiempo Total|Hours worked)[^0-9]*(\d+)h\s*(\d+)m/i);
                
                let horasSumadas = 0;

                if (match1) {
                    horasSumadas = parseInt(match1[1]) + (parseInt(match1[2]) / 60) + (parseInt(match1[3]) / 3600);
                    totalHours += horasSumadas;
                } else if (match2) {
                    horasSumadas = parseInt(match2[1]) + (parseInt(match2[2]) / 60);
                    totalHours += horasSumadas;
                }

                // Chivato oculto por si acaso
                // console.log(`Reporte ${report.id} | Horas sumadas: ${horasSumadas.toFixed(2)}`);
            }
        });

        return parseFloat(totalHours.toFixed(2));
    }, [pastReports]);

    // --- SELECCIÓN DEL TEMA (EL CEREBRO) ---
    const strategy = useMemo(() => {
        const today = getTodayID();
        const [year, monthStr, dayStr] = today.split('-');
        const month = parseInt(monthStr);
        const day = parseInt(dayStr);

        if (manualTheme && THEMES[manualTheme]) return THEMES[manualTheme];
        if (month === 2 && day >= 13 && day <= 14) return THEMES.seasonal_valentines || THEMES.default;
        if (month === 10 && day === 31) return THEMES.seasonal_halloween || THEMES.default;
        if (month === 12 && (day === 24 || day === 25)) return THEMES.seasonal_christmas || THEMES.default;

        const isBday = birthdays.find(b => b.date === `${monthStr}-${dayStr}`);
        if (isBday) {
            if (isBday.name === 'Bianca') return THEMES.seasonal_bianca_bday || THEMES.seasonal_party;
            return THEMES.seasonal_party || THEMES.default;
        }

        return THEMES.default;
    }, [manualTheme, birthdays]);

    // --- MENSAJES DE CELEBRACIÓN ---
    const message = useMemo(() => {
        if (strategy.id === 'seasonal_valentines') return "💖 ¡Feliz San Valentín! 💖";
        if (strategy.id === 'seasonal_halloween') return "🎃 ¡Dulce o Truco! 🎃";
        if (strategy.id === 'seasonal_christmas') return "🎄 ¡Feliz Navidad! 🎄";
        
        const today = getTodayID().split('-').slice(1).join('-');
        const bday = birthdays.find(b => b.date === today);
        if (bday) return `🎉 ¡Feliz Cumpleaños, ${bday.name}! 🎂`;

        return ""; 
    }, [strategy, birthdays]);

    return {
        strategy,           
        message,            
        weeklyHoursWorked,  
        isUnlocked: true    
    };
};