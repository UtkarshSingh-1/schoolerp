import React, { useState, useEffect } from 'react';
import { Search, History, User, Activity, Clock, Info } from 'lucide-react';
import api from '../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            const res = await api.get('/audit');
            setLogs(res.data);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performed_by?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-green-50 text-green-600 border-green-100';
            case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'DELETE': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Engine</h1>
                    <p className="text-slate-500 mt-2 font-medium">Immutable transparency for all administrative actions across the platform.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Filter by resource, action, or user..."
                        className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-huge border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Activity</th>
                                <th className="px-8 py-5">Performed By</th>
                                <th className="px-8 py-5">Resource</th>
                                <th className="px-8 py-5">Metadata</th>
                                <th className="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${getActionColor(log.action)}`}>
                                                <Activity size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{log.action}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">Operation</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{log.performed_by}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{log.ip_address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg w-fit uppercase tracking-wider">
                                                {log.resource}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold font-mono truncate max-w-[120px]">
                                                {log.resource_id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="max-w-[200px] truncate text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
                                            {JSON.stringify(log.payload)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                                                <Clock size={12} className="text-slate-400" />
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && filteredLogs.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Info size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold">No matching audit logs found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
