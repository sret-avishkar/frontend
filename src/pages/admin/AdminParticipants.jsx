import { Eye, XCircle, ExternalLink } from 'lucide-react';

const AdminParticipants = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        // ... existing useEffect
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
        // ... existing useEffect
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

    const handleViewDetails = (participant) => {
        setSelectedParticipant(participant);
        setShowDetailsModal(true);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">All Registered Participants</h2>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                {/* ... existing filter */}
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
                <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                >
                    <option value="">-- Select Event --</option>
                    {Array.isArray(events) && events.filter(e => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return new Date(e.date) >= today;
                    }).map(event => (
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {participants.map((participant) => (
                                <tr key={participant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.department || 'N/A'}</td>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(participant)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedParticipant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <XCircle size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Registration Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Personal Info</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between border-b pb-1"><span className="font-medium text-gray-700">Name:</span> <span>{selectedParticipant.name}</span></p>
                                    <p className="flex justify-between border-b pb-1"><span className="font-medium text-gray-700">Email:</span> <span className="text-sm truncate max-w-[150px]">{selectedParticipant.email}</span></p>
                                    <p className="flex justify-between border-b pb-1"><span className="font-medium text-gray-700">Mobile:</span> <span>{selectedParticipant.mobile}</span></p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Academic Info</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between border-b pb-1"><span className="font-medium text-gray-700">College:</span> <span className="text-sm truncate max-w-[150px]">{selectedParticipant.college}</span></p>
                                    <p className="flex justify-between border-b pb-1"><span className="font-medium text-gray-700">Roll No:</span> <span>{selectedParticipant.rollNo}</span></p>
                                    <div className="flex justify-between items-center border-b pb-1 mt-2">
                                        <span className="font-medium text-gray-700">Department:</span>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm font-semibold">{selectedParticipant.department || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${selectedParticipant.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        selectedParticipant.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            selectedParticipant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {selectedParticipant.status.charAt(0).toUpperCase() + selectedParticipant.status.slice(1)}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        Registered on {selectedParticipant.timestamp ? new Date(selectedParticipant.timestamp._seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {selectedParticipant.paymentScreenshotUrl && (
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Proof</h3>
                                    <div className="flex justify-center">
                                        <a href={selectedParticipant.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                                            <img src={selectedParticipant.paymentScreenshotUrl} alt="Payment Proof" className="max-h-64 rounded border border-gray-200 shadow-sm transition-transform transform group-hover:scale-105" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 transition-opacity rounded">
                                                <ExternalLink className="text-white drop-shadow-md" size={32} />
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {selectedParticipant.teamMembers && selectedParticipant.teamMembers.length > 0 && (
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Team Members ({selectedParticipant.teamMembers.length})</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                        {selectedParticipant.teamMembers.map((member, idx) => (
                                            <li key={idx}>
                                                <span className="font-medium">{member.name}</span> ({member.details || member.role || 'Member'})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminParticipants;
