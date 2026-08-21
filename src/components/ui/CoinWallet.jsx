import React from 'react';

const CoinWallet = ({ coins }) => {
    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/50 shadow-[0_0_15px_rgba(192,132,252,0.4)] animate-fade-in">
            {/* Logo LofiDex girando suavemente */}
            <img 
                src="https://i.imgur.com/0YBh5gg.png" 
                alt="Lofi Coin" 
                className="w-8 h-8 object-cover rounded-full shadow-sm animate-pulse" 
            />
            <div className="flex flex-col leading-none">
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Lofi Coins</span>
                <span className="text-xl font-mono font-bold text-white">{coins}</span>
            </div>
        </div>
    );
};

export default CoinWallet;