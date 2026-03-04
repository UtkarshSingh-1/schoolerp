import React, { useState, useEffect } from 'react';
import { Save, User, Book, Calculator, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const MarksEntry = () => {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Physics' },
        { id: 3, name: 'Chemistry' }
    ]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marks, setMarks] = useState('');
    const [total, setTotal] = useState('100');
    const [examType, setExamType] = useState('Midterm');
    const [loading, setLoading] = useState(true); // Changed initial state to true for loading students
    const [saving, setSaving] = useState(false); // New state for saving marks
    const [success, setSuccess] = useState(false);

    const { showToast } = useToast(); // Destructure showToast from useToast

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true); // Set loading to true when fetching starts
            try {
                const res = await api.get('/students?limit=100');
                setStudents(res.data.students || []);
            } catch (err) {
                console.error('Error loading students:', err);
                showToast('Failed to load student list', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/marks/upsert', {
                studentId: selectedStudent,
                subjectId: selectedSubject,
                marksObtained: parseFloat(marks),
                totalMarks: parseFloat(total),
                examType,
                academicYear: '2026-27'
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setMarks('');
        } catch (err) {
            console.error('Error saving marks:', err);
            alert('Failed to save marks');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 text-premium">Academic Grading Portal</h1>
                <p className="text-gray-500">Enter and update student marks for midterms, finals, and assignments.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Calculator size={20} />
                        </div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Marks Entry Form</h2>
                    </div>
                    {success && (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in zoom-in">
                            <CheckCircle size={18} /> Marks Saved Successfully
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Select Student</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                required
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Choose a student...</option>
                                {students.map(s => (
                                    <option key={s.student_id} value={s.id}>{s.first_name} {s.last_name} ({s.student_id})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Subject</label>
                        <div className="relative">
                            <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                required
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Select subject...</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Exam Type</label>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option>Midterm</option>
                            <option>Final Exam</option>
                            <option>Assignment</option>
                            <option>Unit Test</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Obtained</label>
                            <input
                                type="number"
                                required
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                                placeholder="00"
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Max Marks</label>
                            <input
                                type="number"
                                required
                                value={total}
                                onChange={(e) => setTotal(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-200 border-none rounded-2xl text-sm font-black text-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Update Academic Records
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MarksEntry;
