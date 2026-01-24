import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminEvents from './AdminEvents';
import AdminApprovals from './AdminApprovals';
import AdminAttendance from './AdminAttendance';
import AdminParticipants from './AdminParticipants';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import AdminData from './AdminData';
import AdminMessages from './AdminMessages';
import AdminNotifications from './AdminNotifications';
import { useAuth } from '../../context/AuthContext';

import { DashboardSkeleton } from '../../components/Skeleton';

const AdminDashboard = () => {
    // STRICT CHECK: Only redirect if we are SURE the role is NOT admin.
    // Hack: Allow 'admin@avishkar.com' explicitly to bypass race conditions where role might flash as 'participant'
    const { userRole, loading, currentUser } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (userRole && userRole !== 'admin' && currentUser?.email !== 'admin@avishkar.com') {
        return <Navigate to="/dashboard" />;
    }

    // Double safety
    if (userRole !== 'admin') return <DashboardSkeleton />;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-40 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-gray-800 rounded">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>
            </div>

            {/* Sidebar with mobile props */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
                <Routes>
                    <Route index element={<AdminOverview />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="approvals" element={<AdminApprovals />} />
                    <Route path="attendance" element={<AdminAttendance />} />
                    <Route path="participants" element={<AdminParticipants />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="data" element={<AdminData />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
