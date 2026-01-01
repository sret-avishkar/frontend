import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Added db import
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, ArrowLeft, Quote } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
    // ... (state remains same)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || null;
    const showModalOnReturn = location.state?.showModalOnReturn || false;
    const { signInWithGoogle } = useAuth();

    // ... (quotes logic remains same)
    const quotes = [
        "Technology is best when it brings people together.",
        "The future belongs to those who believe in the beauty of their dreams.",
    ];
    const [currentQuoteIndex] = useState(Math.floor(Math.random() * quotes.length));

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Use imported getDoc/db instead of dynamic
            const userDoc = await getDoc(doc(db, "users", user.uid));

            toast.success("Welcome back!");

            if (userDoc.exists()) {
                const role = userDoc.data().role;
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'organizer') {
                    navigate('/organizer');
                } else {
                    if (from) {
                        navigate(from, { state: { showModalOnReturn } });
                    } else {
                        navigate('/events');
                    }
                }
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to log in: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            const user = result;

            // Use imported getDoc/db
            const userDoc = await getDoc(doc(db, "users", user.uid));

            toast.success("Signed in with Google!");

            if (userDoc.exists()) {
                const role = userDoc.data().role;
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'organizer') {
                    navigate('/organizer');
                } else {
                    navigate(from || '/events');
                }
            } else {
                navigate(from || '/events');
            }
        } catch (error) {
            console.error(error);
            toast.error("Google Sign In failed: " + error.message);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center lg:justify-end bg-cover bg-no-repeat bg-fixed"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop")', backgroundPosition: 'center' }}>

            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 backdrop-blur-[3px]"></div>

            {/* Back Button */}
            <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/90 hover:text-white transition-all bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
            </Link>

            {/* Quotation - Left Side */}
            <div className="absolute left-10 bottom-10 z-20 hidden lg:block max-w-lg text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Quote size={48} className="text-blue-400 mb-4 opacity-80" />
                    <motion.blockquote
                        key={currentQuoteIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-light leading-relaxed mb-6 min-h-[120px]"
                    >
                        "{quotes[currentQuoteIndex]}"
                    </motion.blockquote>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                        <p className="text-lg font-medium text-blue-200">Avishkar Team</p>
                    </div>
                </motion.div>
            </div>

            {/* Login Container */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mr-0 lg:mr-20 p-4"
            >
                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-900"
                        >
                            Welcome Back
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-2 text-sm text-gray-600"
                        >
                            Sign in to continue to Avishkar
                        </motion.p>
                    </div>

                    <div className="space-y-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </motion.button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white/0 text-gray-500 bg-white/90 backdrop-blur-xl rounded-full">Or continue with email</span>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleEmailLogin}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 focus:bg-white"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 focus:bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : (
                                    <>
                                        Sign in <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Create one now
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
