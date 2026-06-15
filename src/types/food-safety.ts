// ============================================================
// Food Safety Types — Placeholder for future SFBB integration
// ============================================================
// SFBB diary data lives in the external SFBB app.
// These types will be populated when the SFBB API integration
// is built in a future migration (010_sfbb_integration.sql).

export interface SFBBIntegrationSettings {
  id: string
  app_url: string | null
  api_key_hash: string | null
  sync_enabled: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

// Future types — will expand when SFBB integration is built:
// export interface TemperatureLog { ... }
// export interface OpeningChecklist { ... }
// export interface ClosingChecklist { ... }
// export interface AllergenMatrix { ... }
// export interface IncidentLog { ... }
