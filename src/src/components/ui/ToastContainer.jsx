// src/components/ui/ToastContainer.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { TOAST_EVENT_NAME } from '../../utils/toast';

const STYLES_BY_TYPE = {
    info: 'bg-slate-800 border-slate-600 text-white',
    success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
    error: 'bg-red-900/90 border-red-500 text-red-100',
    warning: 'bg-amber-900/90 border-amber-500 text-amber-100',
};

const ICON_BY_TYPE = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const toast = e.detail;
            setToasts((prev) => [...prev, toast]);
            window.setTimeout(() => dismiss(toast.id), toast.durationMs || 4000);
        };
        window.addEventListener(TOAST_EVENT_NAME, handler);
        return () => window.removeEventListener(TOAST_EVENT_NAME, handler);
    }, [dismiss]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    role="alert"
                    onClick={() => dismiss(t.id)}
                    className={`pointer-events-auto cursor-pointer border rounded-lg shadow-2xl px-4 py-3 flex items-start gap-2 animate-[fadeIn_0.2s_ease-out] whitespace-pre-line text-sm ${STYLES_BY_TYPE[t.type] || STYLES_BY_TYPE.info}`}
                >
                    <span>{ICON_BY_TYPE[t.type] || ICON_BY_TYPE.info}</span>
                    <span className="flex-1">{t.message}</span>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
