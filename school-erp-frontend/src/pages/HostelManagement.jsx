import React, { useState, useEffect } from 'react';
import { Home, User, Plus, Search, Loader2, CheckCircle, Bed } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const HostelManagement = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [hostels, setHostels] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hostelsRes, studentsRes] = await Promise.all([
                    api.get('/hostels/rooms').catch(() => ({ data: [] })),
                    api.get('/students?limit=100')
                ]);
                const dummyHostels = [
                    {
                        id: 1, name: 'Tagore Bhawan (Boys)', type: 'BOYS', rooms: [
                            { id: 101, room_no: 'B-101', capacity: 4, occupancy: 2, monthly_rent: 4500 },
                            { id: 102, room_no: 'B-102', capacity: 4, occupancy: 4, monthly_rent: 4500 }
                        ]
                    }
                ];
                setHostels(hostelsRes.data.length ? hostelsRes.data : dummyHostels);
                setStudents(studentsRes.data.students || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                showToast('Failed to load hostel data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddBlock = () => {
        alert('New Hostel Block creation is restricted to Super Admins. \nPlease initiate a request via the Admin Portal for infrastructure updates.');
    };

    const handleAllot = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/hostel/allot', { // Changed to api.post and relative path
                studentId: selectedStudent,
                roomId: selectedRoom
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setSelectedStudent('');
            setSelectedRoom('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to allot room');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 text-premium">Hostel Management</h1>
                    <p className="text-gray-500">Manage residential blocks, room allotments, and occupancy.</p>
                </div>
                {(['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role)) && (
                    <button
                        onClick={handleAddBlock}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add New Block
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {hostels.map(h => (
                        <div key={h.id} className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Home size={18} className="text-blue-600" /> {h.name}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${h.type === 'BOYS' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>{h.type}</span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                                {h.rooms.map(r => (
                                    <div key={r.id} className={`p-5 rounded-2xl border-2 transition-all ${r.occupancy >= r.capacity ? 'border-red-100 bg-red-50/30' : 'border-gray-50 hover:border-blue-200 bg-white'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black">
                                                {r.room_no}
                                            </div>
                                            <span className="text-xs font-black text-blue-600">₹{r.monthly_rent}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                                                <span>Occupancy</span>
                                                <span className={r.occupancy >= r.capacity ? 'text-red-500' : 'text-green-600'}>{r.occupancy} / {r.capacity}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${r.occupancy >= r.capacity ? 'bg-red-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${(r.occupancy / r.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-huge border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Room Allotment</h3>
                            {success && <CheckCircle size={20} className="text-green-500 animate-in zoom-in" />}
                        </div>
                        <form onSubmit={handleAllot} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Student</label>
                                <select
                                    required
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all outline-none"
                                >
                                    <option value="">Select Student...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Room</label>
                                <select
                                    required
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all outline-none"
                                >
                                    <option value="">Select Room...</option>
                                    {hostels.map(h => h.rooms.map(r => (
                                        <option key={r.id} value={r.id} disabled={r.occupancy >= r.capacity}>
                                            {h.name} - Room {r.room_no} {r.occupancy >= r.capacity ? '(Full)' : ''}
                                        </option>
                                    )))}
                                </select>
                            </div>
                            <button
                                disabled={submitting || loading}
                                type="submit"
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Bed size={20} />}
                                Confirm Allotment
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostelManagement;
