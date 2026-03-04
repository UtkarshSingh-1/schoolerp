# School ERP - Architecture Document (v3)

## 1. Overview

This document describes the high-level architecture of the School ERP v3 system.
The system is designed as a scalable, maintainable, and cloud-integrated enterprise application.

---

## 2. Architecture Style

**NestJS Monorepo (Microservices Pattern)**
- Modular structure with decoupled services.
- Clean Architecture principles (Domain-Driven Design).
- Use Case pattern for business logic isolation.

---

## 3. Core Layers

### 1. Presentation Layer (Frontend)
- **Vite + React**: Modern, fast, and responsive user interface.
- **Premium CSS**: Vanilla CSS for bespoke, high-end aesthetics.
- **RBAC-Aware Navigation**: Dynamic menus based on user permissions.

### 2. API Gateway & Microservices (v3)
- **NestJS Framework**: Enterprise-grade Node.js framework.
- **Main API**: Central gateway for request routing and aggregation.
- **Sub-Services**: Decoupled modules for Auth, Student, Exam, etc.
- **Use Cases**: Isolated business logic per domain.

### 3. Data & Infrastructure Layer
- **PostgreSQL (Neon)**: Serverless, cloud-native relational database.
- **Redis (BullMQ)**: For asynchronous background tasks and job queues.
- **TypeORM**: Modern ORM for strictly-typed database interactions.

---

## 4. Main Modules

- **Auth Service**: JWT-based secure authentication and role management.
- **SIS Service**: Comprehensive Student Information System.
- **Attendance Service**: Real-time sync with biometric logs.
- **Exam Engine**: Automated granular scoring and proctoring.
- **Finance Service**: Fee ledgers and monthly revenue aggregation.
- **Audit Service**: Immutable logging for institutional transparency.
- **Schedule Service**: Dynamic timetable management.

---

## 5. Deployment

- **Hosting**: Vercel (Frontend) / AWS or Docker (Backend).
- **CI/CD**: Structured for automated testing and deployment.
- **Database**: Managed Neon PostgreSQL with automated point-in-time recovery.
