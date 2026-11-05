import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { onReveal } from '../lib/reveal'
import { layouts, setLayout, setTheme } from '../lib/scene'
import { splitChars } from '../lib/anim'
import { fragrances } from '../data/fragrances'
import { TLink } from '../components/Transition'
import Magnetic from '../components/Magnetic'

// Each answer nudges the four seasons: [spring, summer, autumn, winter]
const QUESTIONS = [
  {
    q: 'Pick a moment.',
    a: [
      { t: 'Dew on morning grass', w: [3, 1, 0, 0] },
      { t: 'Golden hour by the sea', w: [0, 3, 1, 0] },
      { t: 'A walk through falling leaves', w: [0, 0, 3, 1] },
      { t: 'Firelight on a snowy night', w: [0, 0, 1, 3] },
    ],
  },
  {
    q: 'Choose a texture.',
    a: [
      { t: 'Silk petals', w: [3, 0, 0, 1] },
      { t: 'Warm sand', w: [0, 3, 1, 0] },
      { t: 'Worn leather', w: [0, 1, 3, 0] },
      { t: 'Soft cashmere', w: [1, 0, 0, 3] },
    ],
  },
  {
    q: 'Which notes draw you in?',
    a: [
      { t: 'Green & floral', w: [3, 1, 0, 0] },
      { t: 'Citrus & salt', w: [1, 3, 0, 0] },
      { t: 'Spice & amber', w: [0, 0, 3, 1] },
      { t: 'Woods & frost', w: [0, 0, 1, 3] },
    ],
  },
  {
    q: 'How should your scent speak?',
    a: [
      { t: 'A whisper', w: [2, 0, 0, 1] },
      { t: 'A smile', w: [1, 2, 0, 0] },
      { t: 'A story', w: [0, 0, 2, 1] },
      { t: 'A secret', w: [0, 1, 1, 2] },
    ],
  },
]

const leader = (s) => s.indexOf(Math.max(...s))
const weights = (s) => {
  const max = Math.max(...s, 1)
  return s.map((v) => Math.pow(v / max, 2.2) * 0.95)
}

export default function Finder() {
  const root = useRef(null)
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState([0, 0, 0, 0])
  const busy = useRef(false)
  const done = step >= QUESTIONS.length

  useGSAP(
    () => {
      setTheme(-1, [0.4, 0.4, 0.4, 0.4])
      setLayout(layouts.hidden(), { orbit: 1, spin: 0.6 })
      const chars = splitChars('.fd-title')
      const intro = gsap.timeline({ paused: true })
      intro
        .from(chars, { yPercent: 120, duration: 1.4, stagger: 0.03, ease: 'expo.out' })
        .from('.fd-fade', { opacity: 0, y: 24, stagger: 0.08, duration: 1 }, 0.25)
      return onReveal(() => intro.play())
    },
    { scope: root }
  )

  // animate each new question / the result in
  useLayoutEffect(() => {
    if (step === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.fd-anim', { y: 60, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out' })
    }, root)
    return () => ctx.revert()
  }, [step])

  const answer = (w) => {
    if (busy.current) return
    busy.current = true
    const nextScores = scores.map((v, i) => v + w[i])
    const lead = leader(nextScores)
    setTheme(lead, weights(nextScores))
    const isLast = step + 1 >= QUESTIONS.length
    if (isLast) setLayout(layouts.focus(lead, 'right', { s: 1.2, ps: 1.05, py: 0.45 }), { spin: 0.6 })
    gsap.to(root.current.querySelectorAll('.fd-anim'), {
      y: -50,
      opacity: 0,
      duration: 0.45,
      stagger: 0.04,
      ease: 'power2.in',
      onComplete: () => {
        setScores(nextScores)
        setStep((s) => s + 1)
        busy.current = false
      },
    })
  }

  const restart = () => {
    gsap.to(root.current.querySelectorAll('.fd-anim'), {
      y: -40,
      opacity: 0,
      duration: 0.4,
      stagger: 0.03,
      onComplete: () => {
        setScores([0, 0, 0, 0])
        setStep(0)
        setTheme(-1, [0.4, 0.4, 0.4, 0.4])
        setLayout(layouts.hidden(), { orbit: 1, spin: 0.6 })
        requestAnimationFrame(() =>
          gsap.from(root.current.querySelectorAll('.fd-anim'), { y: 60, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out' })
        )
      },
    })
  }

  const result = fragrances[leader(scores)]
  const total = scores.reduce((a, b) => a + b, 0) || 1

  return (
    <div className="finder" ref={root}>
      <section className="fd-stage">
        <header className="fd-head">
          <span className="eyebrow fd-fade">Scent Finder</span>
          <h1 className="fd-title">Which season are you?</h1>
          <div className="fd-progress fd-fade" aria-label={`Question ${Math.min(step + 1, 4)} of 4`}>
            {QUESTIONS.map((_, i) => (
              <i key={i} className={i < step ? 'is-done' : i === step ? 'is-now' : ''} />
            ))}
          </div>
        </header>

        {!done ? (
          <div className="fd-body" key={step}>
            <p className="fd-q fd-anim fd-fade">
              <small>0{step + 1} / 04</small>
              {QUESTIONS[step].q}
            </p>
            <div className="fd-options">
              {QUESTIONS[step].a.map((o, i) => (
                <button key={o.t} className="fd-opt fd-anim fd-fade" onClick={() => answer(o.w)} data-cursor="Choose">
                  <span className="fd-letter">{'ABCD'[i]}</span>
                  <span>{o.t}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="fd-result" key="result">
            <span className="eyebrow fd-anim">Your season is {result.season}</span>
            <h2 className="fd-anim fd-rname">{result.name}</h2>
            <p className="fd-anim fd-rtag">{result.tagline}</p>
            <div className="fd-mix fd-anim">
              {fragrances.map((f, i) => (
                <div key={f.slug}>
                  <span>{f.season}</span>
                  <b>
                    <i style={{ width: `${(scores[i] / total) * 100}%`, background: f.theme.liquid }} />
                  </b>
                  <em>{Math.round((scores[i] / total) * 100)}%</em>
                </div>
              ))}
            </div>
            <div className="fd-actions fd-anim">
              <Magnetic>
                <TLink to={`/fragrance/${result.slug}`} className="btn btn-solid" data-cursor="Discover">
                  Discover {result.name} <span className="arrow">→</span>
                </TLink>
              </Magnetic>
              <button className="btn" onClick={restart} data-cursor="Again">
                Retake
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
