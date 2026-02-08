import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-600 hover:text-red-600"
                >
                    <Menu size={24} />
                </button>
                <div className="text-xl font-bold">
                    DAK<span className="text-red-600">Plus</span>
                </div>
                <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
                <Outlet />
            </div>
        </div>
    );
}
