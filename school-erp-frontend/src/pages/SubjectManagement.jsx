import React, { useState, useEffect } from 'react';
import {
    Book,
    Plus,
    Search,
    Edit3,
    Trash2,
    ChevronRight,
    Database,
    Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { subjectApi } from '../services/api';

const SubjectManagement = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubjects = async () => {
        try {
            const res = await subjectApi.list();
            setSubjects(res.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
            showToast('Failed to fetch subjects', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAdd = async () => {
        const name = prompt('Enter subject name:');
        const code = prompt('Enter subject code:');
        if (name && code) {
            try {
                await subjectApi.create({ name, code });
                showToast('Subject added successfully!');
                fetchSubjects();
            } catch (err) {
                showToast('Error adding subject', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await subjectApi.delete(id);
            showToast('Subject deleted');
            fetchSubjects();
        } catch (err) {
            showToast('Error', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Subjects</h1>
                    <p className="text-gray-500 text-sm">Define and manage the curriculum subjects for all classes.</p>
                </div>
                {(['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role)) && (
                    <button
                        onClick={handleAdd}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add New Subject
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub) => (
                    <div key={sub.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                            <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                                <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDelete(sub.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-2xl ${sub.department === 'Science' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                <Book size={24} />
                            </div>
                            <div className="flex-1 pr-8">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sub.code || 'SUB-00'}</span>
                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{sub.level || 'MAIN'}</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-4">{sub.name}</h3>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Database size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Dept.</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-700">{sub.department || 'General'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Users size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Faculty</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-700">{sub.teachers || 0} Teachers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-between text-blue-600 text-xs font-bold items-end opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span>View Syllabus & Resources</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAdd}
                    className="border-4 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-blue-100 hover:text-blue-500 transition-all"
                >
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50">
                        <Plus size={32} />
                    </div>
                    <span className="font-extrabold uppercase tracking-widest text-xs">Add New Subject</span>
                </button>
            </div>
        </div>
    );
};

export default SubjectManagement;
