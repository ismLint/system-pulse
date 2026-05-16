FROM rust:latest AS builder

WORKDIR /usr/src/system-pulse

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    libpcap-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY .sqlx ./.sqlx
COPY src ./src

ENV SQLX_OFFLINE=true

RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    libpcap0.8 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/system-pulse/target/release/system-pulse /app/system-pulse

EXPOSE 8080
CMD ["./system-pulse"]