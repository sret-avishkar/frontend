import React, { useState } from 'react';
import api from '../../services/api';
import { Bell, Send } from 'lucide-react';
import toast from 'react-hot-toast';



import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';

const ReceivedNotifications = () => {
    const { notifications, markAsRead } = useNotifications();

    if (!Array.isArray(notifications) || notifications.length === 0) {
        return <div className="p-4 text-center text-gray-500 text-sm">No notifications received.</div>;
    }

    return (
        <div className="space-y-4">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`p-4 rounded-lg border transition-colors ${!notif.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                    onClick={() => markAsRead(notif.id)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${!notif.read ? 'text-blue-800' : 'text-gray-800'}`}>
                            {notif.title}
                        </h4>
                        {notif.createdAt && (
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {notif.createdAt?.toDate ? format(notif.createdAt.toDate(), 'MMM d, h:mm a') : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">{notif.body}</p>
                </div>
            ))}
        </div>
    );
};

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
                Notifications
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send Notifications */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Broadcast Message</h2>
                    <div className="bg-white rounded-lg shadow-md p-6">
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

                {/* Received Notifications */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Received Notifications</h2>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 max-h-[600px] overflow-y-auto">
                        <ReceivedNotifications />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
