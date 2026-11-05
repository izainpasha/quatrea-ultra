// Adaptive rendering quality.
//
// 1. A GPU tier is detected once at startup (integrated / mobile GPUs start lower,
//    software renderers get no WebGL at all).
// 2. A runtime monitor watches the real browser frame rate and steps quality
//    down if the machine struggles — so the page never starves the OS compositor.
// Override for testing with ?quality=high | low | off

const LEVELS = [
  // 0 — survival mode
  { dpr: 0.7, trans: 0.35, bg: 0.18, particles: 0.35, simpleGlass: true, dispersion: 0 },
  // 1
  { dpr: 0.85, trans: 0.4, bg: 0.22, particles: 0.6, simpleGlass: false, dispersion: 0 },
  // 2 — default for integrated GPUs (Intel Iris / UHD, phones)
  { dpr: 1, trans: 0.5, bg: 0.25, particles: 0.8, simpleGlass: false, dispersion: 0 },
  // 3 — default for dedicated GPUs
  { dpr: 1.5, trans: 0.75, bg: 0.33, particles: 1, simpleGlass: false, dispersion: 0.25 },
]

function detectTier() {
  const forced = new URLSearchParams(location.search).get('quality')
  if (forced === 'high' || forced === 'low' || forced === 'off') return { tier: forced, renderer: 'forced' }
  if (/^[0-3]$/.test(forced || '')) return { tier: forced === '3' ? 'high' : 'low', renderer: 'forced', level: +forced, locked: true }
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return { tier: 'off', renderer: 'none' }
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String((ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return { tier: 'off', renderer }
    const touch = window.matchMedia('(pointer: coarse)').matches
    const lowMem = (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4
    if (touch || lowMem || /intel|mali|adreno|powervr|apple gpu|videocore/i.test(renderer)) return { tier: 'low', renderer }
    return { tier: 'high', renderer }
  } catch {
    return { tier: 'low', renderer: 'unknown' }
  }
}

const detected = detectTier()
const startLevel = detected.level ?? (detected.tier === 'high' ? 3 : 2)

export const quality = {
  tier: detected.tier,
  renderer: detected.renderer,
  level: startLevel,
  ...LEVELS[startLevel],
  locked: !!detected.locked, // a forced numeric level disables auto-downgrade
  version: 0, // bumps whenever settings change, so consumers can react
}
quality.dpr = Math.min(quality.dpr, window.devicePixelRatio || 1)

export function setLevel(level) {
  if (quality.locked) return false
  level = Math.max(0, Math.min(LEVELS.length - 1, level))
  if (level === quality.level) return false
  Object.assign(quality, LEVELS[level], { level })
  quality.dpr = Math.min(quality.dpr, window.devicePixelRatio || 1)
  quality.version++
  console.info(`[Quatréa] rendering quality → level ${level}`)
  return true
}

console.info(`[Quatréa] GPU: ${detected.renderer} · tier: ${detected.tier} · level ${quality.level}`)

