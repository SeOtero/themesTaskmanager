import { useState, useEffect, useCallback, useRef } from 'react';
import { getWalletBalance, saveWalletBalance } from '../services/wallet.service';

export const useWallet = (user) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Ref para el debounce (evita guardar en cada click)
    const timeoutRef = useRef(null);
    const pendingBalanceRef = useRef(null); // Guarda el saldo pendiente de escritura

    // 1. Carga inicial
    useEffect(() => {
        if (!user?.uid) return;
        const loadData = async () => {
            try {
                setLoading(true);
                const serverBalance = await getWalletBalance(user.uid);
                setBalance(serverBalance);
                pendingBalanceRef.current = serverBalance; // Sincronizamos
            } catch (error) {
                console.error("Falló la carga de billetera");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    // 2. Función de actualización con DEBOUNCE
    const updateBalance = useCallback((newAmount) => {
        if (!user?.uid) return;

        // A. Optimistic UI: Actualizamos pantalla YA
        setBalance(newAmount);
        pendingBalanceRef.current = newAmount;

        // B. Cancelamos guardado anterior si existe
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // C. Programamos nuevo guardado en 2 segundos
        timeoutRef.current = setTimeout(async () => {
            try {
                // Guardamos el ÚLTIMO valor conocido
                const finalAmount = pendingBalanceRef.current;
                await saveWalletBalance(user.uid, finalAmount);
                console.log("💰 Saldo guardado en Firebase:", finalAmount);
            } catch (error) {
                console.error("Error guardando saldo, revertimos...");
                // Si falla, recargamos el real
                const real = await getWalletBalance(user.uid);
                setBalance(real);
            }
        }, 2000); // 2 segundos de espera

    }, [user]);

    const addCoins = (amount) => updateBalance(balance + amount);
    
    const spendCoins = (amount) => {
        if (balance >= amount) {
            updateBalance(balance - amount);
            return true; 
        }
        return false; 
    };

    return {
        balance,       
        loading,      
        updateBalance, 
        addCoins,      
        spendCoins     
    };
};