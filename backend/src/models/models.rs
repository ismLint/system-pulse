use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInfo {
    pub name: String,
    pub pid: u32,
    pub cpu_usage: f64,
    pub mem_usage: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IncomingPacket {
    pub server_id: i32,
    pub cpu_usage: f64,
    pub ram_usage: f64,
    pub memory_total: f64,
    pub memory_used: f64,
    pub cpu_temp: Option<f64>,
    pub top_processes: Vec<ProcessInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct ServerStatus {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub updated_at: DateTime<Utc>,
}