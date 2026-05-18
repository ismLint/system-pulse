pub mod models;
pub mod engine;
pub mod api;
pub mod network;
pub mod auth;
mod servers;
mod metrics;

use tokio::sync::broadcast;
use models::IncomingPacket;

pub struct AppState {
    pub pool: sqlx::PgPool,
    pub tx: broadcast::Sender<IncomingPacket>,
}