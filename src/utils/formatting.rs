pub fn format_currency(amount: f64) -> String {
    format!("{:.2} €", amount)
}

pub fn format_date(date: &str) -> String {
    date.to_string()
}
