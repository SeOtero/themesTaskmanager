import React, { useMemo } from 'react';

const DiamondSparkles = () => {
    // Generamos 35 diamantes con posiciones, tamaños y tiempos aleatorios
    const sparkles = useMemo(() => Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        size: `${0.4 + Math.random() * 1.2}rem`, // Tamaños variados, no muy grandes para ser elegantes
        delay: `${Math.random() * 5}s`, // Para que no titilen todos al mismo tiempo
        duration: `${2 + Math.random() * 4}s`, // Velocidad del titileo
        char: Math.random() > 0.5 ? '✦' : '✧' // Alternamos entre dos formas de destello
    })), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <style>
                {`
                    @keyframes diamondTwinkle {
                        0%, 100% { 
                            opacity: 0; 
                            transform: scale(0.2) rotate(0deg); 
                        }
                        50% { 
                            opacity: 0.9; 
                            transform: scale(1.2) rotate(45deg); 
                            /* Sombra blanca y un toque celeste/hielo muy sutil para dar efecto diamante */
                            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 1)) drop-shadow(0 0 15px rgba(220, 240, 255, 0.6)); 
                        }
                    }
                    .diamond-sparkle {
                        position: absolute;
                        color: #ffffff; /* Blanco puro */
                        will-change: transform, opacity;
                        animation-name: diamondTwinkle;
                        animation-timing-function: ease-in-out;
                        animation-iteration-count: infinite;
                    }
                `}
            </style>
            
            {sparkles.map((s) => (
                <div 
                    key={s.id}
                    className="diamond-sparkle"
                    style={{
                        left: s.left,
                        top: s.top,
                        fontSize: s.size,
                        animationDuration: s.duration,
                        animationDelay: s.delay
                    }}
                >
                    {s.char}
                </div>
            ))}
        </div>
    );
};

export default DiamondSparkles;