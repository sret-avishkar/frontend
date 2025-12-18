import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, User, QrCode, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-qr-code';
import { CardSkeleton, Skeleton } from '../components/Skeleton';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const { currentUser, userRole } = useAuth();
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedQRData, setSelectedQRData] = useState(null);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                // Only show active/approved events, filter out completed/archived ones
                const activeEvents = response.data.filter(e => e.status === 'approved');
                setEvents(activeEvents);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRegistrations = async () => {
            if (currentUser && userRole === 'participant') {
                try {
                    const response = await api.get(`/registrations/user/${currentUser.uid}`);
                    setMyRegistrations(response.data);
                } catch (error) {
                    console.error("Failed to fetch registrations", error);
                }
            }
        };

        fetchEvents();
        fetchRegistrations();
    }, [currentUser, userRole]);

    const handleShowQR = (e, eventId, eventTitle) => {
        e.preventDefault(); // Prevent Link navigation
        const registration = myRegistrations.find(r => r.eventId === eventId);
        if (registration) {
            setSelectedQRData(JSON.stringify({
                registrationId: registration.id,
                userId: currentUser.uid,
                eventId: eventId
            }));
            setSelectedEventTitle(eventTitle);
            setShowQRModal(true);
        }
    };

    // Group events by category
    const groupedEvents = events.reduce((acc, event) => {
        const category = event.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(event);
        return acc;
    }, {});

    const allCategories = Object.keys(groupedEvents);

    // Set default category
    useEffect(() => {
        if (!selectedCategory && allCategories.length > 0) {
            setSelectedCategory(allCategories[0]);
        }
    }, [allCategories, selectedCategory]);

    const displayedCategories = selectedCategory ? [selectedCategory] : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-900 pb-20">
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Events</h1>
                    <p className="text-xl text-gray-600">Discover and participate in various technical and non-technical events.</p>
                </div>

                {/* Category Filter Bar */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {allCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border backdrop-blur-md
                            ${selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-600'
                                    : 'bg-white/70 text-gray-600 hover:bg-white hover:text-blue-600 border-gray-200'
                                }`}
                        >
                            {category.toUpperCase()}
                        </button>
                    ))}
                </div>

                {displayedCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No events found. Check back later!</p>
                    </div>
                ) : (
                    displayedCategories.map((category) => (
                        <div key={category} className="mb-16">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8 capitalize flex items-center gap-3">
                                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                {category} Events
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {groupedEvents[category]?.map((event) => {
                                    const isRegistered = myRegistrations.some(r => r.eventId === event.id);

                                    return (
                                        <div key={event.id} className="relative group h-full">
                                            <Link to={`/events/${event.id}`} className="block h-full">
                                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden">
                                                    <div className="relative h-48 overflow-hidden">
                                                        <img
                                                            src={event.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop'}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                                                            ₹{event.price}
                                                        </div>
                                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize shadow-sm">
                                                            {event.category}
                                                        </div>
                                                    </div>

                                                    <div className="p-6 flex-grow flex flex-col">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center text-sm text-blue-600 font-medium">
                                                                <Calendar size={16} className="mr-2" />
                                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                            </div>
                                                            {isRegistered && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                                                                    Registered
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                            {event.title}
                                                        </h3>

                                                        <p className="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* QR Code Button - Absolute positioned or inside content */}
                                            {isRegistered && (
                                                <div className="absolute bottom-4 right-4 z-20">
                                                    <button
                                                        onClick={(e) => handleShowQR(e, event.id, event.title)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg hover:bg-black transition-colors transform hover:scale-105"
                                                        title="View Entry QR"
                                                    >
                                                        <QrCode size={14} /> View QR
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* QR MOdal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in-up">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="text-center pt-2">
                            <h3 className="text-xl font-bold mb-1 text-gray-900">Entry Pass</h3>
                            <p className="text-blue-600 font-medium mb-6 text-sm">{selectedEventTitle}</p>

                            <div className="bg-white p-4 inline-block rounded-xl border-2 border-dashed border-gray-300 shadow-inner mb-4">
                                <QRCode value={selectedQRData || ''} size={180} />
                            </div>

                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                Show at entrance
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
