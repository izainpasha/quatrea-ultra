import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { scene } from '../lib/scene'

const { damp } = THREE.MathUtils
const TAU = Math.PI * 2

// Body dimensions (world units at scale 1)
const W = 1.22
const H = 1.5
const D = 0.62

function drawLabel(canvas, f) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = f.theme.label
  ctx.strokeStyle = f.theme.label
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const spaced = (text, y, font, spacing) => {
    ctx.font = font
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${spacing}px`
      ctx.fillText(text, w / 2 + spacing / 2, y)
      ctx.letterSpacing = '0px'
    } else ctx.fillText(text, w / 2, y)
  }

  spaced('QUATRÉA', h * 0.2, '500 34px Manrope, sans-serif', 14)
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.38, h * 0.28)
  ctx.lineTo(w * 0.62, h * 0.28)
  ctx.stroke()
  ctx.globalAlpha = 1
  spaced(`N° ${f.no}`, h * 0.37, '400 38px "Cormorant Garamond", serif', 4)
  const nameSize = f.name.length > 8 ? 92 : 118
  ctx.font = `italic 300 ${nameSize}px "Cormorant Garamond", serif`
  ctx.fillText(f.name, w / 2, h * 0.53)
  spaced(f.season.toUpperCase(), h * 0.68, '500 24px Manrope, sans-serif', 10)
  ctx.globalAlpha = 0.7
  spaced('EAU DE PARFUM · 100 ML', h * 0.8, '400 20px Manrope, sans-serif', 6)
  ctx.globalAlpha = 1
}

function useLabel(f) {
  const tex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 800
    drawLabel(canvas, f)
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }, [f])
  useEffect(() => {
    let alive = true
    Promise.all([
      document.fonts.load('italic 300 100px "Cormorant Garamond"'),
      document.fonts.load('400 40px "Cormorant Garamond"'),
      document.fonts.load('500 30px Manrope'),
    ])
      .catch(() => {})
      .then(() => {
        if (!alive) return
        drawLabel(tex.image, f)
        tex.needsUpdate = true
      })
    return () => {
      alive = false
    }
  }, [tex, f])
  return tex
}

function Cap({ index, color }) {
  const gold = (
    <meshStandardMaterial color="#C9A465" metalness={1} roughness={0.22} envMapIntensity={1.4} />
  )
  if (index === 0)
    // Spring — porcelain bud
    return (
      <mesh position={[0, 0.33, 0]} scale={[1, 1.22, 1]}>
        <sphereGeometry args={[0.3, 48, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={1} clearcoatRoughness={0.15} sheen={1} sheenColor="#ffffff" />
      </mesh>
    )
  if (index === 1)
    // Summer — polished sun disc
    return (
      <group position={[0, 0.42, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.12, 64]} />
          {gold}
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.22, 24]} />
          {gold}
        </mesh>
      </group>
    )
  if (index === 2)
    // Autumn — faceted amber resin
    return (
      <mesh position={[0, 0.3, 0]} rotation={[0.4, 0.3, 0.2]}>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshPhysicalMaterial color={color} roughness={0.12} metalness={0.1} clearcoat={1} flatShading />
      </mesh>
    )
  // Winter — ice crystal
  return (
    <mesh position={[0, 0.42, 0]} scale={[1, 1.55, 1]} rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.06}
        transmission={1}
        thickness={0.6}
        ior={1.6}
        flatShading
        envMapIntensity={1.6}
      />
    </mesh>
  )
}

export default function Bottle({ index, f }) {
  const group = useRef()
  const liquid = useRef()
  const label = useLabel(f)
  const c = useRef({ x: (index - 1.5) * 1.6, y: -6, s: 0.5, ry: 0, rz: 0, spin: index, spinV: 0, hov: 0, fill: 1 })

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transmission: 1,
        roughness: 0.02,
        thickness: 1.6,
        ior: 1.47,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        attenuationColor: new THREE.Color(f.theme.glass),
        attenuationDistance: 2.4,
        specularIntensity: 1,
        envMapIntensity: 1.25,
        dispersion: 0.6,
      }),
    [f]
  )

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const g = group.current
    if (!g) return
    const v = c.current
    const t = scene.bottles[index]
    const vp = state.viewport
    const base = Math.min(1, vp.width / (vp.height * 1.12))
    const time = state.clock.elapsedTime
    const hovered = scene.hover === index
    v.hov = damp(v.hov, hovered ? 1 : 0, 6, dt)

    let tx = (t.x * vp.width) / 2
    let ty = ((t.y + v.hov * 0.05) * vp.height) / 2
    let tz = 0
    let ts = t.s * base * (1 + v.hov * 0.07)

    const o = scene.orbitMix || 0
    if (o > 0.001) {
      const a = index * (TAU / 4) + time * 0.28
      const R = Math.min(2.6, vp.width * 0.3)
      tx = THREE.MathUtils.lerp(tx, Math.cos(a) * R, o)
      tz = THREE.MathUtils.lerp(tz, Math.sin(a) * R * 0.75 - 1.2, o)
      ty = THREE.MathUtils.lerp(ty, Math.sin(a * 2 + time * 0.3) * 0.18 - 0.15, o)
      ts = THREE.MathUtils.lerp(ts, 0.62 * base, o)
    }

    v.x = damp(v.x, tx, 3.1, dt)
    v.y = damp(v.y, ty, 3.1, dt)
    v.z = damp(v.z ?? 0, tz, 3.1, dt)
    v.s = damp(v.s, ts, 3.4, dt)
    v.ry = damp(v.ry, t.ry, 3, dt)
    const vel = THREE.MathUtils.clamp(scene.velocity * 0.004, -0.18, 0.18)
    v.rz = damp(v.rz, t.rz + vel, 3, dt)
    v.fill = damp(v.fill, t.fill ?? 1, 2.6, dt)

    const spinTarget = scene.spin * 0.32 + v.hov * 1.6 + o * 0.3
    v.spinV = damp(v.spinV, spinTarget, 2, dt)
    v.spin += v.spinV * dt
    if (scene.spin === 0 && !hovered && o < 0.01) v.spin = damp(v.spin, Math.round(v.spin / TAU) * TAU, 1.4, dt)

    const float = Math.sin(time * 0.9 + index * 1.7) * 0.05 * v.s
    g.position.set(v.x, v.y + float, v.z)
    g.scale.setScalar(Math.max(v.s, 0.0001))
    g.rotation.set(-scene.pointer.y * 0.12, v.ry + v.spin + scene.pointer.x * 0.22, v.rz)
    if (liquid.current) liquid.current.scale.y = Math.max(0.001, v.fill)

    g.visible = v.y > -vp.height * 0.5 - 2.4 * v.s && Math.abs(v.x) < vp.width * 0.5 + 1.6 * v.s
  })

  // thick glass walls + heavy base, liquid sits inside with a little headroom
  const inner = { w: W - 0.36, h: H - 0.52, d: D - 0.3 }

  return (
    <group ref={group}>
      <group position={[0, -0.32, 0]}>
        {/* liquid (anchored at the bottom so `fill` scales upward) */}
        <group ref={liquid} position={[0, -H / 2 + 0.24, 0]}>
          <RoundedBox args={[inner.w, inner.h, inner.d]} radius={0.06} smoothness={4} position={[0, inner.h / 2, 0]}>
            <meshPhysicalMaterial
              color={f.theme.liquid}
              roughness={0.18}
              clearcoat={1}
              clearcoatRoughness={0.1}
              emissive={f.theme.liquid}
              emissiveIntensity={0.22}
              sheen={0.5}
              sheenColor="#ffffff"
            />
          </RoundedBox>
        </group>

        {/* glass body */}
        <RoundedBox args={[W, H, D]} radius={0.15} smoothness={6} material={glass} />

        {/* engraved labels front + back */}
        <mesh position={[0, -0.02, D / 2 + 0.004]}>
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.02, -D / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        {/* neck + collar + cap */}
        <group position={[0, H / 2, 0]}>
          <mesh position={[0, 0.06, 0]} material={glass}>
            <cylinderGeometry args={[0.2, 0.24, 0.12, 40]} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.12, 48]} />
            <meshStandardMaterial color="#C9A465" metalness={1} roughness={0.2} envMapIntensity={1.4} />
          </mesh>
          <group position={[0, 0.2, 0]}>
            <Cap index={index} color={f.theme.cap} />
          </group>
        </group>
      </group>
    </group>
  )
}
