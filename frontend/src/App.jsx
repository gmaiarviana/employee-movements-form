import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Import context and protected route
import { AuthContextProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Import components
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import SelectEmployee from './components/SelectEmployee'
import EntryForm from './components/EntryForm'
import ExitForm from './components/ExitForm'
import Summary from './components/Summary'
import SummaryEntry from './components/SummaryEntry'

function App() {
  return (
    <AuthContextProvider>
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
              path="/select-employee" 
              element={
                <ProtectedRoute>
                  <SelectEmployee />
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
                  <Summary />
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
        </div>
      </Router>
    </AuthContextProvider>
  )
}

export default App
