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
