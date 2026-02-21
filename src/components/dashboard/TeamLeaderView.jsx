import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, setDoc, increment, deleteDoc, addDoc, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase'; 
import { getNextWeekID } from '../../utils/helpers'; 

// --- IMPORTAMOS LOS COMPONENTES ---
import TLDashboardTab from './TLDashboardTab';
import TLPlannerTab from './TLPlannerTab';
import TLNewsTab from './TLNewsTab';
import TLAcademyTab from './TLAcademyTab';
import TLIdeasTab from './TLIdeasTab';
import TLUsersTab from './TLUsersTab';
import TLNotificationsModal from './TLNotificationsModal';
import QuickNotesWidget from '../tools/QuickNotesWidget';

// --- LISTA DE TAREAS ---
const KNOWN_TASKS = ["Columna CONFIRMADO", "Columna UPSELL", "Columna DATOS ENTREGA", "Columna RESPONDER", "Columna REMINDER", "Chat en vivo (filtro Pendiente)", "Columna LATE VERIFICATION", "Chat en vivo (filtro Abiertos)", "Ordenes confirmadas sheet (CHECK info)", "CHAT Pending Orders", "CALL Pending Orders", "Facebook/Instagram Comments & Chats"];
const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_MAP = { "Lunes": "Monday", "Martes": "Tuesday", "Miércoles": "Wednesday", "Jueves": "Thursday", "Viernes": "Friday", "Sábado": "Saturday", "Domingo": "Sunday" };

// --- HELPERS INTERNOS ---
const getCurrentWeekID = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
};

