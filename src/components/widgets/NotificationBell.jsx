import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const NotificationBell = ({ userProfile, onClickAction }) => {
    // 1. Estados de la Interfaz
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 2. Estados de Datos
    const [pendingSchedules, setPendingSchedules] = useState(0);
    const [pendingIdeas, setPendingIdeas] = useState(0);
    const [pendingDev, setPendingDev] = useState(0);

    const role = userProfile?.role || 'agent';
    const isLeaderOrAdmin = role === 'team_leader' || role === 'admin';
    const isAdmin = role === 'admin';

    // Cerrar el menú si el usuario hace clic en otro lado de la pantalla
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Escuchar a Firebase (Solo para líderes y admins por ahora)
    useEffect(() => {
        let unsubSchedules = () => {};
        let unsubIdeas = () => {};
        let unsubDev = () => {};

        if (isLeaderOrAdmin) {
            const teamName = userProfile?.team || "Tema 1";
            
            const qSchedules = isAdmin 
                ? query(collection(db, "schedule_requests"), where("status", "==", "pending")) 
                : query(collection(db, "schedule_requests"), where("status", "==", "pending"), where("team", "==", teamName)); 

            const qIdeas = isAdmin
                ? query(collection(db, "monday_ideas"), where("status", "==", "new"), where("type", "==", "monday")) 
                : query(collection(db, "monday_ideas"), where("status", "==", "new"), where("type", "==", "monday"), where("team", "==", teamName)); 

            unsubSchedules = onSnapshot(qSchedules, (snap) => setPendingSchedules(snap.size));
            unsubIdeas = onSnapshot(qIdeas, (snap) => setPendingIdeas(snap.size));
            
            if (isAdmin) {
                const qDev = query(collection(db, "monday_ideas"), where("status", "==", "new"), where("type", "==", "dev"));
                unsubDev = onSnapshot(qDev, (snap) => setPendingDev(snap.size));
            }
        }

        return () => { unsubSchedules(); unsubIdeas(); unsubDev(); };
    }, [userProfile, isLeaderOrAdmin, isAdmin]);

    const totalNotifications = pendingSchedules + pendingIdeas + pendingDev;

    // Función para cuando hacen clic en una notificación específica
    const handleActionClick = (targetTab) => {
        setIsOpen(false); // Cerramos el menú
        onClickAction(targetTab);  // Ejecutamos la acción (Abrir panel)
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* EL BOTÓN PRINCIPAL */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center h-10 px-3 rounded-lg border backdrop-blur-md transition-all active:scale-95 shadow-sm
                ${totalNotifications > 0 && isLeaderOrAdmin ? 'bg-purple-900/40 hover:bg-purple-600 text-purple-300 hover:text-white border-purple-500/50' : 'bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white border-white/10'}`}
            >
                <span className={`text-lg transition-transform duration-300 ${totalNotifications > 0 ? 'animate-pulse opacity-100' : 'opacity-80'}`}>
                    🔔
                </span>
                
                {/* Ahora todos ven NOTIFICACIONES, se oculta en móviles para no ocupar todo el espacio */}
                <span className="hidden sm:inline-block ml-2 text-xs font-bold tracking-wider">
                    
                </span>

                {totalNotifications > 0 && isLeaderOrAdmin && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border border-[#0f111a] text-white text-[9px] font-bold shadow-lg animate-bounce">
                        {totalNotifications}
                    </span>
                )}
            </button>

            {/* EL MENÚ DESPLEGABLE (Alineado a la derecha) */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-4 w-72 sm:w-80 bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] animate-fadeIn">
                    
                    {/* El piquito tipo flecha apuntando arriba (movido a la derecha) */}
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-[#0f111a] border-t border-l border-white/10 rotate-45"></div>
                    
                    {/* Header del menú */}
                    <div className="relative p-3 border-b border-white/10 bg-slate-800/50">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-center">Centro de Alertas</h4>
                    </div>

                    {/* Contenido Dinámico según el Rol */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar bg-[#0b0e14]">
                        
                        {/* VISTA PARA AGENTES REGULARES */}
                        {!isLeaderOrAdmin ? (
                            <div className="p-6 text-center">
                                <span className="text-3xl block mb-2 opacity-80">🌱</span>
                                <p className="text-sm font-bold text-white mb-1">Todo tranquilo</p>
                                <p className="text-xs text-slate-400">No tienes notificaciones nuevas por el momento.</p>
                            </div>
                        ) : 
                        
                        /* VISTA PARA LÍDERES/ADMINS SIN PENDIENTES */
                        totalNotifications === 0 ? (
                            <div className="p-6 text-center">
                                <span className="text-3xl block mb-2 opacity-80">✨</span>
                                <p className="text-sm font-bold text-white mb-1">¡Al día!</p>
                                <p className="text-xs text-slate-400">No hay tareas pendientes de revisión en tu equipo.</p>
                            </div>
                        ) : 
                        
                        /* VISTA PARA LÍDERES/ADMINS CON PENDIENTES */
                        (
                            <div className="flex flex-col">
                                {pendingSchedules > 0 && (
                                    <button 
                                        onClick={() => handleActionClick('planner')} 
                                        className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left group"
                                    >
                                        <div className="bg-blue-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform"><span className="text-xl">📅</span></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Horarios Pendientes</p>
                                            <p className="text-xs text-slate-400">Tienes <span className="text-blue-400 font-bold">{pendingSchedules}</span> solicitud{pendingSchedules > 1 ? 'es' : ''} esperando aprobación.</p>
                                        </div>
                                    </button>
                                )}
                                
                                {pendingIdeas > 0 && (
                                    <button 
                                        onClick={() => handleActionClick('ideas')} 
                                        className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left group"
                                    >
                                        <div className="bg-yellow-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform"><span className="text-xl">💡</span></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Nuevas Ideas Lunes</p>
                                            <p className="text-xs text-slate-400">Hay <span className="text-yellow-400 font-bold">{pendingIdeas}</span> idea{pendingIdeas > 1 ? 's' : ''} de tu equipo sin analizar.</p>
                                        </div>
                                    </button>
                                )}

                                {isAdmin && pendingDev > 0 && (
                                   <button 
                                        onClick={() => handleActionClick('dev')} 
                                        className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="bg-purple-900/30 p-2 rounded-lg group-hover:scale-110 transition-transform"><span className="text-xl">👨‍💻</span></div>
                                        <div>
                                            <p className="text-sm font-bold text-purple-400">Tickets de Soporte</p>
                                            <p className="text-xs text-slate-400">Tienes <span className="text-purple-400 font-bold">{pendingDev}</span> reporte{pendingDev > 1 ? 's' : ''} de error o sugerencia.</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;