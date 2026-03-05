import React from 'react';
import { classApi, financeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CreditCard, Printer, Download } from 'lucide-react';

const inr = (v) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
}).format(Number(v || 0));

const Fees = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const isFinanceStaff = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'].includes(user?.role);
    const isStudentOrParent = ['STUDENT', 'PARENT'].includes(user?.role);

    const [classes, setClasses] = React.useState([]);
    const [settings, setSettings] = React.useState([]);
    const [transactions, setTransactions] = React.useState([]);
    const [myFees, setMyFees] = React.useState(null);
    const [parentStudentId, setParentStudentId] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    const [configForm, setConfigForm] = React.useState({
        classId: '',
        admissionFee: '',
        monthlyFee: ''
    });

    const [payForm, setPayForm] = React.useState({
        studentId: '',
        feeType: 'TUITION',
        paymentPlan: 'MONTHLY',
        monthsCount: 1,
        amount: '',
        paymentMode: 'UPI',
        remarks: ''
    });

    const tuitionAmountSuggestion = React.useMemo(() => {
        const monthly = Number(myFees?.feePlan?.monthlyFee || 0);
        if (!monthly || payForm.feeType !== 'TUITION') return 0;
        if (payForm.paymentPlan === 'YEARLY') return monthly * 12;
        if (payForm.paymentPlan === 'QUARTERLY') return monthly * 3;
        if (payForm.paymentPlan === 'MONTHLY') return monthly;
        return monthly * Number(payForm.monthsCount || 1);
    }, [myFees?.feePlan?.monthlyFee, payForm.feeType, payForm.paymentPlan, payForm.monthsCount]);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            if (isFinanceStaff) {
                const [clsRes, setRes, txRes] = await Promise.all([
                    classApi.list(),
                    financeApi.getFeeSettings(),
                    financeApi.getTransactions()
                ]);
                setClasses(clsRes.data || []);
                setSettings(setRes.data || []);
                setTransactions(txRes.data || []);
                if ((clsRes.data || [])[0]) {
                    setConfigForm((prev) => ({ ...prev, classId: prev.classId || clsRes.data[0].id }));
                }
            }

            if (isStudentOrParent) {
                const params = user?.role === 'PARENT' && parentStudentId ? { studentId: parentStudentId } : undefined;
                if (user?.role === 'STUDENT' || parentStudentId) {
                    const myRes = await financeApi.getMyFees(params);
                    setMyFees(myRes.data);
                }
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to load fee data', 'error');
        } finally {
            setLoading(false);
        }
    }, [isFinanceStaff, isStudentOrParent, parentStudentId, showToast, user?.role]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const saveSetting = async (e) => {
        e.preventDefault();
        try {
            await financeApi.saveFeeSetting({
                classId: configForm.classId,
                admissionFee: Number(configForm.admissionFee || 0),
                monthlyFee: Number(configForm.monthlyFee || 0)
            });
            showToast('Class fee settings saved');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Unable to save fee settings', 'error');
        }
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        try {
            await financeApi.payFee({
                studentId: payForm.studentId || undefined,
                feeType: payForm.feeType,
                paymentPlan: payForm.paymentPlan,
                monthsCount: Number(payForm.monthsCount || 1),
                amount: payForm.amount ? Number(payForm.amount) : undefined,
                paymentMode: payForm.paymentMode,
                remarks: payForm.remarks
            });
            showToast('Payment recorded successfully');
            setPayForm((prev) => ({ ...prev, amount: '', remarks: '' }));
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Payment failed', 'error');
        }
    };

    const openInvoice = async (transactionId, mode = 'print') => {
        try {
            const res = await financeApi.getInvoice(transactionId);
            const inv = res.data;
            const html = `
                <html>
                <head><title>${inv.invoiceNo}</title></head>
                <body style="font-family: Arial, sans-serif; padding: 24px;">
                    <h2>Fee Invoice - ${inv.invoiceNo}</h2>
                    <p><b>Date:</b> ${new Date(inv.date).toLocaleString()}</p>
                    <p><b>Student:</b> ${inv.student.name} (${inv.student.admissionNo})</p>
                    <p><b>Class:</b> ${inv.student.className || '-'} ${inv.student.section || ''}</p>
                    <p><b>Fee Type:</b> ${inv.feeType}</p>
                    <p><b>Plan:</b> ${inv.paymentPlan || 'CUSTOM'} ${inv.monthsCount ? `(${inv.monthsCount} month(s))` : ''}</p>
                    <p><b>Amount:</b> ${inr(inv.amount)}</p>
                    <p><b>Payment Method:</b> ${inv.paymentMethod}</p>
                    <p><b>Status:</b> ${inv.status}</p>
                </body>
                </html>`;

            const w = window.open('', '_blank');
            if (!w) return;
            w.document.open();
            w.document.write(html);
            w.document.close();
            if (mode === 'print') w.print();
            if (mode === 'download') {
                const blob = new Blob([html], { type: 'text/html' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${inv.invoiceNo}.html`;
                a.click();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Unable to load invoice', 'error');
        }
    };

    if (loading) return <div className="py-12 text-center text-gray-500">Loading fee data...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Fee Management (INR)</h1>
                <p className="text-sm text-gray-500">Monthly, quarterly, yearly or custom-month fee payment with receipts.</p>
            </div>

            {isFinanceStaff && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onSubmit={saveSetting} className="bg-white border rounded-2xl p-5 space-y-3">
                        <h2 className="font-bold text-gray-900">Class-wise Fee Settings</h2>
                        <select value={configForm.classId} onChange={(e) => setConfigForm((p) => ({ ...p, classId: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                        </select>
                        <input type="number" min="0" placeholder="Admission Fee (INR)" value={configForm.admissionFee} onChange={(e) => setConfigForm((p) => ({ ...p, admissionFee: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                        <input type="number" min="0" placeholder="Monthly Fee (INR)" value={configForm.monthlyFee} onChange={(e) => setConfigForm((p) => ({ ...p, monthlyFee: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Save Fees</button>
                    </form>

                    <form onSubmit={submitPayment} className="bg-white border rounded-2xl p-5 space-y-3">
                        <h2 className="font-bold text-gray-900">Record / Collect Fee</h2>
                        <input placeholder="Student ID (UUID)" value={payForm.studentId} onChange={(e) => setPayForm((p) => ({ ...p, studentId: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                        <select value={payForm.feeType} onChange={(e) => setPayForm((p) => ({ ...p, feeType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                            <option value="ADMISSION">Admission Fee</option>
                            <option value="TUITION">Tuition Fee</option>
                            <option value="TRANSPORT">Transport Fee</option>
                            <option value="HOSTEL">Hostel Fee</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <select value={payForm.paymentPlan} onChange={(e) => setPayForm((p) => ({ ...p, paymentPlan: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="CUSTOM">Custom months</option>
                        </select>
                        {payForm.paymentPlan === 'CUSTOM' && <input type="number" min="1" max="12" placeholder="Months count (1-12)" value={payForm.monthsCount} onChange={(e) => setPayForm((p) => ({ ...p, monthsCount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />}
                        <input type="number" min="0" placeholder="Amount (optional; auto if blank)" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                        <select value={payForm.paymentMode} onChange={(e) => setPayForm((p) => ({ ...p, paymentMode: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                            <option value="CASH">CASH</option><option value="UPI">UPI</option><option value="CARD">CARD</option><option value="NETBANKING">NETBANKING</option>
                        </select>
                        <input placeholder="Remarks" value={payForm.remarks} onChange={(e) => setPayForm((p) => ({ ...p, remarks: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2"><CreditCard size={16} /> Submit Payment</button>
                    </form>
                </div>
            )}

            {!isFinanceStaff && (
                <div className="bg-white border rounded-2xl p-5 space-y-3">
                    <h2 className="font-bold text-gray-900">Pay Fee</h2>
                    {user?.role === 'PARENT' && (
                        <div className="flex gap-2">
                            <input placeholder="Student ID" value={parentStudentId} onChange={(e) => { setParentStudentId(e.target.value); setPayForm((p) => ({ ...p, studentId: e.target.value })); }} className="px-3 py-2 border rounded-lg text-sm" />
                            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold" onClick={fetchData}>Load</button>
                        </div>
                    )}
                    <select value={payForm.feeType} onChange={(e) => setPayForm((p) => ({ ...p, feeType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="ADMISSION">Admission Fee</option>
                        <option value="TUITION">Tuition Fee</option>
                        <option value="OTHER">Other</option>
                    </select>
                    <select value={payForm.paymentPlan} onChange={(e) => setPayForm((p) => ({ ...p, paymentPlan: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="CUSTOM">Custom months</option>
                    </select>
                    {payForm.paymentPlan === 'CUSTOM' && <input type="number" min="1" max="12" placeholder="Months count" value={payForm.monthsCount} onChange={(e) => setPayForm((p) => ({ ...p, monthsCount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />}
                    <input type="number" min="0" placeholder="Amount (optional; auto if blank)" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    {payForm.feeType === 'TUITION' && tuitionAmountSuggestion > 0 && <p className="text-xs text-blue-700">Suggested tuition amount: {inr(tuitionAmountSuggestion)}</p>}
                    <select value={payForm.paymentMode} onChange={(e) => setPayForm((p) => ({ ...p, paymentMode: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="UPI">UPI</option><option value="CARD">CARD</option><option value="NETBANKING">NETBANKING</option><option value="CASH">CASH</option>
                    </select>
                    <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2" onClick={submitPayment}><CreditCard size={14} /> Pay Now</button>
                </div>
            )}

            {isFinanceStaff && (
                <div className="bg-white border rounded-2xl p-5">
                    <h2 className="font-bold text-gray-900 mb-3">Configured Class Admission Fees</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500"><tr><th className="py-2">Class</th><th className="py-2">Admission Fee</th><th className="py-2">Monthly Fee</th></tr></thead>
                            <tbody>{settings.map((s) => <tr key={s.class_id} className="border-t"><td className="py-2">{s.class_name} - {s.section}</td><td className="py-2 font-semibold">{inr(s.admission_fee)}</td><td className="py-2">{inr(s.monthly_fee)}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white border rounded-2xl p-5">
                <h2 className="font-bold text-gray-900 mb-3">{isFinanceStaff ? 'Fee Transactions' : 'My Fee Summary'}</h2>
                {isFinanceStaff ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500"><tr><th className="py-2">Student</th><th className="py-2">Fee Type</th><th className="py-2">Plan</th><th className="py-2">Amount</th><th className="py-2">Mode</th><th className="py-2">Date</th><th className="py-2">Invoice</th></tr></thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id} className="border-t">
                                        <td className="py-2">{t.student_name || '-'} ({t.admission_no || '-'})</td>
                                        <td className="py-2">{t.metadata?.feeType || 'OTHER'}</td>
                                        <td className="py-2">{t.metadata?.paymentPlan || 'CUSTOM'} {t.metadata?.monthsCount ? `(${t.metadata.monthsCount}m)` : ''}</td>
                                        <td className="py-2 font-semibold">{inr(t.amount)}</td>
                                        <td className="py-2">{t.payment_method}</td>
                                        <td className="py-2">{new Date(t.created_at).toLocaleString()}</td>
                                        <td className="py-2">
                                            <div className="flex gap-2">
                                                <button className="px-2 py-1 border rounded text-xs" onClick={() => openInvoice(t.id, 'print')}><Printer size={12} className="inline mr-1" />Print</button>
                                                <button className="px-2 py-1 border rounded text-xs" onClick={() => openInvoice(t.id, 'download')}><Download size={12} className="inline mr-1" />Download</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {!myFees && <p className="text-sm text-gray-500">No fee record loaded yet.</p>}
                        {myFees && (
                            <>
                                <p><b>Admission Fee:</b> {inr(myFees?.feePlan?.admissionFee)}</p>
                                <p><b>Monthly Tuition:</b> {inr(myFees?.feePlan?.monthlyFee)}</p>
                                <p><b>Admission Fee Paid:</b> {inr(myFees?.paid?.admission)}</p>
                                <p><b>Admission Fee Due:</b> {inr(myFees?.due?.admission)}</p>
                                <h3 className="font-semibold pt-2">My Transactions</h3>
                                <div className="space-y-2">
                                    {(myFees?.transactions || []).map((t) => (
                                        <div key={t.id} className="border rounded-lg p-3 flex items-center justify-between">
                                            <div className="text-sm">
                                                <div className="font-semibold">{t.fee_type} - {inr(t.amount)}</div>
                                                <div className="text-gray-500">{new Date(t.created_at).toLocaleString()} | {t.payment_method}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-2 py-1 border rounded text-xs" onClick={() => openInvoice(t.id, 'print')}><Printer size={12} className="inline mr-1" />Print</button>
                                                <button className="px-2 py-1 border rounded text-xs" onClick={() => openInvoice(t.id, 'download')}><Download size={12} className="inline mr-1" />Download</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Fees;
