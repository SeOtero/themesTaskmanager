import React, { useEffect } from 'react';

// --- IMPORTS DE TUS EFECTOS ---
import MatrixEffect from './MatrixEffect';
import LofiNotes from './LofiNotes';
import CozyLights from './CozyLights';
import MysticFog from './MysticFog';
import ForestFlora from './ForestFlora';
import GoldenDust from './GoldenDust';
import ShootingStars from './ShootingStars';
import SnowEffect from './SnowEffect';
import Lanterns from './Lanterns';
import VampireBats from './VampireBats';
import CozyFireplace from './CozyFireplace';
import LofiAmbience from './LofiAmbience';
import PineForest from './PineForest';
import CozyAmbience from './CozyAmbience';
import { BackgroundAudio, BackgroundRain } from './BackgroundEffects';

// --- IMPORTS DE EFECTOS DE TEMPORADA ---
import GhostEffect from './GhostEffect';
import ValentineHearts from './ValentineHearts';
import ChristmasLights from './ChristmasLights';
import MickeyConfetti from './MickeyConfetti';
import NeonCityBackground from './NeonCityBackground';
import NekoCozyBackground from './NekoCozyBackground';


// --- 2. EL EFECTO DE MICKEY (Lo mantenemos) ---
const MickeyConfettiEffect = () => {
    const ICONS = ['🐭', '⚫', '🔴', '🟡', '⚪', '🧤', '👟', '✨'];
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden font-sans">
             {[...Array(35)].map((_, i) => (
                <div key={i} className="absolute animate-fallTopToBottom opacity-70" style={{
                    left: Math.random() * 100 + '%',
                    top: '-10%',
                    fontSize: Math.random() * 1.5 + 1 + 'rem',
                    animationDuration: Math.random() * 5 + 4 + 's',
                    animationDelay: Math.random() * 5 + 's',
                    transform: `rotate(${Math.random() * 360}deg)`,
                }}>{ICONS[Math.floor(Math.random() * ICONS.length)]}</div>
             ))}
             <style>{`@keyframes fallTopToBottom { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translateY(110vh); opacity: 0; } } .animate-fallTopToBottom { animation-name: fallTopToBottom; animation-timing-function: linear; animation-iteration-count: infinite; }`}</style>
        </div>
    );
};

// --- 3. COMPONENTE MANAGER RESTAURADO ---
const BackgroundEffectsManager = ({ themeClasses, activeEffect }) => {

    // ✅ AQUÍ ESTÁ LA CLAVE: El Mapa Completo
    const EFFECT_COMPONENTS = {
        // Efectos recuperados para tus temas (Lofi, Forest, etc.)
        'lofi_notes': LofiNotes,
        'cozy_lights': CozyLights,
        'lanterns': Lanterns,
        'mystic_fog': MysticFog,
        'forest': ForestFlora,      // Asumo que en themes.js se llama 'forest' o 'forest_flora'
        'forest_flora': ForestFlora, // Pongo ambos por seguridad
        'golden_dust': GoldenDust,
        'shooting_stars': ShootingStars,
        'snow_effect': SnowEffect,
        'matrix_effect': MatrixEffect,
        'ghost': GhostEffect,           // <--- Aquí se usa la variable (dejará de estar gris)
        'valentine_hearts': ValentineHearts,
        'lights': ChristmasLights,
        'rain': BackgroundRain,
        'neon_grid': NeonCityBackground,
        'neko_pattern': NekoCozyBackground,
        'cozy_fireplace': CozyFireplace,
        'vampire_bats': VampireBats,
        'lofi_ambience': LofiAmbience,
        'pine_forest': PineForest,
        'cozy_ambience': CozyAmbience, // Alias por si en themes.js se llama cozy_ambience

        
               
        // Efectos nuevos
        'mickey_confetti': MickeyConfettiEffect,
        
        // Nota: Si 'rain' no tiene archivo .jsx propio, probablemente sea CSS o esté en BackgroundEffects.jsx.
        // Si no te funciona la lluvia, avísame para agregar el CSS aquí.
    };

    useEffect(() => {
        const body = document.body;
        
        // Limpieza inicial
        body.style.background = '';
        body.style.backgroundImage = '';
        body.style.cursor = '';
        const existingStyle = document.getElementById('theme-custom-css');
        if (existingStyle) existingStyle.remove();

        // 1. Aplicar clases base
        body.className = `${themeClasses.bodyBg || 'bg-gray-900'} min-h-screen transition-colors duration-500`;

        // 2. Fondo JS Crudo (Para gradientes complejos como Lofi)
        if (themeClasses.rawBg) {
            body.style.background = themeClasses.rawBg;
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundSize = 'cover';
        }

        // 3. Cursor Custom (Neko o Mickey)
        if (themeClasses.customCss) {
            const style = document.createElement('style');
            style.id = 'theme-custom-css';
            style.innerHTML = `body { ${themeClasses.customCss} }`;
            document.head.appendChild(style);
        } else if (themeClasses.name === 'neko') {
             // Cursor legacy para Neko si no usa customCss
             const pinkPaw = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ff69b4" stroke="white" stroke-width="1.5"><path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M7 5C5.9 5 5 5.9 5 7C5 8.1 5.9 9 7 9C8.1 9 9 8.1 9 7C9 5.9 8.1 5 7 5M17 5C15.9 5 15 5.9 15 7C15 8.1 15.9 9 17 9C18.1 9 19 8.1 19 7C19 5.9 18.1 5 17 5M12 8C9.5 8 7.3 9.3 6.1 11.4C5.5 12.4 6.2 13.7 7.3 13.9L8.5 14.1C9.6 14.3 10.7 14.3 11.8 14.1L16.5 13.2C17.7 13 18.5 11.9 18.1 10.8C17.3 9.2 14.9 8 12 8Z"/></svg>') 16 16, auto`;
             body.style.cursor = pinkPaw;
        }

    }, [themeClasses]);

    const renderEffects = () => {
        // Combinamos los efectos del tema con el efecto activo comprado (si hay)
        const effectsToRender = [...(themeClasses.activeEffects || [])];
        
        if (activeEffect && !effectsToRender.includes(activeEffect)) {
            effectsToRender.push(activeEffect);
        }
        
        return (
            <>
                {/* Capa base de ruido/estrellas */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
                
                {/* Renderizado dinámico */}
                {effectsToRender.map(key => {
                    const Component = EFFECT_COMPONENTS[key];
                    // Si el componente existe en el mapa, lo renderizamos
                    return Component ? <Component key={key} /> : null;
                })}
            </>
        );
    };

    return (
       <>
        {/* FONDO BASE (Estrellas o textura) */}
        <div 
            className="fixed inset-0 pointer-events-none -z-10 mix-blend-overlay opacity-[0.05]" 
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
        ></div>

        {/* CONTENEDOR DE EFECTOS - ¡IMPORTANTE: pointer-events-none! */}
        <div className="fixed inset-0 pointer-events-none z-0"> 
             {renderEffects()}
        </div>
        
        {/* Audio Lofi (Invisible) */}
        {themeClasses.name === 'lofi' && <BackgroundAudio />} 
    </>
    );
};

export default BackgroundEffectsManager;