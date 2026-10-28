use crate::models::*;

pub fn calculate_total_costs(costs: &[Cost]) -> f64 {
    costs.iter().map(|c| c.amount).sum()
}

pub fn calculate_umlegbar_costs(costs: &[Cost]) -> f64 {
    costs.iter()
        .filter(|c| c.category.is_umlegbar())
        .map(|c| c.amount)
        .sum()
}

pub fn calculate_nicht_umlegbar_costs(costs: &[Cost]) -> f64 {
    costs.iter()
        .filter(|c| !c.category.is_umlegbar())
        .map(|c| c.amount)
        .sum()
}
