import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit } from 'lucide-react';

export default function SyllabusManagementPage() {
    const [syllabusItems, setSyllabusItems] = useState([
        { id: 1, title: "GDS to MTS Syllabus", exams: "Paper 1", updated: "2024-02-01" },
        { id: 2, title: "Postal Manual Vol V", exams: "Dept Exams", updated: "2024-01-15" }
    ]);

    const handleDelete = (id) => {
        if (window.confirm("Delete this syllabus entry?")) {
            setSyllabusItems(syllabusItems.filter(item => item.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Syllabus Management</h1>
                        <p className="text-gray-500">Organize study materials and exam syllabi.</p>
                    </div>
                    <button className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                        <Plus className="h-5 w-5 mr-2" />
                        Add New
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 font-semibold text-gray-500">Title</th>
                                <th className="p-5 font-semibold text-gray-500">Applicable Exams</th>
                                <th className="p-5 font-semibold text-gray-500">Last Updated</th>
                                <th className="p-5 font-semibold text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {syllabusItems.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="p-5 font-bold text-gray-900 flex items-center gap-3">
                                        <FileText className="text-gray-400 h-5 w-5" />
                                        {item.title}
                                    </td>
                                    <td className="p-5 text-gray-600">{item.exams}</td>
                                    <td className="p-5 text-gray-500 text-sm">{item.updated}</td>
                                    <td className="p-5 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 mr-4">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
