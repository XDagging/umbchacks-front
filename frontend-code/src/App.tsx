// src/App.tsx
import { useState } from 'react';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomeView from './views/HomeView';
import CreditsView from './views/CreditsView';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/credits" element={<CreditsView />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
