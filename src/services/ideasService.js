// src/services/ideasService.js
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Función para ENVIAR una idea
export const submitIdeaToFirebase = async (user, text, type) => {
    if (!user || !text.trim()) throw new Error("Datos inválidos");

    await addDoc(collection(db, "monday_ideas"), {
        uid: user.uid,
        author: user.displayName || user.email,
        content: text,
        type: type, // 'monday' o 'dev'
        status: 'new',
        timestamp: Date.now(),
        timestampStr: new Date().toLocaleString()
    });
};

// Función para ESCUCHAR el historial (Subscription)
export const subscribeToIdeasHistory = (userId, callback) => {
    if (!userId) return () => {};

    const q = query(
        collection(db, "monday_ideas"), 
        where("uid", "==", userId),
        orderBy("timestamp", "desc")
    );

    // onSnapshot es "en vivo", ejecuta el callback cada vez que cambia algo
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(data);
    });
};