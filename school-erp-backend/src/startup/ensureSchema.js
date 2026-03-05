const pool = require('../config/db');

async function ensureSchema() {
  const schoolId = '66666666-6666-6666-6666-666666666666';

  await pool.query(`
    ALTER TABLE students
      ADD COLUMN IF NOT EXISTS blood_group TEXT,
      ADD COLUMN IF NOT EXISTS nationality TEXT,
      ADD COLUMN IF NOT EXISTS religion TEXT,
      ADD COLUMN IF NOT EXISTS category TEXT,
      ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
      ADD COLUMN IF NOT EXISTS birth_certificate_details TEXT,
      ADD COLUMN IF NOT EXISTS residential_address TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS state TEXT,
      ADD COLUMN IF NOT EXISTS pin_code TEXT,
      ADD COLUMN IF NOT EXISTS mobile_number TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact_number TEXT,
      ADD COLUMN IF NOT EXISTS father_name TEXT,
      ADD COLUMN IF NOT EXISTS father_occupation TEXT,
      ADD COLUMN IF NOT EXISTS father_qualification TEXT,
      ADD COLUMN IF NOT EXISTS father_mobile TEXT,
      ADD COLUMN IF NOT EXISTS mother_name TEXT,
      ADD COLUMN IF NOT EXISTS mother_occupation TEXT,
      ADD COLUMN IF NOT EXISTS mother_qualification TEXT,
      ADD COLUMN IF NOT EXISTS mother_mobile TEXT,
      ADD COLUMN IF NOT EXISTS guardian_name TEXT,
      ADD COLUMN IF NOT EXISTS previous_school_name TEXT,
      ADD COLUMN IF NOT EXISTS last_class_studied TEXT,
      ADD COLUMN IF NOT EXISTS previous_marks TEXT,
      ADD COLUMN IF NOT EXISTS transfer_certificate_details TEXT,
      ADD COLUMN IF NOT EXISTS report_card_details TEXT,
      ADD COLUMN IF NOT EXISTS birth_certificate_copy TEXT,
      ADD COLUMN IF NOT EXISTS passport_photo TEXT,
      ADD COLUMN IF NOT EXISTS teacher_passport_photo TEXT,
      ADD COLUMN IF NOT EXISTS aadhaar_copy TEXT,
      ADD COLUMN IF NOT EXISTS transfer_certificate_copy TEXT,
      ADD COLUMN IF NOT EXISTS address_proof_copy TEXT,
      ADD COLUMN IF NOT EXISTS caste_certificate_copy TEXT,
      ADD COLUMN IF NOT EXISTS transport_requirement TEXT,
      ADD COLUMN IF NOT EXISTS medical_history TEXT,
      ADD COLUMN IF NOT EXISTS sibling_in_school BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS parent_signature TEXT;
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_photo TEXT;
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS must_upload_photo BOOLEAN DEFAULT false;
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS employee_id TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
      ADD COLUMN IF NOT EXISTS gender TEXT,
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS qualification TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
      ADD COLUMN IF NOT EXISTS joining_date DATE;
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_users_school_employee_id
      ON users (school_id, employee_id)
      WHERE employee_id IS NOT NULL;
  `);

  await pool.query(`
    ALTER TABLE admissions
      ALTER COLUMN "email" DROP NOT NULL;
  `);

  await pool.query(
    `
    INSERT INTO roles (school_id, name, permissions)
    SELECT $1, v.name, '[]'::jsonb
    FROM (VALUES ('SCHOOL_ADMIN'), ('PRINCIPAL'), ('TEACHER'), ('STUDENT'), ('PARENT'), ('ACCOUNTANT'), ('STAFF')) AS v(name)
    WHERE NOT EXISTS (
      SELECT 1 FROM roles r WHERE r.school_id = $1 AND r.name = v.name
    );
    `,
    [schoolId]
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lectures (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id UUID NOT NULL,
      class_id UUID NOT NULL,
      day_of_week TEXT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      subject TEXT NOT NULL,
      teacher_id UUID NULL,
      teacher_name TEXT NULL,
      room_number TEXT NULL,
      status TEXT NOT NULL DEFAULT 'SCHEDULED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_lectures_class_day_start
      ON lectures (school_id, class_id, day_of_week, start_time);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_fee_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id UUID NOT NULL,
      class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      admission_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
      monthly_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(3) NOT NULL DEFAULT 'INR',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_class_fee_settings_school_class
      ON class_fee_settings (school_id, class_id);
  `);
}

module.exports = { ensureSchema };
