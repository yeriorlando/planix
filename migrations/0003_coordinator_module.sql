-- Migration for Supabase (PostgreSQL): Complete Coordinator Module
-- Created: 2026-06-27

-- 1. Bitácora del Coordinador
CREATE TABLE IF NOT EXISTS coordinator_logs (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    category TEXT NOT NULL, -- Acompañamiento docente, Estudiantes, Gestión institucional, Familias, Seguimientos, Incidencias
    description TEXT NOT NULL,
    involved_people TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente', -- Resuelto, Pendiente, Urgente, Dar seguimiento
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Acompañamientos / Observaciones de Clase
CREATE TABLE IF NOT EXISTS coordinator_observations (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    observation_date TEXT NOT NULL,
    next_observation_date TEXT,
    score INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendiente', -- Acompañado, Pendiente, Req. seguimiento
    observations TEXT, -- Notas detalladas de observación
    positive_feedback TEXT,
    areas_of_improvement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Acuerdos de Mejora
CREATE TABLE IF NOT EXISTS coordinator_agreements (
    id TEXT PRIMARY KEY,
    observation_id TEXT REFERENCES coordinator_observations(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    agreement_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendiente', -- Pendiente, Cumplido
    due_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reuniones de Coordinación
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

-- 5. Actas y Minutas de Reuniones
CREATE TABLE IF NOT EXISTS coordinator_meeting_minutes (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES coordinator_meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    participants TEXT, -- JSON text or simple text
    pending_signatures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Seguimiento a Estudiantes (Intervenciones)
CREATE TABLE IF NOT EXISTS coordinator_student_followups (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- Bajo rendimiento, Ausentismo, NEAE, Riesgo repitencia, Conducta
    responsible_id TEXT, -- Puede referenciar a un profile o ser texto descriptivo (ej: Psicóloga)
    last_intervention_date TEXT,
    status TEXT NOT NULL DEFAULT 'Pendiente', -- Urgente, Seguimiento, En proceso, Pendiente
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Evidencias del Banco (Enlaces y Recursos)
CREATE TABLE IF NOT EXISTS coordinator_evidences (
    id TEXT PRIMARY KEY,
    coordinator_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL, -- Foto, Documento, Comunicación, Acta
    file_tag TEXT, -- Digital, Firmado, Escaneado, Recibido
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_logs_coord ON coordinator_logs(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_observations_teacher ON coordinator_observations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_agreements_teacher ON coordinator_agreements(teacher_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_meetings_coord ON coordinator_meetings(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_student_followups_student ON coordinator_student_followups(student_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_evidences_coord ON coordinator_evidences(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_evidences_teacher ON coordinator_evidences(teacher_id);
