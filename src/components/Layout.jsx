import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div>
      <nav>
        <div className="container nav-content">
          <Link to="/" className="nav-brand">
            🎮 Bangalore Gaming Cafés
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
            <li><Link to="/owner/login">Owner Login</Link></li>
          </ul>
        </div>
      </nav>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

