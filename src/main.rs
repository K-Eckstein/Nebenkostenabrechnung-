use anyhow::Result;
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::io;

mod models;
mod database;
mod services;
mod ui;
mod export;
mod utils;

use database::connection::Database;
use ui::app::App;

fn main() -> Result<()> {
    // Logger initialisieren
    env_logger::init();
    log::info!("Starte Nebenkostenabrechnung...");

    // Datenbank initialisieren
    let db = Database::new()?;
    log::info!("Datenbank erfolgreich initialisiert");

    // Terminal Setup
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // App erstellen
    let mut app = App::new(db);

    // Hauptloop
    loop {
        terminal.draw(|f| ui::draw(f, &mut app))?;

        if let Event::Key(key) = event::read()? {
            match key.code {
                KeyCode::Char('q') => break,
                _ => app.handle_key(key),
            }
        }
    }

    // Terminal Cleanup
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;

    log::info!("Programm beendet");
    Ok(())
}
