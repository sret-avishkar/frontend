import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventForm from '../../components/EventForm';
import api from '../../services/api';
import { Plus, X, Users, QrCode, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

const OrganizerDashboard = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const fetchEvents = async () => {
        if (!currentUser) return;
        try {
            // Pass organizerId query param. The backend should handle looking up in 'organizerIds' array.
            const response = await api.get(`/events?organizerId=${currentUser.uid}`);

            // Sort by Date descending (latest first)
            const sortedEvents = [...response.data].sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setEvents(sortedEvents);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentUser]);

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setShowCreateModal(true);
    };

    if (!currentUser || (currentUser && !userRole)) {
        return <DashboardSkeleton />;
    }

    // STRICT CHECK: Only redirect if we are SURE the role is NOT organizer.
    if (userRole && userRole !== 'organizer') {
        return <div className="p-8 text-center">Access Denied. Organizer privileges required.</div>;
    }

    // Safety check
    if (userRole !== 'organizer') return <DashboardSkeleton />;

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/organizer/scan"
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            <QrCode size={20} /> Scan QR
                        </Link>
                        <button
                            onClick={() => {
                                setEditingEvent(null);
                                setShowCreateModal(true);
                            }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                            <Plus size={20} /> Create Event
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6">Manage Events</h2>
                    {events.length === 0 ? (
                        <p className="text-gray-500">No events found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                    <img
                                        src={event.imageUrl || 'https://via.placeholder.com/400x200'}
                                        alt={event.title}
                                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => navigate(`/events/${event.id}`, { state: { from: '/organizer' } })}
                                    />
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                                {event.category}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full font-semibold capitalize ${event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    event.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {event.status || 'pending'}
                                                </span>
                                                <span className="text-green-600 font-bold">₹{event.price}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/events/${event.id}`, { state: { from: '/organizer' } })}>{event.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{event.description}</p>
                                        <div className="text-sm text-gray-500 mb-4">
                                            <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                                            <p>📍 {event.venue}</p>
                                        </div>

                                        <div className="mt-auto space-y-2">
                                            <button
                                                onClick={() => navigate(`/organizer/events/${event.id}/participants`)}
                                                className="w-full flex items-center justify-center gap-2 bg-purple-100 text-purple-700 py-2 rounded-md hover:bg-purple-200 transition-colors"
                                            >
                                                <Users size={18} /> View Participants
                                            </button>
                                            <button
                                                onClick={() => handleEditEvent(event)}
                                                className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 transition-colors"
                                            >
                                                Edit Event
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                        >
                            <X size={24} />
                        </button>
                        <div className="p-6">
                            <EventForm
                                initialData={editingEvent}
                                onEventCreated={() => {
                                    fetchEvents();
                                    setShowCreateModal(false);
                                    setEditingEvent(null);
                                }} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrganizerDashboard;
