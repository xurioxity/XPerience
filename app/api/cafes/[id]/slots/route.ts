import { NextResponse } from 'next/server';
import { getSlotsForCafe, isVercel } from '@/lib/mock-data';

// GET /api/cafes/[id]/slots - Get available slots for a cafe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cafeId = parseInt(id);

  // Use mock data on Vercel
  if (isVercel) {
    return NextResponse.json(getSlotsForCafe(cafeId));
  }

  try {
    const db = (await import('@/lib/db')).default;

    const slots = db.prepare(`
      SELECT 
        ts.*,
        COALESCE(SUM(b.num_pcs), 0) as booked_pcs
      FROM time_slots ts
      LEFT JOIN bookings b ON ts.id = b.slot_id AND b.status = 'confirmed'
      WHERE ts.cafe_id = ? AND ts.date >= date('now')
      GROUP BY ts.id
      ORDER BY ts.date, ts.start_time
    `).all(cafeId) as Array<{ available_pcs: number; booked_pcs: number; is_available: number }>;

    const slotsWithCapacity = slots.map(slot => ({
      ...slot,
      remaining_pcs: slot.available_pcs - slot.booked_pcs,
      is_bookable: slot.is_available && (slot.available_pcs - slot.booked_pcs) > 0,
    }));

    return NextResponse.json(slotsWithCapacity);
  } catch (error) {
    console.error('Error fetching slots:', error);
    // Fallback to mock data
    return NextResponse.json(getSlotsForCafe(cafeId));
  }
}
