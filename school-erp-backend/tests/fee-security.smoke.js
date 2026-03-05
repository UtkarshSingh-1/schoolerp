require('dotenv').config();
const app = require('../src/app');
const { ensureSchema } = require('../src/startup/ensureSchema');

const SCHOOL_ID = process.env.TEST_SCHOOL_ID || '66666666-6666-6666-6666-666666666666';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'superadmin@demo.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin@123';
const PORT = Number(process.env.TEST_PORT || 5021);

async function api(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (_) {}
  return { status: res.status, text, json };
}

function assert(checks, name, pass, detail) {
  checks.push({ name, pass, detail });
  if (pass) {
    console.log(`PASS: ${name} -> ${detail}`);
  } else {
    console.error(`FAIL: ${name} -> ${detail}`);
  }
}

async function main() {
  await ensureSchema();
  const server = app.listen(PORT);
  const base = `http://localhost:${PORT}/api`;
  const checks = [];

  try {
    const unauthorized = await api(base, '/fees/transactions');
    assert(checks, 'unauthorized blocked', unauthorized.status === 401, `status=${unauthorized.status}`);

    const login = await api(base, '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const adminToken = login.json?.token;
    assert(checks, 'admin login', !!adminToken, `status=${login.status}`);
    if (!adminToken) throw new Error('Unable to login with test admin credentials');

    const authHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'x-school-id': SCHOOL_ID,
      'content-type': 'application/json'
    };

    const classRes = await api(base, '/classes', {
      headers: { Authorization: `Bearer ${adminToken}`, 'x-school-id': SCHOOL_ID }
    });
    const classId = classRes.json?.[0]?.id;
    assert(checks, 'class exists', !!classId, `status=${classRes.status}`);
    if (!classId) throw new Error('No class available for smoke test');

    const saveFee = await api(base, '/fees/settings', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ classId, admissionFee: 12000, monthlyFee: 2500 })
    });
    assert(checks, 'save class fee setting', saveFee.status === 201, `status=${saveFee.status}`);

    const ts = Date.now();
    const createStudent = async (idx, admissionPaid) =>
      api(base, '/students', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          fullName: `Smoke Student ${idx} ${String(ts).slice(-4)}`,
          dateOfBirth: '2012-02-02',
          gender: 'Male',
          bloodGroup: 'B+',
          category: 'General',
          aadhaarNumber: `${ts}${idx}`.slice(0, 12),
          classId,
          mobileNumber: `90000${String(ts).slice(-5)}`,
          email: `smoke.student.${idx}.${ts}@example.com`,
          admissionFeeSubmitted: admissionPaid ? 'YES' : 'NO',
          admissionFeePaymentMode: 'UPI'
        })
      });

    const s1 = await createStudent(1, true);
    const s2 = await createStudent(2, false);
    const s1Id = s1.json?.studentId;
    const s2Id = s2.json?.studentId;
    assert(checks, 'create student #1', s1.status === 201 && !!s1Id, `status=${s1.status}`);
    assert(checks, 'create student #2', s2.status === 201 && !!s2Id, `status=${s2.status}`);

    const txAdmission = await api(base, `/fees/transactions?studentId=${s1Id}`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'x-school-id': SCHOOL_ID }
    });
    const admissionCreated = Array.isArray(txAdmission.json) && txAdmission.json.some((t) => t.metadata?.feeType === 'ADMISSION');
    assert(checks, 'admission auto-transaction', admissionCreated, `status=${txAdmission.status}`);

    const negative = await api(base, '/fees/pay', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ studentId: s1Id, feeType: 'TUITION', amount: -500, paymentMode: 'UPI' })
    });
    assert(checks, 'negative amount rejected', negative.status === 400, `status=${negative.status}`);

    const pay = async (paymentPlan, monthsCount) =>
      api(base, '/fees/pay', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ studentId: s1Id, feeType: 'TUITION', paymentPlan, monthsCount, paymentMode: 'UPI' })
      });

    const monthly = await pay('MONTHLY');
    const quarterly = await pay('QUARTERLY');
    const yearly = await pay('YEARLY');
    const custom2 = await pay('CUSTOM', 2);
    assert(checks, 'monthly amount', monthly.status === 201 && monthly.json?.amount === 2500, `status=${monthly.status}, amount=${monthly.json?.amount}`);
    assert(checks, 'quarterly amount', quarterly.status === 201 && quarterly.json?.amount === 7500, `status=${quarterly.status}, amount=${quarterly.json?.amount}`);
    assert(checks, 'yearly amount', yearly.status === 201 && yearly.json?.amount === 30000, `status=${yearly.status}, amount=${yearly.json?.amount}`);
    assert(checks, 'custom(2) amount', custom2.status === 201 && custom2.json?.amount === 5000, `status=${custom2.status}, amount=${custom2.json?.amount}`);

    const studentEmail = `smoke.student.1.${ts}@example.com`;
    const studentLogin = await api(base, '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: 'Smoke@2012' })
    });
    const studentToken = studentLogin.json?.token;
    assert(checks, 'student login', !!studentToken, `status=${studentLogin.status}`);

    if (studentToken) {
      const sHeaders = { Authorization: `Bearer ${studentToken}`, 'x-school-id': SCHOOL_ID, 'content-type': 'application/json' };
      const own = await api(base, '/fees/my', { headers: sHeaders });
      assert(checks, 'student own fee access', own.status === 200, `status=${own.status}`);

      const other = await api(base, `/fees/student/${s2Id}`, { headers: sHeaders });
      assert(checks, 'student blocked from other fee data', other.status === 403, `status=${other.status}`);

      const spoof = await api(base, '/fees/pay', {
        method: 'POST',
        headers: sHeaders,
        body: JSON.stringify({ studentId: s2Id, feeType: 'TUITION', paymentPlan: 'MONTHLY', paymentMode: 'UPI' })
      });
      assert(checks, 'student spoof payment prevented', spoof.status === 201, `status=${spoof.status} (server binds own identity)`);

      const txOwn = await api(base, `/fees/transactions?studentId=${s1Id}`, {
        headers: { Authorization: `Bearer ${adminToken}`, 'x-school-id': SCHOOL_ID }
      });
      const ownTxId = txOwn.json?.[0]?.id;
      if (ownTxId) {
        const ownInvoice = await api(base, `/fees/invoice/${ownTxId}`, { headers: { Authorization: `Bearer ${studentToken}`, 'x-school-id': SCHOOL_ID } });
        assert(checks, 'student own invoice access', ownInvoice.status === 200, `status=${ownInvoice.status}`);
      }
    }

    const injection = await api(base, '/fees/pay', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ studentId: "abc' OR '1'='1", feeType: 'TUITION', paymentPlan: 'MONTHLY', paymentMode: 'UPI' })
    });
    assert(checks, 'injection payload rejected', injection.status === 400, `status=${injection.status}`);

    const failed = checks.filter((c) => !c.pass);
    console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} passed`);
    if (failed.length > 0) {
      console.error('\nFailed checks:', failed);
      process.exitCode = 1;
    }
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
