import React from 'react';

const BackgroundWrapper = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] animate-blob mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-600/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen"></div>

                {/* Mesh Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default BackgroundWrapper;
