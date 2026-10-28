use crate::models::*;

pub fn distribute_costs_by_area(cost: f64, units: &[Unit], occupied_units: &[Unit]) -> Vec<(Unit, f64)> {
    let total_area: f64 = units.iter().map(|u| u.size).sum();
    let occupied_area: f64 = occupied_units.iter().map(|u| u.size).sum();
    
    let umlage_faehig = cost * (occupied_area / total_area);
    
    occupied_units.iter()
        .map(|unit| {
            let share = unit.size / occupied_area;
            let amount = umlage_faehig * share;
            (unit.clone(), amount)
        })
        .collect()
}

pub fn distribute_costs_by_persons(cost: f64, tenants: &[Tenant]) -> Vec<(Tenant, f64)> {
    let count = tenants.len() as f64;
    let per_person = cost / count;
    
    tenants.iter()
        .map(|tenant| (tenant.clone(), per_person))
        .collect()
}
