use serde::{Deserialize, Serialize};
use chrono::NaiveDate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tenant {
    pub id: Option<i32>,
    pub unit_id: i32,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub move_in_date: NaiveDate,
    pub move_out_date: Option<NaiveDate>,
}

impl Tenant {
    pub fn new(unit_id: i32, name: String, move_in_date: NaiveDate) -> Self {
        Self {
            id: None,
            unit_id,
            name,
            email: None,
            phone: None,
            move_in_date,
            move_out_date: None,
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Mietername darf nicht leer sein".to_string());
        }
        Ok(())
    }

    pub fn is_active(&self) -> bool {
        self.move_out_date.is_none()
    }
}
