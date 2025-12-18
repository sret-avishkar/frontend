import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

const EventForm = ({ onEventCreated, initialData = null }) => {
    const { userRole, currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: 'technical',
        price: '',
        imageUrl: '',
        assignedTo: '',
        assignedTo: '',
        upiId: '',
        slots: '',
        year: '2026',
        organizerName: '',
        organizerEmail: '',
        organizerMobile: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [organizers, setOrganizers] = useState([]);

    // Populate form if initialData is provided (Edit Mode)
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                date: initialData.date || '',
                venue: initialData.venue || '',
                category: initialData.category || 'technical',
                price: initialData.price || '',
                imageUrl: initialData.imageUrl || '',
                assignedTo: initialData.assignedTo || '',
                upiId: initialData.upiId || '',
                slots: initialData.slots || '',
                year: initialData.year || '2026',
                organizerName: initialData.organizerName || '',
                organizerEmail: initialData.organizerEmail || '',
                organizerMobile: initialData.organizerMobile || ''
            });
        }
    }, [initialData]);

    // Fetch organizers if user is admin
    React.useEffect(() => {
        if (userRole === 'admin') {
            const fetchOrganizers = async () => {
                try {
                    const response = await api.get('/users');
                    // Filter only organizers
                    const organizerList = response.data.filter(u => u.role === 'organizer');
                    setOrganizers(organizerList);
                } catch (err) {
                    console.error("Failed to fetch organizers", err);
                }
            };
            fetchOrganizers();
        }
    }, [userRole]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUploaded = (url) => {
        setFormData({ ...formData, imageUrl: url });
    };

    const handleQrCodeUploaded = (url) => {
        setFormData({ ...formData, paymentQrCodeUrl: url });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (initialData) {
                // Update existing event
                await api.put(`/events/${initialData.id}`, {
                    ...formData,
                    role: userRole // Pass role for permission check if needed
                });
            } else {
                // Create new event
                await api.post('/events', {
                    ...formData,
                    role: userRole,
                    createdBy: currentUser?.uid
                });
            }

            onEventCreated();
            if (!initialData) {
                setFormData({
                    title: '',
                    description: '',
                    date: '',
                    venue: '',
                    category: 'technical',
                    price: '',
                    imageUrl: '',
                    assignedTo: '',
                    upiId: '',
                    slots: '',
                    year: '2026',
                    organizerName: '',
                    organizerEmail: '',
                    organizerMobile: ''
                });
            }
        } catch (err) {
            setError(initialData ? 'Failed to update event.' : 'Failed to create event.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Event' : 'Create New Event'}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Event Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        required
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Year (e.g. 2026 or 23-24)</label>
                    <input
                        type="text"
                        name="year"
                        required
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="e.g. 2026"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="datetime-local"
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        >
                            <option value="technical">Technical</option>
                            <option value="non-technical">Non-Technical</option>
                            <option value="cultural">Cultural</option>
                            <option value="workshop">Workshop</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Venue</label>
                        <input
                            type="text"
                            name="venue"
                            required
                            value={formData.venue}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Slots (Optional)</label>
                        <input
                            type="number"
                            name="slots"
                            min="1"
                            placeholder="Leave empty for unlimited"
                            value={formData.slots}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>
                </div>

                {/* Organizer Assignment - Only for Admins */}
                {userRole === 'admin' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign Organizer (Optional)</label>
                        <select
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        >
                            <option value="">-- Select Organizer --</option>
                            {organizers.map(organizer => (
                                <option key={organizer.uid} value={organizer.uid}>
                                    {organizer.name || organizer.displayName} ({organizer.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                    <ImageUploader
                        initialImage={formData.imageUrl}
                        onUploadComplete={handleImageUploaded}
                        folder="events"
                    />
                    {formData.imageUrl && (
                        <p className="text-green-600 text-sm mt-2">Image uploaded successfully!</p>
                    )}
                </div>

                {/* Organizer Contact Details */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Organizer Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name</label>
                            <input
                                type="text"
                                name="organizerName"
                                value={formData.organizerName}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Email</label>
                            <input
                                type="email"
                                name="organizerEmail"
                                value={formData.organizerEmail}
                                onChange={handleChange}
                                placeholder="e.g. contact@event.com"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Mobile</label>
                            <input
                                type="tel"
                                name="organizerMobile"
                                value={formData.organizerMobile}
                                onChange={handleChange}
                                placeholder="e.g. +91 9876543210"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Details - Only for Organizers */}
                {userRole === 'organizer' && (
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">UPI ID (Optional)</label>
                                <input
                                    type="text"
                                    name="upiId"
                                    value={formData.upiId}
                                    onChange={handleChange}
                                    placeholder="e.g. user@upi"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !formData.imageUrl}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : (initialData ? 'Update Event' : 'Create Event')}
                </button>
            </form>
        </div>
    );
};

export default EventForm;
