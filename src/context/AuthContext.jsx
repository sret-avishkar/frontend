import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDocFromServer, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userDocRef = doc(db, "users", user.uid);

            // Check if user exists
            const userDoc = await getDocFromServer(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    role: 'participant',
                    createdAt: new Date().toISOString(),
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
                setUserRole('participant');
            }
            // If they exist, the onSnapshot listener below will handle the role update automatically
            return user;
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                setLoading(true); // START LOADING immediately when user is found

                // Subscribe to real-time updates for the user's role
                const userDocRef = doc(db, "users", user.uid);
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();

                        // Normalize role
                        let role = (userData.role || 'participant').toLowerCase().trim();
                        if (role === 'conductor') role = 'organizer';

                        setUserRole(role);

                        // Attach custom data
                        user.organizerRequest = userData.organizerRequest || userData.conductorRequest;
                        user.mobileNumber = userData.mobileNumber;
                        user.name = userData.name || userData.displayName;
                    } else {
                        setUserRole('participant');
                    }
                    setLoading(false); // STOP LOADING once data is ready
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setUserRole('participant');
                    setLoading(false);
                });

            } else {
                // User logged out
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
                setCurrentUser(null);
                setUserRole(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const value = {
        currentUser,
        userRole,
        loading,
        signInWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};