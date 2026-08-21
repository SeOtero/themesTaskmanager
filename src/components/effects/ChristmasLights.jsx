import React, { useMemo } from 'react';
const ChristmasLights = () => {
    const colors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b'];
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
             {[...Array(40)].map((_, i) => (
                <div key={i} className="absolute rounded-full animate-pulse"
                    style={{
                        top: `${Math.random() * 100}vh`,
                        left: `${Math.random() * 100}vw`,
                        width: '10px',
                        height: '10px',
                        backgroundColor: colors[i % colors.length],
                        boxShadow: `0 0 15px 5px ${colors[i % colors.length]}66`,
                        animationDuration: '2s',
                        animationDelay: `${Math.random()}s`
                    }}></div>
             ))}
        </div>
    );
};

export default ChristmasLights;