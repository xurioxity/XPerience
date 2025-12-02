import { NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import type { Cafe } from '@/lib/types';

// Initialize database on first API call
initializeDatabase();

// GET /api/cafes - Get all cafes
export async function GET() {
  try {
    const cafes = db.prepare('SELECT * FROM cafes ORDER BY name').all() as Cafe[];
    return NextResponse.json(cafes);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafes' },
      { status: 500 }
    );
  }
}

