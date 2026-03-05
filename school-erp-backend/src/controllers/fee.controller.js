const crypto = require('crypto');
const pool = require('../config/db');

const DEFAULT_SCHOOL_ID = '66666666-6666-6666-6666-666666666666';
const getSchoolId = (req) => req.header('x-school-id') || DEFAULT_SCHOOL_ID;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toNumber = (v) => Number.parseFloat(v || 0) || 0;
const ACCOUNT_MAP = {
    ADMISSION: 'ADMISSION_FEES',
    TUITION: 'TUITION_FEES',
    TRANSPORT: 'TRANSPORT_FEES',
    HOSTEL: 'HOSTEL_FEES',
    OTHER: 'GENERAL_FEES'
};

async function resolveStudentIdByUser(client, schoolId, userEmail) {
    const studentRes = await client.query(
        `SELECT id
         FROM students
         WHERE school_id = $1 AND (lower(email) = lower($2) OR lower(parent_contact) = lower($2))
         LIMIT 1`,
        [schoolId, userEmail]
    );
    return studentRes.rows[0]?.id || null;
}

async function getStudentFeeSummary(client, schoolId, studentId) {
    const studentRes = await client.query(
        `SELECT
            s.id,
            s.admission_no,
            s.full_name,
            s.current_class_id,
            c.name AS class_name,
            c.section,
            COALESCE(cfs.admission_fee, 0) AS admission_fee,
            COALESCE(cfs.monthly_fee, 0) AS monthly_fee,
            COALESCE(cfs.currency, 'INR') AS currency
         FROM students s
         LEFT JOIN classes c ON c.id = s.current_class_id
         LEFT JOIN class_fee_settings cfs ON cfs.school_id = s.school_id AND cfs.class_id = s.current_class_id
         WHERE s.school_id = $1 AND s.id = $2
         LIMIT 1`,
        [schoolId, studentId]
    );

    if (!studentRes.rows[0]) return null;

    const txRes = await client.query(
        `SELECT id, amount, currency, status, payment_method, created_at, metadata
         FROM transactions
         WHERE school_id = $1 AND student_id = $2 AND type = 'FEE_PAYMENT'
         ORDER BY created_at DESC`,
        [schoolId, studentId]
    );

    const payments = txRes.rows.map((t) => ({
        id: t.id,
        amount: toNumber(t.amount),
        currency: t.currency || 'INR',
        status: t.status,
        payment_method: t.payment_method,
        created_at: t.created_at,
        fee_type: t.metadata?.feeType || 'OTHER',
        invoice_no: `INV-${String(t.id).split('-')[0].toUpperCase()}`
    }));

    const paidAdmission = payments
        .filter((p) => p.fee_type === 'ADMISSION' && p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

    const admissionFee = toNumber(studentRes.rows[0].admission_fee);
    const monthlyFee = toNumber(studentRes.rows[0].monthly_fee);

    return {
        student: {
            id: studentRes.rows[0].id,
            admissionNo: studentRes.rows[0].admission_no,
            fullName: studentRes.rows[0].full_name,
            className: studentRes.rows[0].class_name,
            section: studentRes.rows[0].section
        },
        currency: studentRes.rows[0].currency || 'INR',
        feePlan: {
            admissionFee,
            monthlyFee
        },
        paid: {
            admission: paidAdmission,
            total: payments.filter((p) => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)
        },
        due: {
            admission: Math.max(admissionFee - paidAdmission, 0)
        },
        transactions: payments
    };
}

exports.getFeeSettings = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { classId } = req.query;
    try {
        const params = [schoolId];
        let where = 'WHERE c.school_id = $1';
        if (classId) {
            params.push(classId);
            where += ` AND c.id = $${params.length}`;
        }

        const result = await pool.query(
            `SELECT
                c.id AS class_id,
                c.name AS class_name,
                c.section,
                COALESCE(cfs.admission_fee, 0) AS admission_fee,
                COALESCE(cfs.monthly_fee, 0) AS monthly_fee,
                COALESCE(cfs.currency, 'INR') AS currency
             FROM classes c
             LEFT JOIN class_fee_settings cfs
                ON cfs.school_id = c.school_id AND cfs.class_id = c.id
             ${where}
             ORDER BY c.name, c.section`,
            params
        );

        if (classId) return res.json(result.rows[0] || null);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching fee settings:', error);
        res.status(500).json({ message: 'Error fetching fee settings' });
    }
};

