import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { scene } from './scene'

export let lenis = null

export function initSmooth() {
  if (lenis) return lenis
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lenis = new Lenis({ lerp: reduce ? 1 : 0.085, smoothWheel: !reduce, wheelMultiplier: 0.95 })
  lenis.on('scroll', (e) => {
    ScrollTrigger.update()
    scene.velocity = e.velocity
    scene.direction = e.direction
    scene.scrollY = e.scroll
  })
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollTop() {
  lenis?.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}
