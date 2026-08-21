import React, { useMemo } from 'react';

const GhostEffect = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
            <svg key={i} viewBox="0 0 100 125" className="fixed bottom-[-150px] fill-white/10 drop-shadow-[0_0_15px_rgba(200,220,255,0.6)] animate-floatGhost"
                style={{
                    left: `${Math.random() * 80 + 10}vw`,
                    width: `${Math.random() * 50 + 50}px`,
                    animationDuration: `${Math.random() * 15 + 10}s`,
                    animationDelay: `${Math.random() * 10}s`
                }}>
                <path d="M10 115 C 10 115, 10 95, 20 95 C 30 95, 30 115, 30 115 C 30 115, 30 95, 40 95 C 50 95, 50 115, 50 115 C 50 115, 50 95, 60 95 C 70 95, 70 115, 70 115 C 70 115, 70 95, 80 95 C 90 95, 90 115, 90 115 L 90 60 C 90 20, 50 10, 50 10 C 50 10, 10 20, 10 60 Z M 30 60 C 35 60, 35 50, 30 50 C 25 50, 25 60, 30 60 Z M 70 60 C 75 60, 75 50, 70 50 C 65 50, 65 60, 70 60 Z" />
            </svg>
        ))}
        <style>{`
            @keyframes floatGhost { 
                0% { transform: translateY(0) scale(1); opacity: 0; } 
                20% { opacity: 0.6; } 
                100% { transform: translateY(-120vh) scale(1.1); opacity: 0; } 
            } 
            .animate-floatGhost { 
                animation-name: floatGhost; 
                animation-timing-function: ease-in-out; 
                animation-iteration-count: infinite; 
            }
        `}</style>
    </div>
);

export default GhostEffect;