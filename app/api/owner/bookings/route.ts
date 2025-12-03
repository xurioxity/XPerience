import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockCafes, getSlotsForCafe, getBookingsByCafe } from '@/lib/mock-data';

// GET /api/owner/bookings - Get all bookings for owner's cafe
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = getBookingsByCafe(session.cafeId);
    const cafe = mockCafes.find(c => c.id === session.cafeId);
    const slots = getSlotsForCafe(session.cafeId);

    const bookingsWithDetails = bookings.map(booking => {
      const slot = slots.find(s => s.id === booking.slot_id);
      return {
        ...booking,
        cafe_name: cafe?.name,
        date: slot?.date,
        start_time: slot?.start_time,
        end_time: slot?.end_time,
      };
    });

    return NextResponse.json(bookingsWithDetails);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
