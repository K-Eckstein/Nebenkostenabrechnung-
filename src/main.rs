use eframe::egui;

fn main() -> eframe::Result<()> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1200.0, 800.0])
            .with_title("Nebenkostenabrechnung"),
        ..Default::default()
    };
    
    eframe::run_native(
        "Nebenkostenabrechnung",
        options,
        Box::new(|_cc| Ok(Box::new(NebenkostenApp::default()))),
    )
}

struct NebenkostenApp {
    current_view: String,
}

impl Default for NebenkostenApp {
    fn default() -> Self {
        Self {
            current_view: "dashboard".to_string(),
        }
    }
}

impl eframe::App for NebenkostenApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::SidePanel::left("sidebar")
            .default_width(200.0)
            .show(ctx, |ui| {
                ui.heading("Navigation");
                ui.separator();
                
                if ui.button("📊 Dashboard").clicked() {
                    self.current_view = "dashboard".to_string();
                }
                if ui.button("🏠 Objekt & Vermieter").clicked() {
                    self.current_view = "property".to_string();
                }
                if ui.button("🏢 Wohneinheiten").clicked() {
                    self.current_view = "units".to_string();
                }
                if ui.button("👥 Mieter").clicked() {
                    self.current_view = "tenants".to_string();
                }
                if ui.button("💵 Vorauszahlungen").clicked() {
                    self.current_view = "prepayments".to_string();
                }
                if ui.button("💶 Betriebskosten").clicked() {
                    self.current_view = "costs".to_string();
                }
                if ui.button("🧮 Abrechnung").clicked() {
                    self.current_view = "settlement".to_string();
                }
            });
        
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading(format!("Aktuelle Ansicht: {}", self.current_view));
            ui.separator();
            ui.label("Hier kommt der Inhalt der jeweiligen Ansicht.");
        });
    }
}
