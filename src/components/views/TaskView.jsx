import React from 'react';
import EconomyBar from '../ui/EconomyBar';
import TaskInputForm from '../ui/TaskInputForm';
import TaskListItem from '../ui/TaskListItem';
import ReportViewer from '../ui/ReportViewer';

const TaskView = ({ 
    themeClasses, 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    updateTaskQuantity,
    hourlyRate, 
    salaryProgress,
    reportOutput,
    onGenerateReportClick 
}) => {
    return (
        <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
            {/* Barra de Economía */}
            <EconomyBar 
                hourlyRate={hourlyRate} 
                progress={salaryProgress} 
                themeClasses={themeClasses} 
            />

            {/* Input de Tareas */}
            <TaskInputForm 
                onAddTask={addTask} 
                themeClasses={themeClasses} 
            />

            {/* Lista de Tareas */}
            <div className={`flex-1 overflow-y-auto rounded-2xl p-4 ${themeClasses.cardBg} backdrop-blur-md border border-white/5 shadow-2xl`}>
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <div className="text-6xl mb-4">✨</div>
                        <p className={themeClasses.secondaryText}>Todo limpio. ¡A crear!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <TaskListItem 
                                key={task.id} 
                                task={task} 
                                onToggle={() => toggleTask(task.id)} 
                                onDelete={() => deleteTask(task.id)}
                                onUpdateQuantity={updateTaskQuantity}
                                themeClasses={themeClasses} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Área de Reporte del Día */}
            <div className="flex flex-col gap-2">
                <button 
                    onClick={onGenerateReportClick}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${themeClasses.buttonAction}`}
                >
                    Generar E.O.D.R.
                </button>
                {reportOutput && (
                    <ReportViewer content={reportOutput} themeClasses={themeClasses} />
                )}
            </div>
        </div>
    );
};

export default TaskView;