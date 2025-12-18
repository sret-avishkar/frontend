import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Shield, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

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

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingRequests = filteredUsers.filter(user => user.organizerRequest === true && user.role !== 'organizer');
    const otherUsers = filteredUsers.filter(user => !user.organizerRequest || user.role === 'organizer');

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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
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
                                                <div className="text-sm font-medium text-gray-900">{user.displayName !== 'N/A' ? user.displayName : 'No Name'}</div>
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
                                        Active
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleToggleRole(user)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {user.role === 'organizer' ? 'Demote to Participant' : 'Promote to Organizer'}
                                            </button>
                                        )}
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
