import { NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Cafe, Game } from '@/lib/types';

// GET /api/cafes/[id] - Get cafe details with games
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cafeId = parseInt(id);

    // Get cafe details
    const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(cafeId) as Cafe | undefined;

    if (!cafe) {
      return NextResponse.json(
        { error: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Get games for this cafe
    const games = db.prepare('SELECT * FROM games WHERE cafe_id = ?').all(cafeId) as Game[];

    return NextResponse.json({
      ...cafe,
      games,
    });
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe details' },
      { status: 500 }
    );
  }
}

// PUT /api/cafes/[id] - Update cafe details (owner only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cafeId = parseInt(id);
    const body = await request.json();

    const { name, address, description, num_pcs, gpu_specs, cpu_specs, ram_specs } = body;

    // Update cafe
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
    return NextResponse.json(
      { error: 'Failed to update cafe' },
      { status: 500 }
    );
  }
}

