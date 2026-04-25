mod api;
mod engine;
mod models;
mod network;

use axum::{routing::post, Router};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/metrics", post(api::packet::receive_metrics));
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Project started at http://{}", addr);
    let lisner = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::server(listener, app).await.unwrap();
}
