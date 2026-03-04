import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizedUser = (userData) => {
        const ROLE_MAP = {
            1: 'SUPER_ADMIN',
            2: 'SCHOOL_ADMIN',
            3: 'PRINCIPAL',
            4: 'TEACHER',
            5: 'STUDENT',
            6: 'PARENT',
            7: 'ACCOUNTANT',
            8: 'STAFF'
        };
        if (userData && typeof userData.role === 'number') {
            return { ...userData, role: ROLE_MAP[userData.role] };
        }
        return userData;
    };

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            if (token && savedUser) {
                setUser(normalizedUser(JSON.parse(savedUser)));
            }
        } catch (err) {
            console.error('Failed to restore session:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user: userData } = res.data;
            const finalUser = normalizedUser(userData);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(finalUser));
            setUser(finalUser);
            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: err.response?.data?.message || 'Invalid credentials or connection error' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
