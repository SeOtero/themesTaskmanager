import React from 'react';

const CityLightsEffect = () => {
    // Generamos 15 esferas de luz con tamaños, posiciones y colores aleatorios
    const orbs = Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 150 + 100; // Entre 100px y 250px
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        // Colores típicos de ciudad nocturna: Naranja, Ámbar y un toque de Púrpura
        const colors = ['bg-orange-500', 'bg-amber-400', 'bg-purple-600', 'bg-red-500'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Animación súper lenta y sutil
        const animDuration = Math.random() * 10 + 15; 
        const opacity = Math.random() * 0.2 + 0.05; // Opacidad muy baja (5% a 25%)

        return (
            <div
                key={i}
                className={`absolute rounded-full mix-blend-screen filter blur-[60px] ${color} animate-pulse`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${x}%`,
                    top: `${y}%`,
                    opacity: opacity,
                    animationDuration: `${animDuration}s`,
                }}
            />
        );
    });

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {orbs}
        </div>
    );
};

export default React.memo(CityLightsEffect);