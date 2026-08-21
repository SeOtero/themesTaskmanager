import React from 'react';

const CardRippleEffect = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Generamos 3 ondas que se expandirán con los retrasos del CSS */}
            <div className="ripple-layer"></div>
            <div className="ripple-layer"></div>
            <div className="ripple-layer"></div>
        </div>
    );
};

export default CardRippleEffect;