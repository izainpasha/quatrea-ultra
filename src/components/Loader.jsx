import { useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap'
import { reveal } from '../lib/reveal'
import { lenis } from '../lib/smooth'
import { Monogram } from './Logo'
import { fragrances } from '../data/fragrances'

export default function Loader() {
  const root = useRef(null)
  const [done, setDone] = useState(false)

  useGSAP(
    () => {
      lenis?.stop()
      const count = { v: 0 }
      const num = root.current.querySelector('.ld-num')
      const arcs = root.current.querySelectorAll('.monogram path')
      arcs.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      const fonts = document.fonts?.ready ?? Promise.resolve()
      let finished
      const minTime = new Promise((r) => (finished = r))
      const tl = gsap.timeline({ onComplete: () => finished() })
      tl.to(arcs, { strokeDashoffset: 0, duration: 1.4, stagger: 0.18, ease: 'power2.inOut' })
        .to(
          count,
          {
            v: 100,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => (num.textContent = String(Math.round(count.v)).padStart(3, '0')),
          },
          0
        )
        .from('.ld-season', { yPercent: 100, opacity: 0, stagger: 0.12, duration: 0.6 }, 0.3)
      Promise.all([fonts, minTime]).then(() => {
        gsap
          .timeline({ onComplete: () => setDone(true) })
          .to('.ld-inner', { yPercent: -30, opacity: 0, duration: 0.8, ease: 'power3.in' })
          .add(() => {
            ScrollTrigger.refresh()
            reveal()
            lenis?.start()
          }, '-=0.2')
          .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.25')
      })
    },
    { scope: root }
  )

  if (done) return null
  return (
    <div className="loader" ref={root}>
      <div className="ld-inner">
        <Monogram size={120} stroke={1.6} />
        <div className="ld-seasons">
          {fragrances.map((f) => (
            <span className="ld-season" key={f.slug}>
              {f.season}
            </span>
          ))}
        </div>
        <div className="ld-num">000</div>
        <p className="ld-caption">The year, distilled.</p>
      </div>
    </div>
  )
}
