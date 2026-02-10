export const MARKET_ITEMS = [
    // --- TEMAS (Tier 3 & 4: El objetivo principal) ---
    // Estrategia: Los temas cambian toda la app, deben ser caros.
    { id: 'default', name: 'Concepto: Original', description: 'La experiencia base. Diseño limpio.', price: 0, category: 'theme', icon: '🌑' },
    
    // Tier 3: Accesibles con 1.5 semanas de trabajo (500 - 600 coins)
    { id: 'lofi', name: 'Concepto: Mystic Cafe', description: 'Atmósfera mística. Lluvia, niebla y luces vivas.', price: 500, category: 'theme', icon: '☕' },
    { id: 'winter', name: 'Concepto: Winter Frost', description: 'Aurora polar y nieve eterna.', price: 500, category: 'theme', icon: '❄️' },
    { id: 'forest', name: 'Concepto: Deep Woods', description: 'Bosque antiguo y denso.', price: 500, category: 'theme', icon: '🌲' },
    { id: 'crimson', name: 'Concepto: Vampire Lord', description: 'Elegancia gótica. Rojo sangre y niebla.', price: 600, category: 'theme', icon: '🍷' },
    { id: 'neko', name: 'Concepto: Neko Tokyo', description: 'Estilo Cartoon Pop felino.', price: 600, category: 'theme', icon: '😸' },
    { id: 'neon', name: 'Concepto: Cyber City', description: 'Inmersión total en neón futurista.', price: 650, category: 'theme', icon: '🌃' },

    // Tier 4: Exclusivos para veteranos (+3 semanas de ahorro)
    { id: 'galaxy', name: 'Concepto: Cosmic Voyager', description: 'Viaje interestelar. Nebulosas y vacío.', price: 1500, category: 'theme', icon: '🚀' },
    { id: 'royal', name: 'Concepto: Royal Treasury', description: 'Oro, púrpura imperial y riqueza.', price: 2000, category: 'theme', icon: '👑' },

    // --- MARCOS (Tier 1, 2 & 4) ---
    // Tier 1: "Caprichos baratos" (1 día de trabajo - 50 coins)
    { id: 'border_blue', name: 'Azul Eléctrico', description: 'Azul intenso.', price: 50, category: 'border', icon: '🔵' },
    { id: 'border_red', name: 'Rojo Pasión', description: 'Rojo intenso.', price: 50, category: 'border', icon: '🔴' },
    { id: 'border_green', name: 'Verde Matrix', description: 'Verde digital.', price: 50, category: 'border', icon: '🟢' },

    // Tier 2: Animados y Cool (3-4 días - 200-300 coins)
    { id: 'border_neon', name: 'Ultra Neón', description: 'Resplandor pulsante.', price: 200, category: 'border', icon: '🔮' },
    { id: 'border_rgb', name: 'RGB Gamer', description: 'Luces LED animadas.', price: 250, category: 'border', icon: '🌈' },
    { id: 'border_glitch', name: 'Cyber Glitch', description: 'Error digital.', price: 250, category: 'border', icon: '👾' },
    { id: 'border_electric', name: 'Electro Shock', description: 'Alto voltaje inestable.', price: 300, category: 'border', icon: '⚡' },
    { id: 'border_fire', name: 'Fuego Místico', description: 'Llamas animadas.', price: 350, category: 'border', icon: '🔥' },

    // Tier 4: Status Symbol (Muy caro)
    { id: 'border_gold', name: 'Marco de Oro', description: 'Oro sólido. Solo para el Top 1%.', price: 2500, category: 'border', icon: '👑' },

    // --- EFECTOS (Tier 2 & 3) ---
    // Tier 1.5: Efectos de entrada (100-200 coins)
    { id: 'rain', name: 'Lluvia', description: 'Capa de lluvia suave.', price: 100, category: 'effect', icon: '🌧️' },
    { id: 'snow_effect', name: 'Nieve', description: 'Nevada invernal.', price: 150, category: 'effect', icon: '❄️' },
    
    // Tier 2: Efectos ambientales (300-400 coins)
    { id: 'lofi_notes', name: 'Notas Musicales', description: 'Melodía visual flotante.', price: 300, category: 'effect', icon: '🎵' },
    { id: 'forest_flora', name: 'Bosque Vivo', description: 'Luciérnagas y hojas cayendo.', price: 350, category: 'effect', icon: '🍃' },
    { id: 'cozy_lights', name: 'Luces Cozy', description: 'Orbes cálidos y mágicos.', price: 400, category: 'effect', icon: '💡' },
    
    // Tier 3: Efectos complejos (High Value)
    { id: 'mystic_fog', name: 'Niebla Mística', description: 'Bruma densa y misteriosa.', price: 600, category: 'effect', icon: '🌫️' },
    { id: 'shooting_stars', name: 'Lluvia de Estrellas', description: 'Meteoritos cruzando el cielo.', price: 800, category: 'effect', icon: '🌠' },
    
    // Tier 4: Legendarios
    { id: 'golden_dust', name: 'Polvo de Oro', description: 'Partículas de riqueza flotante.', price: 1000, category: 'effect', icon: '✨' },
    { id: 'matrix_effect', name: 'Matrix Code', description: 'El código fuente real.', price: 1200, category: 'effect', icon: '💻' },
];