import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route, Link, BrowserRouter} from "react-router-dom";
import HomePage from "./page";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>


    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />


      </Routes>
    
    </BrowserRouter>
    </>
  )
}

export default App
