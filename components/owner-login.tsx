'use client';

import { useState } from 'react';

interface OwnerLoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function OwnerLogin({ onLogin }: OwnerLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Owner Login
          </span>
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-lg">
          <p className="text-sm text-purple-300 font-medium mb-2">
            Demo Credentials:
          </p>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Username: <code className="bg-gray-800 px-2 py-0.5 rounded text-purple-300">gamezone_owner</code></div>
            <div>Password: <code className="bg-gray-800 px-2 py-0.5 rounded text-purple-300">password123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}

