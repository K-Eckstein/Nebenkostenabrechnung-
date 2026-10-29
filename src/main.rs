use eframe::egui;

mod models;
mod storage;
use models::property::Property;

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
        Box::new(|_cc| Box::new(NebenkostenApp::default())),
    )
}

struct NebenkostenApp {
    current_view: String,
    property: Property,
}

impl Default for NebenkostenApp {
    fn default() -> Self {
        let property = storage::load_property().unwrap_or_else(|_| Property::new());
        Self {
            current_view: "dashboard".to_string(),
            property,
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
                
                if ui.button("Dashboard").clicked() {
                    self.current_view = "dashboard".to_string();
                }
                if ui.button("Objekt & Vermieter").clicked() {
                    self.current_view = "property".to_string();
                }
                if ui.button("Wohneinheiten").clicked() {
                    self.current_view = "units".to_string();
                }
                if ui.button("Mieter").clicked() {
                    self.current_view = "tenants".to_string();
                }
                if ui.button("Vorauszahlungen").clicked() {
                    self.current_view = "prepayments".to_string();
                }
                if ui.button("Betriebskosten").clicked() {
                    self.current_view = "costs".to_string();
                }
                if ui.button("Abrechnung").clicked() {
                    self.current_view = "settlement".to_string();
                }
            });
        
        egui::CentralPanel::default().show(ctx, |ui| {
            match self.current_view.as_str() {
                "dashboard" => {
                    ui.heading("Dashboard");
                    ui.separator();
                    ui.label("Willkommen zur Nebenkostenabrechnung!");
                    ui.add_space(10.0);
                    ui.label("Objekt: ");
                    ui.label(if self.property.name.is_empty() { 
                        "Nicht konfiguriert".to_string() 
                    } else { 
                        self.property.name.clone() 
                    });
                }
                "property" => {
                    ui.heading("Objekt & Vermieter");
                    ui.separator();
                    ui.add_space(10.0);
                    
                    ui.label("Objektname:");
                    ui.text_edit_singleline(&mut self.property.name);
                    
                    ui.add_space(5.0);
                    ui.label("Adresse:");
                    ui.text_edit_singleline(&mut self.property.address);
                    
                    ui.add_space(5.0);
                    ui.label("Eigentuemer:");
                    ui.text_edit_singleline(&mut self.property.owner);
                    
                    ui.add_space(5.0);
                    ui.label("Eigentuemer-Adresse:");
                    ui.text_edit_singleline(&mut self.property.owner_address);
                    
                    ui.add_space(5.0);
                    ui.label("Telefon:");
                    ui.text_edit_singleline(&mut self.property.owner_phone);
                    
                    ui.add_space(5.0);
                    ui.label("E-Mail:");
                    ui.text_edit_singleline(&mut self.property.owner_email);
                    
                    ui.add_space(5.0);
                    ui.label("IBAN:");
                    ui.text_edit_singleline(&mut self.property.owner_iban);
                    
                    ui.add_space(10.0);
                    if ui.button("Speichern").clicked() {
                        match storage::save_property(&self.property) {
                            Ok(_) => println!("Objekt gespeichert!"),
                            Err(e) => println!("Fehler beim Speichern: {}", e),
                        }
                    }
                }
                _ => {
                    ui.heading(&self.current_view);
                    ui.separator();
                    ui.label("Inhalt folgt...");
                }
            }
        });
    }
}
