import React from 'react';

const ThemeSelectorWidget = ({ 
    isUnlocked,        
    weeklyHours,       
    targetHours,       
    setTargetHours,    
    onClaimBonus,      
    bonusClaimed       
    // Eliminamos setManualTheme y currentThemeName porque ya no se usan aquí
}) => {
    
    // Calcular porcentaje
    const progressPercent = Math.min((weeklyHours / targetHours) * 100, 100);
    const isGoalMet = weeklyHours >= targetHours;

    return (
        <div className="mb-6 bg-black/40 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm shadow-inner transition-all hover:border-gray-600/50">
            
            {/* Encabezado: Meta y Texto */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Meta Semanal</span>
                    <input 
                        type="number" 
                        value={targetHours}
                        onChange={(e) => setTargetHours(Number(e.target.value))}
                        className="w-12 bg-gray-800 border border-gray-600 rounded text-center text-xs text-white focus:border-purple-500 outline-none transition-colors"
                        min="1"
                    />
                    <span className="text-xs text-gray-500">hrs</span>
                </div>
                <div className="text-xs font-mono text-white">
                    <span className={isGoalMet ? "text-green-400 font-bold" : ""}>{weeklyHours.toFixed(1)}</span>
                    <span className="text-gray-500"> / </span>
                    <span>{targetHours}</span> hrs
                </div>
            </div>

            {/* Barra de Progreso */}
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 mb-3 relative group shadow-inner">
                <div 
                    className={`h-full transition-all duration-1000 ease-out relative ${isGoalMet ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-purple-600 to-blue-500'}`}
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
            </div>

            {/* Zona de Recompensa (CENTRADOS) */}
            <div className="flex justify-center items-center mt-2">
                {isGoalMet ? (
                    bonusClaimed ? (
                        <div className="text-[10px] sm:text-xs font-bold text-green-400 flex items-center gap-1 bg-green-900/20 px-4 py-1.5 rounded-full border border-green-500/30 animate-fade-in">
                            <span>✅</span> Recompensa Semanal Cobrada
                        </div>
                    ) : (
                        <button 
                            onClick={onClaimBonus}
                            className="w-full sm:w-auto text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-bounce border border-yellow-300/50 transition-all hover:scale-105 active:scale-95 flex justify-center items-center gap-2"
                        >
                            <span>🎁</span> ¡RECLAMAR 100 MONEDAS!
                        </button>
                    )
                ) : (
                    <span className="text-[10px] text-gray-500 italic flex items-center gap-1">
                        <span>🚀</span> Faltan {(targetHours - weeklyHours).toFixed(1)} hrs para tu bonus.
                    </span>
                )}
            </div>
        </div>
    );
};

export default ThemeSelectorWidget;