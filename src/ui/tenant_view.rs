use ratatui::Frame;
use ratatui::layout::Rect;
use ratatui::widgets::{Block, Borders, Paragraph};
use super::app::App;

pub fn draw(f: &mut Frame, area: Rect, app: &App) {
    let block = Block::default()
        .title("Mieterverwaltung")
        .borders(Borders::ALL);
    
    let paragraph = Paragraph::new("Mieterdaten werden hier angezeigt...").block(block);
    f.render_widget(paragraph, area);
}
