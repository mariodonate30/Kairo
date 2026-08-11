import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AchievementsProvider } from './contexts/AchievementsContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import GuestRoute from './components/auth/GuestRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkin from './pages/Checkin'
import Surveys from './pages/Surveys'
import Goals from './pages/Goals'
import FocusTimer from './pages/FocusTimer'
import Meditation from './pages/Meditation'
import Progress from './pages/Progress'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <AchievementsProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Checkin />} />
              <Route path="/encuestas" element={<Surveys />} />
              <Route path="/objetivos" element={<Goals />} />
              <Route path="/enfoque" element={<FocusTimer />} />
              <Route path="/meditacion" element={<Meditation />} />
              <Route path="/progreso" element={<Progress />} />
              <Route path="/recursos" element={<Resources />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="/privacidad" element={<Privacy />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AchievementsProvider>
    </AuthProvider>
  )
}
