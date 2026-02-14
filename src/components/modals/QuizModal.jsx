import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet'; // Usamos el hook que creamos antes
// Importa confetti si lo usas

const QuizModal = ({ isOpen, onClose, quiz, user }) => {
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const { addCoins } = useWallet(user);

    if (!isOpen || !quiz) return null;

    const handleSubmit = () => {
        let correct = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correct) correct++;
        });

        const passed = correct >= quiz.questions.length; // O la lógica que tengas
        
        if (passed) {
            addCoins(quiz.reward || 0);
            // Aquí podrías llamar a una función para marcar el quiz como completado en firebase
        }

        setScore({ correct, total: quiz.questions.length, passed });
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                {/* ... AQUÍ PEGAS TODO EL JSX DEL QUIZ QUE TIENES EN APP.JSX ... */}
                
                {/* Ejemplo del botón de cerrar */}
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default QuizModal;