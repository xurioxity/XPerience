'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OwnerLogin } from '@/components/owner-login';
import { OwnerDashboard } from '@/components/owner-dashboard';

interface Session {
  ownerId: number;
  cafeId: number;
  username: string;
}

export default function OwnerPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(username: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = await response.json();
    setSession({
      ownerId: data.owner.id,
      cafeId: data.owner.cafe_id,
      username: data.owner.username,
    });
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    router.push('/');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <OwnerLogin onLogin={handleLogin} />;
  }

  return <OwnerDashboard session={session} onLogout={handleLogout} />;
}

