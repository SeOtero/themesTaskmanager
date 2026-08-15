import React from 'react';

const NekoCozyBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-pink-50">
            {/* Fondo gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-orange-100 to-purple-200 animate-gradient-xy opacity-80"></div>

            {/* Patrón de Huellitas */}
            {[...Array(15)].map((_, i) => (
                <div key={i} className="absolute text-pink-300/40 animate-float-neko"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        fontSize: `${Math.random() * 3 + 2}rem`,
                        animationDuration: `${Math.random() * 10 + 10}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        transform: `rotate(${Math.random() * 45}deg)`
                    }}>
                    🐾
                </div>
            ))}

            <style>{`
                @keyframes gradient-xy {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-xy {
                    background-size: 200% 200%;
                    animation: gradient-xy 15s ease infinite;
                }
                @keyframes float-neko {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    50% { opacity: 0.6; }
                    100% { transform: translateY(-100px) rotate(20deg); opacity: 0; }
                }
                .animate-float-neko {
                    animation-name: float-neko;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};

export default NekoCozyBackground;