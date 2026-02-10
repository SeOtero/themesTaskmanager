import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useThemeManager } from './hooks/useThemeManager';
import { useFirestoreDoc } from './hooks/useFirestore'; 
import { birthdaysList } from './data/constants';
import { getTodayID, getCurrentWeekID, getNextWeekID } from './utils/helpers';

// --- FIREBASE IMPORTS ---
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'; 
import { db } from './firebase'; 

// --- COMPONENTES UI ---
import LoginScreen from './components/LoginScreen';
import EconomyBar from './components/ui/EconomyBar';
import Title from './components/ui/Title';
import GlobalStatusMessage from './components/ui/GlobalStatusMessage';
import TaskInputForm from './components/ui/TaskInputForm';
import TaskListItem from './components/ui/TaskListItem';
import CalendarWidget from './components/ui/CalendarWidget';
import ReportViewer from './components/ui/ReportViewer';
import ThemeSelectorWidget from './components/ui/ThemeSelector';
import FloatingSalaryButton from './components/ui/FloatingSalaryButton';

// --- MODALES ---
import ReportConfigModal from './components/modals/ReportConfigModal';
import SalaryCalculatorModal from './components/modals/SalaryCalculatorModal';
import DeleteAllConfirmationModal from './components/modals/DeleteAllConfirmationModal';
import MarketplaceModal from './components/modals/MarketplaceModal';

// --- COMPONENTES ADMIN ---
import TeamLeaderView from './components/dashboard/TeamLeaderView'; 

// --- EFECTOS ---
import { EFFECT_COMPONENTS, BackgroundAudio, SpiderWeb } from './components/effects/BackgroundEffects';
import MatrixEffect from './components/effects/MatrixEffect';