exports.upsertFeeSetting = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { classId, admissionFee, monthlyFee = 0 } = req.body;

    if (!classId || admissionFee === undefined || admissionFee === null) {
        return res.status(400).json({ message: 'classId and admissionFee are required.' });
    }

    try {
        const classRes = await pool.query('SELECT id FROM classes WHERE school_id = $1 AND id = $2 LIMIT 1', [schoolId, classId]);
        if (!classRes.rows[0]) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const result = await pool.query(
            `INSERT INTO class_fee_settings (school_id, class_id, admission_fee, monthly_fee, currency)
             VALUES ($1, $2, $3, $4, 'INR')
             ON CONFLICT (school_id, class_id)
             DO UPDATE SET
                admission_fee = EXCLUDED.admission_fee,
                monthly_fee = EXCLUDED.monthly_fee,
                currency = 'INR',
                updated_at = NOW()
             RETURNING *`,
            [schoolId, classId, toNumber(admissionFee), toNumber(monthlyFee)]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving fee setting:', error);
        res.status(500).json({ message: 'Error saving fee setting' });
    }
};

exports.getStudentFees = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { studentId } = req.params;
    const role = req.user.roleName;

    const client = await pool.connect();
    try {
        if (role === 'STUDENT') {
            const ownStudentId = await resolveStudentIdByUser(client, schoolId, req.user.email);
            if (!ownStudentId || ownStudentId !== studentId) {
                return res.status(403).json({ message: 'Access denied.' });
            }
        }

        const summary = await getStudentFeeSummary(client, schoolId, studentId);
        if (!summary) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.json(summary);
    } catch (error) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({ message: 'Error fetching student fees' });
    } finally {
        client.release();
    }
};

exports.getMyFees = async (req, res) => {
    const schoolId = getSchoolId(req);
    const role = req.user.roleName;
    const client = await pool.connect();
    try {
        let studentId = req.query.studentId || null;
        if (role === 'STUDENT') {
            studentId = await resolveStudentIdByUser(client, schoolId, req.user.email);
        }
        if (!studentId) {
            return res.status(400).json({ message: 'studentId is required for this role.' });
        }

        const summary = await getStudentFeeSummary(client, schoolId, studentId);
        if (!summary) return res.status(404).json({ message: 'Student not found.' });
        res.json(summary);
    } catch (error) {
        console.error('Error fetching my fees:', error);
        res.status(500).json({ message: 'Error fetching my fees' });
    } finally {
        client.release();
    }
};

exports.listTransactions = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { studentId } = req.query;
    try {
        if (studentId && !UUID_RE.test(String(studentId))) {
            return res.status(400).json({ message: 'Invalid studentId format.' });
        }
        const params = [schoolId];
        let where = `WHERE t.school_id = $1 AND t.type = 'FEE_PAYMENT'`;
        if (studentId) {
            params.push(studentId);
            where += ` AND t.student_id = $${params.length}`;
        }

        const result = await pool.query(
            `SELECT
                t.id,
                t.student_id,
                s.full_name AS student_name,
                s.admission_no,
                t.amount,
                t.currency,
                t.status,
                t.payment_method,
                t.metadata,
                t.created_at
             FROM transactions t
             LEFT JOIN students s ON s.id = t.student_id
             ${where}
             ORDER BY t.created_at DESC
             LIMIT 200`,
            params
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error listing fee transactions:', error);
        res.status(500).json({ message: 'Error listing fee transactions' });
    }
};

