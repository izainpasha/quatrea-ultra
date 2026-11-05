import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scene } from '../lib/scene'

// One particle system per season: petals, sun motes, leaves, snow.
const SYSTEMS = [
  { shape: 0, count: 120, size: 46, dir: -1, speed: 0.32, sway: 0.7, c1: '#F4A9BA', c2: '#FFF1F3' },
  { shape: 1, count: 110, size: 40, dir: 1, speed: 0.2, sway: 0.4, c1: '#FFCF7A', c2: '#FFF5D6' },
  { shape: 2, count: 90, size: 58, dir: -1, speed: 0.42, sway: 1.0, c1: '#C24E1C', c2: '#EDA445' },
  { shape: 3, count: 240, size: 24, dir: -1, speed: 0.26, sway: 0.45, c1: '#FFFFFF', c2: '#CFE0F5' },
]
const BOX = new THREE.Vector3(8, 4.6, 4)

const vertex = /* glsl */ `
  uniform float uTravel;
  uniform float uTime;
  uniform float uSize;
  uniform float uDir;
  uniform float uSway;
  uniform vec3 uBox;
  attribute vec4 aSeed;
  varying float vAngle;
  varying float vSeed;
  varying float vFade;
  void main() {
    vec3 p = position;
    float speed = 0.55 + aSeed.x * 0.9;
    p.y = mod(p.y + uDir * uTravel * speed + uBox.y, 2.0 * uBox.y) - uBox.y;
    p.x += sin(uTime * (0.35 + aSeed.y * 0.5) + aSeed.z * 6.2831) * uSway;
    p.z += cos(uTime * 0.3 + aSeed.w * 6.2831) * uSway * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + aSeed.y * 0.9) * (9.0 / -mv.z);
    vAngle = aSeed.z * 6.2831 + uTime * (aSeed.w - 0.5) * 1.6;
    vSeed = aSeed.x;
    // fade near the vertical wrap edges and very close to camera
    vFade = smoothstep(uBox.y, uBox.y * 0.75, abs(p.y)) * smoothstep(2.0, 4.0, -mv.z);
  }
`

const fragment = /* glsl */ `
  uniform int uShape;
  uniform vec3 uCol1;
  uniform vec3 uCol2;
  uniform float uOpacity;
  varying float vAngle;
  varying float vSeed;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float c = cos(vAngle), s = sin(vAngle);
    uv = mat2(c, -s, s, c) * uv;
    float a = 0.0;
    float shade = 1.0;
    if (uShape == 0) {
      // petal — soft teardrop with a notch
      vec2 q = uv * vec2(1.75, 1.2);
      q.y += 0.04 + q.x * q.x * 0.6;
      float d = length(q);
      a = smoothstep(0.42, 0.37, d);
      a *= smoothstep(0.05, 0.12, length(uv - vec2(0.0, 0.43)));
      shade = 0.82 + 0.18 * smoothstep(0.4, -0.2, uv.y);
    } else if (uShape == 1) {
      // sun mote / bokeh
      float d = length(uv);
      a = pow(smoothstep(0.5, 0.0, d), 1.8) * 0.9;
      a += smoothstep(0.5, 0.45, d) * smoothstep(0.36, 0.45, d) * 0.35;
    } else if (uShape == 2) {
      // leaf — lens shape with a midrib
      float d1 = length(uv - vec2(0.27, 0.0));
      float d2 = length(uv + vec2(0.27, 0.0));
      a = smoothstep(0.47, 0.43, d1) * smoothstep(0.47, 0.43, d2);
      float rib = smoothstep(0.022, 0.0, abs(uv.x)) * step(abs(uv.y), 0.36);
      shade = 1.0 - rib * 0.35;
      shade *= 0.8 + 0.2 * smoothstep(-0.2, 0.2, uv.x);
    } else {
      // snowflake — glow with six fine arms
      float d = length(uv);
      a = pow(smoothstep(0.5, 0.0, d), 2.2);
      float arms = 0.0;
      for (int k = 0; k < 3; k++) {
        float ang = float(k) * 1.0472;
        vec2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * uv;
        arms = max(arms, smoothstep(0.03, 0.0, abs(r.y)) * smoothstep(0.42, 0.1, abs(r.x)));
      }
      a = max(a, arms * 0.7);
    }
    vec3 col = mix(uCol1, uCol2, vSeed) * shade;
    float alpha = a * uOpacity * vFade;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`

function System({ cfg, index }) {
  const ref = useRef()
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(cfg.count * 3)
    const seed = new Float32Array(cfg.count * 4)
    for (let i = 0; i < cfg.count; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * BOX.x
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * BOX.y
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * BOX.z
      for (let k = 0; k < 4; k++) seed[i * 4 + k] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTravel: { value: Math.random() * 10 },
        uTime: { value: 0 },
        uSize: { value: cfg.size },
        uDir: { value: cfg.dir },
        uSway: { value: cfg.sway },
        uBox: { value: BOX },
        uShape: { value: cfg.shape },
        uCol1: { value: new THREE.Color(cfg.c1) },
        uCol2: { value: new THREE.Color(cfg.c2) },
        uOpacity: { value: 0 },
      },
    })
    return { geometry: g, material: m }
  }, [cfg])

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const u = material.uniforms
    const vel = Math.min(Math.abs(scene.velocity), 60)
    u.uTime.value += dt
    u.uTravel.value += dt * cfg.speed * (1 + vel * 0.06)
    u.uSize.value = cfg.size * state.viewport.dpr * Math.min(1.2, state.size.height / 900)
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, scene.particles[index] ?? 0, 1.6, dt)
    ref.current.visible = u.uOpacity.value > 0.005
  })

  return (
    <points ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={10} />
  )
}

export default function Particles() {
  return SYSTEMS.map((cfg, i) => <System key={i} cfg={cfg} index={i} />)
}
