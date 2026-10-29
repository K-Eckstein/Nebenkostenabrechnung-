# Nebenkostenabrechnungs-Software - Projektdokumentation

## 📋 Projektübersicht

**Typ:** Web-basierte Nebenkostenabrechnungs-Software für Vermieter
**Technologie:** HTML5, JavaScript, CSS (Single-File Application)
**Speicherung:** LocalStorage (Browser)
**Status:** Produktionsreif (Stand: Januar 2026)

## 🎯 Hauptfunktionen

### Stammdatenverwaltung
- Objekt & Vermieter (mit Briefkopf für PDFs)
- Wohneinheiten (mit Leerstandserkennung)
- Mieter (mit Namenshistorie und Haushaltsmitgliedern)
- Vorauszahlungen (monatliche NK-Zahlungen)

### Kostenverwaltung
- Betriebskosten nach BetrKV § 2
- Wiederkehrende Kosten (automatische Übernahme)
- Verbrauchsablesung (HeizkostenV-konform)
- Verteilerschlüssel (Fläche, Personen, Einheiten, Verbrauch)

### Abrechnung
- Automatische Berechnung (Guthaben/Nachzahlung)
- Vorauszahlungsanpassung (automatisch)
- Mieteranschreiben (mit Zahlungsaufforderung)
- PDF-Export (Einzelabrechnungen, Archiv für Finanzamt)
- CSV-Export (für Steuerberater)

### Rechtliche Konformität
- BetrKV § 2 (umlagefähige Kosten)
- § 556a BGB (Leerstandskosten nicht umlegbar)
- HeizkostenV (70% Verbrauch, 30% Fläche)
- § 147 AO (10 Jahre Aufbewahrung)
- § 555a BGB (Instandhaltung nicht umlegbar)

## 📁 Wichtige Dateien

### Browser-Version (Hauptanwendung)
- `public/nebenkosten.html` - Komplette Anwendung (Single-File)
- `public/handbuch.html` - Benutzerhandbuch als PDF

### Rust-Version (in Entwicklung)
- `Cargo.toml` - Projektkonfiguration
- `src/main.rs` - Hauptprogramm
- Weitere Module in `src/` (database, models, services, ui, export, utils)

### Start-Dateien
- `Start_Nebenkosten.html` - Redirect zur App
- `start.sh` - Shell-Script für Linux
- `Nebenkostenabrechnung.desktop` - Desktop-Verknüpfung

## 🔧 Technische Details

### Datenmodell
```javascript
{
  property: { name, address, owner, ownerAddress, ... },
  units: [{ id, name, size, rooms, floor, type, heatingType }],
  tenants: [{ id, name, unitId, moveInDate, moveOutDate, nameHistory, household }],
  costs: [{ id, category, description, amount, date, distributionKey, isRecurring }],
  prepayments: [{ tenantId, monthlyAmount, startDate, endDate }],
  consumptions: [{ year, unitId, meterNumber, value, unit }],
  customDistKeys: [{ id, name, basis, description }]
}
```

### Speicherort
- LocalStorage Key: `nk_final_v6`
- Backup-Format: JSON
- Export-Formate: PDF, CSV

### Externe Bibliotheken
- Font Awesome 6.4.0 (Icons)
- html2pdf.js 0.10.1 (PDF-Generierung)

## 🚀 Verwendung

### Browser-Version starten
1. Öffne `public/nebenkosten.html` im Browser
2. ODER: Nutze `Start_Nebenkosten.html`
3. ODER: Führe `./start.sh` aus (Linux)

### Rust-Version kompilieren
```bash
cargo build --release
./target/release/nebenkosten
```

## 📝 Bekannte Einschränkungen

1. **Kein Server-Schutz**: JavaScript-Code ist im Browser sichtbar
2. **LocalStorage-Limit**: ~5-10 MB (je nach Browser)
3. **Keine Synchronisation**: Daten nur lokal im Browser
4. **Keine Mehrbenutzer-Fähigkeit**: Single-User-Anwendung

## 🔄 Wartung & Updates

### Bei Gesetzesänderungen anpassen:
- Kostenkategorien in `CC`-Objekt (Zeile ~23)
- Verteilungslogik in `cs()`-Funktion (Zeile ~31)
- HeizkostenV-Berechnung in `hkvCalc()` (Zeile ~30)
- PDF-Vorlagen in `rTPdf()`, `rArchivePdf()` etc.

### Backup-Strategie:
1. Regelmäßig JSON-Backup exportieren
2. Auf USB-Stick oder Cloud speichern
3. Vor größeren Änderungen Backup erstellen

## 📊 Feature-Liste (komplett)

✅ Objekt & Vermieter mit Briefkopf
✅ Wohneinheiten (mit Leerstandserkennung)
✅ Mieter (mit Namenshistorie)
✅ Haushaltsmitglieder verwalten
✅ Vorauszahlungen
✅ Verbrauchsablesung (HeizkostenV)
✅ Betriebskosten (BetrKV-konform)
✅ Wiederkehrende Kosten
✅ Jahreswechsel (Daten kopieren)
✅ Jahresvergleich (grafisch)
✅ Abrechnung (automatisch)
✅ Vorauszahlungsanpassung
✅ Mieteranschreiben
✅ Einzel-PDFs pro Mieter
✅ Alle PDFs auf einmal
✅ Archiv-PDF für Finanzamt
✅ PDF-Download (direkt)
✅ CSV-Export (3 Varianten)
✅ Daten-Backup (Export/Import)
✅ Backup-Erinnerung

## 🎓 Workflow

1. Objekt & Vermieter anlegen
2. Wohneinheiten erfassen
3. Mieter zuordnen
4. Vorauszahlungen eintragen
5. Verbrauchsablesung (bei Zentralheizung)
6. Kosten erfassen
7. Abrechnung erstellen
8. Mieteranschreiben generieren
9. Archiv-PDF für Finanzamt speichern
10. Backup erstellen

## 📞 Support & Weiterentwicklung

Für Fragen oder Erweiterungen:
- Dokumentation lesen: `public/handbuch.html`
- Code prüfen: `public/nebenkosten.html`
- Bei Bedarf: Funktionen hinzufügen/anpassen

## ⚖️ Rechtliche Hinweise

- Software ersetzt keine anwaltliche Beratung
- Regelmäßig auf Gesetzeskonformität prüfen
- Bei重大 Änderungen: Anwalt konsultieren
- Datenschutz (DSGVO) beachten

---

**Erstellt:** Januar 2026
**Version:** 6.0 (Browser), 1.0 (Rust)
**Lizenz:** Frei verwendbar (bitte Bibliothekslizenzen beachten)
