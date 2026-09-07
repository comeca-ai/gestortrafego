-- gestortrafego D1 — initial schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  product TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'paused')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_campaigns_product ON campaigns (product);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);

CREATE TABLE IF NOT EXISTS metric_events (
  id TEXT PRIMARY KEY,
  product TEXT NOT NULL,
  event TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 1,
  at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_metric_product_at ON metric_events (product, at);
