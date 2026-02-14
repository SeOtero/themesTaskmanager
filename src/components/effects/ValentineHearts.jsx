import React, { useMemo } from 'react';

const ValentineHearts = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden font-sans">
             {/* 1. Partículas de luz (círculos brillantes) */}
             {[...Array(30)].map((_, i) => (
                <div
                    key={`dust-${i}`}
                    className="absolute rounded-full bg-pink-400 animate-pulse"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 4 + 1}px`,
                        height: `${Math.random() * 4 + 1}px`,
                        opacity: Math.random() * 0.6 + 0.2,
                        animationDuration: `${Math.random() * 3 + 2}s`,
                        boxShadow: '0 0 6px 2px rgba(244, 114, 182, 0.4)'
                    }}
                ></div>
             ))}

             {/* 2. Mini corazones flotando hacia arriba */}
             {[...Array(15)].map((_, i) => (
                <div
                    key={`heart-${i}`}
                    className="absolute text-pink-300 opacity-40 animate-floatUp"
                    style={{
                        top: `${Math.random() * 100 + 10}%`,
                        left: `${Math.random() * 100}%`,
                        fontSize: `${Math.random() * 10 + 10}px`,
                        animationDuration: `${Math.random() * 10 + 10}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        textShadow: '0 0 5px rgba(236, 72, 153, 0.5)'
                    }}
                >
                    {['❤', '✨', '💖'][Math.floor(Math.random() * 3)]}
                </div>
             ))}

             <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    20% { opacity: 0.6; }
                    80% { opacity: 0.6; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                .animate-floatUp {
                    animation-name: floatUp;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
             `}</style>
        </div>
    );
};

export default ValentineHearts;