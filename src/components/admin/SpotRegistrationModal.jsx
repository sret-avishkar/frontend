import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, Copy } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SpotRegistrationModal = ({ event, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        college: '',
        rollNo: '',
        department: '',
        teamMembers: [],
        paid: true // Default to paid for spot registration
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registrationResult, setRegistrationResult] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTeamMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value };
        setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    };

    const addTeamMember = () => {
        if (formData.teamMembers.length < (parseInt(event.maxTeamMembers || 1) - 1)) {
            setFormData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, { name: '', rollNo: '', department: '' }]
            }));
        }
    };

    const removeTeamMember = (index) => {
        const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/registrations/spot', {
                eventId: event.id,
                ...formData
            });
            setRegistrationResult(response.data);
            if (!response.data.isNewUser) {
                toast.success("Spot registration successful!");
            }
        } catch (err) {
            console.error("Spot registration failed", err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRegistrationResult(null);
        setFormData({
            name: '',
            email: '',
            mobile: '',
            college: '',
            rollNo: '',
            department: '',
            teamMembers: [],
            paid: true
        });
        onSuccess(); // Trigger parent refresh
        onClose();
    };

    const copyCredentials = () => {
        if (registrationResult?.tempPassword) {
            const text = `Email: ${registrationResult.email}\nPassword: ${registrationResult.tempPassword}`;
            navigator.clipboard.writeText(text);
            toast.success("Credentials copied to clipboard");
        }
    };

    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} aria-hidden="true"></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

                        {registrationResult ? (
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Registration Successful!
                                </h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>{formData.name} has been registered for {event.title}.</p>
                                </div>

                                {registrationResult.isNewUser && (
                                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-left">
                                        <h4 className="text-sm font-bold text-yellow-800 mb-2">New Account Created</h4>
                                        <p className="text-xs text-yellow-700 mb-3">Please share these temporary credentials with the participant to log in.</p>

                                        <div className="space-y-1 font-mono text-sm bg-white p-2 rounded border border-gray-200">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="font-bold text-gray-800 select-all">{registrationResult.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Password:</span>
                                                <span className="font-bold text-gray-800 select-all">{registrationResult.tempPassword}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={copyCredentials}
                                            className="mt-3 w-full flex items-center justify-center gap-2 text-sm bg-white border border-gray-300 py-1.5 rounded hover:bg-gray-50"
                                        >
                                            <Copy size={14} /> Copy Credentials
                                        </button>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                        onClick={handleClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <UserPlus className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Spot Registration: {event.title}
                                    </h3>

                                    {error && <div className="mt-2 bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

                                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                                <input type="tel" name="mobile" required pattern="[0-9]{10}" value={formData.mobile} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                            <p className="text-xs text-gray-500 mt-1">If email does not exist, a new account will be created.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">College</label>
                                            <input type="text" name="college" required value={formData.college} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Roll No</label>
                                                <input type="text" name="rollNo" required value={formData.rollNo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                                <input type="text" name="department" required value={formData.department} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                            </div>
                                        </div>

                                        {/* Team Members */}
                                        {parseInt(event.maxTeamMembers || 1) > 1 && (
                                            <div className="border-t pt-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">Team Members</label>
                                                    {formData.teamMembers.length < (parseInt(event.maxTeamMembers) - 1) && (
                                                        <button type="button" onClick={addTeamMember} className="text-xs text-blue-600 hover:text-blue-800">+ Add Member</button>
                                                    )}
                                                </div>
                                                {formData.teamMembers.map((member, idx) => (
                                                    <div key={idx} className="flex gap-2 mb-2 items-start">
                                                        <input placeholder="Name" value={member.name} onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)} className="w-1/3 border border-gray-300 rounded p-1 text-xs" required />
                                                        <input placeholder="Roll No" value={member.rollNo} onChange={(e) => handleTeamMemberChange(idx, 'rollNo', e.target.value)} className="w-1/3 border border-gray-300 rounded p-1 text-xs" required />
                                                        <button type="button" onClick={() => removeTeamMember(idx)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center mt-4">
                                            <input
                                                id="paid"
                                                name="paid"
                                                type="checkbox"
                                                checked={formData.paid}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="paid" className="ml-2 block text-sm text-gray-900 font-medium">
                                                Mark as Paid (Cash/UPI Received)
                                            </label>
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                            >
                                                {loading ? 'Registering...' : 'Complete Registration'}
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpotRegistrationModal;
