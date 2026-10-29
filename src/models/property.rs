use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Property {
    pub id: Option<i32>,
    pub name: String,
    pub address: String,
    pub owner: String,
    pub owner_address: String,
    pub owner_phone: String,
    pub owner_email: String,
    pub owner_iban: String,
    pub year_built: Option<i32>,
    pub total_area: f64,
}

impl Property {
    pub fn new() -> Self {
        Self {
            id: None,
            name: String::new(),
            address: String::new(),
            owner: String::new(),
            owner_address: String::new(),
            owner_phone: String::new(),
            owner_email: String::new(),
            owner_iban: String::new(),
            year_built: None,
            total_area: 0.0,
        }
    }
}
