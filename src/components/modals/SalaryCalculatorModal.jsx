import React, { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MultiSelectCalendar } from '../ui/CalendarWidget';
import { parseHoursFromReport, getTodayID } from '../../utils/helpers';

const SalaryCalculatorModal = ({ isOpen, onClose, pastReports, hourlyRate, setHourlyRate, themeClasses }) => {
    if (!isOpen) return null;
    
    const [selectedSalaryDates, setSelectedSalaryDates] = useState([]);
    const toggleDate = (date) => { if (selectedSalaryDates.includes(date)) { setSelectedSalaryDates(prev => prev.filter(d => d !== date)); } else { setSelectedSalaryDates(prev => [...prev, date]); } };

    const handleBatchUpdate = (dates, action) => {
        if (action === 'add') { setSelectedSalaryDates(prev => { const newSet = new Set([...prev, ...dates]); return Array.from(newSet); }); } 
        else if (action === 'remove') { setSelectedSalaryDates(prev => prev.filter(d => !dates.includes(d))); }
    };

    const stats = useMemo(() => {
        let totalHours = 0;
        let daysCount = 0;
        selectedSalaryDates.forEach(date => {
            const report = pastReports.find(r => r.id === date);
            if (report) { const hours = parseHoursFromReport(report.content); if (hours > 0) { totalHours += hours; daysCount++; } }
        });
        const totalEarnings = totalHours * (parseFloat(hourlyRate) || 0);
        return { totalHours, daysCount, totalEarnings };
    }, [selectedSalaryDates, pastReports, hourlyRate]);

    const formatToHoursMinutes = (decimalHours) => { let h = Math.floor(decimalHours); let m = Math.round((decimalHours - h) * 60); if (m === 60) { h++; m = 0; } return `${h}h ${m}m`; };
    const decimalToTimeStr = (decimalHours) => { let h = Math.floor(decimalHours); let m = Math.round((decimalHours - h) * 60); if (m === 60) { h++; m = 0; } return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`; };

    const handleExportExcel = async () => {
        if (selectedSalaryDates.length === 0) { alert("Selecciona al menos un día para exportar."); return; }
        
        const rate = parseFloat(hourlyRate) || 0;
        
        // 1. Crear Workbook y Hoja
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte Salarial");

        // 2. Definir Columnas
        worksheet.columns = [
            { header: 'Fecha', key: 'date', width: 15 },
            { header: 'Tiempo Trabajado', key: 'time', width: 20 },
            { header: 'Tarifa por Hora (USD)', key: 'rate', width: 25 },
            { header: 'Total (USD)', key: 'total', width: 20 }
        ];

        // 3. Agregar Filas de Datos
        const sortedDates = [...selectedSalaryDates].sort();
        sortedDates.forEach(date => {
            const report = pastReports.find(r => r.id === date);
            let hours = 0;
            if (report) hours = parseHoursFromReport(report.content);
            const earning = hours * rate;
            
            worksheet.addRow({
                date: date,
                time: decimalToTimeStr(hours),
                rate: rate,
                total: earning
            });
        });

        // 4. Agregar Fila de Totales
        worksheet.addRow({}); 
        const totalRow = worksheet.addRow({
            date: 'TOTALES',
            time: decimalToTimeStr(stats.totalHours),
            rate: '',
            total: stats.totalEarnings
        });
        
        totalRow.font = { bold: true };

        // 5. Generar y Descargar
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_Salario_${getTodayID()}.xlsx`);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`relative w-full max-w-lg p-6 rounded-2xl shadow-2xl border-2 modal-content max-h-[90vh] overflow-y-auto ${themeClasses.modalBg}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 flex items-center gap-2"><span className="text-3xl">💰</span> Calculadora Salarial </h2>
                    <button onClick={onClose} className={`text-gray-400 hover:${themeClasses.primaryText}`}>✕</button>
                </div>
                <div className={`mb-6 p-4 rounded-xl border ${themeClasses.itemBg} ${themeClasses.inputBorder}`}>
                    <label className={`block text-sm font-semibold mb-2 ${themeClasses.secondaryText}`}>Tu Tarifa por Hora ($):</label>
                    <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className={`w-full px-4 py-3 rounded-lg bg-gray-900 border text-xl font-mono focus:outline-none focus:ring-2 ${themeClasses.inputBorder} ${themeClasses.primaryText}`} placeholder="Ej: 5.50" />
                </div>
                <div className="mb-6">
                    <p className={`text-sm mb-2 ${themeClasses.secondaryText}`}>Selecciona los días a liquidar:</p>
                    <MultiSelectCalendar reports={pastReports} selectedDates={selectedSalaryDates} onToggleDate={toggleDate} onBatchUpdate={handleBatchUpdate} themeClasses={themeClasses} />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className={`p-4 rounded-xl border flex flex-col items-center ${themeClasses.itemBg} ${themeClasses.inputBorder}`}>
                        <span className={`text-xs uppercase tracking-wide ${themeClasses.secondaryText}`}>Horas Totales</span>
                        <span className={`text-2xl font-bold mt-1 ${themeClasses.primaryText}`}>{formatToHoursMinutes(stats.totalHours)}</span>
                        <span className={`text-xs opacity-70 ${themeClasses.secondaryText}`}>en {stats.daysCount} días</span>
                    </div>
                    <div className="bg-green-900/40 p-4 rounded-xl border border-green-500 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1 opacity-20"><span className="text-4xl">💰</span></div>
                        <span className="text-green-300 text-xs uppercase tracking-wide font-bold">Total a Cobrar</span>
                        <span className="text-3xl font-extrabold text-green-400 mt-1">${stats.totalEarnings.toFixed(2)}</span>
                    </div>
                </div>
                <button onClick={handleExportExcel} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 bg-green-700 hover:bg-green-600`}>
                    {/* SVG CORREGIDO AQUI ABAJO */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar a Excel
                </button>
            </div>
        </div>
    );
};

export default SalaryCalculatorModal;