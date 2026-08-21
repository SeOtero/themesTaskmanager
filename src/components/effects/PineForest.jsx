import React, { useMemo } from 'react';

const PineForest = () => {
    const trees = useMemo(() => {
        // CAPA 1: FONDO (Lejanos, muchos y finos)
        const backTrees = Array.from({ length: 45 }).map((_, i) => ({
            left: Math.random() * 100,
            height: 15 + Math.random() * 10,
            width: 3 + Math.random() * 2, // Más angostos
            color: '#064e3b', // Emerald 900
            opacity: 0.5,
            delay: Math.random() * 5
        }));

        // CAPA 2: MEDIO
        const midTrees = Array.from({ length: 30 }).map((_, i) => ({
            left: Math.random() * 100,
            height: 25 + Math.random() * 15,
            width: 5 + Math.random() * 3,
            color: '#022c22', // Emerald 950
            opacity: 0.8,
            delay: Math.random() * 5
        }));

        // CAPA 3: FRENTE (Cercanos, siluetas oscuras)
        const frontTrees = Array.from({ length: 15 }).map((_, i) => ({
            left: Math.random() * 100,
            height: 40 + Math.random() * 25,
            width: 8 + Math.random() * 4,
            color: '#000000', // Negro puro
            opacity: 1,
            delay: Math.random() * 5
        }));

        return { backTrees, midTrees, frontTrees };
    }, []);

    const PineTree = ({ tree }) => (
        <div 
            className="absolute bottom-0 flex flex-col items-center origin-bottom animate-sway"
            style={{
                left: `${tree.left}%`,
                height: `${tree.height}%`,
                width: `${tree.width}%`,
                opacity: tree.opacity,
                zIndex: tree.zIndex,
                animationDelay: `${tree.delay}s`,
                animationDuration: `${5 + Math.random() * 3}s`
            }}
        >
            {/* SVG NUEVO: Forma dentada con ramas escalonadas */}
            <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="w-full h-full drop-shadow-xl">
                <path 
                    d="M50,0 
                       L70,40 L60,40 
                       L80,90 L65,90 
                       L95,150 L80,150 
                       L100,200 
                       L0,200 
                       L20,150 L5,150 
                       L35,90 L20,90 
                       L40,40 L30,40 
                       Z" 
                    fill={tree.color} 
                />
            </svg>
        </div>
    );

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Capa Trasera */}
            <div className="absolute inset-0 bottom-[5%]">
                {trees.backTrees.map((tree, i) => <PineTree key={`back-${i}`} tree={tree} />)}
            </div>

            {/* Capa Media */}
            <div className="absolute inset-0 bottom-[2%]">
                {trees.midTrees.map((tree, i) => <PineTree key={`mid-${i}`} tree={tree} />)}
            </div>

            {/* Capa Frontal */}
            <div className="absolute inset-0 bottom-[-1%]">
                {trees.frontTrees.map((tree, i) => <PineTree key={`front-${i}`} tree={tree} />)}
            </div>

            <style jsx>{`
                @keyframes sway {
                    0%, 100% { transform: rotate(0deg) scaleY(1); }
                    50% { transform: rotate(1.5deg) scaleY(1.02); }
                }
                .animate-sway {
                    animation-name: sway;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    transform-origin: bottom center;
                }
            `}</style>
        </div>
    );
};

export default PineForest;