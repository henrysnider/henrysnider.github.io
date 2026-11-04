import { Routes, Route } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import type { ComponentType } from 'react'
import E404 from './pages/404.tsx'
import './App.css'
import HeaderMenu from './HeaderMenu.tsx'

const pages = import.meta.glob<{ default: ComponentType }>(
  './pages/*.tsx',
  { eager: true },
)

function routePath(filePath: string) {
  const name = filePath
    .slice(filePath.lastIndexOf('/') + 1)
    .replace(/\.tsx$/, '')

  return name.toLowerCase() === 'home' ? '/' : `/${name.toLowerCase()}`
}

function App() {
  return (
    <BrowserRouter>
      <HeaderMenu />
      <Routes>
        {Object.entries(pages).map(([filePath, module]) => {
          const Page = module.default
          const path = routePath(filePath)

          return <Route key={path} path={path} element={<Page />} />
        })}

        <Route path="*" element={< E404 />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
