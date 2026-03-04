import React, { useState, useEffect } from 'react';
import { Bus, MapPin, User, Plus, Search, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const TransportManagement = () => {
    const { user } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [routesRes, studentsRes] = await Promise.all([
                    api.get('/transport/routes').catch(() => ({ data: [] })),
                    api.get('/students?limit=100')
                ]);
                setRoutes(routesRes.data || []);
                setStudents(studentsRes.data.students || []);
            } catch (err) {
                console.error('Error loading transport data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddRoute = () => {
        alert('Transport Route creation is currently locked. \nPlease use the Route Assignment tool or contact the Transport Manager.');
    };

    const handleAllot = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/transport/allot', {
                studentId: selectedStudent,
                routeId: selectedRoute,
                vehicleId: 1 // Assuming default for now
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setSelectedStudent('');
            setSelectedRoute('');
        } catch (err) {
            alert('Failed to allot transport');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 text-premium">Transport Management</h1>
                    <p className="text-gray-500">Manage school bus routes, vehicles, and student allotments.</p>
                </div>
                {(['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role)) && (
                    <button
                        onClick={handleAddRoute}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add New Route
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Bus size={18} className="text-blue-600" /> Active Routes
                            </h3>
                            <div className="relative w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="text" placeholder="Search routes..." className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                                        <th className="px-6 py-4">Route Name</th>
                                        <th className="px-6 py-4">Assigned Vehicle</th>
                                        <th className="px-6 py-4">Monthly Fee</th>
                                        <th className="px-6 py-4">Students</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {routes.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                                                        <MapPin size={16} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{r.route_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600 font-medium">Bus-X72 (DL-01-4433)</td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">₹{r.monthly_cost}</span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500">42 / 50</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-huge border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Route Allotment</h3>
                            {success && <CheckCircle size={20} className="text-green-500 animate-in zoom-in" />}
                        </div>
                        <form onSubmit={handleAllot} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Student</label>
                                <select
                                    required
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Student...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Route</label>
                                <select
                                    required
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Route...</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>{r.route_name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                disabled={submitting || loading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Bus size={20} />}
                                Assign Route
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportManagement;