const TeamLeaderView = ({ onLogout, currentUserTeam, isAdmin }) => {
    
    // --- LÓGICA DE TIENDAS ---
    const visibleShops = useMemo(() => {
        const SCOPES = { 'team1': ["Tienda Lujosa", "Clara Tienda", "Bella Divina"], 'team2': ["Clara Tierra"], 'all': ["Tienda Lujosa", "Clara Tienda", "Bella Divina", "Clara Tierra"] };
        if (isAdmin) return SCOPES['all'];
        return SCOPES[currentUserTeam?.replace('_', '') || 'team1'] || SCOPES['team1'];
    }, [currentUserTeam, isAdmin]);

    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState('planner'); 
    const [targetWeek, setTargetWeek] = useState('current'); 
    
    const activeWeekId = useMemo(() => {
        return targetWeek === 'next' ? getNextWeekID() : getCurrentWeekID();
    }, [targetWeek]);

    // Planner
    const [squad, setSquad] = useState([]);
    const [weeklyPlan, setWeeklyPlan] = useState({}); 
    const [agentSchedules, setAgentSchedules] = useState({}); 
    
    // NOTIFICACIONES
    const [scheduleRequests, setScheduleRequests] = useState([]);
    const [pendingIdeas, setPendingIdeas] = useState([]); 
    const [showNotificationsModal, setShowNotificationsModal] = useState(false); 

    // Dashboard
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

    // Otros
    const [newsList, setNewsList] = useState([]);
    const [newNewsText, setNewNewsText] = useState("");
    const [newNewsType, setNewNewsType] = useState("info");
    const [quizzes, setQuizzes] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [teamIdeas, setTeamIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryText, setSummaryText] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [isSendIdeaModalOpen, setIsSendIdeaModalOpen] = useState(false);
    const [newIdeaText, setNewIdeaText] = useState("");
    const [newIdeaType, setNewIdeaType] = useState("monday");
    const [usersList, setUsersList] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editForm, setEditForm] = useState({ role: '', team: '' });
    const [pointsToSend, setPointsToSend] = useState(0); 

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadData = async () => {
            const uSnap = await getDocs(collection(db, "users"));
            const allUsers = uSnap.docs.map(d => ({id:d.id, ...d.data()}));
            setUsersList(allUsers); setSquad(allUsers); 

            setWeeklyPlan({});
            try { 
                const planRef = doc(db, "weekly_plans", activeWeekId); 
                const planSnap = await getDoc(planRef); 
                if (planSnap.exists()) setWeeklyPlan(planSnap.data().plan || {});
            } catch (e) { console.error(e); }

            const sQuery = query(collection(db, 'weekly_schedules'), where('weekId', '==', activeWeekId));
            const unsubSchedules = onSnapshot(sQuery, (snap) => {
                const schedulesMap = {};
                snap.docs.forEach(d => { const data = d.data(); if(data.uid) schedulesMap[data.uid] = data.schedule; });
                setAgentSchedules(schedulesMap);
            });

            // Listeners
            const reqUnsub = onSnapshot(query(collection(db, "schedule_requests"), where("status", "==", "pending")), (snap) => setScheduleRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))));
            const ideasUnsub = onSnapshot(query(collection(db, "monday_ideas"), where("status", "==", "new")), (snap) => setPendingIdeas(snap.docs.map(d => ({id: d.id, ...d.data()}))));
            const newsUnsub = onSnapshot(query(collection(db, "news_ticker"), orderBy("createdAt", "desc")), (snap) => setNewsList(snap.docs.map(d => ({id: d.id, ...d.data()}))));
            const quizUnsub = onSnapshot(collection(db, "training_modules"), (snap) => setQuizzes(snap.docs.map(d => ({id: d.id, ...d.data()}))));

            if (activeTab === 'dashboard') fetchTeamData();
            if (activeTab === 'ideas' || activeTab === 'dev') fetchIdeas();
            
            return () => { unsubSchedules(); reqUnsub(); ideasUnsub(); newsUnsub(); quizUnsub(); };
        };
        loadData();
    }, [activeTab, activeWeekId, filterDate, selectedTeam, viewMode]); 

    // --- HANDLERS ---
   // --- FUNCIÓN DE CARGA DE DATOS OPTIMIZADA (ZERO-WASTE) ---
    const fetchTeamData = async () => {
        setIsLoading(true);
        setTeamReports([]);
        setProcessedData([]); 

        try {
            const range = getDateRange();
            const reportsRef = collection(db, 'daily_reports');
            
            // 🛡️ CONSTRUCCIÓN DE LA CONSULTA SEGURA
            const constraints = [
                where("date", ">=", range.start),
                where("date", "<=", range.end),
                orderBy("date", "desc")
            ];

            if (selectedTeam !== 'ALL_TEAMS') {
                constraints.push(where("team", "==", selectedTeam));
            }

            // 🚨 EL FRENO DE SEGURIDAD: Límite de 100 reportes
            constraints.push(limit(100));

            const q = query(reportsRef, ...constraints);
            const querySnapshot = await getDocs(q);
            
            const rawReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeamReports(rawReports);

            // --- PROCESAMIENTO DE DATOS (EN MEMORIA) ---
            const aggregated = {}; 
            
            rawReports.forEach(rep => { 
                if (!aggregated[rep.uid]) {
                    aggregated[rep.uid] = { 
                        id: rep.uid, 
                        uid: rep.uid, 
                        userName: rep.userName || "Usuario Desconocido", 
                        team: rep.team || "Sin Equipo", 
                        totalTasks: 0, 
                        totalTimeMs: 0, 
                        taskBreakdownMap: {}, 
                        lastUpdate: rep.timestampStr || rep.date 
                    }; 
                }
                
                const agent = aggregated[rep.uid]; 
                agent.totalTasks += (rep.metrics?.totalTasks || 0); 
                agent.totalTimeMs += (rep.metrics?.totalTimeMs || 0); 
                if (rep.timestampStr > agent.lastUpdate) agent.lastUpdate = rep.timestampStr; 
                
                if (Array.isArray(rep.taskBreakdown)) {
                    rep.taskBreakdown.forEach(task => { 
                        const tName = task.name || task.text || "Tarea Genérica";
                        if (!agent.taskBreakdownMap[tName]) agent.taskBreakdownMap[tName] = { count: 0, timeMs: 0 }; 
                        agent.taskBreakdownMap[tName].count += (task.count || 1); 
                        agent.taskBreakdownMap[tName].timeMs += (task.elapsedTime || task.timeMs || 0); 
                    }); 
                }
            });

            const finalData = Object.values(aggregated).map(agent => { 
                const breakdown = Object.entries(agent.taskBreakdownMap).map(([name, data]) => { 
                    const hours = data.timeMs / 3600000; 
                    return { name, count: data.count, timeMs: data.timeMs, speed: hours > 0 ? (data.count / hours).toFixed(2) : "0.00" }; 
                }); 
                const totalHours = agent.totalTimeMs / 3600000; 
                const globalSpeed = totalHours > 0 ? (agent.totalTasks / totalHours).toFixed(2) : "0.00"; 
                return { ...agent, metrics: { totalTasks: agent.totalTasks, totalTimeMs: agent.totalTimeMs, globalSpeed: globalSpeed }, taskBreakdown: breakdown, timestampStr: agent.lastUpdate }; 
            });
            
            setProcessedData(finalData);

        } catch (error) { 
            console.error("Error cargando reportes:", error); 
        } finally {
            setIsLoading(false);
        }
    };
    // ... (Mantén el resto de handlers igual: fetchIdeas, getDateRange, etc.) ...
    const fetchIdeas = async () => { setIdeasLoading(true); try { let q = query(collection(db, "monday_ideas"), orderBy("timestamp", "desc")); const snap = await getDocs(q); let docs = snap.docs.map(d => ({id: d.id, ...d.data()})); if (!isAdmin) docs = docs.filter(d => d.type !== 'dev'); setTeamIdeas(docs); } catch (e) { console.error(e); } setIdeasLoading(false); };
    const getDateRange = () => { const [yearStr, monthStr, dayStr] = filterDate.split('-'); const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr)); const toISODate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; if (viewMode === 'daily') return { start: filterDate, end: filterDate }; if (viewMode === 'weekly') { const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1); const m = new Date(date); m.setDate(diff); const s = new Date(m); s.setDate(m.getDate() + 6); return { start: toISODate(m), end: toISODate(s), startDateObj: m, endDateObj: s }; } if (viewMode === 'monthly') { const f = new Date(date.getFullYear(), date.getMonth(), 1); const l = new Date(date.getFullYear(), date.getMonth() + 1, 0); return { start: toISODate(f), end: toISODate(l), startDateObj: f, endDateObj: l }; } return { start: filterDate, end: filterDate }; };
    const formatDateDisplay = (iso) => { if (!iso || iso.includes('/')) return iso; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
    const getPerformanceColor = (s, g) => { if (g === -1 || g === undefined) return 'text-blue-400 font-normal italic'; const sp = parseFloat(s)||0, gl = parseFloat(g)||1; if (sp >= gl) return 'text-green-400 font-bold'; if (sp >= (gl * 0.7)) return 'text-yellow-400 font-bold'; return 'text-red-500 font-bold'; };
    const toggleRow = (id) => setExpandedReportId(expandedReportId === id ? null : id);
    const formatTime = (ms) => { if (!ms) return '0h 0m'; const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); return `${h}h ${m}m`; };
    const getFilteredIdeas = () => { const range = getDateRange(); let filtered = teamIdeas; if (activeTab === 'ideas') filtered = filtered.filter(i => i.type === 'monday'); else if (activeTab === 'dev') filtered = filtered.filter(i => i.type === 'dev'); if (viewMode !== 'daily') { const startMs = range.startDateObj ? range.startDateObj.getTime() : 0; const endMs = range.endDateObj ? range.endDateObj.getTime() : 9999999999999; filtered = filtered.filter(i => i.timestamp >= startMs && i.timestamp <= endMs); } filtered = filtered.filter(i => showArchived ? i.isArchived : !i.isArchived); return filtered; };
    const addNews = async () => { if(!newNewsText) return; await addDoc(collection(db, 'news_ticker'), { text: newNewsText, type: newNewsType, createdAt: Date.now() }); setNewNewsText(""); };
    const deleteNews = async (id) => { await deleteDoc(doc(db, 'news_ticker', id)); };
    const saveQuiz = async (q) => { const p = { ...q, active: true, version: q.version || 1 }; if(q.id) { if(q.isMajorUpdate) p.version += 1; await updateDoc(doc(db, 'training_modules', q.id), p); } else { await addDoc(collection(db, 'training_modules'), p); } setEditingQuiz(null); };
    const deleteQuiz = async (id) => { if(window.confirm("Borrar?")) await deleteDoc(doc(db, 'training_modules', id)); };
    const toggleQuiz = async (q) => { await updateDoc(doc(db, 'training_modules', q.id), { active: !q.active }); };
    const handleSendIdea = async () => { if (!newIdeaText.trim()) return; const u = auth.currentUser; if (!u) return; const now = new Date(); const tsStr = now.toLocaleString('es-AR'); const idea = { uid: u.uid, userName: u.displayName||"Admin", team: currentUserTeam||'admin', content: newIdeaText, type: newIdeaType, timestamp: Date.now(), timestampStr: tsStr, analysis: {pros:"", cons:""}, status: "new", isArchived: false }; await addDoc(collection(db, "monday_ideas"), idea); setNewIdeaText(""); setIsSendIdeaModalOpen(false); fetchIdeas(); };
    const handleIdeaVerdict = async (i, v) => { if (v === 'approved') { await updateDoc(doc(db, "monday_ideas", i.id), { status: 'approved' }); await setDoc(doc(db, "users", i.uid, "data", "wallet"), { val: { value: increment(50), coins: increment(50), lofiCoins: increment(50) } }, { merge: true }); alert("Aprobada +50"); } else { await updateDoc(doc(db, "monday_ideas", i.id), { status: 'rejected' }); } setTeamIdeas(prev => prev.map(id => id.id === i.id ? { ...id, status: v } : id)); };
    const handleArchiveIdea = async (id) => { if(window.confirm("Archivar?")) { await updateDoc(doc(db, "monday_ideas", id), { isArchived: true }); setTeamIdeas(prev => prev.map(i => i.id === id ? { ...i, isArchived: true } : i)); } };
    const handleRestoreIdea = async (id) => { await updateDoc(doc(db, "monday_ideas", id), { isArchived: false }); setTeamIdeas(prev => prev.map(i => i.id === id ? { ...i, isArchived: false } : i)); };
    const handleDeleteIdea = async (id) => { if(window.confirm("Eliminar?")) { await deleteDoc(doc(db, "monday_ideas", id)); setTeamIdeas(prev => prev.filter(i => i.id !== id)); } };
    const handleSaveAnalysis = async (id, an) => { await updateDoc(doc(db, "monday_ideas", id), { analysis: an }); alert("Guardado"); };
    const handleAnalysisChange = (id, f, v) => { setTeamIdeas(prev => prev.map(i => i.id === id ? { ...i, analysis: { ...(i.analysis || {pros:'', cons:''}), [f]: v } } : i)); };
    const generateMondaySummary = () => { const app = teamIdeas.filter(i => i.type === 'monday' && !i.isArchived && i.status === 'approved'); if (app.length === 0) { alert("Sin ideas aprobadas."); return; } const r = getDateRange(); let s = `📋 *RESUMEN*\n📅 ${r.start} - ${r.end}\n\n`; app.forEach((i, idx) => { s += `💡 *#${idx + 1}* (${i.userName})\n"${i.content}"\n\n`; }); setSummaryText(s); setShowSummaryModal(true); };
    const startEditingUser = (u) => { setEditingUserId(u.id); setEditForm({ role: u.role || 'agent', team: u.team || 'default' }); };
    const saveUserChanges = async (uid) => { try { await updateDoc(doc(db, 'users', uid), editForm); setUsersList(prev => prev.map(u => u.id === uid ? { ...u, ...editForm } : u)); setEditingUserId(null); alert("Guardado"); } catch (e) { alert("Error"); } };
    const handleGivePoints = async (uid) => { const amt = parseInt(pointsToSend); if (!amt) return; await setDoc(doc(db, "users", uid, "data", "wallet"), { val: { value: increment(amt), coins: increment(amt), lofiCoins: increment(amt) } }, { merge: true }); alert(`Enviados ${amt}`); setPointsToSend(0); };
    const handleApproveRequest = async (req) => { try { await setDoc(doc(db, "weekly_schedules", `${req.uid}_${req.weekId}`), { uid: req.uid, userName: req.userName, weekId: req.weekId, schedule: req.proposedSchedule, updatedAt: Date.now() }); await deleteDoc(doc(db, "schedule_requests", req.id)); alert("✅ Aprobada"); } catch (e) { alert("Error"); } };
    const handleRejectRequest = async (reqId) => { if(!window.confirm("Rechazar?")) return; await deleteDoc(doc(db, "schedule_requests", reqId)); };

    // --- 🔥 NAVEGACIÓN DESDE NOTIFICACIONES 🔥 ---
    const handleNavigateFromModal = (tabName) => {
        setActiveTab(tabName);
        setShowNotificationsModal(false);
    };

    const totalNotifications = scheduleRequests.length + pendingIdeas.length;

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white font-inter animate-fadeIn pb-20 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black pointer-events-none"></div>
            
            {/* HEADER */}
            <div className="relative z-10 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"><span className="text-xl">⚡</span></div>
                        <div><h1 className="text-xl font-bold uppercase">Nexus Control</h1><p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{isAdmin ? 'Admin' : 'Team Leader'}</p></div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={() => setShowNotificationsModal(true)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 relative ${totalNotifications > 0 ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                            <span>🔔</span> 
                            {totalNotifications > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] border border-slate-900 shadow-sm">{totalNotifications}</span>}
                        </button>
                        <button onClick={() => setIsGoalsModalOpen(true)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/5 flex items-center gap-2">🎯 METAS</button>
                        <button onClick={onLogout} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold border border-blue-500/20">⬅ ATRÁS</button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
                <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 w-fit">
                    {['dashboard', 'planner', 'news', 'academy', 'ideas', isAdmin ? 'dev' : null, isAdmin ? 'users' : null].filter(Boolean).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            {{ dashboard: '📊 Reportes', planner: '🧩 Planner', news: '📢 Noticias', academy: '🎓 Academy', ideas: '💡 Ideas', dev: '👨‍💻 Dev', users: '👥 Usuarios' }[tab]}
                        </button>
                    ))}
                </div>

                {activeTab === 'dashboard' && <TLDashboardTab processedData={processedData} detectedTasks={detectedTasks} taskGoals={taskGoals} selectedTeam={selectedTeam} isLoading={isLoading} selectedTaskFilter={selectedTaskFilter} setSelectedTaskFilter={setSelectedTaskFilter} viewMode={viewMode} setViewMode={setViewMode} filterDate={filterDate} setFilterDate={setFilterDate} expandedReportId={expandedReportId} fetchTeamData={fetchTeamData} toggleRow={toggleRow} formatTime={formatTime} getPerformanceColor={getPerformanceColor} />}
                {activeTab === 'planner' && <TLPlannerTab squad={squad} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} agentSchedules={agentSchedules} visibleShops={visibleShops} nextWeekId={activeWeekId} targetWeek={targetWeek} setTargetWeek={setTargetWeek} />}
                {activeTab === 'news' && <TLNewsTab newsList={newsList} newNewsText={newNewsText} setNewNewsText={setNewNewsText} newNewsType={newNewsType} setNewNewsType={setNewNewsType} addNews={addNews} deleteNews={deleteNews} />}
                {activeTab === 'academy' && <TLAcademyTab quizzes={quizzes} editingQuiz={editingQuiz} setEditingQuiz={setEditingQuiz} saveQuiz={saveQuiz} deleteQuiz={deleteQuiz} toggleQuiz={toggleQuiz} />}
                {(activeTab === 'ideas' || activeTab === 'dev') && <TLIdeasTab activeTab={activeTab} showArchived={showArchived} setShowArchived={setShowArchived} fetchIdeas={fetchIdeas} filteredIdeas={getFilteredIdeas()} generateMondaySummary={generateMondaySummary} handleSaveAnalysis={handleSaveAnalysis} handleIdeaVerdict={handleIdeaVerdict} handleArchiveIdea={handleArchiveIdea} handleDeleteIdea={handleDeleteIdea} handleRestoreIdea={handleRestoreIdea} handleAnalysisChange={handleAnalysisChange} />}
                {activeTab === 'users' && isAdmin && <TLUsersTab usersList={usersList} editingUserId={editingUserId} setEditingUserId={setEditingUserId} editForm={editForm} setEditForm={setEditForm} setPointsToSend={setPointsToSend} handleGivePoints={handleGivePoints} saveUserChanges={saveUserChanges} startEditingUser={startEditingUser} />}
            </div>

            {/* MODALES FLOTANTES */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                <button onClick={() => { setNewIdeaType('dev'); setIsSendIdeaModalOpen(true); }} className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg border border-white/20">👨‍💻</button>
                <button onClick={() => { setNewIdeaType('monday'); setIsSendIdeaModalOpen(true); }} className="flex items-center justify-center w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full shadow-lg font-bold text-xl border border-white/20">💡</button>
            </div>
            
            {isSendIdeaModalOpen && (<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"><div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6"><h3 className="text-lg font-bold text-white mb-4">Nueva Idea</h3><textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm h-40" value={newIdeaText} onChange={(e) => setNewIdeaText(e.target.value)} /><div className="flex gap-2 mt-4"><button onClick={handleSendIdea} className="flex-1 bg-indigo-600 py-2 rounded font-bold">Enviar</button><button onClick={()=>setIsSendIdeaModalOpen(false)} className="px-4 bg-slate-700 rounded">X</button></div></div></div>)}
            {showSummaryModal && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4"><div className="bg-slate-900 w-full max-w-2xl h-[80vh] flex flex-col"><textarea readOnly value={summaryText} className="flex-1 bg-slate-950 p-6 text-green-400 font-mono" /><button onClick={()=>setShowSummaryModal(false)} className="py-3 bg-slate-800 text-white font-bold">Cerrar</button></div></div>)}
            {isGoalsModalOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"><div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"><h3 className="text-lg font-bold text-white mb-4">Metas</h3><div className="space-y-2">{detectedTasks.map(t=>(<div key={t} className="flex justify-between text-sm text-slate-300"><span>{t}</span><input type="number" value={taskGoals[t]||''} onChange={e=>setTaskGoals({...taskGoals, [t]:e.target.value})} className="bg-black/40 w-16 text-center text-green-400"/></div>))}</div><button onClick={()=>setIsGoalsModalOpen(false)} className="mt-4 w-full bg-indigo-600 py-2 rounded font-bold">Listo</button></div></div>)}
                    {/* 🔥 WIDGET DE NOTAS RÁPIDAS 🔥 */}
            <QuickNotesWidget user={auth.currentUser} />
            {/* 🔥 MODAL DE NOTIFICACIONES UNIFICADO 🔥 */}
            <TLNotificationsModal 
                isOpen={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                scheduleRequests={scheduleRequests}
                pendingIdeas={pendingIdeas}
                handleApproveRequest={handleApproveRequest}
                handleRejectRequest={handleRejectRequest}
                onNavigate={handleNavigateFromModal} // <--- Pasamos la función de navegación
            />
        </div>
    );
};

export default TeamLeaderView;