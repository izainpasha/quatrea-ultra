import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { conceal, reveal } from '../lib/reveal'
import { lenis, scrollTop } from '../lib/smooth'
import { Monogram } from './Logo'
import { fragrances } from '../data/fragrances'

const Ctx = createContext({ go: () => {} })
export const useTransition = () => useContext(Ctx)

export function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const overlay = useRef(null)
  const busy = useRef(false)
  const viaTransition = useRef(false)
  const path = useRef(location.pathname)
  path.current = location.pathname

  const go = useCallback(
    (to) => {
      if (busy.current) return
      if (to === path.current) {
        lenis?.scrollTo(0, { duration: 1.4 })
        return
      }
      busy.current = true
      const el = overlay.current
      const cols = el.querySelectorAll('.t-col')
      const mark = el.querySelector('.t-mark')
      lenis?.stop()
      const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } })
      tl.set(el, { visibility: 'visible' })
        .fromTo(cols, { yPercent: 101 }, { yPercent: 0, duration: 0.85, stagger: 0.07 })
        .fromTo(mark, { opacity: 0, scale: 0.85, rotate: -45 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
        .add(() => {
          conceal()
          viaTransition.current = true
          navigate(to)
          scrollTop()
        })
        .to({}, { duration: 0.3 })
        .add(() => {
          scrollTop()
          ScrollTrigger.refresh()
          reveal()
          lenis?.start()
        })
        .to(mark, { opacity: 0, scale: 1.1, duration: 0.35, ease: 'power2.in' })
        .to(cols, { yPercent: -101, duration: 0.9, stagger: 0.07 }, '<0.1')
        .add(() => {
          busy.current = false
          gsap.set(el, { visibility: 'hidden' })
        })
    },
    [navigate]
  )

  // back / forward navigation (no curtain): reset scroll and reveal immediately
  useEffect(() => {
    if (viaTransition.current) {
      viaTransition.current = false
      return
    }
    scrollTop()
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [location.pathname])

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div className="transition" ref={overlay} aria-hidden="true">
        {fragrances.map((f) => (
          <div key={f.slug} className="t-col" style={{ background: f.theme.a }} />
        ))}
        <div className="t-mark">
          <Monogram size={84} stroke={2.4} />
        </div>
      </div>
    </Ctx.Provider>
  )
}

export function TLink({ to, children, className = '', onClick, ...rest }) {
  const { go } = useTransition()
  return (
    <a
      href={import.meta.env.BASE_URL.replace(/\/$/, '') + to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        onClick?.(e)
        go(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
