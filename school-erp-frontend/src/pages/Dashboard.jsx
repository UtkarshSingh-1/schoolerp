import React from 'react';
import {
    Users,
    UserPlus,
    CalendarCheck,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    GraduationCap,
    Wallet,
    CreditCard,
    ShieldCheck,
    Zap,
    Activity
} from 'lucide-react';

import { useNavigate, Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, sub, icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                {icon}
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1`}>
                    <TrendingUp size={12} /> {trend}
                </span>
            )}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = React.useState({ students: 0, monthlyRevenue: 0, monthlyExpense: 0, attendanceToday: 0 });
    const [recentAdmissions, setRecentAdmissions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [mRes, aRes] = await Promise.all([
                dashboardApi.getMetrics(),
                dashboardApi.getRecentAdmissions()
            ]);
            setMetrics(mRes.data);
            setRecentAdmissions(aRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const allowedAnalytics = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'TEACHER'];
        if (allowedAnalytics.includes(user?.role)) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const stats = [
        { title: 'Total Students', value: (metrics.students || 0).toLocaleString(), sub: 'Active in 2026', icon: <Users size={24} />, color: 'blue', trend: '+5%' },
        { title: 'Revenue (Monthly)', value: `₹${(metrics.monthlyRevenue || 0).toLocaleString()}`, sub: 'Audit-Proofed', icon: <Wallet size={24} />, color: 'purple' },
        { title: 'System Resilience', value: '99.99%', sub: 'Fail-safe Config', icon: <Activity size={24} />, color: 'green' },
        { title: 'Security Guard', value: 'ACTIVE', sub: 'Zero-Trust Enabled', icon: <ShieldCheck size={24} />, color: 'indigo' },
    ];



    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Institutional Overview</h1>
                    <p className="text-gray-500 text-sm">Welcome back, {user?.role?.replace('_', ' ')}. Enterprise modules are standing by.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 shadow-sm animate-pulse">
                    <Zap size={16} className="fill-current" />
                    <span className="text-xs font-black uppercase tracking-widest">System Health: UP</span>
                </div>
            </div>

            {(user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL' || user?.role === 'ACCOUNTANT') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Admissions - Restricted to Admins/Principals */}
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL') ? (
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Recent Student Admissions</h2>
                            <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                                View all <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4">Applied Class</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentAdmissions.length > 0 ? recentAdmissions.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                        {item.name?.charAt(0) || 'A'}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.class}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'APPROVED' || item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'PENDING' || item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No recent admissions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-2 bg-white p-12 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <GraduationCap size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Welcome to St. Xavier's</h2>
                        <p className="text-gray-500 max-w-sm mt-2 font-medium">
                            Use the sidebar to access your personalized modules and track academic progress.
                        </p>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-6">Quick Management</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Register New Student', icon: <UserPlus size={18} />, sub: 'Admission Module', color: 'blue', path: '/admission', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'] },
                            { label: 'Bulk Record Attendance', icon: <CalendarCheck size={18} />, sub: 'Academic Control', color: 'green', path: '/attendance', roles: ['TEACHER'] },
                            { label: 'Manage All Students', icon: <Users size={18} />, sub: 'SIS Directory', color: 'purple', path: '/students', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
                            { label: 'Generate Fee Vouchers', icon: <CreditCard size={18} />, sub: 'Accounts', color: 'red', path: '/fees', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'] },
                        ].filter(a => a.roles.includes(user?.role)).map((action, i) => (
                            <Link to={action.path} key={i} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group">
                                <div className={`p-3 rounded-lg bg-${action.color}-50 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{action.label}</p>
                                    <p className="text-xs text-gray-400">{action.sub}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
