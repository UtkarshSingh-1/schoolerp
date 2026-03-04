import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Home,
    Calendar,
    Award,
    DollarSign,
    User,
    Clock,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

const ParentPortal = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildInfo = async () => {
            try {
                const res = await api.get('/parent/child');
                setData(res.data);
            } catch (err) {
                console.error('Error fetching child info:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChildInfo();
    }, []);

    if (loading) return <div className="p-8">Loading Parent Portal...</div>;
    if (!data) return <div className="p-8 text-red-500">Could not find associated student details.</div>;

    const { student, attendance, recentMarks } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
                    <p className="text-gray-500">Monitoring academic progress for <span className="text-blue-600 font-bold">{student.first_name} {student.last_name}</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-100 italic">
                    {student.class}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                            <Calendar size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">Attendance</h3>
                    </div>
                    <div className="space-y-2">
                        {attendance.map(a => (
                            <div key={a.status} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">{a.status}</span>
                                <span className="text-sm font-black text-gray-900">{a.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                                <Award size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Recent Exam Results</h3>
                        </div>
                        <TrendingUp className="text-green-500" />
                    </div>
                    <div className="space-y-4">
                        {recentMarks.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{m.subject_name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{m.exam_type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-600">{m.marks_obtained}/{m.total_marks}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Grade A</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentPortal;
