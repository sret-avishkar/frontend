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
        isPaperPresentation: false,
        price: '',
        imageUrl: '',
        assignedTo: '',
        slots: '',
        year: '2026',
        organizerName: '',
        organizerEmail: '',
        organizerMobile: '',
        maxTeamMembers: 1,
        enableMultiDepartment: false,
        departmentOrganizers: {} // { "CSE": "uid1", "ECE": "uid2" }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [organizers, setOrganizers] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);

    // Populate form if initialData is provided (Edit Mode)
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                date: initialData.date || '',
                venue: initialData.venue || '',
                category: initialData.category || 'technical',
                isPaperPresentation: initialData.isPaperPresentation || false,
                price: initialData.price || '',
                imageUrl: initialData.imageUrl || '',
                assignedTo: initialData.assignedTo || '',
                slots: initialData.slots || '',
                year: initialData.year || '2026',
                organizerName: initialData.organizerName || '',
                organizerEmail: initialData.organizerEmail || '',
                organizerMobile: initialData.organizerMobile || '',
                maxTeamMembers: initialData.maxTeamMembers || 1,
                enableMultiDepartment: initialData.enableMultiDepartment || false,
                departmentOrganizers: initialData.departmentOrganizers || {}
            });
        } else if (userRole === 'organizer' && currentUser) {
            // Pre-fill for Organizer creating their own event
            setFormData(prev => ({
                ...prev,
                organizerName: currentUser.displayName || currentUser.name || '',
                organizerEmail: currentUser.email || '',
                organizerMobile: currentUser.phoneNumber || currentUser.mobile || ''
            }));
        }
    }, [initialData, userRole, currentUser]);

    // Fetch organizers and departments if user is admin
    React.useEffect(() => {
        if (userRole === 'admin') {
            const fetchData = async () => {
                try {
                    const [usersResponse, settingsResponse] = await Promise.all([
                        api.get('/users'),
                        api.get('/settings')
                    ]);

                    // Filter only organizers
                    const organizerList = usersResponse.data.filter(u => u.role === 'organizer');
                    setOrganizers(organizerList);

                    // Set available departments
                    if (settingsResponse.data.departments) {
                        setAvailableDepartments(settingsResponse.data.departments);
                    }
                } catch (err) {
                    console.error("Failed to fetch data", err);
                }
            };
            fetchData();
        }
    }, [userRole]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleDepartmentToggle = (dept) => {
        const updated = { ...formData.departmentOrganizers };
        if (Object.prototype.hasOwnProperty.call(updated, dept)) {
            delete updated[dept]; // Remove if unchecked
        } else {
            updated[dept] = ''; // Initialize if checked
        }
        setFormData({ ...formData, departmentOrganizers: updated });
    };

    const handleDepartmentOrganizerChange = (dept, organizerId) => {
        setFormData({
            ...formData,
            departmentOrganizers: {
                ...formData.departmentOrganizers,
                [dept]: organizerId
            }
        });
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
            // Calculate all involved organizer IDs for easy querying
            const orgIds = new Set();
            if (formData.assignedTo) orgIds.add(formData.assignedTo);
            if (formData.departmentOrganizers) {
                Object.values(formData.departmentOrganizers).forEach(uid => {
                    if (uid) orgIds.add(uid);
                });
            }
            // If creator is organizer, add them too (though usually covered by assignedTo or logic)
            if (userRole === 'organizer' && currentUser?.uid) {
                orgIds.add(currentUser.uid);
            }

            const payload = {
                ...formData,
                organizerIds: Array.from(orgIds),
                role: userRole
            };

            if (initialData) {
                // Update existing event
                await api.put(`/events/${initialData.id}`, payload);
            } else {
                // Create new event
                await api.post('/events', {
                    ...payload,
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
                    slots: '',
                    year: '2026',
                    organizerName: '',
                    organizerEmail: '',
                    organizerMobile: '',
                    maxTeamMembers: 1,
                    enableMultiDepartment: false,
                    departmentOrganizers: {}
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
                {/* ... (existing fields: Title, Description) ... */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ... (existing fields: Date, Category, Venue, Slots, MaxTeam, Price) ... */}
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
                            <option value="spot">Spot Event</option>
                        </select>
                        <div className="mt-2 flex items-center">
                            <input
                                type="checkbox"
                                id="isPaperPresentation"
                                name="isPaperPresentation"
                                checked={formData.isPaperPresentation}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isPaperPresentation" className="ml-2 block text-sm text-gray-900">
                                Is this a Paper Presentation event?
                            </label>
                        </div>
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
                        <label className="block text-sm font-medium text-gray-700">Max Team Members</label>
                        <input
                            type="number"
                            name="maxTeamMembers"
                            min="1"
                            value={formData.maxTeamMembers}
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
                    <div className="border border-indigo-100 bg-indigo-50 p-4 rounded-lg">
                        <label className="flex items-center gap-2 mb-4 font-semibold text-indigo-900">
                            <input
                                type="checkbox"
                                name="enableMultiDepartment"
                                checked={formData.enableMultiDepartment}
                                onChange={handleChange}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                            />
                            Enable Multi-Department Event
                        </label>

                        {formData.enableMultiDepartment ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <p className="text-sm text-indigo-700">Select participating departments and assign an organizer for each.</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {availableDepartments.map(dept => (
                                        <div key={dept} className="flex items-center gap-4 bg-white p-3 rounded-md shadow-sm border border-indigo-100">
                                            <label className="flex items-center gap-2 min-w-[150px] font-medium text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={!!formData.departmentOrganizers.hasOwnProperty(dept)}
                                                    onChange={() => handleDepartmentToggle(dept)}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                                />
                                                {dept}
                                            </label>

                                            {formData.departmentOrganizers.hasOwnProperty(dept) && (
                                                <select
                                                    value={formData.departmentOrganizers[dept]}
                                                    onChange={(e) => handleDepartmentOrganizerChange(dept, e.target.value)}
                                                    className="flex-grow text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                                    required
                                                >
                                                    <option value="">-- Assign Organizer --</option>
                                                    {organizers.map(org => (
                                                        <option key={org.uid} value={org.uid}>
                                                            {org.name || org.displayName} ({org.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
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

                {/* Organizer Contact Details - Show only for Admin or if explicitly needed to edit */}
                {
                    userRole === 'admin' && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Organizer Contact Details (Admin Override)</h3>
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
                    )
                }

                {/* Payment Details - Only for Organizers */}
                {
                    userRole === 'organizer' && (
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
                    )
                }

                <button
                    type="submit"
                    disabled={loading || !formData.imageUrl}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : (initialData ? 'Update Event' : 'Create Event')}
                </button>
            </form >
        </div >
    );
};

export default EventForm;
