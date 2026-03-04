import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Users, Shield, Search, Mail, Phone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { staffApi } from '../services/api';

const StaffManagement = () => {
    const { user } = useAuth();
    const [staff, setStaff] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        role: 'TEACHER',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        aadhaarNumber: '',
        qualification: '',
        address: '',
        emergencyContact: '',
        joiningDate: ''
    });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await staffApi.list();
            const transformed = (res.data || []).map((s) => ({
                id: s.id,
                employeeId: s.employee_id,
                name: s.full_name,
                role: (s.role || 'STAFF').toUpperCase(),
                email: s.email,
                phone: s.phone || '-',
                status: s.is_active ? 'Active' : 'Inactive'
            }));
            setStaff(transformed);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const filteredStaff = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return staff;
        return staff.filter((s) =>
            [s.name, s.email, s.phone, s.employeeId, s.role].some((v) => (v || '').toLowerCase().includes(q))
        );
    }, [staff, search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await staffApi.create(form);
            alert('Staff account created. Credentials sent to email.');
            setShowAddModal(false);
            setForm({
                role: 'TEACHER',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                gender: '',
                dateOfBirth: '',
                aadhaarNumber: '',
                qualification: '',
                address: '',
                emergencyContact: '',
                joiningDate: ''
            });
            fetchStaff();
        } catch (err) {
            alert('Error creating staff: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff & HR Management</h1>
                    <p className="text-gray-500 text-sm">Manage educational staff, teachers, and administrative personnel.</p>
                </div>
                {(['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role)) && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <UserPlus size={18} /> Add New Staff
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Staff', value: staff.length, icon: <Users className="text-blue-600" /> },
                    { label: 'Active Teachers', value: staff.filter(s => s.role === 'TEACHER').length, icon: <Shield className="text-green-600" /> },
                    { label: 'Admin Staff', value: staff.filter(s => ['ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(s.role)).length, icon: <Shield className="text-purple-600" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search staff by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <th className="px-6 py-4">Name & Department</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStaff.length > 0 ? filteredStaff.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                                    {s.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{s.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{s.employeeId || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Mail size={12} />
                                                    <span className="text-xs">{s.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Phone size={12} />
                                                    <span className="text-xs">{s.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.role === 'TEACHER' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                }`}>
                                                {s.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${s.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                <span className="text-xs font-bold text-gray-700">{s.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs text-gray-400">-</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No staff members found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Add Staff Member</h2>
                                <p className="text-sm text-gray-500">Choose role first, then fill profile. Login credentials will be emailed.</p>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Role *</label>
                                    <select name="role" value={form.role} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <option value="TEACHER">Teacher</option>
                                        <option value="STAFF">Staff</option>
                                        <option value="ACCOUNTANT">Accountant</option>
                                        <option value="PRINCIPAL">Principal</option>
                                        <option value="SCHOOL_ADMIN">School Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">First Name *</label>
                                    <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Last Name *</label>
                                    <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Email *</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Phone</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Emergency Contact</label>
                                    <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Gender</label>
                                    <select name="gender" value={form.gender} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">DOB</label>
                                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Joining Date</label>
                                    <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Aadhaar Number</label>
                                    <input name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600">Qualification</label>
                                    <input name="qualification" value={form.qualification} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-600">Address</label>
                                <textarea rows="2" name="address" value={form.address} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200" />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Create Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
