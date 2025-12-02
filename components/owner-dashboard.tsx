'use client';

import { useState, useEffect } from 'react';
import { CafeEditor } from './cafe-editor';
import type { BookingWithDetails } from '@/lib/types';

interface Session {
  ownerId: number;
  cafeId: number;
  username: string;
}

interface OwnerDashboardProps {
  session: Session;
  onLogout: () => void;
}

interface SlotWithBookings {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_pcs: number;
  is_available: number;
  booked_pcs: number;
  booking_count: number;
}

export function OwnerDashboard({ session, onLogout }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots' | 'cafe'>('bookings');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [slots, setSlots] = useState<SlotWithBookings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [bookingsRes, slotsRes] = await Promise.all([
        fetch('/api/owner/bookings'),
        fetch('/api/owner/slots'),
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setSlots(slotsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSlotAvailability(slotId: number, isAvailable: boolean) {
    try {
      const response = await fetch('/api/owner/slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: slotId,
          is_available: isAvailable,
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Group bookings by date
  const upcomingBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.date + 'T' + b.start_time);
    return bookingDate >= new Date() && b.status === 'confirmed';
  });

  // Group slots by date
  const upcomingSlots = slots.filter((s) => {
    const slotDate = new Date(s.date);
    return slotDate >= new Date();
  });

  const slotsByDate = upcomingSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, SlotWithBookings[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Owner Dashboard
            </span>
          </h1>
          <p className="text-lg text-gray-300">
            Welcome back, <span className="text-purple-400 font-semibold">{session.username}</span>
          </p>
        </div>
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-2 font-medium border-b-2 transition-all ${
              activeTab === 'bookings'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Bookings ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`pb-4 px-2 font-medium border-b-2 transition-all ${
              activeTab === 'slots'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Time Slots
          </button>
          <button
            onClick={() => setActiveTab('cafe')}
            className={`pb-4 px-2 font-medium border-b-2 transition-all ${
              activeTab === 'cafe'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Café Profile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Upcoming Bookings
                </h2>
                <button
                  onClick={fetchData}
                  className="btn btn-secondary text-sm"
                >
                  🔄 Refresh
                </button>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-gray-400">No upcoming bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="card p-6 hover:border-purple-500/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <h3 className="text-lg font-bold text-white">
                              {booking.user_name}
                            </h3>
                            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 text-green-300 text-xs font-semibold rounded-full">
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Date</div>
                              <div className="font-medium text-gray-200">
                                {formatDate(booking.date)}
                              </div>
                            </div>

                            <div>
                              <div className="text-gray-500">Time</div>
                              <div className="font-medium text-gray-200">
                                {booking.start_time} - {booking.end_time}
                              </div>
                            </div>

                            <div>
                              <div className="text-gray-500">Gaming Handle</div>
                              <div className="font-medium text-purple-300">
                                {booking.gaming_handle}
                              </div>
                            </div>

                            <div>
                              <div className="text-gray-500">PCs</div>
                              <div className="font-medium text-gray-200">
                                {booking.num_pcs}
                              </div>
                            </div>

                            <div className="col-span-2">
                              <div className="text-gray-500">Email</div>
                              <div className="font-medium text-gray-300">
                                {booking.user_email}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Slots Tab */}
          {activeTab === 'slots' && (
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Manage Time Slots
                </h2>
                <p className="text-gray-400">
                  Toggle slot availability to control bookings
                </p>
              </div>

              {Object.keys(slotsByDate).length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-gray-400">No upcoming slots</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                    <div key={date}>
                      <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        {formatDate(date)}
                      </h3>
                      <div className="card overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-900/50 border-b border-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                Capacity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                Bookings
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {dateSlots.map((slot) => (
                              <tr key={slot.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                                  {slot.start_time} - {slot.end_time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  <span className="text-purple-400 font-semibold">{slot.booked_pcs}</span> / {slot.available_pcs} PCs
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {slot.booking_count} booking(s)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                      slot.is_available
                                        ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 text-green-300'
                                        : 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 text-red-300'
                                    }`}
                                  >
                                    {slot.is_available ? 'Available' : 'Unavailable'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() =>
                                      toggleSlotAvailability(slot.id, !slot.is_available)
                                    }
                                    className={`btn text-xs ${
                                      slot.is_available
                                        ? 'btn-danger'
                                        : 'btn-primary'
                                    }`}
                                  >
                                    {slot.is_available ? 'Disable' : 'Enable'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cafe Profile Tab */}
          {activeTab === 'cafe' && (
            <CafeEditor cafeId={session.cafeId} />
          )}
        </>
      )}
    </div>
  );
}

