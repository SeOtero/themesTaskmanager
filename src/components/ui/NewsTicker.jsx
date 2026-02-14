import React from 'react';

const NewsTicker = ({ news }) => {
    if (!news || news.length === 0) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-50 bg-black/80 border-b border-white/10 h-8 flex items-center backdrop-blur-sm">
            <div className="marquee-container w-full">
                <div className="marquee-content flex gap-8">
                    {news.map(n => (
                        <span key={n.id} className={`text-xs font-bold font-mono px-4 ${n.type === 'critical' ? 'text-red-400 animate-pulse' : n.type === 'party' ? 'text-yellow-400' : 'text-blue-400'}`}>
                            {n.type === 'critical' && '🚨'} {n.type === 'party' && '🎉'} {n.type === 'info' && 'ℹ️'} {n.text}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default NewsTicker;