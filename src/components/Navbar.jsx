import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    if (location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/pending-approval') {
        return null;
    }

    const handleLogout = async () => {
        try {
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
                                Aviskhar
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
                            <button
                                onClick={handleLogout}
                                className="hover:text-red-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
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
                            Aviskhar
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
                        <Link to="/about" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            About
                        </Link>
                        <Link to="/contact" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                            Contact
                        </Link>

                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="hover:text-red-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="hover:text-blue-400 px-3 py-2 rounded-md text-lg text-gray-300 hover:bg-white/5 font-medium transition-colors">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
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
                                    to="/dashboard"
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
