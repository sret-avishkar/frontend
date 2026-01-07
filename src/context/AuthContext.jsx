import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';

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

            // Check if user exists in Firestore, if not create them
            const userDocRef = doc(db, "users", user.uid);

            // Use Server fetch for initial strict check
            const userDoc = await getDocFromServer(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    role: 'participant', // Default role
                    createdAt: new Date().toISOString(),
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
                setUserRole('participant');
            } else {
                const userData = userDoc.data();
                const role = (userData.role || 'participant').toLowerCase().trim();
                setUserRole(role === 'conductor' ? 'organizer' : role);
            }
            return user;
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Fetch user role from Firestore
                try {
                    // Force server fetch to avoid stale role cache
                    const userDoc = await getDocFromServer(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        // Robust role normalization
                        let role = (userData.role || 'participant').toLowerCase().trim();
                        if (role === 'conductor') role = 'organizer';

                        // --- EMERGENCY FIX: FORCE ADMIN ROLE for specific email ---
                        // The database record for this email is missing the 'role' field.
                        // We strictly override it here to ensure access.
                        if (user.email === 'admin@aviskhar.com') {
                            console.warn("Applying Admin Override for admin@aviskhar.com");
                            role = 'admin';
                        }
                        // -------------------------------------------------------------

                        setUserRole(role);
                        // Attach custom data to currentUser object or separate state
                        user.organizerRequest = userData.organizerRequest || userData.conductorRequest;
                    } else {
                        // Default role or handle new user
                        setUserRole('participant');
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    // In error case, default to participant safely
                    setUserRole('participant');
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        loading,
        signInWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};