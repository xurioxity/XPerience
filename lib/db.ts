import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Use /tmp for Vercel (serverless) or project root for local
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? '/tmp/gaming-cafes.db'
  : path.join(process.cwd(), 'gaming-cafes.db');

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

  // Time slots table
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

  // Owners table
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

  // Check if we need to seed data
  const existingCafes = db.prepare('SELECT COUNT(*) as count FROM cafes').get() as { count: number };
  
  if (existingCafes.count === 0) {
    seedDatabase();
  }

  console.log('Database initialized successfully');
}

function seedDatabase() {
  console.log('Seeding database with sample data...');

  // Insert sample cafes
  const insertCafe = db.prepare(`
    INSERT INTO cafes (name, address, description, num_pcs, gpu_specs, cpu_specs, ram_specs, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cafe1 = insertCafe.run(
    'GameZone Arena',
    'MG Road, Bangalore - 560001',
    'Premium gaming cafe with high-end hardware and comfortable seating',
    25,
    'NVIDIA RTX 4080',
    'Intel Core i9-13900K',
    '32GB DDR5',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
  );

  const cafe2 = insertCafe.run(
    'Cyber Knights Gaming',
    'Koramangala 4th Block, Bangalore - 560034',
    'Esports-ready cafe with tournament hosting facilities',
    30,
    'NVIDIA RTX 4070 Ti',
    'AMD Ryzen 9 7950X',
    '32GB DDR5',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800'
  );

  const cafe3 = insertCafe.run(
    'Pixel Paradise',
    'Indiranagar 100 Feet Road, Bangalore - 560038',
    'Cozy gaming lounge with a wide variety of games',
    20,
    'NVIDIA RTX 4060 Ti',
    'Intel Core i7-13700K',
    '16GB DDR5',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800'
  );

  // Insert games for each cafe
  const insertGame = db.prepare('INSERT INTO games (cafe_id, game_name) VALUES (?, ?)');

  const games = [
    'Valorant', 'CS:GO', 'Dota 2', 'League of Legends', 'Fortnite',
    'Apex Legends', 'Overwatch 2', 'PUBG', 'GTA V', 'Minecraft',
    'Call of Duty: Warzone', 'Rocket League', 'Rainbow Six Siege'
  ];

  [cafe1.lastInsertRowid, cafe2.lastInsertRowid, cafe3.lastInsertRowid].forEach(cafeId => {
    games.forEach(game => {
      insertGame.run(cafeId, game);
    });
  });

  // Insert time slots for the next 7 days
  const insertSlot = db.prepare(`
    INSERT INTO time_slots (cafe_id, date, start_time, end_time, available_pcs, is_available)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const timeSlots = [
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
    { start: '20:00', end: '22:00' },
    { start: '22:00', end: '00:00' }
  ];

  const cafes = [
    { id: cafe1.lastInsertRowid, pcs: 25 },
    { id: cafe2.lastInsertRowid, pcs: 30 },
    { id: cafe3.lastInsertRowid, pcs: 20 }
  ];

  // Generate slots for next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    cafes.forEach(cafe => {
      timeSlots.forEach(slot => {
        insertSlot.run(cafe.id, dateStr, slot.start, slot.end, cafe.pcs, 1);
      });
    });
  }

  // Create sample owner accounts (password: 'password123' for all)
  const insertOwner = db.prepare(`
    INSERT INTO owners (cafe_id, username, password_hash, email)
    VALUES (?, ?, ?, ?)
  `);

  const passwordHash = bcrypt.hashSync('password123', 10);

  insertOwner.run(cafe1.lastInsertRowid, 'gamezone_owner', passwordHash, 'owner@gamezone.com');
  insertOwner.run(cafe2.lastInsertRowid, 'cyberknights_owner', passwordHash, 'owner@cyberknights.com');
  insertOwner.run(cafe3.lastInsertRowid, 'pixelparadise_owner', passwordHash, 'owner@pixelparadise.com');

  console.log('Database seeded successfully!');
}

export default db;
