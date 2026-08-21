import React, { useMemo } from 'react';

const MickeyConfetti = () => {
    const ICONS = ['🐭', '⚫', '🔴', '🟡', '⚪', '🧤', '👟', '✨'];
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden font-sans">
             {[...Array(35)].map((_, i) => (
                <div key={i} className="absolute animate-fallTopToBottom opacity-70" style={{
                    left: Math.random() * 100 + '%',
                    top: '-10%',
                    fontSize: Math.random() * 1.5 + 1 + 'rem',
                    animationDuration: Math.random() * 5 + 4 + 's',
                    animationDelay: Math.random() * 5 + 's',
                    transform: `rotate(${Math.random() * 360}deg)`,
                }}>{ICONS[Math.floor(Math.random() * ICONS.length)]}</div>
             ))}
             <style>{`
                @keyframes fallTopToBottom { 
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; } 
                    10% { opacity: 0.8; } 
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } 
                } 
                .animate-fallTopToBottom { 
                    animation-name: fallTopToBottom; 
                    animation-timing-function: linear; 
                    animation-iteration-count: infinite; 
                }
             `}</style>
        </div>
    );
};

export default MickeyConfetti;