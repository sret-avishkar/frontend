import axios from 'axios';

const API_URL = 'https://avishkar.onrender.com/api';
// const API_URL = 'http://localhost:5000/api';


const api = axios.create({
    baseURL: API_URL,
});

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
