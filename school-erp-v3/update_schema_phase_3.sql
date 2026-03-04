-- Phase 3 Schema Updates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    student_id UUID NOT NULL,
    lecture_id UUID,
    date DATE NOT NULL,
    status attendance_status DEFAULT 'PRESENT',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    marked_by UUID
);

-- Update Exam Attempt for scoring
ALTER TABLE exam_attempts 
ADD COLUMN IF NOT EXISTS score DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS grade VARCHAR(10);

-- Create Exam Responses if missing
CREATE TABLE IF NOT EXISTS exam_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    attempt_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
