import React from 'react';

const CozyFireplace = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* 1. El resplandor de fondo (Luz naranja pulsante desde abajo) */}
            <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-orange-600/20 via-orange-900/10 to-transparent animate-fire-pulse"></div>
            
            {/* 2. Partículas de brasas flotantes */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => {
                    const size = Math.random() * 4 + 2; // Tamaño entre 2px y 6px
                    const left = Math.random() * 100;
                    const duration = 5 + Math.random() * 5;
                    const delay = Math.random() * 5;
                    
                    return (
                        <div 
                            key={i}
                            className="absolute bottom-[-10px] rounded-full bg-orange-400 animate-ember-rise blur-[1px]"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${left}%`,
                                opacity: 0,
                                animationDuration: `${duration}s`,
                                animationDelay: `${delay}s`,
                                boxShadow: `0 0 ${size * 2}px #f97316` // Glow
                            }}
                        />
                    );
                })}
            </div>

            <style jsx>{`
                @keyframes fire-pulse {
                    0%, 100% { opacity: 0.6; height: 35vh; }
                    50% { opacity: 0.9; height: 45vh; }
                }
                .animate-fire-pulse { animation: fire-pulse 4s ease-in-out infinite; }

                @keyframes ember-rise {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    50% { transform: translateY(-40vh) translateX(20px); opacity: 0.8; }
                    100% { transform: translateY(-80vh) translateX(-20px); opacity: 0; }
                }
                .animate-ember-rise {
                    animation-name: ember-rise;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};

export default CozyFireplace;