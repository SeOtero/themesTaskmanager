import React, { useMemo } from 'react';

// Estilos definidos fuera para evitar errores en VS Code
const NOTE_STYLES = `
    @keyframes float-music {
        0% { transform: translateY(100vh) translateX(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        50% { transform: translateY(50vh) translateX(20px) rotate(10deg); opacity: 0.8; }
        100% { transform: translateY(-10vh) translateX(-20px) rotate(-10deg); opacity: 0; }
    }

    .music-note {
        position: absolute;
        color: #d1c4e9; /* Lila suave de tu marca */
        text-shadow: 0 0 10px rgba(209, 196, 233, 0.5);
        font-family: 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
        user-select: none;
        animation: float-music linear infinite;
    }
`;

const LofiNotes = () => {
    // Generamos notas musicales aleatorias
    const notes = useMemo(() => {
        const symbols = ['♪', '♫', '♩', '♬'];
        return Array.from({ length: 15 }).map((_, i) => ({
            key: `note-${i}`,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            left: `${Math.random() * 95}vw`,
            size: `${Math.random() * 20 + 15}px`, // Tamaño visible
            duration: `${Math.random() * 10 + 15}s`, // Muy lentas y relajantes
            delay: `-${Math.random() * 20}s`,
            opacity: Math.random() * 0.4 + 0.2 // Transparencia sutil
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
            <style dangerouslySetInnerHTML={{ __html: NOTE_STYLES }} />
            
            {notes.map(n => (
                <div key={n.key} className="music-note" style={{
                    left: n.left,
                    fontSize: n.size,
                    animationDuration: n.duration,
                    animationDelay: n.delay,
                    opacity: n.opacity
                }}>
                    {n.symbol}
                </div>
            ))}
        </div>
    );
};

export default LofiNotes;