import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Eye, XCircle, ExternalLink, Download, UserPlus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
import toast from 'react-hot-toast';
import SpotRegistrationModal from '../../components/admin/SpotRegistrationModal';

const AdminParticipants = () => {
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || '');
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Spot Registration State
    const [showSpotModal, setShowSpotModal] = useState(false);
    const [selectedEventForSpot, setSelectedEventForSpot] = useState(null);



    useEffect(() => {
        // ... existing useEffect
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events?role=admin');
                const currentYear = new Date().getFullYear().toString();
                const filteredEvents = response.data
                    .filter(event => {
                        const eventYear = new Date(event.date).getFullYear().toString();
                        return eventYear === currentYear;
                    })
                    .sort((a, b) => a.title.localeCompare(b.title));
                setEvents(filteredEvents);
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
            setSelectedEventForSpot(null);
            return;
        }

        const event = events.find(e => e.id === selectedEventId);
        setSelectedEventForSpot(event);

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
    }, [selectedEventId, events]);

    const handleViewDetails = (participant) => {
        setSelectedParticipant(participant);
        setShowDetailsModal(true);
    };

    const handleSpotRegisterClick = () => {
        if (!selectedEventId) {
            toast.error("Please select an event first.");
            return;
        }

        const event = events.find(e => e.id === selectedEventId);
        if (event) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            if (eventDate.getTime() !== today.getTime()) {
                // Optional: Warn if not today, or just allow it for Admin (Admins usually have override power)
                toast('Note: This event is not scheduled for today.', { icon: '📅' });
            }
            setSelectedEventForSpot(event);
            setShowSpotModal(true);
        }
    };


    const handleDownloadExcel = async () => {
        if (!events || events.length === 0) {
            toast.error("No events available to download.");
            return;
        }

        const toastId = toast.loading("Preparing Excel download... This may take a while.");

        try {
            // 1. Fetch Users to map IDs to Emails
            let usersMap = {};
            try {
                const usersResponse = await api.get('/users');
                usersResponse.data.forEach(u => {
                    usersMap[u.uid] = u.email;
                });
            } catch (err) {
                console.error("Failed to fetch users for mapping", err);
                toast.error("Could not fetch organizer details, using IDs instead.", { id: toastId });
            }

            // 2. Data Structure: Map<OrganizerEmail, Array<{eventTitle, participants}>>
            const organizerGroups = {};

            // Helper to push data to organizerGroups
            const addToGroup = (organizerId, eventTitle, participantList) => {
                const email = usersMap[organizerId] || `Unknown (ID: ${organizerId})`;
                if (!organizerGroups[email]) {
                    organizerGroups[email] = [];
                }
                organizerGroups[email].push({ title: eventTitle, participants: participantList });
            };

            // 3. Iterate Events and Distribute Participants
            for (const event of events) {
                try {
                    const response = await api.get(`/registrations/event/${event.id}`);
                    const eventParticipants = response.data;

                    if (!eventParticipants || eventParticipants.length === 0) continue;

                    if (event.enableMultiDepartment && event.departmentOrganizers) {
                        // Multi-Department Logic
                        const deptMap = {}; // Dept -> Participants
                        const unassigned = [];

                        eventParticipants.forEach(p => {
                            if (p.department && event.departmentOrganizers[p.department]) {
                                if (!deptMap[p.department]) deptMap[p.department] = [];
                                deptMap[p.department].push(p);
                            } else {
                                unassigned.push(p);
                            }
                        });

                        // Add grouped dept participants to their respective organizers
                        Object.keys(deptMap).forEach(dept => {
                            const orgId = event.departmentOrganizers[dept];
                            addToGroup(orgId, `${event.title} (${dept})`, deptMap[dept]);
                        });

                        // Add unassigned to main creator/assignedTo
                        if (unassigned.length > 0) {
                            const mainOrgId = event.assignedTo || event.createdBy;
                            addToGroup(mainOrgId, `${event.title} (Other/Main)`, unassigned);
                        }

                    } else {
                        // Single Organizer Logic
                        const orgId = event.assignedTo || event.createdBy;
                        addToGroup(orgId, event.title, eventParticipants);
                    }

                } catch (err) {
                    console.error(`Failed to fetch participants for event ${event.title}`, err);
                }
            }

            // 4. Construct Consolidated Data for Excel
            const consolidatedData = [];

            // Define Headers
            const contentHeaders = [
                "Sl. No", "Participant Name", "Email", "Mobile", "Roll No",
                "College", "Department", "Registration Status",
                "Payment Status", "Paper Status", "Team Members", "Registered At"
            ];

            // Add Headers ONCE at the top
            consolidatedData.push(contentHeaders);

            const sortedOrganizers = Object.keys(organizerGroups).sort();

            sortedOrganizers.forEach(orgEmail => {
                // Add Organizer Section Header
                consolidatedData.push([]); // Spacing
                consolidatedData.push([`Organizer: ${orgEmail}`]); // Merged cell visual (in logic below we just put in first col)
                consolidatedData.push([]); // Spacing

                organizerGroups[orgEmail].forEach(group => {
                    consolidatedData.push([`Event: ${group.title}`]);

                    group.participants.forEach((p, index) => {
                        consolidatedData.push([
                            index + 1,
                            p.name,
                            p.email,
                            p.mobile,
                            p.rollNo,
                            p.college,
                            p.department,
                            p.status,
                            p.paymentScreenshotUrl ? 'Uploaded' : 'Pending',
                            p.paperStatus || 'N/A',
                            p.teamMembers ? p.teamMembers.map(m => m.name).join(', ') : '',
                            p.timestamp && p.timestamp._seconds ? new Date(p.timestamp._seconds * 1000).toLocaleString() : 'N/A'
                        ]);
                    });

                    consolidatedData.push([]); // Spacing between events
                });
            });

            if (consolidatedData.length <= 1) { // Only headers
                toast.error("No participant data found to download.", { id: toastId });
                return;
            }

            // 5. Generate Worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(consolidatedData);

            // 6. Apply Styles (Bold Headers & Section Titles)
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellRef]) continue;

                    // Header Row (Row 0)
                    if (R === 0) {
                        ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } };
                    }

                    // Check first column for Organizer/Event headers
                    if (C === 0) {
                        const val = ws[cellRef].v;
                        if (typeof val === 'string' && (val.startsWith('Organizer:') || val.startsWith('Event:'))) {
                            ws[cellRef].s = { font: { bold: true, sz: 12 } };
                        }
                    }
                }
            }

            // 7. Auto-fit Columns
            // Calculate max width for each column
            const colWidths = contentHeaders.map(h => ({ wch: h.length })); // Init with header lengths

            consolidatedData.forEach(row => {
                if (row.length > 1) { // Skip section headers which usually only have 1 data point string
                    row.forEach((cell, i) => {
                        const cellLength = (cell ? cell.toString().length : 0);
                        if (colWidths[i] && cellLength > colWidths[i].wch) {
                            colWidths[i].wch = Math.min(cellLength, 50); // Cap width at 50 chars
                        }
                    });
                }
            });

            ws['!cols'] = colWidths;

            // 8. Write File
            XLSX.utils.book_append_sheet(wb, ws, "All Participants");
            XLSX.writeFile(wb, `Avishkar_Participants_${new Date().getFullYear()}.xlsx`);
            toast.success("Download started!", { id: toastId });

        } catch (error) {
            console.error("Excel generation failed", error);
            toast.error("Failed to generate Excel file.", { id: toastId });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Registered Participants</h2>
                <div className="flex gap-2">
                    {selectedEventId && (
                        <button
                            onClick={handleSpotRegisterClick}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <UserPlus size={20} />
                            Spot Register
                        </button>
                    )}
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Download size={20} />
                        Download All Data (Excel)
                    </button>
                </div>
            </div>

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

            {/* Spot Registration Modal */}
            <SpotRegistrationModal
                isOpen={showSpotModal}
                onClose={() => setShowSpotModal(false)}
                event={selectedEventForSpot}
                onSuccess={() => {
                    // Force refresh participants list
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default AdminParticipants;
