'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { BookingWithDetails } from '@/lib/types';

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      fetchBookings(savedEmail);
    }
  }, []);

  async function fetchBookings(userEmail: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      setBookings(data);
      setSearched(true);
      // Save email to localStorage
      localStorage.setItem('userEmail', userEmail);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      fetchBookings(email);
    }
  }

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date + 'T' + booking.start_time);
    return bookingDate >= now && booking.status === 'confirmed';
  });

  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date + 'T' + booking.start_time);
    return bookingDate < now || booking.status !== 'confirmed';
  });

  function formatDateTime(date: string, time: string) {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          My Bookings
        </h1>
        <p className="text-lg text-gray-300">
          View and manage your gaming café reservations
        </p>
      </div>

      {/* Email Search Form */}
      <div className="card p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="email" className="label">
              Enter your email to view bookings
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Bookings List */}
      {searched && (
        <>
          {bookings.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-300 mb-4">
                No bookings found for this email address.
              </p>
              <Link href="/" className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text hover:from-purple-300 hover:to-pink-300 font-medium">
                Browse cafés to make a booking →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Upcoming Bookings
                    </span>
                    <span className="ml-3 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  </h2>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="card p-6 hover:border-purple-500/50 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-xl font-bold text-white">
                                {booking.cafe_name}
                              </h3>
                              <span className="ml-3 px-3 py-1 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 text-green-300 text-xs font-semibold rounded-full">
                                {booking.status}
                              </span>
                            </div>

                            <div className="space-y-2 text-gray-300">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {formatDateTime(booking.date, booking.start_time)} - {booking.end_time}
                              </div>

                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-pink-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {booking.user_name} ({booking.gaming_handle})
                              </div>

                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
                                </svg>
                                {booking.num_pcs} PC{booking.num_pcs > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/cafe/${booking.cafe_id}`}
                            className="btn btn-secondary ml-4"
                          >
                            View Café
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="text-gray-400">Past Bookings</span>
                  </h2>
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="card p-6 opacity-60 hover:opacity-80 transition-opacity">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-xl font-bold text-gray-300">
                                {booking.cafe_name}
                              </h3>
                              <span className="ml-3 px-3 py-1 bg-gray-800 border border-gray-700 text-gray-400 text-xs font-semibold rounded-full">
                                {booking.status}
                              </span>
                            </div>

                            <div className="space-y-2 text-gray-400">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {formatDateTime(booking.date, booking.start_time)} - {booking.end_time}
                              </div>

                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
                                </svg>
                                {booking.num_pcs} PC{booking.num_pcs > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

