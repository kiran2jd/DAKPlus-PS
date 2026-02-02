import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, FileText, User, LogOut } from 'lucide-react';
import { authService } from '../services/auth';
import logo from '../assets/logo.png';

export default function Sidebar() {
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

    // Determine if student view should be shown (case-insensitive role check)
    const userRole = (user.role || '').toUpperCase();
    const isStudent = userRole === 'STUDENT' || location.pathname.includes('/student');

    return (
        <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
            <div className="p-6 border-b flex justify-center items-center">
                <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                        D+
                    </div>
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        DAK<span className="text-red-600">Plus</span>
                    </span>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-2">
                {/* Dynamic Sidebar Links */}
                {isStudent ? (
                    <>
                        <Link
                            to="/dashboard/student"
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
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <LayoutDashboard size={20} />
                            <span className="font-medium">Overview</span>
                        </Link>

                        <Link
                            to="/dashboard/create-test"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/create-test') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <PlusCircle size={20} />
                            <span className="font-medium">Create Test</span>
                        </Link>

                        <Link
                            to="/dashboard/my-tests"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard/my-tests') ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FileText size={20} />
                            <span className="font-medium">Manage Tests</span>
                        </Link>
                    </>
                )}

                <div className="border-t border-gray-100 my-2 pt-2">
                    <Link
                        to="/dashboard/profile"
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
    );
}
