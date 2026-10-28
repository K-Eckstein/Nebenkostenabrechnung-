use anyhow::Result;
use rusqlite::Connection;
use std::path::PathBuf;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let db_path = Self::get_db_path()?;
        let conn = Connection::open(db_path)?;
        
        let db = Self { conn };
        db.initialize()?;
        
        Ok(db)
    }

    fn get_db_path() -> Result<PathBuf> {
        let mut path = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("nebenkosten");
        
        std::fs::create_dir_all(&path)?;
        path.push("nebenkosten.db");
        
        Ok(path)
    }

    fn initialize(&self) -> Result<()> {
        super::migrations::run_migrations(&self.conn)?;
        Ok(())
    }

    pub fn connection(&self) -> &Connection {
        &self.conn
    }
}
