import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

// ImageUploader now simply reads the selected image as a base64 string and passes it to the parent.
// The parent component (e.g., EventForm) will handle uploading to GitHub after form submission.
const ImageUploader = ({ onUploadComplete, initialImage, folder = 'events' }) => {
    const [preview, setPreview] = useState(initialImage || null);

    React.useEffect(() => {
        if (initialImage) {
            setPreview(initialImage);
        }
    }, [initialImage]);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Size limit 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large (max 5MB)');
            return;
        }
        try {
            const reader = new FileReader();
            const dataUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            setPreview(dataUrl);
            // Pass the base64 data (dataUrl) to the parent; the parent will later upload it.
            onUploadComplete(dataUrl);
            setError(null);
            toast.success('Image ready for upload on form submit');
        } catch (err) {
            console.error('File read error:', err);
            setError('Failed to read image file');
            toast.error('Failed to read image file');
        }
    };

    const clearImage = () => {
        setPreview(null);
        setError(null);
        onUploadComplete(''); // Clear the URL/base64 in parent
    };

    return (
        <div className="w-full max-w-md mx-auto p-1 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Remove image"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div className="text-center py-2">
                    <Upload className="mx-auto h-6 w-6 text-gray-400" />
                    <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-1 block text-xs font-medium text-gray-900">
                                Click to upload
                            </span>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                </div>
            )}
            {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
        </div>
    );
};

export default ImageUploader;
