import React from 'react';

const MysticFog = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-30">
            <style>{`
                @keyframes fog-drift {
                    0% { background-position: 0 0; }
                    100% { background-position: 200% 0; }
                }
                .fog-layer {
                    position: absolute;
                    width: 300%;
                    height: 100%;
                    background-image: url('https://www.transparenttextures.com/patterns/foggy-birds.png'); /* Textura sutil de niebla */
                    background-size: cover;
                    opacity: 0.4;
                    animation: fog-drift 240s linear infinite;
                }
                 .fog-layer.two {
                    animation-direction: reverse;
                    animation-duration: 180s;
                    opacity: 0.2;
                }
            `}</style>
            <div className="fog-layer"></div>
            <div className="fog-layer two"></div>
        </div>
    );
};

export default MysticFog;