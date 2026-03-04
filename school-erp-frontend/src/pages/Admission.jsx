import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { admissionApi, classApi, studentsApi } from '../services/api';

const initialForm = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  bloodGroup: '',
  nationality: 'Indian',
  religion: '',
  category: '',
  aadhaarNumber: '',
  birthCertificateDetails: '',
  targetClassId: '',
  residentialAddress: '',
  city: '',
  state: '',
  pinCode: '',
  mobileNumber: '',
  email: '',
  emergencyContactNumber: '',
  fatherName: '',
  fatherOccupation: '',
  fatherQualification: '',
  fatherMobile: '',
  motherName: '',
  motherOccupation: '',
  motherQualification: '',
  motherMobile: '',
  guardianName: '',
  previousSchoolName: '',
  lastClassStudied: '',
  previousMarks: '',
  transferCertificateDetails: '',
  reportCard: '',
  transportRequirement: '',
  medicalHistory: '',
  siblingInSchool: false,
  declarationAccepted: false,
  parentSignature: '',
  birthCertificateCopy: '',
  aadhaarCopy: '',
  transferCertificateCopy: '',
  addressProof: '',
  casteCertificate: ''
};

const Admission = () => {
  const { user } = useAuth();
  const isAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(user?.role);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [classes, setClasses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(!isAdmin);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchClasses();
    if (isAdmin) fetchApplications();
  }, [isAdmin]);

  const fetchClasses = async () => {
    try {
      const res = await classApi.list();
      setClasses(res.data || []);
      if (res.data?.length) {
        setFormData((prev) => ({ ...prev, targetClassId: prev.targetClassId || res.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading classes', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await admissionApi.list();
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error loading applications', err);
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onFile = async (name, file) => {
    if (!file) return;
    const base64 = await toBase64(file);
    setFormData((prev) => ({ ...prev, [name]: base64 }));
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateMandatory = () => {
    const required = [
      'fullName',
      'gender',
      'dateOfBirth',
      'bloodGroup',
      'category',
      'aadhaarNumber',
      'targetClassId',
      'mobileNumber',
      'fatherName',
      'motherName'
    ];
    for (const key of required) {
      if (!formData[key]) return key;
    }
    if (!formData.declarationAccepted) return 'declarationAccepted';
    return null;
  };

  const buildPayload = () => ({
    ...formData,
    classId: formData.targetClassId,
    parentContact: formData.mobileNumber,
    phone: formData.mobileNumber
  });

  const submitAdmission = async () => {
    const missing = validateMandatory();
    if (missing) {
      alert(`Please fill required field: ${missing}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (isAdmin) {
        await studentsApi.create(payload);
      } else {
        await admissionApi.apply({
          applicantFullName: formData.fullName,
          email: formData.email || null,
          phone: formData.mobileNumber,
          targetClassId: formData.targetClassId,
          metadata: payload
        });
      }
      setSuccess(true);
    } catch (err) {
      console.error('Admission submit error:', err);
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reviewAdmission = async (id, status) => {
    try {
      await admissionApi.review(id, { status, remarks: 'Processed by admin' });
      fetchApplications();
    } catch (err) {
      console.error('Review failed', err);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Admission Submitted Successfully</h1>
        <p className="text-gray-600">Student details have been saved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admission Form</h1>
          <p className="text-gray-500">Fill complete student profile details for admission.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
          >
            {showForm ? 'View Applications' : '+ New Admission'}
          </button>
        )}
      </div>

      {isAdmin && !showForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold">{a.applicantFullName}</td>
                  <td className="px-4 py-3">{String(a.targetClassId).slice(0, 8)}</td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => reviewAdmission(a.id, 'APPROVED')} className="px-3 py-1 rounded bg-green-100 text-green-700 text-sm font-semibold">Approve</button>
                    <button onClick={() => reviewAdmission(a.id, 'REJECTED')} className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm font-semibold">Reject</button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div className="text-sm font-bold text-gray-500">Step {step} of 3</div>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="fullName" value={formData.fullName} onChange={onChange} placeholder="Full Name *" className="px-4 py-3 border rounded-xl" />
              <select name="gender" value={formData.gender} onChange={onChange} className="px-4 py-3 border rounded-xl">
                <option value="">Gender *</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={onChange} className="px-4 py-3 border rounded-xl" />
              <input name="bloodGroup" value={formData.bloodGroup} onChange={onChange} placeholder="Blood Group *" className="px-4 py-3 border rounded-xl" />
              <input name="nationality" value={formData.nationality} onChange={onChange} placeholder="Nationality" className="px-4 py-3 border rounded-xl" />
              <input name="religion" value={formData.religion} onChange={onChange} placeholder="Religion" className="px-4 py-3 border rounded-xl" />
              <select name="category" value={formData.category} onChange={onChange} className="px-4 py-3 border rounded-xl">
                <option value="">Category *</option><option>General</option><option>OBC</option><option>SC</option><option>ST</option>
              </select>
              <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={onChange} placeholder="Aadhaar Number *" className="px-4 py-3 border rounded-xl" />
              <input name="birthCertificateDetails" value={formData.birthCertificateDetails} onChange={onChange} placeholder="Birth Certificate details (Optional)" className="px-4 py-3 border rounded-xl md:col-span-2" />
              <select name="targetClassId" value={formData.targetClassId} onChange={onChange} className="px-4 py-3 border rounded-xl md:col-span-2">
                <option value="">Target Class *</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="residentialAddress" value={formData.residentialAddress} onChange={onChange} placeholder="Residential Address *" className="px-4 py-3 border rounded-xl md:col-span-2" />
              <input name="city" value={formData.city} onChange={onChange} placeholder="City *" className="px-4 py-3 border rounded-xl" />
              <input name="state" value={formData.state} onChange={onChange} placeholder="State *" className="px-4 py-3 border rounded-xl" />
              <input name="pinCode" value={formData.pinCode} onChange={onChange} placeholder="PIN Code *" className="px-4 py-3 border rounded-xl" />
              <input name="mobileNumber" value={formData.mobileNumber} onChange={onChange} placeholder="Mobile Number *" className="px-4 py-3 border rounded-xl" />
              <input name="email" value={formData.email} onChange={onChange} placeholder="Email (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={onChange} placeholder="Emergency Contact Number *" className="px-4 py-3 border rounded-xl" />
              <input name="fatherName" value={formData.fatherName} onChange={onChange} placeholder="Father Name *" className="px-4 py-3 border rounded-xl" />
              <input name="fatherOccupation" value={formData.fatherOccupation} onChange={onChange} placeholder="Father Occupation" className="px-4 py-3 border rounded-xl" />
              <input name="fatherQualification" value={formData.fatherQualification} onChange={onChange} placeholder="Father Qualification" className="px-4 py-3 border rounded-xl" />
              <input name="fatherMobile" value={formData.fatherMobile} onChange={onChange} placeholder="Father Mobile Number" className="px-4 py-3 border rounded-xl" />
              <input name="motherName" value={formData.motherName} onChange={onChange} placeholder="Mother Name *" className="px-4 py-3 border rounded-xl" />
              <input name="motherOccupation" value={formData.motherOccupation} onChange={onChange} placeholder="Mother Occupation" className="px-4 py-3 border rounded-xl" />
              <input name="motherQualification" value={formData.motherQualification} onChange={onChange} placeholder="Mother Qualification" className="px-4 py-3 border rounded-xl" />
              <input name="motherMobile" value={formData.motherMobile} onChange={onChange} placeholder="Mother Mobile Number" className="px-4 py-3 border rounded-xl" />
              <input name="guardianName" value={formData.guardianName} onChange={onChange} placeholder="Guardian Name (if applicable)" className="px-4 py-3 border rounded-xl md:col-span-2" />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="previousSchoolName" value={formData.previousSchoolName} onChange={onChange} placeholder="Previous School Name (Optional)" className="px-4 py-3 border rounded-xl md:col-span-2" />
              <input name="lastClassStudied" value={formData.lastClassStudied} onChange={onChange} placeholder="Class last studied (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="previousMarks" value={formData.previousMarks} onChange={onChange} placeholder="Marks / Grades (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="transferCertificateDetails" value={formData.transferCertificateDetails} onChange={onChange} placeholder="TC Details (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="reportCard" value={formData.reportCard} onChange={onChange} placeholder="Report Card details (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="transportRequirement" value={formData.transportRequirement} onChange={onChange} placeholder="Transport Requirement (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="medicalHistory" value={formData.medicalHistory} onChange={onChange} placeholder="Medical history / allergies (Optional)" className="px-4 py-3 border rounded-xl" />
              <input name="parentSignature" value={formData.parentSignature} onChange={onChange} placeholder="Parent Signature Name" className="px-4 py-3 border rounded-xl" />

              <label className="border rounded-xl p-3 text-sm text-gray-700">
                Birth Certificate Copy (Optional)<input type="file" accept=".pdf,image/*" className="block mt-2" onChange={(e) => onFile('birthCertificateCopy', e.target.files?.[0])} />
              </label>
              <label className="border rounded-xl p-3 text-sm text-gray-700">
                Aadhaar Copy (Optional)<input type="file" accept=".pdf,image/*" className="block mt-2" onChange={(e) => onFile('aadhaarCopy', e.target.files?.[0])} />
              </label>
              <label className="border rounded-xl p-3 text-sm text-gray-700">
                Transfer Certificate Copy (Optional)<input type="file" accept=".pdf,image/*" className="block mt-2" onChange={(e) => onFile('transferCertificateCopy', e.target.files?.[0])} />
              </label>
              <label className="border rounded-xl p-3 text-sm text-gray-700">
                Address Proof (Optional)<input type="file" accept=".pdf,image/*" className="block mt-2" onChange={(e) => onFile('addressProof', e.target.files?.[0])} />
              </label>
              <label className="border rounded-xl p-3 text-sm text-gray-700">
                Caste Certificate (Optional)<input type="file" accept=".pdf,image/*" className="block mt-2" onChange={(e) => onFile('casteCertificate', e.target.files?.[0])} />
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" name="siblingInSchool" checked={formData.siblingInSchool} onChange={onChange} />
                Sibling studying in same school
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
                <input type="checkbox" name="declarationAccepted" checked={formData.declarationAccepted} onChange={onChange} />
                I declare all details are correct and submit this admission form.
              </label>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl border text-gray-700 disabled:opacity-40 flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
            {step < 3 ? (
              <button onClick={() => setStep((s) => s + 1)} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={submitAdmission}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <Upload size={16} /> {submitting ? 'Submitting...' : 'Submit Admission'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admission;
