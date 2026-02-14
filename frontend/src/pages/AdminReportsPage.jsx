import React from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function AdminReportsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Reports</h1>
                <p className="text-gray-500 mb-8">System-wide statistics and performance metrics.</p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-green-600 text-xs font-bold">+12%</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                        <p className="text-3xl font-bold text-gray-900">1,240</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="text-green-600 text-xs font-bold">+5%</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Tests Taken (Today)</h3>
                        <p className="text-3xl font-bold text-gray-900">85</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <span className="text-green-600 text-xs font-bold">+18%</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Revenue (This Month)</h3>
                        <p className="text-3xl font-bold text-gray-900">₹45,200</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-gray-400 text-xs font-bold">Stable</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">Avg. Pass Rate</h3>
                        <p className="text-3xl font-bold text-gray-900">68%</p>
                    </div>
                </div>

                {/* Graphs / Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col justify-center items-center">
                        <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-400 font-medium">User Growth Chart (Placeholder)</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col justify-center items-center">
                        <TrendingUp className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-400 font-medium">Test Performance Distribution (Placeholder)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
