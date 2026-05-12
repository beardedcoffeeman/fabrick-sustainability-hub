-- Planning Explorer schema. Run once against the Neon DB when graduating
-- from JSON seed to live DB-backed data.

CREATE TABLE IF NOT EXISTS planning_applications (
  id                    TEXT PRIMARY KEY,
  reference             TEXT NOT NULL,
  lpa                   TEXT NOT NULL,
  region                TEXT NOT NULL,
  address               TEXT NOT NULL,
  postcode              TEXT,
  use_class             TEXT NOT NULL,
  sector                TEXT NOT NULL,
  description           TEXT NOT NULL,
  applicant             TEXT NOT NULL,
  agent                 TEXT,
  decision              TEXT NOT NULL,
  decision_date         DATE,
  gross_floor_area_sqm  INTEGER,
  source_url            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS planning_apps_sector_idx
  ON planning_applications (sector);
CREATE INDEX IF NOT EXISTS planning_apps_region_idx
  ON planning_applications (region);
CREATE INDEX IF NOT EXISTS planning_apps_decision_date_idx
  ON planning_applications (decision_date DESC);

CREATE TABLE IF NOT EXISTS planning_conditions (
  id              BIGSERIAL PRIMARY KEY,
  application_id  TEXT NOT NULL REFERENCES planning_applications(id) ON DELETE CASCADE,
  condition_number TEXT NOT NULL,
  condition_type  TEXT NOT NULL,
  summary         TEXT NOT NULL,
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS planning_conditions_type_idx
  ON planning_conditions (condition_type);
CREATE INDEX IF NOT EXISTS planning_conditions_app_idx
  ON planning_conditions (application_id);
