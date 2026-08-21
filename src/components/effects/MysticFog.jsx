import React from 'react';

const MysticFog = ({ themeId }) => {
    const isCrimson = themeId === 'crimson';
    // Usamos RGBA para control total
    const fogColor = isCrimson ? '153, 27, 27' : '6, 78, 59'; // Rojo Sangre vs Verde Bosque Profundo

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            
            {/* CAPA 1: Base Profunda (Estática y grande) */}
            {/* Un brillo grande desde abajo que da el tono general */}
            <div className="absolute inset-0" 
                 style={{
                     background: `radial-gradient(circle at 50% 110%, rgba(${fogColor}, 0.6) 0%, rgba(${fogColor}, 0.2) 40%, transparent 70%)`,
                 }}>
            </div>

            {/* CAPA 2: Niebla Respirante (Movimiento suave) */}
            {/* Se mueve horizontalmente muy despacio */}
            <div className="absolute inset-x-[-20%] bottom-0 h-[80%] animate-breathe-fog opacity-60"
                 style={{
                     background: `radial-gradient(ellipse at 50% 100%, rgba(${fogColor}, 0.5) 0%, transparent 60%)`,
                     filter: 'blur(40px)', // Blur alto para suavizar todo
                 }}>
            </div>

            {/* CAPA 3: Volutas secundarias (Detalle) */}
            {/* Se mueve en dirección contraria */}
            <div className="absolute inset-x-[-20%] bottom-[-10%] h-[60%] animate-drift-fog opacity-50 mix-blend-screen"
                 style={{
                     background: `radial-gradient(ellipse at 60% 100%, rgba(${fogColor}, 0.4) 0%, transparent 50%)`,
                     filter: 'blur(60px)',
                 }}>
            </div>

            <style jsx>{`
                @keyframes breathe-fog {
                    0% { transform: scaleY(1) translateX(0); opacity: 0.6; }
                    50% { transform: scaleY(1.1) translateX(-2%); opacity: 0.4; }
                    100% { transform: scaleY(1) translateX(0); opacity: 0.6; }
                }
                .animate-breathe-fog { animation: breathe-fog 15s ease-in-out infinite; }

                @keyframes drift-fog {
                    0% { transform: translateX(5%); }
                    100% { transform: translateX(-5%); }
                }
                .animate-drift-fog { animation: drift-fog 20s ease-in-out infinite alternate; }
            `}</style>
        </div>
    );
};

export default MysticFog;