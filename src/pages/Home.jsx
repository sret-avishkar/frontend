import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import EventSection from '../components/EventSection';

const TimerUnit = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-2xl md:text-5xl font-bold text-white">
                {String(value || 0).padStart(2, '0')}
            </span>
        </div>
        <span className="text-xs md:text-sm uppercase text-blue-200 tracking-widest mt-2 font-medium">{label}</span>
    </div>
);

const Home = () => {
    const [deadline, setDeadline] = useState(null);
    const [events, setEvents] = useState([]);
    const [timeLeft, setTimeLeft] = useState({});
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data.registrationDeadline) {
                    setDeadline(new Date(response.data.registrationDeadline));
                } else {
                    setDeadline(new Date("2025-12-25"));
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
                setDeadline(new Date("2025-12-25"));
            }
        };
        fetchSettings();
    }, []);

    function calculateTimeLeft() {
        if (!deadline) return {};
        const difference = +deadline - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    }

    useEffect(() => {
        if (!deadline) return;

        setTimeLeft(calculateTimeLeft()); // initial calculation

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [deadline]);


    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data);
            } catch (error) {
                console.error("Failed to fetch events", error);
                setError("Failed to load events. Please check your internet connection or try again later.");
            }
        };
        fetchEvents();
    }, []);

    const technicalEvents = useMemo(
        () => events.filter(e => e.category === 'technical'),
        [events]
    );

    const nonTechnicalEvents = useMemo(
        () => events.filter(e => e.category === 'non-technical' || e.category === 'cultural'),
        [events]
    );

    const spotEvents = useMemo(
        () => events.filter(e => e.category === 'spot' || e.category === 'workshop'),
        [events]
    );

    const handleRegister = (eventId) => {
        if (!currentUser) {
            window.location.href = '/login';
        } else {
            window.location.href = `/events/${eventId}`;
        }
    };

    const isRegistrationClosed = deadline && new Date() > deadline;

    const heroImages = [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 text-gray-100">
                {/* Hero Section */}
                <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                    {/* ... existing hero content ... */}
                    {/* I will keep the hero image but maybe adjust opacity to blend with new background? 
                        Actually, the user asked for "crazy backgrounds". 
                        The Hero section has its own image. I should probably keep it but let the background wrapper show through elsewhere.
                        The existing code has a white/gray background for events. I should make that transparent or dark.
                    */}
                    <div className="absolute inset-0 z-0">
                        {heroImages.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt="Event Background"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-60' : 'opacity-0'}`}
                            />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent backdrop-blur-[1px]"></div>
                    </div>

                    <div className="relative z-14 text-center px-4 max-w-6xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-10"
                        >
                            <div className="inline-block px-4 py-1.5 border border-blue-400/30 rounded-full bg-blue-500/10 backdrop-blur-sm mb-6">
                                <span className="text-sm md:text-base text-blue-300 font-medium tracking-widest uppercase">National Level Techno-Cultural Fest</span>
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none">
                                AVISKHAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">2026</span>
                            </h1>
                            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                Unleash your potential at the biggest tech fest of the year. Innovation, culture, and technology converge here.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 inline-block shadow-2xl max-w-4xl w-full"
                        >
                            <div className="flex items-center justify-center gap-2 mb-8 text-gray-300">
                                <Clock size={20} className="text-blue-400" />
                                <span className="uppercase tracking-widest text-sm font-semibold">Registration Ends In</span>
                            </div>

                            <div className="flex justify-center flex-wrap gap-4 md:gap-8">
                                {isRegistrationClosed ? (
                                    <div className="text-center py-4">
                                        <span className="text-4xl md:text-6xl font-bold text-red-500 drop-shadow-lg">Registration Closed</span>
                                        <p className="text-gray-400 mt-2">See you at the event!</p>
                                    </div>
                                ) : (
                                    <>
                                        <TimerUnit value={timeLeft.days} label="Days" />
                                        <TimerUnit value={timeLeft.hours} label="Hours" />
                                        <TimerUnit value={timeLeft.minutes} label="Minutes" />
                                        <div className="hidden md:block">
                                            <TimerUnit value={timeLeft.seconds} label="Seconds" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 
                   text-white/70 flex flex-col items-center 
                   z-50 pointer-events-none"
                    >

                        <span className="text-xs uppercase tracking-widest mb-2 whitespace-nowrap">Scroll Down</span>
                        <ArrowRight className="rotate-90" size={20} />
                    </motion.div>
                </section>

                {/* Events Sections */}
                <div className="space-y-12 py-20 bg-transparent">
                    {error && (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    )}
                    <EventSection
                        title="Technical Events"
                        eventsList={technicalEvents}
                        currentUser={currentUser}
                        userRole={userRole}
                        handleRegister={handleRegister}
                        isRegistrationClosed={isRegistrationClosed}
                    />
                    <EventSection
                        title="Non-Technical Events"
                        eventsList={nonTechnicalEvents}
                        currentUser={currentUser}
                        userRole={userRole}
                        handleRegister={handleRegister}
                        isRegistrationClosed={isRegistrationClosed}
                    />
                    <EventSection
                        title="Spot Events & Workshops"
                        eventsList={spotEvents}
                        currentUser={currentUser}
                        userRole={userRole}
                        handleRegister={handleRegister}
                        isRegistrationClosed={isRegistrationClosed}
                    />
                </div>

                {/* Footer */}
                <footer className="bg-black/40 backdrop-blur-md text-white py-8 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Layout Change: 
               - Removed 'justify-between' (which pushes items to edges).
               - Added 'justify-center' to center the whole group.
               - Added 'gap-12 md:gap-32' to create space between the Logo and Links.
            */}
                        <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-32 mb-10">

                            {/* Left Side: Brand & Tagline */}
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    AVISKHAR 2026
                                </h2>
                                <p className="text-gray-500 font-medium tracking-wide">Innovate. Create. Inspire.</p>
                            </div>

                            {/* Right Side: Navigation & Socials */}
                            {/* Changed items-end to items-start or items-center to look better in the center layout */}
                            <div className="flex flex-col items-center md:items-start space-y-6">

                                {/* Navigation Links */}
                                <div className="flex space-x-6 sd:pl-0 md:pl-20 md:space-x-8">
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">About</a>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Events</a>
                                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Contact</a>
                                    {/* <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Sponsors</a> */}
                                </div>

                                {/* Social Icons */}
                                <h1 className="text-white font-medium tracking-wide text-center sd:pl-20 md:pl-40">Follow Us</h1>
                                <div className="flex space-x-4 sd:pl-0 md:pl-20">
                                    <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white text-gray-400 transition-all duration-300 hover:-translate-y-1">
                                        <FaInstagram size={18} />
                                    </a>
                                    <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-black hover:text-white text-gray-400 transition-all duration-300 hover:-translate-y-1">
                                        <FaTwitter size={18} />
                                    </a>
                                    <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-blue-700 hover:text-white text-gray-400 transition-all duration-300 hover:-translate-y-1">
                                        <FaLinkedin size={18} />
                                    </a>
                                    <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-blue-800 hover:text-white text-gray-400 transition-all duration-300 hover:-translate-y-1">
                                        <FaFacebook size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Copyright */}
                        <div className="pt-4 flex flex-col md:flex-row justify-center items-center gap-4 text-center">
                            <p className="text-gray-500 text-sm">
                                Copyright © Aviskhar 2026. All rights reserved.
                            </p>
                            {/* Added a separator dot for desktop view */}
                            <span className="hidden md:block text-gray-700">•</span>
                            <p className="text-gray-300 text-xs">
                                Designed & Developed by <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors font-medium">Prem Sagar</a> and <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors font-medium">Dinesh</a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Home;


