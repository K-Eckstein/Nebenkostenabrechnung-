# Nebenkostenabrechnung - Rust Version

Eine vollständige Nebenkostenabrechnungs-Software für Vermieter, entwickelt in Rust.

## 🚀 Features

- ✅ Objekt- und Mieterverwaltung
- ✅ Betriebskosten nach BetrKV
- ✅ HeizkostenV-konforme Abrechnung
- ✅ Automatische Vorauszahlungsanpassung
- ✅ PDF-Export für Mieter und Finanzamt
- ✅ CSV-Export für Steuerberater
- ✅ SQLite-Datenbank
- ✅ TUI (Terminal User Interface)

## 📦 Installation

### Voraussetzungen

```bash
# Rust installieren (falls noch nicht vorhanden)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Abhängigkeiten für Linux Mint/Ubuntu
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev
```

### Projekt bauen

```bash
# Debug-Build
cargo build

# Release-Build (optimiert)
cargo build --release

# Programm starten
cargo run

# Release-Version starten
./target/release/nebenkosten
```

## 📁 Projektstruktur

```
nebenkosten/
├── Cargo.toml                 # Projektkonfiguration
├── README.md                  # Diese Datei
├── src/
│   ├── main.rs               # Einstiegspunkt
│   ├── models/               # Datenmodelle
│   │   ├── mod.rs
│   │   ├── property.rs       # Objekt/Immobilie
│   │   ├── unit.rs           # Wohneinheiten
│   │   ├── tenant.rs         # Mieter
│   │   ├── cost.rs           # Betriebskosten
│   │   └── settlement.rs     # Abrechnungen
│   ├── database/             # Datenbank-Operationen
│   │   ├── mod.rs
│   │   ├── connection.rs     # DB-Verbindung
│   │   ├── migrations.rs     # Schema-Migrationen
│   │   └── queries.rs        # SQL-Queries
│   ├── services/             # Geschäftslogik
│   │   ├── mod.rs
│   │   ├── calculation.rs    # Berechnungen
│   │   ├── distribution.rs   # Kostenverteilung
│   │   └── validation.rs     # Validierung
│   ├── ui/                   # Benutzeroberfläche
│   │   ├── mod.rs
│   │   ├── app.rs            # Haupt-App
│   │   ├── dashboard.rs      # Dashboard
│   │   ├── property_view.rs  # Objekt-Ansicht
│   │   ├── tenant_view.rs    # Mieter-Ansicht
│   │   ├── cost_view.rs      # Kosten-Ansicht
│   │   └── settlement_view.rs # Abrechnungs-Ansicht
│   ├── export/               # Export-Funktionen
│   │   ├── mod.rs
│   │   ├── pdf.rs            # PDF-Export
│   │   └── csv.rs            # CSV-Export
│   └── utils/                # Hilfsfunktionen
│       ├── mod.rs
│       ├── formatting.rs     # Formatierung
│       └── constants.rs      # Konstanten
└── data/                     # Datenverzeichnis
    └── .gitkeep
```

## 🗄️ Datenbank

Die Software verwendet SQLite für die Datenspeicherung. Die Datenbank wird automatisch beim ersten Start erstellt:

```
~/.local/share/nebenkosten/nebenkosten.db
```

### Backup erstellen

```bash
# Datenbank kopieren
cp ~/.local/share/nebenkosten/nebenkosten.db backup_$(date +%Y%m%d).db
```

## 📊 Verwendung

### Erste Schritte

1. **Programm starten**
   ```bash
   ./target/release/nebenkosten
   ```

2. **Objekt anlegen**
   - Navigiere zu "Objekt"
   - Trage Objektname, Adresse, Eigentümer ein

3. **Wohneinheiten erfassen**
   - Navigiere zu "Einheiten"
   - Füge Wohnungen/Gewerbeeinheiten hinzu

4. **Mieter anlegen**
   - Navigiere zu "Mieter"
   - Trage Mieter mit Einzugstermin ein

5. **Kosten erfassen**
   - Navigiere zu "Kosten"
   - Erfasse Betriebskosten nach BetrKV

6. **Abrechnung erstellen**
   - Navigiere zu "Abrechnung"
   - Wähle Jahr und erstelle Abrechnung

### Tastenkürzel

- `q` - Programm beenden
- `Tab` - Zwischen Panels wechseln
- `↑/↓` - Navigation
- `Enter` - Auswählen
- `Esc` - Zurück/Abbrechen

## 📄 Export

### PDF-Export

- **Einzelabrechnung**: Pro Mieter
- **Archiv-PDF**: Komplettes Paket für Finanzamt
- **Vermieter-Protokoll**: Übersicht aller Salden

### CSV-Export

- **Kosten-Export**: Alle Betriebskosten
- **Mieter-Export**: Mieterliste mit Salden
- **Abrechnungs-Export**: Komplette Abrechnung

## ⚖️ Rechtskonformität

Die Software berücksichtigt:

- ✅ BetrKV § 2 (umlagefähige Kosten)
- ✅ § 556a BGB (Verteilerschlüssel)
- ✅ HeizkostenV (50-70% Verbrauch)
- ✅ § 147 AO (10 Jahre Aufbewahrung)

## 🛠️ Entwicklung

### Tests ausführen

```bash
cargo test
```

### Code formatieren

```bash
cargo fmt
```

### Linting

```bash
cargo clippy
```

## 📝 Lizenz

MIT License

## 🤝 Beitrag

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder Issue.

## 📧 Kontakt

Bei Fragen oder Problemen, erstelle bitte ein Issue im Repository.
