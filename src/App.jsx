/* ==================================================================================
   SECCIÓN 1: IMPORTS Y DEPENDENCIAS
   ================================================================================== */
import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';

// --- CUSTOM HOOKS ---
import { useWallet }  from './hooks/useWallet';
import { useUser } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useThemeManager } from './hooks/useThemeManager';
import { useFirestoreDoc } from './hooks/useFirestore'; 
import { useIdeas } from './hooks/useIdeas';
import { useReportManager } from './hooks/useReportManager';

// --- DATA ---
import { birthdaysList } from './data/constants';
import { THEMES } from './data/themes'; 
import { getTodayID, getCurrentWeekID } from './utils/helpers';

// --- FIREBASE (Importamos limit para ahorrar lecturas) ---
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore'; 
import { db } from './firebase'; // ⚠️ Asegúrate que este nombre coincida con tu archivo (firebase.js o config.js)

// --- COMPONENTS ---
import TeamLeaderView from './components/dashboard/TeamLeaderView'; 
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
import NewsTicker from './components/ui/NewsTicker';
import FloatingActions from './components/ui/FloatingActions';
import QuickNotesWidget from './components/tools/QuickNotesWidget';

// --- MODALES CON LAZY LOADING (AHORRO DE MEMORIA) ---
// Estos componentes no se descargarán hasta que el usuario haga click
const SalaryCalculatorModal = lazy(() => import('./components/modals/SalaryCalculatorModal'));
const IdeasModal = lazy(() => import('./components/modals/IdeasModal'));
const MarketplaceModal = lazy(() => import('./components/modals/MarketplaceModal'));
const QuizModal = lazy(() => import('./components/modals/QuizModal'));
const AvailabilityModal = lazy(() => import('./components/modals/AvailabilityModal'));

// Modales ligeros (se cargan normal)
import ReportConfigModal from './components/modals/ReportConfigModal';
import DeleteAllConfirmationModal from './components/modals/DeleteAllConfirmationModal';

// --- EFFECTS ---
import { EFFECT_COMPONENTS, SpiderWeb } from './components/effects/BackgroundEffects';
import MatrixEffect from './components/effects/MatrixEffect';
import BackgroundEffectsManager from './components/effects/BackgroundEffectManager';


/* ==================================================================================
   SECCIÓN 2: MAIN COMPONENT
   ================================================================================== */
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


/* ==================================================================================
   SECCIÓN 3: AUTHENTICATED APP
   ================================================================================== */
