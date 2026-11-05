import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './styles/global.css'
import { initSmooth } from './lib/smooth'
import App from './App'
import { quality } from './lib/quality'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
initSmooth()
if (quality.ultra) document.documentElement.classList.add('ultra')

createRoot(document.getElementById('root')).render(<App />)
