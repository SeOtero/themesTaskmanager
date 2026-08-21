// src/utils/reportGenerator.js

/**
 * Genera el reporte de fin de día en formato texto limpio (Estilo Foto 2).
 */
export const generateCustomReport = (tasks, dateStr, themeName) => {
    
    // 1. Formato de Fecha
    if (!dateStr) dateStr = new Date().toISOString().split('T')[0];
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    
    // Opción para formato en inglés como en la foto ("Sunday, February 15, 2026")
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions); 

    // 2. Helper de Tiempo (Ej: "1h 8m")
    const formatMs = (ms) => {
        if (!ms) return '0h 0m';
        const h = Math.floor(ms / 3600000);
        const min = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${min}m`;
    };

    // 3. Calcular Totales y Agrupar por Tienda
    let totalMs = 0;
    const groups = {};

    tasks.forEach(task => {
        // Calcular tiempo acumulado real
        let currentElapsed = task.elapsedTime || 0;
        if (task.running && task.lastTime) {
             currentElapsed += (Date.now() - task.lastTime);
        }
        
        totalMs += currentElapsed;

        // 🔥 CORRECCIÓN 1: Prioridad a 'shop', luego 'category', luego 'General'
        const shopName = task.shop || task.category || 'General';
        
        if (!groups[shopName]) groups[shopName] = [];
        
        // Limpiamos el nombre para quitar automáticamente el [Nombre Tienda] si existe
        let rawName = task.text || task.name || "Tarea sin nombre";
        let cleanName = rawName.replace(/\s*\[.*?\]/g, '').trim();

        // Agregamos al grupo
        groups[shopName].push({
            name: cleanName,
            qty: parseInt(task.count || task.quantity) || 0,
            timeStr: formatMs(currentElapsed)
        });
    });

    // 4. Construir Reporte Final
    let report = `End of Day Report: ${formattedDate}\n`;
    report += `Hours worked: ${formatMs(totalMs)}\n\n`;
    report += `Today I worked on the following tasks:\n`; // Quitamos un salto de línea extra para pegar más el contenido

    // Ordenamos las tiendas alfabéticamente
    Object.keys(groups).sort().forEach(shopName => {
        // Separador de Tienda
        report += `--- ${shopName} ---\n`;
        
        groups[shopName].forEach(item => {
            const qtyPart = item.qty > 0 ? ` (${item.qty} orders)` : '';
            // 🔥 CORRECCIÓN 3: Quitamos el icono para que sea texto limpio
            report += `${item.name}${qtyPart}: ${item.timeStr}\n`;
        });
        
        // Espacio entre grupos (opcional, la foto 2 no parece tener mucho espacio)
        // report += '\n'; 
    });

    return report;
};