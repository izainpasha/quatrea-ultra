import { Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import Experience from './gl/Experience'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import { TransitionProvider } from './components/Transition'
import { BagDrawer, BagProvider } from './components/Bag'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Fragrance from './pages/Fragrance'
import Atelier from './pages/Atelier'
import Finder from './pages/Finder'
import { scene } from './lib/scene'
import { bySlug } from './data/fragrances'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')


function FragranceRoute() {
  const { slug } = useParams()
  if (bySlug(slug) < 0) return <Navigate to="/collection" replace />
  return <Fragrance key={slug} slug={slug} />
}

function usePointer() {
  useEffect(() => {
    const move = (e) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
}

export default function App() {
  usePointer()
  return (
    <BrowserRouter basename={basename}>
      <BagProvider>
        <TransitionProvider>
          <Experience />
          <Nav />
          <main className="page">
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/fragrance/:slug" element={<FragranceRoute />} />
                <Route path="/atelier" element={<Atelier />} />
                <Route path="/finder" element={<Finder />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <BagDrawer />
          <Cursor />
          <Loader />
        </TransitionProvider>
      </BagProvider>
    </BrowserRouter>
  )
}
