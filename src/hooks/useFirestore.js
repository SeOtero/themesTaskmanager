import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirestoreDoc = (collectionName, docId, initialValue, currentUser) => {
    const [data, setData] = useState(initialValue);
    const [loading, setLoading] = useState(true);

    const getDocRef = useCallback(() => {
        if (!currentUser) return null;
        // Estructura: users/{uid}/{collectionName}/{docId}
        return doc(db, 'users', currentUser.uid, collectionName, docId);
    }, [currentUser, collectionName, docId]);

    useEffect(() => {
        const docRef = getDocRef();
        if (!docRef) {
            setLoading(false); 
            return;
        }

        const unsubscribe = onSnapshot(docRef, (snap) => {
            setLoading(false);
            if (snap.exists()) {
                setData(snap.data().val);
            } else {
                setData(initialValue);
            }
        }, (err) => {
            console.error("Firestore read error", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [getDocRef]);

    const setValue = async (newValue) => {
        const docRef = getDocRef();
        if (!docRef) return;

        // Actualización optimista (UI instantánea)
        setData(newValue); 
        
        try {
            await setDoc(docRef, { val: newValue }, { merge: true });
        } catch (e) {
            console.error("Error writing to Firestore", e);
        }
    };

    return [data, setValue, loading];
};