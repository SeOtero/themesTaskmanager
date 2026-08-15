// src/hooks/useIdeas.js
import { useState, useEffect } from 'react';
import { submitIdeaToFirebase, subscribeToIdeasHistory } from '../services/ideasService';
import { logger } from '../utils/logger';
import { showToast } from '../utils/toast';

export const useIdeas = (user) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Efecto para cargar historial automáticamente
    useEffect(() => {
        if (!user?.uid) return;
        
        // Nos suscribimos y guardamos la función de "unsubscribe" para limpiar
        const unsubscribe = subscribeToIdeasHistory(user.uid, (data) => {
            setHistory(data);
        });

        return () => unsubscribe(); // Limpieza al desmontar
    }, [user]);

    // 2. Función para enviar que usará la UI
    const sendIdea = async (text, type) => {
        try {
            setLoading(true);
            await submitIdeaToFirebase(user, text, type);
            return true; // Éxito
        } catch (error) {
            logger.error("Error enviando idea:", error);
            showToast("Error al enviar la idea.", 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { history, sendIdea, loading };
};