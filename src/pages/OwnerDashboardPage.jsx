import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function OwnerDashboardPage() {
  const [ownerInfo, setOwnerInfo] = useState(null)
  const [cafe, setCafe] = useState(null)
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings', 'slots', 'profile'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Edit cafe form state
  const [editingCafe, setEditingCafe] = useState(false)
  const [cafeFormData, setCafeFormData] = useState({})

  // Add slot form state
  const [addingSlot, setAddingSlot] = useState(false)
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    verifyAuthentication()
  }, [])

  async function verifyAuthentication() {
    try {
      const response = await fetch('http://localhost:5000/api/owner/me', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Not authenticated')
      }
      
      const data = await response.json()
      setOwnerInfo(data)
      
      // Fetch dashboard data
      await Promise.all([
        fetchCafeDetails(data.cafe_id),
        fetchBookings(),
        fetchSlots()
      ])
    } catch (err) {
      navigate('/owner/login')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCafeDetails(cafeId) {
    try {
      const response = await fetch(`http://localhost:5000/api/cafes/${cafeId}`)
      const data = await response.json()
      setCafe(data)
      setCafeFormData(data)
    } catch (err) {
      console.error('Error fetching cafe:', err)
    }
  }

  async function fetchBookings() {
    try {
      const response = await fetch('http://localhost:5000/api/owner/bookings', {
        credentials: 'include'
      })
      const data = await response.json()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }

  async function fetchSlots() {
    try {
      const response = await fetch('http://localhost:5000/api/owner/slots', {
        credentials: 'include'
      })
      const data = await response.json()
      setSlots(data)
    } catch (err) {
      console.error('Error fetching slots:', err)
    }
  }

  async function handleLogout() {
    try {
      await fetch('http://localhost:5000/api/owner/logout', {
        method: 'POST',
        credentials: 'include'
      })
      localStorage.removeItem('ownerInfo')
      navigate('/owner/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  async function handleUpdateCafe(e) {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:5000/api/owner/cafe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cafeFormData)
      })
      
      if (!response.ok) throw new Error('Failed to update cafe')
      
      const updatedCafe = await response.json()
      setCafe(updatedCafe)
      setCafeFormData(updatedCafe)
      setEditingCafe(false)
      alert('Café details updated successfully!')
    } catch (err) {
      alert('Failed to update café: ' + err.message)
    }
  }

  async function handleToggleSlot(slotId, currentStatus) {
    try {
      const response = await fetch(`http://localhost:5000/api/owner/slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_available: currentStatus ? 0 : 1 })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update slot')
      }
      
      // Refresh slots
      fetchSlots()
    } catch (err) {
      alert('Failed to update slot: ' + err.message)
    }
  }

  async function handleAddSlot(e) {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:5000/api/owner/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSlot)
      })
      
      if (!response.ok) throw new Error('Failed to add slot')
      
      setNewSlot({ date: '', start_time: '', end_time: '' })
      setAddingSlot(false)
      fetchSlots()
      alert('Slot added successfully!')
    } catch (err) {
      alert('Failed to add slot: ' + err.message)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  // Group bookings by date
  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter(b => b.date >= today)
  const pastBookings = bookings.filter(b => b.date < today)

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
            Owner Dashboard
          </h1>
          {ownerInfo && (
            <p style={{ color: '#666' }}>
              Managing: <strong>{ownerInfo.cafe_name}</strong>
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'bookings' ? 'bold' : 'normal',
            borderBottom: activeTab === 'bookings' ? '3px solid #00d9ff' : 'none',
            color: activeTab === 'bookings' ? '#00d9ff' : '#666'
          }}
        >
          📅 Bookings
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'slots' ? 'bold' : 'normal',
            borderBottom: activeTab === 'slots' ? '3px solid #00d9ff' : 'none',
            color: activeTab === 'slots' ? '#00d9ff' : '#666'
          }}
        >
          ⏰ Time Slots
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
            borderBottom: activeTab === 'profile' ? '3px solid #00d9ff' : 'none',
            color: activeTab === 'profile' ? '#00d9ff' : '#666'
          }}
        >
          🏢 Café Profile
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>
            Upcoming Bookings ({upcomingBookings.length})
          </h2>
          
          {upcomingBookings.length === 0 ? (
            <div className="card text-center">
              <p className="text-muted">No upcoming bookings</p>
            </div>
          ) : (
            <div className="grid grid-2 mb-2">
              {upcomingBookings.map(booking => (
                <div key={booking.id} className="card">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3>Booking #{booking.id}</h3>
                    <span style={{ 
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Date:</strong> {new Date(booking.date + 'T00:00:00').toLocaleDateString()}
                    </p>
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Time:</strong> {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Customer:</strong> {booking.user_name}
                    </p>
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Email:</strong> {booking.user_email}
                    </p>
                    <p>
                      <strong>Gaming Handle:</strong> {booking.gaming_handle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {pastBookings.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#666' }}>
                Past Bookings ({pastBookings.length})
              </h2>
              <div className="grid grid-3">
                {pastBookings.slice(0, 6).map(booking => (
                  <div key={booking.id} className="card" style={{ opacity: 0.7 }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <strong>{booking.user_name}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString()} • {booking.start_time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2>Manage Time Slots</h2>
            <button 
              onClick={() => setAddingSlot(!addingSlot)}
              className="btn btn-primary"
            >
              {addingSlot ? 'Cancel' : '+ Add New Slot'}
            </button>
          </div>

          {addingSlot && (
            <div className="card mb-2">
              <h3 style={{ marginBottom: '1rem' }}>Add New Slot</h3>
              <form onSubmit={handleAddSlot}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      required
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      required
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      required
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">
                  Add Slot
                </button>
              </form>
            </div>
          )}

          {Object.keys(slotsByDate).length === 0 ? (
            <div className="card text-center">
              <p className="text-muted">No slots available</p>
            </div>
          ) : (
            Object.keys(slotsByDate).sort().map(date => (
              <div key={date} className="card mb-2">
                <h3 style={{ marginBottom: '1rem' }}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {slotsByDate[date].map(slot => (
                    <div
                      key={slot.id}
                      style={{
                        padding: '1rem',
                        border: '2px solid',
                        borderColor: slot.booking_count > 0 ? '#dc3545' : 
                                    slot.is_available ? '#28a745' : '#6c757d',
                        borderRadius: '6px',
                        backgroundColor: slot.booking_count > 0 ? '#fff5f5' : 
                                       slot.is_available ? '#f0fff4' : '#f8f9fa'
                      }}
                    >
                      <p style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '0.5rem',
                        fontSize: '1.1rem'
                      }}>
                        {slot.start_time} - {slot.end_time}
                      </p>
                      
                      {slot.booking_count > 0 ? (
                        <div>
                          <p style={{ 
                            color: '#dc3545', 
                            fontWeight: 'bold',
                            marginBottom: '0.25rem'
                          }}>
                            🔴 Booked
                          </p>
                          {slot.booked_by && (
                            <p style={{ fontSize: '0.85rem', color: '#666' }}>
                              by {slot.booked_by}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p style={{ 
                            color: slot.is_available ? '#28a745' : '#6c757d',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                          }}>
                            {slot.is_available ? '✅ Available' : '🚫 Unavailable'}
                          </p>
                          <button
                            onClick={() => handleToggleSlot(slot.id, slot.is_available)}
                            className={`btn ${slot.is_available ? 'btn-danger' : 'btn-success'}`}
                            style={{ 
                              width: '100%',
                              padding: '0.5rem',
                              fontSize: '0.85rem'
                            }}
                          >
                            {slot.is_available ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && cafe && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2>Café Profile</h2>
            {!editingCafe ? (
              <button 
                onClick={() => setEditingCafe(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => {
                  setEditingCafe(false)
                  setCafeFormData(cafe)
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>

          {editingCafe ? (
            <div className="card">
              <form onSubmit={handleUpdateCafe}>
                <div className="form-group">
                  <label>Café Name</label>
                  <input
                    type="text"
                    value={cafeFormData.name || ''}
                    onChange={(e) => setCafeFormData({...cafeFormData, name: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={cafeFormData.address || ''}
                    onChange={(e) => setCafeFormData({...cafeFormData, address: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={cafeFormData.phone || ''}
                    onChange={(e) => setCafeFormData({...cafeFormData, phone: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={cafeFormData.description || ''}
                    onChange={(e) => setCafeFormData({...cafeFormData, description: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Number of PCs</label>
                    <input
                      type="number"
                      value={cafeFormData.num_pcs || ''}
                      onChange={(e) => setCafeFormData({...cafeFormData, num_pcs: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>GPU Specs</label>
                    <input
                      type="text"
                      value={cafeFormData.gpu_specs || ''}
                      onChange={(e) => setCafeFormData({...cafeFormData, gpu_specs: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CPU Specs</label>
                    <input
                      type="text"
                      value={cafeFormData.cpu_specs || ''}
                      onChange={(e) => setCafeFormData({...cafeFormData, cpu_specs: e.target.value})}
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            <div className="grid grid-2">
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Basic Information</h3>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Name:</strong> {cafe.name}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Address:</strong> {cafe.address}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Phone:</strong> {cafe.phone}
                </p>
                <p>
                  <strong>Description:</strong> {cafe.description}
                </p>
              </div>
              
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Hardware Specs</h3>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Number of PCs:</strong> {cafe.num_pcs}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>GPU:</strong> {cafe.gpu_specs}
                </p>
                <p>
                  <strong>CPU:</strong> {cafe.cpu_specs}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OwnerDashboardPage

