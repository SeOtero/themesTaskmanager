import React, { useState, useRef } from 'react';

const LuckyWheelModal = ({ isOpen, onClose, userCoins, setLofiCoins }) => {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [resultMessage, setResultMessage] = useState('');
    
    // --- LÓGICA DE ADS (Simulado) ---
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);

    if (!isOpen) return null;

    // Costo de girar
    const SPIN_COST = 50;

    // Premios (Ángulos y Valores)
    // La ruleta tiene 8 segmentos de 45 grados cada uno.
    const PRIZES = [
        { label: '💩 0', value: 0, color: '#ef4444' },
        { label: '💰 100', value: 100, color: '#3b82f6' },
        { label: '💩 10', value: 10, color: '#ef4444' },
        { label: '💎 500', value: 500, color: '#eab308' }, // Jackpot
        { label: '💰 50', value: 50, color: '#3b82f6' },
        { label: '💩 0', value: 0, color: '#ef4444' },
        { label: '💰 200', value: 200, color: '#3b82f6' },
        { label: '🔄 50', value: 50, color: '#a855f7' }, // Recuperas
    ];

    const spinWheel = () => {
        if (userCoins < SPIN_COST) {
            alert("No tienes suficientes monedas (Costo: 50). ¡Mira un anuncio para ganar más!");
            return;
        }
        if (spinning) return;

        // Cobrar
        setLofiCoins(prev => prev - SPIN_COST);
        setSpinning(true);
        setResultMessage('');

        // Calcular giro aleatorio (Mínimo 5 vueltas completas + aleatorio)
        const randomDegree = Math.floor(Math.random() * 360);
        const totalRotation = rotation + (360 * 5) + randomDegree;
        
        setRotation(totalRotation);

        // Esperar a que termine la animación (3 segundos)
        setTimeout(() => {
            setSpinning(false);
            
            // Calcular premio basado en el ángulo final
            // El puntero está arriba (270deg o -90deg), ajustamos la lógica
            // Normalizamos el ángulo a 0-360
            const finalAngle = totalRotation % 360;
            // Cada segmento es 45deg (360 / 8)
            // Invertimos el índice porque la rueda gira a favor del reloj
            const index = Math.floor(((360 - finalAngle) % 360) / 45);
            
            const prize = PRIZES[index];
            
            if (prize.value > 0) {
                setLofiCoins(prev => prev + prize.value);
                setResultMessage(`¡GANASTE ${prize.value} MONEDAS! 🎉`);
            } else {
                setResultMessage("¡Mala suerte! Inténtalo de nuevo. 💩");
            }

        }, 3000);
    };

    // --- LÓGICA DE ANUNCIO SIMULADO ---
    const watchAd = () => {
        if (isWatchingAd) return;
        setIsWatchingAd(true);
        setAdProgress(0);

        // Simular 5 segundos de video
        const interval = setInterval(() => {
            setAdProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsWatchingAd(false);
                    setLofiCoins(prevCoins => prevCoins + 50); // Recompensa
                    alert("¡Gracias por ver el anuncio! +50 Monedas recibidas.");
                    return 100;
                }
                return prev + 2; // Incremento
            });
        }, 50); // 50ms * 50 steps = 2500ms (2.5 seg rápido para demo)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border-4 border-yellow-500 flex flex-col items-center p-6 relative overflow-hidden">
                
                {/* LUCES DE CASINO (Decoración) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-pulse"></div>

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 drop-shadow-sm uppercase tracking-wider">
                    🎰 Ruleta Lofi
                </h2>
                <p className="text-gray-400 text-xs mb-6 text-center">Apuesta 50 monedas. ¡Gana hasta 500!</p>

                {/* CONTENEDOR DE LA RULETA */}
                <div className="relative w-64 h-64 mb-8">
                    {/* PUNTERO */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 w-8 h-10 text-4xl drop-shadow-xl">
                        🔻
                    </div>

                    {/* RUEDA GIRATORIA */}
                    <div 
                        className="w-full h-full rounded-full border-8 border-gray-800 shadow-2xl overflow-hidden relative transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {/* Segmentos (CSS Conic Gradient es más fácil) */}
                        <div className="w-full h-full" style={{
                            background: `conic-gradient(
                                ${PRIZES[0].color} 0deg 45deg,
                                ${PRIZES[1].color} 45deg 90deg,
                                ${PRIZES[2].color} 90deg 135deg,
                                ${PRIZES[3].color} 135deg 180deg,
                                ${PRIZES[4].color} 180deg 225deg,
                                ${PRIZES[5].color} 225deg 270deg,
                                ${PRIZES[6].color} 270deg 315deg,
                                ${PRIZES[7].color} 315deg 360deg
                            )`
                        }}></div>

                        {/* Textos de los premios (Posicionados absolutamente) */}
                        {PRIZES.map((prize, i) => (
                            <div key={i} className="absolute w-full h-full top-0 left-0 flex justify-center pt-4 font-bold text-white text-xs drop-shadow-md"
                                style={{ transform: `rotate(${i * 45 + 22.5}deg)` }}>
                                <span className="transform -translate-y-1">{prize.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Centro de la rueda */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg z-10 border-4 border-gray-300"></div>
                </div>

                {/* MENSAJE DE RESULTADO */}
                <div className="h-8 mb-4">
                    {resultMessage && <p className="text-yellow-400 font-bold animate-bounce text-lg text-center">{resultMessage}</p>}
                </div>

                {/* BOTÓN GIRAR */}
                <button 
                    onClick={spinWheel} 
                    disabled={spinning}
                    className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition-transform transform active:scale-95 mb-6 ${spinning ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-b-4 border-red-800'}`}
                >
                    {spinning ? 'GIRANDO...' : `GIRAR (📀 50)`}
                </button>

                <hr className="w-full border-gray-700 mb-4" />

                {/* ZONA DE ADS (Simulador) */}
                <div className="w-full bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 font-bold text-sm">📺 Banco Lofi</span>
                        <span className="text-green-400 text-xs font-mono">ADS DISPONIBLES</span>
                    </div>
                    
                    {isWatchingAd ? (
                        <div className="w-full bg-black rounded-full h-4 relative overflow-hidden">
                            <div 
                                className="bg-green-500 h-full transition-all duration-100 ease-linear"
                                style={{ width: `${adProgress}%` }}
                            ></div>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold tracking-widest">VIENDO ANUNCIO...</span>
                        </div>
                    ) : (
                        <button 
                            onClick={watchAd}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                        >
                            <span>▶️ Ver Video</span>
                            <span className="bg-black/20 px-2 py-0.5 rounded text-xs text-yellow-300">+50 Coins</span>
                        </button>
                    )}
                </div>

                <button onClick={onClose} className="mt-6 text-gray-500 hover:text-white underline text-sm">Cerrar Casino</button>
            </div>
        </div>
    );
};

export default LuckyWheelModal;