import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Admission from './pages/Admission';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Exams from './pages/Exams';
import Payroll from './pages/Payroll';
import Login from './pages/Login';
import StudentProfile from './pages/StudentProfile';
import QuestionBank from './pages/QuestionBank';
import Timetable from './pages/Timetable';
import Classes from './pages/Classes';
import StaffManagement from './pages/StaffManagement';
import SubjectManagement from './pages/SubjectManagement';
import ChangePassword from './pages/ChangePassword';
import FirstLoginSetup from './pages/FirstLoginSetup';
import Gradebook from './pages/Gradebook';
import MarksEntry from './pages/MarksEntry';
import TransportManagement from './pages/TransportManagement';
import HostelManagement from './pages/HostelManagement';
import StudentServices from './pages/StudentServices';
import AdminRequests from './pages/AdminRequests';
import ParentPortal from './pages/ParentPortal';
import AuditLogs from './pages/AuditLogs';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/first-login-setup" element={<FirstLoginSetup />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="first-login-setup" element={<FirstLoginSetup />} />

                {/* Role Specific Routes */}
                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT']} />}>
                  <Route path="admission" element={<Admission />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT']} />}>
                  <Route path="staff" element={<StaffManagement />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF']} />}>
                  <Route path="service-requests" element={<AdminRequests />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
                  <Route path="classes" element={<Classes />} />
                  <Route path="subjects" element={<SubjectManagement />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT', 'ACCOUNTANT', 'STAFF']} />}>
                  <Route path="students" element={<Students />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']} />}>
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="exams" element={<Exams />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
                  <Route path="questions" element={<QuestionBank />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'PARENT', 'STUDENT', 'SUPER_ADMIN']} />}>
                  <Route path="marks-entry" element={<MarksEntry />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT', 'PRINCIPAL']} />}>
                  <Route path="fees" element={<Fees />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'STAFF']} />}>
                  <Route path="payroll" element={<Payroll />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'STAFF', 'PARENT', 'STUDENT', 'PRINCIPAL']} />}>
                  <Route path="transport" element={<TransportManagement />} />
                  <Route path="hostel" element={<HostelManagement />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT', 'ACCOUNTANT', 'STAFF']} />}>
                  <Route path="students/:id" element={<StudentProfile />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['STUDENT', 'PARENT']} />}>
                  <Route path="gradebook" element={<Gradebook />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['STUDENT']} />}>
                  <Route path="apply-services" element={<StudentServices />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['PARENT']} />}>
                  <Route path="parent-portal" element={<ParentPortal />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN']} />}>
                  <Route path="audit-logs" element={<AuditLogs />} />
                </Route>

                <Route path="timetable" element={<Timetable />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
