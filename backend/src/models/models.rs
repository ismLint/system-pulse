use chrono::{DateTime, Utc};
use serde::{Deserialize, Seriaize};

// User List
#[derive(Debug, Serialize, Deserialize, Clone, PatialEq, sqlx::Type)]
#[sql(rename_all = "lowercase")]
pub enum UserRole {
    User,
    Admin,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub tier: SubsciptionTier,
    pub subscription_ends_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

// Agent Section
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryUsage {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiskUsage {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IncomingPacket {
    pub id: i64,
    pub cpu_usage: f64,
    pub cpu_temp: Option<f32>,
    pub memory_usage: MemoryUsage,
    pub disk_usage: DiskUsage,
    pub timestamp: String,
}

//Status Area
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, sqlx::Type)]
#[sqlx(rename_all = "lowercase")]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
    Offline,
    Unknow,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Server {
    pub id: i64,
    pub owner_user_id: i64,
    pub name: String,
    pub host: String,
    pub port: i32,
    pub status: HealthStatus,
}
