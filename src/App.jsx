import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import components (we'll create these later)
import Home from './components/Home'
import AdminDashboard from './components/AdminDashboard'
import SelectEmployee from './components/SelectEmployee'
import EntryForm from './components/EntryForm'
import ExitForm from './components/ExitForm'
import Summary from './components/Summary'
import SummaryEntry from './components/SummaryEntry'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/select-employee" element={<SelectEmployee />} />
          <Route path="/entry-form" element={<EntryForm />} />
          <Route path="/exit-form" element={<ExitForm />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/summary-entry" element={<SummaryEntry />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
