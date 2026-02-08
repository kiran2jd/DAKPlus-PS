import { useEffect, useState } from 'react';
import { testService } from '../services/test';
import { authService } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, BarChart2, BookOpen, Search, History, Bell, GraduationCap, FileText, ClipboardList } from 'lucide-react';
import { resultService } from '../services/result';
import { topicService } from '../services/topic';

export default function StudentDashboard() {
    // Safely parse user from localStorage with defaults
    const getUserFromStorage = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            // Ensure subscriptionTier exists with default value
            if (user && !user.subscriptionTier) {
                user.subscriptionTier = 'FREE';
            }
            return user;
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            return null;
        }
    };

    const [user, setUser] = useState(getUserFromStorage());
    const [tests, setTests] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [subtopics, setSubtopics] = useState([]);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [history, setHistory] = useState([]);
    const [overallAccuracy, setOverallAccuracy] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isPro = user?.subscriptionTier === 'PREMIUM';

    useEffect(() => {
        const loadTests = async () => {
            try {
                // Refresh profile to get real tier
                const profileRes = await authService.getProfile();
                if (profileRes?.user) {
                    const localUser = getUserFromStorage();
                    const mergedUser = { ...profileRes.user };

                    // Prioritize local PREMIUM status if it exists
                    if (localUser?.subscriptionTier === 'PREMIUM') {
                        mergedUser.subscriptionTier = 'PREMIUM';
                    } else if (!mergedUser.subscriptionTier) {
                        mergedUser.subscriptionTier = 'FREE';
                    }

                    setUser(mergedUser);
                }

                const data = await testService.getAvailableTests();
                setTests(data);

                const topicsData = await topicService.getAllTopics();
                setTopics(topicsData);
            } catch (err) {
                console.error("Failed to load tests", err);
                // If profile fetch fails but we have a user in state, keep using it
                if (!user) {
                    // No user at all, redirect to login
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        const loadAnalytics = async () => {
            try {
                const currentUser = user || getUserFromStorage();
                if (currentUser?.id) {
                    const results = await resultService.getResultsByUser(currentUser.id);
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

    const handleTopicClick = async (topicId) => {
        if (selectedTopic === topicId) {
            setSelectedTopic(null);
            setSubtopics([]);
            setSelectedSubtopic(null);
        } else {
            setSelectedTopic(topicId);
            const subData = await topicService.getSubtopics(topicId);
            setSubtopics(subData);
            setSelectedSubtopic(null);
        }
    };

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
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
                            <span className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Avg Accuracy</span>
                            <span className="text-2xl md:text-3xl font-black text-white">{overallAccuracy}%</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
                            <span className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Tests Taken</span>
                            <span className="text-2xl md:text-3xl font-black text-white">{history.length}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
                            <span className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Points</span>
                            <span className="text-2xl md:text-3xl font-black text-white">{totalPoints}</span>
                        </div>
                    </div>

                    {/* Quick Access Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 transition border border-white/20">
                            <Bell className="text-white h-8 w-8 mb-2" />
                            <span className="text-white font-bold text-sm">Exam Notification</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 transition border border-white/20">
                            <GraduationCap className="text-white h-8 w-8 mb-2" />
                            <span className="text-white font-bold text-sm">Classes</span>
                        </div>
                        <div
                            onClick={() => document.getElementById('tests-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 transition border border-white/20"
                        >
                            <ClipboardList className="text-white h-8 w-8 mb-2" />
                            <span className="text-white font-bold text-sm">Exams</span>
                        </div>
                        <div
                            onClick={() => navigate('/dashboard/student/syllabus')}
                            className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 transition border border-white/20"
                        >
                            <FileText className="text-white h-8 w-8 mb-2" />
                            <span className="text-white font-bold text-sm">Syllabus</span>
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

                {/* Topics Selection */}
                <div className="mb-8 overflow-x-auto pb-2 flex gap-4 scrollbar-hide">
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => handleTopicClick(topic.id)}
                            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all border-2 ${selectedTopic === topic.id ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'}`}
                        >
                            {topic.name}
                        </button>
                    ))}
                </div>

                {selectedTopic && subtopics.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                        {subtopics.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSubtopic(selectedSubtopic === sub.id ? null : sub.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedSubtopic === sub.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Available Tests */}
                    <div className="lg:col-span-2 space-y-6">
                        <div id="tests-section" className="flex justify-between items-center mb-4">
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
                                    const matchesTier = isPro ? true : !isPremium;
                                    const matchesTopic = !selectedTopic || test.topicId === selectedTopic;
                                    const matchesSubtopic = !selectedSubtopic || test.subtopicId === selectedSubtopic;
                                    return matchesTier && matchesTopic && matchesSubtopic;
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
