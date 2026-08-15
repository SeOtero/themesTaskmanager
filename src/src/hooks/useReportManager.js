import { useState } from 'react';
import { saveDailyReport } from '../services/reportService';
import { generateCustomReport } from '../utils/reportGenerator';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // 🔥 Agregamos getDoc
import { db } from '../firebase'; 
import { logger } from '../utils/logger';
import { showToast } from '../utils/toast';

export const useReportManager = (user, tasks, stopAllTimers, addCoins, userProfile) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleGenerate = async (selectedDate, themeName, onSuccess) => {
        setIsProcessing(true);
        try {
            // 1. Detener timers
            stopAllTimers();

            // 2. 🔥 CHECK DE SEGURIDAD: ¿Ya existe un reporte para esta fecha?
            const docId = `${user.uid}_${selectedDate}`; 
            const reportRef = doc(db, "daily_reports", docId);
            const reportSnap = await getDoc(reportRef);
            const reportExists = reportSnap.exists(); // true si ya se cobró hoy

            // 3. Guardar en BD (Servicio existente)
            const { totalReward, reportData } = await saveDailyReport(user, tasks, selectedDate, userProfile);

            // 4. Generar el TEXTO visual
            const reportText = generateCustomReport(tasks, selectedDate, themeName);

            // 5. FIX DE TEXTO (El parche que hicimos antes para asegurar que se guarde el texto)
            if (user && selectedDate) {
                await updateDoc(reportRef, {
                    report: reportText, 
                    date: selectedDate,
                    content: reportText 
                }).catch(e => {
                    // Si el documento no existía (era nuevo), updateDoc puede fallar si saveDailyReport es muy lento,
                    // pero saveDailyReport ya debería haberlo creado. Ignoramos este error seguro.
                    logger.warn("Actualización secundaria:", e);
                });
            }

            // 6. 💰 LÓGICA DE PAGO CONDICIONAL 💰
            if (!reportExists && totalReward > 0) {
                // SOLO si es reporte NUEVO
                addCoins(totalReward);
                showToast(`✅ Reporte NUEVO guardado.\n💰 ¡Ganaste: ${totalReward} Lofi Coins!`, 'success');
            } else {
                // Si ya existía, solo avisamos que se actualizó
                showToast(`🔄 Reporte ACTUALIZADO correctamente.\n(No se otorgan monedas por editar reportes existentes)`);
            }
            
            // 7. Callback para la UI
            if (onSuccess) onSuccess(reportText, reportData);

        } catch (error) {
            logger.error("Error generando reporte:", error);
            showToast("Error al generar el reporte. Revisa la consola.", 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return { handleGenerate, isProcessing };
};