import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, setDoc, increment, deleteDoc, addDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase'; 
import { getNextWeekID } from '../../utils/helpers'; 

// --- 1. LISTA DE TAREAS REORDENADA (Según Feedback) ---
const KNOWN_TASKS = [
    "Columna CONFIRMADO", 
    "Columna UPSELL",           // Antes "Por T. o Por LL."
    "Columna DATOS ENTREGA",
    "Columna RESPONDER", 
    "Columna REMINDER",
    "Chat en vivo (filtro Pendiente)", // Agrupado cerca de Reminder
    "Columna LATE VERIFICATION", 
    "Chat en vivo (filtro Abiertos)",
    "Ordenes confirmadas sheet (CHECK info)",
    "CHAT Pending Orders", 
    "CALL Pending Orders", 
    "Facebook/Instagram Comments & Chats"
];

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_MAP = { "Lunes": "Monday", "Martes": "Tuesday", "Miércoles": "Wednesday", "Jueves": "Thursday", "Viernes": "Friday", "Sábado": "Saturday", "Domingo": "Sunday" };

const TeamLeaderView = ({ onLogout, currentUserTeam, isAdmin }) => {
    
    // --- LÓGICA DE TIENDAS ---
    const visibleShops = useMemo(() => {
        const SCOPES = {
            'team1': ["Tienda Lujosa", "Clara Tienda", "Bella Divina"],
            'team2': ["Clara Tierra"],
            'all':   ["Tienda Lujosa", "Clara Tienda", "Bella Divina", "Clara Tierra"]
        };
        if (isAdmin) return SCOPES['all'];
        const teamKey = currentUserTeam?.replace('_', '') || 'team1';
        return SCOPES[teamKey] || SCOPES['team1'];
    }, [currentUserTeam, isAdmin]);

    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState('planner'); 
    
    // Planner
    const [squad, setSquad] = useState([]);
    const [selectedPlanDay, setSelectedPlanDay] = useState("Lunes");
    const [weeklyPlan, setWeeklyPlan] = useState({}); 
    const [draggedAgent, setDraggedAgent] = useState(null);
    const [agentSchedules, setAgentSchedules] = useState({}); 
    const nextWeekId = getNextWeekID();

    // Solicitudes
    const [scheduleRequests, setScheduleRequests] = useState([]);
    const [showRequestsModal, setShowRequestsModal] = useState(false);

    // Dashboard & Tools
    const [teamReports, setTeamReports] = useState([]);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('daily'); 
    const [selectedTaskFilter, setSelectedTaskFilter] = useState('ALL');
    const [selectedTeam, setSelectedTeam] = useState(currentUserTeam);
    const [expandedReportId, setExpandedReportId] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 
    const [processedData, setProcessedData] = useState([]);
    const [detectedTasks, setDetectedTasks] = useState(KNOWN_TASKS); 
    const [taskGoals, setTaskGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('specificTaskGoals')) || {}; } catch { return {}; } });
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [manualTaskName, setManualTaskName] = useState(""); 

    // Ideas & Dev
    const [teamIdeas, setTeamIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryText, setSummaryText] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [isSendIdeaModalOpen, setIsSendIdeaModalOpen] = useState(false);
    const [newIdeaText, setNewIdeaText] = useState("");
    const [newIdeaType, setNewIdeaType] = useState("monday");

    // News & Academy
    const [newsList, setNewsList] = useState([]);
    const [newNewsText, setNewNewsText] = useState("");
    const [newNewsType, setNewNewsType] = useState("info");
    const [quizzes, setQuizzes] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);

    // Users
    const [usersList, setUsersList] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editForm, setEditForm] = useState({ role: '', team: '' });

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadData = async () => {
            // 1. Cargar Usuarios
            const uSnap = await getDocs(collection(db, "users"));
            const allUsers = uSnap.docs.map(d => ({id:d.id, ...d.data()}));
            setUsersList(allUsers);
            setSquad(allUsers); 

            // 2. Cargar Plan Semanal
            try {
                const planRef = doc(db, "weekly_plans", nextWeekId);
                const planSnap = await getDoc(planRef); 
                if (planSnap.exists()) setWeeklyPlan(planSnap.data().plan || {});
            } catch (e) { console.error("Error loading plan:", e); }

            // 3. Cargar Horarios
            try {
                const sQuery = query(collection(db, 'weekly_schedules'), where('weekId', '==', nextWeekId));
                const sSnap = await getDocs(sQuery);
                const schedulesMap = {};
                sSnap.docs.forEach(d => { schedulesMap[d.data().uid] = d.data().schedule; });
                setAgentSchedules(schedulesMap);
            } catch (e) { console.error("Error loading schedules:", e); }

            // 4. Solicitudes
            const reqUnsub = onSnapshot(query(collection(db, "schedule_requests"), where("status", "==", "pending")), (snap) => {
                setScheduleRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
            });

            // 5. News & Quiz
            const newsUnsub = onSnapshot(query(collection(db, "news_ticker"), orderBy("createdAt", "desc")), (snap) => setNewsList(snap.docs.map(d => ({id: d.id, ...d.data()}))));
            const quizUnsub = onSnapshot(collection(db, "training_modules"), (snap) => setQuizzes(snap.docs.map(d => ({id: d.id, ...d.data()}))));

            // 6. Dashboard Data 
            if (activeTab === 'dashboard') fetchTeamData();
            
            // 7. Ideas
            if (activeTab === 'ideas' || activeTab === 'dev') fetchIdeas();

            return () => { reqUnsub(); newsUnsub(); quizUnsub(); };
        };
        loadData();
    }, [activeTab, nextWeekId, filterDate, selectedTeam, viewMode]);

    // --- HANDLERS PLANNER ---
    const handleDragStart = (e, agent) => {
        setDraggedAgent(agent);
        e.dataTransfer.setData("agent", JSON.stringify(agent));
    };

    const handleDrop = async (e, taskName, shopName) => {
        e.preventDefault();
        try {
            const agentData = JSON.parse(e.dataTransfer.getData("agent"));
            const newPlan = { ...weeklyPlan };
            if (!newPlan[selectedPlanDay]) newPlan[selectedPlanDay] = {};
            if (!newPlan[selectedPlanDay][taskName]) newPlan[selectedPlanDay][taskName] = {};
            if (!newPlan[selectedPlanDay][taskName][shopName]) newPlan[selectedPlanDay][taskName][shopName] = [];

            const currentAssigns = newPlan[selectedPlanDay][taskName][shopName];

            if (agentData.id === 'ALL') {
                squad.forEach(member => {
                    if (!currentAssigns.find(a => a.id === member.id)) {
                        currentAssigns.push({ id: member.id, name: member.name || member.email });
                    }
                });
            } else {
                if (!currentAssigns.find(a => a.id === agentData.id)) {
                    currentAssigns.push({ id: agentData.id, name: agentData.name || agentData.email });
                }
            }

            setWeeklyPlan(newPlan);
            await setDoc(doc(db, "weekly_plans", nextWeekId), { 
                weekId: nextWeekId, 
                plan: newPlan,
                updatedAt: Date.now()
            }, { merge: true });

        } catch (err) { 
            console.error("Error saving plan:", err); 
            alert("⚠️ Error de Permisos: Revisa las reglas de Firebase."); 
        }
    };

    const removeAssign = async (taskName, shopName, agentId) => {
        const newPlan = { ...weeklyPlan };
        newPlan[selectedPlanDay][taskName][shopName] = newPlan[selectedPlanDay][taskName][shopName].filter(a => a.id !== agentId);
        setWeeklyPlan(newPlan);
        try {
            await setDoc(doc(db, "weekly_plans", nextWeekId), { plan: newPlan }, { merge: true });
        } catch (err) { console.error(err); }
    };

    // --- DASHBOARD FUNCTIONS ---
    const fetchTeamData = async () => {
        setIsLoading(true); setTeamReports([]); setProcessedData([]);
        try {
            const range = getDateRange();
            const reportsRef = collection(db, 'daily_reports');
            let q = selectedTeam === 'ALL_TEAMS' 
                ? query(reportsRef, where("date", ">=", range.start), where("date", "<=", range.end))
                : query(reportsRef, where("team", "==", selectedTeam), where("date", ">=", range.start), where("date", "<=", range.end));
            const querySnapshot = await getDocs(q);
            const rawReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeamReports(rawReports);
            const aggregated = {};
            rawReports.forEach(rep => {
                if (!aggregated[rep.uid]) aggregated[rep.uid] = { id: rep.uid, uid: rep.uid, userName: rep.userName, team: rep.team, totalTasks: 0, totalTimeMs: 0, taskBreakdownMap: {}, lastUpdate: rep.timestampStr };
                const agent = aggregated[rep.uid];
                agent.totalTasks += (rep.metrics?.totalTasks || 0); agent.totalTimeMs += (rep.metrics?.totalTimeMs || 0);
                agent.lastUpdate = rep.timestampStr || formatDateDisplay(rep.date);
                if (rep.taskBreakdown) rep.taskBreakdown.forEach(task => {
                    if (!agent.taskBreakdownMap[task.name]) agent.taskBreakdownMap[task.name] = { count: 0, timeMs: 0 };
                    agent.taskBreakdownMap[task.name].count += (task.count || 0); agent.taskBreakdownMap[task.name].timeMs += (task.timeMs || 0);
                });
            });
            const finalData = Object.values(aggregated).map(agent => {
                const breakdown = Object.entries(agent.taskBreakdownMap).map(([name, data]) => {
                    const hours = data.timeMs / 3600000;
                    return { name, count: data.count, timeMs: data.timeMs, speed: hours > 0 ? (data.count / hours).toFixed(2) : "0.00" };
                });
                const totalHours = agent.totalTimeMs / 3600000; const globalSpeed = totalHours > 0 ? (agent.totalTasks / totalHours).toFixed(2) : "0.00";
                return { ...agent, metrics: { totalTasks: agent.totalTasks, totalTimeMs: agent.totalTimeMs, globalSpeed: globalSpeed }, taskBreakdown: breakdown, timestampStr: agent.lastUpdate };
            });
            setProcessedData(finalData);
        } catch (error) { console.error("Error cargando reportes:", error); }
        setIsLoading(false);
    };

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

    // --- UTILS ---
    const getDateRange = () => {
        const [yearStr, monthStr, dayStr] = filterDate.split('-');
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        const toISODate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (viewMode === 'daily') return { start: filterDate, end: filterDate };
        if (viewMode === 'weekly') {
            const day = date.getDay(); const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date); monday.setDate(diffToMonday); monday.setHours(0,0,0,0);
            const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
            return { start: toISODate(monday), end: toISODate(sunday), startDateObj: monday, endDateObj: sunday };
        }
        if (viewMode === 'monthly') {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1); const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            return { start: toISODate(firstDay), end: toISODate(lastDay), startDateObj: firstDay, endDateObj: lastDay };
        }
        return { start: filterDate, end: filterDate };
    };
    const formatDateDisplay = (isoDate) => { if (!isoDate) return '-'; if (isoDate.includes('/')) return isoDate; const [year, month, day] = isoDate.split('-'); return `${day}/${month}/${year}`; };
    const getPerformanceColor = (speed, goal) => { if (goal === -1 || goal === undefined) return 'text-blue-400 font-normal italic'; const s = parseFloat(speed) || 0; const g = parseFloat(goal) || 1; if (s >= g) return 'text-green-400 font-bold drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]'; if (s >= (g * 0.7)) return 'text-yellow-400 font-bold'; return 'text-red-500 font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'; };
    const handleTaskGoalChange = (taskName, val) => { const newGoals = { ...taskGoals, [taskName]: parseFloat(val) }; setTaskGoals(newGoals); localStorage.setItem('specificTaskGoals', JSON.stringify(newGoals)); };
    const toggleNoExpectation = (taskName) => { const current = taskGoals[taskName]; handleTaskGoalChange(taskName, current === -1 ? 0 : -1); };
    const addManualTask = () => { if (manualTaskName.trim() && !detectedTasks.includes(manualTaskName)) setDetectedTasks(prev => [...prev, manualTaskName].sort()); setManualTaskName(""); };
    const toggleRow = (id) => setExpandedReportId(expandedReportId === id ? null : id);
    const formatTime = (ms) => { if (!ms) return '0h 0m'; const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); return `${h}h ${m}m`; };
    
    // --- FUNCIÓN DE FILTRADO (DEJA QUE FUNCIONE LA PESTAÑA DEV) ---
    const getFilteredIdeas = () => {
        const range = getDateRange();
        let filtered = teamIdeas;
        if (activeTab === 'ideas') filtered = filtered.filter(i => i.type === 'monday');
        else if (activeTab === 'dev') filtered = filtered.filter(i => i.type === 'dev');
        if (viewMode !== 'daily') {
            const startMs = range.startDateObj ? range.startDateObj.getTime() : 0;
            const endMs = range.endDateObj ? range.endDateObj.getTime() : 9999999999999;
            filtered = filtered.filter(idea => idea.timestamp >= startMs && idea.timestamp <= endMs);
        }
        filtered = filtered.filter(idea => showArchived ? idea.isArchived : !idea.isArchived);
        return filtered;
    };

    useEffect(() => { const tasksSet = new Set([...KNOWN_TASKS, ...detectedTasks, ...Object.keys(taskGoals)]); processedData.forEach(rep => rep.taskBreakdown?.forEach(t => tasksSet.add(t.name))); const sortedList = Array.from(tasksSet).sort(); if (sortedList.length !== detectedTasks.length) setDetectedTasks(sortedList); }, [processedData, isGoalsModalOpen]);

    // --- HANDLERS NEWS & QUIZ ---
    const addNews = async () => { if(!newNewsText) return; await addDoc(collection(db, 'news_ticker'), { text: newNewsText, type: newNewsType, createdAt: Date.now() }); setNewNewsText(""); };
    const deleteNews = async (id) => { await deleteDoc(doc(db, 'news_ticker', id)); };
    const saveQuiz = async (quiz) => { const payload = { ...quiz, active: true, version: quiz.version || 1 }; if(quiz.id) { if(quiz.isMajorUpdate) payload.version += 1; await updateDoc(doc(db, 'training_modules', quiz.id), payload); } else { await addDoc(collection(db, 'training_modules'), payload); } setEditingQuiz(null); };
    const deleteQuiz = async (id) => { if(window.confirm("Borrar?")) { await deleteDoc(doc(db, 'training_modules', id)); } };
    const toggleQuiz = async (q) => { await updateDoc(doc(db, 'training_modules', q.id), { active: !q.active }); };

    // --- HANDLERS SOLICITUDES ---
    const handleApproveRequest = async (req) => { try { await setDoc(doc(db, "weekly_schedules", `${req.uid}_${req.weekId}`), { uid: req.uid, userName: req.userName, weekId: req.weekId, schedule: req.proposedSchedule, updatedAt: Date.now() }); await deleteDoc(doc(db, "schedule_requests", req.id)); alert("✅ Solicitud Aprobada"); } catch (e) { alert("Error al aprobar."); } };
    const handleRejectRequest = async (reqId) => { if(!window.confirm("¿Rechazar?")) return; try { await deleteDoc(doc(db, "schedule_requests", reqId)); } catch (e) { alert("Error al rechazar."); } };

    // --- HANDLERS IDEAS ---
    const generateMondaySummary = () => { const visibleIdeas = teamIdeas.filter(i => i.type === 'monday' && !i.isArchived); const approvedIdeas = visibleIdeas.filter(i => i.status === 'approved'); if (approvedIdeas.length === 0) { alert("No hay ideas aprobadas."); return; } const range = getDateRange(); let summary = `📋 *RESUMEN DE IDEAS*\n📅 Periodo: ${range.start} al ${range.end}\n━━━━━━━━━━━━━━━━\n\n`; approvedIdeas.forEach((idea, index) => { summary += `💡 *TEMA #${index + 1}* (${idea.userName})\n📝 "${idea.content}"\n\n`; }); setSummaryText(summary); setShowSummaryModal(true); };
    const handleSendIdea = async () => { if (!newIdeaText.trim()) return; const currentUser = auth.currentUser; if (!currentUser) return; const now = new Date(); const timestampStr = now.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); const newIdea = { uid: currentUser.uid, userName: currentUser.displayName || currentUser.email || "Admin", team: currentUserTeam || 'admin', content: newIdeaText, type: newIdeaType, timestamp: Date.now(), timestampStr: timestampStr, analysis: { pros: "", cons: "" }, status: "new", isArchived: false }; try { await addDoc(collection(db, "monday_ideas"), newIdea); setNewIdeaText(""); alert("Enviado."); setIsSendIdeaModalOpen(false); fetchIdeas(); } catch (e) { alert("Error."); } };
    const handleIdeaVerdict = async (idea, verdict) => { if (idea.status !== 'new') return; try { if (verdict === 'approved') { await updateDoc(doc(db, "monday_ideas", idea.id), { status: 'approved' }); const walletRef = doc(db, "users", idea.uid, "data", "wallet"); try { await updateDoc(walletRef, { value: increment(50), coins: increment(50), lofiCoins: increment(50) }); } catch { await setDoc(walletRef, { coins: 50, lofiCoins: 50 }); } alert("✅ Aprobada +50 Coins"); } else { await updateDoc(doc(db, "monday_ideas", idea.id), { status: 'rejected' }); alert("Rechazada."); } setTeamIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: verdict } : i)); } catch (error) { alert(`Error: ${error.message}`); } };
    const handleArchiveIdea = async (ideaId) => { if (!window.confirm("¿Archivar?")) return; try { await updateDoc(doc(db, "monday_ideas", ideaId), { isArchived: true }); setTeamIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, isArchived: true } : i)); } catch (e) { alert("Error."); } };
    const handleRestoreIdea = async (ideaId) => { try { await updateDoc(doc(db, "monday_ideas", ideaId), { isArchived: false }); setTeamIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, isArchived: false } : i)); } catch (e) { alert("Error."); } };
    const handleDeleteIdea = async (ideaId) => { if (!window.confirm("⚠️ ¿ELIMINAR DEFINITIVAMENTE?")) return; try { await deleteDoc(doc(db, "monday_ideas", ideaId)); setTeamIdeas(prev => prev.filter(idea => idea.id !== ideaId)); } catch (e) { alert("Error."); } };
    const handleSaveAnalysis = async (ideaId, newAnalysis) => { try { await updateDoc(doc(db, "monday_ideas", ideaId), { analysis: newAnalysis }); alert("Guardado."); } catch (e) { alert("Error."); } };
    const handleAnalysisChange = (id, field, value) => { setTeamIdeas(prev => prev.map(idea => { if (idea.id === id) return { ...idea, analysis: { ...(idea.analysis || {pros:'', cons:''}), [field]: value } }; return idea; })); };

    // --- HANDLERS USUARIOS ---
    const startEditingUser = (user) => { setEditingUserId(user.id); setEditForm({ role: user.role || 'agent', team: user.team || 'default' }); };
    const saveUserChanges = async (userId) => { if (userId === auth.currentUser.uid && editForm.role !== 'admin') { alert("No puedes quitarte tus permisos."); return; } try { await updateDoc(doc(db, 'users', userId), { role: editForm.role, team: editForm.team }); setUsersList(prev => prev.map(u => u.id === userId ? { ...u, ...editForm } : u)); setEditingUserId(null); alert("Guardado."); } catch (e) { alert("Error al guardar."); } };

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white font-inter animate-fadeIn pb-20 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black pointer-events-none"></div>
            
            {/* HEADER */}
            <div className="relative z-10 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30"><span className="text-xl">⚡</span></div>
                        <div><h1 className="text-xl font-bold tracking-tight text-white uppercase">Nexus Control</h1><p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{isAdmin ? 'Administrator Access' : 'Team Leader Access'}</p></div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsGoalsModalOpen(true)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/5 transition-all flex items-center gap-2 hover:text-white"><span>🎯</span> METAS</button>
                        {/* 🔥 2. BOTÓN ATRÁS (Azul) */}
                        <button onClick={onLogout} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold border border-blue-500/20 transition-all flex items-center gap-2">
                            ⬅ ATRÁS
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
                {/* TABS */}
                <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 w-fit">
                    {['dashboard', 'planner', 'news', 'academy', 'ideas', isAdmin ? 'dev' : null, isAdmin ? 'users' : null].filter(Boolean).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            {{ dashboard: '📊 Reportes', planner: '🧩 Planner', news: '📢 Noticias', academy: '🎓 Academy', ideas: '💡 Ideas', dev: '👨‍💻 Dev Tickets', users: '👥 Usuarios' }[tab]}
                        </button>
                    ))}
                </div>

                {/* 1. DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-900 border border-white/10 p-4 rounded-xl shadow-xl">
                            <div className="flex items-center gap-3 w-full xl:w-auto bg-black/30 p-1.5 rounded-lg border border-white/5"><span className="text-[10px] text-slate-500 font-bold uppercase px-2">Filtrar:</span><select value={selectedTaskFilter} onChange={(e) => setSelectedTaskFilter(e.target.value)} className="bg-transparent text-white text-xs font-bold outline-none w-full xl:w-64 cursor-pointer hover:text-indigo-400 transition-colors"><option value="ALL" className="bg-slate-900">📋 TODAS LAS TAREAS</option>{detectedTasks.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                                <div className="flex bg-black/30 rounded-lg p-1 border border-white/5">{['daily', 'weekly', 'monthly'].map(mode => (<button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{{ daily: 'Día', weekly: 'Semana', monthly: 'Mes' }[mode]}</button>))}</div>
                                <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-indigo-400 text-xs">📅</span></div><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-black/30 border border-white/10 text-white text-xs font-bold rounded-lg py-2 pl-9 pr-3 outline-none focus:border-indigo-500 transition-all cursor-pointer hover:bg-black/50"/></div>
                                <button onClick={fetchTeamData} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-all shadow-lg active:scale-95 border border-indigo-400/50">{isLoading ? '...' : '↻'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead><tr className="bg-black/40 text-slate-400 text-[10px] uppercase tracking-wider border-b border-white/5"><th className="p-5 font-bold">Agente</th><th className="p-5 font-bold text-center">Tareas</th><th className="p-5 font-bold text-center text-indigo-400">Velocidad</th><th className="p-5 font-bold text-center">Tiempo</th><th className="p-5 font-bold text-center">Estado</th><th className="p-5 text-right">Acción</th></tr></thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {processedData.length > 0 ? processedData.map((agent) => {
                                            let displayCount = agent.metrics.totalTasks; let displaySpeed = agent.metrics.globalSpeed; let displayHours = agent.metrics.totalTimeMs; let speedColor = "text-slate-300";
                                            if (selectedTaskFilter !== 'ALL') { const taskData = agent.taskBreakdown.find(t => t.name === selectedTaskFilter); if (taskData) { displayCount = taskData.count; displaySpeed = taskData.speed; displayHours = taskData.timeMs; let goal = taskGoals[selectedTaskFilter]; if (goal === undefined) goal = -1; speedColor = getPerformanceColor(displaySpeed, goal); } else { displayCount = 0; displaySpeed = "0.00"; displayHours = 0; speedColor = "text-slate-600"; } } else { speedColor = "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold"; }
                                            return (
                                                <React.Fragment key={agent.id}>
                                                    <tr className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => toggleRow(agent.id)}>
                                                        <td className="p-5 font-medium text-slate-200 flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-xs text-indigo-400 font-bold">{agent.userName?.charAt(0) || '?'}</div><div><div>{agent.userName}</div>{selectedTeam === 'ALL_TEAMS' && <div className="text-[9px] text-slate-500 uppercase">{agent.team}</div>}</div></td>
                                                        <td className="p-5 text-center font-mono text-slate-300">{displayCount}</td>
                                                        <td className="p-5 text-center"><span className={`text-lg ${speedColor}`}>{displaySpeed}</span><span className="text-[10px] text-slate-600 ml-1">/h</span></td>
                                                        <td className="p-5 text-center text-slate-500 font-mono">{formatTime(displayHours)}</td>
                                                        <td className="p-5 text-center"><span className="bg-green-900/30 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20">ACTIVO</span></td>
                                                        <td className="p-5 text-right"><button className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded transition-all">{expandedReportId === agent.id ? 'Cerrar ▲' : 'Ver ▼'}</button></td>
                                                    </tr>
                                                    {expandedReportId === agent.id && ( <tr className="bg-black/30"><td colSpan={6} className="p-4"><div className="bg-slate-900 rounded-xl p-4 border border-white/5 shadow-inner"><h4 className="text-xs font-bold text-slate-500 mb-3 uppercase flex items-center gap-2">🔍 Desglose Detallado</h4>{agent.taskBreakdown?.length > 0 ? (<table className="w-full text-xs"><thead><tr className="text-slate-600 border-b border-white/5 text-left"><th className="pb-2 pl-2">Tarea</th><th className="pb-2 text-center">Cant.</th><th className="pb-2 text-center">Tiempo</th><th className="pb-2 text-right pr-4">Rendimiento</th></tr></thead><tbody className="divide-y divide-white/5">{agent.taskBreakdown.map((t, idx) => { let goal = taskGoals[t.name]; if (goal === undefined) goal = -1; const color = getPerformanceColor(t.speed, goal); const isNoExp = goal === -1; return (<tr key={idx} className={`text-slate-300 hover:bg-white/5 transition-colors ${selectedTaskFilter === t.name ? 'bg-indigo-900/20' : ''}`}><td className="py-2 pl-2 font-medium">{t.name}</td><td className="py-2 text-center font-mono text-slate-500">{t.count}</td><td className="py-2 text-center font-mono text-slate-500">{formatTime(t.timeMs)}</td><td className="py-2 text-right pr-4"><span className={color}>{t.speed} /h</span> <span className="text-[9px] text-slate-600 ml-1">{isNoExp ? '' : `(Meta: ${goal})`}</span></td></tr>); })}</tbody></table>) : <p className="text-xs text-slate-500 italic">Sin datos.</p>}</div></td></tr> )}
                                                </React.Fragment>
                                            );
                                        }) : (<tr><td colSpan={6} className="p-12 text-center text-slate-500 text-sm italic border-t border-white/5">{isLoading ? 'Cargando datos...' : 'No hay actividad registrada en este periodo.'}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. PLANNER (CON ANCHO DE COLUMNA AJUSTADO) */}
                {activeTab === 'planner' && (
                    <div className="flex gap-6 h-[75vh] animate-fadeIn">
                        
                        {/* SIDEBAR SQUAD */}
                        <div className="w-64 min-w-[250px] bg-slate-900 border border-white/10 rounded-xl p-4 overflow-y-auto flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Mi Squad</h3>
                            
                            {/* 🔥 BOTÓN ASIGNAR A TODOS */}
                            <div 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, { id: 'ALL', name: 'TODOS' })}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded-lg cursor-grab active:cursor-grabbing font-bold text-center border border-yellow-400 shadow-lg mb-4 flex items-center justify-center gap-2"
                            >
                                <span>👥</span> ASIGNAR A TODOS
                            </div>

                            {/* LISTA DE AGENTES */}
                            {squad.map(agent => {
                                const engDay = DAY_MAP[selectedPlanDay]; 
                                const schedule = agentSchedules[agent.id];
                                const todaySchedule = schedule ? schedule[engDay] : null;
                                let statusBadge = <span className="text-[9px] text-slate-600">?</span>;
                                if (todaySchedule) {
                                    if (todaySchedule.off) statusBadge = <span className="text-[9px] bg-red-900/40 text-red-400 px-1 rounded font-bold border border-red-500/20">OFF</span>;
                                    else statusBadge = <span className="text-[9px] bg-green-900/40 text-green-400 px-1 rounded font-bold border border-green-500/20">{todaySchedule.hours}h</span>;
                                }
                                return (
                                    <div key={agent.id} draggable onDragStart={(e) => handleDragStart(e, { id: agent.id, name: agent.name || agent.email })} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg cursor-grab active:cursor-grabbing border border-white/5 flex items-center gap-3 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                                            {(agent.name || agent.email).substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate font-medium text-slate-300">{agent.name || agent.email}</div>
                                            <div className="flex justify-end">{statusBadge}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <button onClick={() => setShowRequestsModal(true)} className="w-full mt-auto bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded py-3 text-xs font-bold hover:bg-blue-900/50 transition">
                                🔔 Solicitudes ({scheduleRequests.length})
                            </button>
                        </div>
                        
                        {/* TABLA PRINCIPAL (Con Scroll Horizontal y ancho mínimo) */}
                        <div className="flex-1 flex flex-col bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="flex bg-black/40 border-b border-white/10">
                                {WEEK_DAYS.map(d => (
                                    <button 
                                        key={d} 
                                        onClick={()=>setSelectedPlanDay(d)} 
                                        className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${selectedPlanDay===d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-auto p-4 bg-[#0b0e14]">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-3 text-slate-500 text-xs uppercase w-48 min-w-[200px] border-b border-white/10 sticky top-0 bg-[#0b0e14] z-10">Tarea</th>
                                            {visibleShops.map(s => (
                                                <th key={s} className="p-3 text-indigo-400 text-xs uppercase border-l border-white/5 min-w-[180px] text-center border-b border-white/10 sticky top-0 bg-[#0b0e14] z-10">
                                                    {s}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {KNOWN_TASKS.map(t => (
                                            <tr key={t} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-3 text-xs font-medium text-slate-300">{t}</td>
                                                {visibleShops.map(s => (
                                                    <td 
                                                        key={s} 
                                                        onDragOver={e=>e.preventDefault()} 
                                                        onDrop={e=>handleDrop(e, t, s)} 
                                                        className="p-2 border-l border-white/5 min-h-[50px] relative hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="min-h-[40px] rounded p-1 flex flex-wrap gap-1">
                                                            {weeklyPlan[selectedPlanDay]?.[t]?.[s]?.map(a => (
                                                                <div 
                                                                    key={a.id} 
                                                                    className="bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold shadow-sm"
                                                                >
                                                                    {a.name} 
                                                                    <button onClick={()=>removeAssign(t,s,a.id)} className="ml-1 text-indigo-400 hover:text-red-400 font-bold">×</button>
                                                                </div>
                                                            ))}
                                                            {(!weeklyPlan[selectedPlanDay]?.[t]?.[s] || weeklyPlan[selectedPlanDay]?.[t]?.[s].length === 0) && (
                                                                <span className="text-[10px] text-slate-700 italic w-full text-center mt-1">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. NEWS */}
                {activeTab === 'news' && (
                    <div className="max-w-4xl mx-auto animate-fadeIn">
                        <div className="bg-slate-900 p-6 rounded-xl border border-white/10 mb-6">
                            <div className="flex gap-4">
                                <input value={newNewsText} onChange={e=>setNewNewsText(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none" />
                                <select value={newNewsType} onChange={e=>setNewNewsType(e.target.value)} className="bg-black/30 border border-white/10 rounded-lg p-3 text-white"><option value="info">Info</option><option value="critical">Crítico</option><option value="party">Fiesta</option></select>
                                <button onClick={addNews} className="bg-indigo-600 px-6 rounded-lg font-bold hover:bg-indigo-500">Publicar</button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {newsList.map(n => (
                                <div key={n.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${n.type==='critical'?'bg-red-900 text-red-300':n.type==='party'?'bg-yellow-900 text-yellow-300':'bg-blue-900 text-blue-300'}`}>{n.type}</span><span className="text-sm">{n.text}</span></div>
                                    <button onClick={()=>deleteNews(n.id)} className="text-red-400 hover:text-red-300 text-xs">Borrar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. ACADEMY */}
                {activeTab === 'academy' && (
                    <div className="max-w-4xl mx-auto animate-fadeIn">
                        {!editingQuiz ? (
                            <>
                                <button onClick={()=>setEditingQuiz({title:'', reward:100, questions:[], version:1})} className="bg-green-600 px-4 py-2 rounded-lg font-bold text-sm mb-6">+ Nuevo Módulo</button>
                                <div className="grid gap-4">
                                    {quizzes.map(q => (
                                        <div key={q.id} className="bg-slate-900 p-5 rounded-xl border border-white/10 flex justify-between items-center">
                                            <div><h3 className="font-bold text-lg">{q.title}</h3><div className="text-xs text-slate-500">Reward: {q.reward} | v{q.version}</div></div>
                                            <div className="flex gap-2"><button onClick={()=>setEditingQuiz(q)} className="text-indigo-400 text-xs bg-indigo-900/30 px-3 py-1 rounded">Edit</button><button onClick={()=>toggleQuiz(q)} className={`text-xs px-3 py-1 rounded ${q.active ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{q.active ? 'Activo' : 'Inactivo'}</button><button onClick={()=>deleteQuiz(q.id)} className="text-red-400 text-xs bg-red-900/30 px-3 py-1 rounded">Del</button></div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <QuizEditor quiz={editingQuiz} onSave={saveQuiz} onCancel={()=>setEditingQuiz(null)} />
                        )}
                    </div>
                )}

                {/* 5. IDEAS & DEV */}
                {(activeTab === 'ideas' || activeTab === 'dev') && (
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <div><h2 className="text-xl font-bold text-white flex items-center gap-2">{activeTab === 'ideas' ? '🧠 Laboratorio de Ideas' : '👨‍💻 Tickets de Soporte & Bugs'}</h2><p className="text-xs text-slate-500 mt-1">Estado: <span className="text-indigo-400 font-bold">{showArchived ? 'ARCHIVADOS' : 'ACTIVOS'}</span></p></div>
                            <div className="flex items-center gap-3">
                                {activeTab === 'ideas' && (<button onClick={generateMondaySummary} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors shadow-lg flex items-center gap-2 border border-indigo-400/50">📋 RESUMEN</button>)}
                                <button onClick={() => setShowArchived(!showArchived)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${showArchived ? 'bg-slate-700 text-white border-slate-500' : 'bg-black/40 text-slate-500 border-slate-700 hover:text-white'}`}>{showArchived ? '👁️ Ver Activos' : '📦 Ver Archivados'}</button>
                                <button onClick={fetchIdeas} className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-xs text-slate-300 border border-white/10">↻</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getFilteredIdeas().map(idea => {
                                const isApproved = idea.status === 'approved'; const isRejected = idea.status === 'rejected'; const isPending = idea.status === 'new'; const isDevType = idea.type === 'dev';
                                return (
                                    <div key={idea.id} className={`bg-slate-900 border rounded-xl p-5 flex flex-col gap-3 relative group transition-all animate-fadeIn hover:shadow-xl ${isDevType ? 'border-purple-500/20 shadow-[0_0_10px_rgba(147,51,234,0.05)]' : 'border-white/10'}`}>
                                        <div className="flex justify-between items-start">
                                            <div><div className="flex items-center gap-2"><h4 className={`font-bold text-sm ${isDevType ? 'text-purple-300 font-mono' : 'text-white'}`}>{idea.userName}</h4>{isDevType && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-purple-900/30 text-purple-300 border-purple-500/30">BUG/DEV</span>}</div><p className="text-[10px] text-slate-500 font-mono mt-1">{idea.timestampStr}</p></div>
                                            {isApproved && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20 font-bold">✓ APROBADA</span>} {isRejected && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-500/20 font-bold">✕ RECHAZADA</span>} {isPending && <span className="text-[10px] bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 font-bold">⏳ PENDIENTE</span>}
                                        </div>
                                        <div className={`p-4 rounded-lg border min-h-[80px] ${isDevType ? 'bg-black/60 border-purple-900/30 font-mono text-xs text-green-400' : 'bg-black/30 border-white/5 text-sm text-slate-300 italic'}`}>"{idea.content}"</div>
                                        {!isDevType && (<div className="space-y-2 mt-2"><div className="relative"><span className="absolute top-2 left-2 text-[10px] text-green-500 font-bold">PROS</span><textarea className="w-full bg-slate-950 border border-white/10 rounded p-2 pt-6 text-xs text-slate-300 focus:border-green-500 outline-none h-16 resize-none" value={idea.analysis?.pros || ''} onChange={(e) => handleAnalysisChange(idea.id, 'pros', e.target.value)} /></div><div className="relative"><span className="absolute top-2 left-2 text-[10px] text-red-500 font-bold">CONS</span><textarea className="w-full bg-slate-950 border border-white/10 rounded p-2 pt-6 text-xs text-slate-300 focus:border-red-500 outline-none h-16 resize-none" value={idea.analysis?.cons || ''} onChange={(e) => handleAnalysisChange(idea.id, 'cons', e.target.value)} /></div></div>)}
                                        <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                                            {!isDevType && <button onClick={() => handleSaveAnalysis(idea.id, idea.analysis)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold py-2 rounded transition-colors">💾 Guardar</button>}
                                            {isPending && (<><button onClick={() => handleIdeaVerdict(idea, 'approved')} className="flex-1 bg-green-600/20 hover:bg-green-600 hover:text-white text-green-400 text-xs font-bold py-2 rounded transition-colors border border-green-600/30">👍 Aprobar</button><button onClick={() => handleIdeaVerdict(idea, 'rejected')} className="w-10 flex items-center justify-center bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded transition-colors border border-red-600/30">👎</button></>)}
                                            {(isApproved || isRejected) && !showArchived && (<><button onClick={() => handleArchiveIdea(idea.id)} className="w-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded transition-colors border border-slate-600" title="Archivar">📦</button><button onClick={() => handleDeleteIdea(idea.id)} className="w-10 flex items-center justify-center bg-red-900/20 hover:bg-red-900/80 text-red-500 hover:text-white font-bold rounded transition-colors border border-red-900/30" title="Eliminar">🗑️</button></>)}
                                            {showArchived && <button onClick={() => handleRestoreIdea(idea.id)} className="w-full flex items-center justify-center bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-2 rounded transition-colors border border-blue-500/20">♻️ Restaurar</button>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 6. USUARIOS */}
                {activeTab === 'users' && isAdmin && (
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                       <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-black/30 text-slate-400 text-[10px] uppercase font-bold"><tr className="border-b border-white/5"><th className="p-4">Usuario</th><th className="p-4">Rol Actual</th><th className="p-4">Equipo</th><th className="p-4 text-right">Gestión</th></tr></thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {usersList.map(user => (
                                        <tr key={user.id} className="hover:bg-white/[0.02]">
                                            <td className="p-4"><div className="font-bold text-white">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                                            {editingUserId === user.id ? (
                                                <><td className="p-4"><select value={editForm.role} onChange={e=>setEditForm({...editForm, role:e.target.value})} className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"><option value="agent">Agente</option><option value="team_leader">TL</option><option value="admin">Admin</option><option value="tester">Tester</option></select></td><td className="p-4"><select value={editForm.team} onChange={e=>setEditForm({...editForm, team:e.target.value})} className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"><option value="default">Default</option><option value="team1">Team 1</option><option value="team2">Team 2</option></select></td><td className="p-4 text-right"><button onClick={()=>saveUserChanges(user.id)} className="text-green-400 text-xs font-bold mr-3 hover:underline">GUARDAR</button><button onClick={()=>setEditingUserId(null)} className="text-red-400 text-xs font-bold hover:underline">CANCELAR</button></td></>
                                            ) : (
                                                <><td className="p-4"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${user.role === 'admin' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : user.role === 'team_leader' ? 'bg-blue-900/30 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{user.role}</span></td><td className="p-4 text-xs text-slate-400">{user.team}</td><td className="p-4 text-right"><button onClick={()=>startEditingUser(user)} className="text-indigo-400 text-xs font-bold hover:text-white transition-colors">EDITAR ✏️</button></td></>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                       </div>
                    </div>
                )}
            </div>

            {/* BOTONES FLOTANTES Y MODALES */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                <button onClick={() => { setNewIdeaType('dev'); setIsSendIdeaModalOpen(true); }} className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-900/50 transition-transform hover:scale-110 active:scale-95 border border-white/20 tooltip-trigger" title="Soporte Dev">👨‍💻</button>
                <button onClick={() => { setNewIdeaType('monday'); setIsSendIdeaModalOpen(true); }} className="flex items-center justify-center w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full shadow-lg shadow-yellow-900/50 transition-transform hover:scale-110 active:scale-95 border border-white/20 font-bold text-xl" title="Nueva Idea">💡</button>
            </div>
            
            {/* MODALES CLASICOS */}
            {isSendIdeaModalOpen && (<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"><div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"><div className={`p-5 flex justify-between items-center bg-gradient-to-r ${newIdeaType === 'monday' ? 'from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/20' : 'from-purple-600/20 to-indigo-600/20 border-b border-purple-500/20'}`}><h3 className={`text-lg font-bold flex items-center gap-2 ${newIdeaType === 'monday' ? 'text-yellow-400' : 'text-purple-400'}`}>{newIdeaType === 'monday' ? '💡 Nueva Idea Operativa' : '👨‍💻 Ticket de Soporte / Bug'}</h3><button onClick={() => setIsSendIdeaModalOpen(false)} className="text-slate-400 hover:text-white text-xl">×</button></div><div className="p-6"><textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm outline-none h-40 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" placeholder={newIdeaType === 'monday' ? "Describe tu propuesta..." : "Describe el error..."} value={newIdeaText} onChange={(e) => setNewIdeaText(e.target.value)} /><button onClick={handleSendIdea} className={`w-full font-bold py-3 rounded-xl transition-all mt-4 shadow-lg active:scale-95 ${newIdeaType === 'monday' ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>ENVIAR AHORA</button></div></div></div>)}
            {showSummaryModal && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"><div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]"><div className="p-5 border-b border-white/10 flex justify-between items-center bg-indigo-900/20"><h3 className="text-lg font-bold text-white">📋 Resumen Ejecutivo</h3><button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white">×</button></div><div className="p-0 overflow-hidden flex-1 relative"><textarea readOnly value={summaryText} className="w-full h-full bg-slate-950 p-6 text-sm font-mono text-green-400 focus:outline-none resize-none leading-relaxed" /></div><div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-slate-900"><button onClick={() => setShowSummaryModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">CERRAR</button><button onClick={() => { navigator.clipboard.writeText(summaryText); alert("Copiado."); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold text-xs shadow-lg">COPIAR TEXTO</button></div></div></div>)}
            {isGoalsModalOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"><div className="p-5 border-b border-white/10 flex justify-between items-center"><h3 className="text-lg font-bold text-white">🎯 Objetivos de Equipo</h3><button onClick={() => setIsGoalsModalOpen(false)} className="text-slate-400 hover:text-white">×</button></div><div className="p-6 overflow-y-auto flex-1 space-y-3"><div className="flex gap-2 mb-4"><input type="text" value={manualTaskName} onChange={(e) => setManualTaskName(e.target.value)} placeholder="Nueva tarea..." className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"/><button onClick={addManualTask} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold">+</button></div>{detectedTasks.map(taskName => { const isNoExp = taskGoals[taskName] === -1; return (<div key={taskName} className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"><span className="text-xs font-medium text-slate-300 flex-1">{taskName}</span><div className="flex items-center gap-2"><button onClick={() => toggleNoExpectation(taskName)} className={`w-6 h-6 rounded text-[10px] font-bold ${isNoExp ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>∞</button><div className={`flex items-center gap-2 ${isNoExp ? 'opacity-20 pointer-events-none' : ''}`}><input type="number" placeholder="0" value={isNoExp ? '' : (taskGoals[taskName] || '')} onChange={(e) => handleTaskGoalChange(taskName, e.target.value)} className="bg-black/30 border border-white/10 rounded px-2 py-1 w-16 text-right text-green-400 font-mono text-xs outline-none focus:border-green-500"/><span className="text-[10px] text-slate-500">/h</span></div></div></div>); })}</div><div className="p-4 border-t border-white/10 flex justify-end"><button onClick={() => setIsGoalsModalOpen(false)} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-xs hover:bg-slate-200">LISTO</button></div></div></div>)}
            
            {/* NUEVO: MODAL DE SOLICITUDES DE CAMBIO */}
            {showRequestsModal && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-yellow-900/20">
                            <h3 className="text-lg font-bold text-yellow-400">🔔 Solicitudes de Cambio de Horario</h3>
                            <button onClick={() => setShowRequestsModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {scheduleRequests.length === 0 ? (
                                <p className="text-center text-slate-500 italic py-10">No hay solicitudes pendientes.</p>
                            ) : (
                                scheduleRequests.map(req => (
                                    <div key={req.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-white">{req.userName}</h4>
                                                <p className="text-xs text-slate-500">Semana: {req.weekId}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApproveRequest(req)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">✓ APROBAR</button>
                                                <button onClick={() => handleRejectRequest(req.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">✕ RECHAZAR</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {Object.keys(req.proposedSchedule).map(day => {
                                                const d = req.proposedSchedule[day];
                                                if (d.off) return <div key={day} className="flex justify-between bg-black/20 p-2 rounded"><span className="text-slate-400">{day}</span><span className="text-red-400 font-bold">OFF</span></div>;
                                                if (d.hours > 0) return <div key={day} className="flex justify-between bg-black/20 p-2 rounded"><span className="text-slate-400">{day}</span><span className="text-green-400 font-bold">{d.hours}h</span></div>;
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const QuizEditor = ({ quiz, onSave, onCancel }) => {
    const [form, setForm] = useState(quiz);
    const [isMajorUpdate, setIsMajorUpdate] = useState(false);
    const addQ = () => setForm({...form, questions: [...(form.questions||[]), {text:'', options:['',''], correct:0}]});
    const updQ = (i, f, v) => { const qs = [...form.questions]; qs[i] = { ...qs[i], [f]: v }; setForm({...form, questions: qs}); };
    const updOpt = (qI, oI, v) => { const qs = [...form.questions]; qs[qI].options[oI] = v; setForm({...form, questions: qs}); };
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-white/10 space-y-4 animate-fadeIn">
            <h2 className="font-bold text-xl border-b border-white/10 pb-2">Editor de Módulo</h2>
            <div className="grid grid-cols-2 gap-4"><input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Título" className="bg-black/30 border border-white/10 p-2 rounded text-white" /><input type="number" value={form.reward} onChange={e=>setForm({...form, reward:parseInt(e.target.value)})} placeholder="Reward" className="bg-black/30 border border-white/10 p-2 rounded text-white" /></div>
            {quiz.id && <label className="flex items-center gap-2 text-yellow-200 text-xs"><input type="checkbox" checked={isMajorUpdate} onChange={e=>setIsMajorUpdate(e.target.checked)} /> Actualización Mayor (Reinicia progress)</label>}
            <div className="space-y-4">{form.questions?.map((q, i) => (<div key={i} className="bg-black/20 p-4 rounded border border-white/5"><input value={q.text} onChange={e=>updQ(i, 'text', e.target.value)} placeholder="Pregunta" className="w-full bg-transparent border-b border-white/10 mb-2 font-bold" /><div className="grid grid-cols-2 gap-2">{q.options.map((opt, oI) => (<div key={oI} className="flex gap-2"><input type="radio" checked={q.correct===oI} onChange={()=>updQ(i, 'correct', oI)} /><input value={opt} onChange={e=>updOpt(i, oI, e.target.value)} className="bg-white/5 rounded px-2 text-xs w-full" /></div>))}</div></div>))}
            <button onClick={addQ} className="w-full py-2 border border-dashed border-white/20 text-slate-400 text-xs rounded">+ Pregunta</button></div>
            <div className="flex gap-4"><button onClick={()=>onSave({...form, isMajorUpdate})} className="flex-1 bg-green-600 py-2 rounded font-bold">Guardar</button><button onClick={onCancel} className="bg-slate-700 px-4 rounded">Cancelar</button></div>
        </div>
    );
};

export default TeamLeaderView;