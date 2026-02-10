import React, { useMemo } from 'react';

// 1. DEFINIMOS EL CSS AFUERA DEL COMPONENTE
// Al estar aquí afuera, el editor lo trata como texto simple y no se rompe.
const FLORA_STYLES = `
    @keyframes firefly-move {
        0%, 100% { transform: translate(0, 0); opacity: 0; }
        25% { opacity: 1; }
        50% { transform: translate(50px, -50px); opacity: 0.5; }
        75% { transform: translate(-30px, 30px); opacity: 1; }
    }
    
    @keyframes flora-fall {
        0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; }
        10% { opacity: 0.8; }
        100% { transform: translateY(110vh) rotate(360deg) translateX(50px); opacity: 0; }
    }

    .firefly {
        position: absolute;
        background: #bef264;
        border-radius: 50%;
        box-shadow: 0 0 10px #bef264;
        animation: firefly-move ease-in-out infinite;
    }

    .flora-particle {
        position: absolute;
        top: -20px;
        border-radius: 4px 10px;
        animation: flora-fall linear infinite;
    }
`;

const ForestFlora = () => {
    // 2. LÓGICA DE DATOS (LUCIÉRNAGAS)
    const fireflies = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            key: `fly-${i}`,
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 100}vh`,
            size: `${Math.random() * 4 + 2}px`,
            duration: `${Math.random() * 10 + 10}s`, 
            delay: `-${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.3
        }));
    }, []);

    // 3. LÓGICA DE DATOS (FLORA)
    const flora = useMemo(() => {
        const colors = ['#86efac', '#4ade80', '#fbcfe8', '#fdf2f8']; 
        return Array.from({ length: 15 }).map((_, i) => ({
            key: `leaf-${i}`,
            left: `${Math.random() * 100}vw`,
            size: `${Math.random() * 8 + 4}px`,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: `${Math.random() * 15 + 10}s`,
            delay: `-${Math.random() * 10}s`,
            rotation: Math.random() * 360
        }));
    }, []);

    // 4. RENDERIZADO (LIMPIO Y SIN ERRORES)
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Inyectamos el estilo que definimos arriba de todo */}
            <style dangerouslySetInnerHTML={{ __html: FLORA_STYLES }} />

            {fireflies.map(f => (
                <div key={f.key} className="firefly"
                    style={{
                        left: f.left, top: f.top, width: f.size, height: f.size,
                        animationDuration: f.duration, animationDelay: f.delay
                    }} 
                />
            ))}

            {flora.map(f => (
                <div key={f.key} className="flora-particle"
                    style={{
                        left: f.left, width: f.size, height: f.size,
                        backgroundColor: f.color,
                        animationDuration: f.duration, animationDelay: f.delay
                    }}
                />
            ))}
        </div>
    );
};

export default ForestFlora;