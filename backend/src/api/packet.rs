use axum::{extract::State, http::StatusCode, Json};
use std::sync::Arc;
use crate::AppState;
use crate::models::IncomingPacket;
use crate::engine::analyzer::Analyzer;

pub async fn receive_metrics(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<IncomingPacket>,
) -> Result<StatusCode, (StatusCode, String)> {

    // Evaluate operational metrics thresholds
    let status = Analyzer::determine_status(&payload);

    // Serialize process vectors to valid jsonb value for database persistence
    let processes_json = serde_json::to_value(&payload.top_processes)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Record system data into historical logs
    sqlx::query!(
        "INSERT INTO metrics (server_id, cpu_usage, ram_usage, cpu_temp, top_processes) VALUES ($1, $2, $3, $4, $5)",
        payload.server_id,
        payload.cpu_usage,
        payload.ram_usage,
        payload.cpu_temp,
        processes_json
    )
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Update global status record for active servers tracking
    sqlx::query!(
    "UPDATE servers SET status = $1, updated_at = NOW() WHERE id = $2",
    status,
    payload.server_id
)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Broadcast current state update across listening frontend websocket sessions
    let _ = state.tx.send(payload);

    Ok(StatusCode::OK)
}