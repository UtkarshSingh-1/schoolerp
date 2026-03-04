# School ERP v3 - Enterprise Academic Management System

A high-performance, microservices-oriented ERP solution for educational institutions. The platform is now fully re-architected into a monorepo structure (v3) for scalability, reliability, and modern cloud deployment.

## 🚀 Key Features

### 🔐 Advanced RBAC & Security (v3)
- Fully decoupled **Auth Service** with JWT and granular permission sets.
- Hierarchical role management for Super Admins, Admins, and Teachers.

### 🎓 Dynamic SIS & Academic Control
- **Lecture Scheduling**: Real-time weekly timetable management with dynamic conflict resolution.
- **Attendance Engine**: Automated status calculation from biometric logs.
- **Assessment Engine**: Proctored MCQ exams with automated scoring and violation tracking.

### 📊 Real-time Administrative Dashboards
- **Live Metrics**: Live aggregation of monthly revenue, attendance rates, and student growth.
- **Audit Engine**: Immutable system-wide transparency for all administrative operations.

## 🛠️ Technology Stack (v3)

- **Frontend**: Vite + React, Vanilla CSS (Premium Aesthetics), Lucide Icons.
- **Backend (v3)**: NestJS (Monorepo), TypeORM, Redis (BullMQ), Neon PostgreSQL (Cloud).
- **Architecture**: Domain-Driven Design (DDD), Use Case patterns, and decoupled microservices.

## 📥 Getting Started

### 1. Backend (v3)
Located in `school-erp-v3/`:
```bash
cd school-erp-v3
npm install
npm run start:dev  # Runs the main-api gateway
```

### 2. Frontend
Located in `school-erp-frontend/`:
```bash
cd school-erp-frontend
npm install
npm run dev
```

## ☁️ Cloud Infrastructure
The system is pre-integrated with:
- **Neon PG**: Serverless PostgreSQL for the primary data layer.
- **Vercel/Cloud Deployment**: Ready for containerized or serverless hosting.

---
*Developed with ❤️ for excellence in educational management.*
