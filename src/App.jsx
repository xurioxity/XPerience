import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CafeProfilePage from './pages/CafeProfilePage'
import UserBookingsPage from './pages/UserBookingsPage'
import OwnerLoginPage from './pages/OwnerLoginPage'
import OwnerDashboardPage from './pages/OwnerDashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="cafe/:id" element={<CafeProfilePage />} />
        <Route path="my-bookings" element={<UserBookingsPage />} />
        <Route path="owner/login" element={<OwnerLoginPage />} />
        <Route path="owner/dashboard" element={<OwnerDashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App

