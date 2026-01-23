import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fcmToken, setFcmToken] = useState(null);

    // 1. Initialize FCM and Request Permission
    useEffect(() => {
        const requestPermission = async () => {
            if (!currentUser) return;

            try {
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    // console.log('Notification permission granted.');

                    const messaging = getMessaging();

                    // Register Service Worker with Config Queries
                    const firebaseConfig = {
                        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                        appId: import.meta.env.VITE_FIREBASE_APP_ID,
                    };

                    const swUrlParams = new URLSearchParams(firebaseConfig).toString();

                    // Register the SW
                    await navigator.serviceWorker.register(
                        `/firebase-messaging-sw.js?${swUrlParams}`
                    );

                    // Wait for it to be ready
                    const swRegistration = await navigator.serviceWorker.ready;

                    const currentToken = await getToken(messaging, {
                        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                        serviceWorkerRegistration: swRegistration
                    });

                    if (currentToken) {
                        setFcmToken(currentToken);
                        // Save token to user's document
                        await setDoc(doc(db, "users", currentUser.uid), {
                            fcmTokens: arrayUnion(currentToken)
                        }, { merge: true });
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.log('Unable to get permission to notify.');
                }
            } catch (error) {
                console.error('An error occurred while retrieving token. ', error);
            }
        };

        requestPermission();
    }, [currentUser]);

    // 2. Listen for Foreground Messages
    useEffect(() => {
        if (!currentUser) return;

        let unsubscribe;
        try {
            const messaging = getMessaging();
            unsubscribe = onMessage(messaging, (payload) => {
                // console.log('[NotificationContext] Foreground Message received: ', payload);
                // Handle data-only payload
                const { title, body } = payload.data || payload.notification || {};

                if (body) {
                    toast.success(body, {
                        duration: 5000,
                        icon: '🔔',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                }
            });
        } catch (err) {
            console.error("FCM Foreground listener error", err);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser]);


    // 3. Listen to Notifications Collection in Firestore
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Trigger Cleanup on mount/user change
        api.post(`/users/${currentUser.uid}/notifications/cleanup`)
            .catch(err => console.error("Notification cleanup failed", err));

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setUnreadCount(Array.isArray(notifs) ? notifs.filter(n => !n.read).length : 0);
        }, (error) => {
            console.error("Notification listener error:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 4. Mark as Read Function
    const markAsRead = async (notificationId) => {
        if (!notificationId) return;
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true
            });
            // Optimistic update handled by listener, but good to have
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!Array.isArray(notifications)) return;
        const unreadNotifications = notifications.filter(n => !n.read);
        const batch = []; // Firestore batch would be better here but let's do simple updates for now
        // Or actually, batch writes are better
        // Simulating batch for this example as we don't have writeBatch imported directly usually in basic context
        // We can just loop promises
        try {
            await Promise.all(unreadNotifications.map(n =>
                updateDoc(doc(db, 'notifications', n.id), { read: true })
            ));
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };


    const clearToken = async () => {
        if (!currentUser || !fcmToken) return;
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                fcmTokens: arrayRemove(fcmToken)
            });
            setFcmToken(null);
            // console.log("FCM Token removed from Firestore on logout.");
        } catch (error) {
            console.error("Error removing FCM token:", error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fcmToken,
        clearToken
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

