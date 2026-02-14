import React, { useState, useEffect } from 'react';
import { addDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; 

const IdeasModal = ({ isOpen, onClose, user, userProfile, initialType }) => {
    
    // 1. ESTADOS (Nombres correctos)
    // Usamos 'ideaType' aquí, así que en el HTML debemos usar 'ideaType' también.
    const [ideaType, setIdeaType] = useState(initialType || "monday"); 
    const [ideaText, setIdeaText] = useState("");
    const [myIdeasHistory, setMyIdeasHistory] = useState([]);

    // 2. EFECTOS (Siempre al nivel superior, nunca dentro de funciones)
    // Este efecto actualiza el tipo si cambia desde afuera (botones flotantes)
    useEffect(() => {
        if (isOpen && initialType) {
            setIdeaType(initialType);
        }
    }, [isOpen, initialType]);

    // Este efecto carga el historial cuando se abre el modal
    useEffect(() => {
        if (isOpen && user) {
            const loadHistory = async () => {
                try {
                    const q = query(collection(db, "monday_ideas"), where("uid", "==", user.uid), orderBy("timestamp", "desc"));
                    const snap = await getDocs(q);
                    setMyIdeasHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (error) {
                    console.error("Error history", error);
                }
            };
            loadHistory();
        }
    }, [isOpen, user]);

    // 3. HANDLERS
    const handleSendIdea = async () => {
        if (!ideaText.trim()) return;
        
        const now = new Date();
        const newIdea = { 
            uid: user.uid, 
            userName: userProfile?.name || user.displayName || user.email, 
            team: userProfile?.team || 'default', 
            content: ideaText, 
            type: ideaType, // Usamos la variable correcta
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
        } catch (e) { 
            console.error(e);
            alert("Error al enviar."); 
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                
                {/* HEADER CON TABS */}
                <div className="flex border-b border-white/10">
                    {/* CORREGIDO: Usamos ideaType y setIdeaType */}
                    <button onClick={() => setIdeaType('monday')} className={`flex-1 p-4 text-sm font-bold transition-colors ${ideaType === 'monday' ? 'bg-yellow-900/20 text-yellow-400 border-b-2 border-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}>
                        💡 Idea Lunes
                    </button>
                    <button onClick={() => setIdeaType('dev')} className={`flex-1 p-4 text-sm font-bold transition-colors ${ideaType === 'dev' ? 'bg-purple-900/20 text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}>
                        👨‍💻 Idea / Soporte
                    </button>
                    <button onClick={onClose} className="px-4 text-slate-400 hover:text-white border-l border-white/10">✕</button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <textarea 
                        className={`w-full bg-black/50 border rounded-lg p-3 text-white text-sm outline-none mb-3 h-32 resize-none focus:ring-1 ${ideaType === 'monday' ? 'border-yellow-900/50 focus:border-yellow-500' : 'border-purple-900/50 focus:border-purple-500'}`} 
                        placeholder={ideaType === 'monday' ? "Describe tu propuesta para mejorar el equipo... Cuentan templates que falten o todo tema que queres que se trate el Lunes" : "Quiero que la app haga esto... / La app tiene este error..."}
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
                                    <span className="text-[10px] text-slate-500">{idea.timestampStr?.split(',')[0]}</span>
                                    <span className={`text-[10px] px-2 rounded font-bold ${idea.status === 'approved' ? 'bg-green-900/50 text-green-400' : idea.status === 'rejected' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-500'}`}>
                                        {idea.status === 'new' ? 'Pendiente' : idea.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 line-clamp-2">{idea.content}</p>
                            </div>
                        )) : <p className="text-xs text-slate-600 italic">No hay historial aún.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdeasModal;