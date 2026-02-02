import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Smartphone, Globe, Shield, Star, Users, Zap } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-red-600 p-2 rounded-lg">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                            DAKPlus
                        </span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-gray-600 font-medium">
                        <a href="#features" className="hover:text-red-600 transition">Features</a>
                        <a href="#testimonials" className="hover:text-red-600 transition">Stories</a>
                        <a href="#pricing" className="hover:text-red-600 transition">Pricing</a>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/login" className="px-5 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-full transition">
                            Log In
                        </Link>
                        <Link to="/signup" className="px-5 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 hover:shadow-red-500/30 transition transform hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 text-center">
                    <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-bounce">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span>New: Updated Postal Syllabus</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight">
                        Ace Your Postal Exams <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600">
                            With DAKPlus
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join 50,000+ students acing their tests. Experience real-time simulations, detailed analytics, and a user interface designed for success.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link to="/signup" className="group px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-xl shadow-xl hover:bg-gray-800 transition flex items-center justify-center">
                            Start Practicing
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                        </Link>
                        <Link to="/login" className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition flex items-center justify-center">
                            Sign In
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-gray-100 pt-8">
                        <div>
                            <div className="text-3xl font-bold text-gray-900">50k+</div>
                            <div className="text-sm text-gray-500 font-medium">Active Students</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">1.2M</div>
                            <div className="text-sm text-gray-500 font-medium">Tests Taken</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">98%</div>
                            <div className="text-sm text-gray-500 font-medium">Pass Rate</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">24/7</div>
                            <div className="text-sm text-gray-500 font-medium">AI Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-gray-50 py-24" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Features</h2>
                        <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Everything you need to excel</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: <Globe className="h-6 w-6 text-white" />, color: "bg-blue-500", title: "Assessment Analytics", desc: "Get detailed insights into your performance with our advanced AI scoring engine." },
                            { icon: <Smartphone className="h-6 w-6 text-white" />, color: "bg-green-500", title: "Mobile Friendly", desc: "Take tests on any device with our fully responsive design. Learn on the go." },
                            { icon: <Shield className="h-6 w-6 text-white" />, color: "bg-purple-500", title: "Secure Testing", desc: "Advanced proctoring features to ensure integrity during exams." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
                                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exam Categories: Free vs Premium */}
            <div className="py-24 bg-gray-50" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-gray-900">Choose Your Path to Success</h2>
                        <p className="mt-4 text-xl text-gray-600">Start for free, upgrade for the ultimate edge.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Free Tier */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-transparent hover:border-gray-200 transition relative">
                            <div className="p-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Starter</h3>
                                <p className="text-gray-500 mb-6">Perfect for testing the waters.</p>
                                <div className="text-5xl font-extrabold text-gray-900 mb-8">$0<span className="text-xl text-gray-500 font-medium">/mo</span></div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> 5 Mock Tests per Month</li>
                                    <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> Basic Score Analysis</li>
                                    <li className="flex items-center text-gray-600"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /> Community Forum Access</li>
                                </ul>
                                <Link to="/signup" className="block w-full py-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition">Get Started Free</Link>
                            </div>
                        </div>

                        {/* Premium Tier */}
                        <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500 relative transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide rounded-bl-xl">Recommended</div>
                            <div className="p-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Premium Pro</h3>
                                <p className="text-gray-400 mb-6">For serious aspirants.</p>
                                <div className="text-5xl font-extrabold text-white mb-8">$29<span className="text-xl text-gray-400 font-medium">/mo</span></div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-300"><CheckCircle className="h-5 w-5 text-indigo-400 mr-3" /> Unlimited Premium Mock Tests</li>
                                    <li className="flex items-center text-gray-300"><CheckCircle className="h-5 w-5 text-indigo-400 mr-3" /> AI-Driven Weakness Analysis</li>
                                    <li className="flex items-center text-gray-300"><CheckCircle className="h-5 w-5 text-indigo-400 mr-3" /> 1-on-1 Expert Mentorship Call</li>
                                    <li className="flex items-center text-gray-300"><CheckCircle className="h-5 w-5 text-indigo-400 mr-3" /> Guaranteed Pass or Refund</li>
                                </ul>
                                <Link to="/payment" className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-xl text-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30">Unlock Premium</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Special Guidance & Content */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900">Expert Guidance & Resources</h2>
                        <p className="mt-4 text-xl text-gray-600">More than just tests. We provide the roadmap to your goal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="space-y-8">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                                            <Users className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-900">Personalized Mentorship</h3>
                                        <p className="mt-2 text-gray-600">Stuck on a concept? Schedule a 15-minute doubt-clearing session with our subject matter experts.</p>
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600">
                                            <Zap className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-900">Smart Study Planners</h3>
                                        <p className="mt-2 text-gray-600">Our AI generates a custom study schedule based on your exam date and current performance level.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-96 bg-gray-100 rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                            {/* Decorative placeholder for a UI screenshot or illustration */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Shield className="h-20 w-20 mx-auto mb-4 opacity-50" />
                                    <span className="font-semibold">Interactive Mentorship Dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gray-900 py-24 text-white relative overflow-hidden" id="testimonials">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-16">Trusted by Top Performers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-800/50 backdrop-blur p-10 rounded-2xl border border-gray-700 hover:border-indigo-500 transition">
                            <div className="flex text-yellow-400 mb-4 space-x-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                            </div>
                            <p className="text-xl italic text-gray-300 mb-6">"DAKPlus helped me crack my AWS certification. The analytics are a game changer! I knew exactly where to focus."</p>
                            <div className="flex items-center justify-center space-x-4">
                                <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-xl">S</div>
                                <div className="text-left">
                                    <div className="font-bold">Sarah Jenkins</div>
                                    <div className="text-sm text-gray-400">Computer Science Student</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur p-10 rounded-2xl border border-gray-700 hover:border-indigo-500 transition">
                            <div className="flex text-yellow-400 mb-4 space-x-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                            </div>
                            <p className="text-xl italic text-gray-300 mb-6">"The interface is so smooth and easy to use. I love the dark mode options and the real-time feedback."</p>
                            <div className="flex items-center justify-center space-x-4">
                                <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center font-bold text-xl">M</div>
                                <div className="text-left">
                                    <div className="font-bold">Mike Thompson</div>
                                    <div className="text-sm text-gray-400">Software Engineer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Us */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:flex lg:items-center lg:space-x-16">
                        <div className="lg:w-1/2 mb-12 lg:mb-0">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-indigo-600 opacity-20"></div>
                                {/* Placeholder for an office or team image */}
                                <div className="h-96 bg-gray-300 flex items-center justify-center text-gray-500">
                                    <Users className="h-24 w-24 opacity-50" />
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">About Us</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Founded in 2026, DAKPlus was born from a simple idea: Preparation should be smarter, not harder.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                We are a team of educators and engineers dedicated to democratizing quality education. Our mission is to empower students worldwide with the tools they need to achieve their academic and professional goals.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-xl text-indigo-600">Our Mission</h4>
                                    <p className="text-sm text-gray-600 mt-2">To provide accessible, high-quality assessment tools for everyone.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-indigo-600">Our Vision</h4>
                                    <p className="text-sm text-gray-600 mt-2">A world where every learner has the confidence to succeed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Us */}
            <div className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Get in Touch</h2>
                    <p className="text-xl text-gray-600 mb-12">Have questions? We'd love to hear from you.</p>

                    <form className="space-y-6 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="How can we help you?"></textarea>
                        </div>
                        <button type="button" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 text-gray-400 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-2xl font-bold text-white">DAKPlus</span>
                        <p className="text-sm mt-2">Empowering learners worldwide.</p>
                    </div>
                    <div className="flex space-x-8 text-sm">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">Contact Support</a>
                    </div>
                    <div className="mt-8 md:mt-0 text-sm">
                        &copy; 2026 DAKPlus. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
