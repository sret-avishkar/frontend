import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ImageUploader from '../../components/ImageUploader';
import { Trash2, Calendar, Image as ImageIcon, Plus } from 'lucide-react';

const AdminGallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        imageUrl: ''
    });

    const fetchGalleryItems = async () => {
        try {
            const response = await api.get('/events');
            // Filter for past events which we consider as gallery items
            const pastEvents = response.data.filter(event => new Date(event.date) < new Date());
            setGalleryItems(pastEvents);
        } catch (error) {
            console.error("Failed to fetch gallery items", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleryItems();
    }, []);

    const handleImageUploaded = (url) => {
        setFormData({ ...formData, imageUrl: url });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl || !formData.date) {
            alert("Image and Date are required!");
            return;
        }

        setUploading(true);
        try {
            // Create an event that acts as a gallery item
            const newMemory = {
                title: formData.title || 'Untitled Memory',
                description: formData.title || 'Gallery Image', // Use title as description
                date: formData.date,
                venue: 'N/A',
                category: 'gallery',
                price: '0',
                imageUrl: formData.imageUrl,
                createdByRole: 'admin' // Assuming admin context
            };

            await api.post('/events', newMemory);

            // Reset form and refresh list
            setFormData({ title: '', date: '', imageUrl: '' });
            fetchGalleryItems();
            alert("Photo added to gallery successfully!");
        } catch (error) {
            console.error("Failed to upload photo", error);
            alert("Failed to upload photo");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            try {
                await api.delete(`/events/${id}`);
                setGalleryItems(galleryItems.filter(item => item.id !== id));
            } catch (error) {
                console.error("Failed to delete photo", error);
                alert("Failed to delete photo");
            }
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gallery Upload</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" /> Add New Photo
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                <div className="mt-1">
                                    <ImageUploader onUploadComplete={handleImageUploaded} />
                                </div>
                                {formData.imageUrl && (
                                    <p className="text-xs text-green-600 mt-1">Image selected successfully</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Caption (Title)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Prize Distribution 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date (Past)</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Select a past date to appear in gallery.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !formData.imageUrl}
                                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${uploading || !formData.imageUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {uploading ? 'Uploading...' : 'Add to Gallery'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Gallery List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon size={20} className="text-purple-600" /> Existing Photos
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : galleryItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No photos found. Upload one to get started!</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                                {galleryItems.map((item) => (
                                    <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                        <div className="aspect-w-1 aspect-h-1 h-32 w-full">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-2 bg-white">
                                            <p className="text-sm font-medium truncate">{item.title}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={10} /> {new Date(item.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                            title="Delete Photo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminGallery;
