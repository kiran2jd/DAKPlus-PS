import { Navigate } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';
import StudentDashboard from '../pages/StudentDashboard';

export default function DashboardRedirect() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Checking exact role match (case insensitive just in case)
    const role = user.role?.toLowerCase();

    // STRICT CHECK: Only allow Teacher/Admin access to Teacher Dashboard
    if (role === 'teacher' || role === 'admin') {
        return <TeacherDashboard />;
    }

    // Default to Student Dashboard for everyone else (safer)
    return <StudentDashboard />;
}
