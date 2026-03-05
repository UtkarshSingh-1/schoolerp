require('dotenv').config();
const app = require('../src/app');
const { ensureSchema } = require('../src/startup/ensureSchema');

const SCHOOL_ID = process.env.TEST_SCHOOL_ID || '66666666-6666-6666-6666-666666666666';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'superadmin@demo.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin@123';
const PORT = Number(process.env.TEST_ONBOARDING_PORT || 5022);

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

async function login(base, email, password) {
  return api(base, '/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

async function createStudent(base, adminHeaders, classId, ts) {
  return api(base, '/students', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: `Onboard Student ${String(ts).slice(-4)}`,
      dateOfBirth: '2012-03-05',
      gender: 'Male',
      bloodGroup: 'A+',
      category: 'General',
      aadhaarNumber: `${ts}`.slice(0, 12),
      classId,
      mobileNumber: `91111${String(ts).slice(-5)}`,
      email: `onboard.student.${ts}@example.com`,
      admissionFeeSubmitted: 'NO'
    })
  });
}

async function createTeacher(base, adminHeaders, ts) {
  return api(base, '/staff', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      role: 'TEACHER',
      firstName: 'Onboard',
      lastName: `Teacher${String(ts).slice(-4)}`,
      email: `onboard.teacher.${ts}@example.com`,
      phone: '9999911111'
    })
  });
}

async function completeOnboarding(base, token, newPassword, profilePhoto) {
  return api(base, '/auth/complete-onboarding', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-school-id': SCHOOL_ID,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ newPassword, profilePhoto })
  });
}

async function main() {
  await ensureSchema();
  const server = app.listen(PORT);
  const base = `http://localhost:${PORT}/api`;
  const checks = [];

  try {
    const adminLogin = await login(base, ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminToken = adminLogin.json?.token;
    assert(checks, 'admin login', !!adminToken, `status=${adminLogin.status}`);
    if (!adminToken) throw new Error('Admin login failed');

    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'x-school-id': SCHOOL_ID,
      'content-type': 'application/json'
    };

    const classes = await api(base, '/classes', { headers: { Authorization: `Bearer ${adminToken}`, 'x-school-id': SCHOOL_ID } });
    const classId = classes.json?.[0]?.id;
    assert(checks, 'class exists', !!classId, `status=${classes.status}`);
    if (!classId) throw new Error('No class available');

    const ts = Date.now();
    const studentCreate = await createStudent(base, adminHeaders, classId, ts);
    const teacherCreate = await createTeacher(base, adminHeaders, ts);
    assert(checks, 'student create', studentCreate.status === 201, `status=${studentCreate.status}`);
    assert(checks, 'teacher create', teacherCreate.status === 201, `status=${teacherCreate.status}`);

    const studentEmail = `onboard.student.${ts}@example.com`;
    const teacherEmail = `onboard.teacher.${ts}@example.com`;

    const studentLogin = await login(base, studentEmail, 'Onboard@2012');
    const teacherLogin = await login(base, teacherEmail, `Onboard@${new Date().getFullYear()}`);

    const studentToken = studentLogin.json?.token;
    const teacherToken = teacherLogin.json?.token;

    assert(checks, 'student first login works', !!studentToken, `status=${studentLogin.status}`);
    assert(checks, 'teacher first login works', !!teacherToken, `status=${teacherLogin.status}`);
    assert(checks, 'student onboarding required flag', studentLogin.json?.user?.onboardingRequired === true, `flag=${studentLogin.json?.user?.onboardingRequired}`);
    assert(checks, 'teacher onboarding required flag', teacherLogin.json?.user?.onboardingRequired === true, `flag=${teacherLogin.json?.user?.onboardingRequired}`);

    const adminOnboardingTry = await completeOnboarding(base, adminToken, 'AdminNew@123', 'data:image/png;base64,AA==');
    assert(checks, 'admin blocked from onboarding endpoint', adminOnboardingTry.status === 403, `status=${adminOnboardingTry.status}`);

    const studentMissingPhoto = await completeOnboarding(base, studentToken, 'StudNew@123', '');
    assert(checks, 'student onboarding requires photo', studentMissingPhoto.status === 400, `status=${studentMissingPhoto.status}`);

    const teacherWeakPassword = await completeOnboarding(base, teacherToken, '123', 'data:image/png;base64,AA==');
    assert(checks, 'teacher onboarding enforces password strength', teacherWeakPassword.status === 400, `status=${teacherWeakPassword.status}`);

    const studentComplete = await completeOnboarding(base, studentToken, 'StudNew@123', 'data:image/png;base64,AAA=');
    const teacherComplete = await completeOnboarding(base, teacherToken, 'TeachNew@123', 'data:image/png;base64,BBB=');
    assert(checks, 'student onboarding complete', studentComplete.status === 200, `status=${studentComplete.status}`);
    assert(checks, 'teacher onboarding complete', teacherComplete.status === 200, `status=${teacherComplete.status}`);

    const studentRelogin = await login(base, studentEmail, 'StudNew@123');
    const teacherRelogin = await login(base, teacherEmail, 'TeachNew@123');
    assert(checks, 'student relogin with new password', studentRelogin.status === 200, `status=${studentRelogin.status}`);
    assert(checks, 'teacher relogin with new password', teacherRelogin.status === 200, `status=${teacherRelogin.status}`);
    assert(checks, 'student onboarding cleared', studentRelogin.json?.user?.onboardingRequired === false, `flag=${studentRelogin.json?.user?.onboardingRequired}`);
    assert(checks, 'teacher onboarding cleared', teacherRelogin.json?.user?.onboardingRequired === false, `flag=${teacherRelogin.json?.user?.onboardingRequired}`);

    const failed = checks.filter((c) => !c.pass);
    console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} passed`);
    if (failed.length > 0) {
      console.error('Failed checks:', failed);
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
