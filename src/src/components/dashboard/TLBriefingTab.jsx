// src/components/dashboard/TLBriefingTab.jsx
//
// Panel del Team Leader para armar el "Tablón de Anuncios del Día" que ven los
// agentes al entrar a la app.
//
// Dos formas de cargar anuncios:
// 1) "Puntuales": para una fecha específica (por defecto hoy, pero se puede
//    elegir a futuro, ej: cargar el feriado del lunes 17 con anticipación).
// 2) "Recurrentes": se cargan UNA sola vez y reaparecen solos todos los días,
//    o todas las semanas en un día fijo (ej: disponibilidad todos los sábados,
//    o el EOD report todos los días).
//
// Cada ítem se puede dirigir a TODOS los agentes o a uno específico, y
// opcionalmente puede llevar un acceso directo (Disponibilidad o EOD Report).
import React, { useState } from 'react';

const WEEKDAYS = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
];

const ActionSelect = ({ value, onChange }) => (
    <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none text-xs"
    >
        <option value="">Sin acceso directo</option>
        <option value="availability">📅 Acceso directo a Disponibilidad</option>
        <option value="eod_report">📝 Acceso directo a Grabar EOD Report</option>
    </select>
);

const TargetSelect = ({ value, onChange, agentsList }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none min-w-[180px]"
    >
        <option value="all">👥 Todos los agentes</option>
        {agentsList.map((a) => (
            <option key={a.id} value={a.id}>
                {a.role === 'agent' ? '👤' : '👑'} {a.userName || a.email?.split('@')[0] || a.id}
                {a.role !== 'agent' ? ` (${a.role})` : ''}
            </option>
        ))}
    </select>
);

