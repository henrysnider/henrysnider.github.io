import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes, Route } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import type { ComponentType } from 'react'
import HeaderMenu from './HeaderMenu.tsx'
import E404 from './pages/404.tsx'
import './index.css'
import './App.css'

const pages = import.meta.glob<{ default: ComponentType }>(
  './pages/*.tsx',
  { eager: true },
)

function routePath(filePath: string) {
  const name = filePath
    .slice(filePath.lastIndexOf('/') + 1)
    .replace(/\.tsx$/, '')
    .toLowerCase();

  return name === 'home' ? '/' : `/${name}`
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <HeaderMenu />

        <Routes>
          {Object.entries(pages).map(([filePath, module]) => {
            const path = routePath(filePath)
            return <Route key={path} path={path} element={<module.default />} />
          })}

          <Route path="*" element={< E404 />} />
        </Routes>
      </BrowserRouter>
  </StrictMode>
)