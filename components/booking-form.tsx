'use client';

import { useState, useEffect } from 'react';

interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  remaining_pcs: number;
  is_bookable: boolean;
}

interface BookingFormProps {
  cafeId: number;
  cafeName: string;
}

export function BookingForm({ cafeId, cafeName }: BookingFormProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    gaming_handle: '',
    num_pcs: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch available slots
  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await fetch(`/api/cafes/${cafeId}/slots`);
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [cafeId]);

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Format date for display
  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: selectedSlot,
          cafe_id: cafeId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setSuccess(true);
      setFormData({
        user_name: '',
        user_email: '',
        gaming_handle: '',
        num_pcs: 1,
      });
      setSelectedSlot(null);

      // Refresh slots
      const slotsResponse = await fetch(`/api/cafes/${cafeId}/slots`);
      const slotsData = await slotsResponse.json();
      setSlots(slotsData);

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6 sticky top-8">
      <h2 className="text-2xl font-bold mb-6">
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Book a Session
        </span>
      </h2>

      {success && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-lg">
          <p className="text-green-300 font-medium">
            ✓ Booking confirmed! Check your email for details.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Time Slot Selection */}
        <div>
          <label className="label">Select Time Slot *</label>
          
          {loading ? (
            <div className="text-center py-4 text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2">Loading slots...</p>
            </div>
          ) : Object.keys(slotsByDate).length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No slots available
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                <div key={date}>
                  <div className="text-sm font-semibold text-purple-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    {formatDate(date)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.is_bookable}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          selectedSlot === slot.id
                            ? 'border-purple-500 bg-gradient-to-br from-purple-900/50 to-pink-900/50 shadow-lg shadow-purple-500/30'
                            : slot.is_bookable
                            ? 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800'
                            : 'border-gray-800 bg-gray-900/50 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className={`font-medium ${selectedSlot === slot.id ? 'text-white' : 'text-gray-300'}`}>
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className={`text-xs mt-1 ${selectedSlot === slot.id ? 'text-purple-200' : 'text-gray-500'}`}>
                          {slot.is_bookable
                            ? `${slot.remaining_pcs} PCs left`
                            : 'Fully booked'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Details */}
        <div>
          <label className="label" htmlFor="user_name">
            Your Name *
          </label>
          <input
            id="user_name"
            type="text"
            required
            className="input"
            value={formData.user_name}
            onChange={(e) =>
              setFormData({ ...formData, user_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="user_email">
            Email Address *
          </label>
          <input
            id="user_email"
            type="email"
            required
            className="input"
            value={formData.user_email}
            onChange={(e) =>
              setFormData({ ...formData, user_email: e.target.value })
            }
          />
          <p className="text-xs text-gray-400 mt-1">
            We'll send booking confirmation to this email
          </p>
        </div>

        <div>
          <label className="label" htmlFor="gaming_handle">
            Gaming Handle *
          </label>
          <input
            id="gaming_handle"
            type="text"
            required
            className="input"
            placeholder="e.g., ProGamer123"
            value={formData.gaming_handle}
            onChange={(e) =>
              setFormData({ ...formData, gaming_handle: e.target.value })
            }
          />
        </div>

        <div>
          <label className="label" htmlFor="num_pcs">
            Number of PCs
          </label>
          <input
            id="num_pcs"
            type="number"
            min="1"
            max="5"
            className="input"
            value={formData.num_pcs}
            onChange={(e) =>
              setFormData({ ...formData, num_pcs: parseInt(e.target.value) })
            }
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedSlot}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}

