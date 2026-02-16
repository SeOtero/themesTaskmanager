import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const NOTE_COLORS = [
    { name: 'yellow', bg: 'bg-[#fff59d] text-yellow-900', tab: 'bg-[#fff59d]', btn: 'bg-yellow-400' },
    { name: 'green', bg: 'bg-[#c5e1a5] text-green-900', tab: 'bg-[#c5e1a5]', btn: 'bg-green-400' },
    { name: 'blue', bg: 'bg-[#90caf9] text-blue-900', tab: 'bg-[#90caf9]', btn: 'bg-blue-400' },
    { name: 'pink', bg: 'bg-[#f48fb1] text-pink-900', tab: 'bg-[#f48fb1]', btn: 'bg-pink-400' },
    { name: 'purple', bg: 'bg-[#ce93d8] text-purple-900', tab: 'bg-[#ce93d8]', btn: 'bg-purple-400' },
    { name: 'white', bg: 'bg-[#eeeeee] text-slate-800', tab: 'bg-[#eeeeee]', btn: 'bg-slate-200' },
];

const QuickNotesWidget = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [activeNoteId, setActiveNoteId] = useState(null);
    
    // --- EDICIÓN DE TÍTULO ---
    const [editingTitleId, setEditingTitleId] = useState(null); 
    const [tempTitle, setTempTitle] = useState(""); 

    // --- ESTADOS VISUALES (PERSISTENTES) ---
    // Intentamos leer de LocalStorage, si no existe, usamos valores por defecto
    const getSavedConfig = () => {
        try {
            const saved = localStorage.getItem(`nexus_notes_config_${user?.uid}`);
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    };

    const savedConfig = getSavedConfig();

    const [position, setPosition] = useState(savedConfig?.position || { x: window.innerWidth - 80, y: window.innerHeight - 200 });
    const [size, setSize] = useState(savedConfig?.size || { width: 340, height: 450 });

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 }); 
    
    const containerRef = useRef(null); // Referencia al contenedor de la nota
    const buttonRef = useRef(null);

    // --- CARGAR NOTAS DE FIREBASE ---
    useEffect(() => {
        if (!user) return;
        const notesRef = collection(db, `users/${user.uid}/quick_notes`);
        const q = query(notesRef, orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(loadedNotes);
            
            if (loadedNotes.length > 0) {
                setActiveNoteId(prev => {
                    const stillExists = loadedNotes.find(n => n.id === prev);
                    return stillExists ? prev : loadedNotes[loadedNotes.length - 1].id;
                });
            } else {
                setActiveNoteId(null);
            }
        });
        return () => unsubscribe();
    }, [user]);

    // --- GUARDAR CONFIGURACIÓN (TAMAÑO/POSICIÓN) ---
    const saveConfigToLocal = (newPos, newSize) => {
        if (!user) return;
        const config = { position: newPos, size: newSize };
        localStorage.setItem(`nexus_notes_config_${user.uid}`, JSON.stringify(config));
    };

    // --- DRAG & RESIZE LOGIC ---
    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    // Capturamos el final del arrastre O el final del redimensionado
    const handleWindowMouseUp = (e) => {
        // 1. Si estábamos arrastrando, terminamos
        if (isDragging) {
            setIsDragging(false);
            const distance = Math.sqrt(Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2));
            
            // Si fue arrastre real (movimiento > 5px), guardamos posición nueva
            if (distance > 5) {
                saveConfigToLocal(position, size);
            } else {
                // Si fue click estático, abrimos/cerramos
                // Nota: La lógica de toggle se maneja mejor en onClick del botón si no hubo drag, 
                // pero aquí necesitamos guardar la pos si cambió.
                setIsOpen(prev => !prev);
            }
        }

        // 2. Si la ventana está abierta, verificamos si cambió de tamaño (Resize)
        if (isOpen && containerRef.current) {
            const currentWidth = containerRef.current.offsetWidth;
            const currentHeight = containerRef.current.offsetHeight;

            // Si el tamaño actual del DOM es diferente al del estado, actualizamos y guardamos
            if (currentWidth !== size.width || currentHeight !== size.height) {
                const newSize = { width: currentWidth, height: currentHeight };
                setSize(newSize);
                saveConfigToLocal(position, newSize);
            }
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
        };

        // Usamos window para capturar cuando sueltan el mouse en cualquier lado
        if (isDragging || isOpen) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }
        
        return () => { 
            window.removeEventListener('mousemove', handleMouseMove); 
            window.removeEventListener('mouseup', handleWindowMouseUp); 
        };
    }, [isDragging, dragOffset, startPos, isOpen, position, size]);


    // --- CRUD FIREBASE ---
    const addNote = async () => {
        const docRef = await addDoc(collection(db, `users/${user.uid}/quick_notes`), {
            title: "Nueva Nota", text: "", color: 'yellow', createdAt: Date.now(), updatedAt: Date.now()
        });
        setActiveNoteId(docRef.id);
        setEditingTitleId(docRef.id);
        setTempTitle("Nueva Nota");
    };
    const updateNote = async (id, field, value) => {
        const noteRef = doc(db, `users/${user.uid}/quick_notes`, id);
        await updateDoc(noteRef, { [field]: value, updatedAt: Date.now() });
    };
    const deleteNote = async (e, id) => {
        e.stopPropagation();
        if(window.confirm("¿Borrar nota?")) await deleteDoc(doc(db, `users/${user.uid}/quick_notes`, id));
    };

    // --- EDICIÓN TÍTULO ---
    const startEditingTitle = (e, note) => { e.stopPropagation(); setEditingTitleId(note.id); setTempTitle(note.title || "Nota"); };
    const saveTitle = async (id) => { if (tempTitle.trim() !== "") await updateNote(id, 'title', tempTitle); setEditingTitleId(null); };
    const handleKeyDown = (e, id) => { if (e.key === 'Enter') saveTitle(id); };

    const activeNote = notes.find(n => n.id === activeNoteId);
    const activeColor = activeNote ? (NOTE_COLORS.find(c => c.name === activeNote.color) || NOTE_COLORS[0]) : NOTE_COLORS[0];

    if (!user) return null;

    return (
        <>
            {isOpen && (
                <div 
                    ref={containerRef}
                    className="fixed z-[90] flex flex-col animate-fadeIn shadow-2xl rounded-xl overflow-hidden border border-white/20"
                    style={{ 
                        // Posición relativa al botón para que "surja" de ahí visualmente o posición guardada absoluta
                        // Para simplificar el resize, usamos la posición guardada directamente como top/left
                        left: position.x - size.width + 50, // Ajuste para que no tape el botón
                        top: position.y - size.height - 10,
                        width: `${size.width}px`,
                        height: `${size.height}px`,
                        resize: 'both',
                        minWidth: '280px',
                        minHeight: '200px'
                    }}
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    {/* --- HEADER --- */}
                    <div className="flex bg-[#2d3748] overflow-x-auto custom-scrollbar-hide cursor-move items-end pt-1 px-1 gap-1 h-9 flex-shrink-0" title="Arrastrar widget">
                        {notes.map((note, index) => {
                            const isActive = note.id === activeNoteId;
                            const isEditing = note.id === editingTitleId;
                            const noteColor = NOTE_COLORS.find(c => c.name === note.color) || NOTE_COLORS[0];
                            return (
                                <div 
                                    key={note.id}
                                    onClick={() => !isEditing && setActiveNoteId(note.id)}
                                    onDoubleClick={(e) => startEditingTitle(e, note)}
                                    className={`group relative flex items-center justify-between min-w-[100px] max-w-[140px] h-8 px-3 rounded-t-lg text-xs font-bold select-none transition-all ${isActive ? `${noteColor.tab} text-slate-900` : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                >
                                    {isEditing ? (
                                        <input autoFocus value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onBlur={() => saveTitle(note.id)} onKeyDown={(e) => handleKeyDown(e, note.id)} className="w-full bg-transparent outline-none border-b border-black/50 text-slate-900 px-0 py-0" />
                                    ) : (
                                        <span className="truncate mr-4 w-full" title="Doble clic para editar">{note.title || `Nota ${index + 1}`}</span>
                                    )}
                                    {!isEditing && <button onClick={(e) => deleteNote(e, note.id)} className={`absolute right-1 top-1.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10 text-[10px] ${isActive ? 'text-black/50' : 'text-white/30 hidden group-hover:flex'}`}>✕</button>}
                                </div>
                            );
                        })}
                        <button onClick={addNote} className="h-7 w-7 mb-0.5 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors flex-shrink-0">+</button>
                    </div>

                    {/* --- BODY --- */}
                    <div className={`flex-1 flex flex-col relative ${activeNote ? activeColor.bg : 'bg-slate-800'} overflow-hidden`}>
                        {activeNote ? (
                            <>
                                <textarea 
                                    className="flex-1 w-full h-full bg-transparent resize-none outline-none p-4 text-sm font-medium placeholder-black/30 leading-relaxed custom-scrollbar"
                                    placeholder="Escribe aquí tu nota..."
                                    value={activeNote.text}
                                    onChange={(e) => {
                                        const newNotes = notes.map(n => n.id === activeNote.id ? { ...n, text: e.target.value } : n);
                                        setNotes(newNotes);
                                    }}
                                    onBlur={(e) => updateNote(activeNote.id, 'text', e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute bottom-2 right-4 flex gap-1 opacity-20 hover:opacity-100 transition-opacity bg-black/10 p-1 rounded-full backdrop-blur-sm z-10">
                                    {NOTE_COLORS.map(c => (
                                        <button key={c.name} onClick={() => updateNote(activeNote.id, 'color', c.name)} className={`w-4 h-4 rounded-full border border-white/20 shadow-sm ${c.btn} hover:scale-125 transition-transform`} title={c.name}/>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                <span className="text-3xl mb-2">📝</span>
                                <p className="text-xs">Sin notas abiertas.</p>
                                <button onClick={addNote} className="mt-3 text-xs bg-indigo-600 px-3 py-1.5 rounded-lg text-white hover:bg-indigo-500">Crear una</button>
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none z-0"><span className="text-black/50 text-[8px] rotate-45">◢</span></div>
                    </div>
                </div>
            )}

            {/* BOTÓN FLOTANTE */}
            <div 
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                className={`fixed z-[100] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] flex items-center justify-center border-2 border-white/20 cursor-grab active:cursor-grabbing transition-transform hover:scale-110 ${isOpen ? 'bg-yellow-400 text-black rotate-12' : 'bg-slate-800 text-yellow-400 hover:bg-slate-700'}`}
                style={{ left: position.x, top: position.y, touchAction: 'none' }}
                title="Notas Rápidas (Arrastra para mover)"
            >
                <span className="text-2xl pointer-events-none">📝</span>
            </div>
        </>
    );
};

export default QuickNotesWidget;