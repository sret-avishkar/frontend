import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import ImageUploader from './ImageUploader';
import api from '../services/api';

const PaymentModal = ({ registration, event, onClose, onPaymentSuccess }) => {
    const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [organizerPaymentInfo, setOrganizerPaymentInfo] = useState({ upiId: '', qrCodeUrl: '' });

    React.useEffect(() => {
        const fetchOrganizerDetails = async () => {
            try {
                let targetOrganizerId = event.assignedTo || event.createdBy;

                // Check for department specific organizer
                if (event.enableMultiDepartment && registration.department && event.departmentOrganizers) {
                    const deptOrgId = event.departmentOrganizers[registration.department];
                    if (deptOrgId) {
                        targetOrganizerId = deptOrgId;
                    }
                }

                if (targetOrganizerId) {
                    // Try to fetch user info. If endpoint allows public access to limited fields, great.
                    // If not, we might need to adjust backend permissions or use a specific route.
                    // Assuming for now generic user fetch might return basic profile since we have no complex auth roles enforced on GET /users/:id yet or it's just public info.
                    // Actually, let's verify if we can fetch.
                    try {
                        const response = await api.get(`/users/${targetOrganizerId}`);
                        setOrganizerPaymentInfo({
                            upiId: response.data.upiId,
                            qrCodeUrl: response.data.paymentQrCodeUrl
                        });
                    } catch (e) {
                        console.warn("Could not fetch organizer profile", e);
                        // Fallback to event data if user fetch fails
                        setOrganizerPaymentInfo({
                            upiId: event.upiId,
                            qrCodeUrl: event.paymentQrCodeUrl
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch organizer payment info", err);
                // Fallback
                setOrganizerPaymentInfo({
                    upiId: event.upiId,
                    qrCodeUrl: event.paymentQrCodeUrl
                });
            }
        };

        fetchOrganizerDetails();
    }, [event, registration]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!paymentScreenshotUrl) {
            setError('Please upload the payment screenshot.');
            return;
        }

        try {
            await api.put(`/registrations/${registration.id}/payment`, {
                paymentScreenshotUrl
            });

            onPaymentSuccess();
            onClose();
            alert('Payment submitted! Please wait for final confirmation.');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Payment submission failed');
        } finally {
            setLoading(false);
        }
    };

    const finalQrCode = organizerPaymentInfo.qrCodeUrl || event.paymentQrCodeUrl;
    const finalUpiId = organizerPaymentInfo.upiId || event.upiId;

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
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirm Registration</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Your paper has been approved! Please complete the payment of <strong>₹{event.price}</strong> to confirm your seat.
                    </p>

                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Scan QR or Pay via UPI</p>

                            {finalQrCode ? (
                                <img src={finalQrCode} alt="QR" className="w-32 h-32 object-contain mx-auto my-2 rounded-lg border border-gray-200" />
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 mx-auto flex items-center justify-center text-xs text-gray-500 rounded-lg">No QR Code</div>
                            )}

                            {finalUpiId && (
                                <div className="mt-2 bg-white px-3 py-1 rounded border border-gray-300 inline-block">
                                    <span className="text-sm font-mono text-gray-800 select-all">{finalUpiId}</span>
                                </div>
                            )}
                            {!finalQrCode && !finalUpiId && (
                                <p className="text-xs text-red-500 mt-2">Payment details not available. Contact organizer.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot</label>
                            <ImageUploader onUploadComplete={setPaymentScreenshotUrl} folder="payments" />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !paymentScreenshotUrl}
                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Submitting...' : 'Submit Payment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
