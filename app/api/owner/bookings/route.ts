import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { BookingWithDetails } from '@/lib/types';

// GET /api/owner/bookings - Get all bookings for owner's cafe
export async function GET() {
  try {
    // Verify owner session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all bookings for this cafe
    const bookings = db.prepare(`
      SELECT 
        b.*,
        c.name as cafe_name,
        ts.date,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN cafes c ON b.cafe_id = c.id
      JOIN time_slots ts ON b.slot_id = ts.id
      WHERE b.cafe_id = ?
      ORDER BY ts.date DESC, ts.start_time DESC
    `).all(session.cafeId) as BookingWithDetails[];

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

