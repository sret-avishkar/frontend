import axios from 'axios';

// const API_URL = 'https://avishkar.onrender.com/api';


const getBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (window.location.hostname === 'localhost') return 'http://localhost:5000/api';
    return 'https://avishkar.onrender.com/api';
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
