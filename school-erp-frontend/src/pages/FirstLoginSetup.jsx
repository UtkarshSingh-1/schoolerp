import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Image as ImageIcon, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FirstLoginSetup = () => {
    const navigate = useNavigate();
    const { updateUser, logout } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await toBase64(file);
        setProfilePhoto(base64);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!profilePhoto) {
            setError('Profile photo is mandatory.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/complete-onboarding', { newPassword, profilePhoto });
            updateUser({ mustChangePassword: false, mustUploadPhoto: false, onboardingRequired: false });
            setSuccess(true);
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete setup.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-huge border border-gray-100 text-center space-y-4 max-w-md w-full">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Setup Completed</h2>
                    <p className="text-gray-500 font-medium">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden max-w-md w-full">
                <div className="bg-blue-600 p-8 text-white">
                    <h3 className="text-2xl font-black leading-tight">First Login Setup</h3>
                    <p className="text-blue-100 text-sm mt-2 font-medium opacity-80">Update your password and upload your passport-size profile photo to continue.</p>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-5">
                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{error}</div>}

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">New Password</label>
                        <div className="relative mt-2">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Min. 8 characters"
                            />
                            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Confirm Password</label>
                        <div className="relative mt-2">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Repeat new password"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Passport Photo *</label>
                        <label className="mt-2 w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50 rounded-2xl cursor-pointer border border-dashed border-slate-300 text-sm font-semibold text-slate-600">
                            <ImageIcon size={18} />
                            <span>{profilePhoto ? 'Photo selected' : 'Choose image file'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>

                    <button type="button" onClick={logout} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500">
                        Logout
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FirstLoginSetup;
