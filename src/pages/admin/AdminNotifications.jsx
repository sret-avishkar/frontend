import React, { useState } from 'react';
import api from '../../services/api';
import { Bell, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        targetRole: 'all' // all, participant, organizer
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast.error('Title and Body are required');
            return;
        }

        if (!confirm(`Are you sure you want to send this notification to ${formData.targetRole === 'all' ? 'EVERYONE' : formData.targetRole + 's'}?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/notifications/broadcast', formData);
            toast.success(response.data.message);
            setFormData({ title: '', body: '', targetRole: 'all' });
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Broadcast Notifications
            </h1>

            <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                        <select
                            name="targetRole"
                            value={formData.targetRole}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        >
                            <option value="all">All Users</option>
                            <option value="participant">Participants Only</option>
                            <option value="organizer">Organizers Only</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select who will receive this push notification.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g. Schedule Update"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                        <textarea
                            name="body"
                            rows={4}
                            value={formData.body}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g. The hackathon starts at 9am sharp!"
                            maxLength={150}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {loading ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Send size={18} /> Send Notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminNotifications;
