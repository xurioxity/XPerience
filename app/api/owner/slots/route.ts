import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSlotsForCafe } from '@/lib/mock-data';

// GET /api/owner/slots - Get all slots for owner's cafe
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slots = getSlotsForCafe(session.cafeId);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}

// PUT /api/owner/slots - Update slot availability (demo mode)
export async function PUT() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: true, message: 'Demo mode - changes not persisted' });
}
