import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger, SplitText } from '../lib/gsap'
import { onReveal } from '../lib/reveal'
import { layouts, scene, setLayout, setTheme } from '../lib/scene'
import { revealLines, fadeUp, splitChars, zone } from '../lib/anim'
import { fragrances } from '../data/fragrances'
import { TLink, useTransition } from '../components/Transition'
import Footer from '../components/Footer'
import Marquee from '../components/Marquee'
import Magnetic from '../components/Magnetic'
import { ARCS, TAIL } from '../components/Logo'

export default function Home() {
  const root = useRef(null)
  const { go } = useTransition()

  useGSAP(
    () => {
      const heroScene = () => {
        setTheme(-1)
        setLayout(layouts.hero(), { spin: 1 })
      }
      heroScene()

      // —— Hero intro (plays when the curtain / loader lifts)
      const chars = splitChars('.hero-title')
      const intro = gsap.timeline({ paused: true })
      intro
        .from(chars, { yPercent: 120, rotate: 6, duration: 1.6, ease: 'expo.out', stagger: 0.06 })
        .from('.hero-fade', { opacity: 0, y: 24, duration: 1.2, stagger: 0.12 }, 0.35)
        .from('.hero-rule', { scaleX: 0, duration: 1.6, ease: 'expo.inOut' }, 0.2)
      const off = onReveal(() => intro.play())

      // —— Hero exits with scroll
      gsap.to('.hero-title', {
        yPercent: -35,
        letterSpacing: '0.04em',
        opacity: 0.0,
        ease: 'none',
        scrollTrigger: { trigger: '.s-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-sub, .hero-foot', {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.s-hero', start: 'top top', end: '60% top', scrub: true },
      })
      zone('.s-hero', heroScene)

      // —— Manifesto: words light up as you read
      zone('.s-manifesto', () => {
        setTheme(-1)
        setLayout(layouts.hidden(), { orbit: 1, spin: 0.4 })
      })
      const words = SplitText.create('.mf-text', { type: 'words', wordsClass: 'mf-word' }).words
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.s-manifesto', start: 'top 65%', end: 'bottom 85%', scrub: true },
        }
      )
      gsap.from('.mf-sign', {
        opacity: 0,
        y: 20,
        scrollTrigger: { trigger: '.mf-sign', start: 'top 90%', once: true },
      })

      // —— Season chapters
      gsap.utils.toArray('.ch-name').forEach((el) => splitChars(el))
      gsap.utils.toArray('.chapter').forEach((ch, i) => {
        const side = i % 2 === 0 ? 'right' : 'left'
        zone(ch, () => {
          setTheme(i)
          setLayout(layouts.focus(i, side, { y: -0.04 }), { spin: 0 })
        })
        ScrollTrigger.create({
          trigger: ch,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            if (scene.themeIndex === i) scene.bottles[i].ry = (self.progress - 0.5) * (side === 'right' ? -2.6 : 2.6)
          },
        })
        const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 60%', once: true } })
        tl.from(ch.querySelectorAll('.ch-name .split-char'), { yPercent: 120, duration: 1.4, ease: 'expo.out', stagger: 0.045 })
          .from(ch.querySelectorAll('.ch-fade'), { opacity: 0, y: 30, duration: 1.1, stagger: 0.08 }, 0.15)
          .from(ch.querySelector('.ch-line'), { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0)
        gsap.fromTo(
          ch.querySelector('.ch-num'),
          { yPercent: 30 },
          { yPercent: -40, ease: 'none', scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } }
        )
      })

      // —— Lineup
      zone('.s-lineup', () => {
        setTheme(-1)
        setLayout(layouts.row(-0.12, 0.62), { spin: 0.25 })
      })
      revealLines('.lu-title')
      fadeUp('.lu-col', { stagger: 0.1 })

      // —— CTA quadrant
      zone('.s-cta', () => {
        setTheme(-1)
        setLayout(layouts.hidden(), { spin: 0.4 })
      })
      gsap.fromTo(
        '.cta-quad',
        { rotate: -90, scale: 0.8 },
        { rotate: 90, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.s-cta', start: 'top bottom', end: 'bottom top', scrub: true } }
      )
      gsap.utils.toArray('.cta-quad .q-arc').forEach((p, i) => {
        const len = p.getTotalLength()
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.s-cta', start: `top ${80 - i * 8}%`, end: `center ${70 - i * 8}%`, scrub: true } }
        )
      })
      revealLines('.cta-title')
      fadeUp('.cta-fade')
      zone('.footer', () => setLayout(layouts.hidden(), { spin: 0.4 }))

      return off
    },
    { scope: root }
  )

  return (
    <div className="home" ref={root}>
      {/* HERO */}
      <section className="s-hero">
        <div className="hero-top hero-fade">
          <span className="eyebrow">Maison de Parfum</span>
          <span className="eyebrow">Grasse — Est. MMXXVI</span>
        </div>
        <h1 className="hero-title" aria-label="Quatréa">
          Quatréa
        </h1>
        <div className="hero-rule" />
        <p className="hero-sub hero-fade">
          The year, distilled. <em>Four fragrances</em> — one for every season.
        </p>
        <div className="hero-foot hero-fade">
          <span>N°01 — N°04</span>
          <span className="scroll-cue">
            <span>Scroll to begin</span>
            <i />
          </span>
          <span>Spring · Summer · Autumn · Winter</span>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="s-manifesto">
        <div className="mf-sticky">
          <span className="eyebrow">Our philosophy</span>
          <p className="mf-text">
            A fragrance should change the way the light does. Quatréa captures the year in four acts — the tender green
            of spring, the salt-gold of summer, the smoke of autumn and the silence of winter — so you can wear the
            season you are in, or the one you long for.
          </p>
          <span className="mf-sign">— Élise Marchand, Maître Parfumeur</span>
        </div>
      </section>

      {/* CHAPTERS */}
      {fragrances.map((f, i) => (
        <section className={`chapter ${i % 2 === 0 ? 'text-left' : 'text-right'}`} key={f.slug}>
          <div className="ch-sticky">
            <span className="ch-num" aria-hidden="true">
              {f.no}
            </span>
            <div className="ch-content">
              <div className="ch-meta ch-fade">
                <span className="eyebrow">
                  {f.season} — {f.seasonFr}
                </span>
                <span className="eyebrow">{f.months}</span>
              </div>
              <div className="ch-line" />
              <h2 className="ch-name">{f.name}</h2>
              <p className="ch-tag ch-fade">{f.tagline}</p>
              <p className="ch-intro ch-fade">{f.intro}</p>
              <ul className="ch-notes ch-fade">
                <li>
                  <small>Top</small>
                  {f.notes.top[0]}
                </li>
                <li>
                  <small>Heart</small>
                  {f.notes.heart[0]}
                </li>
                <li>
                  <small>Base</small>
                  {f.notes.base[0]}
                </li>
              </ul>
              <div className="ch-fade">
                <Magnetic>
                  <TLink to={`/fragrance/${f.slug}`} className="btn" data-cursor="Discover">
                    Discover {f.name} <span className="arrow">→</span>
                  </TLink>
                </Magnetic>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* LINEUP */}
      <section className="s-lineup">
        <div className="lu-sticky">
          <div className="lu-head">
            <span className="eyebrow">The Collection</span>
            <h2 className="lu-title">
              Four acts. <em>One year.</em>
            </h2>
          </div>
          <div className="lu-cols">
            {fragrances.map((f, i) => (
              <button
                key={f.slug}
                className="lu-col"
                data-cursor="View"
                onPointerEnter={() => (scene.hover = i)}
                onPointerLeave={() => (scene.hover = -1)}
                onClick={() => go(`/fragrance/${f.slug}`)}
              >
                <span className="lu-no">N°{f.no}</span>
                <span className="lu-bottom">
                  <span className="lu-name">{f.name}</span>
                  <span className="lu-season">
                    {f.season} · from €{f.prices[30]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={['Rosée', 'Solstice', 'Ambre Roux', 'Givre']} />

      {/* CTA */}
      <section className="s-cta">
        <svg className="cta-quad" viewBox="0 0 100 100" aria-hidden="true">
          {ARCS.map((d, i) => (
            <path key={i} className="q-arc" d={d} stroke={fragrances[i].theme.liquid} />
          ))}
          <path d={TAIL} className="q-tail" />
          {fragrances.map((f, i) => {
            const pos = [
              [50, 97],
              [3, 50],
              [50, 3],
              [97, 50],
            ][i]
            return (
              <text key={f.slug} x={pos[0]} y={pos[1]} className="q-label" textAnchor="middle" dominantBaseline="middle">
                {f.season.toUpperCase()}
              </text>
            )
          })}
        </svg>
        <div className="cta-body">
          <span className="eyebrow cta-fade">Scent Finder</span>
          <h2 className="cta-title">
            Which season <em>are you?</em>
          </h2>
          <p className="cta-fade">Four questions. One fragrance that feels like it was made for you.</p>
          <div className="cta-fade">
            <Magnetic>
              <TLink to="/finder" className="btn btn-solid" data-cursor="Begin">
                Find your season <span className="arrow">→</span>
              </TLink>
            </Magnetic>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
