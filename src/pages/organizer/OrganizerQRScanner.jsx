import React, { useState } from 'react';
import QRScanner from '../../components/QRScanner';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Calendar, Users, Clock, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrganizerQRScanner = () => {
    const { userRole, currentUser } = useAuth();
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (userRole !== 'organizer' && userRole !== 'admin') {
        return <div className="p-8 text-center">Access Denied. Organizer privileges required.</div>;
    }

    const handleScanSuccess = async (decodedText) => {
        if (loading || scannedData) return; // Prevent multiple scans while processing or if result shown

        setLoading(true);
        setError(null);

        try {
            // Parse JSON data from QR
            // Expected format: { registrationId: "...", userId: "...", eventId: "..." }
            let parsedData;
            try {
                parsedData = JSON.parse(decodedText);
            } catch (e) {
                throw new Error("Invalid QR Code format. Not a valid JSON.");
            }

            if (!parsedData.registrationId) {
                // Fallback: if only userId/eventId, we might need to search. 
                // But Dashboard.jsx sends registrationId now.
                throw new Error("QR Code missing registration ID.");
            }

            // Fetch full details
            const response = await api.get(`/registrations/${parsedData.registrationId}`);
            const data = response.data;

            // Strict Check for Organizers: specific event ownership
            if (userRole === 'organizer') {
                if (!currentUser?.uid) {
                    throw new Error("User authentication error. Please relogin.");
                }

                const isAssigned = data.eventAssignedTo === currentUser.uid;
                const isCreator = data.eventCreatedBy === currentUser.uid;
                let isDeptOrganizer = false;

                if (data.eventEnableMultiDepartment && data.eventDepartmentOrganizers && data.department) {
                    isDeptOrganizer = data.eventDepartmentOrganizers[data.department] === currentUser.uid;
                }

                if (!isAssigned && !isCreator && !isDeptOrganizer) {
                    throw new Error("This participant is registered for an event (or department) you do not manage.");
                }
            }

            setScannedData(data);

        } catch (err) {
            console.error("Scan Error:", err);
            setError(err.response?.data?.error || err.message || "Failed to verify registration.");
        } finally {
            setLoading(false);
        }
    };

    const handleScanFailure = (err) => {
        // console.warn(err); // Too noisy
    };

    const resetScan = () => {
        setScannedData(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
                    <span>Logged in as: <strong className="capitalize">{userRole}</strong></span>
                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Organizer Mode: Restricted Access</span>
                </div> */}
                <div className="mb-6">
                    <Link to="/organizer" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-center">Scan Participant QR Code</h1>

                    {!scannedData && !error && (
                        <div className="max-w-md mx-auto">
                            <QRScanner
                                onScanSuccess={handleScanSuccess}
                                onScanFailure={handleScanFailure}
                            />
                            {loading && <p className="text-center mt-4 text-blue-600 font-semibold">Verifying...</p>}
                            <p className="text-center text-gray-500 mt-6 text-sm">
                                Point the camera at the participant's QR code to verify their registration.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                <XCircle size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={resetScan}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Scan Again
                            </button>
                        </div>
                    )}

                    {scannedData && (
                        <div className="text-center py-8 animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-green-600 mb-6">Verified Successfully</h3>

                            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto text-left space-y-4 border border-gray-200">
                                <div className="flex items-start">
                                    <User size={20} className="text-gray-400 mt-1 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Participant Name</p>
                                        <p className="font-bold text-lg text-gray-900">{scannedData.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Mail size={20} className="text-gray-400 mt-1 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{scannedData.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar size={20} className="text-gray-400 mt-1 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Event</p>
                                        <p className="font-medium text-gray-900">{scannedData.eventTitle || 'Unknown Event'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className={`mt-1 mr-3 ${scannedData.status === 'confirmed' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {scannedData.status === 'confirmed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Status</p>
                                        <p className={`font-bold text-lg ${scannedData.status === 'confirmed' ? 'text-green-600' :
                                            scannedData.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                                            }`}>
                                            {scannedData.status === 'confirmed' ? 'PAID & VERIFIED' :
                                                scannedData.status === 'approved' ? 'Approved (Unpaid)' :
                                                    (scannedData.status === 'pending' && scannedData.paymentScreenshotUrl) ? 'Verification Pending' :
                                                        scannedData.status.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    {scannedData.paymentScreenshotUrl && (
                                        <a
                                            href={scannedData.paymentScreenshotUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            <ImageIcon size={20} /> View Payment Proof
                                        </a>
                                    )}

                                    {/* Action Buttons based on Status */}
                                    {scannedData.status !== 'confirmed' && scannedData.status !== 'rejected' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Confirm this payment and admission?')) return;
                                                    try {
                                                        await api.put(`/registrations/${scannedData.id}/status`, { status: 'confirmed' });
                                                        setScannedData({ ...scannedData, status: 'confirmed' });
                                                        toast.success('Registration Confirmed!');
                                                    } catch (e) {
                                                        toast.error('Failed to confirm');
                                                    }
                                                }}
                                                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex justify-center items-center gap-2"
                                            >
                                                <CheckCircle size={20} />
                                                {scannedData.paymentScreenshotUrl ? 'Verify & Confirm' : 'Confirm Payment'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {scannedData.teamMembers && scannedData.teamMembers.length > 0 && (
                                    <div className="flex items-start">
                                        <Users size={20} className="text-gray-400 mt-1 mr-3" />
                                        <div className="w-full">
                                            <p className="text-sm text-gray-500 mb-1">Team Members ({scannedData.teamMembers.length})</p>
                                            <ul className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
                                                {scannedData.teamMembers.map((tm, idx) => (
                                                    <li key={idx} className="p-2 text-sm flex justify-between items-center">
                                                        <span className="font-medium text-gray-800">{tm.name}</span>
                                                        <span className="text-gray-400 text-xs">{tm.rollNo}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-200 mt-2">
                                    <p className="text-xs text-gray-400">Registration ID: {scannedData.id}</p>
                                </div>
                            </div>

                            <button
                                onClick={resetScan}
                                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Scan Next Participant
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerQRScanner;
