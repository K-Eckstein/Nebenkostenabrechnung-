use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Unit {
    pub id: Option<i32>,
    pub property_id: i32,
    pub name: String,
    pub size: f64,
    pub rooms: i32,
    pub floor: i32,
    pub tenant_id: Option<i32>,
}

impl Unit {
    pub fn new(property_id: i32, name: String, size: f64, rooms: i32, floor: i32) -> Self {
        Self {
            id: None,
            property_id,
            name,
            size,
            rooms,
            floor,
            tenant_id: None,
        }
    }
}
