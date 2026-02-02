import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, Star, Zap, CreditCard, Smartphone, QrCode } from 'lucide-react';
import Navbar from '../components/Navbar';
import { authService } from '../services/auth';

export default function PaymentPage() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update subscription tier in backend
            await authService.updateTier('PREMIUM');

            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600 w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">Welcome to MockOnly Pro. Redirecting you to your premium dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade to Pro</h1>
                        <p className="text-xl text-gray-600">Unlock your full potential with unlimited access and advanced analytics.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Benefits Column */}
                        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                                Pro Benefits
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-gray-900">Unlimited Mock Tests</span>
                                        <p className="text-sm text-gray-500">Practice as much as you want without limits.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-gray-900">Advanced Analytics</span>
                                        <p className="text-sm text-gray-500">Deep dive into your performance metrics.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-gray-900">Detailed Explanations</span>
                                        <p className="text-sm text-gray-500">Learn why answers are correct with in-depth solutions.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-gray-900">Priority Support</span>
                                        <p className="text-sm text-gray-500">Get help whenever you need it.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Payment Column */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                POPULAR
                            </div>

                            <div className="mb-6">
                                <span className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Pro Plan</span>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-4xl font-extrabold text-gray-900">$29</span>
                                    <span className="text-gray-500 ml-1">/month</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                {/* Payment Methods Tabs */}
                                <div className="flex space-x-2 mb-6 p-1 bg-gray-100 rounded-lg">
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition flex items-center justify-center ${paymentMethod === 'card'
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" /> Card
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition flex items-center justify-center ${paymentMethod === 'upi'
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Smartphone className="w-4 h-4 mr-2" /> UPI
                                    </button>
                                </div>

                                {paymentMethod === 'card' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Card Information</label>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 flex items-center justify-between">
                                                <span>•••• •••• •••• 4242</span>
                                                <div className="flex space-x-2">
                                                    <div className="w-8 h-5 bg-blue-600 rounded"></div>
                                                    <div className="w-8 h-5 bg-orange-500 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                                                <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" disabled />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                                <input type="text" placeholder="123" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" disabled />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500">Scan QR to Pay via Any UPI App</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Or Enter UPI ID</label>
                                            <input type="text" placeholder="username@upi" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 space-y-4">
                                    <p className="text-xs text-gray-500 flex items-center justify-center">
                                        <Shield className="w-3 h-3 mr-1" /> Secure 256-bit SSL encrypted payment
                                    </p>

                                    <button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-bold transition disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2" /> Pay {paymentMethod === 'upi' ? 'via UPI' : '$29'}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-gray-400">
                                        By clicking "Pay", you agree to our Terms of Service.
                                        Results provided for testing purposes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
