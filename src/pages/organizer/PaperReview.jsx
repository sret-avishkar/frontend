import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileCheck, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PaperReview = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventTitle, setEventTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventResponse = await api.get(`/events/${eventId}`);
                setEventTitle(eventResponse.data.title);

                const response = await api.get(`/registrations/event/${eventId}`);
                // Filter only participants who have uploaded a paper
                const papers = response.data.filter(p => p.paperUrl);
                setParticipants(papers);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error('Failed to load papers.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchData();
        }
    }, [eventId, currentUser]);

    const handlePaperStatusUpdate = async (id, newStatus) => {
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

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" /> Back to Participants
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Paper Review: {eventTitle}</h1>
                        <p className="text-gray-500 mt-1">Total Submissions: {participants.length}</p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper Link</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {participants.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No papers submitted yet.
                                        </td>
                                    </tr>
                                ) : (
                                    participants.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                        <div className="text-sm text-gray-500">{p.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{p.rollNo || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">{p.department || 'N/A'}</div>
                                                <div className="text-xs text-gray-400 mt-1">{p.college}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={p.paperUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-md"
                                                >
                                                    <Download size={14} className="mr-1" /> Download
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.paperStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                                                        p.paperStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {p.paperStatus ? (p.paperStatus.charAt(0).toUpperCase() + p.paperStatus.slice(1)) : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handlePaperStatusUpdate(p.id, 'accepted')}
                                                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1"
                                                        title="Accept Paper"
                                                    >
                                                        <FileCheck size={14} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handlePaperStatusUpdate(p.id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-xs hover:bg-red-100 transition-colors flex items-center gap-1"
                                                        title="Reject Paper"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
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
        </div>
    );
};

export default PaperReview;
