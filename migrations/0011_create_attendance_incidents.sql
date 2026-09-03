-- ====================================================================
-- MIGRATION: 0011_create_attendance_incidents.sql (Supabase PostgreSQL)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.attendance_incidents (
    id TEXT PRIMARY KEY,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,                         -- Formato: YYYY-MM-DD
    type TEXT NOT NULL DEFAULT 'salida_anticipada', -- salida_anticipada, suspension_clases, huelga_gremial, etc.
    title TEXT NOT NULL,                        -- Motivo principal o resumen
    description TEXT,                           -- Detalles u observaciones
    departure_time TEXT,                        -- Ej: "11:30 AM" (opcional)
    affected_attendance INTEGER DEFAULT 1,      -- 1 = sí afectó la docencia, 0 = no
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_attendance_incidents_classroom_date 
ON public.attendance_incidents(classroom_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_incidents_teacher 
ON public.attendance_incidents(teacher_id);

CREATE INDEX IF NOT EXISTS idx_attendance_incidents_date 
ON public.attendance_incidents(date);

-- ====================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ====================================================================

ALTER TABLE public.attendance_incidents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance_incidents' AND policyname = 'Enable all access for authenticated users'
    ) THEN
        CREATE POLICY "Enable all access for authenticated users" 
        ON public.attendance_incidents 
        FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'attendance_incidents' AND policyname = 'Enable read/write for anon'
    ) THEN
        CREATE POLICY "Enable read/write for anon" 
        ON public.attendance_incidents 
        FOR ALL 
        TO anon 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

COMMENT ON TABLE public.attendance_incidents IS 'Registro de bitácora, salidas anticipadas, huelgas y novedades diarias de asistencia del aula virtual';
