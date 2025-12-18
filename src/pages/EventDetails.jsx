import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RegistrationModal from '../components/RegistrationModal';
import { ArrowLeft, Calendar, MapPin, Tag, Clock, QrCode, X } from 'lucide-react';
import QRCode from 'react-qr-code';


const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userRole } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [deadline, setDeadline] = useState(null);
    const [registrationData, setRegistrationData] = useState(null);

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

                if (currentUser) {
                    try {
                        const regRes = await api.get(`/registrations/check/${id}/${currentUser.uid}`);
                        if (regRes.data.registered) {
                            setRegistrationData(regRes.data.registration || regRes.data); // Adjust based on actual API response structure
                        }
                    } catch (regErr) {
                        try {
                            const allRegs = await api.get(`/registrations/user/${currentUser.uid}`);
                            const foundReg = allRegs.data.find(r => r.eventId === id);
                            if (foundReg) {
                                setRegistrationData(foundReg);
                            }
                        } catch (e) {
                            console.error("Failed to check registration", e);
                        }
                    }
                }

            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndSettings();

        // Check if we returned specific state to open modal
        if (location.state?.showModalOnReturn && currentUser) {
            setShowModal(true);
            // Clear the specific state flag so it doesn't reopen on reload
            navigate('.', { replace: true, state: { ...location.state, showModalOnReturn: null } });
        }
    }, [id, currentUser, location.state, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-800 bg-white">Loading...</div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-800 bg-white">Event not found</div>
        );
    }

    const isRegistrationClosed = deadline && new Date() > deadline;
    const isSlotsFull = event.slots && event.registeredCount >= event.slots;
    const availableSlots = event.slots
        ? event.slots - (event.registeredCount || 0)
        : null;

    const handleRegisterClick = () => {
        if (isRegistrationClosed || isSlotsFull || isRegistered) return;

        if (!currentUser) {
            navigate('/login', { state: { from: location, showModalOnReturn: true } });
        } else {
            setShowModal(true);
        }
    };

    const isRegistered = !!registrationData;

    const qrData = registrationData ? JSON.stringify({
        registrationId: registrationData.id,
        userId: currentUser.uid,
        eventId: event.id
    }) : '';

    return (
        <div className="min-h-screen bg-white">
            <div className="min-h-screen py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/events')}
                        className="flex items-center text-gray-800 hover:text-blue-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back to Events
                    </button>

                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                        <div className="relative h-64 md:h-96">
                            <img
                                src={event.imageUrl || 'https://via.placeholder.com/800x400'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-bold text-blue-600 border border-gray-200 shadow-sm">
                                ₹{event.price}
                            </div>
                        </div>

                        <div className="p-8">
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-600 border border-blue-200 rounded-full text-sm font-semibold capitalize mb-4">
                                <Tag size={16} className="mr-1" /> {event.category}
                            </span>

                            <h1 className="text-4xl font-bold mb-6 text-gray-900">{event.title}</h1>

                            <div className="grid md:grid-cols-2 gap-6 mb-6 text-gray-800">
                                <div className="flex items-center">
                                    <Calendar size={22} className="mr-3 text-blue-600" />
                                    {new Date(event.date).toLocaleDateString()}
                                </div>

                                <div className="flex items-center">
                                    <Clock size={22} className="mr-3 text-blue-600" />
                                    {new Date(event.date).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>

                            {event.slots && (
                                <div className="flex items-center mb-4 text-gray-800">
                                    <Tag size={22} className="mr-3 text-blue-600" />
                                    <span
                                        className={`font-medium ${availableSlots === 0 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                    >
                                        {availableSlots} / {event.slots} slots available
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center mb-6 text-gray-800">
                                <MapPin size={22} className="mr-3 text-blue-600" />
                                {event.venue}
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-gray-900">About the Event</h3>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">{event.description}</p>

                            {(event.organizerName || event.organizerEmail || event.organizerMobile) && (
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900">Organizer Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {event.organizerName && (
                                            <div>
                                                <p className="text-sm text-gray-500">Coordinator</p>
                                                <p className="text-gray-800 font-medium">{event.organizerName}</p>
                                            </div>
                                        )}
                                        {event.organizerEmail && (
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="text-gray-800 font-medium break-all">{event.organizerEmail}</p>
                                            </div>
                                        )}
                                        {event.organizerMobile && (
                                            <div>
                                                <p className="text-sm text-gray-500">Mobile</p>
                                                <p className="text-gray-800 font-medium">{event.organizerMobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 mt-8 pt-6">
                                {(!currentUser || (userRole !== 'admin' && userRole !== 'organizer')) ? (
                                    <div className="flex flex-col gap-4">
                                        {isRegistered ? (
                                            (registrationData.status === 'approved' || registrationData.status === 'confirmed' || registrationData.status === 'paid') ? (
                                                <button
                                                    onClick={() => setShowQRModal(true)}
                                                    className="px-8 py-4 rounded-xl font-bold text-lg w-full md:w-auto bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 hover:border-green-300 transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <QrCode size={20} /> View Entry Pass
                                                </button>
                                            ) : (
                                                <div className="px-8 py-4 rounded-xl font-bold text-lg w-full md:w-auto bg-yellow-100 text-yellow-700 border border-yellow-200 text-center">
                                                    Payment Status: {registrationData.status}
                                                </div>
                                            )
                                        ) : null}

                                        <button
                                            onClick={handleRegisterClick}
                                            disabled={isRegistrationClosed || isSlotsFull || isRegistered}
                                            className={`px-8 py-4 rounded-xl font-bold text-lg w-full md:w-auto transition-all duration-300
                             ${isRegistrationClosed || isSlotsFull || isRegistered
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300 hidden' // Hide register button if registered
                                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'
                                                }`}
                                        >
                                            {isRegistrationClosed
                                                ? 'Registration Closed'
                                                : isSlotsFull
                                                    ? 'Slots Full'
                                                    : 'Register for Event'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg text-center text-gray-600">
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
                        onRegistrationSuccess={() => {
                            setShowModal(false);
                            // Refresh page or state to show updated status
                            window.location.reload();
                        }}
                    />
                )}

                {showQRModal && isRegistered && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in-up">
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1"
                            >
                                <X size={20} />
                            </button>
                            <div className="text-center pt-2">
                                <h3 className="text-xl font-bold mb-1 text-gray-900">Entry Pass</h3>
                                <p className="text-blue-600 font-medium mb-6 text-sm">{event.title}</p>

                                <div className="bg-white p-4 inline-block rounded-xl border-2 border-dashed border-gray-300 shadow-inner mb-4">
                                    <QRCode value={qrData} size={180} />
                                </div>

                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                    Show at entrance
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
