import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function CafeProfilePage() {
  const { id } = useParams()
  const [cafe, setCafe] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    user_name: '',
    user_email: '',
    gaming_handle: ''
  })
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    fetchCafeDetails()
    fetchSlots()
  }, [id])

  async function fetchCafeDetails() {
    try {
      const response = await fetch(`http://localhost:5000/api/cafes/${id}`)
      if (!response.ok) throw new Error('Failed to fetch cafe details')
      const data = await response.json()
      setCafe(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSlots() {
    try {
      const response = await fetch(`http://localhost:5000/api/cafes/${id}/slots`)
      if (!response.ok) throw new Error('Failed to fetch slots')
      const data = await response.json()
      setSlots(data)
    } catch (err) {
      console.error('Error fetching slots:', err)
    }
  }

  async function handleBooking(e) {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          ...bookingData
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }
      
      // Success - refresh slots and show success message
      setBookingSuccess(true)
      setShowBookingForm(false)
      setBookingData({ user_name: '', user_email: '', gaming_handle: '' })
      setSelectedSlot(null)
      fetchSlots()
      
      // Hide success message after 5 seconds
      setTimeout(() => setBookingSuccess(false), 5000)
    } catch (err) {
      alert('Booking failed: ' + err.message)
    }
  }

  function openBookingForm(slot) {
    setSelectedSlot(slot)
    setShowBookingForm(true)
    setBookingSuccess(false)
  }

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  if (loading) {
    return <div className="loading">Loading café details...</div>
  }

  if (error || !cafe) {
    return <div className="error">Error: {error || 'Cafe not found'}</div>
  }

  return (
    <div>
      <h1 className="page-title">{cafe.name}</h1>
      
      {bookingSuccess && (
        <div className="success">
          ✅ Booking confirmed! Check your email for details.
        </div>
      )}
      
      {/* Cafe Photos */}
      {cafe.photos && cafe.photos.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {cafe.photos.map(photo => (
            <img 
              key={photo.id}
              src={photo.photo_url}
              alt={cafe.name}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Cafe Info */}
      <div className="grid grid-2 mb-2">
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>📍 Location & Contact</h2>
          <p style={{ marginBottom: '0.5rem' }}><strong>Address:</strong> {cafe.address}</p>
          {cafe.phone && <p><strong>Phone:</strong> {cafe.phone}</p>}
          {cafe.description && (
            <p style={{ marginTop: '1rem', color: '#666' }}>{cafe.description}</p>
          )}
        </div>
        
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>💻 Hardware Specs</h2>
          <p style={{ marginBottom: '0.5rem' }}><strong>Number of PCs:</strong> {cafe.num_pcs}</p>
          <p style={{ marginBottom: '0.5rem' }}><strong>GPU:</strong> {cafe.gpu_specs}</p>
          <p><strong>CPU:</strong> {cafe.cpu_specs}</p>
        </div>
      </div>
      
      {/* Available Games */}
      {cafe.games && cafe.games.length > 0 && (
        <div className="card mb-2">
          <h2 style={{ marginBottom: '1rem' }}>🎮 Available Games</h2>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem' 
          }}>
            {cafe.games.map((game, index) => (
              <span 
                key={index}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}
              >
                {game}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Available Slots */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>📅 Available Slots</h2>
        
        {Object.keys(slotsByDate).length === 0 ? (
          <p className="text-muted">No available slots at the moment.</p>
        ) : (
          <div>
            {Object.keys(slotsByDate).sort().map(date => (
              <div key={date} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.75rem', color: '#666' }}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {slotsByDate[date].map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => openBookingForm(slot)}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem', fontSize: '0.9rem' }}
                    >
                      {slot.start_time} - {slot.end_time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Form Modal */}
      {showBookingForm && selectedSlot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            maxWidth: '500px', 
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Book Your Slot</h2>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              <p><strong>Date:</strong> {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
            </div>
            
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  value={bookingData.user_name}
                  onChange={(e) => setBookingData({...bookingData, user_name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={bookingData.user_email}
                  onChange={(e) => setBookingData({...bookingData, user_email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Gaming Handle *</label>
                <input
                  type="text"
                  required
                  value={bookingData.gaming_handle}
                  onChange={(e) => setBookingData({...bookingData, gaming_handle: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Booking
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowBookingForm(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CafeProfilePage

