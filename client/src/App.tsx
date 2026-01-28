import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TabletSurvey from './pages/TabletSurvey'
import MobileSurvey from './pages/MobileSurvey'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tablet" replace />} />
        <Route path="/tablet" element={<TabletSurvey />} />
        <Route path="/survey" element={<MobileSurvey />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
