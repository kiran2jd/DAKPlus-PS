import api from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
    async sendOtp(identifier) {
        const response = await api.post('/auth/send-otp', { identifier });
        return response.data;
    },

    async verifyOtp(identifier, otp) {
        const response = await api.post('/auth/verify-otp', { identifier, otp, persistent: true });
        const { access_token, user } = response.data;
        if (access_token) {
            await SecureStore.setItemAsync('access_token', access_token);
            await SecureStore.setItemAsync('user', JSON.stringify(user));
        }
        return response.data;
    },

    async login(identifier, password) {
        const response = await api.post('/auth/login', { identifier, password, persistent: true });
        const { access_token, user } = response.data;
        if (access_token) {
            await SecureStore.setItemAsync('access_token', access_token);
            await SecureStore.setItemAsync('user', JSON.stringify(user));
        }
        return response.data;
    },

    async register(userData) {
        const response = await api.post('/auth/register', { ...userData, persistent: true });
        const { access_token, user } = response.data;
        if (access_token) {
            await SecureStore.setItemAsync('access_token', access_token);
            await SecureStore.setItemAsync('user', JSON.stringify(user));
        }
        return response.data;
    },

    async logout() {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('user');
    },

    async isAuthenticated() {
        const token = await SecureStore.getItemAsync('access_token');
        return !!token;
    },

    async getUser() {
        const userStr = await SecureStore.getItemAsync('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    async getProfile() {
        const response = await api.get('/auth/profile');
        const user = response.data.user;
        if (user) {
            await SecureStore.setItemAsync('user', JSON.stringify(user));
        }
        return user;
    }
};
