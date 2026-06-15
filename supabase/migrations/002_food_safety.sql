-- ============================================================
-- Food Safety Placeholder
-- NOTE: SFBB diary tables are NOT built here.
-- All food safety diary functionality is managed by the external
-- SFBB web app. This table only tracks the integration link.
-- A future migration (010_sfbb_integration.sql) will extend this
-- table with webhook/sync fields when the SFBB API is connected.
-- ============================================================

CREATE TABLE sfbb_integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_url TEXT,
  api_key_hash TEXT,
  sync_enabled BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sfbb_integration_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_sfbb_updated_at BEFORE UPDATE ON sfbb_integration_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
