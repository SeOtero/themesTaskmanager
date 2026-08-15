// src/utils/logger.js
//
// Logger centralizado. En producción (npm run build) no imprime nada en la
// consola del navegador del usuario final; en desarrollo (npm run dev) se
// comporta igual que console.*. Reemplaza los console.log/error/warn sueltos
// que había repartidos por varios archivos.
//
// Uso:
//   import { logger } from '../utils/logger';
//   logger.error('Error guardando wallet:', error);

const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args) => { if (isDev) console.log(...args); },
    warn: (...args) => { if (isDev) console.warn(...args); },
    // Los errores SÍ se reportan siempre (útiles para depurar en producción vía
    // las devtools del usuario, y punto de enganche fácil para Sentry/LogRocket
    // en el futuro: basta con agregar el envío aquí).
    error: (...args) => { console.error(...args); },
};
