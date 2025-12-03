import { NextResponse } from 'next/server';
import { mockCafes, getGamesForCafe, isVercel } from '@/lib/mock-data';

// GET /api/cafes/[id] - Get cafe details with games
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cafeId = parseInt(id);

  // Use mock data on Vercel
  if (isVercel) {
    const cafe = mockCafes.find(c => c.id === cafeId);
    if (!cafe) {
      return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...cafe,
      games: getGamesForCafe(cafeId),
    });
  }

  try {
    const db = (await import('@/lib/db')).default;

    const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(cafeId);
    if (!cafe) {
      return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
    }

    const games = db.prepare('SELECT * FROM games WHERE cafe_id = ?').all(cafeId);
    return NextResponse.json({ ...cafe, games });
  } catch (error) {
    console.error('Error fetching cafe:', error);
    // Fallback to mock data
    const cafe = mockCafes.find(c => c.id === cafeId);
    if (!cafe) {
      return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...cafe,
      games: getGamesForCafe(cafeId),
    });
  }
}

// PUT /api/cafes/[id] - Update cafe details (owner only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cafeId = parseInt(id);

  // On Vercel, just return success (demo mode)
  if (isVercel) {
    return NextResponse.json({ success: true, message: 'Demo mode - changes not persisted' });
  }

  try {
    const db = (await import('@/lib/db')).default;
    const body = await request.json();
    const { name, address, description, num_pcs, gpu_specs, cpu_specs, ram_specs } = body;

    const stmt = db.prepare(`
      UPDATE cafes 
      SET name = ?, address = ?, description = ?, num_pcs = ?, 
          gpu_specs = ?, cpu_specs = ?, ram_specs = ?
      WHERE id = ?
    `);

    stmt.run(name, address, description, num_pcs, gpu_specs, cpu_specs, ram_specs, cafeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cafe:', error);
    return NextResponse.json({ error: 'Failed to update cafe' }, { status: 500 });
  }
}
