const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const DEFAULT_SCHOOL_ID = '66666666-6666-6666-6666-666666666666';
const getSchoolId = (req) => req.header('x-school-id') || DEFAULT_SCHOOL_ID;

async function getNextStudentAdmissionNo(client, schoolId) {
    const serialRes = await client.query(
        `SELECT COALESCE(MAX(CASE
            WHEN admission_no ~ '^ADM-[0-9]{1,9}$' THEN substring(admission_no from 5)::INT
            ELSE 0
        END), 0) AS max_serial
         FROM students
         WHERE school_id = $1`,
        [schoolId]
    );
    const nextSerial = (serialRes.rows[0]?.max_serial || 0) + 1;
    return `ADM-${String(nextSerial).padStart(2, '0')}`;
}

exports.createStudent = async (req, res) => {
    const schoolId = getSchoolId(req);
    const fullName = (req.body.fullName || req.body.applicantFullName || '').trim();
    const dateOfBirth = req.body.dateOfBirth || req.body.dob || null;
    const gender = req.body.gender || null;
    const bloodGroup = req.body.bloodGroup || null;
    const category = req.body.category || null;
    const aadhaarNumber = req.body.aadhaarNumber || req.body.nationalId || null;
    const passportPhoto = null;
    const currentClassId = req.body.classId || req.body.targetClassId || req.body.currentClassId || null;
    const admissionFeeSubmitted = String(req.body.admissionFeeSubmitted || req.body.admissionFeePaid || 'NO').toUpperCase() === 'YES';
    const admissionFeePaymentMode = (req.body.admissionFeePaymentMode || 'CASH').toUpperCase();

    if (!fullName || !dateOfBirth || !gender || !bloodGroup || !category || !aadhaarNumber || !currentClassId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required admission fields. Required: fullName, dateOfBirth, gender, bloodGroup, category, aadhaarNumber, classId.'
        });
    }

    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = req.body.firstName || parts[0] || 'Student';
    const lastName = req.body.lastName || parts.slice(1).join(' ') || '-';
    let admissionNo = null;
    const contactEmail = (req.body.email || '').trim();
    const email = contactEmail || `student.${admissionNo.toLowerCase()}@local.school`;
    const parentContact = req.body.parentContact || req.body.phone || req.body.fatherMobile || req.body.motherMobile || '0000000000';

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`student-admission-${schoolId}`]);

        if (!admissionNo) {
            admissionNo = await getNextStudentAdmissionNo(client, schoolId);
        }

        const classRes = await client.query(
            `SELECT c.id, c.maximum_capacity, COUNT(s.id)::INT AS current_enrollment
             FROM classes c
             LEFT JOIN students s ON s.current_class_id = c.id
             WHERE c.id = $1
             GROUP BY c.id, c.maximum_capacity`,
            [currentClassId]
        );

        if (classRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Selected class does not exist.' });
        }
        if (classRes.rows[0].current_enrollment >= classRes.rows[0].maximum_capacity) {
            return res.status(400).json({ success: false, message: 'Admission failed: selected class is at full capacity.' });
        }

        let roleRes = await client.query(
            "SELECT id FROM roles WHERE name = 'STUDENT' AND school_id = $1 LIMIT 1",
            [schoolId]
        );
        if (!roleRes.rows[0]) {
            roleRes = await client.query("SELECT id FROM roles WHERE name = 'STUDENT' LIMIT 1");
        }
        const roleId = roleRes.rows[0]?.id;

        if (!roleId) {
            throw new Error('STUDENT role not found for this school.');
        }

        const tempPassword = req.body.tempPassword || `${firstName}@${new Date(dateOfBirth).getFullYear()}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const userInsert = await client.query(
            `INSERT INTO users (school_id, role_id, email, password_hash, full_name, is_active, profile_photo, must_change_password, must_upload_photo)
             VALUES ($1, $2, $3, $4, $5, true, NULL, true, true)
             RETURNING id`,
            [schoolId, roleId, email, hashedPassword, `${firstName} ${lastName}`.trim()]
        );
        const createdBy = userInsert.rows[0].id;

        const studentInsert = await client.query(
            `INSERT INTO students (
                school_id, admission_no, first_name, last_name, national_id, full_name, date_of_birth, gender,
                current_class_id, parent_contact, created_by, updated_by, blood_group, nationality, religion, category,
                aadhaar_number, birth_certificate_details, residential_address, city, state, pin_code, mobile_number, email,
                emergency_contact_number, father_name, father_occupation, father_qualification, father_mobile,
                mother_name, mother_occupation, mother_qualification, mother_mobile, guardian_name, previous_school_name,
                last_class_studied, previous_marks, transfer_certificate_details, report_card_details, birth_certificate_copy,
                passport_photo, teacher_passport_photo, aadhaar_copy, transfer_certificate_copy, address_proof_copy,
                caste_certificate_copy, transport_requirement, medical_history, sibling_in_school, declaration_accepted, parent_signature
             ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,$12,$13,$14,$15,$16,
                $17,$18,$19,$20,$21,$22,$23,$24,
                $25,$26,$27,$28,$29,
                $30,$31,$32,$33,$34,$35,
                $36,$37,$38,$39,$40,
                $41,$42,$43,$44,$45,
                $46,$47,$48,$49,$50,$51
             )
             RETURNING id, admission_no`,
            [
                schoolId, admissionNo, firstName, lastName, aadhaarNumber, fullName, dateOfBirth, gender,
                currentClassId, parentContact, req.user?.id || createdBy, req.user?.id || createdBy, bloodGroup, req.body.nationality || 'Indian', req.body.religion || null, category,
                aadhaarNumber, req.body.birthCertificateDetails || null, req.body.address || req.body.residentialAddress || null, req.body.city || null, req.body.state || null, req.body.pinCode || null, req.body.mobileNumber || req.body.phone || null, req.body.email || null,
                req.body.emergencyContactNumber || null, req.body.fatherName || null, req.body.fatherOccupation || null, req.body.fatherQualification || null, req.body.fatherMobile || null,
                req.body.motherName || null, req.body.motherOccupation || null, req.body.motherQualification || null, req.body.motherMobile || null, req.body.guardianName || null, req.body.previousSchoolName || null,
                req.body.lastClassStudied || null, req.body.previousMarks || req.body.previousGrade || null, req.body.transferCertificateDetails || null, req.body.reportCard || null, req.body.birthCertificateCopy || null,
                passportPhoto, req.body.teacherPassportPhoto || null, req.body.aadhaarCopy || null, req.body.transferCertificateCopy || null, req.body.addressProof || null,
                req.body.casteCertificate || null, req.body.transportRequirement || null, req.body.medicalHistory || null, !!req.body.siblingInSchool, !!req.body.declarationAccepted, req.body.parentSignature || null
            ]
        );

        let admissionFeeReceipt = null;
        if (admissionFeeSubmitted) {
            const feeSettingRes = await client.query(
                `SELECT COALESCE(admission_fee, 0) AS admission_fee
                 FROM class_fee_settings
                 WHERE school_id = $1 AND class_id = $2
                 LIMIT 1`,
                [schoolId, currentClassId]
            );
            const admissionFee = Number.parseFloat(feeSettingRes.rows[0]?.admission_fee || 0) || 0;
            if (admissionFee <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Admission fee is not configured for this class. Configure class admission fee in Fee Management first.'
                });
            }

            const txRes = await client.query(
                `INSERT INTO transactions (
                    school_id, student_id, amount, currency, status, type, metadata, payment_method, idempotency_key, created_by
                 ) VALUES (
                    $1, $2, $3, 'INR', 'COMPLETED', 'FEE_PAYMENT', $4::jsonb, $5, $6, $7
                 )
                 RETURNING id, amount, currency, created_at`,
                [
                    schoolId,
                    studentInsert.rows[0].id,
                    admissionFee,
                    JSON.stringify({ feeType: 'ADMISSION', source: 'admission-form' }),
                    admissionFeePaymentMode,
                    crypto.randomUUID(),
                    req.user?.id || createdBy
                ]
            );

            await client.query(
                `INSERT INTO ledger_entries (
                    school_id, transaction_id, debit_account, credit_account, amount, currency, metadata
                 ) VALUES (
                    $1, $2, 'CASH_HAND', 'ADMISSION_FEES', $3, 'INR', $4::jsonb
                 )`,
                [schoolId, txRes.rows[0].id, admissionFee, JSON.stringify({ source: 'admission-form' })]
            );

            admissionFeeReceipt = {
                transactionId: txRes.rows[0].id,
                invoiceNo: `INV-${String(txRes.rows[0].id).split('-')[0].toUpperCase()}`,
                amount: admissionFee,
                currency: 'INR'
            };
        }

        await client.query('COMMIT');

        let emailStatus = { success: false, reason: 'No email provided' };
        if (contactEmail) {
            // Fire-and-forget email to keep admission submission fast.
            emailStatus = { success: true };
            emailService.sendWelcomeEmail(
                contactEmail,
                `${firstName} ${lastName}`,
                studentInsert.rows[0].admission_no,
                tempPassword,
                'Student'
            ).catch((err) => console.error('Credential email send failed:', err));
        }

        res.status(201).json({
            success: true,
            studentId: studentInsert.rows[0].id,
            admissionNo: studentInsert.rows[0].admission_no,
            admissionFee: admissionFeeReceipt,
            loginEmail: contactEmail || null,
            credentialsSent: !!emailStatus?.success,
            emailError: emailStatus?.success ? null : (emailStatus?.error || emailStatus?.reason || null),
            credentials: contactEmail ? undefined : {
                email,
                temporaryPassword: tempPassword
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating student:', error);
        res.status(500).json({ success: false, message: 'Registration failed.' });
    } finally {
        client.release();
    }
};

exports.getAllStudents = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { page = 1, limit = 50, search = '', classId = '' } = req.query;
    const offset = (page - 1) * limit;

    try {
        const filters = [`s.school_id = $1`];
        const values = [schoolId];

        if (classId) {
            values.push(classId);
            filters.push(`s.current_class_id = $${values.length}`);
        }

        if (search) {
            values.push(`%${search}%`);
            const p = values.length;
            filters.push(`(
                s.first_name ILIKE $${p}
                OR s.last_name ILIKE $${p}
                OR s.full_name ILIKE $${p}
                OR s.admission_no ILIKE $${p}
                OR COALESCE(s.mobile_number, '') ILIKE $${p}
                OR COALESCE(s.parent_contact, '') ILIKE $${p}
                OR COALESCE(s.email, '') ILIKE $${p}
            )`);
        }

        values.push(limit);
        const limitPos = values.length;
        values.push(offset);
        const offsetPos = values.length;

        const query = `
            SELECT
                s.id,
                s.current_class_id AS class_id,
                s.admission_no AS student_id,
                s.admission_no,
                s.first_name,
                s.last_name,
                s.passport_photo,
                c.name AS class,
                c.section,
                COALESCE(s.email, s.parent_contact) AS email,
                COALESCE(s.mobile_number, s.parent_contact) AS mobile_number,
                count(*) OVER() AS total_count
            FROM students s
            LEFT JOIN classes c ON c.id = s.current_class_id
            WHERE ${filters.join(' AND ')}
            ORDER BY s.created_at DESC
            LIMIT $${limitPos} OFFSET $${offsetPos}
        `;
        const resData = await pool.query(query, values);

        const total = resData.rows[0]?.total_count || 0;
        res.json({
            students: resData.rows,
            pagination: {
                total: parseInt(total),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
};

exports.updateStudent = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { id } = req.params;
    const {
        fullName,
        firstName,
        lastName,
        mobileNumber,
        email,
        classId,
        gender,
        dateOfBirth,
        bloodGroup,
        category
    } = req.body;

    try {
        const computedFirst = firstName || (fullName ? fullName.split(' ')[0] : null);
        const computedLast = lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : null);

        const result = await pool.query(
            `UPDATE students
             SET
                full_name = COALESCE($1, full_name),
                first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name),
                mobile_number = COALESCE($4, mobile_number),
                parent_contact = COALESCE($4, parent_contact),
                email = COALESCE($5, email),
                current_class_id = COALESCE($6, current_class_id),
                gender = COALESCE($7, gender),
                date_of_birth = COALESCE($8, date_of_birth),
                blood_group = COALESCE($9, blood_group),
                category = COALESCE($10, category),
                updated_at = NOW(),
                updated_by = COALESCE($11, updated_by)
             WHERE id = $12 AND school_id = $13
             RETURNING *`,
            [
                fullName || null,
                computedFirst || null,
                computedLast || null,
                mobileNumber || null,
                email || null,
                classId || null,
                gender || null,
                dateOfBirth || null,
                bloodGroup || null,
                category || null,
                req.user?.id || null,
                id,
                schoolId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student' });
    }
};

exports.getStudentProfile = async (req, res) => {
    const { id } = req.params;
    const { id: userId, roleName } = req.user;

    try {
        // Get the student record
        const studentRes = await pool.query(
            `SELECT
                s.*,
                c.name AS class,
                c.section
             FROM students s
             LEFT JOIN classes c ON c.id = s.current_class_id
             WHERE s.id::text = $1 OR s.admission_no = $1`,
            [id]
        );
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student not found' });

        const student = studentRes.rows[0];

        // PRIVACY: If STUDENT role, verify they are requesting their own profile
        if (roleName === 'STUDENT') {
            const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
            // In current schema, students table does not store student email; use parent_contact as fallback identifier.
            if (userRes.rows[0]?.email !== student.parent_contact) {
                return res.status(403).json({ message: 'Access Denied: You can only view your own profile.' });
            }
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};
