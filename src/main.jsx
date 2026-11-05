import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './styles/global.css'
import { initSmooth } from './lib/smooth'
import App from './App'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
initSmooth()

createRoot(document.getElementById('root')).render(<App />)
