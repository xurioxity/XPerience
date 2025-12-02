const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔍 Verifying setup...\n');

const dbPath = path.join(process.cwd(), 'gaming-cafes.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found!');
  console.log('   Run: npm run setup\n');
  process.exit(1);
}

console.log('✅ Database file exists');

// Open database
const db = new Database(dbPath);

try {
  // Check tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();

  const requiredTables = ['cafes', 'games', 'time_slots', 'bookings', 'owners'];
  const existingTables = tables.map(t => t.name);

  console.log('✅ Database tables:');
  requiredTables.forEach(table => {
    if (existingTables.includes(table)) {
      console.log(`   ✓ ${table}`);
    } else {
      console.log(`   ✗ ${table} (missing)`);
    }
  });

  // Check data
  const cafeCount = db.prepare('SELECT COUNT(*) as count FROM cafes').get().count;
  const slotCount = db.prepare('SELECT COUNT(*) as count FROM time_slots').get().count;
  const ownerCount = db.prepare('SELECT COUNT(*) as count FROM owners').get().count;

  console.log('\n✅ Sample data:');
  console.log(`   • ${cafeCount} cafés`);
  console.log(`   • ${slotCount} time slots`);
  console.log(`   • ${ownerCount} owner accounts`);

  if (cafeCount === 0) {
    console.log('\n⚠️  No sample data found. Run: npm run setup');
  } else {
    console.log('\n✅ Setup verified successfully!');
    console.log('\n🚀 Ready to start:');
    console.log('   npm run dev');
    console.log('\n   Then visit: http://localhost:3000');
  }

} catch (error) {
  console.log('❌ Error checking database:', error.message);
  process.exit(1);
} finally {
  db.close();
}

