use sqlx::PgPool;
use chrono::Utc;
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use chrono::Duration as ChronoDuration;

pub const JWT_SECRET: &[u8] = b"system_pulse_mtuci";

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UserTier {
    Free,
    Premium,
    Admin,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // username
    pub tier: UserTier,
    pub exp: usize, // expiration timestamp
}

pub fn generate_jwt(username: &str, tier: UserTier) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(ChronoDuration::hours(24))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: username.to_string(),
        tier,
        exp: expiration as usize,
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(JWT_SECRET))
}

pub fn validate_jwt(token: &str) -> Result<(String, UserTier), jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::HS256);
    decode::<Claims>(token, &DecodingKey::from_secret(JWT_SECRET), &validation)
        .map(|data| (data.claims.sub, data.claims.tier))
}

pub async fn check_and_update_tier(
    pool: &PgPool,
    username: &str,
    db_tier: &str,
    premium_expires_at: Option<chrono::DateTime<Utc>>,
) -> UserTier {
    let mut current_tier = match db_tier {
        "admin" => UserTier::Admin,
        "premium" => UserTier::Premium,
        _ => UserTier::Free,
    };

    if current_tier == UserTier::Premium {
        if let Some(expires_at) = premium_expires_at {
            if Utc::now() > expires_at {
                let _ = sqlx::query!(
                    "UPDATE users SET tier = 'free'::user_tier WHERE username = $1",
                    username
                )
                    .execute(pool)
                    .await;

                println!("INFO [Auth]: Подписка пользователя {} истекла. Сброшено до Free.", username);
                current_tier = UserTier::Free;
            }
        }
    }

    current_tier
}