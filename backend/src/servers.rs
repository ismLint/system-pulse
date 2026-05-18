use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Pool};

#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct Server {
    pub id: i32,
    pub name: String,
    pub host: String,
    pub username: String,
    pub password: String,
    pub status: String,
}

#[derive(Deserialize)]
pub struct AddServerInput {
    pub name: String,
    pub host: String,
    pub username: String,
    pub password: String,
}

pub async fn get_servers_handler(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Server>>, (StatusCode, String)> {
    let servers = sqlx::query_as::<_, Server>("SELECT id, name, host, username, password, status FROM servers")
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(servers))
}

pub async fn add_server_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<AddServerInput>,
) -> Result<StatusCode, (StatusCode, String)> {
    sqlx::query(
        "INSERT INTO servers (id, name, host, username, password, status) VALUES ($1, $2, $3, $4, 'Healthy')"
    )
        .bind(payload.name)
        .bind(payload.host)
        .bind(payload.username)
        .bind(payload.password)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::CREATED)
}