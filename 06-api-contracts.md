# API Contracts

## Authentication
- `POST /api/auth/login`: Authenticates user and returns JWT.
- `GET /api/auth/me`: Returns current user info (requires JWT).

## Admission
- `POST /api/admission/apply`: Submit student application.
- `GET /api/admission/applicants`: List all applicants (Admin only).
- `POST /api/admission/approve/:id`: Convert applicant to student.

## Students
- `GET /api/students`: List all active students.
- `GET /api/students/:id`: Detailed student profile.

## Attendance
- `POST /api/attendance/mark`: Mark attendance for a lecture.
- `GET /api/attendance/report`: Summary of attendance records.
- `POST /api/biometric/log`: Endpoint for biometric device sync.

## Exams
- `POST /api/exams/create`: Define a new exam.
- `POST /api/exams/submit`: Submit MCQ answers for grading.

## Fees
- `POST /api/fees/collect`: Record a fee payment.
- `GET /api/fees/history/:studentId`: View payment history.
