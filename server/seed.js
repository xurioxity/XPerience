const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./database');

// Initialize database schema
initializeDatabase();

// Clear existing data
console.log('Clearing existing data...');
db.exec('DELETE FROM bookings');
db.exec('DELETE FROM time_slots');
db.exec('DELETE FROM cafe_games');
db.exec('DELETE FROM cafe_photos');
db.exec('DELETE FROM cafe_owners');
db.exec('DELETE FROM cafes');

// Sample cafe data
const cafes = [
  {
    name: 'Pixel Paradise Gaming Lounge',
    address: 'MG Road, Bangalore - 560001',
    phone: '+91 98765 43210',
    description: 'Premium gaming experience with top-tier hardware and comfortable seating.',
    num_pcs: 25,
    gpu_specs: 'NVIDIA RTX 4080',
    cpu_specs: 'Intel Core i9-13900K'
  },
  {
    name: 'Cyber Arena Gaming Café',
    address: 'Koramangala 4th Block, Bangalore - 560034',
    phone: '+91 98765 43211',
    description: 'Your favorite esports hub with tournament-ready setups.',
    num_pcs: 30,
    gpu_specs: 'NVIDIA RTX 4070 Ti',
    cpu_specs: 'AMD Ryzen 9 7950X'
  },
  {
    name: 'GameZone Elite',
    address: 'Indiranagar, Bangalore - 560038',
    phone: '+91 98765 43212',
    description: 'Casual and competitive gaming with a vibrant community.',
    num_pcs: 20,
    gpu_specs: 'NVIDIA RTX 4060 Ti',
    cpu_specs: 'Intel Core i7-13700K'
  }
];

// Insert cafes
console.log('Seeding cafes...');
const insertCafe = db.prepare(`
  INSERT INTO cafes (name, address, phone, description, num_pcs, gpu_specs, cpu_specs)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const cafeIds = cafes.map(cafe => {
  const result = insertCafe.run(
    cafe.name,
    cafe.address,
    cafe.phone,
    cafe.description,
    cafe.num_pcs,
    cafe.gpu_specs,
    cafe.cpu_specs
  );
  return result.lastInsertRowid;
});

// Sample photos for cafes
console.log('Seeding cafe photos...');
const insertPhoto = db.prepare(`
  INSERT INTO cafe_photos (cafe_id, photo_url, is_primary)
  VALUES (?, ?, ?)
`);

cafeIds.forEach((cafeId, index) => {
  insertPhoto.run(cafeId, `https://picsum.photos/800/600?random=${index * 3 + 1}`, 1);
  insertPhoto.run(cafeId, `https://picsum.photos/800/600?random=${index * 3 + 2}`, 0);
  insertPhoto.run(cafeId, `https://picsum.photos/800/600?random=${index * 3 + 3}`, 0);
});

// Sample games
console.log('Seeding games...');
const games = [
  'Counter-Strike 2', 'Valorant', 'League of Legends', 'Dota 2',
  'Apex Legends', 'Fortnite', 'Call of Duty: Warzone', 'Overwatch 2',
  'Rainbow Six Siege', 'Rocket League', 'FIFA 24', 'GTA V',
  'Minecraft', 'Cyberpunk 2077', 'Elden Ring'
];

const insertGame = db.prepare(`
  INSERT INTO cafe_games (cafe_id, game_name)
  VALUES (?, ?)
`);

cafeIds.forEach(cafeId => {
  // Each cafe gets 10-12 random games
  const numGames = 10 + Math.floor(Math.random() * 3);
  const selectedGames = games.sort(() => 0.5 - Math.random()).slice(0, numGames);
  selectedGames.forEach(game => {
    insertGame.run(cafeId, game);
  });
});

// Sample time slots (5 slots per day for next 7 days for each cafe)
console.log('Seeding time slots...');
const insertSlot = db.prepare(`
  INSERT INTO time_slots (cafe_id, date, start_time, end_time, is_available)
  VALUES (?, ?, ?, ?, ?)
`);

const timeSlots = [
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' }
];

cafeIds.forEach(cafeId => {
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateString = date.toISOString().split('T')[0];
    
    timeSlots.forEach(slot => {
      insertSlot.run(cafeId, dateString, slot.start, slot.end, 1);
    });
  }
});

// Create sample owners (one per cafe, password is "password123" for all)
console.log('Seeding cafe owners...');
const passwordHash = bcrypt.hashSync('password123', 10);
const insertOwner = db.prepare(`
  INSERT INTO cafe_owners (cafe_id, username, password_hash, email)
  VALUES (?, ?, ?, ?)
`);

cafeIds.forEach((cafeId, index) => {
  insertOwner.run(
    cafeId,
    `owner${index + 1}`,
    passwordHash,
    `owner${index + 1}@example.com`
  );
});

console.log('\n✅ Database seeded successfully!');
console.log('\nSample owner credentials:');
console.log('- Username: owner1, Password: password123 (Pixel Paradise)');
console.log('- Username: owner2, Password: password123 (Cyber Arena)');
console.log('- Username: owner3, Password: password123 (GameZone Elite)');
console.log('\nDatabase ready at: server/gaming_cafe.db\n');

db.close();

