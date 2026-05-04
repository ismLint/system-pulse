CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan VARCHAR(16) NOT NULL DEFAULT 'Free' CHECK (plan IN ('Free', 'Premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS servers (
  id BIGSERIAL PRIMARY KEY,
  owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL CHECK (port > 0 AND port <= 65535),
  status VARCHAR(32) NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (host, port)
);

CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  cpu_usage DOUBLE PRECISION NOT NULL,
  ram_usage DOUBLE PRECISION NOT NULL,
  cpu_temp REAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servers_owner_user_id ON servers(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_server_recorded_at ON metrics(server_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS incidents (
  id BIGSERIAL PRIMARY KEY,
  server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_server_created_at ON incidents(server_id, created_at DESC);

CREATE OR REPLACE FUNCTION create_incident_on_critical_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Critical' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO incidents (server_id, previous_status, new_status, message)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      format('Server "%s" changed status from %s to %s', NEW.name, OLD.status, NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_servers_create_incident_on_critical ON servers;
CREATE TRIGGER trg_servers_create_incident_on_critical
AFTER UPDATE OF status ON servers
FOR EACH ROW
EXECUTE FUNCTION create_incident_on_critical_status();

CREATE OR REPLACE PROCEDURE prune_old_metrics()
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM metrics m
  USING servers s, users u
  WHERE m.server_id = s.id
    AND s.owner_user_id = u.id
    AND (
      (u.plan = 'Free' AND m.recorded_at < NOW() - INTERVAL '24 hours')
      OR
      (u.plan = 'Premium' AND m.recorded_at < NOW() - INTERVAL '1 month')
    );
END;
$$;
