import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Users, Settings, QrCode, LogOut, X, Image as ImageIcon } from 'lucide-react';
import { auth } from '../../firebase';

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { path: '/admin/events', icon: <Calendar size={20} />, label: 'All Events' },
        { path: '/admin/approvals', icon: <CheckSquare size={20} />, label: 'Pending Approvals' },
        { path: '/admin/attendance', icon: <QrCode size={20} />, label: 'Attendance' },
        { path: '/admin/participants', icon: <Users size={20} />, label: 'Participants' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/admin/gallery', icon: <ImageIcon size={20} />, label: 'Gallery Upload' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className={`bg-gray-900 text-white w-64 min-h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-400">Admin Panel</h1>
                    <p className="text-gray-400 text-sm">Aviskhar 2026</p>
                </div>
                {/* Close button for mobile */}
                <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()} // Close sidebar on navigation (mobile)
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={async () => {
                        await auth.signOut();
                        window.location.href = '/';
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg w-full transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
