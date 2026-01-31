import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-black/100 backdrop-blur-md text-white py-8 border-t border-white/10">
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
                            AVISHKAR
                        </h2>
                        <p className="text-gray-500 font-medium tracking-wide">Innovate. Create. Inspire.</p>
                    </div>

                    {/* Right Side: Navigation & Socials */}
                    {/* Changed items-end to items-start or items-center to look better in the center layout */}
                    <div className="flex flex-col items-center md:items-start space-y-6">

                        {/* Navigation Links */}
                        <div className="flex space-x-6 sd:pl-0 md:pl-10 md:space-x-8">
                            <a href="/about" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">About</a>
                            <a href="/events" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Events</a>
                            <a href="/previous-years" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Archive</a>
                            <a href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Contact</a>
                            {/* <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors font-medium text-sm uppercase tracking-wider">Sponsors</a> */}
                        </div>

                        {/* Social Icons */}
                        {/* <h2 className="text-white font-medium tracking-wide text-center sd:pl-20 md:pl-40">Follow Us</h2>
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
                        </div> */}
                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className="pt-4 md:flex-row justify-center items-center gap-4 text-center">
                    <p className="text-gray-500 text-sm">
                        Copyright © Avishkar {new Date().getFullYear()}. All rights reserved.
                    </p>
                    {/* Added a separator dot for desktop view */}
                    {/* <span className="hidden md:block text-gray-700">•</span> */}
                    <p className="text-gray-300 pt-4 text-xs">
                        {/* Designed & Developed by <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-blue-400 transition-colors font-medium">Department of AI&DS</a> */}

                        Designed & Developed by <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors font-medium">Prem Sagar</a>
                        {/* and <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors font-medium">Dinesh</a> */}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
