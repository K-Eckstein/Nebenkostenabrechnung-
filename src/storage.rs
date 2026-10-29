use anyhow::Result;
use std::fs;
use std::path::PathBuf;
use crate::models::property::Property;

pub fn get_data_path() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("nebenkosten-rust");
    fs::create_dir_all(&path).ok();
    path.push("data.json");
    path
}

pub fn save_property(property: &Property) -> Result<()> {
    let path = get_data_path();
    let json = serde_json::to_string_pretty(property)?;
    fs::write(path, json)?;
    Ok(())
}

pub fn load_property() -> Result<Property> {
    let path = get_data_path();
    if !path.exists() {
        return Ok(Property::new());
    }
    let json = fs::read_to_string(path)?;
    let property: Property = serde_json::from_str(&json)?;
    Ok(property)
}
