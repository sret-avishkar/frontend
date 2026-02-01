import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Shield, User, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    // ... (fetchUsers, handleToggleRole, handleRejectRequest, handleDeleteUser kept same)

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'organizer' ? 'participant' : 'organizer';
        const action = user.role === 'organizer' ? 'Demoted' : 'Promoted';

        try {
            await api.put(`/users/${user.uid}/role`, { role: newRole });
            toast.success(`User ${action} successfully`);
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user role", error);
            toast.error("Failed to update user role");
        }
    };

    const handleRejectRequest = async (uid) => {
        try {
            // Just set role to participant to clear the request flag (backend logic handles flag clearing on role update)
            await api.put(`/users/${uid}/role`, { role: 'participant' });
            toast.success("Organizer request rejected");
            fetchUsers();
        } catch (error) {
            console.error("Failed to reject request", error);
            toast.error("Failed to reject request");
        }
    };

    const handleDeleteUser = async (uid) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/users/${uid}`);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingRequests = filteredUsers.filter(user => user.organizerRequest === true && user.role !== 'organizer');

    // Process Main List: Filter -> Sort
    const otherUsers = filteredUsers.filter(user => !user.organizerRequest || user.role === 'organizer').sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nulls
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    if (loading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Shield className="text-blue-600" />
                User Management
            </h1>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Pending Requests Section (if any) */}
            {pendingRequests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                        Pending Organizer Requests
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
                        {/* Duplicate table for pending requests if needed, usually this section is special */}
                        <table className="min-w-full divide-y divide-yellow-100">
                            {/* Simplified request header */}
                            <thead className="bg-yellow-100/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase">User</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-yellow-100">
                                {pendingRequests.map(user => (
                                    <tr key={user.uid}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleToggleRole(user)} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Approve</button>
                                            <button onClick={() => handleRejectRequest(user.uid)} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Users Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group transition-colors"
                                    onClick={() => handleSort('role')}
                                >
                                    <span className="flex items-center gap-1">
                                        Role
                                        {sortConfig.key === 'role' && (
                                            sortConfig.direction === 'asc' ? <span className="text-gray-400">▲</span> : <span className="text-gray-400">▼</span>
                                        )}
                                    </span>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group transition-colors"
                                    onClick={() => handleSort('registrationCount')}
                                >
                                    <span className="flex items-center gap-1">
                                        Registrations
                                        {sortConfig.key === 'registrationCount' && (
                                            sortConfig.direction === 'asc' ? <span className="text-gray-400">▲</span> : <span className="text-gray-400">▼</span>
                                        )}
                                    </span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {otherUsers.map((user) => (
                                <tr key={user.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{(user.name || user.displayName || 'No Name').replace('N/A', '') || 'No Name'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'organizer' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.registrationCount || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        Active
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleRole(user)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {user.role === 'organizer' ? 'Demote' : 'Promote'}
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.uid)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
