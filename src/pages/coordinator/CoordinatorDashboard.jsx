import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Eye, XCircle, ExternalLink, Search, Download } from 'lucide-react';
import { DashboardSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';

const CoordinatorDashboard = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentUser]);

    useEffect(() => {
        if (!selectedEventId) {
            setParticipants([]);
            return;
        }

        const fetchParticipants = async () => {
            setLoadingParticipants(true);
            try {
                // Coordinator allowed to fetch any event participants now
                const response = await api.get(`/registrations/event/${selectedEventId}`);
                setParticipants(response.data);
            } catch (error) {
                console.error("Failed to fetch participants", error);
                toast.error("Failed to load participants");
            } finally {
                setLoadingParticipants(false);
            }
        };

        fetchParticipants();
    }, [selectedEventId]);

    const fetchEvents = async () => {
        if (!currentUser) return;
        try {
            const response = await api.get('/events?role=coordinator');
            const currentYear = new Date().getFullYear().toString();

            const sortedEvents = [...response.data]
                .filter(event => {
                    const eventYear = new Date(event.date).getFullYear().toString();
                    return eventYear === currentYear;
                })
                .sort((a, b) => a.title.localeCompare(b.title));
            setEvents(sortedEvents);

            // Auto-select first event if available and none selected
            if (sortedEvents.length > 0 && !selectedEventId) {
                setSelectedEventId(sortedEvents[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleViewDetails = (participant) => {
        setSelectedParticipant(participant);
        setShowDetailsModal(true);
    };

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.rollNo && p.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loadingEvents) return <DashboardSkeleton />;

    if (userRole !== 'coordinator') {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied. Coordinator privileges required.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Coordinator Dashboard</h1>
                </div>

                {/* Event Selection */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Event to View Participants</label>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2.5 text-gray-700"
                    >
                        <option value="">-- Select Event --</option>
                        {events.map(event => (
                            <option key={event.id} value={event.id}>
                                {event.title} ({new Date(event.date).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Participants Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Participants {selectedEventId ? `(${filteredParticipants.length})` : ''}
                        </h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search participants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {loadingParticipants ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading participants...</p>
                        </div>
                    ) : !selectedEventId ? (
                        <div className="p-12 text-center text-gray-500">
                            Please select an event to view its participants.
                        </div>
                    ) : filteredParticipants.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No participants found for this event matching your search.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredParticipants.map((participant) => (
                                        <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                                                        {participant.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{participant.email}</div>
                                                <div className="text-xs text-gray-500">{participant.mobile}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{participant.department || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{participant.rollNo}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${participant.status === 'approved' || participant.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    participant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDetails(participant)}
                                                    className="text-purple-600 hover:text-purple-900 bg-purple-50 p-2 rounded-full hover:bg-purple-100 transition-colors"
                                                    title="View Full Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
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
                                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm font-semibold">{selectedParticipant.department || 'N/A'}</span>
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

                            {/* Paper Info if it exists */}
                            {selectedParticipant.paperUrl && (
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg mt-2">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Paper Presentation</h3>
                                    <a
                                        href={selectedParticipant.paperUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-800 text-sm flex items-center font-medium"
                                    >
                                        <Download size={16} className="mr-2" /> View/Download Paper
                                    </a>
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

export default CoordinatorDashboard;
