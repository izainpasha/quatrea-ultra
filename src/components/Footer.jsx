import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { TLink } from './Transition'
import { Monogram } from './Logo'
import { fragrances } from '../data/fragrances'

export default function Footer() {
  const root = useRef(null)
  const [sent, setSent] = useState(false)

  useGSAP(
    () => {
      gsap.from('.ft-letter', {
        yPercent: 100,
        stagger: 0.05,
        ease: 'expo.out',
        duration: 1.4,
        scrollTrigger: { trigger: '.ft-word', start: 'top 95%', once: true },
      })
      gsap.from('.ft-col', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    },
    { scope: root }
  )

  return (
    <footer className="footer" ref={root}>
      <div className="ft-grid">
        <div className="ft-col ft-intro">
          <Monogram size={44} stroke={3} />
          <p>
            Four fragrances. One for every season. Composed slowly in our atelier and poured by hand — so the year can
            always be close.
          </p>
        </div>
        <div className="ft-col">
          <span className="eyebrow">Maison</span>
          <TLink to="/collection">The Collection</TLink>
          <TLink to="/atelier">The Atelier</TLink>
          <TLink to="/finder">Scent Finder</TLink>
        </div>
        <div className="ft-col">
          <span className="eyebrow">Fragrances</span>
          {fragrances.map((f) => (
            <TLink key={f.slug} to={`/fragrance/${f.slug}`}>
              N°{f.no} {f.name}
            </TLink>
          ))}
        </div>
        <div className="ft-col ft-news">
          <span className="eyebrow">Letters from the atelier</span>
          <p>Four letters a year — one at the turn of each season.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <input type="email" required placeholder="Your email" aria-label="Email" disabled={sent} />
            <button type="submit" data-cursor="Join" disabled={sent}>
              {sent ? 'Merci ✦' : 'Join'}
            </button>
          </form>
        </div>
      </div>
      <div className="ft-word" aria-hidden="true">
        {'Quatréa'.split('').map((ch, i) => (
          <span className="ft-mask" key={i}>
            <span className="ft-letter">{ch}</span>
          </span>
        ))}
      </div>
      <div className="ft-bottom">
        <span>© 2026 Quatréa — a fictional maison de parfum.</span>
        <span>Design &amp; development concept · React · GSAP · WebGL</span>
      </div>
    </footer>
  )
}
