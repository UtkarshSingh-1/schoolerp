import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api, { financeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Users,
    Wallet,
    Calendar,
    ArrowUpRight,
    Search,
    Download,
    History,
    FileText,
    TrendingUp,
    Clock
} from 'lucide-react';

const Payroll = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            // In v3, we fetch by staffId. For demo, we use the logged-in user id
            const res = await financeApi.getStaffPayroll(user.id);
            setHistory(res.data);
        } catch (err) {
            console.error('Error fetching payroll history:', err);
            showToast('Failed to load payroll records', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchHistory();
    }, [user?.id]);

    const handleRunPayroll = async () => {
        if (!window.confirm('Are you sure you want to run payroll for the current month?')) return;

        try {
            setLoading(true);
            const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
            await financeApi.processPayroll(currentMonth);
            showToast('Monthly payroll executed successfully! 💳');
            fetchHistory();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error executing payroll', 'error');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total Staff', value: '42', icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Paid', value: '₹4.2L', icon: <Wallet size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending', value: '₹0', icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Efficiency', value: '98%', icon: <TrendingUp size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Payroll & HR</h1>
                    <p className="text-slate-500 font-medium tracking-wide">Automated salary disbursement and financial history.</p>
                </div>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN') && (
                    <button
                        onClick={handleRunPayroll}
                        disabled={loading}
                        className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Wallet size={18} />
                        Run Monthly Payroll
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <History size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Salary History</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30 text-slate-400 text-xs font-black uppercase tracking-widest">
                                <th className="px-8 py-5">Staff Name</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5">Month</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-bold text-sm">Processing financial data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium">
                                        No payroll records found for the selection.
                                    </td>
                                </tr>
                            ) : history.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                                {record.staff_name?.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900">{record.staff_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm text-slate-500 font-medium">{record.role || 'Staff'}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Calendar size={14} className="text-slate-400" />
                                            {record.month}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-slate-900">₹{record.amount?.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit text-xs font-black uppercase tracking-tighter">
                                            <ArrowUpRight size={12} />
                                            Processed
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {history.length} records</p>
                    <div className="flex gap-2 text-xs font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline items-center">
                        <FileText size={14} />
                        Export Full Financial Ledger
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
