import { gsap, ScrollTrigger, SplitText } from './gsap'

/** Masked line-by-line reveal when an element scrolls into view. */
export function revealLines(targets, { start = 'top 88%', stagger = 0.09, delay = 0 } = {}) {
  gsap.utils.toArray(targets).forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 115,
          duration: 1.25,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        })
      },
    })
  })
}

/** Fade + rise for groups of elements as they enter the viewport. */
export function fadeUp(targets, { start = 'top 90%', stagger = 0.08, y = 40 } = {}) {
  const els = gsap.utils.toArray(targets)
  if (!els.length) return
  gsap.set(els, { opacity: 0, y })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger }),
  })
}

/** Split a heading into characters for a masked intro. Returns the chars. */
export function splitChars(target) {
  return SplitText.create(target, { type: 'chars', mask: 'chars', charsClass: 'split-char' }).chars
}

/**
 * A "scene zone": whichever section is crossing the 55% line of the viewport
 * owns the WebGL scene (palette, particles, bottle layout).
 */
export function zone(trigger, apply, extra = {}) {
  return ScrollTrigger.create({
    trigger,
    start: 'top 55%',
    end: 'bottom 55%',
    onEnter: apply,
    onEnterBack: apply,
    ...extra,
  })
}
