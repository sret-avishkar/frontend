import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminParticipants = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events?role=admin');
                setEvents(response.data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!selectedEventId) {
            setParticipants([]);
            return;
        }

        const fetchParticipants = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/registrations/event/${selectedEventId}`);
                setParticipants(response.data);
            } catch (error) {
                console.error("Failed to fetch participants", error);
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [selectedEventId]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">All Registered Participants</h2>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
                <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                    <option value="">-- Select Event --</option>
                    {events.map(event => (
                        <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : participants.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {selectedEventId ? 'No participants found for this event.' : 'Select an event to view participants.'}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {participants.map((participant) => (
                                <tr key={participant.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {participant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(participant.timestamp._seconds * 1000).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminParticipants;
