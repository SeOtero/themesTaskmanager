import React from 'react';
import CalendarWidget from '../ui/CalendarWidget';
import ReportViewer from '../ui/ReportViewer';

const HistoryView = ({ 
    themeClasses, 
    pastReports, 
    selectedDate, 
    onSelectDate, 
    selectedReportContent 
}) => {
    return (
        <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
            <div className="space-y-4">
                <h2 className={`text-2xl font-bold text-center ${themeClasses.primaryText}`}>
                    Calendario de Reportes
                </h2>
                
                <CalendarWidget 
                    reports={pastReports} 
                    selectedDate={selectedDate} 
                    onSelectDate={onSelectDate} 
                    themeClasses={themeClasses} 
                />

                <h3 className={`font-bold mb-2 text-center ${themeClasses.accentText}`}>
                    Reporte del: {selectedDate.split('-').reverse().join('/')}
                </h3>

                <ReportViewer 
                    content={selectedReportContent} 
                    themeClasses={themeClasses} 
                    placeholder="No hay reporte guardado para este día." 
                />
            </div>
        </div>
    );
};

export default HistoryView;