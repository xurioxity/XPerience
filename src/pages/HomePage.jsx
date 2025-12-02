import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  const [cafes, setCafes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCafes()
  }, [])

  async function fetchCafes() {
    try {
      const response = await fetch('http://localhost:5000/api/cafes')
      if (!response.ok) throw new Error('Failed to fetch cafes')
      const data = await response.json()
      setCafes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading cafés...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div>
      <h1 className="page-title">Gaming Cafés in Bangalore</h1>
      
      <div className="grid grid-3">
        {cafes.map(cafe => (
          <Link 
            key={cafe.id} 
            to={`/cafe/${cafe.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="card">
              {cafe.primary_photo && (
                <img 
                  src={cafe.primary_photo} 
                  alt={cafe.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              
              <h2 style={{ marginBottom: '0.5rem', color: '#1a1a1a' }}>
                {cafe.name}
              </h2>
              
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                📍 {cafe.address}
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <span>💻 {cafe.num_pcs} PCs</span>
                <span>🎮 {cafe.gpu_specs}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {cafes.length === 0 && (
        <p className="text-center text-muted">No cafés available at the moment.</p>
      )}
    </div>
  )
}

export default HomePage

