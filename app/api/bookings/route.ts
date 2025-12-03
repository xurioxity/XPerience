import { NextResponse } from 'next/server';
import { mockCafes, getSlotsForCafe, addBooking, getBookingsByEmail, isVercel } from '@/lib/mock-data';

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slot_id, cafe_id, user_name, user_email, gaming_handle, num_pcs = 1 } = body;

    // Validate required fields
    if (!slot_id || !cafe_id || !user_name || !user_email || !gaming_handle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use mock data on Vercel
    if (isVercel) {
      const cafe = mockCafes.find(c => c.id === cafe_id);
      const slots = getSlotsForCafe(cafe_id);
      const slot = slots.find(s => s.id === slot_id);

      if (!slot) {
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
      }

      const booking = addBooking({
        slot_id,
        cafe_id,
        user_name,
        user_email,
        gaming_handle,
        num_pcs,
      });

      return NextResponse.json({
        ...booking,
        cafe_name: cafe?.name,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }, { status: 201 });
    }

    // Use real DB locally
    const db = (await import('@/lib/db')).default;

    // Check slot availability
    const slot = db.prepare(`
      SELECT 
        ts.*,
        COALESCE(SUM(b.num_pcs), 0) as booked_pcs
      FROM time_slots ts
      LEFT JOIN bookings b ON ts.id = b.slot_id AND b.status = 'confirmed'
      WHERE ts.id = ?
      GROUP BY ts.id
    `).get(slot_id) as { is_available: number; available_pcs: number; booked_pcs: number } | undefined;

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (!slot.is_available) {
      return NextResponse.json({ error: 'This slot is not available' }, { status: 400 });
    }

    const remainingCapacity = slot.available_pcs - slot.booked_pcs;

    if (remainingCapacity < num_pcs) {
      return NextResponse.json(
        { error: `Only ${remainingCapacity} PC(s) available for this slot` },
        { status: 400 }
      );
    }

    // Create booking
    const insertBooking = db.prepare(`
      INSERT INTO bookings (slot_id, cafe_id, user_name, user_email, gaming_handle, num_pcs, status)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    `);

    const result = insertBooking.run(slot_id, cafe_id, user_name, user_email, gaming_handle, num_pcs);

    const booking = db.prepare(`
      SELECT 
        b.*,
        c.name as cafe_name,
        ts.date,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN cafes c ON b.cafe_id = c.id
      JOIN time_slots ts ON b.slot_id = ts.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// GET /api/bookings?email=user@example.com - Get bookings by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Use mock data on Vercel
    if (isVercel) {
      const bookings = getBookingsByEmail(email);
      const bookingsWithDetails = bookings.map(booking => {
        const cafe = mockCafes.find(c => c.id === booking.cafe_id);
        const slots = getSlotsForCafe(booking.cafe_id);
        const slot = slots.find(s => s.id === booking.slot_id);
        return {
          ...booking,
          cafe_name: cafe?.name,
          cafe_address: cafe?.address,
          date: slot?.date,
          start_time: slot?.start_time,
          end_time: slot?.end_time,
        };
      });
      return NextResponse.json(bookingsWithDetails);
    }

    // Use real DB locally
    const db = (await import('@/lib/db')).default;

    const bookings = db.prepare(`
      SELECT 
        b.*,
        c.name as cafe_name,
        c.address as cafe_address,
        ts.date,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN cafes c ON b.cafe_id = c.id
      JOIN time_slots ts ON b.slot_id = ts.id
      WHERE b.user_email = ?
      ORDER BY ts.date DESC, ts.start_time DESC
    `).all(email);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
