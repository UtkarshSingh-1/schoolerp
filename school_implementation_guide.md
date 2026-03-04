# School ERP v3: Implementation & Setup Guide

This guide provides institutions with a clear path for operating and deploying the **School ERP v3** platform.

## 🏛️ How It Works (Operations)

The v3 architecture is built on a **Tenant-First** model, meaning every school operates in a secure, isolated digital environment.

### 1. Unified Management
- **Role-Based Workflows**: Teachers mark attendance and entry marks; Accountants manage fee ledgers; Admins monitor system-wide metrics and audit logs.
- **Microservice Harmony**: Data flows seamlessly between services. For example, when a student is admitted via the **Admission Service**, they are automatically provisioned in the **SIS (Student Information) Service**.

### 2. Intelligent Automation
- **Biometric Sync**: Our `SyncBiometricLogsUseCase` automatically translates raw gate logs into student attendance statuses (Late, Present, Half-day).
- **Auto-Scoring**: The **Exam Engine** calculates results in real-time, mapping MCQ responses to Bloom's Taxonomy difficulty levels for granular performance insights.
- **One-Click Financials**: Revenue is aggregated monthly, providing immediate visibility into cash flow and outstanding fees.

---

## 🛠️ Setting Up in Schools (Deployment)

Setting up a new institution is a structured 5-step process:

### Step 1: Tenant Provisioning
The Super Admin creates the school record in the system. This generates a unique `schoolId` (UUID) that ensures all subsequent data—from students to financial transactions—remains private to that institution.

### Step 2: Master Data Configuration
The School Admin configures the institute's skeleton:
- **Academic Years**: Defining terms and semesters.
- **Entities**: Mapping Classes (e.g., 10-A, 10-B) and Subjects (Math, Physics).
- **Staff Profiles**: Onboarding teachers and granting permission sets.

### Step 3: Fee & Payroll Structure
- Define fee heads (Tuition, Library, Transport).
- Set up salary slabs for staff to enable one-click payroll generation later in the month.

### Step 4: Student Enrollment
- **Bulk Import**: Migration of existing student data via CSV/JSON.
- **New Admissions**: Processing candidates through the Entrance Exam and Review pipeline.

### Step 5: Hardware & Cloud Link
- **DNS Setup**: Pointing the school's subdomain (e.g., `modern-high.erp.com`) to the Vercel frontend.
- **Biometric Binding**: Linking on-site hardware IDs to the cloud API for real-time synchronization.

---

## ✅ Readiness Checklist
- [x] **Cloud Database**: Neon PG connection established.
- [x] **Role Permissions**: SUPER_ADMIN, ADMIN, and TEACHER tiers configured.
- [x] **Core Services**: All 14 microservices reporting healthy status.
- [x] **Live Metrics**: Dashboard aggregators verified with demo data.

*School ERP v3 is engineered to transition legacy institutions into high-efficiency, data-driven academic centers.*
