use std::io::{self, Write};
use std::fs;
use std::path::PathBuf;

// Einfache Datenstrukturen
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct Property {
    name: String,
    address: String,
    owner: String,
    owner_address: String,
    owner_phone: String,
    owner_email: String,
    owner_iban: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct Unit {
    id: u32,
    name: String,
    size: f64,
    rooms: u32,
    floor: u32,
    tenant_name: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct Tenant {
    id: u32,
    name: String,
    unit_id: u32,
    move_in_date: String,
    move_out_date: Option<String>,
    email: String,
    phone: String,
    prepayment_monthly: f64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct Cost {
    id: u32,
    category: String,
    description: String,
    amount: f64,
    date: String,
    distribution_key: String,
    is_recurring: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct AppData {
    property: Option<Property>,
    units: Vec<Unit>,
    tenants: Vec<Tenant>,
    costs: Vec<Cost>,
}

impl AppData {
    fn new() -> Self {
        Self {
            property: None,
            units: Vec::new(),
            tenants: Vec::new(),
            costs: Vec::new(),
        }
    }

    fn load() -> Self {
        let path = Self::get_data_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(data) = serde_json::from_str(&content) {
                    return data;
                }
            }
        }
        Self::new()
    }

    fn save(&self) -> Result<(), String> {
        let path = Self::get_data_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(&path, json).map_err(|e| e.to_string())?;
        Ok(())
    }

    fn get_data_path() -> PathBuf {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("nebenkosten");
        path.push("data.json");
        path
    }

    fn next_id(&self) -> u32 {
        let max_unit = self.units.iter().map(|u| u.id).max().unwrap_or(0);
        let max_tenant = self.tenants.iter().map(|t| t.id).max().unwrap_or(0);
        let max_cost = self.costs.iter().map(|c| c.id).max().unwrap_or(0);
        max_unit.max(max_tenant).max(max_cost) + 1
    }
}

fn main() {
    let mut data = AppData::load();
    
    loop {
        clear_screen();
        print_header("Nebenkostenabrechnung");
        
        println!("  1. Dashboard");
        println!("  2. Objekt & Vermieter");
        println!("  3. Wohneinheiten");
        println!("  4. Mieter");
        println!("  5. Betriebskosten");
        println!("  6. Abrechnung erstellen");
        println!("  7. Export (PDF/CSV)");
        println!("  8. Daten-Backup");
        println!("  q. Beenden");
        println!();
        
        print!("Ihre Auswahl: ");
        flush();
        
        let input = read_line();
        
        match input.trim() {
            "1" => show_dashboard(&data),
            "2" => manage_property(&mut data),
            "3" => manage_units(&mut data),
            "4" => manage_tenants(&mut data),
            "5" => manage_costs(&mut data),
            "6" => create_settlement(&data),
            "7" => export_data(&data),
            "8" => backup_data(&data),
            "q" | "Q" => {
                println!("\nAuf Wiedersehen!");
                break;
            }
            _ => println!("\nUngueltige Auswahl!"),
        }
    }
}

fn show_dashboard(data: &AppData) {
    clear_screen();
    print_header("Dashboard");
    
    println!("  Objekt: {}", data.property.as_ref().map(|p| p.name.as_str()).unwrap_or("Nicht konfiguriert"));
    println!("  Wohneinheiten: {}", data.units.len());
    println!("  Mieter: {}", data.tenants.len());
    
    let total_costs: f64 = data.costs.iter().map(|c| c.amount).sum();
    println!("  Gesamtkosten: {:.2} EUR", total_costs);
    
    let vacant = data.units.iter().filter(|u| u.tenant_name.is_none()).count();
    println!("  Leerstaende: {}", vacant);
    
    println!();
    if let Some(prop) = &data.property {
        println!("  Eigentuemer: {}", prop.owner);
        println!("  Adresse: {}", prop.address);
    }
    
    pause();
}

fn manage_property(data: &mut AppData) {
    loop {
        clear_screen();
        print_header("Objekt & Vermieter");
        
        if let Some(prop) = &data.property {
            println!("  Name: {}", prop.name);
            println!("  Adresse: {}", prop.address);
            println!("  Eigentuemer: {}", prop.owner);
            println!("  Eigentuemer-Adresse: {}", prop.owner_address);
            println!("  Telefon: {}", prop.owner_phone);
            println!("  E-Mail: {}", prop.owner_email);
            println!("  IBAN: {}", prop.owner_iban);
        } else {
            println!("  Kein Objekt konfiguriert");
        }
        
        println!();
        println!("  1. Objekt anlegen/bearbeiten");
        println!("  2. Zurueck");
        print!("\n  Auswahl: ");
        flush();
        
        match read_line().trim() {
            "1" => {
                println!("\n  Objektname: ");
                let name = read_line();
                println!("  Adresse: ");
                let address = read_line();
                println!("  Eigentuemer: ");
                let owner = read_line();
                println!("  Eigentuemer-Adresse: ");
                let owner_address = read_line();
                println!("  Telefon: ");
                let phone = read_line();
                println!("  E-Mail: ");
                let email = read_line();
                println!("  IBAN: ");
                let iban = read_line();
                
                data.property = Some(Property {
                    name, address, owner, owner_address,
                    owner_phone: phone, owner_email: email, owner_iban: iban,
                });
                
                if let Err(e) = data.save() {
                    println!("\n  Fehler beim Speichern: {}", e);
                } else {
                    println!("\n  Gespeichert!");
                }
                pause();
            }
            _ => break,
        }
    }
}

fn manage_units(data: &mut AppData) {
    loop {
        clear_screen();
        print_header("Wohneinheiten");
        
        if data.units.is_empty() {
            println!("  Keine Einheiten vorhanden");
        } else {
            for unit in &data.units {
                let tenant = unit.tenant_name.as_deref().unwrap_or("Leer");
                println!("  [{}] {} - {:.1} qm, {} Zimmer, {}. OG - Mieter: {}",
                    unit.id, unit.name, unit.size, unit.rooms, unit.floor, tenant);
            }
        }
        
        println!();
        println!("  1. Neue Einheit");
        println!("  2. Einheit loeschen");
        println!("  3. Zurueck");
        print!("\n  Auswahl: ");
        flush();
        
        match read_line().trim() {
            "1" => {
                println!("\n  Name (z.B. Whg 1.1): ");
                let name = read_line();
                println!("  Groesse (qm): ");
                let size: f64 = read_line().trim().parse().unwrap_or(0.0);
                println!("  Zimmer: ");
                let rooms: u32 = read_line().trim().parse().unwrap_or(0);
                println!("  Etage: ");
                let floor: u32 = read_line().trim().parse().unwrap_or(0);
                
                let id = data.next_id();
                data.units.push(Unit {
                    id, name, size, rooms, floor, tenant_name: None,
                });
                
                if let Err(e) = data.save() {
                    println!("\n  Fehler: {}", e);
                } else {
                    println!("\n  Einheit angelegt!");
                }
                pause();
            }
            "2" => {
                println!("\n  ID der Einheit zum Loeschen: ");
                let id: u32 = read_line().trim().parse().unwrap_or(0);
                data.units.retain(|u| u.id != id);
                if let Err(e) = data.save() {
                    println!("\n  Fehler: {}", e);
                } else {
                    println!("\n  Geloescht!");
                }
                pause();
            }
            _ => break,
        }
    }
}

fn manage_tenants(data: &mut AppData) {
    loop {
        clear_screen();
        print_header("Mieter");
        
        if data.tenants.is_empty() {
            println!("  Keine Mieter vorhanden");
        } else {
            for tenant in &data.tenants {
                let unit = data.units.iter().find(|u| u.id == tenant.unit_id);
                let unit_name = unit.map(|u| u.name.as_str()).unwrap_or("?");
                println!("  [{}] {} - {} - seit {} - {:.2} EUR/Monat",
                    tenant.id, tenant.name, unit_name, tenant.move_in_date, tenant.prepayment_monthly);
            }
        }
        
        println!();
        println!("  1. Neuen Mieter");
        println!("  2. Mieter loeschen");
        println!("  3. Zurueck");
        print!("\n  Auswahl: ");
        flush();
        
        match read_line().trim() {
            "1" => {
                println!("\n  Name: ");
                let name = read_line();
                println!("  Einheit-ID: ");
                let unit_id: u32 = read_line().trim().parse().unwrap_or(0);
                println!("  Einzugsdatum (JJJJ-MM-TT): ");
                let move_in = read_line();
                println!("  E-Mail: ");
                let email = read_line();
                println!("  Telefon: ");
                let phone = read_line();
                println!("  Vorauszahlung monatlich (EUR): ");
                let prepayment: f64 = read_line().trim().parse().unwrap_or(0.0);
                
                let id = data.next_id();
                data.tenants.push(Tenant {
                    id, name, unit_id, move_in_date: move_in,
                    move_out_date: None, email, phone, prepayment_monthly: prepayment,
                });
                
                // Update unit tenant name
                if let Some(unit) = data.units.iter_mut().find(|u| u.id == unit_id) {
                    unit.tenant_name = Some(data.tenants.last().unwrap().name.clone());
                }
                
                if let Err(e) = data.save() {
                    println!("\n  Fehler: {}", e);
                } else {
                    println!("\n  Mieter angelegt!");
                }
                pause();
            }
            "2" => {
                println!("\n  ID des Mieters zum Loeschen: ");
                let id: u32 = read_line().trim().parse().unwrap_or(0);
                if let Some(tenant) = data.tenants.iter().find(|t| t.id == id) {
                    if let Some(unit) = data.units.iter_mut().find(|u| u.id == tenant.unit_id) {
                        unit.tenant_name = None;
                    }
                }
                data.tenants.retain(|t| t.id != id);
                if let Err(e) = data.save() {
                    println!("\n  Fehler: {}", e);
                } else {
                    println!("\n  Geloescht!");
                }
                pause();
            }
            _ => break,
        }
    }
}

fn manage_costs(data: &mut AppData) {
    loop {
        clear_screen();
        print_header("Betriebskosten");
        
        if data.costs.is_empty() {
            println!("  Keine Kosten erfasst");
        } else {
            let total: f64 = data.costs.iter().map(|c| c.amount).sum();
            println!("  Gesamtkosten: {:.2} EUR\n", total);
            for cost in &data.costs {
                let recurring = if cost.is_recurring { "[W]" } else { "   " };
                println!("  {} [{}] {} - {} - {:.2} EUR - {}",
                    recurring, cost.id, cost.category, cost.description, cost.amount, cost.date);
            }
        }
        
        println!();
        println!("  1. Neue Kosten");
        println!("  2. Kosten loeschen");
        println!("  3. Zurueck");
        print!("\n  Auswahl: ");
        flush();
        
        match read_line().trim() {
            "1" => {
                println!("\n  Kategorie (Heizung/Wasser/Muell/Versicherung/etc.): ");
                let category = read_line();
                println!("  Beschreibung: ");
                let description = read_line();
                println!("  Betrag (EUR): ");
                let amount: f64 = read_line().trim().parse().unwrap_or(0.0);
                println!("  Datum (JJJJ-MM-TT): ");
                let date = read_line();
                println!("  Verteilerschluessel (flaeche/personen/einheiten): ");
                let dist_key = read_line();
                println!("  Wiederkehrend? (j/n): ");
                let recurring = read_line().trim() == "j";
                
                let id = data.next_id();
                data.costs.push(Cost {
                    id, category, description, amount, date,
                    distribution_key: dist_key, is_recurring: recurring,
                });
                
                if let Err(e) = data.save() {
                    println!("\n  Fehler: {}", e);
                } else {
                    println!("\n  Kosten erfasst!");
                }
                pause();
            }
            "2" => {
                println!("\n  ID zum Loeschen: ");
                let id: u32 = read_line().trim().parse().unwrap_or(0);
                data.costs.retain(|c| c.id != id);
                if let Err(e) = data.save() {
                    println!("\n  Fehler: {}", e);
                } else {
                    println!("\n  Geloescht!");
                }
                pause();
            }
            _ => break,
        }
    }
}

fn create_settlement(data: &AppData) {
    clear_screen();
    print_header("Abrechnung erstellen");
    
    if data.tenants.is_empty() || data.costs.is_empty() {
        println!("  Bitte zuerst Mieter und Kosten erfassen!");
        pause();
        return;
    }
    
    let total_costs: f64 = data.costs.iter()
        .filter(|c| c.category != "Instandhaltung")
        .map(|c| c.amount).sum();
    
    let total_area: f64 = data.units.iter()
        .filter(|u| u.tenant_name.is_some())
        .map(|u| u.size).sum();
    
    println!("  Gesamtkosten (umlagefaehig): {:.2} EUR", total_costs);
    println!("  Vermietete Flaeche: {:.2} qm", total_area);
    println!();
    println!("  Einzelabrechnung je Mieter:");
    println!("  ─────────────────────────────────────────────");
    
    for tenant in &data.tenants {
        if let Some(unit) = data.units.iter().find(|u| u.id == tenant.unit_id) {
            let share = if total_area > 0.0 { unit.size / total_area } else { 0.0 };
            let tenant_costs = total_costs * share;
            let balance = (tenant.prepayment_monthly * 12.0) - tenant_costs;
            
            println!("  {} ({}):", tenant.name, unit.name);
            println!("    Kosten-Anteil: {:.2} EUR", tenant_costs);
            println!("    Vorauszahlung: {:.2} EUR", tenant.prepayment_monthly * 12.0);
            
            if balance >= 0.0 {
                println!("    Guthaben: {:.2} EUR", balance);
            } else {
                println!("    Nachzahlung: {:.2} EUR", -balance);
            }
            println!();
        }
    }
    
    pause();
}

fn export_data(data: &AppData) {
    clear_screen();
    print_header("Export");
    
    println!("  1. Kosten als CSV exportieren");
    println!("  2. Mieter als CSV exportieren");
    println!("  3. Zurueck");
    print!("\n  Auswahl: ");
    flush();
    
    match read_line().trim() {
        "1" => {
            let mut csv = String::from("ID;Kategorie;Beschreibung;Betrag;Datum;Verteiler\n");
            for cost in &data.costs {
                csv.push_str(&format!("{};{};{};{:.2};{};{}\n",
                    cost.id, cost.category, cost.description, cost.amount, cost.date, cost.distribution_key));
            }
            
            let filename = "kosten_export.csv";
            if let Err(e) = fs::write(filename, &csv) {
                println!("\n  Fehler: {}", e);
            } else {
                println!("\n  Exportiert nach: {}", filename);
            }
            pause();
        }
        "2" => {
            let mut csv = String::from("ID;Name;Einheit;Einzug;Vorauszahlung\n");
            for tenant in &data.tenants {
                let unit_name = data.units.iter()
                    .find(|u| u.id == tenant.unit_id)
                    .map(|u| u.name.as_str())
                    .unwrap_or("?");
                csv.push_str(&format!("{};{};{};{};{:.2}\n",
                    tenant.id, tenant.name, unit_name, tenant.move_in_date, tenant.prepayment_monthly));
            }
            
            let filename = "mieter_export.csv";
            if let Err(e) = fs::write(filename, &csv) {
                println!("\n  Fehler: {}", e);
            } else {
                println!("\n  Exportiert nach: {}", filename);
            }
            pause();
        }
        _ => {}
    }
}

fn backup_data(data: &AppData) {
    clear_screen();
    print_header("Daten-Backup");
    
    println!("  1. Backup erstellen");
    println!("  2. Zurueck");
    print!("\n  Auswahl: ");
    flush();
    
    if read_line().trim() == "1" {
        let source = AppData::get_data_path();
        let date = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_name = format!("backup_{}.json", date);
        
        match fs::copy(&source, &backup_name) {
            Ok(_) => println!("\n  Backup erstellt: {}", backup_name),
            Err(e) => println!("\n  Fehler: {}", e),
        }
        pause();
    }
}

// Hilfsfunktionen
fn clear_screen() {
    print!("\x1B[2J\x1B[1;1H");
    flush();
}

fn print_header(title: &str) {
    println!("================================================================");
    println!("  {}", title);
    println!("================================================================\n");
}

fn read_line() -> String {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    input.trim().to_string()
}

fn flush() {
    io::stdout().flush().unwrap();
}

fn pause() {
    println!("\n[Enter druecken um fortzufahren]");
    flush();
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
}
