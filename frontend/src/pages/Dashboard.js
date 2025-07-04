import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';

const Dashboard = () => {
    const [files, setFiles] = useState([]);

    const handleFileUpload = (uploadedFile) => {
        setFiles([...files, uploadedFile]);
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h2>Dashboard</h2>
                    <p>Welcome to your secure file sharing dashboard.</p>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Upload Files</h5>
                        </div>
                        <div className="card-body">
                            <FileUpload onFileUpload={handleFileUpload} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Your Files</h5>
                        </div>
                        <div className="card-body">
                            {files.length === 0 ? (
                                <p className="text-muted">No files uploaded yet.</p>
                            ) : (
                                <ul className="list-group">
                                    {files.map((file, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            {file.name}
                                            <small className="text-muted">{file.size} bytes</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
