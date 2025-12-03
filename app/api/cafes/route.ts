import { NextResponse } from 'next/server';
import { mockCafes } from '@/lib/mock-data';

// GET /api/cafes - Get all cafes
export async function GET() {
  return NextResponse.json(mockCafes);
}
