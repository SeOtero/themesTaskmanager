import React from 'react';

const SnowEffect = () => {
    // Creamos 50 copos de nieve con posiciones y retrasos aleatorios
    const snowflakes = Array.from({ length: 50 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            opacity: Math.random() * 0.7 + 0.3,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
        };
        return <div key={i} className="snowflake absolute top-[-10px] bg-white rounded-full blur-[1px]" style={style}></div>;
    });

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <style>{`
                @keyframes snowfall {
                    0% { transform: translateY(-10vh) translateX(0); }
                    100% { transform: translateY(110vh) translateX(20px); }
                }
                .snowflake {
                    animation: snowfall linear infinite;
                }
            `}</style>
            {snowflakes}
        </div>
    );
};

export default SnowEffect;