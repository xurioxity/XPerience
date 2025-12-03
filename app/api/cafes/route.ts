import { NextResponse } from 'next/server';
import { mockCafes, isVercel } from '@/lib/mock-data';

// GET /api/cafes - Get all cafes
export async function GET() {
  // Use mock data on Vercel, real DB locally
  if (isVercel) {
    return NextResponse.json(mockCafes);
  }

  try {
    const db = (await import('@/lib/db')).default;
    const { initializeDatabase } = await import('@/lib/db');
    initializeDatabase();
    
    const cafes = db.prepare('SELECT * FROM cafes ORDER BY name').all();
    return NextResponse.json(cafes);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    // Fallback to mock data if DB fails
    return NextResponse.json(mockCafes);
  }
}
