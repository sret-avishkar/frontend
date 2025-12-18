import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar } from 'lucide-react';

const About = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                const allEvents = response.data;
                // Filter for past events
                const pastEvents = allEvents.filter(event => new Date(event.date) < new Date());
                setEvents(pastEvents);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">About Aviskhar</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Aviskhar is the annual techno-cultural fest that brings together the brightest minds and creative talents.
                        We provide a platform for students to showcase their skills, compete, and learn.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-gray-600 mb-6">
                            To foster innovation, creativity, and technical excellence among students by providing a world-class platform for competition and collaboration.
                        </p>

                        <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                        <p className="text-gray-600 mb-4">
                            Take a look at some of our memorable moments from previous years.
                        </p>

                        {/* Past Events Gallery */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading memories...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No past memories found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                                {events.map((event) => (
                                    <div key={event.id} className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer h-64">
                                        <img
                                            src={event.imageUrl || 'https://via.placeholder.com/400x400'}
                                            alt={event.title}
                                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-sm">
                                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-200">
                                                <Calendar size={16} />
                                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
