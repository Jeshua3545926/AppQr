-- Script SQL para crear las tablas en Supabase (PostgreSQL)
-- Ejecuta esto en el SQL Editor de Supabase: https://supabase.com/dashboard/project/_/sql/new

-- Habilitar extensión uuid-ossp para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: empleado
CREATE TABLE IF NOT EXISTS empleado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: locales
CREATE TABLE IF NOT EXISTS locales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_local VARCHAR(255) NOT NULL,
    qr_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: admin
CREATE TABLE IF NOT EXISTS admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email TEXT,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_security TEXT,
    smtp_email TEXT,
    smtp_password TEXT,
    admin_email_destino TEXT,
    sendgrid_api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: qr_tokens
CREATE TABLE IF NOT EXISTS qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID REFERENCES empleado(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    fecha_creacion VARCHAR(50),
    local_id UUID REFERENCES locales(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: registros_asistencia
CREATE TABLE IF NOT EXISTS registros_asistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID REFERENCES empleado(id) ON DELETE CASCADE,
    locales_id UUID REFERENCES locales(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    token_id UUID REFERENCES qr_tokens(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: qrs_generados (para QRs personalizados)
CREATE TABLE IF NOT EXISTS qrs_generados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_local TEXT NOT NULL,
    nombre_empleado TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    token TEXT NOT NULL,
    admin_id UUID REFERENCES admin(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visible INTEGER DEFAULT 1,
    qr_imagen TEXT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_empleado ON qr_tokens(empleado_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_local ON qr_tokens(local_id);
CREATE INDEX IF NOT EXISTS idx_registros_asistencia_empleado ON registros_asistencia(empleado_id);
CREATE INDEX IF NOT EXISTS idx_registros_asistencia_locales ON registros_asistencia(locales_id);
CREATE INDEX IF NOT EXISTS idx_registros_asistencia_fecha ON registros_asistencia(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_qrs_generados_token ON qrs_generados(token);
CREATE INDEX IF NOT EXISTS idx_qrs_generados_visible ON qrs_generados(visible);

-- Insertar admin por defecto (cambia la contraseña en producción)
INSERT INTO admin (nombre, username, password)
VALUES ('Admin', 'admin', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
ON CONFLICT (username) DO NOTHING;



SELECT *  FROM admin;
