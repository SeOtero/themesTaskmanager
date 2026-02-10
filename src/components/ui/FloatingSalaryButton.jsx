import React, { useState, useEffect } from 'react';

const FloatingSalaryButton = ({ onClick }) => {
    const [showBadge, setShowBadge] = useState(true);
    useEffect(() => { const timer = setTimeout(() => setShowBadge(false), 10000); return () => clearTimeout(timer); }, []);
    
    return (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 group">
            {showBadge && ( <div className="absolute -top-3 -right-4 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg wiggle-animation z-50 border-2 border-white tracking-widest transition-opacity duration-1000"> ¡NUEVO! </div> )}
            <button onClick={onClick} className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-2xl flex items-center justify-center border-4 border-gray-900 transition-transform duration-300 active:scale-95 hover:scale-110 overflow-hidden" title="Calcular Salario">
                <div className="shine-bar" />
                <span className="text-xl sm:text-3xl font-bold relative z-10">$</span>
            </button>
        </div>
    );
};

export default FloatingSalaryButton;