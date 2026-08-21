import React from 'react';
import './EkgNeonEffect.css';

const EkgNeonEffect = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
            <div className="ekg-container">
                <svg
                    className="ekg-line"
                    viewBox="0 0 1000 200"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 
                        Trazado con 5 "imágenes/latidos" estáticos distribuidos.
                        Se dibujan 5 latidos del 0 al 500, y luego se clonan EXACTAMENTE
                        del 500 al 1000 para que el reinicio de la animación CSS sea imperceptible.
                    */}
                    <path
                        d="
                            M 0 100 
                            L 20 100 L 25 90 L 30 100 L 35 120 L 40 10 L 48 190 L 55 100 L 65 85 L 75 100 L 100 100 
                            L 120 100 L 125 90 L 130 100 L 135 120 L 140 10 L 148 190 L 155 100 L 165 92 L 175 100 L 200 100 
                            L 220 100 L 225 90 L 230 100 L 235 120 L 240 10 L 244 140 L 248 30 L 252 190 L 258 100 L 265 85 L 275 100 L 300 100 
                            L 320 100 L 325 90 L 330 100 L 335 150 L 340 10 L 348 190 L 355 100 L 365 85 L 375 100 L 400 100 
                            L 420 100 L 425 90 L 430 100 L 435 120 L 440 10 L 448 190 L 455 100 L 465 85 L 475 100 L 500 100 

                            L 520 100 L 525 90 L 530 100 L 535 120 L 540 10 L 548 190 L 555 100 L 565 85 L 575 100 L 600 100 
                            L 620 100 L 625 90 L 630 100 L 635 120 L 640 10 L 648 190 L 655 100 L 665 92 L 675 100 L 700 100 
                            L 720 100 L 725 90 L 730 100 L 735 120 L 740 10 L 744 140 L 748 30 L 752 190 L 758 100 L 765 85 L 775 100 L 800 100 
                            L 820 100 L 825 90 L 830 100 L 835 150 L 840 10 L 848 190 L 855 100 L 865 85 L 875 100 L 900 100 
                            L 920 100 L 925 90 L 930 100 L 935 120 L 940 10 L 948 190 L 955 100 L 965 85 L 975 100 L 1000 100
                        "
                        fill="none"
                        stroke="#ff7b00" 
                        strokeWidth="2.5"
                        filter="url(#neon-glow)"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
        </div>
    );
};

export default EkgNeonEffect;