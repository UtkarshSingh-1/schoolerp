import React, { useState } from 'react';
import api, { studentsApi, attendanceApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
    Users,
    CalendarCheck,
    AlertCircle,
    CheckCircle,
    Download,
    RefreshCw,
    XCircle,
    X,
    Check,
    Save,
    Calendar,
    Search
} from 'lucide-react';

const Attendance = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);
    const [attendance, setAttendance] = useState([]);

    const fetchStudents = async () => {
        try {
            const res = await studentsApi.list();
            // Transform v3 student data to match the UI shape
            const students = res.data.map(s => ({
                id: s.id,
                name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.fullName,
                roll: s.admissionNumber || 'N/A',
                status: 'present' // default
            }));
            setAttendance(students);
        } catch (err) {
            showToast('Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStudents();
    }, []);

    const handleBiometricSync = async () => {
        setIsSyncing(true);
        try {
            // Simulated logs for demo if none provided
            const mockLogs = attendance.map(s => ({
                studentId: s.id,
                scanTime: new Date().toISOString().split('T')[0] + 'T08:' + Math.floor(Math.random() * 30).toString().padStart(2, '0') + ':00Z',
                deviceId: 'DEV-01'
            }));

            const res = await attendanceApi.sync(mockLogs);
            showToast('Biometric logs synced successfully! ✅');
            setSyncStatus({
                time: new Date().toLocaleTimeString(),
                count: res.data.processed,
                status: 'Success'
            });
            fetchStudents(); // Refresh list to show LATE/PRESENT status
        } catch (err) {
            showToast('Failed to sync biometric data', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveAttendance = async () => {
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const promises = attendance.map(s =>
                attendanceApi.mark({
                    studentId: s.id,
                    date: today,
                    status: s.status.toUpperCase(),
                    remarks: 'Marked via Web UI'
                })
            );
            await Promise.all(promises);
            showToast('Attendance saved successfully for all students! ✅');
        } catch (err) {
            showToast('Error saving attendance records', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = (id) => {
        setAttendance(attendance.map(s =>
            s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
        ));
    };

    const presentCount = attendance.filter(s => s.status === 'present').length;
    const absentCount = attendance.length - presentCount;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lecture Attendance</h1>
                    <p className="text-gray-500">Mark daily subject-wise student presence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBiometricSync}
                        disabled={isSyncing}
                        className={`px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center gap-2 transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Biometric Sync'}
                    </button>
                    <button
                        onClick={handleSaveAttendance}
                        disabled={saving}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Save size={16} className={saving ? 'animate-spin' : ''} /> {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </div>

            {syncStatus && (
                <div className="bg-blue-600 rounded-2xl p-6 text-white flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold">Biometric Sync Successful</h4>
                            <p className="text-blue-100 text-xs">Last sync: {syncStatus.time} • {syncStatus.count} records processed</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSyncStatus(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Total Students</p>
                        <h3 className="text-xl font-bold text-gray-900">{attendance.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Present</p>
                        <h3 className="text-xl font-bold text-gray-900">{presentCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Absent</p>
                        <h3 className="text-xl font-bold text-gray-900">{absentCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[150px]">
                    <label className="text-sm font-bold text-gray-700">Class & Section</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <option>Class 10-A</option>
                        <option>Class 10-B</option>
                    </select>
                </div>
                <div className="space-y-2 flex-1 min-w-[150px]">
                    <label className="text-sm font-bold text-gray-700">Subject</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <option>Mathematics</option>
                        <option>Science</option>
                        <option>English</option>
                    </select>
                </div>
                <div className="space-y-2 flex-1 min-w-[150px]">
                    <label className="text-sm font-bold text-gray-700">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" value="Feb 22, 2026" readOnly className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none cursor-not-allowed" />
                    </div>
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search student..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Roll No</th>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {attendance.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-500 text-sm">{s.roll}</td>
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">{s.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <div className="bg-gray-100 p-1 rounded-full flex gap-1">
                                            <button
                                                onClick={() => toggleStatus(s.id)}
                                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${s.status === 'present' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Check size={14} /> Present
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(s.id)}
                                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${s.status === 'absent' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <X size={14} /> Absent
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
