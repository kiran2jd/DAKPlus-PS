import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Automatically switch between local and production
// Local: http://192.168.0.108:8080/api (Docker on your machine)
// Production: https://YOUR-RAILWAY-URL.up.railway.app/api
// TODO: Replace 'YOUR-RAILWAY-URL' with actual Railway domain after deployment
const API_BASE_URL = __DEV__
    ? 'http://192.168.0.108:8080/api'  // Local development with Docker
    : 'https://YOUR-RAILWAY-URL.up.railway.app/api';  // Production (Update after Railway deployment)

console.log('Mobile App API Configuration:');
console.log('Environment:', __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Interceptor to add JWT token and User ID
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const userStr = await SecureStore.getItemAsync('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        // Inject user ID and Session ID for backend identification & security
        const userId = user.id || user._id || user.userId;
        if (userId) {
            config.headers['X-User-Id'] = userId;
        }

        const sessionId = user.activeSessionId || user.sessionId;
        if (sessionId) {
            config.headers['X-Session-Id'] = sessionId;
        }
    }
    return config;
});

export default api;
