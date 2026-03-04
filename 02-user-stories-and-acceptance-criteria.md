# User Stories and Acceptance Criteria

## 1. Admission Management
- **As an Admin**, I want to add students directly so that I can bypass the entrance exam for special cases.
    - *AC*: System generates a unique Student ID automatically.
- **As an Applicant**, I want to take an entrance exam online so that my merit can be evaluated automatically.
    - *AC*: MCQ grading is handled by the system.

## 2. Attendance
- **As a Teacher**, I want to mark lecture-wise attendance so that I can track student presence in specific subjects.
    - *AC*: Interface shows students by class and section.
- **As an Admin**, I want to sync biometric logs so that I can have an automated record of campus entry.
    - *AC*: Biometric data is stored with timestamps and mapped to student IDs.

## 3. Financials
- **As an Accountant**, I want to collect fees and generate receipts so that I can manage school revenue.
    - *AC*: Payments can be tracked by mode (cash/online).
- **As an HR Manager**, I want to generate payroll for staff so that salary payments are automated.
    - *AC*: Net salary is calculated after basic, allowances, and deductions.

## 4. Security & Audit
- **As a Super Admin**, I want to restrict access based on roles so that sensitive data is protected.
    - *AC*: RBAC middleware validates every API request.
- **As an Auditor**, I want to see logs of all financial edits so that I can prevent fraud.
    - *AC*: Audit logs capture user ID, action, and module.
