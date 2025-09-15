-- ===========================================
-- Table: locations
-- ===========================================
CREATE TABLE public.locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location GEOGRAPHY (Point, 4326),
  company_id INT NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  country_id INT NOT NULL REFERENCES public.countries (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Table: company_categories
-- ===========================================
CREATE TABLE public.company_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.company_categories_companies (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  company_category_id INT NOT NULL REFERENCES public.company_categories (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
