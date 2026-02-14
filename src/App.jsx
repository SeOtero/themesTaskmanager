/* ==================================================================================
   SECCIÓN 1: IMPORTS Y DEPENDENCIAS
   ================================================================================== */
import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- CUSTOM HOOKS (Lógica de Negocio) ---
import { useWallet }  from './hooks/useWallet';
import { useUser } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useThemeManager } from './hooks/useThemeManager';
import { useFirestoreDoc } from './hooks/useFirestore'; 
import { useIdeas } from './hooks/useIdeas';
import { useReportManager } from './hooks/useReportManager';

// --- UTILIDADES Y DATOS ---
import { birthdaysList } from './data/constants';
import { getTodayID, getCurrentWeekID, getNextWeekID } from './utils/helpers';
import { generateCustomReport } from './utils/reportGenerator';

// --- FIREBASE ---
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'; 
import { db } from './firebase'; 

// --- VISTAS EXTERNAS (Componentes de Página) ---
import TaskView from './components/views/TaskView';
import HistoryView from './components/views/HistoryView';
import TeamLeaderView from './components/dashboard/TeamLeaderView'; 

// --- COMPONENTES UI (Piezas Visuales) ---
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

// --- MODALES (Popups) ---
import ReportConfigModal from './components/modals/ReportConfigModal';
import SalaryCalculatorModal from './components/modals/SalaryCalculatorModal';
import IdeasModal from './components/modals/IdeasModal';
import MarketplaceModal from './components/modals/MarketplaceModal';
import DeleteAllConfirmationModal from './components/modals/DeleteAllConfirmationModal';
import QuizModal from './components/modals/QuizModal';
import AvailabilityModal from './components/modals/AvailabilityModal';

// --- EFECTOS VISUALES ---
import { EFFECT_COMPONENTS, BackgroundAudio, SpiderWeb } from './components/effects/BackgroundEffects';
import MatrixEffect from './components/effects/MatrixEffect';
import BackgroundEffectsManager from './components/effects/BackgroundEffectManager';


/* ==================================================================================
   SECCIÓN 2: COMPONENTE PRINCIPAL (Auth & Routing)
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
   SECCIÓN 3: APP AUTENTICADA (El Núcleo)
   ================================================================================== */
