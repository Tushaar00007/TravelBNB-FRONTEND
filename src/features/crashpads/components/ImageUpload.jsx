import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react';

const ImageUpload = ({ images, setImages, maxFiles = 5 }) => {
    const fileInputRef = useRef(null);
    const [localError, setLocalError] = useState("");
    const MAX_SIZE_MB = 5;

    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const addFiles = async (files) => {
        setLocalError("");
        let newImages = [...images];
        
        const filesToUpload = [];
        for (const file of files) {
            if (newImages.length + filesToUpload.length >= maxFiles) break;
            
            if (!file.type.startsWith('image/')) {
                setLocalError("Only image files (JPG, PNG, WEBP) are allowed.");
                continue;
            }

            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setLocalError(`Image "${file.name}" exceeds the ${MAX_SIZE_MB}MB limit.`);
                continue;
            }
            filesToUpload.push(file);
        }

        if (filesToUpload.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            filesToUpload.forEach(f => formData.append('files', f));

            const res = await API.post('/upload/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const uploadedUrls = res.data.images.map(img => ({
                url: img.url,
                id: img.public_id || Math.random().toString(36).substr(2, 9)
            }));

            setImages([...newImages, ...uploadedUrls]);
        } catch (err) {
            console.error('Upload Error:', err);
            setLocalError("Failed to upload images. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (id) => {
        const filtered = images.filter(img => img.id !== id);
        setImages(filtered);
    };

    return (
        <div className="space-y-4">
            <div 
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (uploading) return;
                    const files = Array.from(e.dataTransfer.files);
                    addFiles(files);
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10 flex flex-col items-center justify-center transition-all group ${uploading ? 'cursor-wait opacity-50 bg-gray-100' : 'bg-gray-50/50 dark:bg-gray-900/30 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-900 cursor-pointer'}`}
            >
                <input 
                    type="file" 
                    multiple 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={uploading}
                />
                
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Upload className={uploading ? "text-gray-400 animate-bounce" : "text-orange-500"} size={28} />
                </div>
                
                <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                    {uploading ? "Uploading to Cloud..." : "Click or drag to upload"}
                </h4>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Max {maxFiles} images • Max {MAX_SIZE_MB}MB each</p>
            </div>

            {localError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold animate-fade-in">
                    <AlertCircle size={14} />
                    {localError}
                </div>
            )}

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="relative aspect-square group">
                            <img 
                                src={img.url} 
                                alt="Listing" 
                                className="w-full h-full object-cover rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-transform duration-500 group-hover:scale-105"
                            />
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(img.id);
                                }}
                                className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    
                    {images.length < maxFiles && !uploading && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
                        >
                            <Plus size={24} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
