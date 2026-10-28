use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Unit {
    pub id: Option<i32>,
    pub property_id: i32,
    pub name: String,
    pub size: f64,
    pub rooms: i32,
    pub floor: i32,
    pub unit_type: UnitType,
    pub heating_type: HeatingType,
    pub is_vacant: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UnitType {
    Wohnung,
    Gewerbe,
    Stellplatz,
    Keller,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HeatingType {
    Zentral,
    Etagen,
    Fernwaerme,
    Keine,
}

impl Unit {
    pub fn new(
        property_id: i32,
        name: String,
        size: f64,
        rooms: i32,
        floor: i32,
        unit_type: UnitType,
        heating_type: HeatingType,
    ) -> Self {
        Self {
            id: None,
            property_id,
            name,
            size,
            rooms,
            floor,
            unit_type,
            heating_type,
            is_vacant: true,
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("Einheitenname darf nicht leer sein".to_string());
        }
        if self.size <= 0.0 {
            return Err("Fläche muss größer als 0 sein".to_string());
        }
        Ok(())
    }
}
