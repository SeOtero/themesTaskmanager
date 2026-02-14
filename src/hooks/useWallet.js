import { useState, useEffect, useCallback } from 'react';
import { getWalletBalance, saveWalletBalance } from '../services/wallet.service';

export const useWallet = (user) => {
    // Estado local para la UI (para que se vea rápido)
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // useEffect: Se ejecuta cuando cambia el 'user'
    useEffect(() => {
        if (!user?.uid) return;

        const loadData = async () => {
            try {
                setLoading(true);
                const serverBalance = await getWalletBalance(user.uid);
                setBalance(serverBalance);
            } catch (error) {
                console.error("Falló la carga de billetera");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Función para actualizar el saldo
    // Usamos 'useCallback' para optimizar rendimiento (evita que la función se recree en cada render)
    const updateBalance = useCallback(async (newAmount) => {
        if (!user?.uid) return;

        // 1. Optimistic UI: Actualizamos la pantalla INMEDIATAMENTE
        // El usuario siente que la app vuela, aunque Firebase tarde 200ms
        setBalance(newAmount);

        try {
            // 2. Background: Guardamos en Firebase
            await saveWalletBalance(user.uid, newAmount);
        } catch (error) {
            // Si falla, revertimos el cambio visual (Rollback)
            console.error("Error guardando, revirtiendo UI...");
            // Aquí podríamos volver a cargar el saldo real
            const real = await getWalletBalance(user.uid);
            setBalance(real);
        }
    }, [user]);

    // Helpers "sugar syntax" para hacerle la vida fácil a App.jsx
    const addCoins = (amount) => updateBalance(balance + amount);
    
    const spendCoins = (amount) => {
        if (balance >= amount) {
            updateBalance(balance - amount);
            return true; // Compra exitosa
        }
        return false; // Fondos insuficientes
    };

    // Retornamos el "Contrato": Lo único que App.jsx necesita saber
    return {
        balance,       // El número (ej: 1500)
        loading,       // Booleano (true/false)
        updateBalance, // Función genérica
        addCoins,      // Función helper
        spendCoins     // Función helper
    };
};