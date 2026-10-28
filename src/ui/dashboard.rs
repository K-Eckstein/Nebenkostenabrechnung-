use ratatui::Frame;
use ratatui::layout::Rect;
use ratatui::widgets::{Block, Borders, Paragraph};
use super::app::App;

pub fn draw(f: &mut Frame, area: Rect, app: &App) {
    let block = Block::default()
        .title("Dashboard - Nebenkostenabrechnung")
        .borders(Borders::ALL);
    
    let text = format!(
        "Willkommen zur Nebenkostenabrechnung!\n\n\
         Tastenkürzel:\n\
         1 - Dashboard\n\
         2 - Objekt\n\
         3 - Mieter\n\
         4 - Kosten\n\
         5 - Abrechnung\n\
         q - Beenden\n\n\
         Datenbank: Verbunden"
    );
    
    let paragraph = Paragraph::new(text).block(block);
    f.render_widget(paragraph, area);
}
