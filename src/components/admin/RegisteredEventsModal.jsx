import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../../services/api';

const RegisteredEventsModal = ({ isOpen, onClose, userId, userName }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchRegisteredEvents();
        } else {
            setEvents([]);
            setError(null);
        }
    }, [isOpen, userId]);

    const fetchRegisteredEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/registrations/user/${userId}`);
            // response.data should be an array of registrations, each having eventTitle
            setEvents(response.data);
        } catch (err) {
            console.error("Failed to fetch registered events", err);
            setError("Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Events for {userName || 'User'}
                                </h3>
                                <div className="mt-4">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-sm text-gray-500">Loading events...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="bg-red-50 p-4 rounded-md">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    ) : events.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No registered events found.</p>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 border-t border-b border-gray-200 max-h-60 overflow-y-auto">
                                            {events.map((reg) => (
                                                <li key={reg.id} className="py-3 flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {reg.eventTitle || 'Unknown Event'}
                                                    </span>
                                                    {/* We can surely add more info here if needed later, but sticking to title for now */}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>

                    {/* Absolute close button top-right */}
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 p-4 text-gray-400 hover:text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisteredEventsModal;
