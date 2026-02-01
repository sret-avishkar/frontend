import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Users, CheckCircle, XCircle, Clock, Download, ExternalLink, Search, FileCheck, Eye } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EventParticipants = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventTitle, setEventTitle] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewAccess, setViewAccess] = useState('loading'); // 'all', 'specific', 'none', 'loading'
    const [assignedDepartment, setAssignedDepartment] = useState(null);
    const [isPaperEvent, setIsPaperEvent] = useState(false);

    // Modal State
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        // ... (existing useEffect logic)
        const fetchParticipants = async () => {
            try {
                // Fetch Event Details for Title and Multi-Dept Logic
                const eventResponse = await api.get(`/events/${eventId}`);
                const eventData = eventResponse.data;
                const baseTitle = eventData.title;
                setIsPaperEvent(eventData.isPaperPresentation);

                console.log("CurrentUser:", currentUser);
                // ... (rest of logic)

                let access = 'none';
                let dept = null;

                const isMainOrganizer =
                    currentUser.uid === eventData.createdBy ||
                    currentUser.uid === eventData.assignedTo ||
                    currentUser.role === 'admin';

                if (isMainOrganizer) {
                    access = 'all';
                    setEventTitle(baseTitle);
                } else if (eventData.enableMultiDepartment && eventData.departmentOrganizers) {
                    // Check if user is a department organizer
                    dept = Object.keys(eventData.departmentOrganizers).find(
                        key => eventData.departmentOrganizers[key] === currentUser.uid
                    );

                    if (dept) {
                        access = 'specific';
                        setAssignedDepartment(dept);
                        setEventTitle(`${baseTitle} (${dept})`);
                    } else {
                        // User is organizer but not linked to this event in any way
                        access = 'none';
                    }
                } else {
                    // Fallback
                    access = 'none';
                }

                setViewAccess(access);

                // Fetch Participants
                const response = await api.get(`/registrations/event/${eventId}`);
                setParticipants(response.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load participants.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchParticipants();
        }
    }, [eventId, currentUser]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/registrations/${id}/status`, { status: newStatus });
            setParticipants(prev =>
                prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
            );
            toast.success(`Registration ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        }
    };

    const handlePaperStatusUpdate = async (id, newStatus) => {
        // ... (existing)
        try {
            await api.put(`/registrations/${id}/paper-status`, { paperStatus: newStatus });
            setParticipants(prev =>
                prev.map(p => p.id === id ? { ...p, paperStatus: newStatus } : p)
            );
            toast.success(`Paper ${newStatus}`);
        } catch (err) {
            console.error("Failed to update paper status", err);
            toast.error("Failed to update paper status");
        }
    };

    const handleViewDetails = (participant) => {
        setSelectedParticipant(participant);
        setShowDetailsModal(true);
    };

    const relevantParticipants = Array.isArray(participants) ? participants.filter(p => {
        // ... (existing)
        if (viewAccess === 'none') return false;
        if (viewAccess === 'specific' && assignedDepartment) {
            return p.department && p.department.toLowerCase() === assignedDepartment.toLowerCase();
        }
        return true;
    }) : [];

    const filteredParticipants = relevantParticipants.filter(p => {
        // ... (existing)
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.rollNo && p.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.college && p.college.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header & Filters ... */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" /> Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Participants: {eventTitle}</h1>
                        <p className="text-gray-500 mt-1">
                            Total Registrations: {relevantParticipants.length}
                            {viewAccess === 'specific' ? ` (Department: ${assignedDepartment})` : ''}
                        </p>
                    </div>
                    {isPaperEvent && (
                        <button
                            onClick={() => navigate(`/organizer/events/${eventId}/papers`)}
                            className="mt-4 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                        >
                            <FileCheck size={18} /> Review Papers
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                    <div className="w-full md:w-1/3 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, roll no, college..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'pending', 'confirmed', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    {isPaperEvent && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper Info</th>}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredParticipants.length === 0 ? (
                                    <tr>
                                        <td colSpan={isPaperEvent ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                            No participants found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredParticipants.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                        <div className="text-sm text-gray-500">{p.email}</div>
                                                        <div className="text-sm text-gray-500">{p.mobile}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{p.rollNo || 'N/A'}</div>
                                                <div className="text-sm text-gray-500 capitalize">{p.department || 'N/A'}</div>
                                                <div className="text-xs text-gray-400 mt-1">{p.college}</div>
                                                {p.teamMembers && p.teamMembers.length > 0 && (
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            + {p.teamMembers.length} Team
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Paper Column */}
                                            {isPaperEvent && (
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {p.paperUrl ? (
                                                            <a
                                                                href={p.paperUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                                                            >
                                                                <Download size={14} className="mr-1" /> View Paper
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No Paper</span>
                                                        )}
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.paperStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            p.paperStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {p.paperStatus ? (p.paperStatus.charAt(0).toUpperCase() + p.paperStatus.slice(1)) : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            <td className="px-6 py-4">
                                                {p.paymentScreenshotUrl ? (
                                                    <a
                                                        href={p.paymentScreenshotUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        <ExternalLink size={14} className="mr-1" /> View Proof
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">No Screenshot</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    p.status === 'confirmed' ? 'bg-green-100 text-green-800' : // Confirmed also Green
                                                        p.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(p)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                                                        title="View Full Details"
                                                    >
                                                        <Eye size={20} />
                                                    </button>

                                                    {/* Payment Actions */}
                                                    {(p.status === 'pending') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(p.id, p.paymentScreenshotUrl ? 'confirmed' : 'approved')}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition-colors"
                                                                title={p.paymentScreenshotUrl ? "Verify Payment & Confirm" : "Approve Info & Allow Payment"}
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(p.id, 'rejected')}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                                                title="Reject Registration"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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

export default EventParticipants;
