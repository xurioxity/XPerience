import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getOwnerByUsername } from '@/lib/mock-data';
import { createSession, setSessionCookie } from '@/lib/auth';

// POST /api/auth/login - Owner login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const owner = getOwnerByUsername(username);

    if (!owner) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, owner.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createSession({
      ownerId: owner.id,
      cafeId: owner.cafe_id,
      username: owner.username,
    });

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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
