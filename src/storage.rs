use anyhow::Result;
use std::fs;
use std::path::PathBuf;
use crate::models::property::Property;
use crate::models::unit::Unit;

pub fn get_data_path() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("nebenkosten-rust");
    fs::create_dir_all(&path).ok();
    path.push("data.json");
    path
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AppData {
    pub property: Property,
    pub units: Vec<Unit>,
}

impl Default for AppData {
    fn default() -> Self {
        Self {
            property: Property::new(),
            units: Vec::new(),
        }
    }
}

pub fn save_data(data: &AppData) -> Result<()> {
    let path = get_data_path();
    let json = serde_json::to_string_pretty(data)?;
    fs::write(path, json)?;
    Ok(())
}

pub fn load_data() -> Result<AppData> {
    let path = get_data_path();
    if !path.exists() {
        return Ok(AppData::default());
    }
    let json = fs::read_to_string(path)?;
    let data: AppData = serde_json::from_str(&json)?;
    Ok(data)
}
