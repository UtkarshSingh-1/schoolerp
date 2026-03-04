import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Edit3,
    BookOpen,
    CheckCircle2,
    X,
    ChevronRight,
    HelpCircle,
    Hash,
    Layers
} from 'lucide-react';

const QuestionBank = () => {
    const [questions, setQuestions] = useState([
        { id: 1, text: 'Newton\'s First Law of motion is also known as?', subject: 'Physics', topic: 'Mechanics', difficulty: 'Easy', type: 'MCQ' },
        { id: 2, text: 'Which organelle is known as the powerhouse of the cell?', subject: 'Biology', topic: 'Cell Biology', difficulty: 'Easy', type: 'MCQ' },
        { id: 3, text: 'The Battle of Panipat (1526) was fought between?', subject: 'History', topic: 'Medieval India', difficulty: 'Medium', type: 'MCQ' },
        { id: 4, text: 'Integral of sin(x) dx is?', subject: 'Mathematics', topic: 'Calculus', difficulty: 'Hard', type: 'MCQ' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        subject: 'General',
        difficulty: 'Medium',
        options: [
            { id: 1, text: '', isCorrect: false },
            { id: 2, text: '', isCorrect: false },
            { id: 3, text: '', isCorrect: false },
            { id: 4, text: '', isCorrect: false },
        ]
    });

    const handleAddOption = () => {
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, { id: Date.now(), text: '', isCorrect: false }]
        });
    };

    const handleRemoveOption = (id) => {
        setNewQuestion({
            ...newQuestion,
            options: newQuestion.options.filter(o => o.id !== id)
        });
    };

    const handleOptionChange = (id, text) => {
        setNewQuestion({
            ...newQuestion,
            options: newQuestion.options.map(o => o.id === id ? { ...o, text } : o)
        });
    };

    const handleMarkCorrect = (id) => {
        setNewQuestion({
            ...newQuestion,
            options: newQuestion.options.map(o => ({ ...o, isCorrect: o.id === id }))
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = {
            ...newQuestion,
            id: Date.now(),
            topic: 'Uncategorized',
            type: 'MCQ'
        };
        setQuestions([q, ...questions]);
        setIsModalOpen(false);
        setNewQuestion({
            text: '',
            subject: 'General',
            difficulty: 'Medium',
            options: [
                { id: 1, text: '', isCorrect: false },
                { id: 2, text: '', isCorrect: false },
                { id: 3, text: '', isCorrect: false },
                { id: 4, text: '', isCorrect: false },
            ]
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                    <p className="text-gray-500 text-sm">Create and manage a centralized repository of assessment questions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> New Question
                </button>
            </div>

            {/* Analytics/Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Questions', value: questions.length, icon: <BookOpen className="text-blue-600" /> },
                    { label: 'Physics', value: questions.filter(q => q.subject === 'Physics').length, icon: <Hash className="text-purple-600" /> },
                    { label: 'Mathematics', value: questions.filter(q => q.subject === 'Mathematics').length, icon: <Hash className="text-amber-600" /> },
                    { label: 'Medium Difficulty', value: questions.filter(q => q.difficulty === 'Medium').length, icon: <Layers className="text-green-600" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search questions by keyword..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Subjects</option>
                        <option>Physics</option>
                        <option>Mathematics</option>
                    </select>
                    <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4">Question Content</th>
                                <th className="px-6 py-4">Subject / Topic</th>
                                <th className="px-6 py-4">Difficulty</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {questions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-6 max-w-md">
                                        <p className="text-sm font-bold text-gray-900 line-clamp-2">{q.text}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{q.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-bold text-gray-900">{q.subject}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{q.topic}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' :
                                                q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                <Edit3 size={18} />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MCQ Builder Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 text-white rounded-lg">
                                    <Plus size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">MCQ Builder</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Question Text */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Question Statement</label>
                                <textarea
                                    rows="3"
                                    value={newQuestion.text}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                    placeholder="Type the question content here..."
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 font-medium"
                                ></textarea>
                            </div>

                            {/* Categorization */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Subject</label>
                                    <select
                                        value={newQuestion.subject}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                    >
                                        <option>Physics</option>
                                        <option>Mathematics</option>
                                        <option>History</option>
                                        <option>Biology</option>
                                        <option>English</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Difficulty</label>
                                    <select
                                        value={newQuestion.difficulty}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                    >
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Options Builder */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Options & Correct Answer</label>
                                    <button
                                        onClick={handleAddOption}
                                        className="text-blue-600 text-xs font-bold hover:underline py-1 px-2"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {newQuestion.options.map((option, idx) => (
                                        <div key={option.id} className="flex items-center gap-4 group">
                                            <button
                                                onClick={() => handleMarkCorrect(option.id)}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${option.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 hover:border-gray-300 text-transparent'
                                                    }`}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                                    placeholder={`Option ${idx + 1}...`}
                                                    className={`w-full pl-6 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none transition-all font-medium ${option.isCorrect ? 'ring-2 ring-green-500/20 border-green-200 bg-green-50/10' : 'focus:ring-2 focus:ring-blue-500 ring-offset-0'
                                                        }`}
                                                />
                                                {newQuestion.options.length > 2 && (
                                                    <button
                                                        onClick={() => handleRemoveOption(option.id)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex items-center justify-between gap-4">
                            <p className="text-[10px] text-gray-400 font-bold uppercase max-w-[200px]">
                                Ensure at least one option is marked as correct.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!newQuestion.text || !newQuestion.options.some(o => o.isCorrect)}
                                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Question
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
