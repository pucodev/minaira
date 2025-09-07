-- =====================================================
-- migration_add_triggers.sql
-- Creates set_updated_at triggers for tables defined in the array
-- Only if they don't exist
-- =====================================================

-- ===========================================
-- Function to automatically update updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- Array of tables that should have triggers
-- ===========================================
DO $$
DECLARE
    table_list text[] := ARRAY['users', 'companies', 'user_companies', 'countries', 'currencies'];
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY table_list
    LOOP
        -- Solo crear trigger si no existe
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname = 'trg_' || tbl || '_updated_at'
            AND tgrelid = tbl::regclass
        ) THEN
            RAISE NOTICE 'Creating trigger for table: %', tbl;
            EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', tbl, tbl);
        ELSE
            RAISE NOTICE 'Trigger already exists for table: %', tbl;
        END IF;
    END LOOP;
END$$;

