import React from 'react';

const DeleteAllConfirmationModal = ({ isOpen, onClose, onConfirm, themeClasses }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
             <div className={`relative w-full max-w-sm p-6 rounded-2xl shadow-2xl ${themeClasses.modalBg || 'bg-gray-800 border-gray-600'} border-2 modal-content`}>
                <div className="flex flex-col items-center text-center animate-pulse">
                    <div className="bg-red-500/20 p-4 rounded-full mb-3 border-2 border-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">¿Empezar Día Nuevo?</h3>
                    <p className={`${themeClasses.secondaryText || 'text-gray-300'} mb-6 text-sm`}>Estás a punto de borrar <strong>todas las tareas</strong> de la lista. <br/><br/> <span className="text-xs opacity-70">Asegúrate de haber generado tu E.O.D.R. antes de continuar. Esta acción no se puede deshacer.</span></p>
                    <div className="flex flex-col gap-3 w-full">
                        <button onClick={onConfirm} className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg">Sí, Limpiar Todo</button>
                        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition">Cancelar</button>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default DeleteAllConfirmationModal;