import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../../services/api';
import ImageUploader from '../../components/ImageUploader';

const AdminSettings = () => {
    const [deadline, setDeadline] = useState('');
    const [departments, setDepartments] = useState([]);
    const [newDept, setNewDept] = useState('');
    const [multiDept, setMultiDept] = useState(false);
    const [loading, setLoading] = useState(false);
    const [archiveYear, setArchiveYear] = useState(new Date().getFullYear().toString());
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [paymentQrCodeUrl, setPaymentQrCodeUrl] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                // Format for datetime-local input: YYYY-MM-DDTHH:mm
                if (response.data.registrationDeadline) {
                    const date = new Date(response.data.registrationDeadline);
                    // Adjust to local time for display
                    const offset = date.getTimezoneOffset();
                    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                    const formatted = localDate.toISOString().slice(0, 16);
                    setDeadline(formatted);
                }
                if (response.data.departments) {
                    setDepartments(response.data.departments);
                }
                if (response.data.paymentQrCodeUrl) {
                    setPaymentQrCodeUrl(response.data.paymentQrCodeUrl);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/settings', {
                registrationDeadline: new Date(deadline).toISOString(),
                departments: departments,
                paymentQrCodeUrl: paymentQrCodeUrl
            });
            alert('Settings updated successfully!');
        } catch (error) {
            alert('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const addDepartment = () => {
        if (newDept.trim() && !departments.includes(newDept.trim())) {
            setDepartments([...departments, newDept.trim()]);
            setNewDept('');
        }
    };

    const removeDepartment = (deptToRemove) => {
        setDepartments(departments.filter(d => d !== deptToRemove));
    };

    // ... existing handleArchive code ...

    return (
        <div className="max-w-xl space-y-8">
            <h2 className="text-2xl font-bold mb-6">Global Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                    <p className="text-sm text-gray-500 mb-2">This date controls the countdown timer on the Home page.</p>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>


                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manage Departments</label>
                    <p className="text-sm text-gray-500 mb-2">Add or remove departments available for event creation.</p>

                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                            placeholder="New Department (e.g. BIOTECH)"
                            className="flex-grow border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                        />
                        <button
                            onClick={addDepartment}
                            type="button"
                            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {departments.map(dept => (
                            <span key={dept} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {dept}
                                <button
                                    type="button"
                                    onClick={() => removeDepartment(dept)}
                                    className="text-blue-600 hover:text-blue-900 focus:outline-none"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Global Payment Settings</h3>
                    <p className="text-sm text-gray-500 mb-2">Upload a default Payment QR Code to be used if an organizer hasn't set their own.</p>

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Payment QR Code</label>
                        <ImageUploader
                            initialImage={paymentQrCodeUrl}
                            onUploadComplete={(url) => setPaymentQrCodeUrl(url)}
                            folder="settings"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

        </div>
    );
};

export default AdminSettings;
