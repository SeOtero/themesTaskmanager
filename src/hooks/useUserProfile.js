import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

export const useUserProfile = (user) => {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    // SEBASTIÁN: Si eres nuevo, te crea como agente de Team 1
                    const newProfile = { 
                        name: "Sebastián",
                        role: 'agent', 
                        team: 'team1' 
                    };
                    await setDoc(docRef, newProfile);
                    setProfile(newProfile);
                }
            } catch (e) { console.error(e); }
            setLoadingProfile(false);
        };
        fetchProfile();
    }, [user]);

    return { profile, loadingProfile };
};