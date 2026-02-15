import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, addDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { getNextWeekID } from '../../utils/helpers'; 

// --- HELPER LOCAL ---
const getCurrentWeekID = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
};

// --- DÍAS ORDENADOS ---
const ORDERED_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const AvailabilityModal = ({ isOpen, onClose, user, userProfile, addCoins, logEvent }) => {
    
    // --- ESTADOS ---
    const [targetWeek, setTargetWeek] = useState('next'); 
    const [loading, setLoading] = useState(false);
    
    const DEFAULT_FORM = { 
        Lunes: { hours: 0, off: false }, Martes: { hours: 0, off: false }, Miércoles: { hours: 0, off: false }, 
        Jueves: { hours: 0, off: false }, Viernes: { hours: 0, off: false }, Sábado: { hours: 0, off: true }, Domingo: { hours: 0, off: true } 
    };

    const [weekForm, setWeekForm] = useState(DEFAULT_FORM);

    const activeWeekId = useMemo(() => {
        return targetWeek === 'next' ? getNextWeekID() : getCurrentWeekID();
    }, [targetWeek]);

    // --- CARGAR DATOS ---
    useEffect(() => {
        if (!isOpen) return;
        const loadSchedule = async () => {
            setLoading(true);
            try {
                const docId = `${user.uid}_${activeWeekId}`;
                const docRef = doc(db, "weekly_schedules", docId);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    const data = snap.data();
                    setWeekForm({ ...DEFAULT_FORM, ...(data.schedule || {}) });
                } else {
                    setWeekForm(DEFAULT_FORM);
                }
            } catch (error) { console.error(error); }
            setLoading(false);
        };
        loadSchedule();
    }, [isOpen, activeWeekId, user.uid]);

    // --- MANEJO DE HORAS ---
    const adjustHours = (day, amount) => {
        const currentData = weekForm[day] || { hours: 0, off: false };
        let newHours = (currentData.hours || 0) + amount;
        if (newHours < 0) newHours = 0;
        if (newHours > 24) newHours = 24;
        setWeekForm({ ...weekForm, [day]: { ...currentData, hours: newHours } });
    };

    const handleInputChange = (day, value) => {
        const val = parseFloat(value);
        if (isNaN(val)) return; 
        let newHours = val;
        if (newHours < 0) newHours = 0; 
        if (newHours > 24) newHours = 24;
        setWeekForm({ ...weekForm, [day]: { ...weekForm[day], hours: newHours } });
    };

    const handleSend = async () => {
        const docId = `${user.uid}_${activeWeekId}`;
        const scheduleRef = doc(db, "weekly_schedules", docId);
        
        // Limpieza de datos (El "Después")
        const cleanSchedule = {};
        ORDERED_DAYS.forEach(day => { cleanSchedule[day] = weekForm[day] || DEFAULT_FORM[day]; });

        const userName = userProfile?.name || user.email || "Agente";

        try {
            const snap = await getDoc(scheduleRef);
            const isModification = snap.exists();
            const isUrgentChange = targetWeek === 'current';

            if (isUrgentChange || isModification) {
                // 🔥 CAPTURAMOS EL "ANTES" 🔥
                // Si existe en DB, lo usamos. Si no, asumimos vacío.
                const currentScheduleDB = isModification ? snap.data().schedule : DEFAULT_FORM;

                const customMessage = isUrgentChange 
                    ? `${userName} quiere hacer cambios en la disponibilidad de esta semana!`
                    : `${userName} cargó la disponibilidad de la siguiente semana!`;

                await addDoc(collection(db, "schedule_requests"), {
                    uid: user.uid, 
                    userName: userName, 
                    weekId: activeWeekId, 
                    
                    currentSchedule: currentScheduleDB, // <--- GUARDAMOS EL ANTES
                    proposedSchedule: cleanSchedule,    // <--- GUARDAMOS EL DESPUÉS
                    
                    status: 'pending', 
                    type: isUrgentChange ? 'urgent' : 'planning',
                    message: customMessage,
                    createdAt: Date.now()
                });
                
                alert(isUrgentChange ? "🚨 SOLICITUD URGENTE ENVIADA" : "📩 CAMBIO ENVIADO");
                if(logEvent) logEvent("SCHEDULE_REQUEST_SENT");
            } else {
                // (El resto del guardado directo igual...)
                await setDoc(scheduleRef, { 
                    uid: user.uid, userName: userName, team: userProfile?.team || 'default', 
                    weekId: activeWeekId, schedule: cleanSchedule, submittedAt: Date.now() 
                });
                if (new Date().getDay() === 5 && targetWeek === 'next') { addCoins(50); alert("✅ Guardado + 50 Coins"); } else { alert("✅ Guardado"); }
            }
            onClose();
        } catch (e) { console.error(e); alert("Error al enviar."); }
    };

    if (!isOpen) return null;
    const isUrgentMode = targetWeek === 'current';
    const activeColor = isUrgentMode ? 'bg-orange-600' : 'bg-purple-600';
    const buttonText = isUrgentMode ? '🚨 SOLICITAR CAMBIO URGENTE' : '💾 GUARDAR PLANIFICACIÓN';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="bg-slate-900 border-b border-white/10 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">📅 Mi Disponibilidad</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>
                    <div className="bg-black/40 p-1 rounded-lg flex border border-white/5 relative">
                        <button onClick={() => setTargetWeek('current')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${targetWeek === 'current' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>ESTA SEMANA</button>
                        <button onClick={() => setTargetWeek('next')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${targetWeek === 'next' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>PRÓXIMA SEMANA</button>
                    </div>
                    <div className={`text-[10px] text-center mt-2 font-mono font-bold ${isUrgentMode ? 'text-orange-400' : 'text-green-400'}`}>ID: {activeWeekId}</div>
                </div>

                {/* CUERPO DEL FORMULARIO */}
                <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar flex-1 bg-[#0b0e14]">
                    {loading ? <div className="text-center py-10 text-slate-500 animate-pulse">Cargando horario...</div> : (
                        <>
                            {new Date().getDay() === 5 && targetWeek === 'next' && <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-center animate-pulse"><p className="text-xs text-yellow-300 font-bold">⚡ BONUS VIERNES ACTIVO</p></div>}
                            {isUrgentMode && <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg flex items-start gap-2"><span className="text-xl">⚠️</span><p className="text-xs text-orange-200">Los cambios en la semana actual requieren aprobación del TL.</p></div>}
                            
                            {ORDERED_DAYS.map(day => {
                                const dayData = weekForm[day] || { hours: 0, off: false };
                                return (
                                    <div key={day} className={`flex items-center justify-between p-3 rounded-lg border ${isUrgentMode ? 'bg-orange-900/5 border-orange-500/10' : 'bg-slate-800 border-white/5'}`}>
                                        <span className="w-20 font-bold text-sm text-slate-200 capitalize">{day}</span>
                                        <div className="flex items-center gap-3">
                                            <label className={`flex items-center gap-2 text-xs font-bold ${dayData.off ? 'text-red-400' : 'text-slate-400'} cursor-pointer select-none bg-black/20 px-2 py-1.5 rounded border border-white/5 hover:bg-white/5 transition-colors`}>
                                                <input type="checkbox" checked={dayData.off} onChange={(e) => setWeekForm({...weekForm, [day]: {...dayData, off: e.target.checked}})} className="accent-red-500 w-4 h-4 rounded" /> 
                                                OFF
                                            </label>
                                            
                                            {!dayData.off && (
                                                <div className="flex items-center bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                                                    <button onClick={() => adjustHours(day, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors active:bg-slate-800">-</button>
                                                    <div className="w-12 h-8 flex items-center justify-center bg-transparent border-x border-white/5 relative">
                                                        <input type="number" value={dayData.hours} onChange={(e) => handleInputChange(day, e.target.value)} className="w-full h-full bg-transparent text-center text-white text-sm font-bold outline-none appearance-none" />
                                                        <span className="absolute right-1 bottom-1 text-[8px] text-slate-500">hs</span>
                                                    </div>
                                                    <button onClick={() => adjustHours(day, 1)} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors active:bg-indigo-700">+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-white/10 bg-slate-900">
                    <button onClick={handleSend} className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${activeColor} hover:brightness-110`}>
                        {isUrgentMode ? <span>📩</span> : <span>💾</span>} {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityModal;
