import React, { useMemo } from 'react';

const LofiAmbience = () => {
    // Generamos la nieve (más suave que la lluvia)
    const snowflakes = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${10 + Math.random() * 15}s`, // Caen lento
            size: `${2 + Math.random() * 4}px`,
            blur: `${Math.random() * 2}px`, // Nieve en diferentes profundidades
            opacity: 0.3 + Math.random() * 0.5
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020617]">

            {/* === 1. EL EXTERIOR (Noche y Nieve cayendo) === */}
            <div className="absolute inset-0 z-0">
                {snowflakes.map((snow) => (
                    <div 
                        key={snow.id}
                        className="absolute bg-blue-100 rounded-full animate-snow-fall"
                        style={{
                            left: snow.left,
                            width: snow.size,
                            height: snow.size,
                            animationDelay: snow.delay,
                            animationDuration: snow.duration,
                            opacity: snow.opacity,
                            filter: `blur(${snow.blur})`
                        }}
                    />
                ))}
            </div>

            {/* === 2. EL MARCO DE LA VENTANA (Efecto Parallax / Desenfocado) === */}
            {/* Un borde negro gigantestco con sombra interior masiva que simula la pared del cuarto en la oscuridad */}
            <div className="absolute inset-0 border-[40px] md:border-[80px] border-[#0a0705] shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-10">
                
                {/* Travesaños de madera gruesos y desenfocados (fuera de foco por la cámara) */}
                <div className="absolute top-0 bottom-0 left-1/3 w-12 bg-[#0a0705] shadow-[0_0_50px_rgba(0,0,0,1)] blur-[3px]"></div>
                <div className="absolute top-0 bottom-0 right-1/3 w-12 bg-[#0a0705] shadow-[0_0_50px_rgba(0,0,0,1)] blur-[3px]"></div>
                <div className="absolute top-1/2 left-0 right-0 h-12 bg-[#0a0705] -translate-y-1/2 shadow-[0_0_50px_rgba(0,0,0,1)] blur-[3px]"></div>
            </div>

            {/* === 3. ILUMINACIÓN AMBIENTAL DEL CUARTO (Fireplace & Lámparas) === */}
            {/* Fuego de la chimenea (Resplandor animado desde la izquierda) */}
            <div className="absolute top-1/4 bottom-0 left-0 w-[60vw] bg-gradient-to-r from-orange-600/30 via-orange-500/10 to-transparent blur-3xl z-20 mix-blend-screen animate-fire-flicker"></div>
            
            {/* Lámpara cálida (Resplandor desde la derecha) */}
            <div className="absolute top-1/4 right-0 w-[40vw] h-[70vh] bg-gradient-to-l from-yellow-500/20 to-transparent blur-3xl z-20 mix-blend-screen"></div>

            {/* === 4. BOKEH DE PRIMER PLANO (Partículas de luz fuera de foco) === */}
            {/* Simula el polvo o luces que flotan MUY cerca de ti */}
            {[...Array(6)].map((_, i) => (
                <div key={`bokeh-${i}`} className="absolute rounded-full bg-orange-400/10 z-30 animate-float-bokeh pointer-events-none"
                     style={{
                         left: `${Math.random() * 100}%`,
                         bottom: `${Math.random() * 60}%`,
                         width: `${100 + Math.random() * 250}px`,
                         height: `${100 + Math.random() * 250}px`,
                         filter: 'blur(50px)',
                         animationDuration: `${15 + Math.random() * 20}s`,
                         animationDelay: `${Math.random() * 5}s`,
                     }}
                />
            ))}

            {/* === CSS ANIMATIONS === */}
            <style jsx>{`
                @keyframes snow-fall {
                    0% { transform: translateY(-10vh) translateX(0); }
                    100% { transform: translateY(110vh) translateX(15px); }
                }
                .animate-snow-fall {
                    animation-name: snow-fall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }

                @keyframes fire-flicker {
                    0%, 100% { opacity: 0.6; transform: scaleX(1); }
                    50% { opacity: 0.9; transform: scaleX(1.1); }
                }
                .animate-fire-flicker { animation: fire-flicker 4s ease-in-out infinite alternate; }

                @keyframes float-bokeh {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(40px, -40px); }
                }
                .animate-float-bokeh { animation: float-bokeh ease-in-out infinite alternate; }
            `}</style>
        </div>
    );
};

export default LofiAmbience;