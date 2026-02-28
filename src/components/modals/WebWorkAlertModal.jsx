import React from 'react';

const WebWorkAlertModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden text-center">
                
                <div className="bg-red-900/20 p-6 border-b border-red-500/20">
                    <span className="text-5xl block mb-2 animate-bounce">⏱️</span>
                    <h3 className="text-xl font-bold text-red-400 uppercase tracking-widest">¡Espera un segundo!</h3>
                </div>

                <div className="p-6">
                    <p className="text-slate-300 text-sm mb-6">
                        Antes de iniciar esta tarea... <br/>
                        <strong className="text-white text-base">¿Ya encendiste tu WebWork?</strong>
                    </p>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onConfirm}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                            Sí, ya está corriendo ▶️
                        </button>
                        
                        <button 
                            onClick={onCancel}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold py-3 rounded-xl border border-white/5 transition-colors"
                        >
                            ¡Uy! Me olvidé, voy a prenderlo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebWorkAlertModal;