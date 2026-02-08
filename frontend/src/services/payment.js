import api from './api';

export const paymentService = {
    /**
     * Create a Razorpay Order on the backend
     * @param {number} amount - Amount in INR
     * @returns {Promise<Object>} - Order details including orderId
     */
    createOrder: async (amount) => {
        try {
            const response = await api.post('/payments/create-order', {
                amount,
                receipt: `receipt_${Date.now()}`
            });
            return response.data;
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Verify the payment signature on the backend
     * @param {Object} paymentData - Data returned by Razorpay Checkout
     * @returns {Promise<Object>} - Verification result
     */
    verifyPayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/verify-payment', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            throw error.response?.data || error.message;
        }
    }
};
