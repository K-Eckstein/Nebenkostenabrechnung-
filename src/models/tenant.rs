use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tenant {
    pub id: Option<i32>,
    pub unit_id: i32,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub move_in_date: String,
    pub move_out_date: Option<String>,
    pub prepayment_monthly: f64,
}

impl Tenant {
    pub fn new(unit_id: i32, name: String) -> Self {
        Self {
            id: None,
            unit_id,
            name,
            email: String::new(),
            phone: String::new(),
            move_in_date: String::new(),
            move_out_date: None,
            prepayment_monthly: 0.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cost {
    pub id: Option<i32>,
    pub property_id: i32,
    pub category: String,
    pub description: String,
    pub amount: f64,
    pub date: String,
    pub distribution_key: String,
    pub is_recurring: bool,
}

impl Cost {
    pub fn new(property_id: i32, category: String, description: String, amount: f64) -> Self {
        Self {
            id: None,
            property_id,
            category,
            description,
            amount,
            date: String::new(),
            distribution_key: String::new(),
            is_recurring: false,
        }
    }
}
