// src/hooks/useQuickLinks.js
//
// "Enlaces Rápidos" — accesos directos a páginas web que el Team Leader quiere
// unificar para todo el equipo (ej: el drive de recursos, el tablero de turnos,
// una planilla externa, etc.). Solo lectura para agentes; TL/admin los cargan
// desde su panel.
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

export const useQuickLinks = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'quick_links'), orderBy('createdAt', 'desc')),
            (snap) => {
                setLinks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => { logger.error('Error cargando enlaces rápidos', err); setLoading(false); }
        );
        return () => unsub();
    }, []);

    return { links, loading };
};
