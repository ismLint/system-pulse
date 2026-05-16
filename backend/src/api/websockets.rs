use axum::{
    extract::{State, ws::{WebSocket, WebSocketUpgrade, Message}},
    response::IntoResponse,
};
use std::sync::Arc;
use tokio::sync::broadcast;
use crate::AppState;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    // Upgrade connection to WebSocket protocol and move context to socket handler
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<AppState>) {
    // Subscribe locally to the shared application broadcast channel
    let mut rx = state.tx.subscribe();

    println!("Frontend web client established WebSocket subscription channel");

    loop {
        tokio::select! {
            // Listen for incoming broadcast packet distributions
            msg_res = rx.recv() => {
                match msg_res {
                    Ok(packet) => {
                        if let Ok(json_str) = serde_json::to_string(&packet) {
                            if socket.send(Message::Text(json_str.into())).await.is_err() {
                                println!("WebSocket subscriber connection dropped forcefully");
                                break;
                            }
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(skipped)) => {
                        eprintln!("Consumer client lagged behind and dropped {} packets", skipped);
                    }
                    Err(broadcast::error::RecvError::Closed) => {
                        break;
                    }
                }
            }

            // Track client connectivity status events
            client_msg = socket.recv() => {
                match client_msg {
                    Some(Ok(Message::Close(_))) | None => {
                        println!("WebSocket subscriber closed connection normally");
                        break;
                    }
                    _ => {}
                }
            }
        }
    }
}