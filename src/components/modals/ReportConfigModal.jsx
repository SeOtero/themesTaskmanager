import React, { useState } from 'react';
import CalendarWidget from '../ui/CalendarWidget';
import SyncTool from '../ui/SyncTool';

const ReportConfigModal = ({ isOpen, onClose, onGenerate, tasks, syncTasksTime, themeClasses, selectedReportDate, setSelectedReportDate, pastReports = [] }) => {
    
    if (!isOpen) return null;

    const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);

    // FUNCIÓN: Convierte formato YYYY-MM-DD a DD/MM/YYYY
    const getFormattedDate = (isoDate) => {
        if (!isoDate) return "DD/MM/YYYY";
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleConfirmClick = () => {
        const reportExists = Array.isArray(pastReports) && pastReports.some(r => r.id === selectedReportDate);
        if (reportExists) { setShowOverwriteWarning(true); } else { onGenerate(); }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl ${themeClasses.modalBg || 'bg-gray-800 border-gray-600'} border-2 modal-content max-h-[90vh] overflow-y-auto`}>
                
                {showOverwriteWarning ? (
                    <div className="flex flex-col items-center text-center animate-pulse">
                        <div className="bg-red-500/20 p-4 rounded-full mb-3 border-2 border-red-500">⚠️</div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">¡Cuidado!</h3>
                        <p className="text-gray-300 mb-6">Ya existe un reporte para el <span className="font-bold text-white">{getFormattedDate(selectedReportDate)}</span>. Si continuas, se borrarán los datos anteriores.</p>
                        <div className="flex flex-col gap-3 w-full">
                            <button onClick={onGenerate} className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg">Sí, Sobreescribir</button>
                            <button onClick={() => setShowOverwriteWarning(false)} className="w-full py-3 rounded-xl font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition">Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className={`text-xl font-bold mb-4 text-center ${themeClasses.primaryText}`}>Preparar Reporte</h2>
                        
                        <div className="mb-6 flex flex-col items-center">
                            <label className={`block text-sm font-semibold mb-2 text-center ${themeClasses.secondaryText}`}>Fecha del Reporte:</label>
                            
                            {/* --- SELECTOR DE FECHA PERSONALIZADO --- */}
                            <div className="relative group w-full cursor-pointer">
                                {/* LO QUE VES (Texto DD/MM/YYYY) */}
                                <div className="neon-date-capsule flex items-center justify-center w-full px-6 py-4 rounded-full bg-black/40 border border-cyan-500/50">
                                    <span className="text-white text-xl font-mono uppercase tracking-widest z-10">
                                        {getFormattedDate(selectedReportDate)}
                                    </span>
                                    <span className="absolute right-6 text-cyan-400 opacity-70 z-10 pointer-events-none text-lg">📅</span>
                                </div>
                                {/* LO QUE USAS (Input Invisible) */}
                                <input 
                                    type="date" 
                                    value={selectedReportDate} 
                                    onChange={(e) => setSelectedReportDate(e.target.value)} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="absolute inset-0 rounded-full border border-cyan-500/30 blur-sm group-hover:blur-md transition-all -z-10"></div>
                            </div>
                        </div>

                        <hr className={`border-t ${themeClasses.inputBorder} mb-6 opacity-50`} />
                        <div className="mb-6"><SyncTool tasks={tasks} syncTasksTime={syncTasksTime} themeClasses={themeClasses} /></div>
                        
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleConfirmClick} className={`flex-1 py-3 rounded-full font-bold text-white shadow-lg ${themeClasses.buttonAction}`}> Confirmar y Generar </button>
                            <button onClick={onClose} className="px-6 py-3 rounded-full font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"> Cancelar </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportConfigModal;