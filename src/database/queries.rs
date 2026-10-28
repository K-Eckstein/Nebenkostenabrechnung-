use anyhow::Result;
use rusqlite::Connection;
use crate::models::*;

pub fn insert_property(conn: &Connection, property: &Property) -> Result<i32> {
    conn.execute(
        "INSERT INTO property (name, address, owner, owner_address, owner_phone, owner_email, owner_iban, owner_bank, tax_id, year_built, land_area, land_registry, notes, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        rusqlite::params![
            property.name,
            property.address,
            property.owner,
            property.owner_address,
            property.owner_phone,
            property.owner_email,
            property.owner_iban,
            property.owner_bank,
            property.tax_id,
            property.year_built,
            property.land_area,
            property.land_registry,
            property.notes,
            property.created_at.to_string(),
            property.updated_at.to_string(),
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn insert_unit(conn: &Connection, unit: &Unit) -> Result<i32> {
    conn.execute(
        "INSERT INTO unit (property_id, name, size, rooms, floor, unit_type, heating_type, is_vacant) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            unit.property_id,
            unit.name,
            unit.size,
            unit.rooms,
            unit.floor,
            format!("{:?}", unit.unit_type),
            format!("{:?}", unit.heating_type),
            unit.is_vacant as i32,
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn insert_tenant(conn: &Connection, tenant: &Tenant) -> Result<i32> {
    conn.execute(
        "INSERT INTO tenant (unit_id, name, email, phone, move_in_date, move_out_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            tenant.unit_id,
            tenant.name,
            tenant.email,
            tenant.phone,
            tenant.move_in_date.to_string(),
            tenant.move_out_date.map(|d| d.to_string()),
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}

pub fn insert_cost(conn: &Connection, cost: &Cost) -> Result<i32> {
    conn.execute(
        "INSERT INTO cost (property_id, category, description, amount, date, distribution_key, invoice_number, is_recurring) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            cost.property_id,
            cost.category.to_string(),
            cost.description,
            cost.amount,
            cost.date.to_string(),
            cost.distribution_key.to_string(),
            cost.invoice_number,
            cost.is_recurring as i32,
        ],
    )?;
    Ok(conn.last_insert_rowid() as i32)
}
