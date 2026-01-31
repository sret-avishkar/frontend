import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Eye, Plus, X, Edit } from 'lucide-react';
import EventForm from '../../components/EventForm';
import { TableSkeleton } from '../../components/Skeleton';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events?role=admin');
            const allEvents = response.data;

            // Sort all events alphabetically by title
            allEvents.sort((a, b) => a.title.localeCompare(b.title));

            // Extract unique years from Event Dates (ignoring metadata year to match visual column)
            const years = [...new Set(allEvents.map(e => {
                return new Date(e.date).getFullYear().toString();
            }))].sort();
            setAvailableYears(years);

            // Default to current year if available, else first year
            if (years.length > 0 && !selectedYear) {
                const currentYear = new Date().getFullYear().toString();
                if (years.includes(currentYear)) {
                    setSelectedYear(currentYear);
                } else {
                    setSelectedYear(years[0]);
                }
            }

            setEvents(allEvents);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events based on selected year and category
    const filteredEvents = Array.isArray(events) ? events.filter(e => {
        // Date-based filtering
        const eventYear = new Date(e.date).getFullYear().toString();
        const matchesYear = !selectedYear || eventYear === selectedYear;

        // Category filtering
        const matchesCategory = !selectedCategory || e.category === selectedCategory;

        return matchesYear && matchesCategory;
    }) : [];

    // Apply sorting
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (sortConfig.key === 'title') {
            return sortConfig.direction === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        } else if (sortConfig.key === 'category') {
            const catCompare = a.category.localeCompare(b.category);
            if (catCompare !== 0) {
                return sortConfig.direction === 'asc' ? catCompare : -catCompare;
            }
            // Secondary sort by title
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                setEvents(events.filter(e => e.id !== id));
            } catch (error) {
                alert('Failed to delete event');
            }
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingEvent(null);
    };

    if (loading) return <TableSkeleton />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Events</h2>
                <div className="flex gap-4 items-center">
                    {/* Year Selector */}
                    {availableYears.length > 0 && (
                        <div className="flex gap-2">
                            {availableYears.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border
                                    ${selectedYear === year
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category Selector */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1.5 rounded-md text-sm border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option value="technical">Technical</option>
                        <option value="non-technical">Non-Technical</option>
                        <option value="workshop">Workshop</option>
                        <option value="expo">Expo</option>
                    </select>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} /> Add Event
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => requestSort('title')}
                            >
                                Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => requestSort('category')}
                            >
                                Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedEvents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No events found for {selectedYear}.</td>
                            </tr>
                        ) : (
                            sortedEvents.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(event.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{event.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.organizerName || 'Admin'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-900 mr-4">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                        >
                            <X size={24} />
                        </button>
                        <div className="p-6">
                            <EventForm
                                initialData={editingEvent}
                                onEventCreated={() => {
                                    fetchEvents();
                                    handleCloseModal();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminEvents;
