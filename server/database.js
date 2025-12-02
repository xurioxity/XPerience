const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'gaming_cafe.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Cafes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      description TEXT,
      num_pcs INTEGER NOT NULL,
      gpu_specs TEXT,
      cpu_specs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cafe photos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafe_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL,
      photo_url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  // Games available at cafes
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafe_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL,
      game_name TEXT NOT NULL,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  // Time slots for bookings
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cafe_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      gaming_handle TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE CASCADE
    )
  `);

  // Cafe owners table (for authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafe_owners (
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

module.exports = { db, initializeDatabase };