const AuthenticatedApp = ({ user, loading, isLeader, onOpenDashboard, userProfile }) => {

    /* ------------------------------------------------------------------
       3.1 INICIALIZACIÓN DE DATOS Y BILLETERA
       ------------------------------------------------------------------ */
    const shouldLoadData = user;
    const { balance: lofiCoins, addCoins, spendCoins } = useWallet(user);  

    // Configuración general desde Firestore
    const [hourlyRate, setHourlyRate] = useFirestoreDoc('config', 'hourlyRate', '', shouldLoadData ? user : null);
    const [weeklyGoal, setWeeklyGoal] = useFirestoreDoc('config', 'weeklyGoal', 10, shouldLoadData ? user : null);
    const [inventory, setInventory] = useFirestoreDoc('data', 'inventory', ['default'], shouldLoadData ? user : null);
    const [lastBonusDate, setLastBonusDate, loadingBonus] = useFirestoreDoc('data', 'lastLoginBonus', null, shouldLoadData ? user : null);
    const [lastBonusWeek, setLastBonusWeek] = useFirestoreDoc('data', 'lastWeeklyBonus', '', shouldLoadData ? user : null);

    // Configuración visual persistente
    const [activePet, setActivePet] = useFirestoreDoc('config', 'pet', null, shouldLoadData ? user : null);
    const [activeEffect, setActiveEffect] = useFirestoreDoc('config', 'effect', null, shouldLoadData ? user : null);
    const [activeBorder, setActiveBorder] = useFirestoreDoc('config', 'border', null, shouldLoadData ? user : null);

    
    /* ------------------------------------------------------------------
       3.2 ESTADOS LOCALES DE UI
       ------------------------------------------------------------------ */
    // Navegación y Reportes
    const [activeTab, setActiveTab] = useState('tasks');
    const [reportOutput, setReportOutput] = useState('');
    const [calendarSelectedDate, setCalendarSelectedDate] = useState(getTodayID());
    const [selectedReportDate, setSelectedReportDate] = useState(getTodayID());
    const [pastReports, setPastReports] = useState([]); 
    const [manualTheme, setManualTheme] = useState(null);

    // Estados de Modales
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);

    // Datos temporales o de formularios
    const [news, setNews] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [userQuizProgress, setUserQuizProgress] = useState({});
    // Agrega esto junto a tus otros useState:
    const [ideaType, setIdeaType] = useState("monday");


    /* ------------------------------------------------------------------
       3.3 GESTORES DE LÓGICA (Custom Hooks Managers)
       ------------------------------------------------------------------ */
    const themeData = useThemeManager(birthdaysList, pastReports, setManualTheme, manualTheme);
    const { strategy: themeClasses, message, isUnlocked, weeklyHoursWorked } = themeData;

    const taskData = useTasks(shouldLoadData ? user : null);
    const { tasks, addTask, addMultipleTasks, deleteTask, deleteAllTasks, toggleTimer, updateTaskDetails, sortTasksByShop, resetTaskTimer, stopAllTimers, statusMessage, resumeStoppedTimers, clearStatusMessage, syncTasksTime, errorMessage, setErrorMessage } = taskData;

    const { handleGenerate, isProcessing } = useReportManager(
        user, 
        tasks, 
        stopAllTimers, 
        addCoins, 
        userProfile
    );


    /* ------------------------------------------------------------------
       3.4 EFECTOS Y SUSCRIPCIONES
       ------------------------------------------------------------------ */
    // Logger silencioso
    const logEvent = async (eventName, data = {}) => {
        try { await addDoc(collection(db, "app_analytics"), { eventName, uid: user.uid, timestamp: Date.now(), data }); } catch (e) { console.error("Log error", e); }
    };

    // Suscripciones Real-time
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
        

        return () => { newsUnsub(); quizUnsub(); progressUnsub(); };
    }, [user, themeClasses.name, isIdeasModalOpen]);

    // Lógica de Graduación
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

    // EFECTO DE ESTILOS GLOBALES (Fondo y Cursor)
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


    /* ------------------------------------------------------------------
       3.5 EVENT HANDLERS (La lógica de los botones)
       ------------------------------------------------------------------ */
    

    // --- QUIZ ---
    const handleQuizComplete = async (reward) => {
        const quizId = activeQuiz.id;
        const currentVersion = activeQuiz.version || 1;
        try {
            await updateDoc(doc(db, "users", user.uid), { [`quizProgress.${quizId}`]: { passed: true, version: currentVersion, completedAt: Date.now() } });
            addCoins(reward);
            alert(`🎉 ¡FELICIDADES!\nHas ganado +${reward} Monedas.`);
            logEvent("QUIZ_COMPLETE", { quizId, reward });
            setActiveQuiz(null);
        } catch (e) { console.error(e); }
    };

    // --- REPORTES ---
    const confirmGenerateReport = () => {
        handleGenerate(selectedReportDate, manualTheme.name, (textGenerated, dataSaved) => {
            setReportOutput(textGenerated);
            const newReport = { id: selectedReportDate, content: textGenerated };
            setPastReports(prev => [newReport, ...prev.filter(r => r.id !== selectedReportDate)]);
            setIsReportModalOpen(false);
        });
    };

    // --- BONUS Y TIENDA ---
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

    // --- PREVIEW DE ITEMS ---
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


    /* ------------------------------------------------------------------
       3.6 HELPERS VISUALES
       ------------------------------------------------------------------ */
    const renderActiveEffect = () => { if (activeEffect === 'matrix_effect') return <MatrixEffect />; const effectsToRender = [...(themeClasses.activeEffects || [])]; if (activeEffect && !effectsToRender.includes(activeEffect)) effectsToRender.push(activeEffect); return <>{effectsToRender.map(key => { const Component = EFFECT_COMPONENTS[key]; return Component ? <Component key={key} /> : null; })}</>; };
    const getBorderClass = () => { switch(activeBorder) { case 'border_neon': return 'neon-pulsing-border border-4 border-transparent'; default: return ''; } };
    const cardGlowClass = themeClasses.name === 'halloween' ? 'glow-card' : '';
    const selectedReportContent = useMemo(() => { const found = pastReports.find(r => r.id === calendarSelectedDate); return found ? found.content : null; }, [pastReports, calendarSelectedDate]);


    /* ==================================================================================
       SECCIÓN 4: RENDERIZADO (JSX)
       ================================================================================== */
    return (
        <>
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

            {/* BARRA DE NOTICIAS */}
            <NewsTicker news={news} />

            {/* INSIGNIA DE GRADUADO */}
            {graduationStatus.isGraduated && (
                <div className="fixed top-12 left-4 z-40 flex flex-col items-center animate-fadeIn">
                    <div className={`text-4xl ${graduationStatus.isRusted ? 'grad-badge-rust' : 'grad-badge-glow'}`} title={graduationStatus.isRusted ? "Certificación Vencida" : "Agente Certificado"}>🎓</div>
                    {graduationStatus.isRusted && <span className="text-[9px] bg-red-600 text-white px-1 rounded animate-bounce">UPDATE</span>}
                </div>
            )}

            {/* BOTONES FLOTANTES */}
            <FloatingActions 
            isLeader={isLeader}
            onOpenDashboard={onOpenDashboard}
            onOpenIdeas={() => setIsIdeasModalOpen(true)}
            onOpenAvailability={() => setIsAvailabilityModalOpen(true)}
            setIdeaType={setIdeaType}
        />

            {/* --- MODALES --- */}
            
            {/* Modal Ideas*/}
                <IdeasModal isOpen={isIdeasModalOpen} onClose={() => setIsIdeasModalOpen(false)} user={user} userProfile={userProfile} 
    />

            {/* Modal Disponibilidad (Inline) */}
            <AvailabilityModal isOpen={isAvailabilityModalOpen} onClose={() => setIsAvailabilityModalOpen(false)} user={user}userProfile={userProfile} addCoins={addCoins} logEvent={logEvent} />
            
            {/* Modal Quiz */}
            {activeQuiz && (
             <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <QuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={handleQuizComplete} />
            </div>
            )}

            {/* Efectos y Helpers */}
            <BackgroundEffectsManager themeClasses={themeClasses} activeEffect={activeEffect} />
            <GlobalStatusMessage message={statusMessage} resumeAction={resumeStoppedTimers} dismissAction={clearStatusMessage} />
            <EconomyBar coins={lofiCoins || 0} onOpenShop={() => setIsMarketModalOpen(true)} />
            <FloatingSalaryButton onClick={() => setIsSalaryModalOpen(true)} />
            
            {/* Otros Modales Importados */}
            <ReportConfigModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onGenerate={confirmGenerateReport} tasks={tasks} syncTasksTime={syncTasksTime} themeClasses={themeClasses} selectedReportDate={selectedReportDate} setSelectedReportDate={setSelectedReportDate} pastReports={pastReports} setReportOutput={setReportOutput} setIsReportModalOpen={setIsReportModalOpen} logEvent={logEvent} />
            <SalaryCalculatorModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} pastReports={pastReports} hourlyRate={hourlyRate} setHourlyRate={setHourlyRate} themeClasses={themeClasses} />
            <DeleteAllConfirmationModal isOpen={isDeleteAllModalOpen} onClose={() => setIsDeleteAllModalOpen(false)} onConfirm={deleteAllTasks} themeClasses={themeClasses} />
            <MarketplaceModal isOpen={isMarketModalOpen} onClose={handleCloseShop} userCoins={lofiCoins} ownedItems={inventory} currentTheme={themeClasses.name} activePet={activePet} activeBorder={activeBorder} activeEffect={activeEffect} onBuy={handleBuyItem} onEquip={applyItemChange} onPreview={handlePreviewItem} />


            {/* --- CONTENEDOR PRINCIPAL (LA VISTA) --- */}
            <div className="app-container relative z-10 flex flex-col items-center justify-center py-10 mt-8">
                <div className="relative w-11/12 max-w-xl mt-8">
                    <div className={`w-full rounded-2xl shadow-2xl p-4 sm:p-8 pt-8 sm:pt-12 transition-all duration-500 ${themeClasses.cardBg} min-h-[85vh] relative ${cardGlowClass} ${getBorderClass()}`}>
                        {themeClasses.activeEffects && themeClasses.activeEffects.includes('spiderweb') && <SpiderWeb />}
                        <div className="relative space-y-6 h-full flex flex-col">
                            <Title themeClasses={themeClasses} celebrationMessage={message} />
                            
                            {/* WIDGETS SUPERIORES */}
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
                            
                            {/* NAVEGACIÓN (TABS) */}
                            <div className="flex justify-center gap-4 border-b border-white/10 pb-2 mb-2">
                                <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'tasks' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>📝 TAREAS</button>
                                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'history' ? 'bg-white/20 text-white' : 'text-slate-400'}`}>📅 HISTORIAL</button>
                            </div>

                            {/* VISTA: TAREAS */}
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
                            
                            {/* VISTA: HISTORIAL */}
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