const AuthenticatedApp = ({ user, loading, isLeader, onOpenDashboard, userProfile }) => {

    const shouldLoadData = user;
    const { balance: lofiCoins, addCoins, spendCoins } = useWallet(user);  

    const [hourlyRate, setHourlyRate] = useFirestoreDoc('config', 'hourlyRate', '', shouldLoadData ? user : null);
    const [weeklyGoal, setWeeklyGoal] = useFirestoreDoc('config', 'weeklyGoal', 10, shouldLoadData ? user : null);
    const [inventory, setInventory] = useFirestoreDoc('data', 'inventory', ['default'], shouldLoadData ? user : null);
    const [lastBonusDate, setLastBonusDate, loadingBonus] = useFirestoreDoc('data', 'lastLoginBonus', null, shouldLoadData ? user : null);
    const [lastBonusWeek, setLastBonusWeek] = useFirestoreDoc('data', 'lastWeeklyBonus', '', shouldLoadData ? user : null);

    const [activePet, setActivePet] = useFirestoreDoc('config', 'pet', null, shouldLoadData ? user : null);
    const [activeEffect, setActiveEffect] = useFirestoreDoc('config', 'effect', null, shouldLoadData ? user : null);
    const [activeBorder, setActiveBorder] = useFirestoreDoc('config', 'border', null, shouldLoadData ? user : null);

    const [activeTab, setActiveTab] = useState('tasks');
    const [reportOutput, setReportOutput] = useState('');
    const [calendarSelectedDate, setCalendarSelectedDate] = useState(getTodayID());
    const [selectedReportDate, setSelectedReportDate] = useState(getTodayID());
    const [pastReports, setPastReports] = useState([]); 
    const [manualTheme, setManualTheme] = useState(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);

    const [news, setNews] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [userQuizProgress, setUserQuizProgress] = useState({});
    const [ideaType, setIdeaType] = useState("monday");

    const themeData = useThemeManager(birthdaysList, pastReports, setManualTheme, manualTheme);
    const { strategy: themeClasses, message, isUnlocked, weeklyHoursWorked } = themeData;

   const taskData = useTasks(shouldLoadData ? user : null);
    
    const { 
        tasks, 
        addTask, 
        addMultipleTasks, 
        deleteTask, 
        deleteAllTasks, 
        toggleTimer, 
        updateTaskDetails, 
        resetTaskTimer, 
        stopAllTimers, 
        statusMessage,
        resumeStoppedTimers, 
        clearStatusMessage, 
        syncTasksTime, 
        errorMessage, 
        setErrorMessage,
        distributeTasksTime,
        sortTasksByShop,
    } = taskData;

    const { handleGenerate } = useReportManager(user, tasks, stopAllTimers, addCoins, userProfile);

    const logEvent = async (eventName, data = {}) => {
        try { await addDoc(collection(db, "app_analytics"), { eventName, uid: user.uid, timestamp: Date.now(), data }); } catch (e) { console.error("Log error", e); }
    };

    // --- EFECTO 1: CARGA DE DATOS OPTIMIZADA ---
    useEffect(() => {
        if (!user) return;

        // 1. Cargar Noticias (Solo las últimas 5)
        const newsQuery = query(collection(db, "news_ticker"), orderBy("createdAt", "desc"), limit(5));
        const newsUnsub = onSnapshot(newsQuery, (snap) => setNews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        
        // 2. Cargar Quizzes
        const quizUnsub = onSnapshot(query(collection(db, "training_modules"), where("active", "==", true)), (snap) => setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        
        // 3. Cargar Progreso
        const progressUnsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setUserQuizProgress(docSnap.data().quizProgress || {});
            }
        });
        
        // 4. 🔥 CARGAR REPORTES (LIMITADO A 45 DÍAS + RECONSTRUCCIÓN) 🔥
        const reportsQuery = query(
            collection(db, "daily_reports"), 
            where("uid", "==", user.uid),
            orderBy("date", "desc"), // Orden descendente (nuevos primero)
            limit(45) // Límite estricto de lectura
        );

        const reportsUnsub = onSnapshot(reportsQuery, (snap) => {
            const loadedReports = snap.docs.map(doc => {
                const data = doc.data();
                
                // A. Recuperar Fecha
                let finalDate = data.date;
                if (!finalDate && doc.id.includes('_')) {
                    const match = doc.id.match(/(\d{4}-\d{2}-\d{2})/);
                    if (match) finalDate = match[0];
                }
                if (!finalDate && data.timestamp) {
                    finalDate = new Date(data.timestamp).toLocaleDateString('en-CA');
                }
                if (!finalDate) return null;

                // B. Recuperar o Reconstruir Contenido
                let content = data.report || data.content || data.text || data.body;
                
                if (!content && data.taskBreakdown) {
                    const tasks = Array.isArray(data.taskBreakdown) ? data.taskBreakdown : [];
                    const formatMs = (ms) => {
                        if (!ms || isNaN(ms)) return "00:00:00";
                        const s = Math.floor((ms / 1000) % 60);
                        const m = Math.floor((ms / (1000 * 60)) % 60);
                        const h = Math.floor((ms / (1000 * 60 * 60)));
                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    };
                    const totalMs = tasks.reduce((acc, t) => acc + (t.elapsedTime || 0), 0);
                    
                    content = `📊 REPORTE RECUPERADO (${finalDate})\n\n` +
                              `⏱️ Tiempo Total Real: ${formatMs(totalMs)}\n` +
                              `✅ Tareas Realizadas: ${tasks.length}\n` +
                              `-----------------------------------\n`;
                    
                    if (tasks.length > 0) {
                        content += tasks.map(t => {
                            const name = t.name || t.text || t.taskName || "Tarea sin nombre";
                            const time = t.timeFormatted || formatMs(t.elapsedTime);
                            return `• ${name} (${time})`;
                        }).join('\n');
                    } else content += "Sin detalles.";
                }

                return { id: finalDate, content: content || "Datos ilegibles" };
            }).filter(Boolean);

            setPastReports(loadedReports);
        }, (error) => {
            console.warn("⚠️ Firebase requiere un índice. Haz clic en el enlace de la consola:", error);
        });

        // Limpieza
        return () => { newsUnsub(); quizUnsub(); progressUnsub(); reportsUnsub(); };

    }, [user]); 


    // --- EFECTO 2: GUARDAR SKIN (CON DEBOUNCE) ---
    useEffect(() => {
        if (user && themeClasses.name) {
            const timeoutId = setTimeout(() => {
                updateDoc(doc(db, "users", user.uid), { currentSkin: themeClasses.name })
                    .catch((e) => console.log("Skin sync skip", e));
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [themeClasses.name, user]);

    
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

    useEffect(() => { 
        const baseClasses = 'min-h-screen transition-colors duration-500'; 
        const pinkPawCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ff69b4" stroke="%23ffffff" stroke-width="1.5"><path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M7 5C5.9 5 5 5.9 5 7C5 8.1 5.9 9 7 9C8.1 9 9 8.1 9 7C9 5.9 8.1 5 7 5M17 5C15.9 5 15 5.9 15 7C15 8.1 15.9 9 17 9C18.1 9 19 8.1 19 7C19 5.9 18.1 5 17 5M12 8C9.5 8 7.3 9.3 6.1 11.4C5.5 12.4 6.2 13.7 7.3 13.9L8.5 14.1C9.6 14.3 10.7 14.3 11.8 14.1L16.5 13.2C17.7 13 18.5 11.9 18.1 10.8C17.3 9.2 14.9 8 12 8Z"/></svg>') 16 16, auto`;

        if (themeClasses.rawBg) { 
            document.body.className = baseClasses; 
            document.body.style.background = themeClasses.rawBg; 
            document.body.style.backgroundAttachment = 'fixed'; 
            document.body.style.backgroundSize = 'cover'; 
        } else { 
            document.body.className = `${themeClasses.bodyBg || 'bg-gray-900'} ${baseClasses}`; 
            document.body.style.background = ''; 
        }
        
        if (themeClasses.name === 'neko') document.body.style.cursor = pinkPawCursor;
        else document.body.style.cursor = 'auto';
    }, [themeClasses]);

    const handleQuizComplete = async (reward) => {
        const quizId = activeQuiz.id;
        const currentVersion = activeQuiz.version || 1;
        try {
            await updateDoc(doc(db, "users", user.uid), { [`quizProgress.${quizId}`]: { passed: true, version: currentVersion, completedAt: Date.now() } });
            addCoins(reward);
            alert(`🎉 ¡FELICIDADES!\nHas completado el módulo.`);
            logEvent("QUIZ_COMPLETE", { quizId: activeQuiz.id, reward });
            setActiveQuiz(null);
        } catch (e) { console.error(e); }
    };

    const confirmGenerateReport = () => {
        const skinName = themeClasses?.name || 'default';
        handleGenerate(selectedReportDate, skinName, (textGenerated, dataSaved) => {
            setReportOutput(textGenerated);
            const newReport = { id: selectedReportDate, content: textGenerated };
            setPastReports(prev => [newReport, ...prev.filter(r => r.id !== selectedReportDate)]);
            setIsReportModalOpen(false);
        });
    };

    const handleClaimWeeklyBonus = () => { 
        const currentWeek = getCurrentWeekID(); 
        if (lastBonusWeek === currentWeek) { alert("¡Ya has cobrado!"); return; } 
        addCoins(100); 
        setLastBonusWeek(currentWeek); 
        alert(`🎉 ¡FELICIDADES!\nMeta semanal cumplida. +100 Coins.`); 
    };
    const isBonusClaimedThisWeek = lastBonusWeek === getCurrentWeekID();

    const handleCloseShop = () => setIsMarketModalOpen(false);

    const handleBuyItem = (item) => { 
        if (spendCoins(item.price)) { 
            const newInventory = [...(inventory || []), item.id];
            setInventory(newInventory); 
            logEvent("SHOP_BUY", { item: item.id });
            alert("¡Compra realizada!");
        } else { alert("No tienes suficientes Lofi Coins."); } 
    };

    const previewTimerRef = useRef(null); 
    const originalStateRef = useRef(null);

    const applyItemChange = (item) => { 
        if (previewTimerRef.current) { clearTimeout(previewTimerRef.current); previewTimerRef.current = null; originalStateRef.current = null; }
        switch(item.category) { 
            case 'theme': setManualTheme(item.id); break; 
            case 'pet': setActivePet(activePet === item.id ? null : item.id); break; 
            case 'effect': setActiveEffect(activeEffect === item.id ? null : item.id); break; 
            case 'border': setActiveBorder(activeBorder === item.id ? null : item.id); break; 
            default: setManualTheme(item.id); 
        } 
    };

    const handlePreviewItem = (item) => { 
        let category = item.category; let currentVal; let setter;
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
            previewTimerRef.current = null; originalStateRef.current = null;
        }, 7000);
    };

    const getBorderClass = () => {
        if (!activeBorder) return '';
        const borderDef = THEMES[activeBorder];
        return borderDef ? borderDef.borderClass : ''; 
    };

    useEffect(() => {
        if (activeBorder && THEMES[activeBorder]?.customCss) {
            const style = document.createElement('style');
            style.id = 'border-custom-css';
            style.innerHTML = THEMES[activeBorder].customCss;
            document.head.appendChild(style);
            return () => {
                const existing = document.getElementById('border-custom-css');
                if (existing) existing.remove();
            };
        }
    }, [activeBorder]);

    const cardGlowClass = themeClasses.name === 'halloween' ? 'glow-card' : '';

    const selectedReportContent = useMemo(() => { 
        const found = pastReports.find(r => r.id === calendarSelectedDate); 
        return found ? found.content : null; 
    }, [pastReports, calendarSelectedDate]);

    /* ==================================================================================
       SECCIÓN 4: RENDERIZADO (CON SUSPENSE PARA AHORRO DE MEMORIA)
       ================================================================================== */
    return (
        <>
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

            <NewsTicker news={news} />

            {graduationStatus.isGraduated && (
                <div className="fixed top-12 left-4 z-40 flex flex-col items-center animate-fadeIn">
                    <div className={`text-4xl ${graduationStatus.isRusted ? 'grad-badge-rust' : 'grad-badge-glow'}`} title={graduationStatus.isRusted ? "Certificación Vencida" : "Agente Certificado"}>🎓</div>
                    {graduationStatus.isRusted && <span className="text-[9px] bg-red-600 text-white px-1 rounded animate-bounce">UPDATE</span>}
                </div>
            )}

            <FloatingActions 
                isLeader={isLeader}
                onOpenDashboard={onOpenDashboard}
                onOpenIdeas={() => setIsIdeasModalOpen(true)}
                onOpenAvailability={() => setIsAvailabilityModalOpen(true)}
                setIdeaType={setIdeaType}
            />

            {/* 🔥 SUSPENSE WRAPPER: Solo carga lo que se usa 🔥 */}
            <Suspense fallback={<div className="fixed inset-0 z-[200] pointer-events-none" />}>
                <IdeasModal isOpen={isIdeasModalOpen} onClose={() => setIsIdeasModalOpen(false)} user={user} userProfile={userProfile} initialType={ideaType} />
                <AvailabilityModal isOpen={isAvailabilityModalOpen} onClose={() => setIsAvailabilityModalOpen(false)} user={user} userProfile={userProfile} addCoins={addCoins} logEvent={logEvent} />
                
                {activeQuiz && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <QuizModal isOpen={true} quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={handleQuizComplete} user={user} />
                    </div>
                )}
                
                <SalaryCalculatorModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} pastReports={pastReports} hourlyRate={hourlyRate} setHourlyRate={setHourlyRate} themeClasses={themeClasses} />
                
                <MarketplaceModal isOpen={isMarketModalOpen} onClose={handleCloseShop} userCoins={lofiCoins} ownedItems={inventory} currentTheme={themeClasses.name} activePet={activePet} activeBorder={activeBorder} activeEffect={activeEffect} onBuy={handleBuyItem} onEquip={applyItemChange} onPreview={handlePreviewItem} />
            </Suspense>

            {/* 🔥 WIDGET DE NOTAS 🔥 */}
            <QuickNotesWidget user={user} />

            <BackgroundEffectsManager themeClasses={themeClasses} activeEffect={activeEffect} />
            <GlobalStatusMessage message={statusMessage} resumeAction={resumeStoppedTimers} dismissAction={clearStatusMessage} />
            <EconomyBar coins={lofiCoins || 0} onOpenShop={() => setIsMarketModalOpen(true)} />
            <FloatingSalaryButton onClick={() => setIsSalaryModalOpen(true)} />
            
           <ReportConfigModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                onGenerate={confirmGenerateReport} 
                tasks={tasks} 
                syncTasksTime={syncTasksTime} 
                distributeTasksTime={distributeTasksTime} 
                themeClasses={themeClasses} 
                selectedReportDate={selectedReportDate} 
                setSelectedReportDate={setSelectedReportDate} 
                pastReports={pastReports} 
            />
            
            <DeleteAllConfirmationModal 
                isOpen={isDeleteAllModalOpen} 
                onClose={() => setIsDeleteAllModalOpen(false)} 
                onConfirm={() => {
                    deleteAllTasks();
                    setIsDeleteAllModalOpen(false);
                    setIsReportModalOpen(false); 
                }} 
                themeClasses={themeClasses} 
            />

            {/* --- CONTENEDOR PRINCIPAL --- */}
            <div className="app-container relative z-10 flex flex-col items-center justify-center py-10 mt-8">
                <div className="relative w-11/12 max-w-xl mt-8">
                   <div className={`w-full rounded-2xl shadow-2xl p-4 sm:p-8 pt-8 sm:pt-12 transition-all duration-500 ${themeClasses.cardBg} min-h-[85vh] relative ${cardGlowClass} ${getBorderClass()} app-card`}>
                        {themeClasses.activeEffects && themeClasses.activeEffects.includes('spiderweb') && <SpiderWeb />}
                        
                        <div className="relative z-20 space-y-6 h-full flex flex-col">
                            <Title themeClasses={themeClasses} celebrationMessage={message} />
                            
                            {/* Widgets de Quiz */}
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
                                    
                                    {/* Botones de control de lista */}
                                    {tasks.length > 0 && (
                                        <div className="flex items-center justify-between gap-3 px-1 mb-1 animate-fadeIn">
                                            <button onClick={sortTasksByShop} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-600 hover:border-slate-400 transition-all shadow-sm active:scale-95 flex items-center gap-2"><span>🏷️</span> Ordenar por Tienda</button>
                                            <button onClick={() => setIsDeleteAllModalOpen(true)} className="px-4 py-2 bg-red-900/30 hover:bg-red-800 text-red-400 hover:text-red-100 text-xs font-bold uppercase tracking-wider rounded-full border border-red-900 hover:border-red-500 transition-all shadow-sm active:scale-95 flex items-center gap-2"><span>🗑️</span> Limpiar Todo</button>
                                        </div>
                                    )}

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
   
export default App;