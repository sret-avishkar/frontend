import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, StopCircle, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const qrCodeIdRef = useRef("reader-" + Math.random().toString(36).substr(2, 9));

    useEffect(() => {

        return () => {
            startScanner();
            cleanup();
        };
    }, []);

    const cleanup = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.warn("Scanner cleanup warning:", err);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const startScanner = async () => {
        setError(null);
        const qrCodeId = qrCodeIdRef.current;

        // Check for Secure Context (HTTPS or localhost)
        if (!window.isSecureContext) {
            setError("Camera access requires a secure context (HTTPS or localhost). If testing on mobile via IP, this will likely fail.");
            return;
        }

        // Wait for DOM
        await new Promise(r => setTimeout(r, 100));

        if (!document.getElementById(qrCodeId)) {
            setError("Scanner container not found.");
            return;
        }

        try {
            const html5QrCode = new Html5Qrcode(qrCodeId);
            scannerRef.current = html5QrCode;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            // Try environment camera first
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText, decodedResult) => {
                        setScanResult(decodedText);
                        if (onScanSuccess) {
                            onScanSuccess(decodedText, decodedResult);
                        }
                    },
                    (errorMessage) => {
                        // ignore frame errors
                    }
                );
            } catch (envError) {
                console.warn("Environment camera failed, trying user camera/default", envError);
                // Fallback to any available camera
                await html5QrCode.start(
                    true, // prefer back camera if available, but accept any
                    config,
                    (decodedText, decodedResult) => {
                        setScanResult(decodedText);
                        if (onScanSuccess) {
                            onScanSuccess(decodedText, decodedResult);
                        }
                    },
                    (errorMessage) => {
                        // ignore
                    }
                );
            }
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner", err);
            let msg = "Failed to start camera.";
            if (err.name === "NotAllowedError") {
                msg = "Camera permission denied. Please allow camera access in your browser settings.";
            } else if (err.name === "NotFoundError") {
                msg = "No camera found on this device.";
            } else if (err.name === "NotReadableError") {
                msg = "Camera is already in use by another application.";
            }
            setError(msg);
            if (onScanFailure) onScanFailure(err);
            setIsScanning(false);
        }
    };

    const handleStop = async () => {
        await cleanup();
        setScanResult(null);
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <div className="w-full relative bg-gray-100 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300">
                <div id={qrCodeIdRef.current} className="w-full"></div>

                {!isScanning && !scanResult && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Camera size={48} className="text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-6">Camera permission is required to scan QR codes.</p>
                        <button
                            onClick={startScanner}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Camera size={20} />
                            Start Scanning
                        </button>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-50">
                        <AlertCircle size={48} className="text-red-500 mb-4" />
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={startScanner}
                            className="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-full font-medium hover:bg-red-50 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {isScanning && (
                <button
                    onClick={handleStop}
                    className="mt-4 text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <StopCircle size={20} />
                    Stop Camera
                </button>
            )}

            {/* {scanResult && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md text-center w-full animate-fade-in-up">
                    <p className="font-bold">Scanned Code:</p>
                    <p className="break-all text-xs">{scanResult}</p>
                </div>
            )} */}
        </div>
    );
};

export default QRScanner;
