// Shared, mutable state that the DOM (GSAP / ScrollTrigger) writes
// and the WebGL scene reads every frame (with damping). No React re-renders.
import * as THREE from 'three'
import { gsap } from './gsap'
import { fragrances, neutralTheme } from '../data/fragrances'

const OFF = (i) => ({ x: (i - 1.5) * 0.45, y: -2.1, s: 0.55, ry: 0, rz: 0, fill: 1 })

export const scene = {
  palette: {
    a: new THREE.Color(neutralTheme.a),
    b: new THREE.Color(neutralTheme.b),
    c: new THREE.Color(neutralTheme.c),
  },
  ink: new THREE.Color(neutralTheme.fg),
  // chapter numeral drawn inside the WebGL background (behind the bottles)
  numeral: { on: false, index: 0, side: 'right', p: 0.5 },
  particles: [0, 0.35, 0, 0],
  bottles: [0, 1, 2, 3].map(OFF),
  hover: -1,
  orbit: 0,
  spin: 1,
  velocity: 0,
  direction: 0,
  scrollY: 0,
  pointer: { x: 0, y: 0 },
  themeIndex: -1,
}

const portrait = () => window.innerWidth < window.innerHeight * 0.95
export const isPortrait = portrait

let current = null
export function setTheme(idx, particles) {
  const t = idx < 0 ? neutralTheme : fragrances[idx].theme
  scene.palette.a.set(t.a)
  scene.palette.b.set(t.b)
  scene.palette.c.set(t.c)
  scene.ink.set(t.fg)
  scene.particles = particles || (idx < 0 ? [0, 0.35, 0, 0] : [0, 1, 2, 3].map((i) => (i === idx ? 1 : 0)))
  scene.themeIndex = idx
  if (current === idx) return
  current = idx
  const root = document.documentElement
  root.dataset.season = idx < 0 ? 'neutral' : fragrances[idx].season.toLowerCase()
  gsap.to(root, {
    '--fg': t.fg,
    '--accent': t.accent,
    '--bg': t.c,
    duration: 1.2,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

export const layouts = {
  hidden: () => [0, 1, 2, 3].map(OFF),
  hero() {
    const p = portrait()
    return [0, 1, 2, 3].map((i) => {
      const o = i - 1.5
      return {
        x: o * (p ? 0.47 : 0.34),
        y: p ? -0.4 - Math.abs(o) * 0.03 : -0.34 - Math.abs(o) * 0.06,
        s: p ? 0.85 : 0.6,
        ry: -o * 0.3,
        rz: -o * 0.05,
        fill: 1,
      }
    })
  },
  row(y = -0.32, s = 0.58) {
    const p = portrait()
    return [0, 1, 2, 3].map((i) => ({
      x: [-0.75, -0.25, 0.25, 0.75][i],
      y: p ? y * 0.7 : y,
      s: p ? s * 1.25 : s,
      ry: 0,
      rz: 0,
      fill: 1,
    }))
  },
  focus(k, side = 'right', o = {}) {
    const p = portrait()
    return [0, 1, 2, 3].map((i) =>
      i === k
        ? {
            x: p ? 0 : side === 'right' ? 0.44 : side === 'left' ? -0.44 : 0,
            y: p ? (o.py ?? 0.24) : (o.y ?? -0.03),
            s: p ? (o.ps ?? 1.55) : (o.s ?? 1.22),
            ry: o.ry ?? 0,
            rz: 0,
            fill: o.fill ?? 1,
          }
        : { ...OFF(i), x: (i - k) * 0.55 }
    )
  },
}

export function setLayout(arr, opts = {}) {
  arr.forEach((b, i) => Object.assign(scene.bottles[i], b))
  scene.spin = opts.spin ?? 1
  scene.orbit = opts.orbit ?? 0
  scene.hover = -1
  scene.numeral.on = false
}
