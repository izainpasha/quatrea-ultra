import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scene } from '../lib/scene'
import { quality } from '../lib/quality'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;

  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  float fbm(vec3 p){
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * snoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uRes.x / uRes.y;
    float t = uTime * 0.035;
    vec2 m = uMouse * 0.12;

    // domain-warped flowing silk
    vec3 q = vec3(p * 0.8 + m, t);
    float n1 = fbm(q + vec3(0.0, uScroll * 0.00012, 0.0));
    float n2 = fbm(vec3(p * 1.6 + n1 * 0.9, t * 1.6 + 3.1));
    float silk = smoothstep(-0.55, 0.65, n2);

    vec3 col = mix(uC, uA, silk);
    float band = smoothstep(0.05, 0.85, n1 * 0.6 + 0.5 - p.y * 0.55);
    col = mix(col, uB, band * 0.7);

    // silky highlight ribbons
    float ribbon = pow(1.0 - abs(sin((n2 + p.x * 0.4) * 2.4)), 6.0);
    col += ribbon * 0.022;

    // soft vignette
    float v = smoothstep(1.3, 0.2, length(p * vec2(0.85, 1.15)));
    col *= mix(0.82, 1.0, v);

    gl_FragColor = vec4(col, 1.0);
  }
`

// Cheap full-screen pass: upscale the low-res silk texture, draw the chapter
// numeral (part of the background, so the glass bottles sit in front of it and
// refract it), and add film grain.
const composite = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tSilk;
  uniform sampler2D tNum;
  uniform vec4 uNumRect;   // x, y, w, h in screen UV
  uniform vec2 uNumCell;   // atlas cell offset
  uniform float uNumAlpha;
  uniform vec3 uInk;
  uniform float uTime;
  void main() {
    vec3 col = texture2D(tSilk, vUv).rgb;
    vec2 q = (vUv - uNumRect.xy) / uNumRect.zw;
    if (uNumAlpha > 0.001 && q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
      float a = texture2D(tNum, (q + uNumCell) * 0.5).a;
      col = mix(col, uInk, a * uNumAlpha);
    }
    float g = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 91.7, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.028;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

// 2×2 atlas of outlined numerals 01–04 (white strokes, tinted in the shader)
function drawNumerals(canvas) {
  const ctx = canvas.getContext('2d')
  const cw = canvas.width / 2
  const ch = canvas.height / 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '300 470px "Cormorant Garamond", "Times New Roman", serif'
  for (let i = 0; i < 4; i++) {
    const x = (i % 2) * cw + cw / 2
    const y = Math.floor(i / 2) * ch + ch / 2 + 20
    ctx.strokeText('0' + (i + 1), x, y)
  }
}
function numeralAtlas() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  drawNumerals(canvas)
  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.anisotropy = 4
  return tex
}

export default function Background() {
  const size = useThree((s) => s.size)
  const { silk, silkScene, silkCam, target, material } = useMemo(() => {
    // sRGB-encoded 8-bit target: no banding in the dark winter palette
    const target = new THREE.WebGLRenderTarget(16, 16, {
      depthBuffer: false,
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    })
    target.texture.colorSpace = THREE.SRGBColorSpace
    const silk = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2() },
        uA: { value: scene.palette.a.clone() },
        uB: { value: scene.palette.b.clone() },
        uC: { value: scene.palette.c.clone() },
      },
    })
    const silkScene = new THREE.Scene()
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), silk)
    quad.frustumCulled = false
    silkScene.add(quad)
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: composite,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tSilk: { value: target.texture },
        tNum: { value: numeralAtlas() },
        uNumRect: { value: new THREE.Vector4(0, 0, 1, 1) },
        uNumCell: { value: new THREE.Vector2(0, 1) },
        uNumAlpha: { value: 0 },
        uInk: { value: scene.ink.clone() },
        uTime: { value: 0 },
      },
    })
    return { silk, silkScene, silkCam: new THREE.Camera(), target, material }
  }, [])
  const num = useRef({ shown: -1, alpha: 0 })

  useEffect(() => () => target.dispose(), [target])

  // redraw the numerals once the display font has loaded
  useEffect(() => {
    let alive = true
    document.fonts
      .load('300 400px "Cormorant Garamond"')
      .catch(() => {})
      .then(() => {
        if (!alive) return
        const tex = material.uniforms.tNum.value
        drawNumerals(tex.image)
        tex.needsUpdate = true
      })
    return () => {
      alive = false
    }
  }, [material])

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const u = silk.uniforms
    const k = 1 - Math.exp(-dt * 2.2)
    u.uTime.value += dt * (1 + Math.min(Math.abs(scene.velocity), 80) * 0.04)
    u.uScroll.value = scene.scrollY
    u.uMouse.value.lerp(scene.pointer, 0.04)
    u.uA.value.lerp(scene.palette.a, k)
    u.uB.value.lerp(scene.palette.b, k)
    u.uC.value.lerp(scene.palette.c, k)
    const m = material.uniforms
    m.uTime.value = u.uTime.value
    m.uInk.value.lerp(scene.ink, k)

    // chapter numeral: fade out, swap, fade back in
    const n = scene.numeral
    const v = num.current
    if (n.on && n.index !== v.shown) {
      v.alpha = THREE.MathUtils.damp(v.alpha, 0, 9, dt)
      if (v.alpha < 0.02 || v.shown < 0) v.shown = n.index
    } else v.alpha = THREE.MathUtils.damp(v.alpha, n.on ? 0.3 : 0, n.on ? 2.5 : 6, dt)
    m.uNumAlpha.value = v.alpha
    if (v.shown >= 0) {
      m.uNumCell.value.set(v.shown % 2, 1 - Math.floor(v.shown / 2))
      const portrait = size.width < size.height * 0.95
      const w = portrait ? 1.5 : 0.95
      const h = (w * size.width) / 2 / size.height // atlas cells are 2:1
      const cx = portrait ? 0.5 : n.side === 'right' ? 0.71 : 0.29
      const cy = (portrait ? 0.66 : 0.5) - (0.3 - 0.7 * n.p) * h * 0.6
      m.uNumRect.value.set(cx - w / 2, cy - h / 2, w, h)
    }

    // render the silk at a fraction of the screen resolution
    const w = Math.max(32, Math.round(size.width * quality.bg))
    const h = Math.max(32, Math.round(size.height * quality.bg))
    if (target.width !== w || target.height !== h) target.setSize(w, h)
    u.uRes.value.set(w, h)
    const gl = state.gl
    const prev = gl.getRenderTarget()
    gl.setRenderTarget(target)
    gl.render(silkScene, silkCam)
    gl.setRenderTarget(prev)
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1000} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
