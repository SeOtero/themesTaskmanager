import React, { useState } from 'react';
import { doc, getDoc, addDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { getNextWeekID } from '../../utils/helpers'; 

const AvailabilityModal = ({ isOpen, onClose, user, userProfile, addCoins, logEvent }) => {
    // Estado local del formulario
    const [weekForm, setWeekForm] = useState({ 
        Monday: { hours: 0, off: false }, Tuesday: { hours: 0, off: false }, Wednesday: { hours: 0, off: false }, 
        Thursday: { hours: 0, off: false }, Friday: { hours: 0, off: false }, Saturday: { hours: 0, off: true }, Sunday: { hours: 0, off: true } 
    });

    const handleSend = async () => {
        const nextWeekId = getNextWeekID();
        const docId = `${user.uid}_${nextWeekId}`;
        const scheduleRef = doc(db, "weekly_schedules", docId);

        try {
            const snap = await getDoc(scheduleRef);
            if (snap.exists()) {
                await addDoc(collection(db, "schedule_requests"), {
                    uid: user.uid, userName: userProfile?.name || user.email, weekId: nextWeekId, proposedSchedule: weekForm, status: 'pending', createdAt: Date.now()
                });
                alert("📩 SOLICITUD ENVIADA AL TEAM LEADER (Pendiente de aprobación)");
                if(logEvent) logEvent("SCHEDULE_CHANGE_REQUEST");
            } else {
                await setDoc(scheduleRef, { 
                    uid: user.uid, userName: userProfile?.name || user.email, team: userProfile?.team || 'default', weekId: nextWeekId, schedule: weekForm, submittedAt: Date.now() 
                });
                // Bonus Viernes
                if (new Date().getDay() === 5) {
                    addCoins(50);
                    alert("✅ Guardado + 💰 Bonus Viernes: 50 Coins");
                    if(logEvent) logEvent("AVAILABILITY_BONUS");
                } else {
                    alert("✅ Horario guardado correctamente");
                }
            }
            onClose();
        } catch (e) {
            console.error("Error availability:", e);
            alert("Error al enviar. Verifica tu conexión.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-blue-900/20 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-400">📅 Disponibilidad (Próxima Semana)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {new Date().getDay() === 5 && <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-center"><p className="text-xs text-yellow-300 font-bold">⚡ BONUS VIERNES ACTIVO</p></div>}
                    
                    {Object.keys(weekForm).map(day => (
                        <div key={day} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                            <span className="w-24 font-bold text-sm text-slate-200">{day}</span>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-400">
                                    <input type="checkbox" checked={weekForm[day].off} onChange={(e) => setWeekForm({...weekForm, [day]: {...weekForm[day], off: e.target.checked}})} className="accent-red-500" /> OFF
                                </label>
                                {!weekForm[day].off && <input type="number" value={weekForm[day].hours} onChange={(e) => setWeekForm({...weekForm, [day]: {...weekForm[day], hours: parseFloat(e.target.value)}})} className="w-12 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm" />}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleSend} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg mt-4">ENVIAR</button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityModal;