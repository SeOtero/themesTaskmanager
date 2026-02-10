import React from 'react';

const GlobalStatusMessage = ({ message, resumeAction, dismissAction }) => {
    if (!message) return null;
    const isSuccess = message.taskIdToResume !== null;
    const bgColor = isSuccess ? 'bg-green-700/80' : 'bg-yellow-700/80';
    const borderColor = isSuccess ? 'border-green-400' : 'border-yellow-400';
    
    return (
        <div className="fixed top-0 left-0 w-full p-4 z-[60] backdrop-blur-sm transition-all duration-300 transform translate-y-0">
            <div className={`max-w-xl mx-auto p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${bgColor} border ${borderColor} text-white`}>
                <p className="font-semibold text-center sm:text-left flex-grow">{message.text}</p>
                <div className="flex gap-3 flex-shrink-0">
                    {message.taskIdToResume !== null && ( 
                        <button onClick={resumeAction} className="px-4 py-2 text-sm font-bold rounded-full bg-blue-500 hover:bg-blue-600 transition duration-200 shadow-md"> Reanudar Tarea </button> 
                    )}
                    <button onClick={dismissAction} className="px-4 py-2 text-sm font-bold rounded-full bg-gray-600 hover:bg-gray-700 transition duration-200"> Cerrar </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalStatusMessage;