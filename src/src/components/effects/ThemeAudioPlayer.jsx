import React, { useState, useRef, useEffect } from 'react';

// ==========================================
// 📂 ZONA DE CARGA FACILITADA
// ==========================================

// 1. Archivos MP3 Locales (Relatos Paranormales)
import elAltilloMp3 from '../../assets/El altillo.mp3';

const LOCAL_PARANORMAL_TRACKS = [
    { id: 'track_1', name: 'Relatos: El Altillo', url: elAltilloMp3 },
    // { id: 'track_2', name: 'Relatos: Otro título', url: otroMp3 }
];

// 2. Estaciones de Radio y Ruido Blanco
const STATIONS_AND_HITS = [
    { 
        id: 'lofi_chill', 
        name: '📻 Radio Lofi Chillhop', 
        url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' 
    },
    { 
        id: 'white_noise_ocean', 
        name: '🌊 Ruido Blanco: Playa (Olas)', 
        url: 'https://listen.openstream.co/6503/' // Nature Radio Ocean (24/7, Canadá)
    },
    { 
        id: 'white_noise_rain', 
        name: '🌧️ Ruido Blanco: Lluvia', 
        url: 'https://radiosuitenetwork.torontocast.stream/nature-radio-rain/' // Nature Radio Rain (24/7, Canadá)
    }
];

// ==========================================
// 🎛️ NÚCLEO DEL REPRODUCTOR
// ==========================================

const ThemeAudioPlayer = ({ activeThemeId }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Inicializamos apuntando al primer elemento de STATIONS_AND_HITS de forma segura
    const [currentSource, setCurrentSource] = useState({ type: 'stream', item: STATIONS_AND_HITS[0] });
    const [trackIndex, setTrackIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

    const getActiveUrl = () => {
        if (currentSource.type === 'stream') {
            return currentSource.item?.url || STATIONS_AND_HITS[0].url;
        } else if (currentSource.type === 'paranormal') {
            return LOCAL_PARANORMAL_TRACKS[trackIndex]?.url || LOCAL_PARANORMAL_TRACKS[0].url;
        }
        return '';
    };

    const getActiveTitle = () => {
        if (currentSource.type === 'stream') {
            return currentSource.item?.name || 'Radio';
        } else if (currentSource.type === 'paranormal') {
            return LOCAL_PARANORMAL_TRACKS[trackIndex]?.name || 'Relatos Paranormales';
        }
        return 'Reproductor';
    };

    useEffect(() => {
        if (activeThemeId === 'outside_the_frame') {
            setIsPlaying(true);
        }
    }, [activeThemeId]);

    useEffect(() => {
        if (audioRef.current && activeThemeId === 'outside_the_frame') {
            audioRef.current.src = getActiveUrl();
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            }
        }
    }, [currentSource, trackIndex]);

    if (activeThemeId !== 'outside_the_frame') return null;

    const togglePlay = () => {
        if (!audioRef.current) return;
        setIsPlaying(!isPlaying);
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => setIsPlaying(false));
        }
    };

    const handleSelectStream = (station) => {
        setCurrentSource({ type: 'stream', item: station });
        setShowMenu(false);
        setIsPlaying(true);
    };

    const handleSelectRandomParanormal = () => {
        const randomIndex = Math.floor(Math.random() * LOCAL_PARANORMAL_TRACKS.length);
        setTrackIndex(randomIndex);
        setCurrentSource({ type: 'paranormal', item: null });
        setShowMenu(false);
        setIsPlaying(true);
    };

    const handleSelectSpecificTrack = (index) => {
        setTrackIndex(index);
        setCurrentSource({ type: 'paranormal', item: null });
        setShowMenu(false);
        setIsPlaying(true);
    };

    const handleAudioEnded = () => {
        if (currentSource.type === 'paranormal' && LOCAL_PARANORMAL_TRACKS.length > 1) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * LOCAL_PARANORMAL_TRACKS.length);
            } while (nextIndex === trackIndex);
            setTrackIndex(nextIndex);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center my-4 animate-fadeIn relative z-50">
            <audio 
                ref={audioRef} 
                src={getActiveUrl()}
                autoPlay={isPlaying}
                onEnded={handleAudioEnded}
                onError={() => setIsPlaying(false)}
            />
            
            <div className="flex items-center gap-3 bg-[#0a0812]/95 backdrop-blur-md p-1.5 rounded-full border border-[#ff7b00]/50 shadow-[0_0_15px_rgba(255,123,0,0.2)] relative z-20">
                <button 
                    onClick={togglePlay}
                    className="w-8 h-8 flex items-center justify-center bg-[#ff7b00]/20 rounded-full hover:bg-[#ff7b00]/40 transition-colors border border-[#ffb703]/30"
                >
                    <span className="text-[#ffb703] text-sm">
                        {isPlaying ? '⏸️' : '▶️'}
                    </span>
                </button>

                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex flex-col items-start px-2 min-w-[210px] hover:opacity-80 transition-opacity"
                >
                    <span className="text-[9px] text-[#ffb703] uppercase tracking-widest font-bold">
                        💿 Sonando ahora
                    </span>
                    <span className="text-orange-100 text-xs font-semibold truncate w-full text-left">
                        {getActiveTitle()}
                    </span>
                </button>

                <div className="flex items-end gap-1 h-4 px-3 border-l border-white/10">
                    <div className="w-1 bg-[#ff7b00] rounded-t-sm h-full animate-pulse"></div>
                    <div className="w-1 bg-[#ffb703] rounded-t-sm h-3/4 animate-pulse"></div>
                </div>
            </div>

            {showMenu && (
                <div className="absolute top-12 mt-2 w-72 bg-[#151021]/95 backdrop-blur-xl border border-[#ff7b00]/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden z-10 max-h-96 overflow-y-auto">
                    
                    {/* SECCIÓN 1: RADIOS Y HITS */}
                    <div className="p-2 border-b border-white/5 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-2">📻 Radio y Ruido Blanco</span>
                    </div>
                    <div className="flex flex-col p-1 gap-1">
                        {STATIONS_AND_HITS.map((station) => (
                            <button
                                key={station.id}
                                onClick={() => handleSelectStream(station)}
                                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    currentSource.type === 'stream' && currentSource.item?.id === station.id 
                                    ? 'bg-[#ff7b00]/20 text-[#ffb703] border border-[#ff7b00]/30' 
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {station.name}
                            </button>
                        ))}
                    </div>

                    {/* SECCIÓN 2: RELATOS PARANORMALES */}
                    <div className="p-2 border-b border-t border-white/5 bg-black/20 sticky top-0 z-10 backdrop-blur-md mt-1">
                        <span className="text-[10px] text-orange-400 uppercase tracking-widest font-bold px-2">👻 Relatos Paranormales (MP3)</span>
                    </div>
                    <div className="flex flex-col p-1 gap-1">
                        <button
                            onClick={handleSelectRandomParanormal}
                            className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                currentSource.type === 'paranormal' 
                                ? 'bg-[#ff7b00]/20 text-[#ffb703] border border-[#ff7b00]/30' 
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            🔀 Modo Aleatorio (Carpeta)
                        </button>

                        {LOCAL_PARANORMAL_TRACKS.map((track, index) => (
                            <button
                                key={track.id}
                                onClick={() => handleSelectSpecificTrack(index)}
                                className={`text-left pl-6 pr-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    currentSource.type === 'paranormal' && trackIndex === index
                                    ? 'bg-[#ff7b00]/20 text-[#ffb703] border border-[#ff7b00]/30' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                🎧 {track.name}
                            </button>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
};

export default ThemeAudioPlayer;