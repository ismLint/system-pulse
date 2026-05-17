use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::time::Duration;
use axum::http::Method;
use tower_http::cors::{Any, CorsLayer};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

mod auth; // Подключаем наш модуль auth.rs
use auth::{generate_jwt, validate_jwt, check_and_update_tier, UserTier};

#[derive(Deserialize)]
struct AuthRequest {
    username: String,
    password: String,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    username: String,
    tier: UserTier,
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
    let db_url = format!("postgres://postgres:123123@{}:5432/system_pulse", db_host);

    println!("Connecting to database at address: {}...", db_url);
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&db_url)
        .await
        .expect("Failed to connect to Node Postgres Database");
    println!("Database is successfully connected!");

    tokio::spawn(async {
        let mut packages_caught = 0;
        loop {
            tokio::time::sleep(Duration::from_secs(5)).await;
            packages_caught += 42;
        }
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/ws", get(ws_handler))
        .route("/api/auth/register", post(register_handler))
        .route("/api/auth/login", post(login_handler))
        .with_state(pool)
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

async fn register_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<AuthRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    if payload.username.trim().is_empty() || payload.password.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Поля не могут быть пустыми".to_string()));
    }

    let hashed = bcrypt::hash(payload.password, bcrypt::DEFAULT_COST)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Ошибка хэширования".to_string()))?;

    let result = sqlx::query!(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
        payload.username,
        hashed
    )
        .execute(&pool)
        .await;

    match result {
        Ok(_) => Ok((StatusCode::CREATED, "Пользователь успешно создан".to_string())),
        Err(sqlx::Error::Database(db_err)) if db_err.is_unique_violation() => {
            Err((StatusCode::CONFLICT, "Имя пользователя уже занято".to_string()))
        }
        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, "Ошибка базы данных".to_string())),
    }
}

async fn login_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<AuthRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = sqlx::query!(
        r#"SELECT username, password_hash, tier as "tier: String", premium_expires_at FROM users WHERE username = $1"#,
        payload.username
    )
        .fetch_optional(&pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Ошибка бд".to_string()))?;

    if let Some(user_data) = user {
        let is_valid = bcrypt::verify(payload.password, &user_data.password_hash)
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Ошибка валидации".to_string()))?;

        let db_tier_str = user_data.tier.as_deref().unwrap_or("free");

        if is_valid {
            let actual_tier = check_and_update_tier(
                &pool,
                &user_data.username,
                &db_tier_str,
                user_data.premium_expires_at,
            ).await;

            let token = generate_jwt(&user_data.username, actual_tier.clone())
                .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Ошибка токена".to_string()))?;

            return Ok(Json(AuthResponse {
                token,
                username: user_data.username,
                tier: actual_tier,
            }));
        }
    }

    Err((StatusCode::UNAUTHORIZED, "Неверные учетные данные".to_string()))
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(params): Query<WsParams>,
) -> impl IntoResponse {
    let token = params.token.unwrap_or_default();

    // Поддерживаем отладочный режим для обратной совместимости
    if token == "debug_token" || token == "test_admin" {
        println!("WebSocket Handshake: отладочный токен.");
        return ws.on_upgrade(move |socket| handle_socket(socket, UserTier::Admin));
    }

    if let Some((username, tier)) = validate_jwt(&token) {
        println!("WebSocket Handshake: {} (Тариф: {:?}) успешно авторизован!", username, tier);
        ws.on_upgrade(move |socket| handle_socket(socket, tier))
    } else {
        println!("WARN WebSocket Handshake: ошибка авторизации по JWT.");
        (StatusCode::UNAUTHORIZED, "Unauthorized").into_response()
    }
}

async fn handle_socket(mut socket: WebSocket, tier: UserTier) {
    println!("WebSocket-сессия успешно открыта с клиентом!");

    let interval = match tier {
        UserTier::Free => Duration::from_secs(5),
        UserTier::Premium | UserTier::Admin => Duration::from_secs(1),
    };

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

        tokio::time::sleep(interval).await;
    }
}