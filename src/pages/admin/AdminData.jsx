import React, { useState } from 'react';
import { Download, Upload, Database, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminData = () => {
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Using a direct window open or fetch blob approach
            // Fetch blob allows us to name the file properly if desired, or just direct link
            const response = await api.get('/admin/data/export/events', { responseType: 'blob' });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `events_export_${dateStr}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Events data exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/json' && !file.name.endsWith('.json')) {
            toast.error('Please upload a valid JSON file');
            setImportFile(null);
            return;
        }
        setImportFile(file);
    };

    const handleImport = async () => {
        if (!importFile) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);

                if (!Array.isArray(jsonData)) {
                    throw new Error('Invalid format: structure must be an array');
                }

                await api.post('/admin/data/import/events', jsonData);
                toast.success(`Successfully imported ${jsonData.length} events`);
                setImportFile(null);
                // Reset file input if needed - effectively handled by state null but UI might keep it
                document.getElementById('file-upload').value = '';

            } catch (error) {
                console.error('Import failed:', error);
                toast.error(error.message || 'Failed to import data');
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsText(importFile);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="text-blue-600" />
                Data Management
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Download size={24} />
                        </div>
                        <h2 className="text-xl font-semibold">Export Data</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Download a complete backup of all Event data in JSON format.
                        This file can be used to migrate data to another system or restore it later.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isExporting ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        ) : (
                            <Download size={20} />
                        )}
                        {isExporting ? 'Exporting...' : 'Export Events Data'}
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Upload size={24} />
                        </div>
                        <h2 className="text-xl font-semibold">Import Data</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Restore or migrate Event data by uploading a valid JSON backup file.
                        <span className="block mt-2 text-sm text-amber-600 flex items-center gap-1">
                            <AlertCircle size={14} /> Warning: This limits IDs preservation to correct sync.
                        </span>
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileJson className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">JSON files only</p>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".json,application/json"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {importFile && (
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                <FileJson size={16} />
                                <span className="truncate flex-1">{importFile.name}</span>
                                <CheckCircle size={16} />
                            </div>
                        )}

                        <button
                            onClick={handleImport}
                            disabled={!importFile || isImporting}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isImporting ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                <Upload size={20} />
                            )}
                            {isImporting ? 'Importing...' : 'Import Data'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminData;
