import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap'
import { onReveal } from '../lib/reveal'
import { isPortrait, layouts, scene, setLayout, setTheme } from '../lib/scene'
import { fadeUp, revealLines, splitChars, zone } from '../lib/anim'
import { lenis } from '../lib/smooth'
import { fragrances } from '../data/fragrances'
import { TLink } from '../components/Transition'
import Magnetic from '../components/Magnetic'
import Footer from '../components/Footer'

export default function Collection() {
  const root = useRef(null)
  const pinST = useRef(null)

  useGSAP(
    () => {
      const headScene = () => {
        setTheme(-1)
        setLayout(layouts.row(-0.4, 0.5), { spin: 0.6 })
      }
      headScene()

      const chars = splitChars('.col-title-a')
      const intro = gsap.timeline({ paused: true })
      intro
        .from(chars, { yPercent: 120, duration: 1.5, stagger: 0.035, ease: 'expo.out' })
        .from('.col-fade', { opacity: 0, y: 20, stagger: 0.1, duration: 1.1 }, 0.3)
      const off = onReveal(() => intro.play())
      zone('.col-hero', headScene)

      // —— Horizontal journey through the year
      const track = root.current.querySelector('.h-track')
      const panels = gsap.utils.toArray('.h-panel')
      const n = panels.length
      let active = -1
      const fills = gsap.utils.toArray('.h-seg i')
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '.h-wrap',
          pin: true,
          scrub: true,
          start: 'top top',
          end: () => '+=' + (track.scrollWidth - window.innerWidth),
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress * (n - 1)
            const portrait = isPortrait()
            scene.spin = 0
            scene.orbit = 0
            for (let i = 0; i < n; i++) {
              const d = i - p
              Object.assign(scene.bottles[i], {
                x: (portrait ? 0 : 0.4) + d * 2,
                y: portrait ? 0.24 : -0.03,
                s: portrait ? 1.35 : 1.18,
                ry: -d * 1.4,
                rz: d * 0.15,
                fill: 1,
              })
            }
            const idx = Math.round(p)
            if (idx !== active) {
              active = idx
              setTheme(idx)
              root.current.querySelectorAll('.h-seg').forEach((s, k) => s.classList.toggle('is-active', k === idx))
            }
            fills.forEach((el, k) => gsap.set(el, { scaleX: gsap.utils.clamp(0, 1, p - k + 1) }))
          },
        },
      })
      pinST.current = tween.scrollTrigger

      // panel content reveal tied to the horizontal motion
      panels.forEach((panel) => {
        const items = panel.querySelectorAll('.hp-anim')
        gsap.from(items, {
          x: 120,
          opacity: 0,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: 'left 85%',
            end: 'left 35%',
            scrub: true,
          },
        })
        gsap.fromTo(
          panel.querySelector('.hp-big'),
          { xPercent: 20 },
          {
            xPercent: -20,
            ease: 'none',
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          }
        )
      })

      // —— Character comparison
      zone('.compare', () => {
        setTheme(-1)
        setLayout(layouts.hidden(), { spin: 0.4 })
      })
      revealLines('.cmp-title')
      gsap.utils.toArray('.cmp-bar i').forEach((bar) => {
        gsap.from(bar, {
          scaleX: 0,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
        })
      })
      fadeUp('.cmp-row', { stagger: 0.06 })
      zone('.footer', () => setLayout(layouts.hidden(), { spin: 0.4 }))

      ScrollTrigger.refresh()
      return off
    },
    { scope: root }
  )

  const jump = (i) => {
    const st = pinST.current
    if (!st) return
    lenis?.scrollTo(st.start + ((st.end - st.start) * i) / (fragrances.length - 1), { duration: 1.6 })
  }

  return (
    <div className="collection" ref={root}>
      <section className="col-hero">
        <span className="eyebrow col-fade">The Collection — Four Fragrances</span>
        <h1 className="col-title">
          <span className="col-title-a">Every season,</span>
          <em className="col-fade">bottled.</em>
        </h1>
        <p className="col-fade col-lede">
          A journey through the year in four compositions. Keep scrolling — the seasons will turn for you.
        </p>
      </section>

      <section className="h-wrap">
        <div className="h-track">
          {fragrances.map((f) => (
            <article className="h-panel" key={f.slug}>
              <span className="hp-big" aria-hidden="true">
                {f.season}
              </span>
              <div className="hp-text">
                <span className="eyebrow hp-anim">
                  N°{f.no} · {f.season} — {f.months}
                </span>
                <h2 className="hp-name hp-anim">{f.name}</h2>
                <p className="hp-tag hp-anim">{f.tagline}</p>
                <div className="hp-notes hp-anim">
                  {['top', 'heart', 'base'].map((k) => (
                    <div key={k}>
                      <small>{k}</small>
                      <span>{f.notes[k].join(', ')}</span>
                    </div>
                  ))}
                </div>
                <div className="hp-foot hp-anim">
                  <span className="hp-price">
                    from <strong>€{f.prices[30]}</strong>
                  </span>
                  <Magnetic>
                    <TLink to={`/fragrance/${f.slug}`} className="btn" data-cursor="Discover">
                      Discover <span className="arrow">→</span>
                    </TLink>
                  </Magnetic>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="h-ui">
          {fragrances.map((f, i) => (
            <button className="h-seg" key={f.slug} onClick={() => jump(i)} data-cursor="Go">
              <span>
                {f.no} {f.season}
              </span>
              <b>
                <i />
              </b>
            </button>
          ))}
        </div>
      </section>

      <section className="compare">
        <div className="cmp-head">
          <span className="eyebrow">Character</span>
          <h2 className="cmp-title">
            Find your <em>intensity.</em>
          </h2>
        </div>
        <div className="cmp-table">
          {fragrances.map((f) => (
            <TLink to={`/fragrance/${f.slug}`} className="cmp-row" key={f.slug} data-cursor="View">
              <span className="cmp-name">
                <small>N°{f.no}</small> {f.name}
              </span>
              {['intensity', 'longevity', 'sillage'].map((k) => (
                <span className="cmp-cell" key={k}>
                  <small>{k}</small>
                  <span className="cmp-bar">
                    <i style={{ width: `${f.specs[k] * 100}%`, background: f.theme.liquid }} />
                  </span>
                </span>
              ))}
              <span className="cmp-conc">{f.concentration}</span>
            </TLink>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
