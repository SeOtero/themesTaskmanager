import React, { useState } from 'react';

const ReportViewer = ({ content, themeClasses, placeholder }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopy = () => {
        if (!content) return;
        if (navigator.clipboard && navigator.clipboard.writeText) { 
            navigator.clipboard.writeText(content).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); 
        } else { 
            // Fallback
            const textArea = document.createElement("textarea"); 
            textArea.value = content; 
            document.body.appendChild(textArea); 
            textArea.select(); 
            try { document.execCommand('copy'); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } catch (err) { console.error('Fallback copy failed', err); } 
            document.body.removeChild(textArea); 
        }
    };

    return (
        <div className="relative w-full group">
            <div className={`w-full p-5 rounded-xl font-mono text-sm whitespace-pre-wrap transition-colors duration-500 ${themeClasses.itemBg} ${themeClasses.secondaryText} min-h-[100px]`}>
                {content || <p className="text-center opacity-70 italic pt-8">{placeholder}</p>}
            </div>
            {content && (
                <button onClick={handleCopy} className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded transition-all duration-200 shadow-md flex items-center gap-1 ${isCopied ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} title="Copiar reporte">
                    {isCopied ? ( 
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> 
                            ¡Copiado!
                        </> 
                    ) : ( 
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copiar
                        </> 
                    )}
                </button>
            )}
        </div>
    );
};

export default ReportViewer;