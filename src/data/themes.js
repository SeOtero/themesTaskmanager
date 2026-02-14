export const THEMES = {

    // 1. SAN VALENTÍN (Actualizado)
    // 1. SAN VALENTÍN (CORREGIDO: Fondo Infinito)
    seasonal_valentines: {
        id: 'seasonal_valentines',
        name: 'valentines',
        label: '💘 San Valentín',
        hidden: true,
        
        bodyBg: 'bg-pink-950', // Fallback
        
        // ✅ SOLUCIÓN: Movemos el fondo aquí para que el sistema lo fije y estire automáticamente
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
        
        // Dejamos solo el cursor aquí
        customCss: `
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ec4899" stroke="white" stroke-width="1.5" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 0 0, auto !important;
        `,
        
        activeEffects: ['valentine_hearts']
    },

    // 2. HALLOWEEN (Octubre)
    seasonal_halloween: {
        
        name: 'halloween',
        label: '🎃 Halloween',
        hidden: true,
        
        bodyBg: 'bg-gray-950',
        cardBg: 'bg-[#0a0a0a] shadow-2xl border border-orange-600/50',
        primaryText: 'text-orange-500',
        secondaryText: 'text-gray-400',
        accentText: 'text-yellow-400 font-bold tracking-widest',
        
        inputBorder: 'border-gray-700 focus:border-orange-500 bg-gray-900',
        shopSelectBorder: 'border-orange-500',
        
        buttonAction: 'bg-purple-700 hover:bg-purple-800 text-white border border-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.4)]',
        buttonAdd: 'bg-orange-600 hover:bg-orange-700 text-white',
        modalBg: 'bg-gray-900 border-orange-600',
        
        customCss: `
            background-image: repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 10px, #0f0f0f 10px, #0f0f0f 20px);
            @keyframes subtle-container-glow { 0%, 100% { box-shadow: 0 0 15px rgba(255, 140, 0, 0.4), 0 0 5px rgba(128, 0, 128, 0.2); } 50% { box-shadow: 0 0 25px rgba(255, 165, 0, 0.7), 0 0 10px rgba(255, 215, 0, 0.5); } }
            .glow-card { animation: subtle-container-glow 6s infinite ease-in-out alternate; }
        `,
        activeEffects: ['ghost', 'spiderweb'] 
    },

    // 3. NAVIDAD (Diciembre)
    seasonal_christmas: {
        
        name: 'christmas',
        label: '🎄 Navidad',
        hidden: true,
        
        bodyBg: 'bg-red-950',
        cardBg: 'bg-green-900/90 backdrop-blur-sm border border-yellow-400/30',
        primaryText: 'text-white',
        secondaryText: 'text-gray-200',
        accentText: 'text-yellow-300 font-bold',
        
        inputBorder: 'border-red-400 focus:border-yellow-300 bg-red-900/50',
        shopSelectBorder: 'border-yellow-400',
        
        buttonAction: 'bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold shadow-lg',
        buttonAdd: 'bg-red-600 hover:bg-red-700 text-white',
        modalBg: 'bg-green-900 border-yellow-400',
        
        customCss: `background-image: linear-gradient(to bottom, #1e3a8a, #111827);`, 
        activeEffects: ['snow', 'lights'] 
    },

    // 4. CUMPLEAÑOS BIANCA (18 Dic - Unicornios)
    seasonal_bianca_bday:{
        
        name: 'biancaBday',
        label: '🦄 Cumple Bianca',
        hidden: true,
        
        bodyBg: 'bg-black',
        cardBg: 'bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-purple-500/30 border border-purple-500/50',
        primaryText: 'text-purple-400',
        secondaryText: 'text-pink-300',
        accentText: 'text-pink-400 font-bold animate-pulse',
        
        inputBorder: 'border-gray-700 focus:border-purple-500 bg-gray-800',
        shopSelectBorder: 'border-pink-400',
        
        buttonAction: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(192,132,252,0.5)]',
        buttonAdd: 'bg-red-600 hover:bg-red-700 text-white',
        modalBg: 'bg-gray-900 border-pink-500',
        
        customCss: `
            background-image: radial-gradient(circle at top right, #4c1d95, #000);
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text y="20" font-size="20">🦄</text></svg>') 12 12, auto !important;
            @keyframes party-glow { 0%, 100% { box-shadow: 0 0 20px rgba(217, 70, 239, 0.5); } 50% { box-shadow: 0 0 30px rgba(244, 63, 94, 0.7); } }
            .glow-card { animation: party-glow 5s infinite ease-in-out alternate; }
        `,
        activeEffects: ['mickey_confetti'] // Reutilizamos el confeti o creamos uno de magia
    },

    // 5. CUMPLEAÑOS GENÉRICO (Resto del equipo)
    seasonal_party: {

        name: 'party',
        label: '🎉 Cumpleaños',
        hidden: true,
        
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
        
        activeEffects: ['mickey_confetti'] // Usamos confeti genérico
    },
    
   // --- DEFAULT (REMASTERIZADO: PRO DARK MODE) ---
    default: {
        name: 'default',
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

    // --- LOFIDEX (Mystic Cafe) ---
    lofi: {
        name: 'lofi',
        bodyBg: 'bg-black',
        rawBg: 'radial-gradient(circle at 50% -10%, #5d4037 0%, #2d1b16 40%, #000000 100%)',
        cardBg: 'bg-[#1a120e]/80 backdrop-blur-xl border border-[#d1c4e9]/20 shadow-2xl',
        primaryText: 'text-[#efebe9] font-mono tracking-wide', secondaryText: 'text-[#a1887f]',
        accentText: 'text-[#d1c4e9] font-bold drop-shadow-[0_0_15px_rgba(209,196,233,0.5)]',
        inputBorder: 'border-[#5d4037] focus:border-[#d1c4e9]', shopSelectBorder: 'border-[#d1c4e9]/40',
        buttonAction: 'bg-[#3e2723] hover:bg-[#4e342e] text-[#efebe9] border border-[#d1c4e9]/30',
        buttonAdd: 'bg-gradient-to-r from-[#d97706] to-[#8d6e63] hover:from-[#b45309] hover:to-[#6d4c41] text-white shadow-lg',
        modalBg: 'bg-[#1a120e] border-[#d1c4e9]/40',
        activeEffects: ['rain', 'cozy_lights', 'mystic_fog', 'lofi_notes']
    },

    // --- WINTER (Aurora Polar) ---
    winter: {
        name: 'winter',
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

    // --- CRIMSON (Vampire Lord) ---
    crimson: {
        name: 'crimson',
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

    // --- ROYAL (Treasury) ---
    royal: {
        name: 'royal',
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
    
     // --- FOREST (Deep Woods) ---
    forest: {
        name: 'forest',
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
    
    // --- NEON CITY ---
    neon: {
        name: 'neon',
        bodyBg: 'bg-black',
        rawBg: 'conic-gradient(from 0deg at 50% 50%, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        cardBg: 'bg-gray-900/80 backdrop-blur-md border border-cyan-500/30',
        primaryText: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]',
        secondaryText: 'text-purple-400',
        accentText: 'text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]',
        inputBorder: 'border-cyan-800',
        shopSelectBorder: 'border-pink-500/50',
        buttonAction: 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]',
        buttonAdd: 'bg-purple-700 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]',
        modalBg: 'bg-black/90 border-cyan-500',
        activeEffects: ['rain'] 
    },

    // --- COSMIC VOYAGER (GALAXIA) ---
    galaxy: {
        name: 'galaxy',
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

   // --- NEKO TOKYO (CORREGIDO) ---
    neko: {
        name: 'neko',
        // Usamos esta clase para que el CSS controle el fondo
        bodyBg: 'theme-neko', 
        
        // 🔥 IMPORTANTE: Debe ser NULL para que no tape el CSS
        rawBg: null,
        
        cardBg: 'bg-[#1a0b2e]/80 backdrop-blur-xl border border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.4)]',
        primaryText: 'text-pink-50 font-sans tracking-wide drop-shadow-md',
        secondaryText: 'text-purple-300',
        accentText: 'text-pink-400 font-bold drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]',
        inputBorder: 'border-pink-500/40 focus:border-pink-400 bg-black/40',
        shopSelectBorder: 'border-pink-500/60',
        buttonAction: 'bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.6)]',
        buttonAdd: 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-400 shadow-lg',
        modalBg: 'bg-[#120520] border-pink-500',
        activeEffects: ['rain'] 
    }
};