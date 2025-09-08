-- ===========================================
-- Enum: company_role
-- ===========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_role') THEN
    CREATE TYPE company_role AS ENUM ('admin', 'staff', 'customer');
  END IF;
END$$;

-- ===========================================
-- Table: currencies
-- ===========================================
CREATE TABLE public.currencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  iso_code VARCHAR(10) UNIQUE NOT NULL,
  symbol VARCHAR(10),
  decimal_separator CHAR(1) DEFAULT '.',
  thousands_separator CHAR(1) DEFAULT ',',
  symbol_position VARCHAR(6) DEFAULT 'prefix',
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Table: countries
-- ===========================================
CREATE TABLE public.countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  iso_code VARCHAR(10) UNIQUE NOT NULL,
  default_currency_id INT NOT NULL REFERENCES public.currencies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Seed initial currencies
-- =====================================================
INSERT INTO public.currencies (
    iso_code,
    name,
    symbol,
    decimal_separator,
    thousands_separator,
    symbol_position
)
VALUES
  ('BRL', 'Brazilian Real', 'R$', ',', '.', 'prefix'),
  ('PEN', 'Peruvian Sol', 'S/.', '.', ',', 'prefix'),
  ('MXN', 'Mexican Peso', '$', '.', ',', 'prefix'),
  ('ARS', 'Argentine Peso', '$', ',', '.', 'prefix'),
  ('CLP', 'Chilean Peso', '$', ',', '.', 'prefix'),
  ('COP', 'Colombian Peso', '$', ',', '.', 'prefix'),
  ('UYU', 'Uruguayan Peso', '$', ',', '.', 'prefix'),
  ('PYG', 'Paraguayan Guaraní', '₲', ',', '.', 'prefix'),
  ('BOB', 'Bolivian Boliviano', 'Bs.', ',', '.', 'prefix'),
  ('ECU', 'US Dollar (Ecuador)', '$', '.', ',', 'prefix'),
  ('VEF', 'Venezuelan Bolívar', 'Bs.S', ',', '.', 'prefix'),
  ('GTQ', 'Guatemalan Quetzal', 'Q', '.', ',', 'prefix'),
  ('HNL', 'Honduran Lempira', 'L', '.', ',', 'prefix'),
  ('NIO', 'Nicaraguan Córdoba', 'C$', '.', ',', 'prefix'),
  ('CRC', 'Costa Rican Colón', '₡', '.', ',', 'prefix'),
  ('DOP', 'Dominican Peso', 'RD$', '.', ',', 'prefix');

-- =====================================================
-- Initial seed data for Latin American countries
-- =====================================================
INSERT INTO public.countries (name, iso_code, default_currency_id)
VALUES
  ('Brazil', 'BR', (SELECT id FROM public.currencies WHERE iso_code='BRL')),
  ('Peru', 'PE', (SELECT id FROM public.currencies WHERE iso_code='PEN')),
  ('Mexico', 'MX', (SELECT id FROM public.currencies WHERE iso_code='MXN')),
  ('Argentina', 'AR', (SELECT id FROM public.currencies WHERE iso_code='ARS')),
  ('Chile', 'CL', (SELECT id FROM public.currencies WHERE iso_code='CLP')),
  ('Colombia', 'CO', (SELECT id FROM public.currencies WHERE iso_code='COP')),
  ('Uruguay', 'UY', (SELECT id FROM public.currencies WHERE iso_code='UYU')),
  ('Paraguay', 'PY', (SELECT id FROM public.currencies WHERE iso_code='PYG')),
  ('Bolivia', 'BO', (SELECT id FROM public.currencies WHERE iso_code='BOB')),
  ('Ecuador', 'EC', (SELECT id FROM public.currencies WHERE iso_code='ECU')),
  ('Venezuela', 'VE', (SELECT id FROM public.currencies WHERE iso_code='VEF')),
  ('Guatemala', 'GT', (SELECT id FROM public.currencies WHERE iso_code='GTQ')),
  ('Honduras', 'HN', (SELECT id FROM public.currencies WHERE iso_code='HNL')),
  ('Nicaragua', 'NI', (SELECT id FROM public.currencies WHERE iso_code='NIO')),
  ('Costa Rica', 'CR', (SELECT id FROM public.currencies WHERE iso_code='CRC')),
  ('Dominican Republic', 'DO', (SELECT id FROM public.currencies WHERE iso_code='DOP'));


-- ===========================================
-- Table: users
-- ===========================================
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  country_id INT REFERENCES public.countries(id),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Table: companies
-- ===========================================
CREATE TABLE public.companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  country_id INT REFERENCES public.countries(id),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Relación: user_companies (muchos a muchos con rol)
-- ===========================================
CREATE TABLE public.user_companies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id INT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, company_id)
);
