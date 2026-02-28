import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const AgentSettingsModal = ({ isOpen, onClose, userProfile }) => {
    const [userName, setUserName] = useState('');
    const [webWorkMode, setWebWorkMode] = useState('none');
    const [isSaving, setIsSaving] = useState(false);

    // Cargar los datos actuales cuando se abre el modal
    useEffect(() => {
        if (userProfile) {
            setUserName(userProfile.userName || '');
            setWebWorkMode(userProfile.settings?.webWorkMode || 'none');
        }
    }, [userProfile, isOpen]);

   const handleSave = async () => {
        const userId = auth.currentUser?.uid || userProfile?.uid;

        if (!userId) {
            return alert("Error: No se pudo verificar tu sesión.");
        }
        
        if (!userName.trim()) {
            return alert("⚠️ El nombre no puede estar vacío");
        }

        setIsSaving(true);
        try {
            // 🔥 Usamos setDoc con merge:true. Es 100% a prueba de fallos.
            await setDoc(doc(db, "users", userId), {
                userName: userName.trim(),
                settings: {
                    webWorkMode: webWorkMode
                }
            }, { merge: true });
            
            // ✅ ALERTA DE ÉXITO QUE PEDISTE
            alert("✅ ¡Configuración guardada exitosamente!");
            
            
        } catch (error) {
            console.error("Error al guardar configuración", error);
            alert("❌ Hubo un error al guardar en la base de datos.");
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                
                {/* HEADER */}
                <div className="p-4 border-b border-white/10 bg-slate-800/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> Mi Perfil y Ajustes
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6">
                    
                    {/* SECCIÓN 1: NOMBRE CORTO */}
                    <div>
                        <h4 className="text-sm font-bold text-indigo-400 mb-2">Nombre en el Planner</h4>
                        <p className="text-xs text-slate-400 mb-2">Usa un nombre corto y simple para que el equipo te identifique (Ej: Bianca).</p>
                        <input 
                            type="text" 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Tu nombre corto..."
                            maxLength={15}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="h-px w-full bg-white/5"></div>

                    {/* SECCIÓN 2: WEBWORK ANTI-OLVIDOS */}
                    <div>
                        <h4 className="text-sm font-bold text-indigo-400 mb-2">Filtro WebWork (Anti-olvidos)</h4>
                        <p className="text-xs text-slate-400 mb-4">¿Cómo quieres que te recordemos prender tu tracker de tiempo?</p>
                        
                        <div className="space-y-2">
                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${webWorkMode === 'none' ? 'bg-indigo-900/20 border-indigo-500' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                <input type="radio" name="wwMode" value="none" checked={webWorkMode === 'none'} onChange={() => setWebWorkMode('none')} className="mt-1" />
                                <div>
                                    <p className="text-sm font-bold text-white">Desactivado</p>
                                    <p className="text-[10px] text-slate-500">No me avises. Asumo la responsabilidad.</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${webWorkMode === 'smart' ? 'bg-indigo-900/20 border-indigo-500' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                <input type="radio" name="wwMode" value="smart" checked={webWorkMode === 'smart'} onChange={() => setWebWorkMode('smart')} className="mt-1" />
                                <div>
                                    <p className="text-sm font-bold text-white flex items-center gap-2">Inteligente <span className="text-[8px] bg-green-900 text-green-300 px-1 rounded">RECOMENDADO</span></p>
                                    <p className="text-[10px] text-slate-500">Avisa al iniciar turno o tras estar inactivo 1hr.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg disabled:opacity-50">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentSettingsModal;