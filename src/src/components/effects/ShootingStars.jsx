import React, { useMemo } from 'react';

// Estilos CSS definidos fuera para evitar errores
const STAR_STYLES = `
    /* Fondo de estrellas parpadeantes */
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }

    /* Meteorito cruzando la pantalla */
    @keyframes shooting {
        0% { transform: translateX(0) translateY(0) rotate(315deg); opacity: 1; }
        70% { opacity: 1; }
        100% { transform: translateX(-100vw) translateY(100vh) rotate(315deg); opacity: 0; }
    }

    .star-static {
        position: absolute;
        background: white;
        border-radius: 50%;
        animation: twinkle infinite ease-in-out;
    }

    .shooting-star {
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 2px;
        background: linear-gradient(90deg, rgba(255,255,255,1), transparent);
        animation: shooting 4s linear infinite;
        opacity: 0;
    }
    
    /* Cabeza del meteorito */
    .shooting-star::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #4c1d95;
    }
`;

const ShootingStars = () => {
    // 1. Estrellas de fondo (muchas y pequeñas)
    const staticStars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        key: `s-${i}`,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        size: `${Math.random() * 2 + 1}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 3 + 2}s`
    })), []);

    // 2. Estrellas fugaces (pocas y rápidas)
    const meteors = useMemo(() => Array.from({ length: 3 }).map((_, i) => ({
        key: `m-${i}`,
        top: `${Math.random() * 50}vh`, // Empiezan en la mitad superior
        right: `${Math.random() * 20 - 20}vw`, // Empiezan fuera a la derecha
        delay: `${Math.random() * 10 + 2}s`, // Aparecen cada cierto tiempo
        duration: `${Math.random() * 2 + 3}s` // Velocidad
    })), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
            <style dangerouslySetInnerHTML={{ __html: STAR_STYLES }} />
            
            {staticStars.map(s => (
                <div key={s.key} className="star-static" style={{
                    left: s.left, top: s.top, width: s.size, height: s.size,
                    animationDelay: s.delay, animationDuration: s.duration
                }} />
            ))}

            {meteors.map(m => (
                <div key={m.key} className="shooting-star" style={{
                    top: m.top, right: m.right,
                    animationDelay: m.delay, animationDuration: m.duration
                }} />
            ))}
        </div>
    );
};

export default ShootingStars;