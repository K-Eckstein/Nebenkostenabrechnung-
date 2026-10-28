use anyhow::Result;
use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS property (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            owner TEXT NOT NULL,
            owner_address TEXT,
            owner_phone TEXT,
            owner_email TEXT,
            owner_iban TEXT,
            owner_bank TEXT,
            tax_id TEXT,
            year_built INTEGER,
            land_area REAL,
            land_registry TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS unit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            size REAL NOT NULL,
            rooms INTEGER NOT NULL,
            floor INTEGER NOT NULL,
            unit_type TEXT NOT NULL,
            heating_type TEXT NOT NULL,
            is_vacant INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (property_id) REFERENCES property(id)
        );

        CREATE TABLE IF NOT EXISTS tenant (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unit_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            move_in_date TEXT NOT NULL,
            move_out_date TEXT,
            FOREIGN KEY (unit_id) REFERENCES unit(id)
        );

        CREATE TABLE IF NOT EXISTS cost (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            distribution_key TEXT NOT NULL,
            invoice_number TEXT,
            is_recurring INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (property_id) REFERENCES property(id)
        );

        CREATE TABLE IF NOT EXISTS prepayment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id INTEGER NOT NULL,
            monthly_amount REAL NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            FOREIGN KEY (tenant_id) REFERENCES tenant(id)
        );

        CREATE TABLE IF NOT EXISTS consumption (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unit_id INTEGER NOT NULL,
            year INTEGER NOT NULL,
            meter_number TEXT,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            FOREIGN KEY (unit_id) REFERENCES unit(id)
        );
        "
    )?;

    Ok(())
}
