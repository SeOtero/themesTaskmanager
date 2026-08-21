import React from 'react';

const WaterWavesEffect = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full overflow-hidden leading-[0] z-0 opacity-60 pointer-events-none">
            <svg
                className="relative block w-full h-[12vh] min-h-[100px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shapeRendering="auto"
            >
                <defs>
                    <path
                        id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                    />
                </defs>
                <g className="parallax-waves">
                    {/* Reflejo Naranja (Ciudad) */}
                    <use href="#gentle-wave" x="48" y="0" fill="rgba(255, 123, 0, 0.15)" />
                    {/* Reflejo Ámbar/Amarillo */}
                    <use href="#gentle-wave" x="48" y="3" fill="rgba(255, 183, 3, 0.2)" />
                    {/* Agua media oscura */}
                    <use href="#gentle-wave" x="48" y="5" fill="rgba(26, 21, 40, 0.6)" />
                    {/* Agua profunda en primer plano */}
                    <use href="#gentle-wave" x="48" y="7" fill="rgba(10, 8, 18, 0.95)" />
                </g>
            </svg>
        </div>
    );
};

export default WaterWavesEffect;