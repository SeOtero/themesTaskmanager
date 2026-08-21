// src/components/ui/HelpModal.jsx
//
// Manual de usuario para agentes: un lugar único donde ver todas las
// funciones disponibles en la app, organizadas por sección. Contenido
// estático (se edita directo en este archivo cuando se agreguen features
// nuevas).
import React, { useState } from 'react';

const SECTIONS = [
    {
        icon: '🎯',
        title: 'Tareas y Cronómetro',
        items: [
            'Elegí una tienda del desplegable y tocá "Agregar Tarea" para crear una tarjeta de tarea.',
            'Cada tarjeta tiene su propio cronómetro: tocá ▶️ para iniciar y ⏸️ para pausar.',
            'El botón "+1" suma una unidad al contador de órdenes de esa tarea.',
            'Podés ordenar tus tareas por tienda o por nombre, y borrarlas todas con "Limpiar Todo".',
            'En la pestaña "Historial" vas a encontrar tus reportes de días anteriores.',
        ],
    },
    {
        icon: '🪙',
        title: 'Lofi Coins y Tienda',
        items: [
            'Ganás Lofi Coins trabajando (bonus por horas) y completando actividades (quizzes, ideas, tablón).',
            'Tu saldo aparece siempre arriba, en el centro de la pantalla.',
            'Abrí la Tienda desde el menú (☰ → 🛒 Tienda) para comprar Temas, Marcos y Efectos visuales.',
        ],
    },
    {
        icon: '🎨',
        title: 'Temas',
        items: [
            'Podés cambiar la apariencia completa de la app desde tu perfil/ajustes una vez que compres o desbloquees un tema.',
            'El tema "Outside The Frame" incluye una radio con estaciones de distintos géneros musicales y una sección especial de "Martes de Misterio" (relatos paranormales) — la vas a encontrar dentro del mismo tema.',
        ],
    },
    {
        icon: '📋',
        title: 'Tablón de Hoy',
        items: [
            'Al entrar a la app, si tu Team Leader cargó recordatorios o tareas para hoy, se abre un tablero para que los vayas tildando.',
            'Si completás TODOS los ítems del día, ganás la medalla 🏅 Flawless y suma un día a tu racha.',
            'Volvé a verlo cuando quieras desde ☰ → 📋 Tablón de Hoy (el número en rojo indica cuántos te quedan pendientes).',
            'Algunos ítems traen un botón de acceso directo (ej: "📅 Cargar" para Disponibilidad) que te lleva derecho a esa pantalla.',
        ],
    },
    {
        icon: '📝',
        title: 'Notas Rápidas',
        items: [
            'Un post-it flotante y arrastrable para anotar cosas mientras trabajás. Podés crear varias notas (pestañas de colores).',
            'Tiene un "Modo Snippets" (🚀): cada renglón de la nota se convierte en un botón que copia ese texto al portapapeles con un solo clic — ideal para respuestas repetidas.',
            'Si no encontrás el botón flotante en la pantalla, abrilo igual desde ☰ → 📝 Notas Rápidas (te lo va a traer de vuelta a un lugar visible).',
        ],
    },
    {
        icon: '🔗',
        title: 'Enlaces Rápidos',
        items: [
            'Accesos directos a páginas web que tu Team Leader considera útiles para todo el equipo.',
            'Se abren desde ☰ → 🔗 Enlaces Rápidos, y cada uno abre en una pestaña nueva del navegador.',
        ],
    },
    {
        icon: '📅',
        title: 'Disponibilidad / Soporte',
        items: [
            'Desde ☰ → 📅 Disponibilidad / Soporte podés enviar tu disponibilidad horaria y pedir soporte.',
            'Revisá los avisos de la marquesina arriba de la pantalla: suelen recordar cuándo hay que enviarla (por ejemplo, los sábados).',
        ],
    },
    {
        icon: '💰',
        title: 'Calculadora de Salario',
        items: [
            'Desde ☰ → 💰 Calculadora de Salario podés estimar tu salario según las horas u órdenes trabajadas.',
        ],
    },
    {
        icon: '💡',
        title: 'Ideas y Bugs',
        items: [
            '☰ → 💡 Ideas del Lunes: para proponer ideas de negocio o mejoras generales.',
            '☰ → 👨‍💻 Bugs / Ideas de la App: para reportar errores técnicos o pedir funciones nuevas de la app en sí.',
        ],
    },
    {
        icon: '🎓',
        title: 'Academia',
        items: [
            'Si tu Team Leader cargó cuestionarios de capacitación, los vas a ver en tu pantalla principal.',
            'Aprobarlos todos te da el estado de "Graduado" — si pasa tiempo sin actualizarlos podés quedar "oxidado" y te conviene repasarlos.',
        ],
    },
    {
        icon: '⚙️',
        title: 'Ajustes',
        items: [
            'Desde ☰ → ⚙️ Ajustes podés configurar tu perfil y preferencias personales.',
        ],
    },
];

const HelpModal = ({ isOpen, onClose }) => {
    const [openIndex, setOpenIndex] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                <div className="p-5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-white font-black text-lg">📖 Manual de Usuario</h2>
                    <p className="text-slate-400 text-xs mt-1">Todo lo que podés hacer en Nexus OS, explicado acá.</p>
                </div>

                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
                    {SECTIONS.map((section, idx) => {
                        const isOpenSection = openIndex === idx;
                        return (
                            <div key={section.title} className="border border-white/10 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenIndex(isOpenSection ? -1 : idx)}
                                    className="w-full flex items-center gap-2 sm:gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors text-left"
                                >
                                    <span className="text-xl flex-shrink-0">{section.icon}</span>
                                    <span className="flex-1 min-w-0 font-bold text-sm text-white break-words">{section.title}</span>
                                    <span className={`flex-shrink-0 text-slate-400 text-xs transition-transform ${isOpenSection ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {isOpenSection && (
                                    <ul className="p-4 pt-2 flex flex-col gap-2 bg-black/20">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="text-slate-300 text-sm flex gap-2">
                                                <span className="text-slate-600 flex-shrink-0">•</span>
                                                <span className="min-w-0 break-words">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
