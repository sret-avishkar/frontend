import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RegistrationModal from '../components/RegistrationModal';
import { ArrowLeft, Calendar, MapPin, Tag, Clock } from 'lucide-react';
import BackgroundWrapper from '../components/BackgroundWrapper';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deadline, setDeadline] = useState(null);

    useEffect(() => {
        const fetchEventAndSettings = async () => {
            try {
                const [eventRes, settingsRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get('/settings'),
                ]);

                setEvent(eventRes.data);

                setDeadline(
                    settingsRes.data.registrationDeadline
                        ? new Date(settingsRes.data.registrationDeadline)
                        : new Date('2025-12-25')
                );
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndSettings();
    }, [id]);

    if (loading) {
        return (
            <BackgroundWrapper>
                <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
            </BackgroundWrapper>
        );
    }

    if (!event) {
        return (
            <BackgroundWrapper>
                <div className="min-h-screen flex items-center justify-center text-white">Event not found</div>
            </BackgroundWrapper>
        );
    }

    const isRegistrationClosed = deadline && new Date() > deadline;
    const isSlotsFull = event.slots && event.registeredCount >= event.slots;
    const availableSlots = event.slots
        ? event.slots - (event.registeredCount || 0)
        : null;

    const handleRegisterClick = () => {
        if (isRegistrationClosed || isSlotsFull) return;

        if (!currentUser) {
            navigate('/login');
        } else {
            setShowModal(true);
        }
    };

    return (
        <BackgroundWrapper>
            <div className="min-h-screen py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back to Events
                    </button>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">
                        <div className="relative h-64 md:h-96">
                            <img
                                src={event.imageUrl || 'https://via.placeholder.com/800x400'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full font-bold text-blue-400 border border-white/10">
                                ₹{event.price}
                            </div>
                        </div>

                        <div className="p-8">
                            <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-semibold capitalize mb-4">
                                <Tag size={16} className="mr-1" /> {event.category}
                            </span>

                            <h1 className="text-4xl font-bold mb-6 text-white">{event.title}</h1>

                            <div className="grid md:grid-cols-2 gap-6 mb-6 text-gray-300">
                                <div className="flex items-center">
                                    <Calendar size={22} className="mr-3 text-blue-400" />
                                    {new Date(event.date).toLocaleDateString()}
                                </div>

                                <div className="flex items-center">
                                    <Clock size={22} className="mr-3 text-blue-400" />
                                    {new Date(event.date).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>

                            {event.slots && (
                                <div className="flex items-center mb-4 text-gray-300">
                                    <Tag size={22} className="mr-3 text-blue-400" />
                                    <span
                                        className={`font-medium ${availableSlots === 0 ? 'text-red-400' : 'text-green-400'
                                            }`}
                                    >
                                        {availableSlots} / {event.slots} slots available
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center mb-6 text-gray-300">
                                <MapPin size={22} className="mr-3 text-blue-400" />
                                {event.venue}
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-white">About the Event</h3>
                            <p className="text-gray-300 whitespace-pre-line leading-relaxed mb-6">{event.description}</p>

                            {(event.organizerName || event.organizerEmail || event.organizerMobile) && (
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
                                    <h3 className="text-lg font-bold mb-4 text-white">Organizer Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {event.organizerName && (
                                            <div>
                                                <p className="text-sm text-gray-400">Coordinator</p>
                                                <p className="text-white font-medium">{event.organizerName}</p>
                                            </div>
                                        )}
                                        {event.organizerEmail && (
                                            <div>
                                                <p className="text-sm text-gray-400">Email</p>
                                                <p className="text-white font-medium break-all">{event.organizerEmail}</p>
                                            </div>
                                        )}
                                        {event.organizerMobile && (
                                            <div>
                                                <p className="text-sm text-gray-400">Mobile</p>
                                                <p className="text-white font-medium">{event.organizerMobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-white/10 mt-8 pt-6">
                                {(!currentUser || (userRole !== 'admin' && userRole !== 'organizer')) ? (
                                    <button
                                        onClick={handleRegisterClick}
                                        disabled={isRegistrationClosed || isSlotsFull}
                                        className={`px-8 py-4 rounded-xl font-bold text-lg w-full md:w-auto transition-all duration-300
                        ${isRegistrationClosed || isSlotsFull
                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'
                                            }`}
                                    >
                                        {isRegistrationClosed
                                            ? 'Registration Closed'
                                            : isSlotsFull
                                                ? 'Slots Full'
                                                : 'Register for Event'}
                                    </button>
                                ) : (
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center text-gray-300">
                                        You are viewing this event as an {userRole}.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <RegistrationModal
                        event={event}
                        onClose={() => setShowModal(false)}
                        onRegistrationSuccess={() => setShowModal(false)}
                    />
                )}
            </div>
        </BackgroundWrapper>
    );
};

export default EventDetails;
