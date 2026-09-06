const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    SUPPORTED_FILE_TYPES: [
        'image/*',
        'application/pdf',
        'text/*',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    EXPIRATION_OPTIONS: [
        { value: 1, label: '1 Hour' },
        { value: 6, label: '6 Hours' },
        { value: 24, label: '24 Hours' },
        { value: 168, label: '1 Week' },
        { value: 720, label: '1 Month' }
    ]
};

export default config;
