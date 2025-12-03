import { NextResponse } from 'next/server';
import { mockCafes, getSlotsForCafe, addBooking, getBookingsByEmail } from '@/lib/mock-data';

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slot_id, cafe_id, user_name, user_email, gaming_handle, num_pcs = 1 } = body;

    if (!slot_id || !cafe_id || !user_name || !user_email || !gaming_handle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// GET /api/bookings?email=user@example.com - Get bookings by email
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

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
