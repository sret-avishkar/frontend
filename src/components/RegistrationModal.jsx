import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import ImageUploader from './ImageUploader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegistrationModal = ({ event, onClose, onRegistrationSuccess }) => {
    const { currentUser } = useAuth();
    const [mobile, setMobile] = useState(currentUser?.mobile || '');
    const [college, setCollege] = useState(currentUser?.college || '');
    const [rollNo, setRollNo] = useState(currentUser?.rollNo || '');
    const [department, setDepartment] = useState(currentUser?.department || '');
    const [teamMembers, setTeamMembers] = useState([]);
    const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/registrations', {
                userId: currentUser.uid,
                eventId: event.id,
                mobile,
                college,
                rollNo,
                department,
                email: currentUser.email,
                name: currentUser.displayName || 'Participant',
                teamMembers,
                paymentScreenshotUrl,
                status: 'pending' // Default status until organizer approves
            });
            onRegistrationSuccess();
            onClose();
            alert('Registration submitted! Please wait for organizer approval.');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Register for {event.title}</h2>
                    <p className="text-gray-700 mb-6">Please provide your contact details for venue coordination.</p>

                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={currentUser.displayName || ''}
                                    disabled
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    placeholder="10-digit mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">College/Institution Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter your college name"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Roll Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 21IT101"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Department</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Information Technology"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Payment Section */}
                        {(event.paymentQrCodeUrl || event.upiId) && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Payment Details</h3>
                                <p className="text-sm text-gray-600 mb-2">Please pay <strong>₹{event.price}</strong> to confirm your seat.</p>

                                {event.upiId && (
                                    <p className="text-sm text-gray-700 mb-2">UPI ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{event.upiId}</span></p>
                                )}

                                {event.paymentQrCodeUrl && (
                                    <div className="flex justify-center mb-4">
                                        <img src={event.paymentQrCodeUrl} alt="Payment QR Code" className="w-48 h-48 object-contain border rounded-lg" />
                                    </div>
                                )}

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot</label>
                                    <ImageUploader onUploadComplete={setPaymentScreenshotUrl} folder="payments" />
                                    {paymentScreenshotUrl && (
                                        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                            <Upload size={14} /> Screenshot uploaded!
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || ((event.paymentQrCodeUrl || event.upiId) && !paymentScreenshotUrl)}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registering...' : 'Confirm Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;
