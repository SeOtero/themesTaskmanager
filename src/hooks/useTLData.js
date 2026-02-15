import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; 
import { getNextWeekID } from '../utils/helpers'; // Asegúrate que esta ruta sea correcta

export const useTLData = (currentUserTeam, activeTab, isAdmin) => {
    // --- ESTADOS GLOBALES ---
    const [usersList, setUsersList] = useState([]);
    const [squad, setSquad] = useState([]);
    const [weeklyPlan, setWeeklyPlan] = useState({});
    const [agentSchedules, setAgentSchedules] = useState({});
    const [scheduleRequests, setScheduleRequests] = useState([]);
    const [newsList, setNewsList] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    
    // --- ESTADOS DE REPORTES E IDEAS ---
    const [teamReports, setTeamReports] = useState([]);
    const [teamIdeas, setTeamIdeas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [ideasLoading, setIdeasLoading] = useState(false);

    const nextWeekId = getNextWeekID();

    // 1. CARGA INICIAL (Usuarios, Planes, Noticias, Quizzes)
    useEffect(() => {
        const loadInitialData = async () => {
            // Usuarios
            const uSnap = await getDocs(collection(db, "users"));
            const allUsers = uSnap.docs.map(d => ({id:d.id, ...d.data()}));
            setUsersList(allUsers);
            setSquad(allUsers); // O filtrar por equipo aquí si quisieras

            // Plan Semanal
            try {
                const planRef = doc(db, "weekly_plans", nextWeekId);
                const planSnap = await getDoc(planRef); 
                if (planSnap.exists()) setWeeklyPlan(planSnap.data().plan || {});
            } catch (e) { console.error("Error loading plan:", e); }

            // Horarios (Schedules)
            try {
                const sQuery = query(collection(db, 'weekly_schedules'), where('weekId', '==', nextWeekId));
                const sSnap = await getDocs(sQuery);
                const schedulesMap = {};
                sSnap.docs.forEach(d => { schedulesMap[d.data().uid] = d.data().schedule; });
                setAgentSchedules(schedulesMap);
            } catch (e) { console.error("Error loading schedules:", e); }
        };

        loadInitialData();

        // Listeners en tiempo real
        const reqUnsub = onSnapshot(query(collection(db, "schedule_requests"), where("status", "==", "pending")), (snap) => {
            setScheduleRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });

        const newsUnsub = onSnapshot(query(collection(db, "news_ticker"), orderBy("createdAt", "desc")), (snap) => {
            setNewsList(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });

        const quizUnsub = onSnapshot(collection(db, "training_modules"), (snap) => {
            setQuizzes(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });

        return () => { reqUnsub(); newsUnsub(); quizUnsub(); };
    }, [nextWeekId]);

    // 2. FETCH DE REPORTES (Solo si está en Dashboard)
    const fetchTeamData = async (filterDate, viewMode, selectedTeam) => {
        setIsLoading(true);
        setTeamReports([]);
        try {
            // Lógica de rango de fechas (Extraída de tu código original)
            let start = filterDate, end = filterDate;
            const [yearStr, monthStr, dayStr] = filterDate.split('-');
            const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
            const toISODate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            if (viewMode === 'weekly') {
                const day = date.getDay(); const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(date); monday.setDate(diffToMonday); monday.setHours(0,0,0,0);
                const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
                start = toISODate(monday); end = toISODate(sunday);
            } else if (viewMode === 'monthly') {
                const firstDay = new Date(date.getFullYear(), date.getMonth(), 1); const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                start = toISODate(firstDay); end = toISODate(lastDay);
            }

            const reportsRef = collection(db, 'daily_reports');
            let q = selectedTeam === 'ALL_TEAMS' 
                ? query(reportsRef, where("date", ">=", start), where("date", "<=", end))
                : query(reportsRef, where("team", "==", selectedTeam), where("date", ">=", start), where("date", "<=", end));
            
            const querySnapshot = await getDocs(q);
            setTeamReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Error cargando reportes:", error); }
        setIsLoading(false);
    };

    // 3. FETCH DE IDEAS
    const fetchIdeas = async () => {
        setIdeasLoading(true);
        try {
            let q = query(collection(db, "monday_ideas"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            let docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
            if (!isAdmin) docs = docs.filter(d => d.type !== 'dev');
            setTeamIdeas(docs);
        } catch (error) { console.error(error); }
        setIdeasLoading(false);
    };

    return {
        usersList, setUsersList,
        squad, setSquad,
        weeklyPlan, setWeeklyPlan,
        agentSchedules,
        scheduleRequests, setScheduleRequests,
        newsList, setNewsList,
        quizzes, setQuizzes,
        teamReports, isLoading, fetchTeamData,
        teamIdeas, setTeamIdeas, ideasLoading, fetchIdeas,
        nextWeekId
    };
};