import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';
import BackgroundWrapper from './BackgroundWrapper';

const EventSection = ({ title, eventsList, currentUser, userRole, handleRegister, isRegistrationClosed }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 350; // Width of card + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group/section">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center mb-8"
            >
                <div className="h-10 w-2 bg-blue-600 rounded-full mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
            </motion.div>

            {eventsList.length === 0 ? (
                <p className="text-gray-300 italic text-lg">No events found in this category.</p>
            ) : (
                <div className="relative">
                    {/* Left Arrow */}
                    {eventsList.length > 3 && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-800 hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover/section:opacity-100 disabled:opacity-0"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {eventsList.length > 3 && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-800 hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover/section:opacity-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Scroll Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {eventsList.map((event, index) => {
                            const isSlotsFull = event.slots && event.registeredCount >= event.slots;
                            const availableSlots = event.slots ? event.slots - (event.registeredCount || 0) : null;

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="min-w-[320px] md:min-w-[380px] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 snap-center cursor-pointer"
                                    onClick={() => window.location.href = `/events/${event.id}`}
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={event.imageUrl || 'https://via.placeholder.com/400x200'}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                                            ₹{event.price}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">{event.title}</h3>
                                        <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{event.description}</p>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar size={16} className="mr-2 text-blue-500" />
                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPin size={16} className="mr-2 text-red-500" />
                                                {event.venue}
                                            </div>
                                            {(event.organizerName || event.organizerEmail) && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <User size={16} className="mr-2 text-purple-500" />
                                                    Organizer: <span className="font-medium ml-1">{event.organizerName || event.organizerEmail}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <User size={16} className="mr-2 text-green-500" />
                                                Slots: <span className={`font-medium ml-1 ${availableSlots === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {event.slots ? `${availableSlots} / ${event.slots}` : 'Unlimited'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {(!currentUser || (userRole !== 'admin' && userRole !== 'organizer')) && (
                                                <div className="flex-1"></div>
                                            )}
                                            {(currentUser && (userRole === 'admin' || userRole === 'organizer')) && (
                                                <button
                                                    disabled
                                                    className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-xl font-medium cursor-not-allowed border border-gray-200"
                                                >
                                                    Manage in Dashboard
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default EventSection;
