import { useEffect, useState } from 'react';
import { testService } from '../services/test';
import { authService } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, BarChart2, BookOpen, Search, History } from 'lucide-react';
import { resultService } from '../services/result';

export default function StudentDashboard() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [tests, setTests] = useState([]);
    const [history, setHistory] = useState([]);
    const [overallAccuracy, setOverallAccuracy] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isPro = user.subscriptionTier === 'PREMIUM';

    useEffect(() => {
        const loadTests = async () => {
            try {
                // Refresh profile to get real tier
                const profileRes = await authService.getProfile();
                setUser(profileRes.user);

                const data = await testService.getAvailableTests();
                setTests(data);
            } catch (err) {
                console.error("Failed to load tests", err);
            } finally {
                setLoading(false);
            }
        };

        const loadAnalytics = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.id) {
                    const results = await resultService.getResultsByUser(user.id);
                    setHistory(results);

                    if (results.length > 0) {
                        const total = results.reduce((acc, curr) => acc + curr.percentage, 0);
                        setOverallAccuracy(Math.round(total / results.length));
                        const points = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
                        setTotalPoints(points);
                    }
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            }
        };

        loadTests();
        loadAnalytics();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Gradient Header matching mobile app */}
            <div className="bg-gradient-to-r from-red-600 to-blue-900 px-6 py-8 md:px-8 md:py-12 rounded-b-3xl shadow-xl">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Hello, {user?.fullName?.split(' ')[0] || 'User'}
                                </h1>
                                {isPro && (
                                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded">
                                        PRO
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-sm">Student Dashboard</p>
                        </div>
                    </div>

                    {/* Stats Cards with glassmorphism */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">Tests Attended</p>
                            <p className="text-white text-2xl md:text-3xl font-bold">{history.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">Avg Accuracy</p>
                            <p className="text-white text-2xl md:text-3xl font-bold">{overallAccuracy}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <p className="text-white/70 text-xs uppercase tracking-wide font-semibold mb-1">Total Points</p>
                            <p className="text-white text-2xl md:text-3xl font-bold">{totalPoints}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 md:px-8">
                {/* Premium Upgrade Banner for non-PRO users */}
                {!isPro && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-amber-500 to-red-600 p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-white text-xl font-bold mb-1">Upgrade to Premium</h3>
                                <p className="text-white/90 text-sm">Get unlimited tests & AI feedback</p>
                            </div>
                            <button
                                onClick={() => navigate('/payment')}
                                className="bg-white text-red-600 font-bold px-6 py-2 rounded-xl hover:bg-gray-100 transition"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Available Tests */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Available Mock Exams</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div></div>
                        ) : tests.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No tests available right now. Check back later!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {tests.filter(test => {
                                    const isPremium = test.premium || test.isPremium;
                                    return isPro ? true : !isPremium;
                                }).map(test => {
                                    const isPremium = test.premium || test.isPremium;
                                    return (
                                        <div key={test.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${test.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                        {test.difficulty || 'Medium'}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 text-xs">{test.durationMinutes || test.duration_minutes} mins</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                {isPremium && <span className="text-amber-500">[PRO] </span>}
                                                {test.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                <span className="text-red-600 text-xs font-semibold">{test.category || 'General'}</span>
                                                <button
                                                    onClick={() => (isPremium && !isPro) ? navigate('/payment') : navigate(`/dashboard/take-test/${test.id}`)}
                                                    className={`px-4 py-2 font-bold rounded-xl transition ${isPremium && !isPro ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                                >
                                                    {isPremium && !isPro ? 'Get Pro' : 'Start Test'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Analytics */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="text-sm font-bold text-gray-700 mb-2 border-b pb-2">Recent Attempts</div>
                                    {history.slice(0, 5).map((h, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="truncate w-32" title={h.testTitle}>{h.testTitle || 'Test Attempt'}</span>
                                            <span className={`font-bold ${h.percentage >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                                                {h.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 text-sm mt-4">
                                    No tests taken yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
