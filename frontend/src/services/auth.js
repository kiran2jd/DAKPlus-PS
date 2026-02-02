import api from './api';

export const authService = {
    sendOtp: async (identifier) => {
        const response = await api.post('/auth/send-otp', { identifier });
        return response.data;
    },

    verifyOtp: async (identifier, otp) => {
        const response = await api.post('/auth/verify-otp', { identifier, otp });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        console.log("Register Response:", response.data);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            // Ensure we use the user object from backend, falling back to userData only if absolutely necessary
            const userToStore = response.data.user || userData;
            localStorage.setItem('user', JSON.stringify(userToStore));
        }
        return response.data;
    },

    login: async (identifier, password) => {
        const response = await api.post('/auth/login', { identifier, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    updateProfile: async (updates) => {
        const response = await api.put('/auth/profile', updates);
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    updateTier: async (tier) => {
        const response = await api.put('/auth/profile/tier', { tier });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }
};
