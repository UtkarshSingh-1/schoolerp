import React, { useState, useEffect } from 'react';
import { Bus, Home, Clock, CheckCircle, XCircle, Send, Loader2, Info } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const StudentServices = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [serviceType, setServiceType] = useState('TRANSPORT');
    const [details, setDetails] = useState({ route_id: '', hostel_id: '', room_id: '', remarks: '' });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const [reqRes, routesRes, hostelsRes] = await Promise.all([
                    api.get('/requests'),
                    api.get('/transport/routes'),
                    api.get('/hostel/available')
                ]);
                setRequests(reqRes.data);
                setRoutes(routesRes.data);
                setHostels(hostelsRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const requestData = {
                serviceType,
                requestDetails: serviceType === 'TRANSPORT'
                    ? { route_id: details.route_id }
                    : { room_id: details.room_id, hostel_id: details.hostel_id }
            };
            await api.post('/requests/apply', requestData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Refresh requests
            const reqRes = await api.get('/requests');
            setRequests(reqRes.data);
            setDetails({ route_id: '', hostel_id: '', room_id: '', remarks: '' });
        } catch (err) {
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} className="text-amber-500" />;
            case 'APPROVED': return <CheckCircle size={16} className="text-green-500" />;
            case 'REJECTED': return <XCircle size={16} className="text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 text-premium">Service Applications</h1>
                <p className="text-gray-500">Apply for Transport or Hostel services and track your request status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Application Form */}
                <div className="bg-white rounded-3xl shadow-huge border border-gray-100 p-8 space-y-6 self-start">
                    <div className="flex items-center gap-4 p-1 bg-slate-50 rounded-2xl">
                        <button
                            onClick={() => setServiceType('TRANSPORT')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${serviceType === 'TRANSPORT' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Bus size={18} /> Transport
                        </button>
                        <button
                            onClick={() => setServiceType('HOSTEL')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${serviceType === 'HOSTEL' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Home size={18} /> Hostel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {serviceType === 'TRANSPORT' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Preferred Route</label>
                                    <select
                                        required
                                        value={details.route_id}
                                        onChange={(e) => setDetails({ ...details, route_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select Route...</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.route_name} (₹{r.monthly_cost}/mo)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Hostel Block</label>
                                    <select
                                        required
                                        value={details.hostel_id}
                                        onChange={(e) => setDetails({ ...details, hostel_id: e.target.value, room_id: '' })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select Hostel...</option>
                                        {hostels.map(h => (
                                            <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
                                        ))}
                                    </select>
                                </div>
                                {details.hostel_id && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Preferred Room</label>
                                        <select
                                            required
                                            value={details.room_id}
                                            onChange={(e) => setDetails({ ...details, room_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select Room...</option>
                                            {hostels.find(h => h.id == details.hostel_id)?.rooms.map(r => (
                                                <option key={r.id} value={r.id} disabled={r.occupancy >= r.capacity}>
                                                    Room {r.room_no} (₹{r.monthly_rent}/mo) {r.occupancy >= r.capacity ? '- FULL' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            disabled={submitting}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Submit Application
                        </button>
                    </form>
                </div>

                {/* Status Timeline */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">My Requests</h3>
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <Info className="mx-auto text-gray-300 mb-4" size={32} />
                                <p className="text-gray-500 text-sm italic">No active service requests.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${req.service_type === 'TRANSPORT' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                        {req.service_type === 'TRANSPORT' ? <Bus size={24} /> : <Home size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{req.service_type} Request</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Submitted on {new Date(req.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                                                {getStatusIcon(req.status)}
                                                <span className="text-[10px] font-black uppercase text-gray-600">{req.status}</span>
                                            </div>
                                        </div>
                                        {req.admin_comment && (
                                            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border-l-4 border-slate-300 italic">
                                                "{req.admin_comment}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentServices;
