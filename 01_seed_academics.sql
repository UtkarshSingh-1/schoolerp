-- =========================
-- INITIAL CLASSES & SECTIONS
-- =========================
INSERT INTO classes (name, section, room_no, maximum_capacity) VALUES 
('Class I', 'A', '101', 30),
('Class I', 'B', '102', 30),
('Class II', 'A', '201', 35),
('Class IX', 'A', '901', 40),
('Class IX', 'B', '902', 40),
('Class X', 'A', '1001', 40),
('Class XI', 'A-Sci', '1101', 35),
('Class XI', 'B-Com', '1102', 35),
('Class XII', 'A-Sci', '1201', 35),
('Class XII', 'B-Com', '1202', 35)
ON CONFLICT DO NOTHING;

-- =========================
-- SUBJECTS
-- =========================
INSERT INTO subjects (name, code) VALUES 
('Mathematics', 'MATH-01'),
('Science', 'SCI-01'),
('English Literature', 'ENG-01'),
('History', 'HIST-01'),
('Computer Science', 'CS-01'),
('Physics', 'PHYS-01'),
('Chemistry', 'CHEM-01'),
('Accountancy', 'ACC-01'),
('Economics', 'ECO-01')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- ENTRANCE EXAMS
-- =========================
INSERT INTO entrance_exams (title, exam_date, start_time, duration_minutes, total_marks) VALUES 
('Class XI Entrance 2026', '2026-03-15', '10:00:00', 120, 100),
('Class IX Entrance 2026', '2026-03-20', '10:00:00', 120, 100)
ON CONFLICT DO NOTHING;
