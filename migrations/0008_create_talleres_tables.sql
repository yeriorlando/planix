-- Migration 0008: Create Workshops (Talleres) and Workshop Sessions (Clases) tables
-- Created: 2026-07-12

CREATE TABLE IF NOT EXISTS workshops (
    id TEXT PRIMARY KEY,
    docente_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo_taller TEXT NOT NULL,
    nivel TEXT NOT NULL,
    grado TEXT,
    competencias_especificas TEXT, -- Representación JSON (string[])
    indicadores TEXT, -- Representación JSON (string[])
    color TEXT,
    icono TEXT,
    gradiente TEXT,
    max_clases INTEGER DEFAULT 20,
    estado TEXT DEFAULT 'activo',
    creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshop_sessions (
    id TEXT PRIMARY KEY,
    taller_id TEXT REFERENCES workshops(id) ON DELETE CASCADE,
    numero_clase INTEGER NOT NULL,
    titulo TEXT,
    tema TEXT,
    objetivo TEXT,
    competencia_especifica TEXT,
    indicadores_logro TEXT, -- Representación JSON (string[])
    contenidos TEXT, -- Representación JSON objeto
    momentos TEXT, -- Representación JSON objeto
    recursos TEXT, -- Representación JSON (string[])
    evaluacion TEXT,
    duracion_minutos INTEGER DEFAULT 45,
    fecha TEXT,
    estado TEXT DEFAULT 'pendiente',
    creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workshops_docente ON workshops(docente_id);
CREATE INDEX IF NOT EXISTS idx_sessions_taller ON workshop_sessions(taller_id);
