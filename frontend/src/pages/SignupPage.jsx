import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import logo from '../assets/logo.jpg';

export default function SignupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [phone, setPhone] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        notificationsEnabled: true,
        postalCircle: '',
        division: '',
        office: '',
        cadre: '',
        examType: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingUser, setExistingUser] = useState(false);

    useEffect(() => {
        // If phone passed from Login, prefill it. 
        // If verified flag is present, jump to profile.
        // OTHERWISE: Do nothing, let user start at 'init-phone' (Fixes redirect loop).
        if (location.state?.phone) {
            setPhone(location.state.phone);
        }
    }, [location]);

    const validate = () => {
        setError('');
        if (!formData.fullName || formData.fullName.trim().length < 3) {
            setError("Full Name must be at least 3 characters long");
            return false;
        }

        // Strict Email Regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (!formData.password || formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        // Strict Phone Regex: 10-15 digits
        const phoneRegex = /^\d{10,15}$/;
        // Remove spaces or dashes for validation
        const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : '';
        if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
            setError("Phone number must be between 10 and 15 digits");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExistingUser(false);

        if (!validate()) return;

        setLoading(true);

        try {
            await authService.register({
                phoneNumber: phone,
                fullName: formData.fullName,
                email: formData.email,
                role: 'student',
                password: formData.password,
                notificationsEnabled: formData.notificationsEnabled,
                postalCircle: formData.postalCircle,
                division: formData.division,
                office: formData.office,
                cadre: formData.cadre,
                examType: formData.examType
            });
            // Auto-login: Token is already saved by authService.register
            navigate('/dashboard');
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.detail || 'Registration failed';
            if (message.includes("already exists")) {
                setError("You are already a member! Please use your password or OTP to log in.");
                setExistingUser(true);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex flex-col items-center">
                    <img src={logo} alt="DAKPlus Logo" className="h-20 w-auto mb-2" />
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Complete your profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Setting up account for {phone}
                    </p>
                </div>

                {error && (
                    <div className={`p-4 rounded-md text-sm text-center ${existingUser ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-700'}`}>
                        {error}
                        {existingUser && (
                            <div className="mt-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="font-bold underline text-amber-900 hover:text-amber-700"
                                >
                                    Go to Login Page
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Only show Phone input if not passed from OTP flow */}
                        {!location.state?.phone && (
                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1234567890"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center mb-4">
                            <input
                                id="notificationsEnabled"
                                name="notificationsEnabled"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                checked={formData.notificationsEnabled}
                                onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                            />
                            <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-900">
                                Send me exam notifications and updates via email
                            </label>
                        </div>

                        {/* Additional Information Section */}
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Professional Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="postalCircle" className="block text-sm font-medium text-gray-700">Postal Circle</label>
                                    <select
                                        id="postalCircle"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                                        value={formData.postalCircle}
                                        onChange={(e) => setFormData({ ...formData, postalCircle: e.target.value })}
                                    >
                                        <option value="" className="text-gray-900 bg-white">Select Circle</option>
                                        <option value="Andhra Pradesh" className="text-gray-900 bg-white">Andhra Pradesh</option>
                                        <option value="Telangana" className="text-gray-900 bg-white">Telangana</option>
                                        <option value="Karnataka" className="text-gray-900 bg-white">Karnataka</option>
                                        <option value="Tamil Nadu" className="text-gray-900 bg-white">Tamil Nadu</option>
                                        <option value="Kerala" className="text-gray-900 bg-white">Kerala</option>
                                        <option value="Others" className="text-gray-900 bg-white">Others</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="division" className="block text-sm font-medium text-gray-700">Division</label>
                                    <input
                                        id="division"
                                        type="text"
                                        placeholder="Enter Division"
                                        className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        value={formData.division}
                                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="office" className="block text-sm font-medium text-gray-700">Office</label>
                                    <input
                                        id="office"
                                        type="text"
                                        placeholder="Enter Office"
                                        className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        value={formData.office}
                                        onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="cadre" className="block text-sm font-medium text-gray-700">Cadre</label>
                                    <select
                                        id="cadre"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                                        value={formData.cadre}
                                        onChange={(e) => setFormData({ ...formData, cadre: e.target.value })}
                                    >
                                        <option value="" className="text-gray-900 bg-white">Select Cadre</option>
                                        <option value="GDS" className="text-gray-900 bg-white">GDS</option>
                                        <option value="MTS" className="text-gray-900 bg-white">MTS</option>
                                        <option value="Postman" className="text-gray-900 bg-white">Postman</option>
                                        <option value="Mail Guard" className="text-gray-900 bg-white">Mail Guard</option>
                                        <option value="PA/SA" className="text-gray-900 bg-white">PA/SA</option>
                                        <option value="Others" className="text-gray-900 bg-white">Others</option>
                                    </select>
                                </div>

                                <div className="mb-4 md:col-span-2">
                                    <label htmlFor="examType" className="block text-sm font-medium text-gray-700">Target Exam</label>
                                    <select
                                        id="examType"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                                        value={formData.examType}
                                        onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                                    >
                                        <option value="" className="text-gray-900 bg-white">Select Exam</option>
                                        <option value="GDS to MTS" className="text-gray-900 bg-white">GDS to MTS</option>
                                        <option value="GDS to Postman" className="text-gray-900 bg-white">GDS to Postman</option>
                                        <option value="MTS to Postman" className="text-gray-900 bg-white">MTS to Postman</option>
                                        <option value="GDS/MTS/Postman to PA/SA" className="text-gray-900 bg-white">GDS/MTS/Postman to PA/SA</option>
                                        <option value="IP Exam" className="text-gray-900 bg-white">IP Exam</option>
                                        <option value="Others" className="text-gray-900 bg-white">Others</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
