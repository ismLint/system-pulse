use crate::models::IncomingPacket;

pub struct Analyzer;

impl Analyzer {
    pub fn determine_status(packet: &IncomingPacket) -> &'static str {
        // Evaluate host hardware status based on safety thresholds
        if let Some(temp) = packet.cpu_temp {
            if temp > 85.0 { return "Critical"; }
            if temp > 75.0 { return "Warning"; }
        }

        if packet.cpu_usage > 90.0 || packet.ram_usage > 90.0 {
            return "Critical";
        }
        if packet.cpu_usage > 70.0 || packet.ram_usage > 70.0 {
            return "Warning";
        }

        "Healthy"
    }
}