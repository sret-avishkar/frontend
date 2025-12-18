import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
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
        fetchEvents();
    }, []);

    const handleRegister = (eventId) => {
        // Placeholder for future logic if needed
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

    // Set default category if none selected and categories exist
    useEffect(() => {
        if (!selectedCategory && allCategories.length > 0) {
            setSelectedCategory(allCategories[0]);
        }
    }, [allCategories, selectedCategory]);

    const displayedCategories = selectedCategory ? [selectedCategory] : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-100">
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Explore Events</h1>
                    <p className="text-xl text-gray-300">Discover and participate in various technical and non-technical events.</p>
                </div>

                {/* Category Filter Bar */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {allCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-white/10 backdrop-blur-md
                            ${selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {category}
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
                            <h2 className="text-2xl font-bold text-gray-100 mb-8 capitalize flex items-center gap-3">
                                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                {category} Events
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {groupedEvents[category]?.map((event) => {
                                    const availableSlots = event.slots ? event.slots - (event.registeredCount || 0) : null;

                                    return (
                                        <Link to={`/events/${event.id}`} key={event.id} className="block h-full group">
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/20 flex flex-col h-full">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={event.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop'}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold text-blue-400 shadow-sm border border-white/10">
                                                        ₹{event.price}
                                                    </div>
                                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20 capitalize">
                                                        {event.category}
                                                    </div>
                                                </div>

                                                <div className="p-6 flex-grow flex flex-col">
                                                    <div className="flex items-center text-sm text-blue-400 font-medium mb-3">
                                                        <Calendar size={16} className="mr-2" />
                                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>

                                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                                                        {event.title}
                                                    </h3>

                                                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                                                        {event.description}
                                                    </p>

                                                    <div className="space-y-2 mb-6">
                                                        <div className="flex items-center text-sm text-gray-400">
                                                            <MapPin size={16} className="mr-2 text-red-400" />
                                                            {event.venue}
                                                        </div>
                                                        {(event.organizerName || event.organizerEmail) && (
                                                            <div className="flex items-center text-sm text-gray-400">
                                                                <User size={16} className="mr-2 text-purple-400" />
                                                                Organizer: <span className="font-medium ml-1 text-gray-300">{event.organizerName || event.organizerEmail}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center text-sm text-gray-400">
                                                            <User size={16} className="mr-2 text-green-400" />
                                                            Slots: <span className={`font-medium ml-1 ${availableSlots === 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                {event.slots ? `${availableSlots} / ${event.slots}` : 'Unlimited'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Events;
