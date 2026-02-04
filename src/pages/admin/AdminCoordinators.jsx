import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, Search, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCoordinators = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (user, newRole) => {
        const action = newRole === 'coordinator' ? 'Promoted to Coordinator' : 'Removed from Coordinators';
        try {
            await api.put(`/users/${user.uid}/role`, { role: newRole });
            toast.success(`${action} successfully`);
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user role", error);
            toast.error("Failed to update user role");
        }
    };

    const coordinators = users.filter(user => user.role === 'coordinator');

    // Candidates are anyone who is NOT an admin and NOT already a coordinator
    const candidates = users.filter(user => user.role !== 'admin' && user.role !== 'coordinator');

    const filteredCandidates = candidates.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <UserCheck className="text-purple-600" />
                    Manage Coordinators
                </h1>
                <button
                    onClick={() => { setSearchTerm(''); setShowAddModal(true); }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md transition-colors"
                >
                    <Plus size={20} /> Add Coordinator
                </button>
            </div>

            {/* Coordinators List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                {coordinators.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No coordinators assigned yet.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coordinators.map(user => (
                                <tr key={user.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                {(user.name || user.email)[0].toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name || user.displayName || 'No Name'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to remove this coordinator?')) {
                                                    updateRole(user, 'participant');
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto"
                                        >
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Add Coordinator</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2">
                            {filteredCandidates.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    {searchTerm ? 'No users found matching your search.' : 'Type to search users.'}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCandidates.slice(0, 50).map(user => (
                                        <div key={user.uid} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name || user.displayName || 'No Name'}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{user.role}</span>
                                            </div>
                                            <button
                                                onClick={() => updateRole(user, 'coordinator')}
                                                className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoordinators;
