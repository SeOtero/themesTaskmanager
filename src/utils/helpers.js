// src/utils/helpers.js

export const formatTime = (ms) => {
    if (ms < 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

export const parseTimeStringToMs = (timeStr) => {
    if (!timeStr) return 0;
    let hours = 0, minutes = 0, seconds = 0;
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 3) { [hours, minutes, seconds] = parts; }
        else if (parts.length === 2) { [hours, minutes] = parts; }
    } else {
        minutes = parseInt(timeStr) || 0;
    }
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

export const getTodayID = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

export const getWeeklyHours = (reports) => {
    if (!reports || reports.length === 0) return 0;
    const now = new Date();
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    return reports.reduce((acc, r) => {
        const [y, m, d] = r.id.split('-').map(Number);
        const rDate = new Date(y, m - 1, d);
        if (rDate >= startOfWeek) {
            return acc + parseHoursFromReport(r.content);
        }
        return acc;
    }, 0);
};

export const parseHoursFromReport = (content) => {
    if (!content) return 0;
    const match = content.match(/Hours worked: (\d+)h (\d+)m/) || content.match(/Tiempo Total: (\d+)h (\d+)m/);
    if (match) {
        const h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        return h + (m / 60);
    }
    return 0;
};



// --- UTILIDADES DE FECHA (ISO 8601 STANDARDIZED) ---
const getISOWeekId = (offsetWeeks = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + (offsetWeeks * 7));
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

export const getCurrentWeekID = () => {
    return getISOWeekId(0);
};

export const getNextWeekID = () => {
    return getISOWeekId(1);
};
// ---------------------------------------------------

export const generateEODRContent = (tasks, dateStr, themeName) => {
    let content = `REPORTE DIARIO - ${dateStr}\n--------------------------------\n`;
    
    const totalTimeMs = tasks.reduce((acc, t) => acc + (t.running ? t.elapsedTime + (Date.now() - t.lastTime) : t.elapsedTime), 0);
    const totalSeconds = Math.floor(totalTimeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    const totalTasks = tasks.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    const speed = (totalTimeMs > 0) ? (totalTasks / (totalTimeMs / 3600000)).toFixed(2) : "0.00";

    content += `Total Tareas: ${totalTasks}\n`;
    content += `Tiempo Total: ${hours}h ${minutes}m\n`;
    content += `Velocidad: ${speed} tareas/h\n\n`;
    content += `DETALLE:\n`;

    tasks.forEach(t => {
        const tMs = t.running ? t.elapsedTime + (Date.now() - t.lastTime) : t.elapsedTime;
        const tH = Math.floor(tMs / 3600000);
        const tM = Math.floor((tMs % 3600000) / 60000);
        const emoji = themeName === 'lofi' ? '☕' : '•';
        content += `${emoji} ${t.rawTaskName || t.text} (${t.quantity || 0}): ${tH}h ${tM}m\n`;
    });

    return content;
};