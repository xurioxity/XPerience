import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function UserBookingsPage() {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  // Load email from localStorage if exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookings?email=${encodeURIComponent(email)}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data)
      setSearched(true)
      
      // Save email to localStorage for convenience
      localStorage.setItem('userEmail', email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Separate upcoming and past bookings
  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter(b => b.date >= today)
  const pastBookings = bookings.filter(b => b.date < today)

  return (
    <div>
      <h1 className="page-title">My Bookings</h1>
      
      <div className="card mb-2">
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Enter your email to view bookings</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            View My Bookings
          </button>
        </form>
      </div>
      
      {error && <div className="error">Error: {error}</div>}
      
      {loading && <div className="loading">Loading bookings...</div>}
      
      {searched && !loading && bookings.length === 0 && (
        <div className="card text-center">
          <p className="text-muted">No bookings found for this email.</p>
          <Link to="/" className="btn btn-primary mt-1">
            Book Your First Slot
          </Link>
        </div>
      )}
      
      {searched && !loading && bookings.length > 0 && (
        <div>
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="mb-2">
              <h2 style={{ marginBottom: '1rem', color: '#28a745' }}>
                ⏰ Upcoming Bookings ({upcomingBookings.length})
              </h2>
              <div className="grid grid-2">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="card">
                    <h3 style={{ marginBottom: '0.75rem', color: '#1a1a1a' }}>
                      {booking.cafe_name}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                        📅 {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                        ⏰ {booking.start_time} - {booking.end_time}
                      </p>
                      <p style={{ color: '#666' }}>
                        📍 {booking.cafe_address}
                      </p>
                    </div>
                    
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <strong>Name:</strong> {booking.user_name}
                      </p>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <strong>Handle:</strong> {booking.gaming_handle}
                      </p>
                      <p style={{ fontSize: '0.9rem' }}>
                        <strong>Status:</strong> <span style={{ 
                          color: booking.status === 'confirmed' ? '#28a745' : '#666',
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>{booking.status}</span>
                      </p>
                    </div>
                    
                    <Link 
                      to={`/cafe/${booking.cafe_id}`}
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      View Café
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#6c757d' }}>
                📋 Past Bookings ({pastBookings.length})
              </h2>
              <div className="grid grid-2">
                {pastBookings.map(booking => (
                  <div key={booking.id} className="card" style={{ opacity: 0.8 }}>
                    <h3 style={{ marginBottom: '0.75rem', color: '#1a1a1a' }}>
                      {booking.cafe_name}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                        📅 {new Date(booking.date + 'T00:00:00').toLocaleDateString()}
                      </p>
                      <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                        ⏰ {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      <strong>Handle:</strong> {booking.gaming_handle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserBookingsPage

