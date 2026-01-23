import axios from 'axios';

// const API_URL = 'https://backend-sj3z.onrender.com';


const getBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

    // Check if running on localhost or local network IP
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return `http://${hostname}:5000/api`;
    }

    // Default to production
    return 'https://backend-sj3z.onrender.com/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            // Network Error (no response received)
            window.dispatchEvent(new Event('network-error'));
        }
        return Promise.reject(error);
    }
);

export const uploadImage = async (base64Image, folder) => {
    try {
        const response = await api.post('/upload', { image: base64Image, folder });
        return response.data.url;
    } catch (error) {
        console.error("Upload failed", error);
        throw error;
    }
};

export default api;
