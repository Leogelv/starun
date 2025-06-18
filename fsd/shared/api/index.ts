import axios from "axios";

// Determine the base URL based on environment
const getBaseURL = () => {
    // If we're in the browser
    if (typeof window !== 'undefined') {
        // Check if we're on Railway production
        if (window.location.hostname.includes('railway.app')) {
            return `${window.location.origin}/api`;
        }
        // Local development
        return `/api`;
    }
    // Server-side: use environment variable or fallback
    return process.env.NEXT_PUBLIC_API_URL || '/api';
};

// Export the base URL getter for direct fetch calls
export const getApiBaseURL = getBaseURL;

const apiClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
    (config) => {
        console.log('🌐 API Request:', {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default apiClient;
export { apiClient };
