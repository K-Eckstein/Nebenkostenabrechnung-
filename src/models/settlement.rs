use serde::{Deserialize, Serialize};
use chrono::NaiveDate;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settlement {
    pub id: Option<i32>,
    pub property_id: i32,
    pub year: i32,
    pub period_start: NaiveDate,
    pub period_end: NaiveDate,
    pub created_at: NaiveDate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostDistribution {
    pub tenant_id: i32,
    pub tenant_name: String,
    pub unit_name: String,
    pub category: String,
    pub amount: f64,
    pub share_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantSettlement {
    pub tenant_id: i32,
    pub tenant_name: String,
    pub unit_name: String,
    pub total_costs: f64,
    pub prepayments: f64,
    pub balance: f64,
    pub categories: HashMap<String, f64>,
}

impl Settlement {
    pub fn new(property_id: i32, year: i32) -> Self {
        let period_start = NaiveDate::from_ymd_opt(year, 1, 1).unwrap();
        let period_end = NaiveDate::from_ymd_opt(year, 12, 31).unwrap();
        let created_at = chrono::Local::now().date_naive();

        Self {
            id: None,
            property_id,
            year,
            period_start,
            period_end,
            created_at,
        }
    }
}

impl TenantSettlement {
    pub fn new(tenant_id: i32, tenant_name: String, unit_name: String) -> Self {
        Self {
            tenant_id,
            tenant_name,
            unit_name,
            total_costs: 0.0,
            prepayments: 0.0,
            balance: 0.0,
            categories: HashMap::new(),
        }
    }

    pub fn calculate_balance(&mut self) {
        self.balance = self.prepayments - self.total_costs;
    }

    pub fn is_guthaben(&self) -> bool {
        self.balance > 0.0
    }

    pub fn is_nachzahlung(&self) -> bool {
        self.balance < 0.0
    }
}
