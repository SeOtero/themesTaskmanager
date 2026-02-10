import React, { useMemo } from 'react';

const GOLD_STYLES = `
    @keyframes float-up {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
    }

    .gold-particle {
        position: absolute;
        background: radial-gradient(circle, #fcd34d 0%, #b45309 100%); /* Degradado dorado */
        border-radius: 50%;
        box-shadow: 0 0 5px #f59e0b;
        animation: float-up linear infinite;
    }
`;

const GoldenDust = () => {
    const dust = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        key: `gold-${i}`,
        left: `${Math.random() * 100}vw`,
        size: `${Math.random() * 4 + 2}px`, // Pequeñas
        duration: `${Math.random() * 15 + 10}s`, // Lentas y majestuosas
        delay: `-${Math.random() * 20}s`
    })), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: GOLD_STYLES }} />
            {dust.map(d => (
                <div key={d.key} className="gold-particle" style={{
                    left: d.left, width: d.size, height: d.size,
                    animationDuration: d.duration, animationDelay: d.delay
                }} />
            ))}
        </div>
    );
};

export default GoldenDust;