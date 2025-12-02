import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OwnerLoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:5000/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }
      
      const data = await response.json()
      
      // Store owner info in localStorage for quick access
      localStorage.setItem('ownerInfo', JSON.stringify(data))
      
      // Redirect to dashboard
      navigate('/owner/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '3rem auto',
      padding: '0 20px'
    }}>
      <h1 className="page-title text-center">Café Owner Login</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="owner1"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Demo Credentials:</p>
          <p style={{ marginBottom: '0.25rem' }}>• Username: owner1 | Password: password123</p>
          <p style={{ marginBottom: '0.25rem' }}>• Username: owner2 | Password: password123</p>
          <p>• Username: owner3 | Password: password123</p>
        </div>
      </div>
    </div>
  )
}

export default OwnerLoginPage

