use crossterm::event::KeyEvent;
use crate::database::connection::Database;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum View {
    Dashboard,
    Property,
    Tenant,
    Cost,
    Settlement,
}

pub struct App {
    pub db: Database,
    pub current_view: View,
    pub should_quit: bool,
}

impl App {
    pub fn new(db: Database) -> Self {
        Self {
            db,
            current_view: View::Dashboard,
            should_quit: false,
        }
    }

    pub fn handle_key(&mut self, key: KeyEvent) {
        use crossterm::event::KeyCode;
        
        match key.code {
            KeyCode::Char('q') => self.should_quit = true,
            KeyCode::Char('1') => self.current_view = View::Dashboard,
            KeyCode::Char('2') => self.current_view = View::Property,
            KeyCode::Char('3') => self.current_view = View::Tenant,
            KeyCode::Char('4') => self.current_view = View::Cost,
            KeyCode::Char('5') => self.current_view = View::Settlement,
            _ => {}
        }
    }
}
