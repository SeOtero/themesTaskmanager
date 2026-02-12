export const THEMES = {

    // =========================================================================
    // 1. TEMAS DE TEMPORADA (Prioritarios)
    // =========================================================================
    seasonal_valentines: {
        id: 'seasonal_valentines',
        name: 'valentines',
        label: '💘 San Valentín',
        hidden: true,
        type: 'theme',
        bodyBg: 'bg-pink-950', 
        rawBg: 'radial-gradient(circle at 50% 10%, #be185d 0%, #831843 40%, #000000 100%)',
        cardBg: 'bg-pink-900/60 backdrop-blur-md shadow-[0_0_40px_rgba(236,72,153,0.3)] border border-pink-500/30',
        primaryText: 'text-pink-100',
        secondaryText: 'text-pink-200',
        accentText: 'text-white font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]',
        inputBorder: 'border-pink-500 focus:border-pink-300 bg-pink-900/50',
        shopSelectBorder: 'border-pink-400',
        buttonAction: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg shadow-pink-900/50',
        buttonAdd: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md',
        modalBg: 'bg-pink-950 border-pink-500',
        customCss: `cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ec4899" stroke="white" stroke-width="1.5" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 0 0, auto !important;`,
        activeEffects: ['valentine_hearts']
    },

    seasonal_halloween: {
        id: 'seasonal_halloween',
        name: 'halloween',
        label: '🎃 Halloween',
        hidden: true,
        type: 'theme',
        bodyBg: 'bg-gray-950',
        rawBg: 'linear-gradient(to bottom, #1a0b00 0%, #000000 100%)',
        cardBg: 'bg-[#0a0a0a] shadow-2xl border border-orange-600/50',
        primaryText: 'text-orange-500',
        secondaryText: 'text-gray-400',
        accentText: 'text-yellow-400 font-bold tracking-widest',
        inputBorder: 'border-gray-700 focus:border-orange-500 bg-gray-900',
        shopSelectBorder: 'border-orange-500',
        buttonAction: 'bg-purple-700 hover:bg-purple-800 text-white border border-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.4)]',
        buttonAdd: 'bg-orange-600 hover:bg-orange-700 text-white',
        modalBg: 'bg-gray-900 border-orange-600',
        activeEffects: ['ghost', 'spiderweb'] 
    },

    seasonal_christmas: {
        id: 'seasonal_christmas',
        name: 'christmas',
        label: '🎄 Navidad',
        hidden: true,
        type: 'theme',
        bodyBg: 'bg-red-950',
        rawBg: 'linear-gradient(to bottom, #022c22 0%, #14532d 100%)',
        cardBg: 'bg-green-900/90 backdrop-blur-sm border border-yellow-400/30',
        primaryText: 'text-white',
        secondaryText: 'text-gray-200',
        accentText: 'text-yellow-300 font-bold',
        inputBorder: 'border-red-400 focus:border-yellow-300 bg-red-900/50',
        shopSelectBorder: 'border-yellow-400',
        buttonAction: 'bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold shadow-lg',
        buttonAdd: 'bg-red-600 hover:bg-red-700 text-white',
        modalBg: 'bg-green-900 border-yellow-400',
        activeEffects: ['snow', 'lights'] 
    },

    seasonal_bianca_bday:{
        id: 'seasonal_bianca_bday',
        name: 'biancaBday',
        label: '🦄 Cumple Bianca',
        hidden: true,
        type: 'theme',
        bodyBg: 'bg-black',
        rawBg: 'radial-gradient(circle at top right, #4c1d95, #000)',
        cardBg: 'bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-purple-500/30 border border-purple-500/50',
        primaryText: 'text-purple-400',
        secondaryText: 'text-pink-300',
        accentText: 'text-pink-400 font-bold animate-pulse',
        inputBorder: 'border-gray-700 focus:border-purple-500 bg-gray-800',
        shopSelectBorder: 'border-pink-400',
        buttonAction: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(192,132,252,0.5)]',
        buttonAdd: 'bg-red-600 hover:bg-red-700 text-white',
        modalBg: 'bg-gray-900 border-pink-500',
        activeEffects: ['mickey_confetti']
    },

    seasonal_party: {
        id: 'seasonal_party',
        name: 'party',
        label: '🎉 Cumpleaños',
        hidden: true,
        type: 'theme',
        bodyBg: 'bg-slate-900',
        cardBg: 'bg-gray-900/80 backdrop-blur-sm border border-fuchsia-500/30',
        primaryText: 'text-fuchsia-400',
        secondaryText: 'text-gray-200',
        accentText: 'text-cyan-400 font-bold',
        inputBorder: 'border-gray-600 focus:border-fuchsia-500 bg-gray-800',
        shopSelectBorder: 'border-cyan-500',
        buttonAction: 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white',
        buttonAdd: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
        modalBg: 'bg-gray-900 border-fuchsia-500',
        activeEffects: ['mickey_confetti']
    },

    // =========================================================================
    // 2. TEMAS DE MERCADO
    // =========================================================================
    
    default: {
        id: 'default',
        name: 'default',
        label: '🔵 Default Nexus',
        type: 'theme',
        price: 0,
        bodyBg: 'bg-gradient-to-b from-slate-900 via-[#0f172a] to-[#020617]',
        cardBg: 'bg-slate-800/95 backdrop-blur-sm border border-slate-700 shadow-xl',
        primaryText: 'text-slate-100 tracking-wide',
        secondaryText: 'text-slate-400',
        accentText: 'text-blue-400 font-semibold drop-shadow-sm',
        inputBorder: 'border-slate-600 focus:border-blue-500 bg-slate-950/50',
        shopSelectBorder: 'border-blue-500/30',
        buttonAction: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md border border-blue-500/20',
        buttonAdd: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md',
        modalBg: 'bg-slate-900 border-slate-700',
        activeEffects: [] 
    },

  lofi: {
        id: 'lofi',
        name: 'lofi',
        label: '🎧 Lofi Chill',
        type: 'theme',
        price: 500,
        bodyBg: 'bg-black',
        cardBg: 'bg-[#1a120e]/85 backdrop-blur-xl border border-[#d1c4e9]/30 shadow-2xl',
        primaryText: 'text-[#efebe9]', 
        secondaryText: 'text-[#a1887f]',
        accentText: 'text-[#d1c4e9] font-bold',
        inputBorder: 'border-[#5d4037] bg-[#3e2723]/50', 
        shopSelectBorder: 'border-[#d1c4e9]/40',
        buttonAction: 'bg-[#3e2723] hover:bg-[#4e342e] text-[#efebe9] border border-[#d1c4e9]/30',
        buttonAdd: 'bg-[#d97706] text-white',
        modalBg: 'bg-[#1a120e] border-[#d1c4e9]/40',
        
        // ✨ AQUÍ ESTÁ EL CAMBIO: AMBOS EFECTOS ACTIVOS ✨
        activeEffects: ['lofi_notes', 'cozy_lights', 'rain']
  },

