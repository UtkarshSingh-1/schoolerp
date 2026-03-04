import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, Loader2, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { classApi, studentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Students = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [classId, setClassId] = useState(searchParams.get('classId') || '');
  const [totalResults, setTotalResults] = useState(0);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsApi.list({
        page,
        limit: 50,
        search: search || undefined,
        classId: classId || undefined
      });
      const rows = res.data?.students || [];
      const pagination = res.data?.pagination || { total: rows.length, pages: 1 };
      setStudents(rows.map((s) => ({
        ...s,
        admissionNumber: s.admission_no || s.student_id,
        fullName: s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        parentContact: s.mobile_number || s.parent_contact || s.email || '',
        passportPhoto: s.passport_photo || null
      })));
      setTotalResults(pagination.total || rows.length);
      setTotalPages(Math.max(1, pagination.pages || 1));
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classApi.list();
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
      const q = {};
      if (search) q.q = search;
      if (classId) q.classId = classId;
      setSearchParams(q, { replace: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [page, search, classId]);

  const canManage = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(user?.role);

  const handleEdit = async (student) => {
    const fullName = prompt('Full Name:', student.fullName || '');
    if (!fullName) return;
    const mobileNumber = prompt('Phone Number:', student.parentContact || '');
    const email = prompt('Email (optional):', student.email || '');
    try {
      await studentsApi.update(student.id, { fullName, mobileNumber, email, classId: classId || undefined });
      showToast('Student updated successfully', 'success');
      fetchStudents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update student', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-premium">Student Directory</h1>
          <p className="text-gray-500 text-sm">Manage {totalResults.toLocaleString()} registered students.</p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate('/admission')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            + Add New Student
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, student ID, phone, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <select
          value={classId}
          onChange={(e) => { setClassId(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 border-b border-gray-100">Student ID</th>
                <th className="px-6 py-4 border-b border-gray-100">Full Name</th>
                <th className="px-6 py-4 border-b border-gray-100">Class</th>
                <th className="px-6 py-4 border-b border-gray-100">Phone / Email</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length > 0 ? students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-blue-600 font-mono tracking-tighter">{s.admissionNumber || s.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm overflow-hidden">
                        {s.passportPhoto ? (
                          <img src={s.passportPhoto} alt={s.fullName || 'Student'} className="w-9 h-9 rounded-xl object-cover" />
                        ) : ((s.fullName || s.first_name || '')[0] || 'S')}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{s.fullName || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{s.class ? `${s.class}${s.section ? ` - ${s.section}` : ''}` : 'Standard'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.parentContact || s.email || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <Link to={`/students/${s.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></Link>
                      <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                      <button className="p-2 text-gray-300 rounded-lg transition-all cursor-not-allowed" title="Delete not enabled"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-medium">No students found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Showing {students.length} of {totalResults}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 text-gray-400 hover:text-gray-900 transition-all border border-gray-200 rounded-lg bg-white disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-black px-4">PAGE {page} / {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 text-gray-400 hover:text-gray-900 transition-all border border-gray-200 rounded-lg bg-white disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
