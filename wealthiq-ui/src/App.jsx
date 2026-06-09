import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import Goals from './pages/Goals'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/portfolio"  element={<Portfolio />} />
        <Route path="/goals"      element={<Goals />} />
      </Routes>
    </>
  )
}
