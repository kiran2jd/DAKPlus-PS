import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

// Strategy for resolving API URL:
// 1. Process environment (for local dev/web)
// 2. Expo Constants (for EAS builds/standalone APKs)
// 3. Last resort hardcoded production URL
const getApiUrl = () => {
    let url = '';
    if (process.env.EXPO_PUBLIC_API_URL) {
        url = process.env.EXPO_PUBLIC_API_URL;
    } else if (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL) {
        url = Constants.expoConfig.extra.EXPO_PUBLIC_API_URL;
    } else {
        url = 'https://api-gateway-production-bb02.up.railway.app/api/';
    }

    // Ensure it ends with / for consistent path joining
    return url.endsWith('/') ? url : `${url}/`;
};

const API_BASE_URL = getApiUrl();

console.log('Mobile App API Configuration:');
console.log('Using API_BASE_URL:', API_BASE_URL);

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
