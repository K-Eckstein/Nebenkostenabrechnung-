use eframe::egui;

mod models;
mod storage;
use models::property::Property;
use models::unit::Unit;
use models::tenant::Tenant;
use models::cost::Cost;
use storage::AppData;

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
    units: Vec<Unit>,
    tenants: Vec<Tenant>,
    costs: Vec<Cost>,
    show_unit_dialog: bool,
    show_tenant_dialog: bool,
    new_unit_name: String,
    new_unit_size: f64,
    new_unit_rooms: i32,
    new_unit_floor: i32,
    new_tenant_name: String,
    new_tenant_unit_idx: usize,
    new_tenant_email: String,
    new_tenant_phone: String,
    new_tenant_movein: String,
    new_tenant_prepay: f64,
}

impl Default for NebenkostenApp {
    fn default() -> Self {
        let data = storage::load_data().unwrap_or_default();
        Self {
            current_view: "dashboard".to_string(),
            property: data.property,
            units: data.units,
            tenants: data.tenants,
            costs: data.costs,
            show_unit_dialog: false,
            show_tenant_dialog: false,
            new_unit_name: String::new(),
            new_unit_size: 0.0,
            new_unit_rooms: 1,
            new_unit_floor: 0,
            new_tenant_name: String::new(),
            new_tenant_unit_idx: 0,
            new_tenant_email: String::new(),
            new_tenant_phone: String::new(),
            new_tenant_movein: String::new(),
            new_tenant_prepay: 0.0,
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
                    ui.label(format!("Objekt: {}", 
                        if self.property.name.is_empty() { 
                            "Nicht konfiguriert" 
                        } else { 
                            &self.property.name 
                        }));
                    ui.label(format!("Wohneinheiten: {}", self.units.len()));
                    ui.label(format!("Mieter: {}", self.tenants.len()));
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
                        let data = AppData {
                            property: self.property.clone(),
                            units: self.units.clone(),
                            tenants: self.tenants.clone(),
                        };
                        match storage::save_data(&data) {
                            Ok(_) => println!("Gespeichert!"),
                            Err(e) => println!("Fehler: {}", e),
                        }
                    }
                }
                "units" => {
                    ui.heading("Wohneinheiten");
                    ui.separator();
                    ui.add_space(10.0);
                    
                    if ui.button("Neue Einheit anlegen").clicked() {
                        self.show_unit_dialog = true;
                    }
                    
                    ui.add_space(10.0);
                    
                    if self.units.is_empty() {
                        ui.label("Keine Einheiten vorhanden.");
                    } else {
                        egui::Grid::new("units_grid")
                            .striped(true)
                            .show(ui, |ui| {
                                ui.strong("Name");
                                ui.strong("Groesse (qm)");
                                ui.strong("Zimmer");
                                ui.strong("Etage");
                                ui.strong("Aktionen");
                                ui.end_row();
                                
                                let mut to_remove = None;
                                for (i, unit) in self.units.iter().enumerate() {
                                    ui.label(&unit.name);
                                    ui.label(format!("{:.1}", unit.size));
                                    ui.label(unit.rooms.to_string());
                                    ui.label(unit.floor.to_string());
                                    if ui.button("Loeschen").clicked() {
                                        to_remove = Some(i);
                                    }
                                    ui.end_row();
                                }
                                if let Some(i) = to_remove {
                                    self.units.remove(i);
                                    let data = AppData {
                                        property: self.property.clone(),
                                        units: self.units.clone(),
                                        tenants: self.tenants.clone(),
                                    };
                                    let _ = storage::save_data(&data);
                                }
                            });
                    }
                    
                    if self.show_unit_dialog {
                        egui::Window::new("Neue Wohneinheit")
                            .collapsible(false)
                            .resizable(false)
                            .show(ctx, |ui| {
                                ui.label("Name:");
                                ui.text_edit_singleline(&mut self.new_unit_name);
                                ui.add_space(5.0);
                                ui.label("Groesse (qm):");
                                ui.add(egui::DragValue::new(&mut self.new_unit_size).speed(1.0));
                                ui.add_space(5.0);
                                ui.label("Zimmer:");
                                ui.add(egui::DragValue::new(&mut self.new_unit_rooms).speed(1.0));
                                ui.add_space(5.0);
                                ui.label("Etage:");
                                ui.add(egui::DragValue::new(&mut self.new_unit_floor).speed(1.0));
                                ui.add_space(10.0);
                                
                                if ui.button("Anlegen").clicked() {
                                    if !self.new_unit_name.is_empty() && self.new_unit_size > 0.0 {
                                        let unit = Unit::new(
                                            1,
                                            self.new_unit_name.clone(),
                                            self.new_unit_size,
                                            self.new_unit_rooms,
                                            self.new_unit_floor,
                                        );
                                        self.units.push(unit);
                                        
                                        let data = AppData {
                                            property: self.property.clone(),
                                            units: self.units.clone(),
                                            tenants: self.tenants.clone(),
                                        };
                                        let _ = storage::save_data(&data);
                                        
                                        self.new_unit_name.clear();
                                        self.new_unit_size = 0.0;
                                        self.new_unit_rooms = 1;
                                        self.new_unit_floor = 0;
                                        self.show_unit_dialog = false;
                                    }
                                }
                                if ui.button("Abbrechen").clicked() {
                                    self.show_unit_dialog = false;
                                }
                            });
                    }
                }
                "tenants" => {
                    ui.heading("Mieter");
                    ui.separator();
                    ui.add_space(10.0);
                    
                    if ui.button("Neuen Mieter anlegen").clicked() {
                        self.show_tenant_dialog = true;
                    }
                    
                    ui.add_space(10.0);
                    
                    if self.tenants.is_empty() {
                        ui.label("Keine Mieter vorhanden.");
                    } else {
                        egui::Grid::new("tenants_grid")
                            .striped(true)
                            .show(ui, |ui| {
                                ui.strong("Name");
                                ui.strong("Einheit");
                                ui.strong("E-Mail");
                                ui.strong("Telefon");
                                ui.strong("Einzug");
                                ui.strong("Vorauszahlung");
                                ui.strong("Aktionen");
                                ui.end_row();
                                
                                let mut to_remove = None;
                                for (i, tenant) in self.tenants.iter().enumerate() {
                                    ui.label(&tenant.name);
                                    let unit_name = self.units.iter()
                                        .find(|u| u.id == Some(tenant.unit_id))
                                        .map(|u| u.name.clone())
                                        .unwrap_or_else(|| "Unbekannt".to_string());
                                    ui.label(&unit_name);
                                    ui.label(&tenant.email);
                                    ui.label(&tenant.phone);
                                    ui.label(&tenant.move_in_date);
                                    ui.label(format!("{:.2} EUR", tenant.prepayment_monthly));
                                    if ui.button("Loeschen").clicked() {
                                        to_remove = Some(i);
                                    }
                                    ui.end_row();
                                }
                                if let Some(i) = to_remove {
                                    self.tenants.remove(i);
                                    let data = AppData {
                                        property: self.property.clone(),
                                        units: self.units.clone(),
                                        tenants: self.tenants.clone(),
                                    };
                                    let _ = storage::save_data(&data);
                                }
                            });
                    }
                    
                    if self.show_tenant_dialog {
                        egui::Window::new("Neuer Mieter")
                            .collapsible(false)
                            .resizable(false)
                            .show(ctx, |ui| {
                                ui.label("Name:");
                                ui.text_edit_singleline(&mut self.new_tenant_name);
                                ui.add_space(5.0);
                                
                                ui.label("Einheit:");
                                if self.units.is_empty() {
                                    ui.label("Keine Einheiten vorhanden. Bitte zuerst eine Einheit anlegen.");
                                } else {
                                    egui::ComboBox::from_id_source("unit_select")
                                        .selected_text(if self.new_tenant_unit_idx < self.units.len() {
                                            self.units[self.new_tenant_unit_idx].name.clone()
                                        } else {
                                            "Auswaehlen".to_string()
                                        })
                                        .show_ui(ui, |ui| {
                                            for (idx, unit) in self.units.iter().enumerate() {
                                                ui.selectable_value(&mut self.new_tenant_unit_idx, idx, &unit.name);
                                            }
                                        });
                                }
                                ui.add_space(5.0);
                                
                                ui.label("E-Mail:");
                                ui.text_edit_singleline(&mut self.new_tenant_email);
                                ui.add_space(5.0);
                                
                                ui.label("Telefon:");
                                ui.text_edit_singleline(&mut self.new_tenant_phone);
                                ui.add_space(5.0);
                                
                                ui.label("Einzugsdatum (YYYY-MM-DD):");
                                ui.text_edit_singleline(&mut self.new_tenant_movein);
                                ui.add_space(5.0);
                                
                                ui.label("Vorauszahlung monatlich (EUR):");
                                ui.add(egui::DragValue::new(&mut self.new_tenant_prepay).speed(10.0));
                                ui.add_space(10.0);
                                
                                if ui.button("Anlegen").clicked() {
                                    if !self.new_tenant_name.is_empty() && !self.units.is_empty() {
                                        let unit_id = self.units[self.new_tenant_unit_idx].id.unwrap_or(1);
                                        let tenant = Tenant::new(
                                            unit_id,
                                            self.new_tenant_name.clone(),
                                        );
                                        self.tenants.push(tenant);
                                        
                                        let data = AppData {
                                            property: self.property.clone(),
                                            units: self.units.clone(),
                                            tenants: self.tenants.clone(),
                                        };
                                        let _ = storage::save_data(&data);
                                        
                                        self.new_tenant_name.clear();
                                        self.new_tenant_email.clear();
                                        self.new_tenant_phone.clear();
                                        self.new_tenant_movein.clear();
                                        self.new_tenant_prepay = 0.0;
                                        self.show_tenant_dialog = false;
                                    }
                                }
                                if ui.button("Abbrechen").clicked() {
                                    self.show_tenant_dialog = false;
                                }
                            });
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
