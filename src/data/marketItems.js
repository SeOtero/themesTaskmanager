export const MARKET_ITEMS = [
    // --- TEMAS ---
    { id: 'default', name: 'Concepto: Original', description: 'La experiencia base. Diseño limpio.', price: 0, category: 'theme', icon: '🌑' },
    { id: 'lofi', name: 'Concepto: LOFIDEX Cafe', description: 'Atmósfera mística. Lluvia, niebla y luces vivas.', price: 500, category: 'theme', icon: '☕' },
    { id: 'winter', name: 'Concepto: Winter Frost', description: 'Aurora polar y nieve eterna.', price: 500, category: 'theme', icon: '❄️' },
    { id: 'forest', name: 'Concepto: Deep Woods', description: 'Bosque antiguo y denso.', price: 500, category: 'theme', icon: '🌲' },
    { id: 'crimson', name: 'Concepto: Vampire Lord', description: 'Elegancia gótica. Rojo sangre y niebla.', price: 600, category: 'theme', icon: '🍷' },
    { id: 'neko', name: 'Concepto: Neko Tokyo', description: 'Estilo Cartoon Pop felino.', price: 600, category: 'theme', icon: '😸' },
    { id: 'neon', name: 'Concepto: Neon City', description: 'Cyberpunk lluvioso.', price: 650, category: 'theme', icon: '🌃' },
    { id: 'royal', name: 'Concepto: Royal Treasury', description: 'Oro puro. Lujo extremo.', price: 2000, category: 'theme', icon: '👑' },
    { 
        id: 'beach', 
        name: 'Lanterns: Fuego', 
        description: 'Pasión carmesí y linternas cálidas.', 
        price: 1200, 
        category: 'theme', 
        icon: '🔥' 
    },
    { 
        id: 'beach_night', 
        name: 'Lanterns: Místico', 
        description: 'Magia nocturna y luces violetas.', 
        price: 1200, 
        category: 'theme', 
        icon: '🔮' 
    },
    { 
        id: 'beach_spirit', 
        name: 'Lanterns: Zen', 
        description: 'Paz natural y orbes espirituales.', 
        price: 1200, 
        category: 'theme', 
        icon: '🍃' 
    },
    { id: 'galaxy', name: 'Concepto: Cosmic Voyager', description: 'Viaje interestelar.', price: 1500, category: 'theme', icon: '🌌' },

    // --- MARCOS (BORDERS) ---
    // ✅ NUEVO: Borde Default (Gratis)
    { id: 'border_default', name: 'Sin Borde', description: 'Limpieza total.', price: 0, category: 'border', icon: '⬜' },
    
    // Tier 1
    { id: 'border_blue', name: 'Borde Eléctrico', description: 'Energía azul pura.', price: 200, category: 'border', icon: '🔵' },
    { id: 'border_red', name: 'Borde Pasión', description: 'Intensidad roja.', price: 200, category: 'border', icon: '🔴' },
    { id: 'border_green', name: 'Borde Matrix', description: 'Código fluyendo.', price: 200, category: 'border', icon: '🟢' },
    
    // ✅ NUEVO: Borde Madera (Agregado a la tienda)
    { id: 'border_wood', name: 'Marco Rústico', description: 'Madera de roble tallada.', price: 300, category: 'border', icon: '🪵' },

    // Tier 2 (Animados)
    { id: 'border_neon', name: 'Ultra Neón', description: 'Pulsos de luz neón.', price: 450, category: 'border', icon: '⚡' },
    { id: 'border_rgb', name: 'RGB Gamer', description: 'Para verdaderos pros.', price: 500, category: 'border', icon: '🌈' },
    { id: 'border_fire', name: 'Fuego Místico', description: 'Arde intensamente.', price: 500, category: 'border', icon: '🔥' },
    { id: 'border_electric', name: 'Alto Voltaje', description: 'Chispas amarillas.', price: 500, category: 'border', icon: '⚠️' },
    { id: 'border_glitch', name: 'Cyber Glitch', description: 'Error en la realidad.', price: 600, category: 'border', icon: '👾' },
    
    // Tier 3
    { id: 'border_gold', name: 'Marco de Rey', description: 'Oro sólido. Top 1%.', price: 2500, category: 'border', icon: '👑' },

    // --- EFECTOS ---
    // ✅ NUEVO: Sin Efecto (Gratis)
    { id: 'effect_none', name: 'Sin Efecto', description: 'Desactiva las partículas.', price: 0, category: 'effect', icon: '🚫' },
    

    // Tier 1.5
    { id: 'rain', name: 'Lluvia', description: 'Capa de lluvia suave.', price: 100, category: 'effect', icon: '🌧️' },
    { id: 'snow_effect', name: 'Nieve', description: 'Nevada invernal.', price: 150, category: 'effect', icon: '❄️' },
    
    // Tier 2
    { id: 'lofi_notes', name: 'Notas Musicales', description: 'Melodía visual flotante.', price: 300, category: 'effect', icon: '🎵' },
    { id: 'forest_flora', name: 'Bosque Vivo', description: 'Luciérnagas y hojas cayendo.', price: 350, category: 'effect', icon: '🍃' },
    { id: 'cozy_lights', name: 'Luces Cozy', description: 'Orbes cálidos y mágicos.', price: 400, category: 'effect', icon: '💡' },
    { id: 'lanterns', name: 'Linternas Flotantes', description: 'Luces cálidas subiendo al cielo.', price: 450, category: 'effect', icon: '🏮' },
    
    // Tier 3
    { id: 'mystic_fog', name: 'Niebla Mística', description: 'Bruma densa y misteriosa.', price: 600, category: 'effect', icon: '🌫️' },
    { id: 'golden_dust', name: 'Polvo Dorado', description: 'Partículas de riqueza.', price: 800, category: 'effect', icon: '✨' },
    { id: 'shooting_stars', name: 'Lluvia de Estrellas', description: 'Pide un deseo.', price: 1000, category: 'effect', icon: '🌠' },
];