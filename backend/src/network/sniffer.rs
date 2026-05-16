use std::time::Duration;
use tokio::time::sleep;

pub struct NetworkSniffer;

impl NetworkSniffer {
    pub async fn start_sniffing(interface_name: &str) {
       // println!("Background packet network analyzer started on interface: {}", interface_name);

        let mut packet_count: u64 = 0;

        loop {
            // Simulate packet capture sampling interval loops
            sleep(Duration::from_secs(5)).await;
            packet_count += 42;

            tracing::info!(
                //"LOG [Network Sniffer]: Interface {} | Total incoming packages caught: {}",
                interface_name,
                packet_count
            );
        }
    }
}