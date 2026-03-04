import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import api from '../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-sm font-bold text-gray-500">Loading student profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8 space-y-4">
        <button onClick={() => navigate('/students')} className="text-sm font-bold text-blue-600">
          <ArrowLeft size={16} className="inline mr-1" /> Back to students
        </button>
        <div className="text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  const fullName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim();
  const avatar = student?.passport_photo;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/students')} className="text-sm font-bold text-blue-600">
        <ArrowLeft size={16} className="inline mr-1" /> Back to students
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
            {avatar ? <img src={avatar} alt={fullName} className="w-full h-full object-cover" /> : <User className="text-slate-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Student'}</h1>
            <p className="text-sm text-gray-500">Admission No: {student?.admission_no || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold text-gray-700">Class:</span> {student?.class || '-'}</div>
          <div><span className="font-semibold text-gray-700">Section:</span> {student?.section || '-'}</div>
          <div><span className="font-semibold text-gray-700">Date of Birth:</span> {student?.date_of_birth || '-'}</div>
          <div><span className="font-semibold text-gray-700">Gender:</span> {student?.gender || '-'}</div>
          <div><span className="font-semibold text-gray-700">Blood Group:</span> {student?.blood_group || '-'}</div>
          <div><span className="font-semibold text-gray-700">Category:</span> {student?.category || '-'}</div>
          <div><span className="font-semibold text-gray-700">Aadhaar:</span> {student?.aadhaar_number || '-'}</div>
          <div><span className="font-semibold text-gray-700">Nationality:</span> {student?.nationality || '-'}</div>
          <div><span className="font-semibold text-gray-700">Religion:</span> {student?.religion || '-'}</div>
          <div><span className="font-semibold text-gray-700">Address:</span> {student?.residential_address || '-'}</div>
          <div className="flex items-center gap-2"><Phone size={14} /> {student?.mobile_number || student?.parent_contact || '-'}</div>
          <div className="flex items-center gap-2"><Mail size={14} /> {student?.email || '-'}</div>
          <div><span className="font-semibold text-gray-700">Father:</span> {student?.father_name || '-'}</div>
          <div><span className="font-semibold text-gray-700">Mother:</span> {student?.mother_name || '-'}</div>
          <div><span className="font-semibold text-gray-700">Emergency Contact:</span> {student?.emergency_contact_number || '-'}</div>
          <div><span className="font-semibold text-gray-700">Medical History:</span> {student?.medical_history || '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
