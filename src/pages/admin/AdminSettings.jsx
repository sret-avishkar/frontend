import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminSettings = () => {
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                // Format for datetime-local input: YYYY-MM-DDTHH:mm
                if (response.data.registrationDeadline) {
                    const date = new Date(response.data.registrationDeadline);
                    const formatted = date.toISOString().slice(0, 16);
                    setDeadline(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/settings', { registrationDeadline: new Date(deadline).toISOString() });
            alert('Settings updated successfully!');
        } catch (error) {
            alert('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-6">Global Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                    <p className="text-sm text-gray-500 mb-2">This date controls the countdown timer on the Home page.</p>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
