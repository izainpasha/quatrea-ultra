// The Quatréa monogram: four arcs (the four seasons) forming a Q.
const R = 38
const C = 50
const pt = (deg, r = R) => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)].map((n) => +n.toFixed(2))
}
const GAP = 9
// arcs centred on bottom (90°), left (180°), top (270°), right (0°) — gaps on the diagonals
export const ARCS = [90, 180, 270, 360].map((mid) => {
  const [x1, y1] = pt(mid - 45 + GAP)
  const [x2, y2] = pt(mid + 45 - GAP)
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`
})
const [tx1, ty1] = pt(45, R - 12)
const [tx2, ty2] = pt(45, R + 12)
export const TAIL = `M ${tx1} ${ty1} L ${tx2} ${ty2}`

export function Monogram({ size = 32, stroke = 3.2, className = '', colors }) {
  return (
    <svg className={`monogram ${className}`} width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {ARCS.map((d, i) => (
        <path key={i} className={`arc arc-${i}`} d={d} stroke={colors ? colors[i] : 'currentColor'} strokeWidth={stroke} strokeLinecap="round" />
      ))}
      <path className="tail" d={TAIL} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`} aria-label="Quatréa">
      QUATRÉA
    </span>
  )
}
