use crate::models::*;

pub fn validate_property(property: &Property) -> Result<(), String> {
    property.validate()
}

pub fn validate_unit(unit: &Unit) -> Result<(), String> {
    unit.validate()
}

pub fn validate_tenant(tenant: &Tenant) -> Result<(), String> {
    tenant.validate()
}

pub fn validate_cost(cost: &Cost) -> Result<(), String> {
    cost.validate()
}
