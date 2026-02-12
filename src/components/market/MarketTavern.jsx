import React, { useState, useEffect } from 'react';

const MarketTavern = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [isAngry, setIsAngry] = useState(false);

    const messages = [
        "¿PLAZO DE REPROGRAMACIÓN? ESO VENCIÓ EN EL 2010.",
        "NO ENVIAMOS A ESA ZONA. NI AUNQUE PAGUES EL DOBLE.",
        "EL PRODUCTO CUMPLE LA MISMA FUNCIÓN... SI CERRÁS LOS OJOS.",
        "QUEJA RECIBIDA. LA HE ENVIADO DIRECTAMENTE A MI BASURA.",
        "UNA VEZ TUVE UN CLIENTE QUE QUISO DEVOLVER UN PRODUCTO... PORQUE NO LE GUSTÓ EL COLOR. LE DIJE QUE LO PINTARA CON MARCADORES, PERO NO VOLVIÓ MÁS.",
        
    ];

    // Cambiar frase al azar
    const pokeFixy = () => {
        setIsAngry(true);
        // Elegir una frase distinta a la actual
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * messages.length);
        } while (newIndex === msgIndex);
        
        setMsgIndex(newIndex);

        // Quitar la animación de enojo después de un ratito
        setTimeout(() => setIsAngry(false), 500);
    };

    useEffect(() => {
        setMsgIndex(Math.floor(Math.random() * messages.length));
    }, []);

    return (
        <div className="relative w-full flex flex-col items-center pt-8 mb-6 select-none overflow-hidden rounded-b-3xl">
            
            {/* FONDO DE TIENDA (Estanterías borrosas) */}
            <div className="absolute inset-0 bg-[#1a120b] z-0 opacity-80 border-b-4 border-black">
                {/* Patrón de estanterías sugerido con CSS */}
                <div className="w-full h-1/3 border-b-8 border-[#3e2714] bg-[#2a1d12] relative opacity-50"></div>
                <div className="w-full h-1/3 border-b-8 border-[#3e2714] bg-[#2a1d12] relative opacity-50 mt-8"></div>
            </div>

            {/* --- GLOBO DE TEXTO (Interactive) --- */}
            <div className={`relative z-20 mb-4 transition-transform duration-200 cursor-pointer group 
                ${isAngry ? 'scale-110 rotate-2' : 'hover:-translate-y-1'}`}
                onClick={pokeFixy}
            >
                <div className="bg-yellow-300 border-[6px] border-black p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] 
                    max-w-[300px] md:max-w-md transform -rotate-1 group-hover:rotate-0 transition-transform">
                    <p className="text-black font-black font-comic italic text-center text-xl md:text-2xl leading-none uppercase drop-shadow-sm">
                        "{messages[msgIndex]}"
                    </p>
                </div>
                {/* Pico del globo */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-[15px] border-l-transparent 
                    border-r-[15px] border-r-transparent 
                    border-t-[25px] border-t-black"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                    border-l-[10px] border-l-transparent 
                    border-r-[10px] border-r-transparent 
                    border-t-[20px] border-t-yellow-300"></div>
            </div>

            {/* --- PERSONAJE (Fixy) --- */}
            <div 
                className={`relative z-10 mt-2 transition-transform duration-100 cursor-pointer ${isAngry ? 'animate-shake' : ''}`}
                onClick={pokeFixy}
            >
                {/* CABEZA */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto z-20">
                    {/* Pelo/Calva */}
                    <div className="absolute top-0 w-full h-full bg-pink-200 rounded-full border-[6px] border-black overflow-hidden shadow-xl">
                        {/* Barba Gigante */}
                        <div className="absolute bottom-[-10px] left-[-10%] w-[120%] h-[60%] bg-orange-600 rotate-2 border-t-[6px] border-black"></div>
                    </div>
                    
                    {/* Anteojos Tácticos (Cambian color al enojarse) */}
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[110%] flex justify-center gap-1">
                        <div className={`w-14 h-10 ${isAngry ? 'bg-red-600' : 'bg-black'} border-[4px] border-white rounded-sm transition-colors`}>
                            {/* Reflejo */}
                            <div className="w-4 h-full bg-white/20 skew-x-12 ml-2"></div>
                        </div>
                        <div className={`w-14 h-10 ${isAngry ? 'bg-red-600' : 'bg-black'} border-[4px] border-white rounded-sm transition-colors`}>
                            <div className="w-4 h-full bg-white/20 skew-x-12 ml-2"></div>
                        </div>
                        {/* Puente lentes */}
                        <div className="absolute top-4 w-4 h-2 bg-black"></div>
                    </div>

                    {/* Nariz */}
                    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-8 h-8 bg-red-400 rounded-full border-[4px] border-black"></div>
                </div>

                {/* CUERPO (Huevo) */}
                <div className="relative w-48 h-32 bg-emerald-700 border-[6px] border-black rounded-t-[50%] -mt-10 z-10 flex justify-center shadow-2xl">
                    {/* Logo Remera */}
                    <div className="mt-14 rotate-3">
                        <span className="bg-black text-white px-2 font-black text-xl border-2 border-white transform -skew-x-12 inline-block">FIXY</span>
                    </div>
                </div>
            </div>

            {/* --- MOSTRADOR DE MADERA --- */}
            <div className="w-full h-16 bg-[#5c3a21] border-y-[6px] border-black z-20 flex items-center justify-around px-4 md:px-20 -mt-6 relative shadow-lg">
                {/* Items sobre la mesa (Decoración) */}
                <div className="absolute -top-6 left-10 text-4xl drop-shadow-[0_4px_0_rgba(0,0,0,1)] animate-bounce-slow">📜</div>
                <div className="absolute -top-5 right-20 text-4xl drop-shadow-[0_4px_0_rgba(0,0,0,1)] rotate-12">🧪</div>
                <div className="absolute -top-4 right-10 text-3xl drop-shadow-[0_4px_0_rgba(0,0,0,1)]">💰</div>

                {/* Textura madera (Clavos) */}
                <div className="w-3 h-3 bg-black rounded-full opacity-30"></div>
                <div className="w-3 h-3 bg-black rounded-full opacity-30"></div>
                <div className="w-3 h-3 bg-black rounded-full opacity-30"></div>
            </div>

            <style>{`
                .font-comic { font-family: 'Bangers', 'VT323', fantasy; }
                
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                .animate-shake { animation: shake 0.5s; }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default MarketTavern;