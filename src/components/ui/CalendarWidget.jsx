import React, { useState, useMemo } from 'react';
import { getTodayID } from '../../utils/helpers';

export const CalendarWidget = ({ reports = [], selectedDate, onSelectDate, themeClasses }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const daysInMonth = useMemo(() => { const year = viewDate.getFullYear(); const month = viewDate.getMonth(); return new Date(year, month + 1, 0).getDate(); }, [viewDate]);
    const startDay = useMemo(() => { const year = viewDate.getFullYear(); const month = viewDate.getMonth(); return new Date(year, month, 1).getDay(); }, [viewDate]);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekDays = ["D", "L", "M", "M", "J", "V", "S"];
    
    const handlePrevMonth = () => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); };
    const handleNextMonth = () => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); };
    
    const generateCalendarDays = () => {
        const days = [];
        for (let i = 0; i < startDay; i++) { days.push(<div key={`empty-${i}`} className="h-10 w-10" />); }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            const isSelected = selectedDate === dateString;
            const hasReport = Array.isArray(reports) && reports.some(r => r.id === dateString);
            const isToday = dateString === getTodayID();
            let bgClass = "hover:bg-gray-600/50";
            let textClass = themeClasses.secondaryText;
            if (isSelected) { bgClass = themeClasses.calendarActive || 'bg-blue-600 text-white'; textClass = "text-white font-bold"; } else if (isToday) { bgClass = "border border-gray-500 bg-gray-700/50"; }
            
            days.push(
                <div key={day} onClick={() => onSelectDate(dateString)} className={`h-10 w-10 flex flex-col items-center justify-center rounded-full cursor-pointer transition-all relative ${bgClass} ${textClass}`}>
                    <span className="text-sm z-10">{day}</span>
                    {hasReport && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${themeClasses.calendarDot || 'bg-yellow-400'}`} />}
                </div>
            );
        }
        return days;
    };
    
    return (
        <div className={`p-4 rounded-xl shadow-lg ${themeClasses.itemBg} transition-colors duration-500`}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className={`p-1 rounded-full hover:bg-gray-600/50 ${themeClasses.primaryText}`}>&lt;</button>
                <span className={`font-bold text-lg ${themeClasses.primaryText}`}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                <button onClick={handleNextMonth} className={`p-1 rounded-full hover:bg-gray-600/50 ${themeClasses.primaryText}`}>&gt;</button>
            </div>
            
<div className="grid grid-cols-7 gap-1 text-center mb-2">
    {weekDays.map((d, i) => <div key={i} className={`text-xs font-bold opacity-70 ${themeClasses.secondaryText}`}>{d}</div>)}
</div>
            <div className="grid grid-cols-7 gap-1 justify-items-center">{generateCalendarDays()}</div>
        </div>
    );
};

export const MultiSelectCalendar = ({ reports = [], selectedDates, onToggleDate, onBatchUpdate, themeClasses }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const daysInMonth = useMemo(() => { const year = viewDate.getFullYear(); const month = viewDate.getMonth(); return new Date(year, month + 1, 0).getDate(); }, [viewDate]);
    const startDay = useMemo(() => { const year = viewDate.getFullYear(); const month = viewDate.getMonth(); return new Date(year, month, 1).getDay(); }, [viewDate]);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekDays = ["D", "L", "M", "M", "J", "V", "S"];
    
    const handlePrevMonth = () => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); };
    const handleNextMonth = () => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); };
    
    const getCurrentMonthDates = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const dates = [];
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
        return dates;
    };

    const handleSelectAll = () => { if (onBatchUpdate) onBatchUpdate(getCurrentMonthDates(), 'add'); };
    const handleDeselectAll = () => { if (onBatchUpdate) onBatchUpdate(getCurrentMonthDates(), 'remove'); };
    
    const generateCalendarDays = () => {
        const days = [];
        for (let i = 0; i < startDay; i++) { days.push(<div key={`empty-${i}`} className="h-10 w-10" />); }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            const isSelected = selectedDates.includes(dateString);
            const hasReport = Array.isArray(reports) && reports.some(r => r.id === dateString);
            let bgClass = "hover:bg-gray-600/50";
            let textClass = themeClasses.secondaryText;
            if (isSelected) { bgClass = 'bg-green-600 text-white font-bold border border-green-400'; textClass = "text-white"; } 
            
            days.push(
                <div key={day} onClick={() => onToggleDate(dateString)} className={`h-10 w-10 flex flex-col items-center justify-center rounded-full cursor-pointer transition-all relative ${bgClass} ${textClass}`}>
                    <span className="text-sm z-10">{day}</span>
                    {hasReport && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : (themeClasses.calendarDot || 'bg-yellow-400')}`} />}
                </div>
            );
        }
        return days;
    };
    
    return (
        <div className={`p-4 rounded-xl shadow-lg border transition-colors duration-500 ${themeClasses.cardBg} ${themeClasses.inputBorder}`}>
            <div className="flex justify-between items-center mb-4"> 
                <button onClick={handlePrevMonth} className={`p-1 rounded-full hover:bg-gray-600/50 ${themeClasses.primaryText}`}>&lt;</button> 
                <span className={`font-bold text-lg ${themeClasses.primaryText}`}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span> 
                <button onClick={handleNextMonth} className={`p-1 rounded-full hover:bg-gray-600/50 ${themeClasses.primaryText}`}>&gt;</button> 
            </div>
            <div className="flex gap-2 mb-3 justify-center">
                <button onClick={handleSelectAll} className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded-full transition">Todos</button>
                <button onClick={handleDeselectAll} className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition">Ninguno</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">{weekDays.map(d => <div key={d} className={`text-xs font-bold opacity-70 ${themeClasses.secondaryText}`}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1 justify-items-center">{generateCalendarDays()}</div>
        </div>
    );
};

export default CalendarWidget;