import { useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap'
import { onReveal } from '../lib/reveal'
import { layouts, scene, setLayout, setTheme } from '../lib/scene'
import { fadeUp, revealLines, splitChars, zone } from '../lib/anim'
import { bySlug, fragrances } from '../data/fragrances'
import { TLink } from '../components/Transition'
import { useBag } from '../components/Bag'
import Magnetic from '../components/Magnetic'
import Footer from '../components/Footer'

const LAYERS = [
  { key: 'top', label: 'Top notes', when: 'The first 15 minutes' },
  { key: 'heart', label: 'Heart notes', when: 'From 30 minutes to 4 hours' },
  { key: 'base', label: 'Base notes', when: 'Lingering until night' },
]

export default function Fragrance({ slug }) {
  const idx = bySlug(slug)
  const f = fragrances[idx]
  const nextIdx = (idx + 1) % fragrances.length
  const next = fragrances[nextIdx]
  const root = useRef(null)
  const [size, setSize] = useState(50)
  const { add } = useBag()

  useGSAP(
    () => {
      const heroScene = () => {
        setTheme(idx)
        setLayout(layouts.focus(idx, 'center', { y: -0.24, s: 1.04, py: -0.04, ps: 1.45 }), { spin: 0.9 })
      }
      heroScene()

      const chars = splitChars('.fr-name')
      const intro = gsap.timeline({ paused: true })
      intro
        .from(chars, { yPercent: 115, duration: 1.6, stagger: 0.05, ease: 'expo.out' })
        .from('.fr-fade', { opacity: 0, y: 24, stagger: 0.1, duration: 1.1 }, 0.3)
      const off = onReveal(() => intro.play())

      gsap.to('.fr-name', {
        yPercent: 40,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: '.fr-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
      zone('.fr-hero', heroScene)

      // —— Story
      zone('.fr-story', () => {
        setTheme(idx)
        setLayout(layouts.focus(idx, 'right', { s: 1.1, ps: 1.0, py: 0.45 }), { spin: 0 })
      })
      ScrollTrigger.create({
        trigger: '.fr-story',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => (scene.bottles[idx].ry = (self.progress - 0.5) * -1.6),
      })
      revealLines('.st-text')
      fadeUp('.st-fade')

      // —— Notes pyramid: pinned, the bottle "evaporates" as layers change
      const layers = gsap.utils.toArray('.nt-layer')
      const dots = gsap.utils.toArray('.nt-step')
      gsap.set(layers.slice(1), { opacity: 0, y: 60 })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.fr-notes',
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: 0.6,
          onEnter: () => setLayout(layouts.focus(idx, 'right', { s: 1.25, ps: 1.0, py: 0.42 }), { spin: 0 }),
          onEnterBack: () => setLayout(layouts.focus(idx, 'right', { s: 1.25, ps: 1.0, py: 0.42 }), { spin: 0 }),
          onUpdate: (self) => {
            const b = scene.bottles[idx]
            b.ry = self.progress * Math.PI * 2
            b.fill = 1 - self.progress * 0.62
            const step = Math.min(2, Math.floor(self.progress * 3))
            dots.forEach((d, k) => d.classList.toggle('is-active', k === step))
          },
        },
      })
      tl.to('.nt-progress i', { scaleY: 1, ease: 'none', duration: 3 }, 0)
      layers.forEach((layer, k) => {
        if (k === 0) return
        tl.to(layers[k - 1], { opacity: 0, y: -60, duration: 0.35, ease: 'power2.in' }, k - 0.2)
        tl.to(layer, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, k + 0.1)
      })

      // —— Character
      zone('.fr-char', () => {
        setTheme(idx)
        setLayout(layouts.focus(idx, 'left', { s: 1.0, ps: 0.9, py: 0.5, fill: 1 }), { spin: 0.5 })
      })
      revealLines('.ch-title')
      gsap.utils.toArray('.spec-bar i').forEach((bar) =>
        gsap.from(bar, { scaleX: 0, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: bar, start: 'top 90%', once: true } })
      )
      gsap.from('.mood-word', {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.moods', start: 'top 85%', once: true },
      })
      fadeUp('.char-fade')

      // —— Buy
      zone('.fr-buy', () => {
        setTheme(idx)
        setLayout(layouts.focus(idx, 'right', { s: 1.15, ps: 0.9, py: 0.5, ry: -0.4 }), { spin: 0 })
      })
      fadeUp('.buy-fade', { stagger: 0.07 })

      // —— Next season: pinned title with the next bottle rising into place below it
      zone(
        '.fr-next',
        () => {
          setTheme(nextIdx)
          setLayout(layouts.focus(nextIdx, 'center', { y: -0.42, s: 0.92, py: -0.28, ps: 1.5 }), { spin: 0.8 })
        },
        { start: 'top 35%' }
      )
      gsap.fromTo(
        '.nx-name',
        { yPercent: 40, opacity: 0.2 },
        { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.fr-next', start: 'top bottom', end: 'top top', scrub: true } }
      )
      zone('.footer', () => setLayout(layouts.hidden(), { spin: 0.4 }))

      return off
    },
    { scope: root }
  )

  return (
    <div className="fragrance" ref={root}>
      {/* HERO */}
      <section className="fr-hero">
        <div className="fr-top fr-fade">
          <span className="eyebrow">
            N°{f.no} — {f.season} · {f.seasonFr}
          </span>
          <span className="eyebrow">{f.concentration}</span>
        </div>
        <h1 className="fr-name">{f.name}</h1>
        <p className="fr-tag fr-fade">{f.tagline}</p>
        <div className="fr-foot fr-fade">
          <span>
            <small>Longevity</small>
            {f.longevity}
          </span>
          <span className="scroll-cue">
            <span>Scroll</span>
            <i />
          </span>
          <span>
            <small>From</small>€{f.prices[30]}
          </span>
        </div>
      </section>

      {/* STORY */}
      <section className="fr-story">
        <div className="st-inner">
          <span className="eyebrow st-fade">The story</span>
          <p className="st-text">{f.intro}</p>
          <p className="st-body st-fade">{f.story}</p>
        </div>
      </section>

      {/* NOTES */}
      <section className="fr-notes">
        <div className="nt-inner">
          <div className="nt-side">
            <span className="eyebrow">The composition</span>
            <div className="nt-steps">
              {LAYERS.map((l, k) => (
                <span className={`nt-step ${k === 0 ? 'is-active' : ''}`} key={l.key}>
                  0{k + 1} <em>{l.label}</em>
                </span>
              ))}
            </div>
            <div className="nt-progress">
              <i />
            </div>
          </div>
          <div className="nt-stack">
            {LAYERS.map((l) => (
              <div className="nt-layer" key={l.key}>
                <span className="eyebrow">{l.when}</span>
                <h3>{l.label}</h3>
                <ul>
                  {f.notes[l.key].map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
                <p>{f.noteDesc[l.key]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARACTER */}
      <section className="fr-char">
        <div className="char-inner">
          <span className="eyebrow char-fade">Character</span>
          <h2 className="ch-title">
            How it <em>wears.</em>
          </h2>
          <div className="moods">
            {f.mood.map((m) => (
              <span className="mood-mask" key={m}>
                <span className="mood-word">{m}</span>
              </span>
            ))}
          </div>
          <div className="specs">
            {Object.entries(f.specs).map(([k, v]) => (
              <div className="spec char-fade" key={k}>
                <span>{k}</span>
                <span className="spec-bar">
                  <i style={{ width: `${v * 100}%` }} />
                </span>
                <span>{Math.round(v * 10)}/10</span>
              </div>
            ))}
          </div>
          <div className="char-facts char-fade">
            <div>
              <small>Longevity</small>
              {f.longevity}
            </div>
            <div>
              <small>Sillage</small>
              {f.sillage}
            </div>
            <div>
              <small>Season</small>
              {f.months}
            </div>
          </div>
        </div>
      </section>

      {/* BUY */}
      <section className="fr-buy">
        <div className="buy-inner">
          <span className="eyebrow buy-fade">Make it yours</span>
          <h2 className="buy-title buy-fade">
            {f.name} <em>N°{f.no}</em>
          </h2>
          <p className="buy-fade buy-desc">
            {f.concentration}. Hand-poured into a weighted glass flacon with a signature {f.season.toLowerCase()} cap.
          </p>
          <div className="sizes buy-fade" role="radiogroup" aria-label="Size">
            {Object.keys(f.prices).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={+s === size}
                className={`size ${+s === size ? 'is-active' : ''}`}
                onClick={() => setSize(+s)}
                data-cursor={`${s} ml`}
              >
                <span>{s} ml</span>
                <small>€{f.prices[s]}</small>
              </button>
            ))}
          </div>
          <div className="buy-row buy-fade">
            <span className="buy-price">€{f.prices[size]}</span>
            <Magnetic>
              <button className="btn btn-solid" onClick={() => add(f.slug, size)} data-cursor="Add">
                Add to bag <span className="arrow">+</span>
              </button>
            </Magnetic>
          </div>
          <ul className="buy-perks buy-fade">
            <li>Complimentary engraving</li>
            <li>Two samples of your choice</li>
            <li>Refillable flacon</li>
          </ul>
        </div>
      </section>

      {/* NEXT */}
      <section className="fr-next">
        <div className="nx-sticky">
          <TLink to={`/fragrance/${next.slug}`} className="nx-link" data-cursor="Next">
            <span className="eyebrow">Next season — {next.season}</span>
            <span className="nx-name">{next.name}</span>
            <span className="nx-tag">{next.tagline}</span>
          </TLink>
        </div>
      </section>

      <Footer />
    </div>
  )
}
