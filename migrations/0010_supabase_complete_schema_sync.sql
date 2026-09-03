-- ====================================================================
-- MIGRATION: 0010_supabase_complete_schema_sync.sql
-- DESCRIPTION: Master synchronization script for Supabase PostgreSQL
-- Includes:
--   1. Students table tutor fields
--   2. Unique constraints & indexes for Attendance, Grades & Summaries
--   3. Complete Coordinator Module (7 tables & performance indexes)
-- ====================================================================

-- 1. EXTEND STUDENTS TABLE FOR TUTORS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tutor_nombre') THEN
        ALTER TABLE students ADD COLUMN tutor_nombre TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tutor_telefono') THEN
        ALTER TABLE students ADD COLUMN tutor_telefono TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'email_tutor') THEN
        ALTER TABLE students ADD COLUMN email_tutor TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tutor_relacion') THEN
        ALTER TABLE students ADD COLUMN tutor_relacion TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tutor2_nombre') THEN
        ALTER TABLE students ADD COLUMN tutor2_nombre TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tutor2_telefono') THEN
        ALTER TABLE students ADD COLUMN tutor2_telefono TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'tutor2_relacion') THEN
        ALTER TABLE students ADD COLUMN tutor2_relacion TEXT;
    END IF;
END $$;

-- 2. UNIQUE CONSTRAINTS FOR VIRTUAL CLASSROOM (AULA VIRTUAL)
-- A. Attendance unique constraint (student_id, date)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'attendance_student_id_date_key'
    ) THEN
        ALTER TABLE attendance ADD CONSTRAINT attendance_student_id_date_key UNIQUE (student_id, date);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_classroom_date ON attendance(classroom_id, date);

-- B. Official Grades unique constraint (student_id, subject_id, competency_id, academic_year)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'official_grades_unique_key'
    ) THEN
        ALTER TABLE official_grades ADD CONSTRAINT official_grades_unique_key UNIQUE (student_id, subject_id, competency_id, academic_year);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_official_grades_lookup ON official_grades(classroom_id, subject_id);

-- C. Subject Summaries unique constraint (student_id, subject_id, academic_year)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subject_summaries_unique_key'
    ) THEN
        ALTER TABLE subject_summaries ADD CONSTRAINT subject_summaries_unique_key UNIQUE (student_id, subject_id, academic_year);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subject_summaries_lookup ON subject_summaries(classroom_id, subject_id);

-- 3. COORDINATOR MODULE (7 TABLES)

-- Table 1: Bitácora
CREATE TABLE IF NOT EXISTS coordinator_logs (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    involved_people TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Acompañamientos y Observaciones
CREATE TABLE IF NOT EXISTS coordinator_observations (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    observation_date TEXT NOT NULL,
    next_observation_date TEXT,
    score INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    observations TEXT,
    positive_feedback TEXT,
    areas_of_improvement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Acuerdos y Compromisos
CREATE TABLE IF NOT EXISTS coordinator_agreements (
    id TEXT PRIMARY KEY,
    observation_id TEXT REFERENCES coordinator_observations(id) ON DELETE CASCADE,
    teacher_id REFERENCES profiles(id) ON DELETE CASCADE,
    coordinator_id REFERENCES profiles(id) ON DELETE CASCADE,
    agreement_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    due_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Reuniones
CREATE TABLE IF NOT EXISTS coordinator_meetings (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    meeting_time TEXT NOT NULL,
    location TEXT,
    invited_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: Actas y Minutas
CREATE TABLE IF NOT EXISTS coordinator_meeting_minutes (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES coordinator_meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    participants TEXT,
    pending_signatures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: Casos y Seguimientos a Estudiantes
CREATE TABLE IF NOT EXISTS coordinator_student_followups (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    responsible_id TEXT,
    last_intervention_date TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 7: Banco de Evidencias
CREATE TABLE IF NOT EXISTS coordinator_evidences (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL,
    file_tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coordinator Performance Indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_logs_coord ON coordinator_logs(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_observations_teacher ON coordinator_observations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_agreements_teacher ON coordinator_agreements(teacher_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_meetings_coord ON coordinator_meetings(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_student_followups_student ON coordinator_student_followups(student_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_evidences_coord ON coordinator_evidences(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_evidences_teacher ON coordinator_evidences(teacher_id);
