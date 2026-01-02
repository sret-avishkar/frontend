import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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
                const messaging = getMessaging();
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                    const currentToken = await getToken(messaging, {
                        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
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

        try {
            const messaging = getMessaging();
            onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                toast(payload.notification.body, {
                    icon: '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            });
        } catch (err) {
            console.error("FCM Foreground listener error", err);
        }
    }, [currentUser]);


    // 3. Listen to Notifications Collection in Firestore
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

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
            setUnreadCount(notifs.filter(n => !n.read).length);
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

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fcmToken
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
