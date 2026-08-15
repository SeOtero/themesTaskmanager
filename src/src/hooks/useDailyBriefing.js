// src/hooks/useDailyBriefing.js
//
// "Tablón de Anuncios del Día" — pensado para agentes olvidadizos: al entrar a la
// app ven una lista de recordatorios/tareas del día (ej: "el lunes 17 es feriado",
// "los sábados hay que mandar disponibilidad antes que nada") y las van tildando.
// Si completan TODAS las del día, se les otorga una medalla "Flawless" y se suma
// a su racha de días perfectos (que se rompe si un día no completan todo).
//
// Modelo de datos en Firestore:
//   daily_announcements/{YYYY-MM-DD}        -> { items: [{id, text, targetUids, actionType}], updatedAt }
//   recurring_announcements/{id}            -> { text, targetUids, actionType, recurrence: {type:'daily'} | {type:'weekly', dayOfWeek: 0-6} }
//   users/{uid}/announcements_progress/{YYYY-MM-DD} -> { checkedIds: [...], completedAt }
//   users/{uid}.perfectDaysStreak  (number)
//   users/{uid}.perfectDaysHistory (array de 'YYYY-MM-DD', las últimas fechas flawless)
//
// Los anuncios recurrentes (ej: "mandar disponibilidad" todos los sábados, o
// "grabar el EOD report" todos los días) se cargan UNA sola vez del lado del TL
// y se combinan automáticamente con los del día específico, según corresponda.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, collection, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getTodayID, getDateIdOffset } from '../utils/helpers';
import { logger } from '../utils/logger';
import { showToast } from '../utils/toast';

const MAX_HISTORY_ENTRIES = 60; // ~2 meses de historial, suficiente para no crecer sin límite

// Un anuncio recurrente "aplica hoy" si es diario, o si es semanal y hoy es su día.
const recurrenceAppliesToday = (recurrence) => {
    if (!recurrence) return false;
    if (recurrence.type === 'daily') return true;
    if (recurrence.type === 'weekly') return new Date().getDay() === recurrence.dayOfWeek;
    return false;
};

export const useDailyBriefing = (user) => {
    const [announcement, setAnnouncement] = useState(null);
    const [recurringItems, setRecurringItems] = useState([]);
    const [checkedIds, setCheckedIds] = useState([]);
    const [completedAt, setCompletedAt] = useState(null);
    const [streak, setStreak] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const todayID = getTodayID();

    useEffect(() => {
        if (!user) { setLoading(false); return; }

        const unsubAnnouncement = onSnapshot(
            doc(db, 'daily_announcements', todayID),
            (snap) => {
                setAnnouncement(snap.exists() ? { id: snap.id, ...snap.data() } : null);
                setLoading(false);
            },
            (err) => { logger.error('Error cargando el tablón del día', err); setLoading(false); }
        );

        const unsubRecurring = onSnapshot(
            collection(db, 'recurring_announcements'),
            (snap) => setRecurringItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => logger.error('Error cargando anuncios recurrentes', err)
        );

        const unsubProgress = onSnapshot(
            doc(db, 'users', user.uid, 'announcements_progress', todayID),
            (snap) => {
                if (snap.exists()) {
                    setCheckedIds(snap.data().checkedIds || []);
                    setCompletedAt(snap.data().completedAt || null);
                } else {
                    setCheckedIds([]);
                    setCompletedAt(null);
                }
            },
            (err) => logger.error('Error cargando progreso del tablón', err)
        );

        const unsubUser = onSnapshot(
            doc(db, 'users', user.uid),
            (snap) => {
                const data = snap.data() || {};
                setStreak(data.perfectDaysStreak || 0);
                setHistory(data.perfectDaysHistory || []);
            },
            (err) => logger.error('Error cargando racha del tablón', err)
        );

        return () => { unsubAnnouncement(); unsubRecurring(); unsubProgress(); unsubUser(); };
    }, [user, todayID]);

    const items = useMemo(() => {
        if (!user) return [];
        const dateSpecific = announcement?.items || [];
        const recurringToday = recurringItems.filter((it) => recurrenceAppliesToday(it.recurrence));
        const combined = [...recurringToday, ...dateSpecific];
        // Un ítem es visible si es para todos (sin targetUids o vacío) o si el
        // usuario actual está específicamente en la lista de destinatarios.
        return combined.filter(
            (it) => !it.targetUids || it.targetUids.length === 0 || it.targetUids.includes(user.uid)
        );
    }, [announcement, recurringItems, user]);

    const isComplete = useMemo(
        () => items.length > 0 && items.every((it) => checkedIds.includes(it.id)),
        [items, checkedIds]
    );
    const pendingCount = items.filter((it) => !checkedIds.includes(it.id)).length;

    // Otorga (o mantiene) la racha. Solo se llama la primera vez que se completa
    // el día (guardado con completedAt), para que togglear items después no la altere.
    const awardStreak = useCallback(async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const snap = await getDoc(userRef);
            const data = snap.data() || {};
            const prevHistory = data.perfectDaysHistory || [];
            const yesterdayID = getDateIdOffset(-1);
            const continuedStreak = prevHistory.includes(yesterdayID);
            const newStreak = continuedStreak ? (data.perfectDaysStreak || 0) + 1 : 1;

            const newHistory = prevHistory.includes(todayID)
                ? prevHistory
                : [...prevHistory, todayID].slice(-MAX_HISTORY_ENTRIES);

            await updateDoc(userRef, {
                perfectDaysStreak: newStreak,
                perfectDaysHistory: newHistory,
            });

            showToast(
                newStreak > 1
                    ? `🏅 ¡Día Flawless! Racha de ${newStreak} días seguidos.`
                    : '🏅 ¡Día Flawless! Empezaste una nueva racha.',
                'success',
                6000
            );
        } catch (e) {
            logger.error('Error actualizando la racha del tablón', e);
        }
    }, [todayID]);

    const toggleItem = useCallback(async (itemId) => {
        if (!user) return;

        const newChecked = checkedIds.includes(itemId)
            ? checkedIds.filter((id) => id !== itemId)
            : [...checkedIds, itemId];

        const allDone = items.length > 0 && items.every((it) => newChecked.includes(it.id));
        const progressRef = doc(db, 'users', user.uid, 'announcements_progress', todayID);

        try {
            await setDoc(progressRef, {
                checkedIds: newChecked,
                completedAt: allDone ? (completedAt || Date.now()) : null,
            }, { merge: true });

            if (allDone && !completedAt) {
                await awardStreak(user.uid);
            }
        } catch (e) {
            logger.error('Error guardando progreso del tablón', e);
            showToast('No se pudo guardar tu progreso. Probá de nuevo.', 'error');
        }
    }, [user, checkedIds, completedAt, items, todayID, awardStreak]);

    return {
        announcement,
        items,
        checkedIds,
        isComplete,
        pendingCount,
        streak,
        history,
        loading,
        toggleItem,
    };
};
