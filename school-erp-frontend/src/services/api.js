import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // AUDIT: Single-School System Transition
        // We now enforce a single school ID '66666666-6666-6666-6666-666666666666'
        config.headers['x-school-id'] = '66666666-6666-6666-6666-666666666666';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ONLY redirect on 401 (expired/invalid token)
        // Do NOT redirect on 403 — that means the user is authenticated but
        // lacks permission for a specific endpoint. Redirecting on 403 causes
        // a race condition where one failing endpoint wipes the token for all others.
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Student Service
export const studentsApi = {
    list: (params) => api.get('/students', { params }),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data)
};


// Attendance Service
export const attendanceApi = {
    mark: (data) => api.post('/attendance/mark', data),
    list: () => api.get('/attendance'),
    getSummary: (studentId) => api.get(`/attendance/summary?studentId=${studentId}`),
    sync: (logs) => api.post('/attendance/sync', logs || [])
};

// Exam Service
export const examApi = {
    list: () => api.get('/exams'),
    getResults: (examId) => api.get(`/exams/${examId}/results`),
    submitAnswer: (attemptId, data) => api.post(`/exams/${attemptId}/submit-answer`, data),
    finalize: (attemptId) => api.post(`/exams/${attemptId}/submit`)
};

// Finance Service
export const financeApi = {
    getFeeSettings: (params) => api.get('/fees/settings', { params }),
    saveFeeSetting: (data) => api.post('/fees/settings', data),
    getStudentFees: (studentId) => api.get(`/fees/student/${studentId}`),
    getMyFees: (params) => api.get('/fees/my', { params }),
    getTransactions: (params) => api.get('/fees/transactions', { params }),
    payFee: (data) => api.post('/fees/pay', data),
    getInvoice: (transactionId) => api.get(`/fees/invoice/${transactionId}`),
    processPayroll: (month) => api.post('/payroll/process', { month }),
    getStaffPayroll: (staffId) => api.get(`/payroll/history/${staffId}`)
};

// Admin Service
export const adminApi = {
    exportBackup: () => api.get('/finance/admin/backup/export')
};

// Admission Service
export const admissionApi = {
    apply: (data) => api.post('/admissions/apply', data),
    list: () => api.get('/admissions'),
    review: (id, data) => api.patch(`/admissions/${id}/review`, data)
};

// Class Service
export const classApi = {
    list: () => api.get('/classes'),
    create: (data) => api.post('/classes', data),
    update: (id, data) => api.put(`/classes/${id}`, data),
    delete: (id) => api.delete(`/classes/${id}`)
};

// Teacher Service
export const teacherApi = {
    list: () => api.get('/teachers'),
    create: (data) => api.post('/teachers', data)
};

// Staff Service
export const staffApi = {
    list: () => api.get('/staff'),
    create: (data) => api.post('/staff', data)
};

// Subject Service
export const subjectApi = {
    list: () => api.get('/subjects'),
    create: (data) => api.post('/subjects', data),
    delete: (id) => api.delete(`/subjects/${id}`)
};

// Dashboard Service
export const dashboardApi = {
    getMetrics: () => api.get('/dashboard/metrics'),
    getRecentAdmissions: () => api.get('/dashboard/recent-admissions')
};

// Timetable Service
export const timetableApi = {
    list: (params) => api.get('/timetable', { params }),
    create: (data) => api.post('/timetable', data)
};

export default api;
