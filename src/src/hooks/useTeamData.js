import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useTeamData = (currentUserTeam) => {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // 1. Escuchar Usuarios (Filtrar por equipo si es necesario)
        const usersQuery = currentUserTeam 
            ? query(collection(db, 'users'), where('team', '==', currentUserTeam))
            : collection(db, 'users');

        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        });

        // 2. Escuchar Reportes (Últimos 7 días para métricas rápidas)
        // Nota: Traemos todo por ahora, idealmente filtrar por fecha
        const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
            const reportsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsList);
        });

        // 3. Escuchar Solicitudes de Horario (Schedule Requests)
        const requestsQuery = query(collection(db, 'scheduleRequests'), where('status', '==', 'pending'));
        const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
            const reqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(reqList);
        });

        setLoading(false);

        return () => {
            unsubUsers();
            unsubReports();
            unsubRequests();
        };
    }, [currentUserTeam]);

    return { users, setUsers, reports, requests, loading };
};