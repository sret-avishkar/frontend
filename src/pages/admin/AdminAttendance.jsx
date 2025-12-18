import React, { useState, useEffect } from 'react';
import QRScanner from '../../components/QRScanner';
import api from '../../services/api';

const AdminAttendance = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');

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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Attendance Management</h2>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
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

                {selectedEventId ? (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
                        <QRScanner
                            onScanSuccess={async (decodedText) => {
                                try {
                                    await api.post('/attendance/mark', { qrCode: decodedText, eventId: selectedEventId });
                                    alert(`Attendance marked for User ID: ${decodedText}`);
                                } catch (err) {
                                    console.error(err);
                                    alert('Failed to mark attendance: ' + (err.response?.data?.message || err.message));
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                        <p className="text-gray-500">Please select an event to start scanning.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendance;
