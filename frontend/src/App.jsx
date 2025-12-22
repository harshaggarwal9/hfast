import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import LoginPage from './components/LoginPage'
import SignUp from './components/SignUp'
const App = () => {
  return (
    <div className="bg-[#102E50] h-screen">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signUp" element={<SignUp/>} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
