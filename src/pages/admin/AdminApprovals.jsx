import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Check, X, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminApprovals = () => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, usersRes] = await Promise.all([
                api.get('/events?role=admin'),
                api.get('/users')
            ]);

            setPendingEvents(eventsRes.data.filter(e => e.status === 'pending'));
            setPendingUsers(usersRes.data.filter(u => u.organizerRequest === true && u.role !== 'organizer'));
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to fetch pending items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Event Actions
    const handleApproveEvent = async (id) => {
        try {
            await api.put(`/events/${id}/approve`);
            toast.success('Event approved!');
            fetchData();
        } catch (error) {
            toast.error('Failed to approve event');
        }
    };

    const handleRejectEvent = async (id) => {
        if (window.confirm('Reject and delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                toast.success('Event rejected');
                fetchData();
            } catch (error) {
                toast.error('Failed to reject event');
            }
        }
    };

    // User Actions
    const handleApproveUser = async (uid) => {
        try {
            await api.put(`/users/${uid}/role`, { role: 'organizer' });
            toast.success("User approved as Organizer");
            fetchData();
        } catch (error) {
            console.error("Failed to approve user", error);
            toast.error("Failed to approve user");
        }
    };

    const handleRejectUser = async (uid) => {
        try {
            await api.put(`/users/${uid}/role`, { role: 'participant' });
            toast.success("Request rejected");
            fetchData();
        } catch (error) {
            console.error("Failed to reject request", error);
            toast.error("Failed to reject request");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading approvals...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Pending Approvals</h1>

            {/* Pending Users Section */}
            <div className="mb-12">
                <h2 className="text-xl font-semibold text-orange-600 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Pending Organizer Requests
                </h2>
                {pendingUsers.length === 0 ? (
                    <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm">No pending organizer requests.</p>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-orange-200">
                        <ul className="divide-y divide-gray-200">
                            {pendingUsers.map((user) => (
                                <li key={user.uid} className="px-6 py-4 flex items-center justify-between hover:bg-orange-50 transition-colors">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">ID: {user.uid}</div>
                                        <div className="text-xs text-orange-500 mt-1 font-medium">Requested Organizer Access</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApproveUser(user.uid)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <Check className="h-3 w-3 mr-1" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectUser(user.uid)}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <X className="h-3 w-3 mr-1" /> Reject
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Pending Events Section */}
            <div>
                <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Pending Event Approvals
                </h2>
                {pendingEvents.length === 0 ? (
                    <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm">No pending events.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100">
                                <img
                                    src={event.imageUrl || 'https://via.placeholder.com/400x200'}
                                    alt={event.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                                    <div className="flex justify-between mt-4">
                                        <button
                                            onClick={() => handleRejectEvent(event.id)}
                                            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                                        >
                                            <X size={16} className="mr-2" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleApproveEvent(event.id)}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                                        >
                                            <Check size={16} className="mr-2" /> Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminApprovals;
