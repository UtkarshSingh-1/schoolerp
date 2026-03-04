import React from 'react';
import api, { financeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Download, Plus, CreditCard, CheckCircle2, History, ArrowRight, Calendar, Search } from 'lucide-react';
const Fees = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [transactions, setTransactions] = React.useState([]);
    const [myFees, setMyFees] = React.useState([]);

    const isFinanceStaff = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'].includes(user?.role);
    const isStudentOrParent = ['STUDENT', 'PARENT'].includes(user?.role);

    const fetchData = async () => {
        try {
            if (isFinanceStaff) {
                const res = await financeApi.getTransactions();
                setTransactions(res.data);
            }
            if (isStudentOrParent) {
                const res = await financeApi.getStudentFees(user.id);
                setMyFees(res.data);
            }
        } catch (err) {
            showToast('Failed to load financial data', 'error');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user?.id) fetchData();
    }, [user?.id]);

    const feeSummary = [
        { title: 'Total Collected', value: '$45,200', sub: '+12% this month', color: 'green', icon: <CheckCircle2 size={24} /> },
        { title: 'Pending Dues', value: '$8,400', sub: '24 students pending', color: 'red', icon: <History size={24} /> },
        { title: 'Expected Revenue', value: '$120,000', sub: 'For current term', color: 'blue', icon: <CreditCard size={24} /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isFinanceStaff ? 'Finance & Fee Control' : 'My Fees & Payments'}</h1>
                    <p className="text-gray-500 text-sm">
                        {isFinanceStaff ? 'Monitor revenue, process payments, and manage fee structures.' : 'View your current dues, structure, and payment history.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {isFinanceStaff && (
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm">
                            <Download size={16} /> Export Report
                        </button>
                    )}
                    {isFinanceStaff && (
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                            <Plus size={16} /> Collect New Fee
                        </button>
                    )}
                    {isStudentOrParent && (
                        <button className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2">
                            <CreditCard size={18} /> Pay Online Now
                        </button>
                    )}
                </div>
            </div>

            {isFinanceStaff && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {feeSummary.map((stat, i) => (
                        <div key={i} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5`}>
                            <div className={`p-4 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                <p className={`text-xs mt-1 ${stat.color === 'red' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{stat.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isStudentOrParent && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm bg-blue-50/30">
                        <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Outstanding Due</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">$1,350</h3>
                        <p className="text-gray-400 text-[10px] mt-2 font-medium">Next due: Feb 28, 2026</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Paid (YTD)</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">$1,500</h3>
                        <p className="text-green-600 text-[10px] mt-2 font-bold flex items-center gap-1">
                            <CheckCircle2 size={10} /> 100% On-time
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">{isFinanceStaff ? 'Recent Transactions' : 'Billing Details & History'}</h2>
                            {isFinanceStaff && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" placeholder="Search SID or Name..." className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-gray-50 border-y border-gray-100">
                                    <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                        {isFinanceStaff ? (
                                            <>
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-center">Ledger Proof</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4">Fee Description</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Due Date / Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isFinanceStaff ? (
                                        transactions.map((p) => (
                                            <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors`}>
                                                <td className="px-6 py-4 text-xs font-mono text-gray-400">#TRX-{p.id.slice(0, 8)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{p.type}</span>
                                                        <span className="text-[10px] text-gray-400">Date: {new Date(p.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">${p.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-[11px] font-bold ${p.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {p.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <History size={12} />}
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-1 group shadow-sm">
                                                            <History size={10} className="text-indigo-400 group-hover:text-indigo-600" /> VIEW AUDIT
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        myFees.map((f, i) => (
                                            <tr key={f.id || i} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">{f.feeStructure?.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">${f.feeStructure?.amount}</span>
                                                    <p className="text-[10px] text-gray-400">Paid: ${f.paidAmount}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${f.isFullyPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {f.isFullyPaid ? 'PAID' : `DUE: ${new Date(f.dueDate).toLocaleDateString()}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!f.isFullyPaid && (
                                                        <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1 justify-end ml-auto">
                                                            Pay <ArrowRight size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {isFinanceStaff && (
                            <button className="w-full py-4 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all border-t border-gray-100">
                                Show All Transactions
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {isFinanceStaff ? (
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                            <h3 className="font-bold text-lg mb-2">Configure Fee Structure</h3>
                            <p className="text-blue-100 text-xs mb-6 opacity-80 leading-relaxed">
                                Set up or modify fee heads for various classes and categories.
                            </p>
                            <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                                Go to Settings
                            </button>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                            <h3 className="font-bold text-lg mb-2">Download Receipts</h3>
                            <p className="text-blue-100 text-xs mb-6 opacity-80 leading-relaxed">
                                Get official payment confirmations for your tuition and activity fees.
                            </p>
                            <button className="w-full py-2.5 bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-xl font-bold text-sm hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                                <Download size={18} /> View All Receipts
                            </button>
                        </div>
                    )}

                    {isFinanceStaff && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" /> Payment Reminders
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Bulk Email Defaulters', count: '142', color: 'red' },
                                    { label: 'SMS Alerts', count: '85', color: 'amber' },
                                ].map((rem, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 group hover:bg-gray-100 transition-all cursor-pointer">
                                        <span className="text-xs font-bold text-gray-600">{rem.label}</span>
                                        <span className={`px-2 py-0.5 rounded-lg ${rem.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} text-[10px] font-bold`}>
                                            {rem.count} Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Fees;
