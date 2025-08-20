import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import context and protected route
import { AuthContextProvider } from './context/AuthContext'
import { ToastProvider, useToast } from './context/ToastContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import ToastContainer from './components/common/Toast'

// Import page components
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import Register from './components/pages/Register'
import AdminDashboard from './components/pages/AdminDashboard'

// Import form components
import SelectForEntry from './components/forms/SelectForEntry'
import SelectForExit from './components/forms/SelectForExit'
import EntryForm from './components/forms/EntryForm'
import ExitForm from './components/forms/ExitForm'

// Import summary components
import SummaryExit from './components/summary/SummaryExit'
import SummaryEntry from './components/summary/SummaryEntry'

const AppContent = () => {
  const { toasts, dismissToast } = useToast()
  
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rotas NÃO Protegidas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/select-for-entry" 
            element={
              <ProtectedRoute>
                <SelectForEntry />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/select-employee" 
            element={
              <ProtectedRoute>
                <SelectForExit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/entry-form" 
            element={
              <ProtectedRoute>
                <EntryForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exit-form" 
            element={
              <ProtectedRoute>
                <ExitForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/summary" 
            element={
              <ProtectedRoute>
                <SummaryExit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/summary-entry" 
            element={
              <ProtectedRoute>
                <SummaryEntry />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <ToastContainer toasts={toasts} onDismissToast={dismissToast} />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthContextProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthContextProvider>
  )
}

export default App
