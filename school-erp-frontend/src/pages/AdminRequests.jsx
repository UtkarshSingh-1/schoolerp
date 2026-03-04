import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Bus, Home, Loader2, Search } from 'lucide-react';
import api from '../services/api';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests/all');
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, status) => {
        const comment = status === 'APPROVED' ? 'Approved by admin' : 'Rejected after review';
        try {
            await api.put(`/requests/${requestId}`, {
                status,
                adminComment: comment
            });
            fetchRequests();
        } catch (err) {
            alert('Failed to update request');
        }
    };

    const filteredRequests = requests.filter(r => r.status === filter);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 text-premium">Service Approval Pipeline</h1>
                <p className="text-gray-500">Review and manage student applications for Transport and Hostel services.</p>
            </div>

            <div className="flex gap-4 p-1 bg-white inline-flex rounded-2xl shadow-sm border border-gray-100">
                {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === s ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Requested On</th>
                                {filter === 'PENDING' && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.service_type === 'TRANSPORT' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                {req.service_type === 'TRANSPORT' ? <Bus size={20} /> : <Home size={20} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {req.first_name[0]}{req.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{req.first_name} {req.last_name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{req.student_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs text-gray-600 space-y-1">
                                            {req.service_type === 'TRANSPORT' ? (
                                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-bold">Route ID: {req.request_details.route_id}</span>
                                            ) : (
                                                <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-lg font-bold">Room ID: {req.request_details.room_id}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    {filter === 'PENDING' && (
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, 'APPROVED')}
                                                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 border border-green-100 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'REJECTED')}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRequests.length === 0 && (
                        <div className="p-12 text-center text-gray-400 italic text-sm">
                            No {filter.toLowerCase()} requests found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRequests;
