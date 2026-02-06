import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import PeriodosPage from './pages/admin/PeriodosPage'
import MaestriasPage from './pages/admin/MaestriasPage'
import ProfesoresPage from './pages/admin/ProfesoresPage'
import EvaluacionesPage from './pages/admin/EvaluacionesPage'
import StudentEvaluation from './pages/student/StudentEvaluation'

// Layout
import AdminLayout from './components/layout/AdminLayout'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/admin/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/evaluar" element={<StudentEvaluation />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="periodos" element={<PeriodosPage />} />
                  <Route path="maestrias" element={<MaestriasPage />} />
                  <Route path="profesores" element={<ProfesoresPage />} />
                  <Route path="evaluaciones" element={<EvaluacionesPage />} />
                  <Route path="reportes" element={<div className="card"><h2 className="text-2xl font-bold">Reportes</h2><p className="text-gray-600 mt-2">Módulo de reportes con IA en desarrollo...</p></div>} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
