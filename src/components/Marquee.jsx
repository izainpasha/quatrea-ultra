import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { scene } from '../lib/scene'

// Infinite marquee whose speed and direction respond to scroll velocity.
export default function Marquee({ items, speed = 60, className = '' }) {
  const root = useRef(null)
  useGSAP(
    () => {
      const track = root.current.querySelector('.mq-track')
      let x = 0
      let dir = -1
      const tick = (_, dt) => {
        const w = track.scrollWidth / 2
        if (!w) return
        if (scene.direction) dir = scene.direction > 0 ? -1 : 1
        const boost = 1 + Math.min(Math.abs(scene.velocity), 60) * 0.12
        x += dir * speed * boost * (dt / 1000)
        if (x <= -w) x += w
        if (x > 0) x -= w
        gsap.set(track, { x })
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root }
  )
  const row = [...items, ...items]
  return (
    <div className={`marquee ${className}`} ref={root} aria-hidden="true">
      <div className="mq-track">
        {row.map((t, i) => (
          <span className="mq-item" key={i}>
            {t}
            <i className="mq-star">✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}
