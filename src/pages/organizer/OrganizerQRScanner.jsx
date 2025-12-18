import React, { useState } from 'react';
import QRScanner from '../../components/QRScanner';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react';
import api from '../../services/api';

const OrganizerQRScanner = () => {
    const { userRole } = useAuth();
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
            setScannedData(response.data);

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
