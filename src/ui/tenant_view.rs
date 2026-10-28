use ratatui::Frame;
use ratatui::layout::Rect;
use ratatui::widgets::{Block, Borders, Paragraph};
use ratatui::text::Line;
use super::app::App;

pub fn draw(f: &mut Frame, area: Rect, _app: &App) {
    let block = Block::default()
        .title("Mieterverwaltung")
        .borders(Borders::ALL);
    
    let text = vec![
        Line::from(""),
        Line::from("  Mieterdaten werden hier angezeigt..."),
        Line::from(""),
        Line::from("  Hier können Sie folgende Daten verwalten:"),
        Line::from("  • Mieter anlegen und bearbeiten"),
        Line::from("  • Ein- und Auszugsdaten"),
        Line::from("  • Kontaktinformationen"),
        Line::from("  • Vorauszahlungen pro Mieter"),
        Line::from(""),
        Line::from("  [Drücke eine Taste um fortzufahren]"),
    ];
    
    let paragraph = Paragraph::new(text).block(block);
    f.render_widget(paragraph, area);
}
