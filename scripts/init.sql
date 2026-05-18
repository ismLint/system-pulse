DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_tier') THEN
            CREATE TYPE user_tier AS ENUM ('free', 'premium', 'admin');
        END IF;
    END$$;

CREATE TABLE IF NOT EXISTS servers (
                                       id SERIAL PRIMARY KEY,
                                       name VARCHAR(100) NOT NULL UNIQUE,
                                       status VARCHAR(20) NOT NULL DEFAULT 'Healthy',
                                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics (
                                       id BIGSERIAL PRIMARY KEY,
                                       server_id INT REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
                                       cpu_usage DOUBLE PRECISION NOT NULL,
                                       ram_usage DOUBLE PRECISION NOT NULL,
                                       cpu_temp DOUBLE PRECISION,
                                       top_processes JSONB NOT NULL,
                                       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(50) UNIQUE NOT NULL,
                                     password_hash VARCHAR(100) NOT NULL,
                                     tier user_tier NOT NULL DEFAULT 'free'::user_tier,
                                     premium_expires_at TIMESTAMP WITH TIME ZONE,
                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);