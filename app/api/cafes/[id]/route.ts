import { NextResponse } from 'next/server';
import { mockCafes, getGamesForCafe } from '@/lib/mock-data';

// GET /api/cafes/[id] - Get cafe details with games
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cafeId = parseInt(id);

  const cafe = mockCafes.find(c => c.id === cafeId);
  if (!cafe) {
    return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...cafe,
    games: getGamesForCafe(cafeId),
  });
}

// PUT /api/cafes/[id] - Update cafe details (demo mode)
export async function PUT() {
  return NextResponse.json({ success: true, message: 'Demo mode - changes not persisted' });
}
