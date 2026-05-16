
CREATE TABLE servers (
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL UNIQUE,
                         status VARCHAR(20) NOT NULL DEFAULT 'Healthy',
                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE metrics (
                         id BIGSERIAL PRIMARY KEY,
                         server_id INT REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
                         cpu_usage DOUBLE PRECISION NOT NULL,
                         ram_usage DOUBLE PRECISION NOT NULL,
                         cpu_temp DOUBLE PRECISION,
                         top_processes JSONB NOT NULL,
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

INSERT INTO servers (id, name, status, updated_at)
VALUES (1, 'Main-Production-Server', 'Healthy', NOW())
ON CONFLICT (id) DO NOTHING;