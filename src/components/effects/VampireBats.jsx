import React, { useEffect, useState } from 'react';

const VampireBats = () => {
    const [bats, setBats] = useState([]);

    // Generamos más murciélagos, pero más pequeños y variados
    useEffect(() => {
        const newBats = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 6, // Retraso inicial aleatorio
            duration: 10 + Math.random() * 8, // Duración del cruce de pantalla
            topStart: 10 + Math.random() * 70, // Altura de inicio aleatoria
            scale: 0.3 + Math.random() * 0.5, // Variación de tamaño (más pequeños en general)
            flapSpeed: 0.15 + Math.random() * 0.1 // Pequeña variación en la velocidad de aleteo
        }));
        setBats(newBats);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
             {/* Definición del filtro de brillo rojo sangre una sola vez */}
            <svg width="0" height="0">
                <defs>
                    <filter id="blood-glow" x="-50%" y="-50%" width="200%" height="200%">
                        {/* Des desenfoque para el halo */}
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                        {/* Color del halo (Rojo intenso) */}
                        <feFlood floodColor="#dc2626" result="color" />
                        {/* Combinar el color con el desenfoque */}
                        <feComposite in="color" in2="blur" operator="in" result="shadow" />
                        {/* Poner la silueta negra original encima del halo rojo */}
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {bats.map((bat) => (
                <div
                    key={bat.id}
                    className="absolute -left-[10%] animate-bat-flight"
                    style={{
                        top: `${bat.topStart}%`,
                        animationDelay: `${bat.delay}s`,
                        animationDuration: `${bat.duration}s`,
                        transform: `scale(${bat.scale})`
                    }}
                >
                    {/* SVG Actualizado: Silueta negra, angulosa y con aleteo rápido.
                        Se aplica el filtro 'blood-glow' definido arriba.
                    */}
                    <svg width="60" height="35" viewBox="0 0 100 60" className="overflow-visible" filter="url(#blood-glow)">
                        <path 
                            fill="#000000" /* Silueta NEGRA sólida */
                            d="M50,30 C35,30 15,10 5,20 L10,30 C25,25 40,35 50,40 C60,35 75,25 90,30 L95,20 C85,10 65,30 50,30 Z"
                        >
                            <animate 
                                attributeName="d" 
                                /* Morphing entre alas arriba y alas abajo (formas más puntiagudas) */
                                values="
                                    M50,30 C35,30 15,10 5,20 L10,30 C25,25 40,35 50,40 C60,35 75,25 90,30 L95,20 C85,10 65,30 50,30 Z;
                                    M50,35 C40,50 25,60 15,55 L20,45 C30,50 40,40 50,40 C60,40 70,50 80,45 L85,55 C75,60 60,50 50,35 Z;
                                    M50,30 C35,30 15,10 5,20 L10,30 C25,25 40,35 50,40 C60,35 75,25 90,30 L95,20 C85,10 65,30 50,30 Z"
                                dur={`${bat.flapSpeed}s`} /* Aleteo muy rápido */
                                repeatCount="indefinite"
                                calcMode="discrete" /* 'discrete' hace el cambio brusco, no suave */
                            />
                        </path>
                    </svg>
                </div>
            ))}
            
            <style jsx>{`
                @keyframes bat-flight {
                    0% { left: -10%; transform: translateX(0) translateY(0) scale(var(--tw-scale-x)) rotate(-5deg); }
                    25% { transform: translateX(30vw) translateY(-40px) scale(var(--tw-scale-x)) rotate(5deg); }
                    50% { transform: translateX(60vw) translateY(20px) scale(var(--tw-scale-x)) rotate(-5deg); }
                    75% { transform: translateX(90vw) translateY(-30px) scale(var(--tw-scale-x)) rotate(5deg); }
                    100% { left: 110%; transform: translateX(0) translateY(0) scale(var(--tw-scale-x)) rotate(-5deg); }
                }
                .animate-bat-flight {
                    animation-name: bat-flight;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    will-change: transform, left; /* Optimización de rendimiento */
                }
            `}</style>
        </div>
    );
};

export default VampireBats;