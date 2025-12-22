import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const NoInternet = ({ onRetry }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WifiOff size={40} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No Internet Connection</h1>
                <p className="text-gray-500 mb-8">
                    It looks like you're offline. Please check your internet connection and try again.
                </p>
                <button
                    onClick={() => {
                        if (onRetry) onRetry();
                        window.location.reload();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <RefreshCw size={20} /> Retry Connection
                </button>
            </div>
        </div>
    );
};

export default NoInternet;
