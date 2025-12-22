import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RegistrationModal from '../components/RegistrationModal';
import { ArrowLeft, Calendar, MapPin, Tag, Clock, QrCode, X, Image as ImageIcon, Trash2, Plus, Upload, User } from 'lucide-react';
import QRCode from 'react-qr-code';
import { DetailSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';


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
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // State for lightbox

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

                let foundRegistration = null;

                if (currentUser) {
                    try {
                        const regRes = await api.get(`/registrations/check/${id}/${currentUser.uid}`);
                        if (regRes.data.registered) {
                            foundRegistration = regRes.data.registration || regRes.data;
                            setRegistrationData(foundRegistration);
                        }
                    } catch (regErr) {
                        try {
                            const allRegs = await api.get(`/registrations/user/${currentUser.uid}`);
                            const found = allRegs.data.find(r => r.eventId === id);
                            if (found) {
                                foundRegistration = found;
                                setRegistrationData(found);
                            }
                        } catch (e) {
                            console.error("Failed to check registration", e);
                        }
                    }
                }


                // Check if we returned specific state to open modal - Only after checking registration
                if (location.state?.showModalOnReturn && currentUser) {
                    if (!foundRegistration) {
                        setShowModal(true);
                    }
                    // Clear the specific state flag so it doesn't reopen on reload
                    navigate('.', { replace: true, state: { ...location.state, showModalOnReturn: null } });
                }

            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndSettings();
        // Removed standalone check block from here
    }, [id, currentUser, location.state, navigate]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-800 bg-white">Event not found</div>
        );
    }

    const isRegistrationClosed = deadline && new Date() > deadline;
    const isSlotsFull = event.slots && event.registeredCount >= event.slots;

    // Check if event date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    const isEventCompleted = eventDate < today;

    const availableSlots = event.slots
        ? event.slots - (event.registeredCount || 0)
        : null;

    const handleRegisterClick = () => {
        if (isRegistrationClosed || isSlotsFull || isRegistered || isEventCompleted) return;

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

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size too large (max 5MB)');
            return;
        }

        setUploading(true);
        try {
            // 1. Convert to Base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const base64Image = await base64Promise;

            // 2. Upload to Server
            const uploadRes = await api.post('/upload', {
                image: base64Image,
                folder: 'events/gallery' // Organize in a subfolder
            });
            const newImageUrl = uploadRes.data.url;

            // 3. Update Event Document
            const currentGallery = event.gallery || [];
            const updatedGallery = [...currentGallery, newImageUrl];

            await api.put(`/events/${id}`, {
                gallery: updatedGallery
            });

            // 4. Update Local State
            setEvent(prev => ({ ...prev, gallery: updatedGallery }));
            toast.success('Photo added to gallery!');
        } catch (error) {
            console.error("Gallery upload failed", error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (e, imageToDelete) => {
        e.stopPropagation(); // Prevent opening lightbox
        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        try {
            const updatedGallery = event.gallery.filter(img => img !== imageToDelete);
            await api.put(`/events/${id}`, {
                gallery: updatedGallery
            });
            setEvent(prev => ({ ...prev, gallery: updatedGallery }));
            toast.success('Photo deleted');
        } catch (error) {
            console.error("Delete failed", error);
            toast.error('Failed to delete photo');
        }
    };

    const handleBack = () => {
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // If no state history (direct link or refresh), default to events
            // The user requested: only if prev page is login/register go to Events? 
            // If I don't have state, I can't know for sure. 
            // But if I use navigate(-1), it's risky if the history is empty or external.
            // Using /events as safe fallback is standard.
            // However, to satisfy "otherwise land in previous page", navigate(-1) is the closest native "Back".
            // But if previous page was Login, -1 goes to Login -> Redirect Loop or Home/Dashboard.
            // I will stick to location.state for explicit "From Home" knowledge, and fallback to /events.
            navigate('/events');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="min-h-screen py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-800 hover:text-blue-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back
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

                            {/* Organizer Contact - Hide if completed */}
                            {(!isEventCompleted && (event.organizerName || event.organizerEmail || event.organizerMobile)) && (
                                <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User size={20} className="text-blue-600" /> Organizer Contact
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {event.organizerName && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <span className="font-medium">Name:</span> {event.organizerName}
                                            </div>
                                        )}
                                        {event.organizerEmail && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <span className="font-medium">Email:</span> {event.organizerEmail}
                                            </div>
                                        )}
                                        {event.organizerMobile && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <span className="font-medium">Mobile:</span> {event.organizerMobile}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Event Gallery Section */}
                            {(event.gallery?.length > 0 || ((userRole === 'admin' || userRole === 'organizer') && isEventCompleted)) && (
                                <div className="mb-12">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <ImageIcon className="text-blue-600" /> Event Gallery
                                        </h3>
                                        {/* Upload Button */}
                                        {(userRole === 'admin' || userRole === 'organizer') && isEventCompleted && (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="gallery-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleGalleryUpload}
                                                    disabled={uploading}
                                                />
                                                <label
                                                    htmlFor="gallery-upload"
                                                    className={`flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold cursor-pointer border border-blue-100 hover:bg-blue-100 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                                                >
                                                    {uploading ? (
                                                        <>Processing...</>
                                                    ) : (
                                                        <>
                                                            <Plus size={18} /> Add Photo
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {(!event.gallery || event.gallery.length === 0) ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                            <p className="text-gray-500">No photos uploaded yet. Add some memories!</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.gallery.map((img, index) => (
                                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all" onClick={() => setSelectedImage(img)}>
                                                    <img
                                                        src={img}
                                                        alt={`Event Moment ${index + 1}`}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {(userRole === 'admin' || userRole === 'organizer') && isEventCompleted && (
                                                        <button
                                                            onClick={(e) => handleDeleteImage(e, img)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-sm"
                                                            title="Delete Photo"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-6">
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
                                            disabled={isRegistrationClosed || isSlotsFull || isRegistered || isEventCompleted}
                                            className={`px-8 py-4 rounded-xl font-bold text-lg w-full md:w-auto transition-all duration-300
                             ${isRegistrationClosed || isSlotsFull || isRegistered || isEventCompleted
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300' // Show gray button for completed/closed
                                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'
                                                } ${isRegistered && !isEventCompleted ? 'hidden' : ''}`} // Hide if registered and not completed (though logic above handles completed separately ideally)
                                        >
                                            {isEventCompleted
                                                ? 'Event Completed'
                                                : isRegistrationClosed
                                                    ? 'Registration Closed'
                                                    : isSlotsFull
                                                        ? 'Slots Full'
                                                        : 'Register for Event'}
                                        </button>
                                    </div>
                                ) : (
                                    !isEventCompleted && (
                                        <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg text-center text-gray-600">
                                            You are viewing this event as an {userRole}.
                                        </div>
                                    )
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

                {/* Image Lightbox Modal */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors md:p-3"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full View"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent close on image click
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
