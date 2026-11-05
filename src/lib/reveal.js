// Tiny pub/sub that tells pages when they are actually visible
// (after the preloader, or after a page-transition curtain lifts).
let revealed = false
const listeners = new Set()

export function onReveal(cb) {
  if (revealed) {
    cb()
    return () => {}
  }
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export const isRevealed = () => revealed
export function conceal() {
  revealed = false
}
export function reveal() {
  revealed = true
  const fns = [...listeners]
  listeners.clear()
  fns.forEach((fn) => fn())
}