// ✅ NEON CITY: Sin URL externa, usa el generador de código
    neon: {
        id: 'neon',
        name: 'neon', 
        label: '🌃 Neon Metropolis',
        type: 'theme',
        price: 650,
        bodyBg: 'bg-black', // Fallback
        rawBg: null, // ¡YA NO USAMOS IMÁGENES ROTAS!
        
        cardBg: 'bg-black/80 backdrop-blur-xl border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.4)]',
        primaryText: 'text-cyan-400 font-mono tracking-widest uppercase',
        secondaryText: 'text-fuchsia-400',
        accentText: 'text-yellow-300 font-bold',
        inputBorder: 'border-cyan-600 bg-slate-900/90',
        shopSelectBorder: 'border-cyan-500',
        buttonAction: 'bg-cyan-700 hover:bg-cyan-600 text-white border border-cyan-400',
        buttonAdd: 'bg-fuchsia-700 hover:bg-fuchsia-600 text-white',
        modalBg: 'bg-slate-900 border-2 border-cyan-500',
        
        // ACTIVAMOS EL FONDO GENERADO + LA LLUVIA
        activeEffects: ['neon_grid', 'rain'] 
    },

    // ✅ NEKO TOKYO: Sin URL externa, usa el generador de código
    neko: {
        id: 'neko',
        name: 'neko',
        label: '😺 Neko Cafe',
        type: 'theme',
        price: 600,
        bodyBg: 'bg-pink-50',
        rawBg: null, // ¡YA NO USAMOS IMÁGENES ROTAS!
        
        cardBg: 'bg-white/60 backdrop-blur-xl border-4 border-pink-300 shadow-xl rounded-[2rem]',
        primaryText: 'text-pink-600 font-sans font-bold',
        secondaryText: 'text-orange-400',
        accentText: 'text-pink-500 font-bold',
        inputBorder: 'border-pink-300 bg-white/80 rounded-xl',
        shopSelectBorder: 'border-pink-400',
        buttonAction: 'bg-gradient-to-r from-pink-400 to-orange-300 text-white rounded-full shadow-lg',
        buttonAdd: 'bg-pink-500 text-white rounded-full',
        modalBg: 'bg-pink-50 border-pink-300',
        
        customCss: `body { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23f472b6" stroke="white" stroke-width="2"><path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2M7 5C5.9 5 5 5.9 5 7C5 8.1 5.9 9 7 9C8.1 9 9 8.1 9 7C9 5.9 8.1 5 7 5M17 5C15.9 5 15 5.9 15 7C15 8.1 15.9 9 17 9C18.1 9 19 8.1 19 7C19 5.9 18.1 5 17 5M12 8C9.5 8 7.3 9.3 6.1 11.4C5.5 12.4 6.2 13.7 7.3 13.9L8.5 14.1C9.6 14.3 10.7 14.3 11.8 14.1L16.5 13.2C17.7 13 18.5 11.9 18.1 10.8C17.3 9.2 14.9 8 12 8Z"/></svg>') 16 16, auto !important; }`,
        
        // ACTIVAMOS EL FONDO GENERADO + CORAZONES
        activeEffects: ['neko_pattern', 'valentine_hearts'] 
    },
    winter: {
        id: 'winter',
        name: 'winter',
        label: '❄️ Winter',
        type: 'theme',
        price: 200,
        bodyBg: 'bg-black',
        rawBg: 'linear-gradient(to bottom, #020617 0%, #0f172a 60%, #1e3a8a 100%)',
        cardBg: 'bg-slate-900/50 backdrop-blur-lg border border-cyan-200/20 shadow-[0_0_30px_rgba(165,243,252,0.15)]',
        primaryText: 'text-cyan-50', secondaryText: 'text-blue-200',
        accentText: 'text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]',
        inputBorder: 'border-blue-400/30', shopSelectBorder: 'border-cyan-400/50',
        buttonAction: 'bg-cyan-900/80 hover:bg-cyan-800 text-white border border-cyan-500/40',
        buttonAdd: 'bg-blue-700 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]',
        modalBg: 'bg-slate-900 border-cyan-500',
        activeEffects: ['snow_effect'] 
    },

    crimson: {
        id: 'crimson',
        name: 'crimson',
        label: '🩸 Crimson',
        type: 'theme',
        price: 250,
        bodyBg: 'bg-black',
        rawBg: 'radial-gradient(circle, transparent 0%, #000000 80%), linear-gradient(to bottom, #450a0a 0%, #000000 100%)',
        cardBg: 'bg-red-950/30 backdrop-blur-md border border-red-800/60 shadow-[0_0_40px_rgba(185,28,28,0.3)]',
        primaryText: 'text-red-100 font-serif tracking-wide', secondaryText: 'text-red-400',
        accentText: 'text-red-600 font-bold drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]',
        inputBorder: 'border-red-900/60', shopSelectBorder: 'border-red-500/40',
        buttonAction: 'bg-red-950 hover:bg-red-900 text-white border border-red-800',
        buttonAdd: 'bg-red-800 hover:bg-red-700 text-white shadow-lg',
        modalBg: 'bg-black border-red-900',
        activeEffects: ['mystic_fog']
    },

    royal: {
        id: 'royal',
        name: 'royal',
        label: '👑 Royal',
        type: 'theme',
        price: 500,
        bodyBg: 'bg-black',
        rawBg: 'radial-gradient(ellipse at center, #713f12 0%, #312e81 40%, #020617 100%)',
        cardBg: 'bg-indigo-950/60 backdrop-blur-xl border-2 border-yellow-500/70 shadow-[0_0_50px_rgba(234,179,8,0.4)]',
        primaryText: 'text-indigo-50 font-serif', secondaryText: 'text-yellow-200/60',
        accentText: 'text-yellow-400 font-bold uppercase tracking-widest',
        inputBorder: 'border-yellow-600/50', shopSelectBorder: 'border-yellow-400',
        buttonAction: 'bg-indigo-900 hover:bg-indigo-800 text-yellow-100 border border-yellow-600',
        buttonAdd: 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white border border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]',
        modalBg: 'bg-indigo-950 border-yellow-500',
        activeEffects: ['golden_dust']
    },
    
    forest: {
        id: 'forest',
        name: 'forest',
        label: '🌲 Forest',
        type: 'theme',
        price: 150,
        bodyBg: 'bg-black',
        rawBg: 'linear-gradient(180deg, #052e16 0%, #020617 100%)',
        cardBg: 'bg-[#064e3b]/40 backdrop-blur-sm border border-green-700/50 shadow-2xl',
        primaryText: 'text-emerald-100', secondaryText: 'text-emerald-500',
        accentText: 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]',
        inputBorder: 'border-green-800', shopSelectBorder: 'border-green-500/40',
        buttonAction: 'bg-green-900 hover:bg-green-800 text-white border border-green-700',
        buttonAdd: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg',
        modalBg: 'bg-gray-900 border-green-800',
        activeEffects: ['mystic_fog', 'forest_flora'] 
    },
    
    galaxy: {
        id: 'galaxy',
        name: 'galaxy',
        label: '🌌 Galaxy',
        type: 'theme',
        price: 300,
        bodyBg: 'bg-black',
        rawBg: 'radial-gradient(circle at 20% 10%, #4c1d95 0%, #000000 40%), radial-gradient(circle at 80% 90%, #1e3a8a 0%, #000000 40%), linear-gradient(to bottom, #020617, #000000)',
        cardBg: 'bg-[#0f172a]/70 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_50px_rgba(124,58,237,0.2)]',
        primaryText: 'text-purple-50 tracking-wide',
        secondaryText: 'text-blue-200/70',
        accentText: 'text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
        inputBorder: 'border-purple-800/60 focus:border-cyan-400',
        shopSelectBorder: 'border-cyan-500/50',
        buttonAction: 'bg-indigo-900/80 hover:bg-indigo-800 text-cyan-50 border border-indigo-500',
        buttonAdd: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]',
        modalBg: 'bg-[#020617] border-purple-500/40',
        activeEffects: ['mystic_fog', 'shooting_stars']
    }, 

   

    // =========================================================================
    // 3. MARCOS (BORDERS)
    // =========================================================================
    border_default: {
        id: 'border_default',
        type: 'border',
        label: 'Sin Borde',
        borderClass: '', // Clase vacía = sin borde
    },
    
   border_blue: {
        id: 'border_blue',
        type: 'border',
        label: '🔵 Azul Eléctrico',
        price: 200, 
        // Usamos customCss con !important para garantizar que se vea encima de cualquier tema
        customCss: `
            .app-card { 
                border: 4px solid #3b82f6 !important; 
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.6) !important;
            }
        `
    },

    border_red: {
        id: 'border_red',
        type: 'border',
        label: '🔴 Rojo Pasión',
        price: 200,
        customCss: `
            .app-card { 
                border: 4px solid #ef4444 !important; 
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
            }
        `
    },

    border_green: {
        id: 'border_green',
        type: 'border',
        label: '🟢 Verde Matrix',
        price: 200,
        customCss: `
            .app-card { 
                border: 4px solid #22c55e !important; 
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.6) !important;
            }
        `
    },

    border_neon: { 
        id: 'border_neon',
        type: 'border',
        label: '⚡ Ultra Neón',
        borderClass: 'border-[3px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]',
        customCss: `
            .app-card { animation: border-pulse-neon 2s infinite alternate; }
            @keyframes border-pulse-neon {
                0% { box-shadow: 0 0 10px #06b6d4, inset 0 0 5px #06b6d4; border-color: #06b6d4; }
                100% { box-shadow: 0 0 25px #d946ef, inset 0 0 10px #d946ef; border-color: #d946ef; }
            }
        `
    },
    
    // ✅ CORRECCIÓN DE RGB: Quitamos pseudo-elementos bloqueantes. Usamos border-image directo.
    border_rgb: {
        id: 'border_rgb',
        type: 'border',
        label: '🌈 RGB Gamer',
        borderClass: 'border-[5px] border-transparent',
        customCss: `
            .app-card {
                border-image: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000) 1;
                /* Sin animaciones locas que muevan el DOM */
            }
        `
    },
    border_glitch: {
        id: 'border_glitch',
        type: 'border',
        label: '👾 Cyber Glitch',
        borderClass: 'border-2 border-white',
        customCss: `
            .app-card { animation: glitch-border 3s infinite; box-shadow: 5px 0 0 #ff00ff, -5px 0 0 #00ffff; }
            @keyframes glitch-border {
                0% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
                100% { transform: translate(0); }
            }
        `
    },
    border_electric: {
        id: 'border_electric',
        type: 'border',
        label: '⚡ Electro Shock',
        borderClass: 'border-2 border-yellow-300',
        customCss: `
            .app-card { animation: shock-border 0.5s infinite alternate; }
            @keyframes shock-border {
                0% { box-shadow: 0 0 5px #facc15, 0 0 10px #3b82f6; border-color: #facc15; }
                100% { box-shadow: 0 0 20px #3b82f6, 0 0 40px #facc15; border-color: #ffffff; }
            }
        `
    },
    border_fire: {
        id: 'border_fire',
        type: 'border',
        label: '🔥 Fuego Místico',
        borderClass: 'border-4 border-orange-500',
        customCss: `
            .app-card { box-shadow: 0 -5px 20px rgba(239, 68, 68, 0.8), 0 0 10px rgba(249, 115, 22, 0.8) inset; animation: fire-pulse 2s infinite alternate; }
            @keyframes fire-pulse { 0% { border-color: #ef4444; } 100% { border-color: #f97316; } }
        `
    },

    border_gold: {
        id: 'border_gold',
        type: 'border',
        label: '👑 Marco de Oro',
        price: 2500,
        borderClass: 'border-[8px] border-double border-yellow-500 shadow-[inset_0_0_20px_rgba(234,179,8,0.3)]',
        customCss: `
            .app-card { 
                border-image: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c) 1; 
                border-width: 6px; 
                border-style: solid; 
            }
        `
    },

    border_wood: {
        id: 'border_wood',
        type: 'border',
        label: '🪵 Marco Rústico',
        borderClass: 'border-[12px] border-[#5c3a21] shadow-2xl',
        customCss: `
            .app-card { 
                border-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png") 30 round;
                border-radius: 0 !important; 
                box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 5px 5px 15px rgba(0,0,0,0.5);
            }
        `
    }
};