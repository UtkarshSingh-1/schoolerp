import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    Plus,
    Users,
    AlertTriangle,
    MoreVertical,
    Edit,
    Trash2,
    Loader2,
    Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const Classes = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', section: '', maximumCapacity: 40 });
    const { showToast } = useToast();

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await classApi.list();
            const rows = Array.isArray(res.data) ? res.data : [];
            setClasses(rows.map((c) => ({
                ...c,
                maximumCapacity: c.maximumCapacity ?? c.maximum_capacity ?? 0,
                currentEnrollment: c.currentEnrollment ?? c.current_enrollment ?? 0
            })));
        } catch (error) {
            console.error('=== CLASSES LOAD ERROR ===');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
            console.error('Token present:', !!localStorage.getItem('token'));
            console.error('========================');
            showToast('Failed to load classes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await classApi.create(newClass);
            showToast('Class created successfully', 'success');
            setIsModalOpen(false);
            setNewClass({ name: '', section: '', maximumCapacity: 40 });
            fetchClasses();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create class', 'error');
        }
    };

    const handleUpdateCapacity = async (id, maximumCapacity) => {
        try {
            await classApi.update(id, { maximumCapacity });
            showToast('Capacity updated successfully', 'success');
            fetchClasses();
        } catch (error) {
            showToast('Failed to update capacity', 'error');
        }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await classApi.delete(id);
            showToast('Class deleted successfully', 'success');
            fetchClasses();
        } catch (error) {
            showToast('Failed to delete class', 'error');
        }
    };

    const StatsCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
                <Icon size={24} />
            </div>
        </div>
    );

    const totalCapacity = classes.reduce((acc, curr) => acc + (curr.maximumCapacity || 0), 0);
    const totalEnrolled = classes.reduce((acc, curr) => acc + (curr.currentEnrollment || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Class Management</h1>
                    <p className="text-gray-500 font-medium">Configure sections and monitor enrollment capacities.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all"
                >
                    <Plus size={20} /> Create New Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total Classes" value={classes.length} icon={LayoutGrid} color="bg-blue-600" />
                <StatsCard title="Total Capacity" value={totalCapacity} icon={Target} color="bg-indigo-600" />
                <StatsCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={Users} color="bg-purple-600" />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Class Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => {
                        const percent = Math.round(((cls.currentEnrollment || 0) / (cls.maximumCapacity || 1)) * 100);
                        const isFull = (cls.currentEnrollment || 0) >= (cls.maximumCapacity || 40);

                        return (
                            <div key={cls.id} onClick={() => navigate(`/students?classId=${cls.id}`)} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden hover:border-blue-200 transition-all group cursor-pointer">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 text-xl border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                            {cls.name[cls.name.length - 1]}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    const newCap = prompt('Enter new maximum capacity:', cls.maximumCapacity);
                                                    if (newCap) handleUpdateCapacity(cls.id, parseInt(newCap));
                                                }}
                                                className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={(event) => { event.stopPropagation(); handleDeleteClass(cls.id); }}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-900 mb-1">{cls.name} - Section {cls.section}</h3>
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-1.5 mb-6">
                                        <Users size={14} /> {cls.currentEnrollment} / {cls.maximumCapacity} Enrolled
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className={isFull ? 'text-red-500' : 'text-gray-400'}>{isFull ? 'FULL CAPACITY' : 'Available'}</span>
                                            <span className="text-gray-900">{percent}% Full</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isFull && (
                                    <div className="px-6 py-3 bg-red-50 text-red-600 flex items-center gap-2 border-t border-red-100">
                                        <AlertTriangle size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">No vacancy for 2026-27</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">New Class Configuration</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8">Define name, section and student limit.</p>

                            <form onSubmit={handleCreateClass} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Class 10"
                                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                                        value={newClass.name}
                                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="A"
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                                            value={newClass.section}
                                            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capacity</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                                            value={newClass.maximumCapacity}
                                            onChange={(e) => setNewClass({ ...newClass, maximumCapacity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3.5 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                                    >
                                        Setup Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
