// src/utils/reportGenerator.js

/**
 * Genera el reporte de fin de día en formato texto.
 * @param {Array} tasks - Lista de tareas del usuario
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @param {string} themeName - Nombre del tema actual para los iconos
 * @returns {string} El texto formateado del reporte
 */
export const generateCustomReport = (tasks, dateStr, themeName) => {
    
    // 1. Iconos por Tema
    const THEME_ICONS = {
        neko: '🐱', lofi: '☕', winter: '❄️', crimson: '👹', 
        royal: '👑', forest: '🌲', neon: '⚡', galaxy: '🚀', 
        halloween: '🎃', default: '📝'
    };
    const icon = THEME_ICONS[themeName] || '📝';

    // 2. Formato de Fecha Largo
    // Nota: Agregué validación por si dateStr viene vacío o mal
    if (!dateStr) dateStr = new Date().toISOString().split('T')[0];
    
    const [y, m, d] = dateStr.split('-');
    // Aseguramos que sea fecha local correcta (mes base 0 en JS)
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    
    // Opción para inglés (como tenías) o español
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions); 

    // 3. Helper Tiempo interno
    const formatMs = (ms) => {
        if (!ms) return '0h 0m';
        const h = Math.floor(ms / 3600000);
        const min = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${min}m`;
    };

    // 4. Calcular Totales
    let totalMs = 0;
    const groups = {};

    // Procesamos cada tarea
    tasks.forEach(task => {
        // Cálculo de tiempo: Si está corriendo, sumamos el tiempo actual
        let currentElapsed = task.elapsedTime || 0;
        if (task.running && task.lastTime) {
             currentElapsed += (Date.now() - task.lastTime);
        }
        
        totalMs += currentElapsed;

        const shop = task.category || 'General';
        
        // Inicializamos el grupo si no existe
        if (!groups[shop]) groups[shop] = [];
        
        // Agregamos al grupo
        groups[shop].push({
            name: task.rawTaskName || task.text,
            qty: parseInt(task.quantity) || 0,
            timeStr: formatMs(currentElapsed)
        });
    });

    // 5. Construir Reporte Final
    let report = `End of Day Report: ${formattedDate}\n`;
    report += `Hours worked: ${formatMs(totalMs)}\n\n`;
    report += `Today I worked on the following tasks:\n\n`;

    Object.keys(groups).sort().forEach(shopName => {
        report += `--- ${shopName} ---\n`;
        groups[shopName].forEach(item => {
            const qtyPart = item.qty > 0 ? ` (${item.qty} orders)` : '';
            report += `${icon} ${item.name}${qtyPart}: ${item.timeStr}\n`;
        });
        report += '\n'; // Espacio extra entre grupos
    });

    return report;
};