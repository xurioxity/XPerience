import { NextResponse } from 'next/server';
import { getSlotsForCafe } from '@/lib/mock-data';

// GET /api/cafes/[id]/slots - Get available slots for a cafe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cafeId = parseInt(id);

  return NextResponse.json(getSlotsForCafe(cafeId));
}