exports.payFee = async (req, res) => {
    const schoolId = getSchoolId(req);
    const role = req.user.roleName;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { paymentMode = 'CASH', feeType = 'OTHER', remarks = '' } = req.body;
        const paymentPlan = String(req.body.paymentPlan || 'CUSTOM').toUpperCase();
        const monthsCountRaw = Number.parseInt(req.body.monthsCount, 10);
        let { studentId, amount } = req.body;

        if (role === 'STUDENT') {
            studentId = await resolveStudentIdByUser(client, schoolId, req.user.email);
        }

        if (!studentId) {
            return res.status(400).json({ message: 'studentId is required.' });
        }
        if (!UUID_RE.test(String(studentId))) {
            return res.status(400).json({ message: 'Invalid studentId format.' });
        }

        const studentRes = await client.query(
            `SELECT id, school_id, current_class_id
             FROM students
             WHERE id = $1 AND school_id = $2
             LIMIT 1`,
            [studentId, schoolId]
        );
        if (!studentRes.rows[0]) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const normalizedFeeType = String(feeType || 'OTHER').toUpperCase();
        if (!Object.keys(ACCOUNT_MAP).includes(normalizedFeeType)) {
            return res.status(400).json({ message: 'Invalid feeType.' });
        }

        const summary = await getStudentFeeSummary(client, schoolId, studentId);
        if (!summary) return res.status(404).json({ message: 'Student not found.' });

        const amountProvided = amount !== undefined && amount !== null && String(amount) !== '';
        let finalAmount = toNumber(amount);
        let monthsCount = Number.isFinite(monthsCountRaw) && monthsCountRaw > 0 ? monthsCountRaw : 1;
        if (monthsCount > 12) monthsCount = 12;

        if (amountProvided && finalAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0.' });
        }

        if (normalizedFeeType === 'ADMISSION' && !amountProvided) {
            finalAmount = summary.due.admission;
        }
        if (normalizedFeeType === 'TUITION' && !amountProvided) {
            if (paymentPlan === 'YEARLY') monthsCount = 12;
            if (paymentPlan === 'QUARTERLY') monthsCount = 3;
            if (paymentPlan === 'MONTHLY') monthsCount = 1;
            finalAmount = toNumber(summary.feePlan.monthlyFee) * monthsCount;
        }
        if (finalAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0.' });
        }

        const metadata = {
            feeType: normalizedFeeType,
            remarks,
            paymentPlan,
            monthsCount: normalizedFeeType === 'TUITION' ? monthsCount : undefined
        };

        const txRes = await client.query(
            `INSERT INTO transactions (
                school_id, student_id, amount, currency, status, type, metadata, payment_method, idempotency_key, created_by
             ) VALUES (
                $1, $2, $3, 'INR', 'COMPLETED', 'FEE_PAYMENT', $4::jsonb, $5, $6, $7
             )
             RETURNING *`,
            [
                schoolId,
                studentId,
                finalAmount,
                JSON.stringify(metadata),
                paymentMode,
                crypto.randomUUID(),
                req.user.id
            ]
        );

        await client.query(
            `INSERT INTO ledger_entries (
                school_id, transaction_id, debit_account, credit_account, amount, currency, metadata
             ) VALUES (
                $1, $2, 'CASH_HAND', $3, $4, 'INR', $5::jsonb
             )`,
            [
                schoolId,
                txRes.rows[0].id,
                ACCOUNT_MAP[normalizedFeeType],
                finalAmount,
                JSON.stringify({ ...metadata, source: 'fee-module' })
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            transaction: txRes.rows[0],
            invoiceNo: `INV-${String(txRes.rows[0].id).split('-')[0].toUpperCase()}`,
            amount: finalAmount,
            currency: 'INR',
            paymentPlan,
            monthsCount: normalizedFeeType === 'TUITION' ? monthsCount : undefined
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing fee payment:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    } finally {
        client.release();
    }
};

exports.getInvoice = async (req, res) => {
    const schoolId = getSchoolId(req);
    const { transactionId } = req.params;
    const role = req.user.roleName;
    const client = await pool.connect();
    try {
        const txRes = await client.query(
            `SELECT
                t.*,
                s.full_name AS student_name,
                s.admission_no,
                c.name AS class_name,
                c.section
             FROM transactions t
             JOIN students s ON s.id = t.student_id
             LEFT JOIN classes c ON c.id = s.current_class_id
             WHERE t.id = $1 AND t.school_id = $2 AND t.type = 'FEE_PAYMENT'
             LIMIT 1`,
            [transactionId, schoolId]
        );
        const tx = txRes.rows[0];
        if (!tx) return res.status(404).json({ message: 'Invoice not found.' });

        if (role === 'STUDENT') {
            const ownStudentId = await resolveStudentIdByUser(client, schoolId, req.user.email);
            if (!ownStudentId || ownStudentId !== tx.student_id) {
                return res.status(403).json({ message: 'Access denied.' });
            }
        }

        res.json({
            invoiceNo: `INV-${String(tx.id).split('-')[0].toUpperCase()}`,
            date: tx.created_at,
            amount: toNumber(tx.amount),
            currency: tx.currency || 'INR',
            status: tx.status,
            paymentMethod: tx.payment_method,
            feeType: tx.metadata?.feeType || 'OTHER',
            paymentPlan: tx.metadata?.paymentPlan || 'CUSTOM',
            monthsCount: tx.metadata?.monthsCount || null,
            remarks: tx.metadata?.remarks || null,
            student: {
                id: tx.student_id,
                name: tx.student_name,
                admissionNo: tx.admission_no,
                className: tx.class_name,
                section: tx.section
            }
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Error generating invoice' });
    } finally {
        client.release();
    }
};

// Backward-compatible aliases
exports.getFeeLedger = exports.getStudentFees;
exports.getFeeStructure = exports.getFeeSettings;
