use anyhow::Result;
use crate::models::*;

pub fn export_costs_to_csv(costs: &[Cost]) -> Result<String> {
    let mut wtr = csv::Writer::from_writer(vec![]);
    
    wtr.write_record(&["Datum", "Kategorie", "Beschreibung", "Betrag", "Verteiler"])?;
    
    for cost in costs {
        wtr.write_record(&[
            cost.date.to_string(),
            cost.category.to_string(),
            &cost.description,
            &cost.amount.to_string(),
            cost.distribution_key.to_string(),
        ])?;
    }
    
    let data = String::from_utf8(wtr.into_inner()?)?;
    Ok(data)
}
