import React, { useMemo } from 'react';

const CozyLights = () => {
    // Generamos luces MÁS GRANDES y MÁS BRILLANTES
    const lights = useMemo(() => {
        // Paleta de fuego/ámbar más intensa
        const colors = ['#ffb700', '#ff6a00', '#ff8c00', '#ffd700', '#ff4500'];
        return Array.from({ length: 30 }).map((_, i) => ({
            key: i,
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 120}vh`, // Un poco más abajo para dar profundidad
            size: `${Math.random() * 400 + 150}px`, // GIGANTES
            color: colors[Math.floor(Math.random() * colors.length)],
            // OPACIDAD AUMENTADA MUCHO: De 0.05 a 0.3-0.6
            opacity: Math.random() * 0.3 + 0.3, 
            duration: `${Math.random() * 15 + 15}s`, // Movimiento un poco más rápido
            delay: `-${Math.random() * 20}s`,
            blur: `${Math.random() * 60 + 40}px`
        }));
    }, []);

    return (
        // mix-blend-plus-lighter hace que los colores se sumen y brillen intensamente
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-plus-lighter">
            <style>{`
                @keyframes float-pulse {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: var(--base-opacity); }
                    50% { transform: translate(var(--tx), var(--ty)) scale(1.2); opacity: calc(var(--base-opacity) + 0.2); }
                }
                .cozy-orb {
                    position: absolute;
                    border-radius: 50%;
                    animation: float-pulse infinite ease-in-out alternate;
                    --tx: ${(Math.random() - 0.5) * 100}px;
                    --ty: ${(Math.random() - 0.5) * 100}px;
                }
            `}</style>
            {lights.map(l => (
                <div 
                    key={l.key} 
                    className="cozy-orb"
                    style={{
                        left: l.left,
                        top: l.top,
                        width: l.size,
                        height: l.size,
                        backgroundColor: l.color,
                        '--base-opacity': l.opacity,
                        animationDuration: l.duration,
                        animationDelay: l.delay,
                        filter: `blur(${l.blur})`
                    }} 
                />
            ))}
        </div>
    );
};

export default CozyLights;