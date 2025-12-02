import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { TimeSlot } from '@/lib/types';

// GET /api/owner/slots - Get all slots for owner's cafe
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const slots = db.prepare(`
      SELECT 
        ts.*,
        COALESCE(SUM(b.num_pcs), 0) as booked_pcs,
        COUNT(b.id) as booking_count
      FROM time_slots ts
      LEFT JOIN bookings b ON ts.id = b.slot_id AND b.status = 'confirmed'
      WHERE ts.cafe_id = ?
      GROUP BY ts.id
      ORDER BY ts.date, ts.start_time
    `).all(session.cafeId);

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

// PUT /api/owner/slots - Update slot availability
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { slot_id, is_available } = body;

    if (!slot_id || is_available === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the slot belongs to this cafe
    const slot = db.prepare('SELECT * FROM time_slots WHERE id = ? AND cafe_id = ?')
      .get(slot_id, session.cafeId) as TimeSlot | undefined;

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    // Update slot availability
    db.prepare('UPDATE time_slots SET is_available = ? WHERE id = ?')
      .run(is_available ? 1 : 0, slot_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