// --- 🛠️ NUEVA FUNCIÓN GENERADORA DE REPORTE (FORMATO FOTO 2) ---
const generateCustomReport = (tasks, dateStr, themeName) => {
    // 1. Iconos por Tema
    const THEME_ICONS = {
        neko: '🐱', lofi: '☕', winter: '❄️', crimson: '👹', 
        royal: '👑', forest: '🌲', neon: '⚡', galaxy: '🚀', 
        halloween: '🎃', default: '📝'
    };
    const icon = THEME_ICONS[themeName] || '📝';

    // 2. Formato de Fecha Largo (Ej: Sunday, February 9, 2026)
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions); // Cambia 'en-US' a 'es-AR' si lo prefieres en español

    // 3. Helper Tiempo (ms -> 0h 0m)
    const formatMs = (ms) => {
        const h = Math.floor(ms / 3600000);
        const min = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${min}m`;
    };

    // 4. Calcular Totales y Agrupar por Tienda
    let totalMs = 0;
    const groups = {};

    tasks.forEach(t => {
        const time = t.running ? t.elapsedTime + (Date.now() - t.lastTime) : t.elapsedTime;
        totalMs += time;

        const shop = t.category || 'General';
        if (!groups[shop]) groups[shop] = [];
        
        groups[shop].push({
            name: t.rawTaskName || t.text,
            qty: parseInt(t.quantity) || 0,
            timeStr: formatMs(time)
        });
    });

    // 5. Construir String Final
    let report = `End of Day Report: ${formattedDate}\n`;
    report += `Hours worked: ${formatMs(totalMs)}\n\n`;
    report += `Today I worked on the following tasks:\n`;

    Object.keys(groups).sort().forEach(shop => {
        report += `--- ${shop} ---\n`;
        groups[shop].forEach(item => {
            const qtyPart = item.qty > 0 ? ` (${item.qty} orders)` : '';
            report += `${icon} ${item.name}${qtyPart}: ${item.timeStr}\n`;
        });
    });

    return report;
};

const App = () => {
    const { user, loading } = useUser();
    const [userProfile, setUserProfile] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false); 

    useEffect(() => {
        if (user) {
            const fetchRole = async () => {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) setUserProfile(docSnap.data());
                    else setUserProfile({ role: 'agent', team: 'default' });
                } catch (e) { console.error("Error fetching user role", e); }
            };
            fetchRole();
        }
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Nexus OS...</div>;
    if (!user) return <LoginScreen />;

    const isLeader = userProfile && (userProfile.role === 'admin' || userProfile.role === 'team_leader');

    if (isLeader && showDashboard) {
        return <TeamLeaderView onLogout={() => setShowDashboard(false)} currentUserTeam={userProfile.team || 'default'} isAdmin={userProfile.role === 'admin'} />;
    }

    return <AuthenticatedApp user={user} loading={loading} isLeader={isLeader} onOpenDashboard={() => setShowDashboard(true)} userProfile={userProfile} />;
};

const AuthenticatedApp = ({ user, loading, isLeader, onOpenDashboard, userProfile }) => {
    const shouldLoadData = !loading && user;
// --- ESTADOS FIREBASE ---
    const [pastReports, setPastReports] = useFirestoreDoc('data', 'reports', [], shouldLoadData ? user : null);
    const [manualTheme, setManualTheme] = useFirestoreDoc('config', 'theme', 'default', shouldLoadData ? user : null);

    // 🔥 BILLETERA: VERSIÓN APLANADORA DE ERRORES 🔥
    // Inicializamos con null para detectar si cargó o no
    const [rawWalletData, setRawWalletData, loadingCoins] = useFirestoreDoc('data', 'wallet', null, shouldLoadData ? user : null);

    const lofiCoins = useMemo(() => {
        if (!rawWalletData) return 0;

        // 1. DETECTOR DE ERRORES (Matrioshka):
        // Si existe val.val, significa que se anidó doble por error. Leemos el de más adentro (el real).
        if (rawWalletData.val && rawWalletData.val.val) {
            return Number(rawWalletData.val.val.value) || 0;
        }

        // 2. Lectura Normal (Estructura correcta)
        if (rawWalletData.val) {
            return Number(rawWalletData.val.value) || 0;
        }

        // 3. Lectura Antigua (Raíz)
        return Number(rawWalletData.value) || 0;
    }, [rawWalletData]);


    // 🔧 FUNCIÓN DE GUARDADO "APLANADORA"
    // Esta función reescribe TODO el documento con la estructura limpia.
    // Elimina las anidaciones dobles automáticamente la próxima vez que el usuario gane/gaste monedas.
    const setLofiCoins = async (newValue) => {
        if (!user || !user.uid) return;

        // Estructura PERFECTA que queremos en la base de datos
        const cleanData = {
            val: {
                value: newValue,
                coins: newValue,
                lofiCoins: newValue
            },
            // Mantenemos la raíz sincronizada pero PLANA
            value: newValue,
            coins: newValue,
            lofiCoins: newValue
        };

        try {
            // 🔥 CLAVE DEL ÉXITO: 
            // Usamos setDoc SIN "merge". Esto BORRA cualquier basura vieja (como val.val) 
            // y deja solo lo que definimos en cleanData.
            const walletRef = doc(db, 'users', user.uid, 'data', 'wallet');
            await setDoc(walletRef, cleanData);

            // Actualizamos el estado local para que la barra cambie al instante
            setRawWalletData(cleanData); 
        } catch (error) {
            console.error("Error limpiando billetera:", error);
        }
    };
    // 🔥 FIN CORRECCIÓN 🔥

    const [hourlyRate, setHourlyRate] = useFirestoreDoc('config', 'hourlyRate', '', shouldLoadData ? user : null);
    const [weeklyGoal, setWeeklyGoal] = useFirestoreDoc('config', 'weeklyGoal', 10, shouldLoadData ? user : null);
    const [inventory, setInventory] = useFirestoreDoc('data', 'inventory', ['default'], shouldLoadData ? user : null);
    const [lastBonusDate, setLastBonusDate, loadingBonus] = useFirestoreDoc('data', 'lastLoginBonus', null, shouldLoadData ? user : null);
    const [lastBonusWeek, setLastBonusWeek] = useFirestoreDoc('data', 'lastWeeklyBonus', '', shouldLoadData ? user : null);

    const [activePet, setActivePet] = useFirestoreDoc('config', 'pet', null, shouldLoadData ? user : null);
    const [activeEffect, setActiveEffect] = useFirestoreDoc('config', 'effect', null, shouldLoadData ? user : null);
    const [activeBorder, setActiveBorder] = useFirestoreDoc('config', 'border', null, shouldLoadData ? user : null);

    // --- ESTADOS UI ---
    const [activeTab, setActiveTab] = useState('tasks');
    const [reportOutput, setReportOutput] = useState('');
    const [calendarSelectedDate, setCalendarSelectedDate] = useState(getTodayID());
    const [selectedReportDate, setSelectedReportDate] = useState(getTodayID());
    
    // --- MODALES ---
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
    
    // --- NUEVOS ESTADOS ---
    const [news, setNews] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [userQuizProgress, setUserQuizProgress] = useState({}); 
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [weekForm, setWeekForm] = useState({ Monday: { hours: 0, off: false }, Tuesday: { hours: 0, off: false }, Wednesday: { hours: 0, off: false }, Thursday: { hours: 0, off: false }, Friday: { hours: 0, off: false }, Saturday: { hours: 0, off: true }, Sunday: { hours: 0, off: true } });
    
    const [ideaText, setIdeaText] = useState("");
    const [ideaType, setIdeaType] = useState("monday");
    const [myIdeasHistory, setMyIdeasHistory] = useState([]);

    const themeData = useThemeManager(birthdaysList, pastReports, setManualTheme, manualTheme);
    const { strategy: themeClasses, message, isUnlocked, weeklyHoursWorked } = themeData;
    const taskData = useTasks(shouldLoadData ? user : null);
    const { tasks, addTask, addMultipleTasks, deleteTask, deleteAllTasks, toggleTimer, updateTaskDetails, sortTasksByShop, resetTaskTimer, stopAllTimers, statusMessage, resumeStoppedTimers, clearStatusMessage, syncTasksTime, errorMessage, setErrorMessage } = taskData;

    // --- LOGGER SILENCIOSO ---
    const logEvent = async (eventName, data = {}) => {
        try { await addDoc(collection(db, "app_analytics"), { eventName, uid: user.uid, timestamp: Date.now(), data }); } catch (e) { console.error("Log error", e); }
    };

    // --- SUSCRIPCIONES REAL-TIME ---
    useEffect(() => {
        if (!user) return;
        const newsUnsub = onSnapshot(query(collection(db, "news_ticker"), orderBy("createdAt", "desc")), (snap) => setNews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const quizUnsub = onSnapshot(query(collection(db, "training_modules"), where("active", "==", true)), (snap) => setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const progressUnsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setUserQuizProgress(docSnap.data().quizProgress || {});
                if (docSnap.data().currentSkin !== themeClasses.name) {
                    updateDoc(doc(db, "users", user.uid), { currentSkin: themeClasses.name }); 
                }
            }
        });
        
        if (isIdeasModalOpen) {
            const q = query(collection(db, "monday_ideas"), where("uid", "==", user.uid), orderBy("timestamp", "desc"));
            getDocs(q).then(snap => setMyIdeasHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        }

        return () => { newsUnsub(); quizUnsub(); progressUnsub(); };
    }, [user, themeClasses.name, isIdeasModalOpen]);

    // --- LÓGICA DE GRADUACIÓN ---
    const graduationStatus = useMemo(() => {
        if (quizzes.length === 0) return { isGraduated: false, isRusted: false };
        let passedCount = 0;
        let rusted = false;
        quizzes.forEach(q => {
            const progress = userQuizProgress[q.id];
            if (progress && progress.passed) {
                passedCount++;
                if (progress.version < q.version) rusted = true;
            }
        });
        return { isGraduated: passedCount === quizzes.length, isRusted: rusted };
    }, [quizzes, userQuizProgress]);

    // --- MANEJADORES ---
    const handleSendAvailability = async () => {
        const nextWeekId = getNextWeekID();
        const docId = `${user.uid}_${nextWeekId}`;
        const scheduleRef = doc(db, "weekly_schedules", docId);

        try {
            const snap = await getDoc(scheduleRef);
            if (snap.exists()) {
                await addDoc(collection(db, "schedule_requests"), {
                    uid: user.uid,
                    userName: userProfile?.name || user.email,
                    weekId: nextWeekId,
                    proposedSchedule: weekForm,
                    status: 'pending',
                    createdAt: Date.now()
                });
                alert("📩 SOLICITUD ENVIADA AL TEAM LEADER\n\nComo ya tenías un horario guardado, este cambio requiere aprobación.");
                logEvent("SCHEDULE_CHANGE_REQUEST");
            } else {
                await setDoc(scheduleRef, { 
                    uid: user.uid, 
                    userName: userProfile?.name || user.email, 
                    team: userProfile?.team || 'default', 
                    weekId: nextWeekId, 
                    schedule: weekForm, 
                    submittedAt: Date.now() 
                });
                if (new Date().getDay() === 5) {
                    setLofiCoins((lofiCoins || 0) + 50);
                    alert("✅ ¡Horario guardado!\n💰 Bonus Viernes: +50 Coins");
                    logEvent("AVAILABILITY_BONUS");
                } else {
                    alert("✅ ¡Horario guardado correctamente!");
                }
            }
            setIsAvailabilityModalOpen(false);
        } catch (e) {
            console.error("Error availability:", e);
            alert("Error al enviar. Verifica tu conexión o permisos.");
        }
    };

    const handleQuizComplete = async (reward) => {
        const quizId = activeQuiz.id;
        const currentVersion = activeQuiz.version || 1;
        try {
            await updateDoc(doc(db, "users", user.uid), { [`quizProgress.${quizId}`]: { passed: true, version: currentVersion, completedAt: Date.now() } });
            setLofiCoins((lofiCoins || 0) + reward);
            alert(`🎉 ¡FELICIDADES!\nHas ganado +${reward} Monedas.`);
            logEvent("QUIZ_COMPLETE", { quizId, reward });
            setActiveQuiz(null);
        } catch (e) { console.error(e); }
    };

    // --- 🔥 LÓGICA DE REPORTE ACTUALIZADA ---
    const confirmGenerateReport = async () => {
        stopAllTimers();
        const totalMs = tasks.reduce((acc, t) => acc + (t.running ? t.elapsedTime + (Date.now() - t.lastTime) : t.elapsedTime), 0);
        
        // Guardamos los datos puros en Firebase (sin cambios)
        const taskBreakdown = tasks.map(task => { 
            const quantity = parseInt(task.quantity) || 0;
            const taskMs = task.running ? task.elapsedTime + (Date.now() - task.lastTime) : task.elapsedTime;
            const hours = taskMs / 3600000;
            const speed = (hours > 0) ? (quantity / hours).toFixed(2) : "0.00";
            return { id: task.id, name: task.rawTaskName || task.text, category: task.category || 'General', count: quantity, timeMs: taskMs, speed: speed };
        });

        let userTeam = userProfile?.team || 'default';
        let userName = userProfile?.name || user.displayName || user.email;
        const formattedTimestamp = new Date().toLocaleString('es-AR');
        
        try { 
            const globalReportData = { 
                uid: user.uid, userName: userName, team: userTeam, date: selectedReportDate, lastUpdated: Date.now(), 
                metrics: { totalTasks: tasks.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0), totalTimeMs: totalMs, globalSpeed: totalMs > 0 ? (tasks.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0) / (totalMs / 3600000)).toFixed(2) : "0.00" }, 
                taskBreakdown: taskBreakdown, timestampStr: formattedTimestamp 
            }; 
            await setDoc(doc(db, "daily_reports", `${user.uid}_${selectedReportDate}`), globalReportData); 
        } catch (error) { setErrorMessage("Error de conexión."); }

        // Calculo de Monedas
        const hoursWorked = totalMs / (1000 * 60 * 60);
        const coinsEarned = Math.floor(hoursWorked * 10);
        const totalReward = coinsEarned + 15;
        if (totalReward > 0) setLofiCoins((lofiCoins || 0) + totalReward);
        
        // --- 🎨 GENERACIÓN VISUAL DEL REPORTE (NUEVO FORMATO) ---
        const reportContent = generateCustomReport(tasks, selectedReportDate, themeClasses.name);
        
        setReportOutput(reportContent);
        const newReport = { id: selectedReportDate, content: reportContent };
        const updatedReports = [...pastReports];
        const existingIdx = updatedReports.findIndex(r => r.id === selectedReportDate);
        if (existingIdx > -1) { updatedReports[existingIdx] = newReport; } else { updatedReports.push(newReport); updatedReports.sort((a, b) => b.id.localeCompare(a.id)); }
        setPastReports(updatedReports);
        setCalendarSelectedDate(selectedReportDate);
        setIsReportModalOpen(false);
        logEvent("REPORT_GENERATED");
        alert(`✅ Reporte guardado.\nGanaste: ${totalReward} Lofi Coins.`);
    };
    
    const handleSendIdea = async () => {
        if (!ideaText.trim()) return;
        const now = new Date();
        const newIdea = { 
            uid: user.uid, 
            userName: userProfile?.name || user.displayName || user.email, 
            team: userProfile?.team || 'default', 
            content: ideaText, 
            type: ideaType, 
            timestamp: Date.now(), 
            timestampStr: now.toLocaleString('es-AR'), 
            analysis: { pros: "", cons: "" }, 
            status: "new" 
        };
        try { 
            const docRef = await addDoc(collection(db, "monday_ideas"), newIdea); 
            setMyIdeasHistory(prev => [{ id: docRef.id, ...newIdea }, ...prev]); 
            setIdeaText(""); 
            alert(ideaType === 'dev' ? "👨‍💻 ¡Enviado al Dev!" : "📅 ¡Guardado para el Lunes!"); 
            setIsIdeasModalOpen(false); 
        } catch (e) { alert("Error al enviar."); }
    };

    const handleClaimWeeklyBonus = () => { 
        const currentWeek = getCurrentWeekID(); 
        if (lastBonusWeek === currentWeek) { alert("¡Ya has cobrado!"); return; } 
        setLofiCoins((lofiCoins || 0) + 100); 
        setLastBonusWeek(currentWeek); 
        alert(`🎉 ¡FELICIDADES!\nMeta semanal cumplida. +100 Coins.`); 
    };
    const isBonusClaimedThisWeek = lastBonusWeek === getCurrentWeekID();

    const handleCloseShop = () => setIsMarketModalOpen(false);

    // --- HANDLERS TIENDA (Corregidos sin funciones) ---
    const handleBuyItem = (item) => { 
        if ((lofiCoins || 0) >= item.price) { 
            const newCoins = (lofiCoins || 0) - item.price;
            const newInventory = [...(inventory || []), item.id];
            setLofiCoins(newCoins); 
            setInventory(newInventory); 
            logEvent("SHOP_BUY", { item: item.id });
        } else { 
            alert("No tienes suficientes Lofi Coins."); 
        } 
    };

    const applyItemChange = (item) => { 
        if (previewTimerRef.current) {
            clearTimeout(previewTimerRef.current);
            previewTimerRef.current = null;
            originalStateRef.current = null;
        }
        
        switch(item.category) { 
            case 'theme': setManualTheme(item.id); break; 
            case 'pet': setActivePet(activePet === item.id ? null : item.id); break; 
            case 'effect': setActiveEffect(activeEffect === item.id ? null : item.id); break; 
            case 'border': setActiveBorder(activeBorder === item.id ? null : item.id); break; 
            default: setManualTheme(item.id); 
        } 
    };

    // --- EFECTOS VISUALES Y PREVIEW ---
    const previewTimerRef = useRef(null); 
    const originalStateRef = useRef(null);

    const handlePreviewItem = (item) => { 
        let category = item.category;
        let currentVal;
        let setter;
        if (category === 'theme') { currentVal = manualTheme; setter = setManualTheme; }
        else if (category === 'border') { currentVal = activeBorder; setter = setActiveBorder; }
        else if (category === 'effect') { currentVal = activeEffect; setter = setActiveEffect; }
        else return;

        if (!previewTimerRef.current) originalStateRef.current = { category, value: currentVal, setter };
        else if (originalStateRef.current && originalStateRef.current.category !== category) {
             originalStateRef.current.setter(originalStateRef.current.value);
             originalStateRef.current = { category, value: currentVal, setter };
        }
        if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
        setter(item.id);
        previewTimerRef.current = setTimeout(() => {
            if (originalStateRef.current && originalStateRef.current.category === category) setter(originalStateRef.current.value);
            previewTimerRef.current = null;
            originalStateRef.current = null;
        }, 7000);
    };

    // --- EFECTO FINAL DE APLICACIÓN DE FONDO Y CURSOR ---
    useEffect(() => { 
        const baseClasses = 'min-h-screen transition-colors duration-500'; 
        const pinkPawCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ff69b4" stroke="%23ffffff" stroke-width="1.5"><path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M7 5C5.9 5 5 5.9 5 7C5 8.1 5.9 9 7 9C8.1 9 9 8.1 9 7C9 5.9 8.1 5 7 5M17 5C15.9 5 15 5.9 15 7C15 8.1 15.9 9 17 9C18.1 9 19 8.1 19 7C19 5.9 18.1 5 17 5M12 8C9.5 8 7.3 9.3 6.1 11.4C5.5 12.4 6.2 13.7 7.3 13.9L8.5 14.1C9.6 14.3 10.7 14.3 11.8 14.1L16.5 13.2C17.7 13 18.5 11.9 18.1 10.8C17.3 9.2 14.9 8 12 8Z"/></svg>') 16 16, auto`;

        if (themeClasses.rawBg) { 
            // Para temas con fondo JS
            document.body.className = baseClasses; 
            document.body.style.background = themeClasses.rawBg; 
            document.body.style.backgroundAttachment = 'fixed'; 
            document.body.style.backgroundSize = 'cover'; 
        } else { 
            // Para temas CSS (Neko, Default)
            document.body.className = `${themeClasses.bodyBg || 'bg-gray-900'} ${baseClasses}`; 
            document.body.style.background = ''; 
        }
        
        // Cursor Especial
        if (themeClasses.name === 'neko') {
            document.body.style.cursor = pinkPawCursor;
        } else {
            document.body.style.cursor = 'auto';
        }

    }, [themeClasses]);

    
    // UI Helpers
    const renderActiveEffect = () => { if (activeEffect === 'matrix_effect') return <MatrixEffect />; const effectsToRender = [...(themeClasses.activeEffects || [])]; if (activeEffect && !effectsToRender.includes(activeEffect)) effectsToRender.push(activeEffect); return <>{effectsToRender.map(key => { const Component = EFFECT_COMPONENTS[key]; return Component ? <Component key={key} /> : null; })}</>; };
    const getBorderClass = () => { switch(activeBorder) { case 'border_neon': return 'neon-pulsing-border border-4 border-transparent'; default: return ''; } };
    const cardGlowClass = themeClasses.name === 'halloween' ? 'glow-card' : '';
    const selectedReportContent = useMemo(() => { const found = pastReports.find(r => r.id === calendarSelectedDate); return found ? found.content : null; }, [pastReports, calendarSelectedDate]);

    return (
        <>
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

            {/* MARQUESINA DE NOTICIAS */}
            {news.length > 0 && (
                <div className="fixed top-0 left-0 w-full z-50 bg-black/80 border-b border-white/10 h-8 flex items-center backdrop-blur-sm">
                    <div className="marquee-container w-full">
                        <div className="marquee-content flex gap-8">
                            {news.map(n => (
                                <span key={n.id} className={`text-xs font-bold font-mono px-4 ${n.type === 'critical' ? 'text-red-400 animate-pulse' : n.type === 'party' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                    {n.type === 'critical' && '🚨'} {n.type === 'party' && '🎉'} {n.type === 'info' && 'ℹ️'} {n.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* INSIGNIA DE GRADUADO */}
            {graduationStatus.isGraduated && (
                <div className="fixed top-12 left-4 z-40 flex flex-col items-center animate-fadeIn">
                    <div className={`text-4xl ${graduationStatus.isRusted ? 'grad-badge-rust' : 'grad-badge-glow'}`} title={graduationStatus.isRusted ? "Certificación Vencida" : "Agente Certificado"}>🎓</div>
                    {graduationStatus.isRusted && <span className="text-[9px] bg-red-600 text-white px-1 rounded animate-bounce">UPDATE</span>}
                </div>
            )}

            {/* BOTONES FLOTANTES */}
            {isLeader && <button onClick={onOpenDashboard} className="fixed top-12 right-4 z-50 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">👑 LÍDER</button>}
            
            <button 
                onClick={() => { setIdeaType('dev'); setIsIdeasModalOpen(true); }} 
                className="fixed bottom-20 right-4 z-50 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-2"
            >
                <span>👨‍💻</span>
                <span>IDEAS PARA LA APP/BUGS</span>
            </button>

            <button 
                onClick={() => { setIdeaType('monday'); setIsIdeasModalOpen(true); }} 
                className="fixed bottom-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-full shadow-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-2"
            >
                <span>💡</span>
                <span>IDEAS PARA EL LUNES</span>
            </button>
            
            <button onClick={() => setIsAvailabilityModalOpen(true)} className="fixed bottom-36 right-4 z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full font-bold shadow-lg text-xs flex items-center gap-2"><span>📅</span><span className="hidden sm:inline">MI DISPONIBILIDAD</span></button>

         {/* MODAL DE IDEAS */}
            {isIdeasModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                        
                        {/* HEADER */}
                        <div className={`p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r ${ideaType === 'monday' ? 'from-yellow-900/40 to-orange-900/40' : 'from-purple-900/40 to-indigo-900/40'}`}>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {ideaType === 'monday' ? '💡 Ideas para el Lunes' : '👨‍💻 Soporte / Dev Ticket'}
                            </h3>
                            <button onClick={() => setIsIdeasModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            
                            {/* TEXTAREA CON EL PLACEHOLDER MODIFICADO */}
                            <textarea 
                                className={`w-full bg-black/50 border rounded-lg p-3 text-white text-sm outline-none mb-3 h-32 resize-none focus:ring-1 ${ideaType === 'monday' ? 'border-yellow-900/50 focus:border-yellow-500' : 'border-purple-900/50 focus:border-purple-500'}`} 
                                
                                // 🔥 AQUÍ ESTÁ EL CAMBIO:
                                placeholder={ideaType === 'monday' 
                                    ? "Las ideas pasan al Team Leader para analizarlas. Si la aprueba, tendrás una recompensa en monedas y se hablará el lunes." 
                                    : "Ej: El botón de login falla a veces..."}
                                
                                value={ideaText} 
                                onChange={(e) => setIdeaText(e.target.value)} 
                            />

                            <button onClick={handleSendIdea} className={`w-full font-bold py-3 rounded-lg transition-colors mb-6 shadow-lg ${ideaType === 'monday' ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
                                ENVIAR
                            </button>
                            
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-white/10 pb-2">Tu Historial Reciente</h4>
                            <div className="space-y-3">
                                {myIdeasHistory.length > 0 ? myIdeasHistory.map(idea => (
                                    <div key={idea.id} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] text-slate-500">{idea.timestampStr}</span>
                                            {idea.status === 'approved' && <span className="text-[10px] bg-green-900/50 text-green-400 px-2 rounded font-bold">Aprobada</span>}
                                            {idea.status === 'rejected' && <span className="text-[10px] bg-red-900/50 text-red-400 px-2 rounded font-bold">Rechazada</span>}
                                            {idea.status === 'new' && <span className="text-[10px] bg-yellow-900/50 text-yellow-500 px-2 rounded font-bold">Pendiente</span>}
                                        </div>
                                        <p className="text-sm text-slate-300">{idea.content}</p>
                                    </div>
                                )) : <p className="text-xs text-slate-600 italic">No hay historial aún.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DISPONIBILIDAD */}
            {isAvailabilityModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 bg-blue-900/20 flex justify-between items-center"><h3 className="text-lg font-bold text-blue-400">📅 Disponibilidad (Próxima Semana)</h3><button onClick={() => setIsAvailabilityModalOpen(false)} className="text-slate-400 hover:text-white">✕</button></div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="text-xs text-slate-400 italic mb-2 bg-white/5 p-2 rounded">
                                Nota: Si ya enviaste tu horario, los cambios pasarán a revisión por el Team Leader.
                            </div>
                            {new Date().getDay() === 5 && <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-center"><p className="text-xs text-yellow-300 font-bold">⚡ BONUS VIERNES: +50 COINS</p></div>}
                            {Object.keys(weekForm).map(day => (
                                <div key={day} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                    <span className="w-24 font-bold text-sm text-slate-200">{day}</span>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={weekForm[day].off} onChange={(e) => setWeekForm({...weekForm, [day]: {...weekForm[day], off: e.target.checked}})} className="accent-red-500" /><span className="text-xs font-bold text-slate-400">OFF</span></label>
                                        {!weekForm[day].off && <input type="number" value={weekForm[day].hours} onChange={(e) => setWeekForm({...weekForm, [day]: {...weekForm[day], hours: parseFloat(e.target.value)}})} className="w-12 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm" />}
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleSendAvailability} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg mt-4">ENVIAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL QUIZ */}
            {activeQuiz && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <QuizComponent quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={handleQuizComplete} />
                </div>
            )}

            {renderActiveEffect()}
            {themeClasses.name === 'lofi' && <BackgroundAudio />}
            <GlobalStatusMessage message={statusMessage} resumeAction={resumeStoppedTimers} dismissAction={clearStatusMessage} />
            <EconomyBar coins={lofiCoins || 0} onOpenShop={() => setIsMarketModalOpen(true)} />
            <FloatingSalaryButton onClick={() => setIsSalaryModalOpen(true)} />
            <ReportConfigModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onGenerate={confirmGenerateReport} tasks={tasks} syncTasksTime={syncTasksTime} themeClasses={themeClasses} selectedReportDate={selectedReportDate} setSelectedReportDate={setSelectedReportDate} pastReports={pastReports} setReportOutput={setReportOutput} setIsReportModalOpen={setIsReportModalOpen} logEvent={logEvent} />
            <SalaryCalculatorModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} pastReports={pastReports} hourlyRate={hourlyRate} setHourlyRate={setHourlyRate} themeClasses={themeClasses} />
            <DeleteAllConfirmationModal isOpen={isDeleteAllModalOpen} onClose={() => setIsDeleteAllModalOpen(false)} onConfirm={deleteAllTasks} themeClasses={themeClasses} />
            <MarketplaceModal isOpen={isMarketModalOpen} onClose={handleCloseShop} userCoins={lofiCoins} ownedItems={inventory} currentTheme={themeClasses.name} activePet={activePet} activeBorder={activeBorder} activeEffect={activeEffect} onBuy={handleBuyItem} onEquip={applyItemChange} onPreview={handlePreviewItem} />

            <div className="app-container relative z-10 flex flex-col items-center justify-center py-10 mt-8">
                <div className="relative w-11/12 max-w-xl mt-8">
                    <div className={`w-full rounded-2xl shadow-2xl p-4 sm:p-8 pt-8 sm:pt-12 transition-all duration-500 ${themeClasses.cardBg} min-h-[85vh] relative ${cardGlowClass} ${getBorderClass()}`}>
                        {themeClasses.activeEffects && themeClasses.activeEffects.includes('spiderweb') && <SpiderWeb />}
                        <div className="relative space-y-6 h-full flex flex-col">
                            <Title themeClasses={themeClasses} celebrationMessage={message} />
                            
                            {/* ACADEMY WIDGET */}
                            {quizzes.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {quizzes.map(q => {
                                        const progress = userQuizProgress[q.id];
                                        const isDone = progress?.passed;
                                        const isOutdated = isDone && progress.version < q.version;
                                        if (isDone && !isOutdated) return null;
                                        return (
                                            <button key={q.id} onClick={() => setActiveQuiz(q)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${isOutdated ? 'bg-red-900/30 border-red-500 text-red-300' : 'bg-indigo-900/30 border-indigo-500 text-indigo-300'}`}>
                                                <span>🎓</span> {isOutdated ? 'UPDATE:' : 'NUEVO:'} {q.title} (+{q.reward})
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <ThemeSelectorWidget isUnlocked={isUnlocked} weeklyHours={weeklyHoursWorked} targetHours={weeklyGoal} setTargetHours={setWeeklyGoal} onClaimBonus={handleClaimWeeklyBonus} bonusClaimed={isBonusClaimedThisWeek} />
                            
                            <div className="flex justify-center gap-4 border-b border-white/10 pb-2 mb-2">
                                <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'tasks' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>📝 TAREAS</button>
                                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'history' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>📅 HISTORIAL</button>
                            </div>

                            {activeTab === 'tasks' && (
                                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                                    <TaskInputForm addTask={addTask} addMultipleTasks={addMultipleTasks} errorMessage={errorMessage} setErrorMessage={setErrorMessage} themeClasses={themeClasses} />
                                    <div className="flex-1 overflow-y-auto task-scroll pr-2 space-y-3 min-h-[50vh] max-h-[65vh] border border-white/5 rounded-xl p-2 bg-black/10">
                                        {tasks.length > 0 ? tasks.map((task) => ( <TaskListItem key={task.id} task={task} toggleTimer={toggleTimer} deleteTask={deleteTask} updateTaskDetails={updateTaskDetails} themeClasses={themeClasses} resetTaskTimer={resetTaskTimer} celebrationThemeName={themeClasses.name} /> )) : <p className={`text-center italic mt-10 ${themeClasses.secondaryText}`}>No hay tareas activas.</p>}
                                    </div>
                                    <div className="flex flex-col items-center w-full bg-black/20 p-4 rounded-xl border border-white/5 mt-auto">
                                        <button type="button" onClick={() => setIsReportModalOpen(true)} className={`px-6 py-3 rounded-full font-semibold transition duration-300 shadow-lg w-full sm:w-auto ${themeClasses.buttonAction}`}>Generar E.O.D.R.</button>
                                        <ReportViewer content={reportOutput} themeClasses={themeClasses} placeholder="El reporte aparecerá aquí..." />
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'history' && (
                                <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
                                    <div className="space-y-4">
                                        <h2 className={`text-2xl font-bold text-center ${themeClasses.primaryText}`}>Calendario de Reportes</h2>
                                        <CalendarWidget reports={pastReports} selectedDate={calendarSelectedDate} onSelectDate={setCalendarSelectedDate} themeClasses={themeClasses} />
                                        <h3 className={`font-bold mb-2 text-center ${themeClasses.accentText}`}>Reporte del: {calendarSelectedDate.split('-').reverse().join('/')}</h3>
                                        <ReportViewer content={selectedReportContent} themeClasses={themeClasses} placeholder="No hay reporte guardado para este día." />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Componente Interno Quiz
const QuizComponent = ({ quiz, onClose, onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const handleSubmit = () => {
        let correct = 0;
        quiz.questions.forEach((q, i) => { if(answers[i] === q.correct) correct++; });
        const passed = correct >= (quiz.questions.length * 0.8);
        setScore({ correct, total: quiz.questions.length, passed });
        if(passed) setTimeout(() => onComplete(quiz.reward), 1500);
    };
    return (
        <div className="bg-[#1a1c2e] border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            {!score ? (
                <>
                    <h2 className="text-2xl font-bold text-white mb-2">📝 {quiz.title}</h2>
                    <p className="text-slate-400 text-sm mb-6">Responde para ganar <span className="text-yellow-400 font-bold">{quiz.reward} Coins</span>.</p>
                    <div className="space-y-6">{quiz.questions.map((q, i) => (<div key={i} className="bg-black/30 p-4 rounded-lg border border-white/5"><p className="font-bold text-slate-200 mb-3">{i+1}. {q.text}</p><div className="space-y-2">{q.options.map((opt, optI) => (<label key={optI} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${answers[i] === optI ? 'bg-indigo-600/30 border border-indigo-500' : 'bg-white/5'}`}><input type="radio" name={`q-${i}`} onChange={() => setAnswers({...answers, [i]: optI})} className="accent-indigo-500 w-4 h-4" /><span className="text-sm text-slate-300">{opt}</span></label>))}</div></div>))}</div>
                    <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-8">ENVIAR RESPUESTAS</button>
                </>
            ) : (
                <div className="text-center py-10"><div className="text-6xl mb-4 animate-bounce">{score.passed ? '🎉' : '📚'}</div><h3 className={`text-3xl font-bold mb-2 ${score.passed ? 'text-green-400' : 'text-red-400'}`}>{score.passed ? '¡APROBADO!' : 'INTÉNTALO DE NUEVO'}</h3><p className="text-xl text-slate-300">Puntuación: {score.correct} / {score.total}</p>{!score.passed && <button onClick={() => setScore(null)} className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg">Reintentar</button>}</div>
            )}
        </div>
    );
};

export default App;