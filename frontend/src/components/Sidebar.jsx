import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, FileText, User, LogOut, X } from 'lucide-react';
import { authService } from '../services/auth';
import logo from '../assets/logo.jpg';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Safe user access
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    // Determine if student view should be shown
    const userRole = (user.role || '').toUpperCase();
    const isStudent = userRole === 'STUDENT' || location.pathname.includes('/student');

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 transform 
                lg:translate-x-0 lg:static lg:inset-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col
            `}>
                <div className="p-6 border-b flex justify-between items-center">
                    <Link to="/dashboard" onClick={onClose} className="flex items-center space-x-2">
                        <img src={logo} alt="DAK Plus Logo" className="h-10 w-auto object-contain flex-shrink-0" />
                        <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            DAK <span className="text-red-600">Plus</span>
                        </span>
                        {isStudent && user?.subscriptionTier === 'PREMIUM' && (
                            <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse">
                                PRO
                            </span>
                        )}
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-red-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {/* Dynamic Sidebar Links */}
                    {isStudent ? (
                        <>
                            <Link
                                to="/dashboard/student"
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/student') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <LayoutDashboard size={20} />
                                <span className="font-medium">Student Dashboard</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teacher Controls</div>

                            <Link
                                to="/dashboard"
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <LayoutDashboard size={20} />
                                <span className="font-medium">Overview</span>
                            </Link>

                            <Link
                                to="/dashboard/create-test"
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/create-test') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <PlusCircle size={20} />
                                <span className="font-medium">Create Test</span>
                            </Link>

                            <Link
                                to="/dashboard/my-tests"
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/my-tests') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FileText size={20} />
                                <span className="font-medium">Manage Tests</span>
                            </Link>

                            <Link
                                to="/dashboard/manage-topics"
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/manage-topics') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <PlusCircle size={20} />
                                <span className="font-medium">Manage Topics</span>
                            </Link>
                        </>
                    )}

                    <div className="border-t border-gray-100 my-2 pt-2">
                        <Link
                            to="/dashboard/profile"
                            onClick={onClose}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/profile') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <User size={20} />
                            <span className="font-medium">Profile</span>
                        </Link>
                    </div>
                </div>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
