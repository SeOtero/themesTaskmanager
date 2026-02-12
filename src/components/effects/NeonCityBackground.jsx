import React from 'react';

const NeonCityBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050a14]">
            {/* Cielo y Sol Estilo Synthwave */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-[#2a0a3b]"></div>
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[50vh] h-[50vh] rounded-full bg-gradient-to-t from-fuchsia-600 to-yellow-400 blur-[60px] opacity-60"></div>

            {/* Rejilla 3D en movimiento infinito */}
            <div className="cyber-grid"></div>

            {/* Silueta de Ciudad Lejana */}
            <div className="city-skyline"></div>

            <style>{`
                .cyber-grid {
                    position: absolute;
                    width: 200%;
                    height: 100%;
                    bottom: -50%;
                    left: -50%;
                    background-image: 
                        linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px);
                    background-size: 50px 50px;
                    transform: perspective(300px) rotateX(60deg);
                    animation: gridMove 4s linear infinite;
                    box-shadow: 0 0 150px rgba(6, 182, 212, 0.3);
                }

                .city-skyline {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    height: 25%;
                    background: repeating-linear-gradient(
                        90deg,
                        #000 0px,
                        #000 15px,
                        transparent 15px,
                        transparent 25px
                    );
                    opacity: 0.8;
                    filter: drop-shadow(0 0 15px #d946ef);
                    z-index: -1;
                }

                @keyframes gridMove {
                    0% { transform: perspective(300px) rotateX(60deg) translateY(0); }
                    100% { transform: perspective(300px) rotateX(60deg) translateY(50px); }
                }
            `}</style>
        </div>
    );
};

export default NeonCityBackground;