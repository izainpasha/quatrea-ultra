import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from '../lib/gsap'
import { onReveal } from '../lib/reveal'
import { layouts, scene, setLayout, setTheme } from '../lib/scene'
import { fadeUp, revealLines, splitChars, zone } from '../lib/anim'
import Footer from '../components/Footer'
import Marquee from '../components/Marquee'

const STEPS = [
  {
    no: 'I',
    fr: 'Récolte',
    title: 'Harvest',
    text: 'Petals are gathered by hand at dawn, when their oils are richest. A single litre of rose absolute asks for nearly four tonnes of flowers.',
  },
  {
    no: 'II',
    fr: 'Distillation',
    title: 'Distillation',
    text: 'Copper stills and slow fires. Every material is extracted on its own, so each season keeps its own clear voice.',
  },
  {
    no: 'III',
    fr: 'Maturation',
    title: 'Maturation',
    text: 'Each blend rests for eight weeks in the dark, the way a great wine does, until its edges soften into one another.',
  },
  {
    no: 'IV',
    fr: 'Flaconnage',
    title: 'Bottling',
    text: 'Every flacon is filled, sealed and polished by hand — then numbered on its base, so no two are quite the same.',
  },
]

const STATS = [
  { value: 127, label: 'Raw materials in our organ' },
  { value: 8, label: 'Weeks of maturation' },
  { value: 4, label: 'Seasons, one year' },
  { value: 1, label: 'Pair of hands per flacon' },
]

export default function Atelier() {
  const root = useRef(null)

  useGSAP(
    () => {
      const heroScene = () => {
        setTheme(-1)
        setLayout(layouts.hidden(), { orbit: 1, spin: 0.5 })
      }
      heroScene()

      const chars = splitChars('.at-title-a')
      const intro = gsap.timeline({ paused: true })
      intro
        .from(chars, { yPercent: 120, duration: 1.5, stagger: 0.035, ease: 'expo.out' })
        .from('.at-fade', { opacity: 0, y: 24, stagger: 0.1, duration: 1.1 }, 0.3)
      const off = onReveal(() => intro.play())
      zone('.at-hero', heroScene)

      // —— Process: pinned four-step story, the flacon fills as you scroll
      const steps = gsap.utils.toArray('.pr-step')
      const nums = gsap.utils.toArray('.pr-num span')
      gsap.set(steps.slice(1), { opacity: 0, y: 50 })
      gsap.set(nums.slice(1), { yPercent: 100 })
      let active = -1
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.at-process',
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const k = Math.min(3, Math.floor(self.progress * 4))
            if (k !== active) {
              active = k
              setTheme(k)
              setLayout(layouts.focus(k, 'right', { s: 1.2, ps: 1.0, py: 0.42 }), { spin: 0 })
            }
            const b = scene.bottles[k]
            b.fill = 0.04 + self.progress * 0.96
            b.ry = Math.sin(self.progress * Math.PI * 4) * 0.5
          },
          onLeaveBack: () => heroScene(),
        },
      })
      tl.to('.pr-bar i', { scaleX: 1, ease: 'none', duration: 4 }, 0)
      steps.forEach((s, k) => {
        if (k === 0) return
        tl.to(steps[k - 1], { opacity: 0, y: -50, duration: 0.3, ease: 'power2.in' }, k - 0.15)
        tl.to(nums[k - 1], { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }, k - 0.15)
        tl.to(nums[k], { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }, k - 0.15)
        tl.to(s, { opacity: 1, y: 0, duration: 0.4 }, k + 0.1)
      })
      tl.to({}, { duration: 0.4 })

      // —— Stats
      zone('.at-stats', () => {
        setTheme(-1)
        setLayout(layouts.hidden(), { spin: 0.4 })
      })
      gsap.utils.toArray('.stat-num').forEach((el) => {
        const target = +el.dataset.value
        const o = { v: 0 }
        gsap.to(o, {
          v: target,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => (el.textContent = Math.round(o.v)),
        })
      })
      fadeUp('.stat', { stagger: 0.1 })
      revealLines('.stats-title')

      // —— Quote
      zone('.at-quote', () => {
        setTheme(-1)
        setLayout(layouts.hidden(), { orbit: 1, spin: 0.3 })
      })
      const words = SplitText.create('.q-text', { type: 'words', wordsClass: 'mf-word' }).words
      gsap.fromTo(
        words,
        { opacity: 0.1 },
        { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.at-quote', start: 'top 70%', end: 'bottom 75%', scrub: true } }
      )
      fadeUp('.q-sign')
      zone('.footer', () => setLayout(layouts.hidden(), { spin: 0.4 }))
      return off
    },
    { scope: root }
  )

  return (
    <div className="atelier" ref={root}>
      <section className="at-hero">
        <span className="eyebrow at-fade">The Atelier — Grasse, France</span>
        <h1 className="at-title">
          <span className="at-title-a">Made slowly,</span>
          <em className="at-fade">by hand.</em>
        </h1>
        <p className="at-lede at-fade">
          Every Quatréa fragrance passes through four quiet stages — the same four, whatever the season. Scroll to follow
          a flacon from flower to finish.
        </p>
      </section>

      <section className="at-process">
        <div className="pr-inner">
          <div className="pr-num" aria-hidden="true">
            {STEPS.map((s) => (
              <span key={s.no}>{s.no}</span>
            ))}
          </div>
          <div className="pr-stack">
            {STEPS.map((s) => (
              <div className="pr-step" key={s.no}>
                <span className="eyebrow">{s.fr}</span>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="pr-bar">
            <i />
          </div>
        </div>
      </section>

      <section className="at-stats">
        <h2 className="stats-title">
          The atelier, <em>in numbers.</em>
        </h2>
        <div className="stats-grid">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-num" data-value={s.value}>
                0
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Marquee
        items={['Pear Blossom', 'Sicilian Lemon', 'Saffron', 'Juniper', 'Peony', 'Fig Leaf', 'Amber', 'Iris']}
        speed={45}
        className="marquee-sm"
      />

      <section className="at-quote">
        <p className="q-text">
          “I don’t make perfume for a person. I make it for a moment — and then I let people find the moment they belong
          to.”
        </p>
        <span className="q-sign">Élise Marchand — Maître Parfumeur, Quatréa</span>
      </section>

      <Footer />
    </div>
  )
}
