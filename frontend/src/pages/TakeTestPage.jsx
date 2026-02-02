import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../services/test';
import { resultService } from '../services/result';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export default function TakeTestPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    // Use Ref for answers to ensure 'handleSubmit' in setInterval sees latest state
    const answersRef = useRef({});
    const [answers, setAnswers] = useState({}); // Keep state for UI updates

    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadTest = async () => {
            try {
                const data = await testService.takeTest(testId);
                setTest(data);
                // Set initial timer based on duration
                let minutes = data.durationMinutes || data.duration_minutes || 60;
                // Handle case if minutes is string or invalid
                if (typeof minutes !== 'number' || isNaN(minutes)) {
                    minutes = 60;
                }
                setTimeLeft(minutes * 60);
            } catch (err) {
                console.error("Failed to load test", err);
            } finally {
                setLoading(false);
            }
        };
        loadTest();
    }, [testId]);

    // Timer Effect
    useEffect(() => {
        if (!test) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!isSubmitting) {
                        handleSubmit(); // Auto-submit
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [test]); // Stable dependency

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [currentQuestion]: value };
        setAnswers(newAnswers);
        answersRef.current = newAnswers; // Sync ref
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                test_id: testId,
                answers: answersRef.current // Use Ref for accurate submission
            };

            const result = await resultService.submitTest(payload);
            navigate(`/dashboard/result/${result.id}`);
        } catch (err) {
            console.error("Submission failed", err);
            alert("Failed to submit test. Please try again.");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="p-8 text-center">Loading Test...</div>;
    if (!test) return <div className="p-8 text-center text-red-500">Test not found</div>;

    const question = test.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Gradient Header matching mobile app */}
            <div className="bg-gradient-to-r from-red-600 to-blue-900 px-6 py-4 shadow-xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                                navigate('/dashboard');
                            }
                        }}
                        className="text-white font-semibold"
                    >
                        Exit
                    </button>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-white text-lg font-bold font-mono">{formatTime(timeLeft)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="text-white font-bold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '...' : 'Submit'}
                    </button>
                </div>
                <div className="max-w-7xl mx-auto mt-4">
                    <h1 className="text-white text-lg font-bold">{test.title}</h1>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white px-6 py-5">
                <div className="max-w-7xl mx-auto">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
                        />
                    </div>
                    <p className="text-gray-600 text-xs font-semibold">Question {currentQuestion + 1} of {test.questions.length}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Area */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-8 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-medium text-gray-500">Question {currentQuestion + 1} of {test.questions.length}</span>
                        <span className="text-sm font-medium text-gray-500">{question.points} Points</span>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-medium text-gray-900 mb-6">{question.text}</h2>

                        <div className="space-y-3">
                            {question.type === 'mcq' && question.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    className={`flex items-center w-full p-4 rounded-2xl border transition-all ${answers[currentQuestion] === option
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === option
                                        ? 'border-red-600 bg-red-600'
                                        : 'border-gray-300'
                                        }`}>
                                        {answers[currentQuestion] === option && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <span className={`text-base ${answers[currentQuestion] === option ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}>{option}</span>
                                </button>
                            ))}

                            {question.type === 'true_false' && ['True', 'False'].map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    className={`flex items-center w-full p-4 rounded-2xl border transition-all ${answers[currentQuestion] === option
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === option
                                        ? 'border-red-600 bg-red-600'
                                        : 'border-gray-300'
                                        }`}>
                                        {answers[currentQuestion] === option && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <span className={`text-base ${answers[currentQuestion] === option ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}>{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => {
                                if (currentQuestion < test.questions.length - 1) {
                                    setCurrentQuestion(currentQuestion + 1);
                                } else {
                                    handleSubmit();
                                }
                            }}
                            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold"
                        >
                            {currentQuestion === test.questions.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>

                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {test.questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${currentQuestion === idx
                                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                                        : answers[idx]
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2 text-sm text-gray-500">
                            <div className="flex items-center"><span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span> Answered</div>
                            <div className="flex items-center"><span className="w-3 h-3 bg-gray-100 rounded-full mr-2"></span> Not Answered</div>
                            <div className="flex items-center"><span className="w-3 h-3 bg-primary rounded-full mr-2"></span> Current</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
