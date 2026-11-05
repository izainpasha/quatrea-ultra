import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { lenis } from '../lib/smooth'
import { TLink } from './Transition'
import { Monogram, Wordmark } from './Logo'
import { useBag } from './Bag'
import { fragrances } from '../data/fragrances'
import { EDITION } from '../lib/quality'

const LINKS = [
  { to: '/collection', label: 'Collection' },
  { to: '/atelier', label: 'Atelier' },
  { to: '/finder', label: 'Scent Finder' },
]

export default function Nav() {
  const { count, setOpen } = useBag()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const nav = useRef(null)
  const overlay = useRef(null)
  const bump = useRef(null)
  const prevCount = useRef(count)

  // hide on scroll down, show on scroll up
  useEffect(() => {
    if (!lenis) return
    let hidden = false
    const onScroll = ({ scroll, direction }) => {
      const hide = scroll > 160 && direction > 0
      if (hide !== hidden) {
        hidden = hide
        gsap.to(nav.current, { yPercent: hide ? -120 : 0, duration: 0.7, ease: 'expo.out' })
      }
    }
    lenis.on('scroll', onScroll)
    return () => lenis.off('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (count > prevCount.current && bump.current)
      gsap.fromTo(bump.current, { scale: 1.8 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1,0.4)' })
    prevCount.current = count
  }, [count])

  useEffect(() => {
    const el = overlay.current
    if (menu) {
      lenis?.stop()
      gsap.set(el, { visibility: 'visible' })
      gsap.fromTo(el, { clipPath: 'circle(0% at 95% 4%)' }, { clipPath: 'circle(150% at 95% 4%)', duration: 1, ease: 'expo.inOut' })
      gsap.fromTo(el.querySelectorAll('.mm-link'), { yPercent: 110 }, { yPercent: 0, stagger: 0.07, delay: 0.35, duration: 1, ease: 'expo.out' })
    } else if (el.style.visibility === 'visible') {
      lenis?.start()
      gsap.to(el, { clipPath: 'circle(0% at 95% 4%)', duration: 0.7, ease: 'expo.inOut', onComplete: () => gsap.set(el, { visibility: 'hidden' }) })
    }
  }, [menu])

  useEffect(() => setMenu(false), [pathname])

  return (
    <>
      <header className="nav" ref={nav}>
        <TLink to="/" className="nav-logo" data-cursor="Home" aria-label="Quatréa home">
          <Monogram size={30} stroke={4} />
          <Wordmark />
          {EDITION === 'ultra' && <span className="edition-badge">Ultra</span>}
        </TLink>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <TLink key={l.to} to={l.to} className={`nav-link ${pathname.startsWith(l.to) ? 'is-active' : ''}`}>
              <span data-text={l.label}>{l.label}</span>
            </TLink>
          ))}
        </nav>
        <div className="nav-right">
          <button className="nav-bag" onClick={() => setOpen(true)} data-cursor="Bag">
            Bag <span className="nav-count" ref={bump}>{count}</span>
          </button>
          <button className={`nav-burger ${menu ? 'is-open' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Menu">
            <i />
            <i />
          </button>
        </div>
      </header>

      <div className="mobile-menu" ref={overlay} style={{ visibility: 'hidden' }}>
        <div className="mm-inner">
          {[{ to: '/', label: 'Home' }, ...LINKS].map((l, i) => (
            <div className="mm-row" key={l.to}>
              <TLink to={l.to} className="mm-link" onClick={() => setMenu(false)}>
                <small>0{i + 1}</small> {l.label}
              </TLink>
            </div>
          ))}
          <div className="mm-seasons">
            {fragrances.map((f) => (
              <TLink key={f.slug} to={`/fragrance/${f.slug}`} onClick={() => setMenu(false)}>
                <span style={{ background: f.theme.liquid }} /> {f.name}
              </TLink>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
