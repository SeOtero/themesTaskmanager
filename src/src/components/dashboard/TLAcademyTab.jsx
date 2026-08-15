import React, { useState } from 'react';

const TLAcademyTab = ({ 
    quizzes, 
    editingQuiz, 
    setEditingQuiz, 
    saveQuiz, 
    deleteQuiz, 
    toggleQuiz 
}) => {
    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {!editingQuiz ? (
                <>
                    <button onClick={() => setEditingQuiz({ title: '', reward: 100, questions: [], version: 1 })} className="bg-green-600 px-4 py-2 rounded-lg font-bold text-sm mb-6">+ Nuevo Módulo</button>
                    <div className="grid gap-4">
                        {quizzes.map(q => (
                            <div key={q.id} className="bg-slate-900 p-5 rounded-xl border border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{q.title}</h3>
                                    <div className="text-xs text-slate-500">Reward: {q.reward} | v{q.version}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingQuiz(q)} className="text-indigo-400 text-xs bg-indigo-900/30 px-3 py-1 rounded">Edit</button>
                                    <button onClick={() => toggleQuiz(q)} className={`text-xs px-3 py-1 rounded ${q.active ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{q.active ? 'Activo' : 'Inactivo'}</button>
                                    <button onClick={() => deleteQuiz(q.id)} className="text-red-400 text-xs bg-red-900/30 px-3 py-1 rounded">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <QuizEditor quiz={editingQuiz} onSave={saveQuiz} onCancel={() => setEditingQuiz(null)} />
            )}
        </div>
    );
};

// COMPONENTE INTERNO (Traído de tu archivo original)
const QuizEditor = ({ quiz, onSave, onCancel }) => {
    const [form, setForm] = useState(quiz);
    const [isMajorUpdate, setIsMajorUpdate] = useState(false);
    
    const addQ = () => setForm({ ...form, questions: [...(form.questions || []), { text: '', options: ['', ''], correct: 0 }] });
    const updQ = (i, f, v) => { const qs = [...form.questions]; qs[i] = { ...qs[i], [f]: v }; setForm({ ...form, questions: qs }); };
    const updOpt = (qI, oI, v) => { const qs = [...form.questions]; qs[qI].options[oI] = v; setForm({ ...form, questions: qs }); };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-white/10 space-y-4 animate-fadeIn">
            <h2 className="font-bold text-xl border-b border-white/10 pb-2">Editor de Módulo</h2>
            <div className="grid grid-cols-2 gap-4">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" className="bg-black/30 border border-white/10 p-2 rounded text-white" />
                <input type="number" value={form.reward} onChange={e => setForm({ ...form, reward: parseInt(e.target.value) })} placeholder="Reward" className="bg-black/30 border border-white/10 p-2 rounded text-white" />
            </div>
            {quiz.id && <label className="flex items-center gap-2 text-yellow-200 text-xs"><input type="checkbox" checked={isMajorUpdate} onChange={e => setIsMajorUpdate(e.target.checked)} /> Actualización Mayor (Reinicia progress)</label>}
            <div className="space-y-4">
                {form.questions?.map((q, i) => (
                    <div key={i} className="bg-black/20 p-4 rounded border border-white/5">
                        <input value={q.text} onChange={e => updQ(i, 'text', e.target.value)} placeholder="Pregunta" className="w-full bg-transparent border-b border-white/10 mb-2 font-bold" />
                        <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oI) => (
                                <div key={oI} className="flex gap-2">
                                    <input type="radio" checked={q.correct === oI} onChange={() => updQ(i, 'correct', oI)} />
                                    <input value={opt} onChange={e => updOpt(i, oI, e.target.value)} className="bg-white/5 rounded px-2 text-xs w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={addQ} className="w-full py-2 border border-dashed border-white/20 text-slate-400 text-xs rounded">+ Pregunta</button>
            </div>
            <div className="flex gap-4">
                <button onClick={() => onSave({ ...form, isMajorUpdate })} className="flex-1 bg-green-600 py-2 rounded font-bold">Guardar</button>
                <button onClick={onCancel} className="bg-slate-700 px-4 rounded">Cancelar</button>
            </div>
        </div>
    );
};

export default TLAcademyTab;