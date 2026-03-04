# Information Architecture

## 1. Core Modules

- **Admission Management**: Handles entrance exams, merit lists, and student onboarding.
- **Student Information System (SIS)**: Central repository for student profiles.
- **Attendance System**: Lecture-based manual entry and Biometric API integration.
- **Exam Management**: MCQ creation, auto-grading, and result generation.
- **Fee Management**: Fee structure setup, payment collection, and history.
- **Payroll & HR**: Staff salary management and user role assignments.
- **RBAC & Governance**: Permissions, audit logs, and system backups.

## 2. Process Flows

### Admission Flow
Applicant → Entrance Exam → Result → Approval → Student Creation
*OR*
Admin → Direct Add Student → Auto ID → Active Student

### Attendance Flow
Biometric Device → API → Attendance Table
Teacher Login → Select Lecture → Mark Attendance → Save

### Backup Flow
Daily cron job: Export database → Encrypt backup → Store locally
