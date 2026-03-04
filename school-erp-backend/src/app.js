const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const feeRoutes = require('./routes/fee.routes');
const examRoutes = require('./routes/exam.routes');
const payrollRoutes = require('./routes/payroll.routes');
const questionRoutes = require('./routes/question.routes');
const reportRoutes = require('./routes/report.routes');
const staffRoutes = require('./routes/staff.routes');
const marksRoutes = require('./routes/marks.routes');
const transportRoutes = require('./routes/transport.routes');
const hostelRoutes = require('./routes/hostel.routes');
const requestRoutes = require('./routes/request.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const subjectRoutes = require('./routes/subject.routes');
const timetableRoutes = require('./routes/timetable.routes');
const parentRoutes = require('./routes/parent.routes');
const classesRoutes = require('./routes/classes.routes');
const admissionRoutes = require('./routes/admission.routes');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, account locked temporarily.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/admissions', admissionRoutes);

// Error handling - must be last
app.use(errorMiddleware);

module.exports = app;
