-- Initial migration for Planix 2.0 on Cloudflare D1 (SQLite)
-- Schema auto-matched to production Supabase tables
-- Updated: 2026-06-13

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'teacher',
    school_name TEXT,
    regional TEXT,
    distrito TEXT,
    preferences TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    municipio TEXT,
    nivel_principal TEXT,
    ciclo_principal TEXT,
    grado_principal TEXT,
    asignaturas TEXT,
    jornada TEXT,
    year_escolar_activo TEXT,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_expiry TEXT,
    last_login TEXT,
    current_plan_id TEXT,
    allowed_subjects TEXT,
    phone TEXT,
    provincia TEXT,
    codigo_centro TEXT,
    community_bio TEXT,
    polar_customer_id TEXT,
    is_ambassador INTEGER DEFAULT 0,
    fingerprint TEXT,
    credits INTEGER DEFAULT 100
);

-- 2. Classrooms Table
CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT,
    grade TEXT,
    section TEXT,
    academic_year TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    student_id_number TEXT,
    gender TEXT,
    birth_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    order_number INTEGER,
    address TEXT,
    avatar_url TEXT
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE CASCADE,
    date TEXT,
    status TEXT DEFAULT 'P',
    notes TEXT DEFAULT 'regular',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Plannings Table
CREATE TABLE IF NOT EXISTS plannings (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    type TEXT DEFAULT 'CURRICULAR',
    subject_id TEXT,
    grade_id TEXT,
    status TEXT DEFAULT 'Borrador',
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_public INTEGER DEFAULT 0
);

-- 6. Rubrics Table
CREATE TABLE IF NOT EXISTS rubrics (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    subject_id TEXT,
    criteria TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    type TEXT DEFAULT 'RUBRIC'
);

-- 7. Rubric Classroom Metadata Table
CREATE TABLE IF NOT EXISTS rubric_classroom_metadata (
    rubric_id TEXT REFERENCES rubrics(id) ON DELETE CASCADE,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE CASCADE,
    indicators TEXT,
    competencies TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rubric_id, classroom_id)
);

-- 8. Student Evaluations Table
CREATE TABLE IF NOT EXISTS student_evaluations (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    rubric_id TEXT REFERENCES rubrics(id) ON DELETE CASCADE,
    subject_id TEXT DEFAULT 'GENERAL',
    evaluation_type TEXT DEFAULT 'RUBRIC',
    score REAL,
    competency_level TEXT,
    feedback TEXT,
    date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. Anecdotal Records Table
CREATE TABLE IF NOT EXISTS anecdotal_records (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id TEXT,
    date TEXT,
    period TEXT DEFAULT 'P1',
    area TEXT DEFAULT 'Académica',
    description TEXT,
    comment TEXT DEFAULT 'guardado',
    is_weakness INTEGER DEFAULT 0,
    strategy TEXT,
    result TEXT,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    points INTEGER
);

-- 10. School Incidents Table
CREATE TABLE IF NOT EXISTS school_incidents (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    teacher_id TEXT,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE SET NULL,
    incident_date TEXT,
    incident_time TEXT,
    location TEXT,
    incident_type TEXT DEFAULT 'leve',
    description TEXT,
    involved_people TEXT,
    actions_taken TEXT,
    observations TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 11. Official Grades Table
CREATE TABLE IF NOT EXISTS official_grades (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id TEXT,
    competency_id TEXT,
    p1 INTEGER,
    rp1 INTEGER,
    p2 INTEGER,
    rp2 INTEGER,
    p3 INTEGER,
    rp3 INTEGER,
    p4 INTEGER,
    rp4 INTEGER,
    competency_average INTEGER,
    academic_year TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 12. Subject Summaries Table
CREATE TABLE IF NOT EXISTS subject_summaries (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    classroom_id TEXT REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id TEXT,
    final_area_grade INTEGER,
    rp_final INTEGER,
    rp_especial INTEGER,
    status TEXT,
    academic_year TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 13. Schools Table (Centros educativos de la República Dominicana)
CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT,
    regional TEXT,
    district TEXT,
    municipality TEXT
);

-- Database indexes for query optimization on edge nodes
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_classroom ON students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_attendance_classroom ON attendance(classroom_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_plannings_user ON plannings(user_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_teacher ON rubrics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON student_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_rubric ON student_evaluations(rubric_id);
CREATE INDEX IF NOT EXISTS idx_anecdotal_student ON anecdotal_records(student_id);
CREATE INDEX IF NOT EXISTS idx_anecdotal_classroom ON anecdotal_records(classroom_id);
CREATE INDEX IF NOT EXISTS idx_incidents_student ON school_incidents(student_id);
CREATE INDEX IF NOT EXISTS idx_official_grades_classroom ON official_grades(classroom_id);
CREATE INDEX IF NOT EXISTS idx_official_grades_student ON official_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_summaries_classroom ON subject_summaries(classroom_id);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);

-- 14. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY,
    docente_id TEXT,
    docente_nombre TEXT,
    docente_rol TEXT,
    contenido TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    liked_by TEXT, -- JSON text
    bookmarked_by TEXT, -- JSON text
    creado_en TEXT,
    comentarios TEXT, -- JSON text
    comments_disabled INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_community_posts_docente ON community_posts(docente_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_creado ON community_posts(creado_en);

-- 15. Custom Sequences Table
CREATE TABLE IF NOT EXISTS custom_sequences (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    grade_id TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
