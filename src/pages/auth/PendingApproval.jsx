import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

import { useNotifications } from '../../context/NotificationContext';

const PendingApproval = () => {
    const navigate = useNavigate();
    const { clearToken } = useNotifications();

    const handleLogout = async () => {
        try {
            await clearToken(); // Remove FCM Token
            await signOut(auth);
            toast.success("Logged out successfully");
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error);
            toast.error("Failed to log out");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h2>
                    <p className="text-gray-600 mb-6">
                        Your request for <strong>Organizer Access</strong> has been submitted and is awaiting Admin approval.
                    </p>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 text-left">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-orange-700">
                                    You can continue to use the application as a Participant, or log out and wait for approval.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
