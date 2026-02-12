import React from 'react';

const FloatingActions = ({ 
    isLeader, 
    onOpenDashboard, 
    onOpenIdeas, 
    onOpenAvailability,
    setIdeaType 
}) => {
    return (
        <>
            {isLeader && (
                <button onClick={onOpenDashboard} className="fixed top-12 right-4 z-50 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    👑 LÍDER
                </button>
            )}
            
            <button 
                onClick={() => { setIdeaType('dev'); onOpenIdeas(); }} 
                className="fixed bottom-20 right-4 z-50 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-2"
            >
                <span>👨‍💻</span><span>BUGS / IDEAS APP</span>
            </button>
            
            <button 
                onClick={() => { setIdeaType('monday'); onOpenIdeas(); }} 
                className="fixed bottom-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-full shadow-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-2"
            >
                <span>💡</span><span>IDEAS LUNES</span>
            </button>
            
            <button 
                onClick={onOpenAvailability} 
                className="fixed bottom-36 right-4 z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full font-bold shadow-lg text-xs flex items-center gap-2"
            >
                <span>📅</span><span className="hidden sm:inline">DISPONIBILIDAD</span>
            </button>
        </>
    );
};

export default FloatingActions;