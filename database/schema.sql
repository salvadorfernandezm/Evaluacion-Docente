-- Script SQL para Supabase - Sistema de Evaluación Docente
-- ============================================================

-- 1. Tabla de Períodos Semestrales
CREATE TABLE periodos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL UNIQUE, -- Ej: 2026A, 2026B
    activo BOOLEAN DEFAULT false,
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de Maestrías
CREATE TABLE maestrias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    activa BOOLEAN DEFAULT true,
    periodo_id UUID REFERENCES periodos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla de Especialidades
CREATE TABLE especialidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    maestria_id UUID REFERENCES maestrias(id) ON DELETE CASCADE,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabla de Profesores
CREATE TABLE profesores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    materia VARCHAR(255) NOT NULL,
    maestria_id UUID REFERENCES maestrias(id) ON DELETE CASCADE,
    especialidad_id UUID REFERENCES especialidades(id) ON DELETE SET NULL,
    es_basica BOOLEAN DEFAULT false,
    es_compartida BOOLEAN DEFAULT false,
    periodo_id UUID REFERENCES periodos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla de Evaluaciones
CREATE TABLE evaluaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    periodo_id UUID REFERENCES periodos(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    hora TIME DEFAULT CURRENT_TIME,
    
    -- Datos del alumno
    nombre_alumno VARCHAR(255) NOT NULL,
    apellidos_alumno VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Datos de la evaluación
    maestria_id UUID REFERENCES maestrias(id) ON DELETE CASCADE,
    especialidad_id UUID REFERENCES especialidades(id) ON DELETE SET NULL,
    profesor_id UUID REFERENCES profesores(id) ON DELETE CASCADE,
    
    -- 17 Reactivos (escala 0-10)
    reactivo_1 INTEGER CHECK (reactivo_1 >= 0 AND reactivo_1 <= 10),
    reactivo_2 INTEGER CHECK (reactivo_2 >= 0 AND reactivo_2 <= 10),
    reactivo_3 INTEGER CHECK (reactivo_3 >= 0 AND reactivo_3 <= 10),
    reactivo_4 INTEGER CHECK (reactivo_4 >= 0 AND reactivo_4 <= 10),
    reactivo_5 INTEGER CHECK (reactivo_5 >= 0 AND reactivo_5 <= 10),
    reactivo_6 INTEGER CHECK (reactivo_6 >= 0 AND reactivo_6 <= 10),
    reactivo_7 INTEGER CHECK (reactivo_7 >= 0 AND reactivo_7 <= 10),
    reactivo_8 INTEGER CHECK (reactivo_8 >= 0 AND reactivo_8 <= 10),
    reactivo_9 INTEGER CHECK (reactivo_9 >= 0 AND reactivo_9 <= 10),
    reactivo_10 INTEGER CHECK (reactivo_10 >= 0 AND reactivo_10 <= 10),
    reactivo_11 INTEGER CHECK (reactivo_11 >= 0 AND reactivo_11 <= 10),
    reactivo_12 INTEGER CHECK (reactivo_12 >= 0 AND reactivo_12 <= 10),
    reactivo_13 INTEGER CHECK (reactivo_13 >= 0 AND reactivo_13 <= 10),
    reactivo_14 INTEGER CHECK (reactivo_14 >= 0 AND reactivo_14 <= 10),
    reactivo_15 INTEGER CHECK (reactivo_15 >= 0 AND reactivo_15 <= 10),
    reactivo_16 INTEGER CHECK (reactivo_16 >= 0 AND reactivo_16 <= 10),
    reactivo_17 INTEGER CHECK (reactivo_17 >= 0 AND reactivo_17 <= 10),
    
    -- Comentarios
    comentarios TEXT,
    
    -- Consentimiento
    consentimiento_aceptado BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabla de Usuarios Administradores
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_maestrias_periodo ON maestrias(periodo_id);
CREATE INDEX idx_especialidades_maestria ON especialidades(maestria_id);
CREATE INDEX idx_profesores_maestria ON profesores(maestria_id);
CREATE INDEX idx_profesores_periodo ON profesores(periodo_id);
CREATE INDEX idx_evaluaciones_periodo ON evaluaciones(periodo_id);
CREATE INDEX idx_evaluaciones_profesor ON evaluaciones(profesor_id);
CREATE INDEX idx_evaluaciones_maestria ON evaluaciones(maestria_id);

-- Insertar período actual por defecto
INSERT INTO periodos (nombre, activo, fecha_inicio, fecha_fin) 
VALUES ('2026A', true, '2026-02-01', '2026-06-30');

-- Insertar usuario administrador por defecto (password: posgrado2026)
-- En producción, usar bcrypt para hashear la contraseña
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', 'posgrado2026', 'admin@posgrado.ujed.mx');

-- Comentarios sobre las tablas
COMMENT ON TABLE periodos IS 'Períodos semestrales de evaluación (2026A, 2026B, etc.)';
COMMENT ON TABLE maestrias IS 'Catálogo de maestrías del posgrado';
COMMENT ON TABLE especialidades IS 'Especialidades dentro de cada maestría';
COMMENT ON TABLE profesores IS 'Profesores y las materias que imparten';
COMMENT ON TABLE evaluaciones IS 'Evaluaciones realizadas por los alumnos';
COMMENT ON TABLE admin_users IS 'Usuarios con acceso al panel de administración';
