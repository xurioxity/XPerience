import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database connection
const dbPath = path.join(process.cwd(), 'gaming-cafes.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
export function initializeDatabase() {
  // Cafes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      num_pcs INTEGER NOT NULL,
      gpu_specs TEXT NOT NULL,
      cpu_specs TEXT,
      ram_specs TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL,
      game_name TEXT NOT NULL,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  // Time slots table - represents available booking slots
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      available_pcs INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER NOT NULL,
      cafe_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      gaming_handle TEXT NOT NULL,
      num_pcs INTEGER DEFAULT 1,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  // Owners table - for cafe owner authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

export default db;

