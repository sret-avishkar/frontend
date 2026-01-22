import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUploader = ({ onUploadComplete, initialFile, label = "Upload File" }) => {
    const [fileName, setFileName] = useState(initialFile ? 'File uploaded' : null);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size limit 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large (max 5MB)');
            return;
        }

        // Validate type (PDF, Doc, Docx)
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload PDF or Word document.');
            return;
        }

        try {
            const reader = new FileReader();
            const dataUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            setFileName(file.name);
            onUploadComplete(dataUrl);
            setError(null);
            toast.success('File ready for upload');
        } catch (err) {
            console.error('File read error:', err);
            setError('Failed to read file');
            toast.error('Failed to read file');
        }
    };

    const clearFile = () => {
        setFileName(null);
        setError(null);
        onUploadComplete('');
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {!fileName ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors text-center">
                    <input
                        type="file"
                        id="paper-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="paper-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Click to upload paper
                        </span>
                        <p className="text-xs text-gray-500 mt-1">PDF or Word (max 5MB)</p>
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 truncate max-w-[200px]">{fileName}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={10} /> Ready to submit
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={clearFile}
                        className="text-gray-400 hover:text-red-500 p-1"
                        type="button"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default FileUploader;
