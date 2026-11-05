import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { quality } from '../lib/quality'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)
  useEffect(() => {
    // The custom cursor follows the page's frame rate; on integrated GPUs keep the
    // native OS cursor so input never feels laggy.
    if (window.matchMedia('(pointer: coarse)').matches || quality.tier !== 'high') return
    document.documentElement.classList.add('has-cursor')
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' })
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' })
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' })
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' })
    let current = null
    const scaleFor = (t) => (t ? (t.dataset?.cursor ? 2.8 : 1.7) : 1)
    let shown = false
    const move = (e) => {
      if (!shown) {
        shown = true
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY })
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.4 })
      }
      xd(e.clientX)
      yd(e.clientY)
      xr(e.clientX)
      yr(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button, input, label') || null
      if (t !== current) {
        current = t
        const text = t?.dataset?.cursor || ''
        label.current.textContent = text
        ring.current.classList.toggle('has-label', !!text)
        gsap.to(ring.current, { scale: scaleFor(t), duration: 0.5, ease: 'expo.out' })
        gsap.to(dot.current, { scale: t ? 0 : 1, duration: 0.3 })
      }
    }
    const down = () => gsap.to(ring.current, { scale: scaleFor(current) * 0.8, duration: 0.2 })
    const up = () => gsap.to(ring.current, { scale: scaleFor(current), duration: 0.4 })
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 })
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 })
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('mouseleave', leave)
    document.documentElement.addEventListener('mouseenter', enter)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
      document.documentElement.removeEventListener('mouseenter', enter)
    }
  }, [])
  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring}>
        <span ref={label} />
      </div>
    </>
  )
}
