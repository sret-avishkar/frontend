import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import EventSection from '../components/EventSection';
import Footer from '../components/Footer';
import { CardSkeleton, HomeSkeleton } from '../components/Skeleton';

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
    const [loading, setLoading] = useState(true);
    const [deadlineLoading, setDeadlineLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({});
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();

    // Redirect if logged in - Only for Admin and Organizer
    useEffect(() => {
        if (currentUser) {
            if (userRole === 'admin') {
                navigate('/admin');
            } else if (userRole === 'organizer') {
                navigate('/organizer');
            }
            // Students/Participants can stay on Home page
        }
    }, [currentUser, userRole, navigate]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data.registrationDeadline) {
                    setDeadline(new Date(response.data.registrationDeadline));
                } else {
                    setDeadline(new Date("2026-04-20")); // Set a future default date
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
                setDeadline(new Date("2026-04-20")); // Set a future default date
            } finally {
                setDeadlineLoading(false);
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
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const now = new Date();
    // Reset time to start of day for accurate comparison if date is only YYYY-MM-DD
    // But assuming date field is standard ISO or Date object.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];
        return events.filter(e => {
            // Handle Firestore Timestamp
            let eventDate;
            if (e.date && typeof e.date.toDate === 'function') {
                eventDate = e.date.toDate();
            } else {
                eventDate = new Date(e.date);
            }
            if (isNaN(eventDate.getTime())) return false; // Invalid date

            // Reset time part for accurate date-only comparison
            const eventDateOnly = new Date(eventDate);
            eventDateOnly.setHours(0, 0, 0, 0);

            return eventDateOnly >= today;
        });
    }, [events, today]);


    const technicalEvents = useMemo(
        () => upcomingEvents.filter(e => e.category === 'technical'),
        [upcomingEvents]
    );

    const nonTechnicalEvents = useMemo(
        () => upcomingEvents.filter(e => e.category === 'non-technical' || e.category === 'cultural'),
        [upcomingEvents]
    );

    const spotEvents = useMemo(
        () => upcomingEvents.filter(e => e.category === 'spot'),
        [upcomingEvents]
    );

    const handleRegister = (eventId) => {
        if (!currentUser) {
            navigate('/login', { state: { from: location.pathname } });
        } else {
            navigate(`/events/${eventId}`, { state: { from: location.pathname } });
        }
    };

    const isRegistrationClosed = deadline && new Date() > deadline;

    const heroImages = [
        // "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
        // "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
        // "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2070&auto=format&fit=crop",
        // "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop"
        "/assets/images/slideshow/inauguration.png",
        "/assets/images/slideshow/coding-contest.png",
        "/assets/images/slideshow/paper-presentation.png",
        "/assets/images/slideshow/poster-presentation.png",
        "/assets/images/slideshow/quiz.png"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {(loading || deadlineLoading) ? (
                <HomeSkeleton />
            ) : (
                <div className="min-h-screen font-sans selection:bg-white selection:text-blue-900 text-gray-100 bg-white/50">
                    {/* Hero Section */}
                    <section className="relative h-[90vh] flex items-center justify-center bg-black overflow-hidden">
                        {/* ... existing hero content ... */}
                        {/* I will keep the hero image but maybe adjust opacity to blend with new background? 
                        Actually, the user asked for "crazy backgrounds". 
                        The Hero section has its own image. I should probably keep it but let the background wrapper show through elsewhere.
                        The existing code has a white/gray background for events. I should make that transparent or dark.
                    */}
                        <div className="absolute inset-0 z-0">
                            {/* Mobile Background - Video */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-70 md:hidden"
                            // className="absolute inset-0 w-full h-full object-cover opacity-70 md"
                            >
                                <source src="/assets/videos/background.mp4" type="video/mp4" />
                            </video>

                            {/* Desktop Background - Slideshow */}
                            <div className="hidden md:block absolute inset-0 w-full h-full">
                                {/* <div className="hidden absolute inset-0 w-full h-full"> */}
                                {heroImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt="Event Background"
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-10000 ${index === currentImageIndex ? 'opacity-70' : 'opacity-0'}`}
                                    />
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-transparent backdrop-blur-[1px]"></div>
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
                                    AVISHKAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{new Date().getFullYear()}</span>
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
                                    {isRegistrationClosed ? (
                                        <></>
                                    ) : (
                                        <>
                                            <Clock size={20} className="text-blue-400" />
                                            <span className="uppercase tracking-widest text-sm font-semibold">Registration Ends In</span>
                                        </>
                                    )}
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
                            className="absolute bottom-10 left-100 -translate-x-1/2 
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

                        {loading ? (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                                {[1, 2, 3].map((section) => (
                                    <div key={section}>
                                        <div className="h-8 w-48 bg-gray-700/50 rounded mb-8 animate-pulse"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {[1, 2, 3].map((i) => (
                                                <CardSkeleton key={i} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <EventSection
                                    title="Technical Events"
                                    eventsList={technicalEvents}
                                    currentUser={currentUser}
                                    userRole={userRole}
                                    handleRegister={handleRegister}
                                    isRegistrationClosed={isRegistrationClosed}
                                    viewAllLink="/events?category=technical"
                                />
                                <EventSection
                                    title="Non-Technical Events"
                                    eventsList={nonTechnicalEvents}
                                    currentUser={currentUser}
                                    userRole={userRole}
                                    handleRegister={handleRegister}
                                    isRegistrationClosed={isRegistrationClosed}
                                    viewAllLink="/events?category=non-technical"
                                />
                                <EventSection
                                    title="Spot Events"
                                    eventsList={spotEvents}
                                    currentUser={currentUser}
                                    userRole={userRole}
                                    handleRegister={handleRegister}
                                    isRegistrationClosed={isRegistrationClosed}
                                    viewAllLink="/events?category=spot"
                                />
                            </div >
                        )}
                    </div >

                    {/* Footer */}
                    < Footer />
                </div >
            )}
        </>
    );
};

export default Home;

