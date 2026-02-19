import React, { useMemo } from 'react';

const Lanterns = () => {
    // Generamos linternas con propiedades aleatorias
    const lanterns = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        // Duración: entre 15s y 35s (muy lento y relajante)
        duration: `${15 + Math.random() * 20}s`,
        // Retraso negativo para que algunas ya estén en pantalla al iniciar
        delay: `-${Math.random() * 20}s`,
        scale: 0.6 + Math.random() * 0.6, // Tamaño variable
    })), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            <style>
                {`
                    @keyframes lanternFloatUp {
                        0% {
                            transform: translateY(105vh) rotate(-5deg);
                            opacity: 0;
                        }
                        10% {
                            opacity: 0.9;
                        }
                        50% {
                            transform: translateY(50vh) rotate(5deg);
                            opacity: 1;
                        }
                        90% {
                            opacity: 0.8;
                        }
                        100% {
                            transform: translateY(-20vh) rotate(-5deg);
                            opacity: 0;
                        }
                    }

                    .lantern-item {
                        position: absolute;
                        top: 0; /* Posicionamos arriba para usar vh relativo hacia abajo */
                        will-change: transform, opacity;
                        filter: drop-shadow(0 0 15px rgba(255, 160, 50, 0.6)); /* Brillo naranja */
                    }
                `}
            </style>
            
            {lanterns.map((l) => (
                <div 
                    key={l.id}
                    className="lantern-item"
                    style={{
                        left: l.left,
                        fontSize: `${l.scale * 2.5}rem`, // Un poco más grandes
                        animationName: 'lanternFloatUp',
                        animationDuration: l.duration,
                        animationDelay: l.delay,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite'
                    }}
                >
                    🏮
                </div>
            ))}
        </div>
    );
};

export default Lanterns;