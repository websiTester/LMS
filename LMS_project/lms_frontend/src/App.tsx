import {  BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage';
import Notfound from './shared/components/Notfound';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
function App() {


  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="*" element={<Notfound/>} />
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
