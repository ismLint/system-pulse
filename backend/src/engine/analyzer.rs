use crate::models::models::{HealthStatus, IncomingPacket};

pub struct Analyzer;

impl Analyzer {
    pub fn analyze_packet(packet: &IncomingPacket) -> HealthStatus {
        // check critical cpu > 90% or ram > 90%
        if packet.cpu_usage >= 90.0 || Self::calculate_ram_usage_pct(packet) >= 90.0 {
            return HealthStatus::Critical;
        }

        // check warning cpu > 75% or ram > 80%
        if packet.cpu_usage >= 75.0 || Self::calculate_ram_usage_pct(packet) >= 80.0 {
            return HealthStatus::Warning;
        }

        // if temperature > 80C* == warning
        if let Some(temp) = packet.cpu_temp {
            if temp >= 80.0 {
                return HealthStatus::Warning;
            }
        }

        // all more == ok
        HealthStatus::Healthy
    }

    // for calculate usage ram
    fn calculate_ram_usage_pct(packet: &IncomingPacket) -> f64 {
        if packet.memory_usage.total == 0 {
            return 0.0;
        }
        (packet.memory_usage.used as f64 / packet.memory_usage.total as f64) * 100
    }
}
