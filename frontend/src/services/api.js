import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// File API methods
export const fileAPI = {
    // Upload a file
    uploadFile: async (file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);

        if (options.expirationHours) {
            formData.append('expiration_hours', options.expirationHours);
        }
        if (options.password) {
            formData.append('password', options.password);
        }
        if (options.downloadLimit) {
            formData.append('download_limit', options.downloadLimit);
        }

        return api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: options.onProgress,
        });
    },

    // Get user's files
    getMyFiles: async (includeExpired = false) => {
        return api.get(`/files/my-files?include_expired=${includeExpired}`);
    },

    // Get file info
    getFileInfo: async (fileId) => {
        return api.get(`/files/info/${fileId}`);
    },

    // Download file
    downloadFile: async (fileId, password = null) => {
        const config = {
            responseType: 'blob',
        };

        if (password) {
            return api.post(`/files/download/${fileId}`, { password }, config);
        } else {
            return api.get(`/files/download/${fileId}`, config);
        }
    },

    // Delete file
    deleteFile: async (fileId) => {
        return api.delete(`/files/delete/${fileId}`);
    },

    // Get shared file info
    getSharedFileInfo: async (accessToken) => {
        return api.get(`/files/share/${accessToken}`);
    },

    // Download shared file
    downloadSharedFile: async (accessToken, password = null) => {
        const config = {
            responseType: 'blob',
        };

        if (password) {
            return api.post(`/files/share/${accessToken}/download`, { password }, config);
        } else {
            return api.get(`/files/share/${accessToken}/download`, config);
        }
    },
};
