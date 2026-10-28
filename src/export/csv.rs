use anyhow::Result;
use crate::models::*;

pub fn export_costs_to_csv(costs: &[Cost]) -> Result<String> {
    let mut wtr = csv::Writer::from_writer(vec![]);
    
    wtr.write_record(&["Datum", "Kategorie", "Beschreibung", "Betrag", "Verteiler"])?;
    
    for cost in costs {
        let date_str = cost.date.to_string();
        let category_str = cost.category.to_string();
        let amount_str = cost.amount.to_string();
        let dist_key_str = cost.distribution_key.to_string();
        
        wtr.write_record(&[
            &date_str,
            &category_str,
            &cost.description,
            &amount_str,
            &dist_key_str,
        ])?;
    }
    
    let data = String::from_utf8(wtr.into_inner()?)?;
    Ok(data)
}
