import api from './api';

export const resultService = {
    submitTest: async (submissionData) => {
        const response = await api.post('/results/submit', submissionData);
        return response.data;
    },

    getResultById: async (resultId) => {
        const response = await api.get(`/results/${resultId}`);
        return response.data;
    },

    getResultsByUser: async (userId) => {
        const response = await api.get(`/results/user/${userId}`);
        return response.data;
    }
};
