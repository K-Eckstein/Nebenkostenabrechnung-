use serde::{Deserialize, Serialize};
use chrono::NaiveDate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub id: Option<i32>,
    pub name: String,
    pub address: String,
    pub owner: String,
    pub owner_address: Option<String>,
    pub owner_phone: Option<String>,
    pub owner_email: Option<String>,
    pub owner_iban: Option<String>,
    pub owner_bank: Option<String>,
    pub tax_id: Option<String>,
    pub year_built: Option<i32>,
    pub land_area: Option<f64>,
    pub land_registry: Option<String>,
    pub notes: Option<String>,
    pub created_at: NaiveDate,
    pub updated_at: NaiveDate,
}

impl Property {
    pub fn new(name: String, address: String, owner: String) -> Self {
        let today = chrono::Local::now().date_naive();
        Self {
            id: None,
            name,
            address,
            owner,
            owner_address: None,
            owner_phone: None,
            owner_email: None,
            owner_iban: None,
            owner_bank: None,
            tax_id: None,
            year_built: None,
            land_area: None,
            land_registry: None,
            notes: None,
            created_at: today,
            updated_at: today,
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Objektname darf nicht leer sein".to_string());
        }
        if self.address.trim().is_empty() {
            return Err("Adresse darf nicht leer sein".to_string());
        }
        if self.owner.trim().is_empty() {
            return Err("Eigentümer darf nicht leer sein".to_string());
        }
        Ok(())
    }
}
