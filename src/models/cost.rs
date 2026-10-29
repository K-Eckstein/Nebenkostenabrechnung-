use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cost {
    pub id: Option<i32>,
    pub property_id: i32,
    pub category: String,
    pub description: String,
    pub amount: f64,
    pub date: String,
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
            is_recurring: false,
        }
    }
}
