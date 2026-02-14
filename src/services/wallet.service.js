// src/services/wallet.service.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate que esta ruta sea correcta para tu proyecto

// 1. HELPER (Esta es la función que te faltaba o estaba mal ubicada)
const cleanDataStructure = (data) => {
    if (!data) return 0;
    if (typeof data === 'number') return data;
    // Recursividad: Si encuentra un objeto 'val', se mete dentro
    if (data.val) return cleanDataStructure(data.val);
    
    // Fallback: busca propiedades conocidas
    return Number(data.value) || Number(data.coins) || Number(data.lofiCoins) || 0;
};

// 2. OBTENER SALDO
export const getWalletBalance = async (userId) => {
    try {
        const ref = doc(db, 'users', userId, 'data', 'wallet');
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
            // Aquí es donde fallaba antes porque no encontraba la función de arriba
            return cleanDataStructure(snap.data());
        }
        return 0; 
    } catch (error) {
        console.error("Error en servicio getWalletBalance:", error);
        throw error;
    }
};

// 3. GUARDAR SALDO
export const saveWalletBalance = async (userId, amount) => {
    // Protección: Aseguramos que sea número antes de enviar
    const finalAmount = typeof amount === 'object' ? cleanDataStructure(amount) : Number(amount);

    const ref = doc(db, 'users', userId, 'data', 'wallet');
    
    const payload = {
        val: { value: finalAmount, coins: finalAmount, lofiCoins: finalAmount },
        value: finalAmount,
        coins: finalAmount,
        lofiCoins: finalAmount
    };

    await setDoc(ref, payload); 
    return finalAmount;
};