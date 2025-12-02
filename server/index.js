const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initializeDatabase } = require('./database');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production'; // In production, use environment variable

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Initialize database on server start
initializeDatabase();

// Authentication middleware for owner routes
function authenticateOwner(req, res, next) {
  const token = req.cookies.ownerToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.ownerId = decoded.ownerId;
    req.cafeId = decoded.cafeId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============= PUBLIC API ROUTES =============

// Get all cafes (for home page)
app.get('/api/cafes', (req, res) => {
  try {
    const cafes = db.prepare(`
      SELECT c.*, 
             (SELECT photo_url FROM cafe_photos WHERE cafe_id = c.id AND is_primary = 1 LIMIT 1) as primary_photo
      FROM cafes c
    `).all();
    
    res.json(cafes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cafes' });
  }
});

// Get specific cafe details
app.get('/api/cafes/:id', (req, res) => {
  try {
    const cafeId = req.params.id;
    
    // Get cafe basic info
    const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(cafeId);
    
    if (!cafe) {
      return res.status(404).json({ error: 'Cafe not found' });
    }
    
    // Get photos
    const photos = db.prepare('SELECT * FROM cafe_photos WHERE cafe_id = ?').all(cafeId);
    
    // Get games
    const games = db.prepare('SELECT game_name FROM cafe_games WHERE cafe_id = ?').all(cafeId);
    
    res.json({
      ...cafe,
      photos,
      games: games.map(g => g.game_name)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cafe details' });
  }
});

// Get available slots for a cafe
app.get('/api/cafes/:id/slots', (req, res) => {
  try {
    const cafeId = req.params.id;
    const { date } = req.query;
    
    let query = `
      SELECT ts.*, 
             (SELECT COUNT(*) FROM bookings WHERE slot_id = ts.id) as booking_count
      FROM time_slots ts
      WHERE ts.cafe_id = ? AND ts.is_available = 1
    `;
    
    const params = [cafeId];
    
    if (date) {
      query += ' AND ts.date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY ts.date, ts.start_time';
    
    const slots = db.prepare(query).all(...params);
    
    // Filter out already booked slots
    const availableSlots = slots.filter(slot => slot.booking_count === 0);
    
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Create a booking
app.post('/api/bookings', (req, res) => {
  try {
    const { slot_id, user_name, user_email, gaming_handle } = req.body;
    
    // Validate input
    if (!slot_id || !user_name || !user_email || !gaming_handle) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if slot is available and not already booked
    const slot = db.prepare(`
      SELECT ts.*, 
             (SELECT COUNT(*) FROM bookings WHERE slot_id = ts.id) as booking_count
      FROM time_slots ts
      WHERE ts.id = ? AND ts.is_available = 1
    `).get(slot_id);
    
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found or unavailable' });
    }
    
    if (slot.booking_count > 0) {
      return res.status(400).json({ error: 'Slot already booked' });
    }
    
    // Create booking
    const result = db.prepare(`
      INSERT INTO bookings (slot_id, user_name, user_email, gaming_handle, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `).run(slot_id, user_name, user_email, gaming_handle);
    
    // Get the created booking with slot and cafe details
    const booking = db.prepare(`
      SELECT b.*, ts.date, ts.start_time, ts.end_time, c.name as cafe_name, c.address as cafe_address
      FROM bookings b
      JOIN time_slots ts ON b.slot_id = ts.id
      JOIN cafes c ON ts.cafe_id = c.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings by email
app.get('/api/bookings', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const bookings = db.prepare(`
      SELECT b.*, ts.date, ts.start_time, ts.end_time, 
             c.name as cafe_name, c.address as cafe_address,
             c.id as cafe_id
      FROM bookings b
      JOIN time_slots ts ON b.slot_id = ts.id
      JOIN cafes c ON ts.cafe_id = c.id
      WHERE b.user_email = ?
      ORDER BY ts.date DESC, ts.start_time DESC
    `).all(email);
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ============= OWNER AUTHENTICATION ROUTES =============

// Owner login
app.post('/api/owner/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Find owner
    const owner = db.prepare(`
      SELECT co.*, c.name as cafe_name
      FROM cafe_owners co
      JOIN cafes c ON co.cafe_id = c.id
      WHERE co.username = ?
    `).get(username);
    
    if (!owner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = bcrypt.compareSync(password, owner.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { ownerId: owner.id, cafeId: owner.cafe_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set cookie
    res.cookie('ownerToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });
    
    res.json({
      id: owner.id,
      username: owner.username,
      cafeId: owner.cafe_id,
      cafeName: owner.cafe_name,
      email: owner.email
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Owner logout
app.post('/api/owner/logout', (req, res) => {
  res.clearCookie('ownerToken');
  res.json({ message: 'Logged out successfully' });
});

// Check owner authentication status
app.get('/api/owner/me', authenticateOwner, (req, res) => {
  try {
    const owner = db.prepare(`
      SELECT co.id, co.username, co.email, co.cafe_id, c.name as cafe_name
      FROM cafe_owners co
      JOIN cafes c ON co.cafe_id = c.id
      WHERE co.id = ?
    `).get(req.ownerId);
    
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch owner details' });
  }
});

// ============= OWNER DASHBOARD ROUTES (Protected) =============

// Get cafe bookings (owner only)
app.get('/api/owner/bookings', authenticateOwner, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, ts.date, ts.start_time, ts.end_time
      FROM bookings b
      JOIN time_slots ts ON b.slot_id = ts.id
      WHERE ts.cafe_id = ?
      ORDER BY ts.date DESC, ts.start_time DESC
    `).all(req.cafeId);
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get cafe slots (owner only)
app.get('/api/owner/slots', authenticateOwner, (req, res) => {
  try {
    const slots = db.prepare(`
      SELECT ts.*, 
             (SELECT COUNT(*) FROM bookings WHERE slot_id = ts.id) as booking_count,
             (SELECT user_name FROM bookings WHERE slot_id = ts.id LIMIT 1) as booked_by
      FROM time_slots ts
      WHERE ts.cafe_id = ?
      ORDER BY ts.date, ts.start_time
    `).all(req.cafeId);
    
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Update slot availability (owner only)
app.patch('/api/owner/slots/:id', authenticateOwner, (req, res) => {
  try {
    const slotId = req.params.id;
    const { is_available } = req.body;
    
    // Verify slot belongs to owner's cafe
    const slot = db.prepare(`
      SELECT * FROM time_slots WHERE id = ? AND cafe_id = ?
    `).get(slotId, req.cafeId);
    
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    // Check if slot has bookings
    const bookingCount = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE slot_id = ?
    `).get(slotId).count;
    
    if (bookingCount > 0 && is_available === 0) {
      return res.status(400).json({ error: 'Cannot disable slot with existing booking' });
    }
    
    // Update slot
    db.prepare(`
      UPDATE time_slots SET is_available = ? WHERE id = ?
    `).run(is_available ? 1 : 0, slotId);
    
    res.json({ message: 'Slot updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// Update cafe details (owner only)
app.patch('/api/owner/cafe', authenticateOwner, (req, res) => {
  try {
    const { name, address, phone, description, num_pcs, gpu_specs, cpu_specs } = req.body;
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (num_pcs !== undefined) {
      updates.push('num_pcs = ?');
      params.push(num_pcs);
    }
    if (gpu_specs !== undefined) {
      updates.push('gpu_specs = ?');
      params.push(gpu_specs);
    }
    if (cpu_specs !== undefined) {
      updates.push('cpu_specs = ?');
      params.push(cpu_specs);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.cafeId);
    
    db.prepare(`
      UPDATE cafes SET ${updates.join(', ')} WHERE id = ?
    `).run(...params);
    
    const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(req.cafeId);
    
    res.json(cafe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cafe' });
  }
});

// Add new time slot (owner only)
app.post('/api/owner/slots', authenticateOwner, (req, res) => {
  try {
    const { date, start_time, end_time } = req.body;
    
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Date, start_time, and end_time are required' });
    }
    
    const result = db.prepare(`
      INSERT INTO time_slots (cafe_id, date, start_time, end_time, is_available)
      VALUES (?, ?, ?, ?, 1)
    `).run(req.cafeId, date, start_time, end_time);
    
    const slot = db.prepare('SELECT * FROM time_slots WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

