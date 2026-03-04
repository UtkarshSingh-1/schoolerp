import React from 'react';
import api, { examApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, BookOpen, Clock, MoreVertical, CheckCircle2, Filter, ShieldAlert, Trophy, Eye, ChevronRight, Users, Plus } from 'lucide-react';

const Exams = () => {
    const { user } = useAuth();
    const isAcademicStaff = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(user?.role);
    const isStudentOrParent = ['STUDENT', 'PARENT'].includes(user?.role);
    const { showToast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [exams, setExams] = React.useState([]);
    const [showMeritList, setShowMeritList] = React.useState(false);
    const [selectedExam, setSelectedExam] = React.useState(null);
    const [candidates, setCandidates] = React.useState([]);
    const [seats, setSeats] = React.useState(10);

    const fetchExams = async () => {
        try {
            const res = await examApi.list();
            setExams(res.data);
        } catch (err) {
            showToast('Failed to load exams', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (examId) => {
        try {
            const res = await examApi.getResults(examId);
            setCandidates(res.data);
        } catch (err) {
            showToast('Failed to load exam results', 'error');
        }
    };

    React.useEffect(() => {
        fetchExams();
    }, []);

    const upcomingExams = exams.filter(e => new Date(e.startTime) > new Date());
    const recentResults = exams.filter(e => new Date(e.startTime) <= new Date());

    const meritList = candidates.map((c, i) => ({
        ...c,
        rank: i + 1,
        status: i < seats ? 'Selected' : 'Waiting'
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Examinations</h1>
                    <p className="text-gray-500 text-sm">{isAcademicStaff ? 'Schedule exams, manage questions, and publish results.' : 'Attempt your scheduled exams and view results.'}</p>
                </div>
                <div className="flex gap-3">
                    {isAcademicStaff && (
                        <button
                            onClick={() => setShowMeritList(!showMeritList)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${showMeritList ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                }`}
                        >
                            {showMeritList ? 'Back to Exams' : 'Entrance Merit List'}
                        </button>
                    )}
                    {isAcademicStaff && (
                        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                            <Plus size={18} /> Schedule New Exam
                        </button>
                    )}
                    {isStudentOrParent && (
                        <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2">
                            View Performance Analytics
                        </button>
                    )}
                </div>
            </div>

            {!showMeritList ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Upcoming & Management */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Exams Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-500" /> Upcoming Examinations
                                </h2>
                                <button className="text-xs font-bold text-blue-600 hover:underline">View Calendar</button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {upcomingExams.map((exam, i) => (
                                    <div key={exam.id || i} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-400 font-medium">Type: {exam.type || 'Standard'}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} /> {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-sm font-bold text-gray-900">{new Date(exam.startTime).toLocaleDateString()}</span>
                                            {isAcademicStaff ? (
                                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            ) : (
                                                <button className="px-4 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all">
                                                    View Details
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Results Management Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-500" /> Past Examinations
                                </h2>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all">
                                        <Filter size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            <th className="px-6 py-4">Examination</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Proctoring</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentResults.map((result, i) => (
                                            <tr key={result.id || i} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-bold text-gray-900`}>{result.title}</span>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(result.startTime).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700`}>
                                                        Completed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                                        {result.proctoringEnabled ? (
                                                            <span className="flex items-center gap-1 text-indigo-600"><ShieldAlert size={12} /> Shield On</span>
                                                        ) : (
                                                            <span className="text-gray-400">Standard</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedExam(result);
                                                                fetchResults(result.id);
                                                                setShowMeritList(true);
                                                            }}
                                                            title="View Merit List"
                                                            className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                                        >
                                                            <Trophy size={14} />
                                                        </button>
                                                        <button title="View Report" className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Stats & Actions */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
                            <Trophy className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
                            <h3 className="font-bold text-lg mb-4">MCQ Engine</h3>
                            <p className="text-purple-100 text-xs mb-6 opacity-80 leading-relaxed">
                                Enable auto-grading for entrance tests and class quizzes. Supports 10+ question formats.
                            </p>
                            <button className="w-full py-2.5 bg-white text-purple-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                                Manage Question Bank
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-gray-900 text-sm">Quick Actions</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Print Result Cards', icon: <ChevronRight size={16} /> },
                                    { label: 'Entrance Merit List', icon: <ChevronRight size={16} />, action: () => setShowMeritList(true) },
                                    { label: 'Subject Weightage', icon: <ChevronRight size={16} /> },
                                ].map((act, i) => (
                                    <button
                                        key={i}
                                        onClick={act.action}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold text-gray-600 group"
                                    >
                                        {act.label}
                                        <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">{act.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Merit List: {selectedExam?.title || 'Entrance Test'}</h2>
                            <p className="text-sm text-gray-500 mt-1">Reflecting real-time scores from the secure examination engine.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Available Seats</span>
                                <input
                                    type="number"
                                    value={seats}
                                    onChange={(e) => setSeats(parseInt(e.target.value))}
                                    className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Users size={18} className="text-indigo-500" /> Candidate Scores
                                </h3>
                                <div className="space-y-3">
                                    {candidates.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-sm font-bold text-gray-700">{c.name}</span>
                                            <input
                                                type="number"
                                                value={c.score}
                                                onChange={(e) => {
                                                    const newList = [...candidates];
                                                    newList[i].score = parseInt(e.target.value);
                                                    setCandidates(newList);
                                                }}
                                                className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-center"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Trophy size={18} className="text-amber-500" /> Generated Rankings
                                </h3>
                                <div className="space-y-3">
                                    {meritList.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm relative overflow-hidden group">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.status === 'Selected' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' :
                                                    i === 1 ? 'bg-slate-100 text-slate-700' :
                                                        'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {c.rank}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{c.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Score: {c.score}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${c.status === 'Selected' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exams;
