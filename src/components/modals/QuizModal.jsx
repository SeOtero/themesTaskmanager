import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';

const QuizModal = ({ quiz, onClose, onComplete, user }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const { addCoins } = useWallet(user);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    // ✅ Función unificada para obtener la respuesta correcta de Firebase
    const getCorrectAnswer = () => {
        return currentQuestion.correct !== undefined 
            ? currentQuestion.correct 
            : currentQuestion.correctAnswer;
    };

    const handleOptionClick = (optionIndex) => {
        if (showResult) return; 
        setSelectedOption(optionIndex);
    };

    const handleSubmit = () => {
        const dbAnswer = getCorrectAnswer();
        
        const chosen = Number(selectedOption);
        const correct = Number(dbAnswer);
        
        const isAnswerCorrect = chosen === correct;
        
        setIsCorrect(isAnswerCorrect);
        setShowResult(true);
    };

    const handleNext = () => {
        if (!isCorrect) {
            alert("❌ Respuesta incorrecta. ¡Inténtalo de nuevo!");
            setShowResult(false);
            setSelectedOption(null);
            return;
        }

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
            setIsCorrect(false);
        } else {
            const reward = quiz.reward || 50;
            addCoins(100); 
            onComplete(reward); 
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#0f111a] border border-indigo-500/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-indigo-500/30 bg-indigo-900/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-300">{quiz.title}</h3>
                        <span className="text-xs text-indigo-400">Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {/* Pregunta */}
                <div className="p-6 overflow-y-auto">
                    <p className="text-white text-lg font-medium mb-6">{currentQuestion.question}</p>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt, idx) => {
                            let itemClass = "w-full p-4 rounded-xl border text-left transition-all font-medium ";
                            
                            if (showResult) {
                                // ✅ CORRECCIÓN: El color ahora mira el mismo campo 'correct' de la DB
                                const correctIdx = Number(getCorrectAnswer());
                                
                                if (idx === correctIdx) {
                                    itemClass += "bg-green-900/50 border-green-500 text-green-300 ";
                                } else if (idx === selectedOption) {
                                    itemClass += "bg-red-900/50 border-red-500 text-red-300 ";
                                } else {
                                    itemClass += "bg-gray-800/50 border-gray-700 text-gray-500 opacity-50 ";
                                }
                            } else {
                                if (selectedOption === idx) itemClass += "bg-indigo-600 border-indigo-400 text-white shadow-lg scale-[1.02] ";
                                else itemClass += "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-500 ";
                            }

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleOptionClick(idx)}
                                    className={itemClass}
                                    disabled={showResult}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    {!showResult ? (
                        <button 
                            onClick={handleSubmit} 
                            disabled={selectedOption === null}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${selectedOption === null ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'}`}
                        >
                            CONFIRMAR RESPUESTA
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${isCorrect ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg'}`}
                        >
                            {isCorrect ? (currentQuestionIndex < quiz.questions.length - 1 ? "SIGUIENTE PREGUNTA ➜" : "¡RECLAMAR PREMIO! (100 Lofi Coins) 🎉") : "INTENTAR DE NUEVO"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;