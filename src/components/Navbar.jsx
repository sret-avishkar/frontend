import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, User, LogOut, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';


const Navbar = () => {
    const { currentUser, userRole } = useAuth();
    const { unreadCount, markAllAsRead, clearToken } = useNotifications(); // Changed to use clearToken
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    if (location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/pending-approval') {
        return null;
    }

    const handleLogout = async () => {
        try {
            await clearToken(); // Remove token from backend
            await signOut(auth);
            navigate('/login');
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Custom Navbar for Organizer
    if (userRole === 'organizer') {
        return (
            <nav className="bg-black/80 backdrop-blur-md rounded-sm shadow-sm border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center space-x-4">
                            {/* <img src="https://images-sretattendance.netlify.app/logo/logo.jpg" alt="Logo" className="w-16 h-16 rounded-full" /> */}
                            <Link to="/" className="text-2xl italic uppercase tracking-wider md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 truncate">
                                Avishkar
                            </Link>
                        </div>

                        {/* Desktop Menu - Organizer */}
                        <div className="hidden md:flex items-center space-x-8">
                            {/* <Link to="/" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                                Home
                            </Link> */}

                            <Link to="/organizer" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                                Dashboard
                            </Link>

                            {/* Notification Bell */}
                            <div className="relative group mr-4">
                                <button className="flex items-center text-gray-300 hover:text-blue-400 transition-colors focus:outline-none relative">
                                    <Bell size={20} />
                                    {/* Badge for unread count */}
                                    <NotificationBadge />
                                </button>

                                {/* Notification Dropdown */}
                                <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 backdrop-blur-md">
                                        <span className="text-sm font-semibold text-white">Notifications</span>
                                        <MarkAllReadButton />
                                    </div>
                                    <NotificationList />
                                </div>
                            </div>

                            <div className="relative group">
                                <button
                                    className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors focus:outline-none"
                                >
                                    <div className="bg-white/10 p-2 rounded-full ring-2 ring-transparent hover:ring-blue-500/50 transition-all">
                                        <User size={20} />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                                    <div className="px-4 py-2 border-b border-white/10 mb-2">
                                        <p className="text-sm text-gray-400 truncate">Signed in as</p>
                                        <p className="text-sm font-medium text-white truncate">{currentUser.email}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <User size={16} /> Profile
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <div className="relative group mr-4">
                                <button className="flex items-center text-gray-300 hover:text-blue-400 transition-colors focus:outline-none relative">
                                    <Bell size={20} />
                                    {/* Badge for unread count */}
                                    <NotificationBadge />
                                </button>

                                {/* Notification Dropdown */}
                                <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 backdrop-blur-md">
                                        <span className="text-sm font-semibold text-white">Notifications</span>
                                        <MarkAllReadButton />
                                    </div>
                                    <NotificationList />
                                </div>
                            </div>
                            <button
                                onClick={toggleMenu}
                                className="text-gray-300 hover:text-white focus:outline-none"
                            >
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown - Organizer */}
                {isOpen && (
                    <div className="md:hidden bg-black/90 backdrop-blur-xl shadow-lg absolute w-full left-0 top-20 border-t border-white/10">
                        <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col items-center">
                            {/* <Link
                                to="/"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                            >
                                Home
                            </Link> */}

                            <Link
                                to="/organizer"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-red-400 hover:bg-white/10"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        );
    }

    // Standard Navbar for other users
    return (
        <nav className="bg-black/80 backdrop-blur-md rounded-sm shadow-sm border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center space-x-4">
                        {/* <img src="https://images-sretattendance.netlify.app/logo/logo.jpg" alt="Logo" className="w-16 h-16 rounded-full border-2 border-white/10" /> */}
                        <Link to="/" className="text-2xl italic uppercase tracking-wider md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 truncate">
                            Avishkar
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* <Link to="/" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            Home
                        </Link> */}
                        <Link to="/events" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            Events
                        </Link>
                        <Link to="/previous-years" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            Previous Years
                        </Link>
                        <Link to="/about" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            About
                        </Link>
                        <Link to="/contact" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            Contact
                        </Link>

                        {currentUser ? (
                            <>
                                {/* Notification Bell */}
                                <div className="relative group mr-4">
                                    <button className="flex items-center text-gray-300 hover:text-blue-400 transition-colors focus:outline-none relative">
                                        <Bell size={20} />
                                        {/* Badge for unread count */}
                                        <NotificationBadge />
                                    </button>

                                    {/* Notification Dropdown */}
                                    <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50 max-h-96 overflow-y-auto">
                                        <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 backdrop-blur-md">
                                            <span className="text-sm font-semibold text-white">Notifications</span>
                                            <MarkAllReadButton />
                                        </div>
                                        <NotificationList />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <button
                                        className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors focus:outline-none"
                                    >
                                        <div className="bg-white/10 p-2 rounded-full ring-2 ring-transparent hover:ring-blue-500/50 transition-all">
                                            <User size={20} />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                                        <div className="px-4 py-2 border-b border-white/10 mb-2">
                                            <p className="text-sm text-gray-400 truncate">Signed in as</p>
                                            <p className="text-sm font-medium text-white truncate">{currentUser.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <User size={16} /> Profile
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        {currentUser && (
                            <div className="relative group mr-4">
                                <button className="flex items-center text-gray-300 hover:text-blue-400 transition-colors focus:outline-none relative">
                                    <Bell size={20} />
                                    <NotificationBadge />
                                </button>

                                <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center bg-black/50 sticky top-0 backdrop-blur-md">
                                        <span className="text-sm font-semibold text-white">Notifications</span>
                                        <MarkAllReadButton />
                                    </div>
                                    <NotificationList />
                                </div>
                            </div>
                        )}
                        <button
                            onClick={toggleMenu}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-xl shadow-lg absolute w-full left-0 top-20 border-t border-white/10">
                    <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col items-center">
                        {/* <Link
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Home
                        </Link> */}
                        <Link
                            to="/events"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Events
                        </Link>
                        <Link
                            to="/previous-years"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Archive
                        </Link>
                        <Link
                            to="/about"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Contact
                        </Link>

                        {currentUser ? (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-red-400 hover:bg-white/10"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center px-3 py-2 rounded-md text-lg font-medium text-blue-400 hover:bg-white/10"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

const NotificationBadge = () => {
    const { unreadCount } = useNotifications();
    if (unreadCount === 0) return null;
    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex justify-center items-center">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    );
};

const MarkAllReadButton = () => {
    const { markAllAsRead, unreadCount } = useNotifications();
    if (unreadCount === 0) return null;
    return (
        <button
            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
            className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
        >
            Mark all read
        </button>
    );
};

const NotificationList = () => {
    const { notifications, markAsRead } = useNotifications();
    const navigate = useNavigate();

    if (!Array.isArray(notifications) || notifications.length === 0) {
        return <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>;
    }

    return (
        <div className="divide-y divide-white/10">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-500/10' : ''}`}
                    onClick={() => {
                        markAsRead(notif.id);
                        if (notif.url) {
                            navigate(notif.url);
                        }
                    }}
                >
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-medium ${!notif.read ? 'text-blue-200' : 'text-gray-300'}`}>
                            {notif.title}
                        </h4>
                        {notif.createdAt && (
                            <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                {/* Formatting timestamp if it exists. Firestore timestamp needs handling */}
                                {notif.createdAt?.toDate ? format(notif.createdAt.toDate(), 'MMM d, h:mm a') : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{notif.body}</p>
                </div>
            ))}
        </div>
    );
};
