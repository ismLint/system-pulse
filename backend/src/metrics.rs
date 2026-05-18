use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::{PgPool, Pool};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct IncomingMetrics {
    pub server_id: i32,
    pub cpu_usage: f64,
    pub ram_usage: f64,
    pub cpu_temp: Option<f64>,
    pub top_processes: serde_json::Value,
}

pub async fn save_metrics_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<IncomingMetrics>
) -> Result<StatusCode, (StatusCode, String)> {
    sqlx::query(
        r#"
        INSERT INTO metrics (server_id, cpu_usage, ram_usage, cpu_temp, top_processes, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        "#
    )
        .bind(payload.server_id)
        .bind(payload.cpu_usage)
        .bind(payload.ram_usage)
        .bind(payload.cpu_temp)
        .bind(payload.top_processes)
        .execute(&pool)
        .await
        .map_err(|e| {
            println!("Error saving metrics: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        })?;

    Ok(StatusCode::OK)
}