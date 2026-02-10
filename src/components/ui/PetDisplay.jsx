import React, { useState } from 'react';

const PET_ASSETS = {
    // Usamos GIFs directos. Si estos fallan, se mostrará el emoji.
    'pet_cat_black': 'https://media.tenor.com/N3L8K_sq_qQAAAAi/black-cat-pixel.gif',
    'pet_ghost': 'https://media.tenor.com/y4l3n8y_XGAAAAAi/ghost-cute.gif',
};

const PET_EMOJIS = {
    'pet_cat_black': '🐈‍⬛',
    'pet_ghost': '👻',
};

const PetDisplay = ({ petId }) => {
    const [imgError, setImgError] = useState(false);

    // Si no hay mascota seleccionada, no mostramos nada
    if (!petId) return null;

    return (
        <div 
            className="absolute -top-20 right-4 w-24 h-24 z-[60] pointer-events-none animate-bounce-slow flex items-center justify-center"
            style={{ 
                // Esto ayuda a ver si el contenedor existe (puedes quitarlo luego)
                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' 
            }}
        >
            {!imgError && PET_ASSETS[petId] ? (
                <img 
                    src={PET_ASSETS[petId]} 
                    alt="Pet" 
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)}
                />
            ) : (
                // Fallback: Si la imagen falla, mostramos el Emoji gigante
                <span className="text-6xl filter drop-shadow-lg transform hover:scale-110 transition-transform">
                    {PET_EMOJIS[petId] || '✨'}
                </span>
            )}
            
            {/* Sombra de piso para dar efecto 3D */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-[100%] blur-sm"></div>
        </div>
    );
};

export default PetDisplay;