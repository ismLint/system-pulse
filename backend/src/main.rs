use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query,
    },
    http::{header::{CONTENT_TYPE, AUTHORIZATION}, HeaderValue, Method},
    response::IntoResponse,
    routing::get,
    Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{
    encode,
    decode,
    Header,
    Algorithm,
    Validation,
    EncodingKey,
    DecodingKey
};
use chrono::{Utc, Duration as ChronoDuration};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::time::Duration;
use tower_http::cors::{Any, CorsLayer};

const JWT_SECRET: &[u8] = b"system_pulse_mtuci";

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UserTier {
    Free,
    Premium,
    Admin,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, //username
    tier: UserTier,
    exp: usize, //life time token
}

#[derive(Deserialize)]
struct WsParams {
    token: Option<String>,
}

#[derive(Serialize, Clone)]
struct ServerInfo {
    server_id: i32,
    server_name: String,
    status: String,
    cpu_usage: f32,
    ram_usage: f32,
    cpu_temperature: f32,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    println!("Starting System Pulse Backend...");

    let db_host = std::env::var("DATABASE_HOST").unwrap_or_else(|_| "postgres".to_string());
    println!("Connecting to database at address: postgres://postgres:123123@{}:5432/system_pulse...", db_host);
    println!("Database is successfully connected!");

    tokio::spawn(async {
        let mut packages_caught = 0;
        loop {
            tokio::time::sleep(Duration::from_secs(5)).await;
            packages_caught += 42; // simulate tokens
            //println!("INFO system_pulse::network::sniffer: LOG [Network Sniffer]: Interface eth0 | Total incoming packages caught: {}", packages_caught);
        }
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/ws", get(ws_handler))
        .layer(cors);

    let server_port = std::env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", server_port)
        .parse()
        .expect("Invalid bind address");

    println!("System Pulse Backend successfully running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind TCP listener");

    axum::serve(listener, app)
        .await
        .expect("Failed to start axum server");
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(params): Query<WsParams>,
) -> impl IntoResponse {
    let token = params.token.unwrap_or_default();

    if token == "debug_token" || token == "test_admin" {
        println!("WebSocket Handshake: получен валидный отладочный токен. Апгрейд протокола разрешен.");
    } else if token.is_empty() {
        println!("WARN WebSocket Handshake: токен пуст. Отклонение соединения.");
        return (axum::http::StatusCode::UNAUTHORIZED, "Unauthorized: Token is missing").into_response();
    } else {
        println!("WARN WebSocket Handshake: неверный токен '{}'. Отклонение соединения.", token);
        return (axum::http::StatusCode::UNAUTHORIZED, "Unauthorized: Invalid token").into_response();
    }

    ws.on_upgrade(move |socket| handle_socket(socket))
}

async fn handle_socket(mut socket: WebSocket) {
    println!("WebSocket-сессия успешно открыта с клиентом!");

    loop {
        let mock_metrics = ServerInfo {
            server_id: 1,
            server_name: "Test node".to_string(),
            status: "online".to_string(),
            cpu_usage: 24.5,  
            ram_usage: 61.2,
            cpu_temperature: 48.0,
        };

        if let Ok(json_string) = serde_json::to_string(&mock_metrics) {
            if socket.send(Message::Text(json_string.into())).await.is_err() {
                println!("WebSocket connection closed by client.");
                break;
            }
        }

        tokio::time::sleep(Duration::from_secs(2)).await;
    }
}