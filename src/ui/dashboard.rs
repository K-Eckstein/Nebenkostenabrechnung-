use ratatui::Frame;
use ratatui::layout::{Rect, Constraint, Direction, Layout};
use ratatui::widgets::{Block, Borders, Paragraph, Clear};
use ratatui::style::{Style, Color, Modifier};
use ratatui::text::{Line, Span};
use super::app::App;

pub fn draw(f: &mut Frame, area: Rect, _app: &App) {
    // Hintergrund löschen
    f.render_widget(Clear, area);
    
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .margin(1)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(3),
        ])
        .split(area);
    
    // Header
    let header = Paragraph::new(Line::from(vec![
        Span::styled("  Nebenkostenabrechnung  ", Style::default().fg(Color::White).bg(Color::Blue).add_modifier(Modifier::BOLD)),
        Span::raw("  "),
        Span::styled("v1.0.0", Style::default().fg(Color::Gray)),
    ]))
    .block(Block::default().borders(Borders::ALL).title("Dashboard"));
    f.render_widget(header, chunks[0]);
    
    // Hauptinhalt
    let main_chunks = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage(50),
            Constraint::Percentage(50),
        ])
        .split(chunks[1]);
    
    let welcome_text = vec![
        Line::from(""),
        Line::from(Span::styled("Willkommen zur Nebenkostenabrechnung!", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))),
        Line::from(""),
        Line::from("Diese Software hilft Ihnen bei der"),
        Line::from("Erstellung rechtskonformer Nebenkosten-"),
        Line::from("abrechnungen nach deutschem Mietrecht."),
        Line::from(""),
        Line::from(Span::styled("Tastenkürzel:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(""),
        Line::from(vec![
            Span::styled("  1  ", Style::default().fg(Color::Yellow)),
            Span::raw("Dashboard (diese Ansicht)"),
        ]),
        Line::from(vec![
            Span::styled("  2  ", Style::default().fg(Color::Yellow)),
            Span::raw("Objekt & Vermieter"),
        ]),
        Line::from(vec![
            Span::styled("  3  ", Style::default().fg(Color::Yellow)),
            Span::raw("Mieter verwalten"),
        ]),
        Line::from(vec![
            Span::styled("  4  ", Style::default().fg(Color::Yellow)),
            Span::raw("Kosten erfassen"),
        ]),
        Line::from(vec![
            Span::styled("  5  ", Style::default().fg(Color::Yellow)),
            Span::raw("Abrechnung erstellen"),
        ]),
        Line::from(""),
        Line::from(vec![
            Span::styled("  q  ", Style::default().fg(Color::Red)),
            Span::raw("Programm beenden"),
        ]),
    ];
    
    let welcome = Paragraph::new(welcome_text)
        .block(Block::default().borders(Borders::ALL).title("Übersicht"));
    f.render_widget(welcome, main_chunks[0]);
    
    let info_text = vec![
        Line::from(""),
        Line::from(Span::styled("Status:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(""),
        Line::from(vec![
            Span::styled("  ✓  ", Style::default().fg(Color::Green)),
            Span::raw("Datenbank verbunden"),
        ]),
        Line::from(vec![
            Span::styled("  ✓  ", Style::default().fg(Color::Green)),
            Span::raw("BetrKV-konform"),
        ]),
        Line::from(vec![
            Span::styled("  ✓  ", Style::default().fg(Color::Green)),
            Span::raw("HeizkostenV-konform"),
        ]),
        Line::from(vec![
            Span::styled("  ✓  ", Style::default().fg(Color::Green)),
            Span::raw("PDF-Export verfügbar"),
        ]),
        Line::from(vec![
            Span::styled("  ✓  ", Style::default().fg(Color::Green)),
            Span::raw("CSV-Export verfügbar"),
        ]),
        Line::from(""),
        Line::from(Span::styled("Rechtskonform nach:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(""),
        Line::from("  • BetrKV § 2"),
        Line::from("  • § 556a BGB"),
        Line::from("  • HeizkostenV"),
        Line::from("  • § 147 AO (Archivierung)"),
    ];
    
    let info = Paragraph::new(info_text)
        .block(Block::default().borders(Borders::ALL).title("System-Status"));
    f.render_widget(info, main_chunks[1]);
    
    // Footer
    let footer = Paragraph::new(Line::from(vec![
        Span::styled(" q ", Style::default().fg(Color::Black).bg(Color::Red)),
        Span::raw(" Beenden  "),
        Span::styled(" 1-5 ", Style::default().fg(Color::Black).bg(Color::Blue)),
        Span::raw(" Navigation  "),
        Span::styled("↑↓←→ ", Style::default().fg(Color::Black).bg(Color::Green)),
        Span::raw(" Bewegen"),
    ]))
    .block(Block::default().borders(Borders::ALL));
    f.render_widget(footer, chunks[2]);
}
