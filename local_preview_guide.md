# Local Preview & Testing Guide

Follow these steps to run and test the **School ERP v3** platform on your local machine.

## 🏁 Prerequisites
- **Node.js**: v20 or higher.
- **Neon DB**: Pre-configured in `.env` (No local Postgres setup required).
- **Redis**: The system uses a built-in Redis mock (`USE_REDIS_MOCK=true`), so no local Redis is needed.

---

## 🚀 Setup Instructions

### 1. Start the Backend (API Gateway)
Open a terminal and run:
```bash
cd school-erp-v3
npm install
npm run start:dev
```
*The backend is healthy when you see `[Nest] ... Nest application successfully started`.*

### 2. Start the Frontend
Open a **second** terminal and run:
```bash
cd school-erp-frontend
npm install
npm run dev
```
*Access the UI at `http://localhost:5173`.*

---

## 🔐 Login Credentials (Demo Data)

Use these pre-seeded accounts to explore different role perspectives:

### A. Super Admin (System Level)
- **Role**: Full control over schools and audit logs.
- **Email**: `superadmin@system.com`
- **Password**: `Super@123`

### B. School Admin (Institutional Level)
- **Role**: Manage students, staff, and financials for a demo school.
- **Email**: `demo.admin@school.com`
- **Password**: `Admin@123`

### C. Teacher (Academic Level)
- **Role**: Mark attendance and manage exam data.
- **Email**: `teacher@demo.com`
- **Password**: `Admin@123`

---

## 🧪 Recommended Testing Scenarios

1.  **Dashboard Live Metrics**: Login as an Admin and verify that Revenue and Attendance data is live (remediated today).
2.  **Audit Log Viewer**: As a Super Admin, navigate to "Audit Logs" in the sidebar to view an immutable record of recent actions.
3.  **Real-time Attendance**: Login as a Teacher, navigate to "Attendance", and test the "Biometric Sync" simulation.
4.  **Granular Exam Data**: View a student's exam attempt to see the new `Total Questions` and `Correct Answers` counts.

---
*Note: The platform is directly integrated with your Neon Cloud database, so all local changes will be persisted to the cloud repo.*
