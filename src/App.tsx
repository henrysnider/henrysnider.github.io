import { BrowserRouter, Routes, Route } from 'react-router'
import './App.css'
import HeaderMenu from './HeaderMenu.tsx'
import Flashcards from './pages/Flashcards.tsx'
import Home from './pages/Home.tsx'

function App() {
    return (
      <BrowserRouter>
      <HeaderMenu />

      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/flashcards" element={<Flashcards />} />
      </Routes>
      </BrowserRouter>

    );
}

export default App
