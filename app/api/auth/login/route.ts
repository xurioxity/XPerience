import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';
import type { Owner } from '@/lib/types';

// POST /api/auth/login - Owner login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Find owner by username
    const owner = db.prepare('SELECT * FROM owners WHERE username = ?').get(username) as Owner | undefined;

    if (!owner) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, owner.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSession({
      ownerId: owner.id,
      cafeId: owner.cafe_id,
      username: owner.username,
    });

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      owner: {
        id: owner.id,
        cafe_id: owner.cafe_id,
        username: owner.username,
        email: owner.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