const TLBriefingTab = ({
    briefingDate,
    setBriefingDate,
    briefingItems,
    newBriefingText,
    setNewBriefingText,
    newBriefingTarget,
    setNewBriefingTarget,
    newBriefingAction,
    setNewBriefingAction,
    addBriefingItem,
    removeBriefingItem,
    recurringItems,
    addRecurringItem,
    removeRecurringItem,
    agentsList,
    todayID,
}) => {
    const [recurText, setRecurText] = useState('');
    const [recurTarget, setRecurTarget] = useState('all');
    const [recurAction, setRecurAction] = useState(null);
    const [recurType, setRecurType] = useState('daily'); // 'daily' | número de día (0-6)

    const getAgentName = (uid) => {
        const agent = agentsList.find((a) => a.id === uid);
        return agent?.userName || agent?.email?.split('@')[0] || 'Agente';
    };

    const handleAddRecurring = () => {
        if (!recurText.trim()) return;
        const recurrence = recurType === 'daily'
            ? { type: 'daily' }
            : { type: 'weekly', dayOfWeek: Number(recurType) };
        addRecurringItem({ text: recurText.trim(), target: recurTarget, actionType: recurAction, recurrence });
        setRecurText('');
        setRecurAction(null);
    };

    const describeRecurrence = (recurrence) => {
        if (!recurrence) return '';
        if (recurrence.type === 'daily') return '🔁 Todos los días';
        const day = WEEKDAYS.find((d) => d.value === recurrence.dayOfWeek);
        return `🔁 Todos los ${day ? day.label.toLowerCase() + 's' : '...'}`;
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn flex flex-col gap-8">

            {/* ============ ANUNCIOS RECURRENTES ============ */}
            <div>
                <h3 className="text-sm font-black text-white mb-1">🔁 Anuncios Recurrentes</h3>
                <p className="text-xs text-slate-500 mb-4">
                    Se cargan una sola vez y reaparecen solos, todos los días o en un día fijo de la semana.
                    Ideal para cosas como "mandar disponibilidad" (todos los sábados) o "grabar el EOD report" (todos los días).
                </p>

                <div className="bg-slate-900 p-6 rounded-xl border border-white/10 mb-4">
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                        <select
                            value={recurType}
                            onChange={(e) => setRecurType(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none"
                        >
                            <option value="daily">🔁 Todos los días</option>
                            {WEEKDAYS.map((d) => (
                                <option key={d.value} value={d.value}>🔁 Todos los {d.label.toLowerCase()}s</option>
                            ))}
                        </select>
                        <TargetSelect value={recurTarget} onChange={setRecurTarget} agentsList={agentsList} />
                        <ActionSelect value={recurAction} onChange={setRecurAction} />
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={recurText}
                            onChange={(e) => setRecurText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddRecurring(); }}
                            placeholder='Ej: "Mandar disponibilidad antes que nada" o "Grabar tu EOD report y pegarlo en Slack"'
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none"
                        />
                        <button
                            onClick={handleAddRecurring}
                            className="bg-emerald-600 px-6 rounded-lg font-bold hover:bg-emerald-500 flex-shrink-0"
                        >
                            Agregar Recurrente
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {recurringItems.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">No hay anuncios recurrentes cargados.</p>
                    ) : (
                        recurringItems.map((item) => {
                            const isForAll = !item.targetUids || item.targetUids.length === 0;
                            return (
                                <div key={item.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-900/40 text-emerald-300 whitespace-nowrap">
                                            {describeRecurrence(item.recurrence)}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase whitespace-nowrap ${isForAll ? 'bg-indigo-900/40 text-indigo-300' : 'bg-amber-900/40 text-amber-300'}`}>
                                            {isForAll ? '👥 Todos' : `👤 ${getAgentName(item.targetUids[0])}`}
                                        </span>
                                        <span className="text-sm truncate">{item.text}</span>
                                        {item.actionType && (
                                            <span className="text-[10px] bg-blue-900/40 text-blue-300 px-2 py-1 rounded flex-shrink-0">
                                                {item.actionType === 'availability' ? '📅' : '📝'} con acceso directo
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => removeRecurringItem(item.id)} className="text-red-400 hover:text-red-300 text-xs flex-shrink-0 ml-3">
                                        Borrar
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* ============ ANUNCIOS PUNTUALES (por fecha) ============ */}
            <div>
                <h3 className="text-sm font-black text-white mb-1">📌 Anuncios Puntuales</h3>
                <p className="text-xs text-slate-500 mb-4">
                    Para algo de una fecha específica, ej: "el lunes 17 es feriado". Se puede cargar con anticipación.
                </p>

                <div className="bg-slate-900 p-6 rounded-xl border border-white/10 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha del anuncio</label>
                            <input
                                type="date"
                                value={briefingDate}
                                onChange={(e) => setBriefingDate(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none"
                            />
                            {briefingDate === todayID && <span className="text-[10px] text-emerald-400">Hoy</span>}
                            {briefingDate > todayID && <span className="text-[10px] text-blue-400">Programado a futuro</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Para quién</label>
                            <TargetSelect value={newBriefingTarget} onChange={setNewBriefingTarget} agentsList={agentsList} />
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recordatorio / tarea</label>
                            <div className="flex gap-2">
                                <input
                                    value={newBriefingText}
                                    onChange={(e) => setNewBriefingText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') addBriefingItem(); }}
                                    placeholder='Ej: "El lunes 17 es feriado"'
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none"
                                />
                                <button onClick={addBriefingItem} className="bg-indigo-600 px-6 rounded-lg font-bold hover:bg-indigo-500 flex-shrink-0">
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-2 max-w-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acceso directo (opcional)</label>
                        <ActionSelect value={newBriefingAction} onChange={setNewBriefingAction} />
                    </div>
                </div>

                <div className="space-y-3">
                    {briefingItems.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No hay anuncios puntuales cargados para el {briefingDate}.</p>
                    ) : (
                        briefingItems.map((item) => {
                            const isForAll = !item.targetUids || item.targetUids.length === 0;
                            return (
                                <div key={item.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase whitespace-nowrap flex-shrink-0 ${isForAll ? 'bg-indigo-900/40 text-indigo-300' : 'bg-amber-900/40 text-amber-300'}`}>
                                            {isForAll ? '👥 Todos' : `👤 ${getAgentName(item.targetUids[0])}`}
                                        </span>
                                        <span className="text-sm truncate">{item.text}</span>
                                        {item.actionType && (
                                            <span className="text-[10px] bg-blue-900/40 text-blue-300 px-2 py-1 rounded flex-shrink-0">
                                                {item.actionType === 'availability' ? '📅' : '📝'} con acceso directo
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => removeBriefingItem(item.id)} className="text-red-400 hover:text-red-300 text-xs flex-shrink-0 ml-4">
                                        Borrar
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TLBriefingTab;
