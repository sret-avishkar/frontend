import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { User, Mail, Phone, Shield, Save, Loader, QrCode, X, Calendar, Edit, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import QRCode from 'react-qr-code';
import { DashboardSkeleton } from '../components/Skeleton';
import ImageUploader from '../components/ImageUploader';

const Profile = () => {
    const { currentUser, userRole } = useAuth();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        upiId: '',
        role: '',
        paymentQrCodeUrl: ''
    });
    // Password Change State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordUpdating, setPasswordUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('settings'); // Default to settings, will adjust in useEffect
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedQRData, setSelectedQRData] = useState(null);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');
    const [forcePasswordView, setForcePasswordView] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    useEffect(() => {
        if (userRole === 'participant') {
            setActiveTab('events');
        } else {
            setActiveTab('settings');
        }
    }, [userRole]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            name: data.name || currentUser.displayName || '',
                            email: data.email || currentUser.email || '',
                            mobileNumber: data.mobileNumber || '',
                            upiId: data.upiId || '',
                            role: data.role || userRole || 'participant',
                            paymentQrCodeUrl: data.paymentQrCodeUrl || ''
                        });
                    } else {
                        setUserData({
                            name: currentUser.displayName || '',
                            email: currentUser.email || '',
                            mobileNumber: '',
                            upiId: '',
                            role: userRole || 'participant'
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    toast.error("Failed to load profile data.");
                } finally {
                    setLoading(false);
                }
            }
        };

        const fetchMyRegistrations = async () => {
            if (currentUser && userRole === 'participant') {
                try {
                    const response = await api.get(`/registrations/user/${currentUser.uid}`);
                    // Filter out completed events
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const activeRegistrations = response.data.filter(reg => new Date(reg.eventDate) >= today);
                    setMyRegistrations(activeRegistrations);
                } catch (error) {
                    console.error("Failed to fetch my registrations", error);
                }
            }
        };

        fetchUserData();
        fetchMyRegistrations();
    }, [currentUser, userRole]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                name: userData.name || '',
                mobileNumber: userData.mobileNumber || '',
                upiId: userData.upiId || '',
                paymentQrCodeUrl: userData.paymentQrCodeUrl || ''
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const isPasswordSet = currentUser?.providerData.some(p => p.providerId === 'password');

        if (passwords.new !== passwords.confirm) {
            return toast.error("New passwords do not match");
        }
        if (passwords.new.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setPasswordUpdating(true);
        try {
            // Only require re-auth if password provider exists
            if (isPasswordSet) {
                if (!passwords.current) {
                    setPasswordUpdating(false);
                    return toast.error("Please enter current password");
                }
                const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
                await reauthenticateWithCredential(currentUser, credential);
            }

            await updatePassword(currentUser, passwords.new);
            await currentUser.reload(); // Attempt to refresh user data
            toast.success(isPasswordSet ? "Password updated successfully" : "Password set successfully. You can now login with email.");
            setPasswords({ current: '', new: '', confirm: '' });
            if (!isPasswordSet) setForcePasswordView(true);
        } catch (error) {
            console.error("Password update error:", error);
            if (error.code === 'auth/wrong-password') {
                toast.error("Incorrect current password");
            } else if (error.code === 'auth/requires-recent-login') {
                toast.error("Please log out and log in again to change password");
            } else {
                toast.error("Failed to update password: " + error.message);
            }
        } finally {
            setPasswordUpdating(false);
        }
    };

    const handleShowQR = (reg) => {
        setSelectedQRData(JSON.stringify({
            registrationId: reg.id,
            userId: currentUser.uid,
            eventId: reg.eventId // Assuming reg object has eventId
        }));
        setSelectedEventTitle(reg.eventTitle);
        setShowQRModal(true);
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="p-8 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                            <User size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-gray-700">Welcome back, {userData.name || currentUser.email}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {userRole === 'participant' && (
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'events' ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            My Events
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'events' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Events</h2>
                            {myRegistrations.length === 0 ? (
                                <p className="text-gray-700">You haven't registered for any events yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {myRegistrations.map((reg) => (
                                        <div key={reg.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold text-gray-900">{reg.eventTitle}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(reg.eventDate).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{reg.eventVenue}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${reg.status === 'approved' || reg.status === 'confirmed' || reg.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                                        {reg.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {(reg.status === 'approved' || reg.status === 'confirmed' || reg.status === 'paid') && (
                                                <button
                                                    onClick={() => handleShowQR(reg)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-blue-600/20"
                                                >
                                                    <QrCode size={18} /> View QR
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Role (Read-only) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                                        <Shield size={16} /> Role
                                    </label>
                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 capitalize cursor-not-allowed">
                                        {userData.role || 'participant'}
                                    </div>
                                </div>

                                {/* Email (Read-only usually, dependent on auth system) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                                        <Mail size={16} /> Email Address
                                    </label>
                                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed">
                                        {userData.email}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                                        <User size={16} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={userData.name || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                                        <Phone size={16} /> Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={userData.mobileNumber || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="+91 9876543210"
                                    />
                                </div>

                                {/* Change Password Section - Only for Email/Password Users */}
                                {/* Change Password Section */}
                                {/* Change/Set Password Section */}
                                <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-2">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Lock size={18} />
                                        {(currentUser?.providerData.some(p => p.providerId === 'password') || forcePasswordView) ? 'Change Password' : 'Set Password for Email Login'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(currentUser?.providerData.some(p => p.providerId === 'password') || forcePasswordView) && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.current ? "text" : "password"}
                                                        value={passwords.current}
                                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10"
                                                        placeholder="Current Password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('current')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                    >
                                                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10"
                                                    placeholder="New Password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10"
                                                    placeholder="Confirm New Password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-right">
                                        <button
                                            type="button"
                                            onClick={handlePasswordChange}
                                            disabled={passwordUpdating || (!passwords.current && (currentUser?.providerData.some(p => p.providerId === 'password') || forcePasswordView)) || !passwords.new}
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {passwordUpdating ? 'Updating...' : ((currentUser?.providerData.some(p => p.providerId === 'password') || forcePasswordView) ? 'Update Password' : 'Set Password')}
                                        </button>
                                    </div>
                                    {(!currentUser?.providerData.some(p => p.providerId === 'password') && !forcePasswordView) && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Setting a password will allow you to log in with your email and this password, in addition to Google sign-in.
                                        </p>
                                    )}
                                </div>

                                {/* UPI ID (Organizer only) */}
                                {userRole === 'organizer' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                                            <div className="font-bold text-xs bg-gray-200 px-1 rounded">UPI</div> UPI ID
                                        </label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            value={userData.upiId || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="e.g. username@okhdfcbank"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">This will be shown to students for payments.</p>
                                    </div>
                                )}
                                {/* Payment QR Code (Organizer only) */}
                                {userRole === 'organizer' && (
                                    <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-2">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <QrCode size={18} /> Payment QR Code
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">Upload your UPI QR code. This will be shown to students when they register for your events.</p>

                                        <div className="max-w-xs">
                                            <ImageUploader
                                                initialImage={userData.paymentQrCodeUrl}
                                                onUploadComplete={(url) => setUserData({ ...userData, paymentQrCodeUrl: url })}
                                                folder="users/qr"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="animate-spin" size={20} /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* QR Code Modal for Mobile/Profile page */}
            {
                showQRModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in-up">
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1"
                            >
                                <X size={20} />
                            </button>
                            <div className="text-center pt-2">
                                <h3 className="text-xl font-bold mb-1 text-gray-900">Entry Pass</h3>
                                <p className="text-blue-600 font-medium mb-6 text-sm">{selectedEventTitle}</p>

                                <div className="bg-white p-4 inline-block rounded-xl border-2 border-dashed border-gray-300 shadow-inner mb-4">
                                    <QRCode value={selectedQRData || ''} size={180} />
                                </div>

                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                    Show at entrance
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Profile;
