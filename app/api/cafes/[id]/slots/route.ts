import { NextResponse } from 'next/server';
import db from '@/lib/db';
import type { TimeSlot } from '@/lib/types';

// GET /api/cafes/[id]/slots - Get available slots for a cafe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cafeId = parseInt(id);

    // Get all slots with booking count to calculate remaining capacity
    const slots = db.prepare(`
      SELECT 
        ts.*,
        COALESCE(SUM(b.num_pcs), 0) as booked_pcs
      FROM time_slots ts
      LEFT JOIN bookings b ON ts.id = b.slot_id AND b.status = 'confirmed'
      WHERE ts.cafe_id = ? AND ts.date >= date('now')
      GROUP BY ts.id
      ORDER BY ts.date, ts.start_time
    `).all(cafeId) as (TimeSlot & { booked_pcs: number })[];

    // Calculate remaining capacity for each slot
    const slotsWithCapacity = slots.map(slot => ({
      ...slot,
      remaining_pcs: slot.available_pcs - slot.booked_pcs,
      is_bookable: slot.is_available && (slot.available_pcs - slot.booked_pcs) > 0,
    }));

    return NextResponse.json(slotsWithCapacity);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

