import React, { useMemo, useRef, useState } from 'react';
// IMPORTACIÓN DEL NUEVO EFECTO
import SnowEffect from './SnowEffect';
import CozyLights from './CozyLights';
import MysticFog from './MysticFog';
import ForestFlora from './ForestFlora';
import ShootingStars from './ShootingStars'; // <--- 1. Importar Galaxy
import GoldenDust from './GoldenDust';
import LofiNotes from './LofiNotes';       // <--- 2. Importar Royal
// --- EFECTOS EXISTENTES ---
export const BackgroundParticles = () => { const particles = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({ key: i, left: `${Math.random() * 100}vw`, size: `${2 + Math.random() * 5}px`, duration: `${20 + Math.random() * 20}s`, delay: `${Math.random() * 15}s`, randX: `${(Math.random() - 0.5) * 350}` })), []); return (<div className="w-full h-full absolute top-0 left-0">{particles.map(p => <div key={p.key} className="particle animate-particle" style={{ left: p.left, width: p.size, height: p.size, '--duration': p.duration, '--rand-x': p.randX, animationDelay: p.delay }} />)}</div>); };
export const BackgroundConfetti = () => { const confettiPieces = useMemo(() => { const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#38bdf8']; return Array.from({ length: 100 }).map((_, i) => { const size = Math.random() * 8 + 4; const isSquare = Math.random() > 0.5; return { key: i, left: `${Math.random() * 100}vw`, width: `${size}px`, height: `${size}px`, backgroundColor: colors[Math.floor(Math.random() * colors.length)], borderRadius: isSquare ? '2px' : '50%', transform: `rotate(${Math.random() * 360}deg)`, '--duration': `${Math.random() * 5 + 5}s`, '--delay': `${Math.random() * 5}s` }; }); }, []); return (<div className="w-full h-full absolute top-0 left-0 overflow-hidden">{confettiPieces.map(style => <div key={style.key} className="confetti" style={style} />)}</div>); };
// (Este es el BackgroundSnow viejo, lo mantenemos por si acaso, pero usaremos SnowEffect para Winter)
export const BackgroundSnow = () => { const snowflakes = useMemo(() => Array.from({ length: 150 }).map((_, i) => { const size = Math.random() * 4 + 2; return { key: i, left: `${Math.random() * 100}vw`, width: `${size}px`, height: `${size}px`, '--duration': `${Math.random() * 10 + 10}s`, '--delay': `${Math.random() * 10}s`, '--drift': Math.random() - 0.5 }; }), []); return (<div className="w-full h-full absolute top-0 left-0 overflow-hidden">{snowflakes.map(style => <div key={style.key} className="snowflake" style={style} />)}</div>); };
export const BackgroundChristmasLights = () => { const lights = useMemo(() => { const colors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b']; return Array.from({ length: 40 }).map((_, i) => { const size = Math.random() * 10 + 5; return { key: i, top: `${Math.random() * 100}vh`, left: `${Math.random() * 100}vw`, width: `${size}px`, height: `${size}px`, backgroundColor: colors[i % colors.length], boxShadow: `0 0 15px 5px ${colors[i % colors.length]}66`, '--duration': `${Math.random() * 2 + 1.5}s`, animationDelay: `${Math.random() * 2}s` }; }); }, []); return (<div className="w-full h-full absolute top-0 left-0">{lights.map(style => <div key={style.key} className="christmas-light" style={style} />)}</div>); };
export const BackgroundGhost = () => { const ghosts = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({ key: i, '--duration': `${Math.random() * 15 + 10}s`, '--delay': `${Math.random() * 10}s`, '--start-x': `${Math.random() * 80 + 10}vw`, '--end-x': `${Math.random() * 80 + 10}vw`, width: `${Math.random() * 50 + 50}px` })), []); return (<div className="w-full h-full absolute top-0 left-0 overflow-hidden">{ghosts.map(style => (<svg key={style.key} className="ghost" style={style} viewBox="0 0 100 125"><path d="M10 115 C 10 115, 10 95, 20 95 C 30 95, 30 115, 30 115 C 30 115, 30 95, 40 95 C 50 95, 50 115, 50 115 C 50 115, 50 95, 60 95 C 70 95, 70 115, 70 115 C 70 115, 70 95, 80 95 C 90 95, 90 115, 90 115 L 90 60 C 90 20, 50 10, 50 10 C 50 10, 10 20, 10 60 Z M 30 60 C 35 60, 35 50, 30 50 C 25 50, 25 60, 30 60 Z M 70 60 C 75 60, 75 50, 70 50 C 65 50, 65 60, 70 60 Z" /></svg>))}</div>); };
export const BackgroundMagic = () => { const particles = useMemo(() => { const emojis = ['🦄', '🐱', '✨', '💜', '❤️', '💖']; return Array.from({ length: 100 }).map((_, i) => { return { key: i, left: `${Math.random() * 100}vw`, fontSize: `${Math.random() * 1.5 + 0.75}rem`, opacity: Math.random() * 0.5 + 0.5, emoji: emojis[i % emojis.length], '--duration': `${Math.random() * 10 + 8}s`, '--delay': `${Math.random() * 8}s` }; }); }, []); return (<div className="w-full h-full absolute top-0 left-0 overflow-hidden">{particles.map(style => <div key={style.key} className="magic-particle" style={style}>{style.emoji}</div>)}</div>); };
export const BackgroundHearts = () => { const hearts = useMemo(() => { const emojis = ['❤️', '💖', '💘', '💝', '💓', '🌹']; return Array.from({ length: 50 }).map((_, i) => ({ key: i, left: `${Math.random() * 100}vw`, fontSize: `${Math.random() * 1.5 + 1}rem`, opacity: Math.random() * 0.5 + 0.3, emoji: emojis[i % emojis.length], '--duration': `${Math.random() * 5 + 5}s`, '--delay': `${Math.random() * 5}s` })); }, []); return (<div className="w-full h-full absolute top-0 left-0 overflow-hidden">{hearts.map(style => <div key={style.key} className="magic-particle" style={style}>{style.emoji}</div>)}</div>); };
export const BackgroundRain = () => { const drops = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({ key: i, left: `${Math.random() * 100}vw`, height: `${Math.random() * 20 + 10}px`, duration: `${Math.random() * 0.5 + 0.5}s`, delay: `${Math.random() * 2}s` })), []); return (<div className="w-full h-full absolute top-0 left-0 overflow-hidden">{drops.map(d => <div key={d.key} className="rain-drop" style={{ left: d.left, height: d.height, '--duration': d.duration, '--delay': d.delay }} />)}</div>); };
export const SpiderWeb = () => { return (<><div className="spider-web"><div className="line1"></div><div className="line2"></div></div><div className="spider-web" style={{ left: 'auto', right: 0, transform: 'scaleX(-1)' }}><div className="line1"></div><div className="line2"></div></div></>); };

export const BackgroundAudio = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) { audioRef.current.pause(); } 
            else { audioRef.current.play().catch(e => console.log("Audio play failed", e)); }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" />
            <button onClick={toggleAudio} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-lg group hover:scale-110 active:scale-95 duration-300">
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden">
                    <img src="https://i.imgur.com/0YBh5gg.png" alt="LofiDex Cup" className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : 'opacity-80 grayscale'}`} onError={(e) => {e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=☕";}} />
                    {!isPlaying && <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs bg-black/40 rounded-full">OFF</div>}
                </div>
            </button>
        </div>
    );
};

// --- AQUÍ REGISTRAMOS EL NUEVO EFECTO 'snow_effect' ---
export const EFFECT_COMPONENTS = {
    'particles': BackgroundParticles,
    'ghost': BackgroundGhost,
    'confetti': BackgroundConfetti,
    'snow': BackgroundSnow, // Versión antigua
    'snow_effect': SnowEffect, // <--- NUESTRA NUEVA NIEVE PARA EL TEMA WINTER
    'lights': BackgroundChristmasLights,
    'magic': BackgroundMagic,
    'hearts': BackgroundHearts,
    'rain': BackgroundRain,
    'mystic_fog': MysticFog,
    'cozy_lights': CozyLights,
    'forest_flora': ForestFlora,
    'shooting_stars': ShootingStars, // <--- 3. Registrar Galaxy
    'golden_dust': GoldenDust,
    'lofi_notes': LofiNotes,       // <--- 4. Registrar Royal
    'spiderweb': SpiderWeb
};