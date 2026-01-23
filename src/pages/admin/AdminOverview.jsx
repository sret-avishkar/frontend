import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Users, CheckSquare, Clock } from 'lucide-react';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingApprovals: 0,
        totalParticipants: 0, // This would ideally come from a real stats endpoint
        daysLeft: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch events and users to count totals and pending
                const [eventsRes, usersRes] = await Promise.all([
                    api.get('/events?role=admin'),
                    api.get('/users')
                ]);

                const allEvents = eventsRes.data;
                const pendingEvents = allEvents.filter(e => e.status === 'pending').length;

                const allUsers = usersRes.data;
                const pendingUsers = allUsers.filter(u => u.organizerRequest === true && u.role !== 'organizer').length;

                // Fetch settings for deadline
                const settingsRes = await api.get('/settings');
                let daysLeft = 0;
                if (settingsRes.data.registrationDeadline) {
                    const diff = new Date(settingsRes.data.registrationDeadline) - new Date();
                    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                }

                setStats({
                    totalEvents: allEvents.length,
                    pendingApprovals: pendingEvents + pendingUsers,
                    totalParticipants: allUsers.filter(u => u.role === 'participant').length,
                    daysLeft: daysLeft > 0 ? daysLeft : 0
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color} text-white`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Events"
                    value={stats.totalEvents}
                    icon={Calendar}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={CheckSquare}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Days Left"
                    value={stats.daysLeft}
                    icon={Clock}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Participants"
                    value={stats.totalParticipants}
                    icon={Users}
                    color="bg-purple-500"
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <a href="/admin/events" className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Manage Events</a>
                    <a href="/admin/approvals" className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100">Review Approvals</a>
                    <a href="/admin/settings" className="px-4 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">Update Settings</a>
                    <a href="/admin/data" className="px-4 py-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100">Data Management</a>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
