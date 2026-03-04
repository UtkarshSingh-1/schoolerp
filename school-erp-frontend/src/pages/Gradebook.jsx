import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Clock, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Gradebook = () => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const res = await api.get('/marks');
                setMarks(res.data);
            } catch (err) {
                console.error('Error fetching marks:', err);
                showToast('Failed to load gradebook', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, []);

    const calculateGPA = () => {
        if (marks.length === 0) return 0;
        const total = marks.reduce((acc, curr) => acc + (curr.marks_obtained / curr.total_marks * 100), 0);
        return (total / marks.length / 10).toFixed(2);
    };

    const downloadReport = (studentId) => {
        window.open(`http://localhost:5000/api/reports/student/${studentId}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 text-premium">My Academic Performance</h1>
                    <p className="text-gray-500">Track your grades, exam results, and academic progress.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <Award className="text-amber-500" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase">Current GPA</p>
                            <h3 className="text-lg font-black text-gray-900">{calculateGPA()}</h3>
                        </div>
                    </div>
                    {marks.length > 0 && (
                        <button
                            onClick={async () => {
                                const studentId = marks[0].student_id;
                                window.open(`http://localhost:3000/api/reports/student/${studentId}`, '_blank');
                            }}
                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl"
                        >
                            <Award size={16} /> Download Report Card
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-slate-50/50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={16} className="text-blue-600" /> Recent Grades
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4">Exam Type</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {marks.length > 0 ? marks.map((m, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 font-bold text-gray-900">{m.subject_name}</td>
                                            <td className="px-6 py-5 text-sm text-gray-500">{m.exam_type}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-gray-900">{m.marks_obtained}</span>
                                                    <span className="text-xs text-gray-400">/ {m.total_marks}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${(m.marks_obtained / m.total_marks) >= 0.4 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {(m.marks_obtained / m.total_marks) >= 0.4 ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                                No exam data available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-lg font-black mb-2 italic">Student Tip</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">Your Mathematics scores have improved by 12% this month. Keep up the great work in Calculus!</p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md text-xs font-black uppercase tracking-widest transition-all">View Analytics</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gradebook;
