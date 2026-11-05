import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { fragrances } from '../data/fragrances'
import { lenis } from '../lib/smooth'

const Ctx = createContext(null)
export const useBag = () => useContext(Ctx)
const KEY = 'quatrea-bag'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function BagProvider({ children }) {
  const [items, setItems] = useState(load)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])
  const add = (slug, size) => {
    setItems((list) => {
      const i = list.findIndex((x) => x.slug === slug && x.size === size)
      if (i >= 0) return list.map((x, k) => (k === i ? { ...x, qty: x.qty + 1 } : x))
      return [...list, { slug, size, qty: 1 }]
    })
    setOpen(true)
  }
  const remove = (idx) => setItems((list) => list.filter((_, k) => k !== idx))
  const count = items.reduce((n, x) => n + x.qty, 0)
  return <Ctx.Provider value={{ items, add, remove, count, open, setOpen }}>{children}</Ctx.Provider>
}

export function BagDrawer() {
  const { items, remove, open, setOpen } = useBag()
  const root = useRef(null)
  const first = useRef(true)
  useEffect(() => {
    const el = root.current
    if (first.current) {
      first.current = false
      return
    }
    if (open) {
      lenis?.stop()
      gsap.set(el, { visibility: 'visible' })
      gsap.to(el.querySelector('.bag-scrim'), { opacity: 1, duration: 0.5 })
      gsap.fromTo(el.querySelector('.bag-panel'), { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: 'expo.out' })
      gsap.fromTo(
        el.querySelectorAll('.bag-item, .bag-foot, .bag-empty'),
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.06, delay: 0.2, duration: 0.7 }
      )
    } else {
      lenis?.start()
      gsap.to(el.querySelector('.bag-scrim'), { opacity: 0, duration: 0.4 })
      gsap.to(el.querySelector('.bag-panel'), {
        xPercent: 100,
        duration: 0.6,
        ease: 'expo.in',
        onComplete: () => gsap.set(el, { visibility: 'hidden' }),
      })
    }
  }, [open])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  const total = items.reduce((n, x) => n + fragrances.find((f) => f.slug === x.slug).prices[x.size] * x.qty, 0)
  return (
    <div className="bag" ref={root} style={{ visibility: 'hidden' }} aria-hidden={!open}>
      <div className="bag-scrim" onClick={() => setOpen(false)} />
      <aside className="bag-panel" role="dialog" aria-label="Your bag">
        <header className="bag-head">
          <span className="eyebrow">Your bag</span>
          <button className="bag-close" onClick={() => setOpen(false)} data-cursor="Close">
            Close
          </button>
        </header>
        <div className="bag-list" data-lenis-prevent>
          {items.length === 0 && <p className="bag-empty">Your bag is empty — every season is waiting.</p>}
          {items.map((x, i) => {
            const f = fragrances.find((ff) => ff.slug === x.slug)
            return (
              <div className="bag-item" key={x.slug + x.size}>
                <span className="bag-swatch" style={{ background: `linear-gradient(160deg, ${f.theme.a}, ${f.theme.liquid})` }} />
                <div>
                  <div className="bag-name">
                    {f.name} <em>N°{f.no}</em>
                  </div>
                  <div className="bag-meta">
                    {f.season} · {x.size} ml · × {x.qty}
                  </div>
                </div>
                <div className="bag-right">
                  <span>€{f.prices[x.size] * x.qty}</span>
                  <button onClick={() => remove(i)}>Remove</button>
                </div>
              </div>
            )
          })}
        </div>
        <footer className="bag-foot">
          <div className="bag-total">
            <span>Subtotal</span>
            <span>€{total}</span>
          </div>
          <button className="btn btn-solid" disabled={!items.length} data-cursor="Demo">
            Checkout <small>(concept demo)</small>
          </button>
        </footer>
      </aside>
    </div>
  )
}
