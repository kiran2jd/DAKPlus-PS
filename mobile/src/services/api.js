import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Temporarily hardcoded for testing - change back to env variable later
const API_BASE_URL = 'https://prediscountable-nickole-nonhazardous.ngrok-free.dev/api';
console.log('Mobile App API Configuration:');
console.log('Using hardcoded API_BASE_URL:', API_BASE_URL);

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
