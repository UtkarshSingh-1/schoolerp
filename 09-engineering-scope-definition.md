# MVP Technical Documentation / Scope

## 1. Tech Stack

Frontend:
- React.js
- Tailwind CSS

Backend:
- Node.js (Express)

Database:
- PostgreSQL

Authentication:
- JWT Based Auth

---

## 2. Core MVP Scope

Included:
- Admission with Exam Integration
- Direct Student Addition
- Auto Student ID Generation
- Lecture-Based Attendance
- Biometric Attendance API
- Exam System (MCQ auto grading)
- Fee System
- Payroll
- RBAC
- Audit Logs
- Local Backup

Excluded:
- AI Analytics
- Multi-school
- E-learning
- Video Integration
- Cloud Infra

---

## 3. Student ID Logic

Format: `BRANCH-YEAR-SERIAL`
Example: `SCH01-2026-0001`

---

## 4. Attendance Logic

Lecture attendance:
- Class + Subject + Lecture Time mapping

Biometric attendance:
- Device pushes data via REST API
- Attendance stored with timestamp

---

## 5. Security Measures

- Password hashing (bcrypt)
- JWT expiration
- Role-based access middleware
- Input validation
