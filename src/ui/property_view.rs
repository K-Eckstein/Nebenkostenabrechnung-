use ratatui::Frame;
use ratatui::layout::Rect;
use ratatui::widgets::{Block, Borders, Paragraph};
use ratatui::style::{Style, Color};
use ratatui::text::Line;
use super::app::App;

pub fn draw(f: &mut Frame, area: Rect, _app: &App) {
    let block = Block::default()
        .title("Objektverwaltung")
        .borders(Borders::ALL);
    
    let text = vec![
        Line::from(""),
        Line::from("  Objektdaten werden hier angezeigt..."),
        Line::from(""),
        Line::from("  Hier können Sie folgende Daten verwalten:"),
        Line::from("  • Objektname und Adresse"),
        Line::from("  • Eigentümer-Informationen"),
        Line::from("  • Bankverbindung"),
        Line::from("  • Steuer-Nummer"),
        Line::from(""),
        Line::from("  [Drücke eine Taste um fortzufahren]"),
    ];
    
    let paragraph = Paragraph::new(text).block(block);
    f.render_widget(paragraph, area);
}
