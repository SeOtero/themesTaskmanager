// src/utils/toast.js
//
// API imperativa para notificaciones no-bloqueantes, en reemplazo de los
// alert() nativos que había en la app (que congelan el hilo del navegador y
// se ven anticuados). Funciona por eventos de DOM para poder llamarse desde
// cualquier archivo (hooks, servicios) sin necesidad de Context/Provider.
//
// Uso:
//   import { showToast } from '../utils/toast';
//   showToast('¡Guardado correctamente!');
//   showToast('Algo salió mal', 'error');
//   showToast('Ganaste 50 monedas', 'success');
//
// <ToastContainer /> (montado una vez en la app) escucha estos eventos y
// renderiza las notificaciones apiladas en la esquina de la pantalla.

const TOAST_EVENT = 'nexusos:toast';
let idCounter = 0;

/**
 * @param {string} message - Texto a mostrar (soporta \n para múltiples líneas).
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {number} durationMs - tiempo antes de auto-ocultarse.
 */
export const showToast = (message, type = 'info', durationMs = 4000) => {
    const id = ++idCounter;
    window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, { detail: { id, message, type, durationMs } })
    );
    return id;
};

export const TOAST_EVENT_NAME = TOAST_EVENT;
