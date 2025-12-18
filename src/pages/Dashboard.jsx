import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { X, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

const Dashboard = () => {
    const { currentUser, userRole } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [myRegistrations, setMyRegistrations] = useState([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedQRData, setSelectedQRData] = useState(null);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRegistrations = async () => {
        if (currentUser) {
            try {
                const response = await api.get(`/registrations/user/${currentUser.uid}`);
                setMyRegistrations(response.data);
            } catch (error) {
                console.error("Failed to fetch my registrations", error);
            }
        }
    };

    useEffect(() => {
        fetchEvents();
        if (userRole === 'participant') {
            fetchMyRegistrations();
        }
    }, [currentUser, userRole]);

    const handleRegister = (eventId) => {
        window.location.href = `/events/${eventId}`;
    };

    const handleShowQR = (event) => {
        // Find registration for this event
        // Note: Assuming myRegistrations contains eventId or we can match by title/date if needed.
        // Ideally the registration object has the eventId.
        // If not, we might need to rely on the backend response structure.
        // Let's assume we can construct the QR data: { registrationId: ..., userId: ... }
        // For now, let's look for the registration object.
        const registration = myRegistrations.find(r => r.eventTitle === event.title); // Fallback matching if eventId missing

        if (registration) {
            // The QR code should ideally contain the registration ID for the scanner to verify.
            setSelectedQRData(JSON.stringify({
                registrationId: registration.id,
                userId: currentUser.uid,
                eventId: event.id
            }));
            setSelectedEventTitle(event.title);
            setShowQRModal(true);
        } else {
            // Fallback if we can't find the specific registration object but we know they are registered
            // This might happen if the data structure is different.
            // We'll just encode the user and event ID.
            setSelectedQRData(JSON.stringify({
                userId: currentUser.uid,
                eventId: event.id
            }));
            setSelectedEventTitle(event.title);
            setShowQRModal(true);
        }
    };

    const isRegistered = (eventId) => {
        // Check if any registration matches this event ID
        // Assuming registration object has 'eventId' field. If not, we might need to check titles.
        // Let's check both to be safe given I can't see the exact API response.
        return myRegistrations.some(reg => reg.eventId === eventId || reg.eventTitle === events.find(e => e.id === eventId)?.title);
    };

    if (!currentUser) {
        return <div className="p-8 text-center">Please log in to view the dashboard.</div>;
    }

    // Redirect Admin/Organizer
    if (userRole === 'admin') {
        window.location.href = '/admin';
        return null;
    }
    if (userRole === 'organizer') {
        window.location.href = '/organizer';
        return null;
    }

    // Redirect Pending Approval
    if (currentUser?.organizerRequest && userRole !== 'organizer') {
        window.location.href = '/pending-approval';
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                            {userRole || 'Participant'}
                        </span>
                    </div>
                </div>

                {/* My Registrations Section - Only show if there are registrations */}
                {myRegistrations.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">My Registered Events</h2>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myRegistrations.map((reg) => (
                                        <tr key={reg.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{reg.eventTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(reg.eventDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{reg.eventVenue}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {reg.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Events List */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
                    {loading ? (
                        <p>Loading events...</p>
                    ) : events.length === 0 ? (
                        <p className="text-gray-500">No events found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => {
                                const registered = myRegistrations.find(r => r.eventId === event.id || r.eventTitle === event.title);
                                return (
                                    <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                        <img
                                            src={event.imageUrl || 'https://via.placeholder.com/400x200'}
                                            alt={event.title}
                                            className="w-full h-48 object-cover cursor-pointer"
                                            onClick={() => window.location.href = `/events/${event.id}`}
                                        />
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                                    {event.category}
                                                </span>
                                                <span className="text-green-600 font-bold">₹{event.price}</span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 cursor-pointer hover:text-blue-600" onClick={() => window.location.href = `/events/${event.id}`}>{event.title}</h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{event.description}</p>
                                            <div className="text-sm text-gray-500 mb-4">
                                                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                                                <p>📍 {event.venue}</p>
                                            </div>

                                            <div className="mt-auto space-y-2">
                                                {registered && (registered.status === 'confirmed' || registered.status === 'approved' || registered.status === 'paid') ? (
                                                    <button
                                                        onClick={() => handleShowQR(event)}
                                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                                                    >
                                                        <QrCode size={18} /> View Entry QR
                                                    </button>
                                                ) : registered ? (
                                                    <div className="w-full bg-yellow-100 text-yellow-800 py-2 rounded-md text-center text-sm font-medium border border-yellow-200">
                                                        Registration Pending / In Review
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegister(event.id)}
                                                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        View & Register
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative animate-fade-in-up">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Entry Pass</h3>
                            <p className="text-gray-600 mb-6">{selectedEventTitle}</p>
                            <div className="bg-white p-4 inline-block rounded-lg border-2 border-dashed border-gray-300">
                                <QRCode value={selectedQRData || ''} size={200} />
                            </div>
                            <p className="text-sm text-gray-500 mt-4">Show this QR code at the venue entrance.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
