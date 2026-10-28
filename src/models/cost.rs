use serde::{Deserialize, Serialize};
use chrono::NaiveDate;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CostCategory {
    Heizung,
    Warmwasser,
    Kaltwasser,
    Abwasser,
    Muellabfuhr,
    Allgemeinstrom,
    Versicherungen,
    Instandhaltung,
    Grundsteuer,
    Reinigung,
    Gartenpflege,
    Aufzug,
    Schornsteinfeger,
    Schaedlingsbekaempfung,
    KabelTV,
    Sonstiges,
}

impl CostCategory {
    pub fn is_umlegbar(&self) -> bool {
        !matches!(self, CostCategory::Instandhaltung)
    }

    pub fn is_heizkosten_v(&self) -> bool {
        matches!(self, CostCategory::Heizung | CostCategory::Warmwasser)
    }

    pub fn to_string(&self) -> &'static str {
        match self {
            CostCategory::Heizung => "Heizung",
            CostCategory::Warmwasser => "Warmwasser",
            CostCategory::Kaltwasser => "Kaltwasser",
            CostCategory::Abwasser => "Abwasser",
            CostCategory::Muellabfuhr => "Müllabfuhr",
            CostCategory::Allgemeinstrom => "Allgemeinstrom",
            CostCategory::Versicherungen => "Versicherungen",
            CostCategory::Instandhaltung => "Instandhaltung",
            CostCategory::Grundsteuer => "Grundsteuer",
            CostCategory::Reinigung => "Reinigung",
            CostCategory::Gartenpflege => "Gartenpflege",
            CostCategory::Aufzug => "Aufzug",
            CostCategory::Schornsteinfeger => "Schornsteinfeger",
            CostCategory::Schaedlingsbekaempfung => "Schädlingsbekämpfung",
            CostCategory::KabelTV => "Kabel-TV",
            CostCategory::Sonstiges => "Sonstiges",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DistributionKey {
    Wohnflaeche,
    Personenzahl,
    Wohneinheiten,
    Verbrauch,
}

impl DistributionKey {
    pub fn to_string(&self) -> &'static str {
        match self {
            DistributionKey::Wohnflaeche => "Nach Wohnfläche (m²)",
            DistributionKey::Personenzahl => "Nach Personenzahl",
            DistributionKey::Wohneinheiten => "Nach Wohneinheiten",
            DistributionKey::Verbrauch => "Nach Verbrauch",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cost {
    pub id: Option<i32>,
    pub property_id: i32,
    pub category: CostCategory,
    pub description: String,
    pub amount: f64,
    pub date: NaiveDate,
    pub distribution_key: DistributionKey,
    pub invoice_number: Option<String>,
    pub is_recurring: bool,
}

impl Cost {
    pub fn new(
        property_id: i32,
        category: CostCategory,
        description: String,
        amount: f64,
        date: NaiveDate,
        distribution_key: DistributionKey,
    ) -> Self {
        Self {
            id: None,
            property_id,
            category,
            description,
            amount,
            date,
            distribution_key,
            invoice_number: None,
            is_recurring: false,
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.description.trim().is_empty() {
            return Err("Beschreibung darf nicht leer sein".to_string());
        }
        if self.amount <= 0.0 {
            return Err("Betrag muss größer als 0 sein".to_string());
        }
        Ok(())
    }
}
