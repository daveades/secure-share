import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const spinnerSize = size === 'sm' ? 'spinner-border-sm' : '';

    return (
        <div className="d-flex flex-column justify-content-center align-items-center p-4">
            <div className={`spinner-border text-primary ${spinnerSize}`} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            {message && <p className="mt-2 text-muted">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
