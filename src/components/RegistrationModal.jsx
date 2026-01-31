import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import ImageUploader from './ImageUploader';
import FileUploader from './FileUploader';
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
    const [paperUrl, setPaperUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [organizerDetails, setOrganizerDetails] = useState({});
    const [globalQrCode, setGlobalQrCode] = useState('');
    const [payLater, setPayLater] = useState(false);

    React.useEffect(() => {
        const fetchOrganizerDetails = async () => {
            let targetOrganizerId = null;

            if (event.enableMultiDepartment === true && event.departmentOrganizers) {
                if (department && event.departmentOrganizers[department]) {
                    targetOrganizerId = event.departmentOrganizers[department];
                    console.log("Selected Dept:", department, "Mapped to Organizer ID:", targetOrganizerId);
                }
            } else {
                targetOrganizerId = event.assignedTo;
                console.log("Single Dept Event, Assigned User:", targetOrganizerId);
            }

            // Fallback to creator if no assigned organizer
            if (!targetOrganizerId && !event.enableMultiDepartment) {
                targetOrganizerId = event.createdBy;
            }

            if (targetOrganizerId) {
                try {
                    console.log("Fetching details for:", targetOrganizerId);
                    const response = await api.get(`/users/${targetOrganizerId}`);
                    console.log("Organizer API Response:", response.data);
                    if (response.data) {
                        setOrganizerDetails({
                            name: response.data.name || '',
                            email: response.data.email || '',
                            mobile: response.data.mobileNumber || '',
                            upiId: response.data.upiId || '',
                            qrCodeUrl: response.data.paymentQrCodeUrl || ''
                        });
                    } else {
                        setOrganizerDetails({});
                    }
                } catch (error) {
                    console.error("Failed to fetch organizer details", error);
                    setOrganizerDetails({});
                }
            } else {
                setOrganizerDetails({});
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data.paymentQrCodeUrl) {
                    setGlobalQrCode(res.data.paymentQrCodeUrl);
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };



        fetchOrganizerDetails();
        fetchSettings();
        fetchSettings();
    }, [event, department]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const isPaperPresentation = event.isPaperPresentation;

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
                paymentScreenshotUrl: (isPaperPresentation || payLater) ? '' : paymentScreenshotUrl,
                paperUrl: isPaperPresentation ? paperUrl : '',
                status: 'pending', // Always pending initially. Paper status handled separately by backend.
                payLater: payLater // Optional: backend might flag this if needed, but 'pending' + no screenshot implies it
            });
            onRegistrationSuccess();
            onClose();
            alert(isPaperPresentation ? 'Paper submitted! Wait for approval.' : 'Registration submitted! Please wait for organizer approval.');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const isPaperPresentation = event.isPaperPresentation;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Register for {event.title}</h2>
                    <p className="text-gray-700 mb-6 flex flex-col gap-1">
                        {isPaperPresentation
                            ? "Please upload your paper for review."
                            : "Please provide your contact details for venue coordination."}
                    </p>

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
                                    placeholder="e.g. 234C1A0000"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Department</label>
                                {event.enableMultiDepartment === true && event.departmentOrganizers ? (
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Department --</option>
                                        {Object.keys(event.departmentOrganizers).map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Information Technology"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Team Member Registration */}
                        {parseInt(event.maxTeamMembers || 1) > 1 && (
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-900">Team Members ({teamMembers.length + 1}/{parseInt(event.maxTeamMembers || 1)})</h3>
                                    {teamMembers.length < (parseInt(event.maxTeamMembers || 1) - 1) && (
                                        <button
                                            type="button"
                                            onClick={() => setTeamMembers([...teamMembers, { name: '', rollNo: '', department: '' }])}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            + Add Member
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {teamMembers.map((member, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                                            <button
                                                type="button"
                                                onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== index))}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="grid grid-cols-1 gap-3">
                                                <input
                                                    placeholder="Full Name"
                                                    value={member.name}
                                                    onChange={(e) => {
                                                        const updated = [...teamMembers];
                                                        updated[index].name = e.target.value;
                                                        setTeamMembers(updated);
                                                    }}
                                                    className="w-full text-sm border-gray-300 rounded-md p-2"
                                                    required
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        placeholder="Roll No"
                                                        value={member.rollNo}
                                                        onChange={(e) => {
                                                            const updated = [...teamMembers];
                                                            updated[index].rollNo = e.target.value;
                                                            setTeamMembers(updated);
                                                        }}
                                                        className="w-full text-sm border-gray-300 rounded-md p-2"
                                                        required
                                                    />
                                                    <input
                                                        placeholder="Department"
                                                        value={member.department}
                                                        onChange={(e) => {
                                                            const updated = [...teamMembers];
                                                            updated[index].department = e.target.value;
                                                            setTeamMembers(updated);
                                                        }}
                                                        className="w-full text-sm border-gray-300 rounded-md p-2"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conditional Section: Payment or Paper Upload */}
                        {isPaperPresentation ? (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Paper Submission</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Upload your paper (PDF/Doc) for review.
                                    <br /><span className="text-xs text-orange-600 font-medium">Note: Payment will be requested ONLY after your paper is approved.</span>
                                </p>
                                <FileUploader
                                    onUploadComplete={setPaperUrl}
                                    label="Upload Abstract/Paper"
                                />
                            </div>
                        ) : (
                            (parseInt(event.price) > 0) && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Organizer Details</h3>
                                    {organizerDetails.name && <p className="text-sm text-gray-700 mb-1">Name: <span className="font-medium">{organizerDetails.name}</span></p>}
                                    {organizerDetails.email && <p className="text-sm text-gray-700 mb-1">Email: <span className="font-medium">{organizerDetails.email}</span></p>}
                                    {organizerDetails.mobile && <p className="text-sm text-gray-700 mb-1">Mobile: <span className="font-medium">{organizerDetails.mobile}</span></p>}

                                    <h3 className="font-semibold mb-2 mt-4">Payment Details</h3>
                                    <p className="text-sm text-gray-600 mb-2">Please pay <strong>₹{event.price}</strong> to confirm your seat.</p>

                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="payLater"
                                            checked={payLater}
                                            onChange={(e) => {
                                                setPayLater(e.target.checked);
                                                if (e.target.checked) setPaymentScreenshotUrl('');
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="payLater" className="ml-2 block text-sm text-gray-900">
                                            Pay Later (at venue/later)
                                        </label>
                                    </div>

                                    {!payLater && (
                                        <>
                                            {organizerDetails.upiId && (
                                                <p className="text-sm text-gray-700 mb-2">UPI ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded select-all">{organizerDetails.upiId}</span></p>
                                            )}

                                            {(organizerDetails.qrCodeUrl || event.paymentQrCodeUrl || globalQrCode) && (
                                                <div className="flex justify-center mb-4">
                                                    <img
                                                        src={organizerDetails.qrCodeUrl || event.paymentQrCodeUrl || globalQrCode}
                                                        alt="Payment QR Code"
                                                        className="w-48 h-48 object-contain border rounded-lg"
                                                    />
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
                                        </>
                                    )}

                                </div>
                            )
                        )}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                (isPaperPresentation && !paperUrl) ||
                                (!isPaperPresentation && parseInt(event.price) > 0 && !paymentScreenshotUrl && !payLater)
                            }
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : (isPaperPresentation ? 'Submit Paper' : (payLater ? 'Register & Pay Later' : 'Confirm Registration'))}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;
