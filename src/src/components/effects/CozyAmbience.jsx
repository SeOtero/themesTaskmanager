import React, { useMemo } from 'react';

const CozyAmbience = ({ isTimerRunning = false }) => {
    
    // Luciérnagas / Magia flotante para el bosque exterior
    const fireflies = useMemo(() => Array.from({ length: 35 }).map((_, i) => ({
        id: `ff-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${1.5 + Math.random() * 3}px`,
        duration: `${3 + Math.random() * 5}s`,
        delay: `-${Math.random() * 5}s`
    })), []);

    // Ángulos para distribuir las guirnaldas de luz simétricamente en el arco superior
    const bulbAngles = [-75, -50, -25, 0, 25, 50, 75];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#0c0805] flex items-center justify-center">
            
            {/* === 1. LA VENTANA CIRCULAR (Moon Gate) === */}
            {/* Se ubica justo en el centro. El color del bosque cambia si el timer está activo */}
            <div className={`relative w-[95vw] max-w-[850px] aspect-square rounded-full border-[15px] md:border-[30px] border-[#180d06] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_100px_rgba(0,0,0,0.9)] overflow-hidden transition-colors duration-1000 ${isTimerRunning ? 'bg-[#064e3b]' : 'bg-[#02180e]'}`}>
                
                {/* Gradiente de profundidad del bosque */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-transparent to-transparent opacity-80"></div>
                
                {/* Luciérnagas del jardín */}
                {fireflies.map((ff) => (
                    <div key={ff.id} 
                         className={`absolute rounded-full bg-yellow-200 animate-firefly transition-opacity duration-1000 ${isTimerRunning ? 'opacity-100' : 'opacity-30'}`}
                         style={{
                             left: ff.left, top: ff.top, width: ff.size, height: ff.size,
                             boxShadow: '0 0 10px 2px rgba(253,230,138,0.8)',
                             animationDuration: ff.duration, animationDelay: ff.delay
                         }}
                    />
                ))}

                {/* Siluetas de árboles lejanos en la base de la ventana */}
                <div className="absolute bottom-0 w-full h-1/3 bg-[#01110a]/60 blur-[3px]" 
                     style={{ clipPath: 'polygon(0% 100%, 10% 40%, 30% 80%, 50% 20%, 70% 80%, 90% 30%, 100% 100%)' }}>
                </div>
            </div>

            {/* === 2. GUIRNALDAS DE LUZ CÁLIDA === */}
            {/* Siguen la curvatura exacta de la ventana en la mitad superior */}
            <div className="absolute top-1/2 left-1/2 w-[95vw] max-w-[850px] aspect-square rounded-full">
                {bulbAngles.map((angle, i) => (
                    <div key={`bulb-${i}`} 
                         className="absolute top-1/2 left-1/2 w-full h-full"
                         style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>
                        
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 md:-mt-4 flex flex-col items-center">
                            {/* Cable cortito */}
                            <div className="w-1 h-3 md:h-5 bg-black/80 rounded-b-sm"></div>
                            {/* Foco */}
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-yellow-100 rounded-full animate-bulb-glow" 
                                 style={{ animationDelay: `${i * 0.4}s` }}>
                            </div>
                            {/* Halo de luz que emite el foco */}
                            <div className="absolute top-4 w-16 h-16 bg-orange-500/20 rounded-full blur-xl"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* === 3. PLANTAS SIMÉTRICAS EN PRIMER PLANO === */}
            {/* Planta Izquierda */}
            <div className="absolute bottom-[-10%] left-[-10%] md:left-[-5%] w-[50vw] max-w-[450px] opacity-95 drop-shadow-[15px_15px_30px_rgba(0,0,0,1)]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#080d08] fill-current animate-sway-left origin-bottom">
                    {/* Tallo principal */}
                    <path d="M50,100 Q60,50 80,0" fill="none" stroke="currentColor" strokeWidth="3"/>
                    {/* Hojas frondosas */}
                    <path d="M50,90 Q20,80 30,50 Q60,60 50,90" />
                    <path d="M55,70 Q90,70 80,40 Q50,40 55,70" />
                    <path d="M60,50 Q30,30 40,10 Q70,30 60,50" />
                    <path d="M65,30 Q90,20 90,0 Q60,10 65,30" />
                    <path d="M50,100 Q10,70 20,40 Q40,60 50,100" />
                </svg>
            </div>

            {/* Planta Derecha (Espejada con scale-x-[-1]) */}
            <div className="absolute bottom-[-10%] right-[-10%] md:right-[-5%] w-[50vw] max-w-[450px] opacity-95 drop-shadow-[15px_15px_30px_rgba(0,0,0,1)] scale-x-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#080d08] fill-current animate-sway-right origin-bottom">
                    <path d="M50,100 Q60,50 80,0" fill="none" stroke="currentColor" strokeWidth="3"/>
                    <path d="M50,90 Q20,80 30,50 Q60,60 50,90" />
                    <path d="M55,70 Q90,70 80,40 Q50,40 55,70" />
                    <path d="M60,50 Q30,30 40,10 Q70,30 60,50" />
                    <path d="M65,30 Q90,20 90,0 Q60,10 65,30" />
                    <path d="M50,100 Q10,70 20,40 Q40,60 50,100" />
                </svg>
            </div>

            {/* === 4. CHIMENEA / ILUMINACIÓN BASE CÁLIDA === */}
            <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-orange-900/40 via-orange-800/10 to-transparent mix-blend-screen blur-[40px] animate-fire-base"></div>

            <style jsx>{`
                /* Movimiento de las luciérnagas */
                @keyframes firefly {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(20px, -40px) scale(1.5); }
                }
                .animate-firefly { animation: firefly 4s ease-in-out infinite alternate; }

                /* Resplandor intermitente de las bombillas */
                @keyframes bulb-glow {
                    0%, 100% { opacity: 0.7; transform: scale(1); box-shadow: 0 0 15px 2px rgba(249,115,22,0.4); }
                    50% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 25px 8px rgba(249,115,22,0.8); }
                }
                .animate-bulb-glow { animation: bulb-glow 3s infinite alternate; }

                /* Mecer natural de las plantas */
                @keyframes sway-left {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-3deg); }
                }
                .animate-sway-left { animation: sway-left 6s ease-in-out infinite; }

                @keyframes sway-right {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(3deg); }
                }
                .animate-sway-right { animation: sway-right 7s ease-in-out infinite; }

                /* Latido del fuego base */
                @keyframes fire-base {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
                .animate-fire-base { animation: fire-base 5s ease-in-out infinite alternate; }
            `}</style>
        </div>
    );
};

export default CozyAmbience;