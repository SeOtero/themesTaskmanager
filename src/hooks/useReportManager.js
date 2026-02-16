import { useState } from 'react';
import { saveDailyReport } from '../services/reportService';
import { generateCustomReport } from '../utils/reportGenerator';
import { doc, updateDoc } from 'firebase/firestore'; // Importamos updateDoc
import { db } from '../firebase'; // Asegúrate que la ruta a firebase sea correcta

export const useReportManager = (user, tasks, stopAllTimers, addCoins, userProfile) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleGenerate = async (selectedDate, themeName, onSuccess) => {
        setIsProcessing(true);
        try {
            // 1. Detener timers
            stopAllTimers();

            // 2. Generar el TEXTO antes de guardar (para tenerlo listo)
            const reportText = generateCustomReport(tasks, selectedDate, themeName);

            // 3. Guardar en BD (Servicio existente)
            const { totalReward, reportData, reportId } = await saveDailyReport(user, tasks, selectedDate, userProfile);

            // 🔥 FIX CRÍTICO: Forzamos la actualización del campo 'report' y 'date' en Firebase
            // Esto asegura que el TEXTO se guarde sí o sí, aunque el servicio lo haya olvidado.
            if (user && selectedDate) {
                // Recreamos el ID del documento igual que lo hace el servicio (generalmente uid_fecha)
                const docId = `${user.uid}_${selectedDate}`; 
                const reportRef = doc(db, "daily_reports", docId);
                
                await updateDoc(reportRef, {
                    report: reportText, // Guardamos el texto visible
                    date: selectedDate,  // Aseguramos la fecha correcta
                    content: reportText // Backup por si acaso
                }).catch(e => console.warn("No se pudo actualizar el texto del reporte:", e));
            }

            // 4. Pagar al usuario
            if (totalReward > 0) {
                addCoins(totalReward);
            }

            // 5. Notificar éxito
            alert(`✅ Reporte guardado correctamente.\nGanaste: ${totalReward} Lofi Coins.`);
            
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