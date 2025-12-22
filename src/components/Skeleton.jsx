import React from 'react';

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
);

export const CardSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
        <div className="relative h-48 bg-gray-200 animate-pulse">
            {/* Image placeholder */}
        </div>
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-4 flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    </div>
);

export const DetailSkeleton = () => (
    <div className="min-h-screen bg-white">
        <div className="min-h-screen py-24 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-6 w-32" /> {/* Back button */}

                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="relative h-64 md:h-96 bg-gray-200 animate-pulse"></div>
                    <div className="p-8 space-y-6">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-10 w-3/4" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>

                        <div className="space-y-4 pt-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const HomeSkeleton = () => {
    return (
        <div className="min-h-screen font-sans bg-white">
            {/* Hero Skeleton (Dark Mode to match Hero) */}
            <section className="relative h-[90vh] flex items-center justify-center bg-black overflow-hidden border-b border-gray-800">
                <div className="w-full max-w-6xl mx-auto px-4 text-center z-10 flex flex-col items-center">
                    {/* Tag */}
                    <div className="h-8 w-48 bg-white/10 rounded-full mb-8 animate-pulse"></div>

                    {/* Title */}
                    <div className="h-20 w-3/4 md:w-2/3 bg-white/10 rounded-xl mb-6 animate-pulse"></div>

                    {/* Description */}
                    <div className="h-4 w-full max-w-lg bg-white/10 rounded mb-10 animate-pulse"></div>
                    <div className="h-4 w-3/4 max-w-md bg-white/10 rounded mb-12 animate-pulse mt-2"></div>

                    {/* Timer Box */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 inline-block shadow-2xl max-w-4xl w-full">
                        <div className="flex justify-center gap-4 md:gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`flex flex-col items-center mx-2 md:mx-4 ${i === 4 ? 'hidden md:flex' : ''}`}>
                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-2xl animate-pulse"></div>
                                    <div className="h-3 w-12 bg-white/10 rounded mt-3 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Sections Skeleton - Cleaner List */}
            <div className="space-y-16 py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                    {[1, 2, 3].map((section) => (
                        <div key={section}>
                            {/* Section Title */}
                            <div className="flex items-center space-x-4 mb-10">
                                <div className="h-8 w-8 bg-blue-100/50 rounded-full animate-pulse"></div>
                                <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DashboardSkeleton = () => (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6 h-64 flex flex-col justify-between">
                        <Skeleton className="h-32 w-full rounded-md" />
                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
            <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="space-y-4 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-6 w-full" />
                </div>
            ))}
        </div>
    </div>
);
