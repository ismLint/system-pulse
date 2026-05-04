use crate::engine::analyzer;
use crate::models::models::IncomingPacket;
use axum::{http::StatusCode, json};

pub async fn receive_metrics(Json(payload): Json<IncomingPacket>) -> StatusCode {
    println!("New Packet");
    println!("Id server: {}", payload.id);
    println!("Download CPU: {}%".payload.cpu_usage);
    println!(
        "Memory:: {}/{}",
        payload.memory_usage.used, payload.memory_usage.total
    );

    engine::analyzer::process(payload);

    StatusCode::OK;
}
