// src/hooks/useReportManager.js
import { useState } from 'react';
import { saveDailyReport } from '../services/reportService';
import { generateCustomReport } from '../utils/reportGenerator'; // La utilidad que creamos antes

export const useReportManager = (user, tasks, stopAllTimers, addCoins, userProfile) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Aquí podrías mover también el estado de 'pastReports' si quisieras limpiarlo más.

    const handleGenerate = async (selectedDate, themeName, onSuccess) => {
        setIsProcessing(true);
        try {
            // 1. Detener timers (Importante para el cálculo final)
            stopAllTimers();

            // 2. Guardar en BD (Usando el servicio)
            const { totalReward, reportData } = await saveDailyReport(user, tasks, selectedDate, userProfile);

            // 3. Pagar al usuario (Usando el hook de wallet que ya tienes)
            if (totalReward > 0) {
                addCoins(totalReward);
            }

            // 4. Generar texto visual (Usando la utilidad)
            const reportText = generateCustomReport(tasks, selectedDate, themeName);

            // 5. Notificar éxito
            alert(`✅ Reporte guardado.\nGanaste: ${totalReward} Lofi Coins.`);
            
            // Callback para que App.jsx actualice la UI (cerrar modal, etc)
            if (onSuccess) onSuccess(reportText, reportData);

        } catch (error) {
            console.error("Error generando reporte:", error);
            alert("Error al generar el reporte. Revisa la consola.");
        } finally {
            setIsProcessing(false);
        }
    };

    return { handleGenerate, isProcessing };
};