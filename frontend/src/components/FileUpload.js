import React, { useState } from 'react';

const FileUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);

        try {
            // TODO: Implement actual file upload logic
            console.log('Uploading file:', selectedFile);

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Call the parent callback
            if (onUploadSuccess) {
                onUploadSuccess({
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type,
                    uploadDate: new Date().toISOString()
                });
            }

            // Reset form
            setSelectedFile(null);
            e.target.reset();

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">Upload File</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleUpload}>
                    <div className="mb-3">
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                    </div>

                    {selectedFile && (
                        <div className="mb-3">
                            <small className="text-muted">
                                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                            </small>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FileUpload;
