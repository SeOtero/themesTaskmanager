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

// 2. Estación de Radio (por ahora solo Lofi; se evaluarán más estaciones en
// futuras actualizaciones — se sacaron las de ruido blanco porque no se pudo
// confirmar en la práctica que los streams se mantuvieran estables)
const STATIONS_AND_HITS = [
    { 
        id: 'lofi_chill', 
        name: '📻 Radio Lofi Chillhop', 
        url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' 
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

    // --- Volumen (persistido entre sesiones) ---
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('nexusos_audio_volume');
        const parsed = saved !== null ? parseFloat(saved) : 0.8;
        return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.8;
    });

    // --- Progreso / duración (solo tiene sentido para los relatos en MP3;
    // los streams de radio en vivo no tienen una duración fija) ---
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const isSeekable = currentSource.type === 'paranormal' && Number.isFinite(duration) && duration > 0;

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

    // Aplica el volumen al elemento <audio> cada vez que cambia, y lo recuerda
    // para la próxima vez que se abra la app.
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        localStorage.setItem('nexusos_audio_volume', String(volume));
    }, [volume]);

    // Al cambiar de fuente, reseteamos el progreso (la duración vieja ya no aplica)
    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
    }, [currentSource, trackIndex]);

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

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        if (!audioRef.current || !isSeekable) return;
        const newTime = parseFloat(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatPlayerTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full flex flex-col items-center my-4 animate-fadeIn relative z-50">
            <audio 
                ref={audioRef} 
                src={getActiveUrl()}
                autoPlay={isPlaying}
                onEnded={handleAudioEnded}
                onError={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />
            
            <div className="flex flex-col items-center gap-1.5 bg-[#0a0812]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#ff7b00]/50 shadow-[0_0_15px_rgba(255,123,0,0.2)] relative z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={togglePlay}
                        className="w-8 h-8 flex items-center justify-center bg-[#ff7b00]/20 rounded-full hover:bg-[#ff7b00]/40 transition-colors border border-[#ffb703]/30 flex-shrink-0"
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

                    <div className="flex items-end gap-1 h-4 px-1 border-l border-white/10 flex-shrink-0">
                        <div className="w-1 bg-[#ff7b00] rounded-t-sm h-full animate-pulse"></div>
                        <div className="w-1 bg-[#ffb703] rounded-t-sm h-3/4 animate-pulse"></div>
                    </div>

                    {/* --- Control de volumen --- */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 flex-shrink-0">
                        <span className="text-xs">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-16 accent-[#ff7b00] cursor-pointer"
                            title="Volumen"
                        />
                    </div>
                </div>

                {/* --- Barra de tiempo (solo para relatos MP3; la radio en vivo no tiene duración) --- */}
                <div className="flex items-center gap-2 w-full px-2 pb-0.5">
                    {isSeekable ? (
                        <>
                            <span className="text-[9px] text-orange-200/70 tabular-nums w-8 text-right">
                                {formatPlayerTime(currentTime)}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                step="0.1"
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1 accent-[#ff7b00] cursor-pointer h-1"
                                title="Progreso"
                            />
                            <span className="text-[9px] text-orange-200/70 tabular-nums w-8">
                                {formatPlayerTime(duration)}
                            </span>
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-[9px] text-red-300 uppercase tracking-widest font-bold">En vivo</span>
                        </div>
                    )}
                </div>
            </div>

            {showMenu && (
                <div className="absolute top-16 mt-2 w-72 bg-[#151021]/95 backdrop-blur-xl border border-[#ff7b00]/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden z-10 max-h-96 overflow-y-auto">
                    
                    {/* SECCIÓN 1: RADIOS Y HITS */}
                    <div className="p-2 border-b border-white/5 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-2">📻 Estaciones de Radio</span>
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