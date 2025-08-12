import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterStep1 from './components/RegisterStep1'
import RegisterStep2 from './components/RegisterStep2'
import RegisterStep3 from './components/RegisterStep3'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterStep1 />} />
        <Route path="/registro/paso1" element={<RegisterStep1 />} />
        <Route path="/registro/paso2" element={<RegisterStep2 />} />
        <Route path="/registro/paso3" element={<RegisterStep3 />} />
        {/* Aquí agregaremos más rutas después */}
        <Route path="/dashboard" element={<div className="min-h-screen flex items-center justify-center bg-gray-100"><h1 className="text-2xl">Dashboard - En desarrollo</h1></div>} />
      </Routes>
    </Router>
  )
}

export default App
