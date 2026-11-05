import { Component, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Background from './Background'
import Particles from './Particles'
import Bottle from './Bottle'
import { fragrances } from '../data/fragrances'
import { scene } from '../lib/scene'

function Rig() {
  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    scene.orbitMix = THREE.MathUtils.damp(scene.orbitMix || 0, scene.orbit, 1.8, dt)
    // decay velocity when Lenis stops emitting
    scene.velocity *= 0.92
    const cam = state.camera
    cam.position.x = THREE.MathUtils.damp(cam.position.x, scene.pointer.x * 0.35, 2.5, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, scene.pointer.y * 0.22, 2.5, dt)
    cam.lookAt(0, 0, 0)
  })
  return null
}

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#6f655b']} />
      <Lightformer form="rect" color="#FFF4E6" intensity={1.6} position={[0, 0, -6]} scale={[14, 6, 1]} />
      <Lightformer form="rect" color="#FFE2BF" intensity={1.2} position={[6, -2, -3]} rotation-y={-Math.PI / 3} scale={[4, 3, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={3.2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 8, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[5, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[2, 8, 1]} />
      <Lightformer form="ring" color="#FFE8C7" intensity={1.4} position={[0, 1, 8]} scale={4} />
      <Lightformer form="rect" color="#ffffff" intensity={1} position={[0, -4, 3]} rotation-x={-Math.PI / 2} scale={[10, 2, 1]} />
    </Environment>
  )
}

class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e) {
    console.warn('[Quatréa] WebGL disabled:', e)
  }
  render() {
    return this.state.failed ? <div className="gl-fallback" /> : this.props.children
  }
}

export default function Experience() {
  return (
    <div className="gl" aria-hidden="true">
      <GLBoundary>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 60 }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping
            gl.toneMappingExposure = 1.05
          }}
          style={{ pointerEvents: 'none' }}
        >
          <Background />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} />
          <directionalLight position={[-4, -2, 2]} intensity={0.5} color="#ffe2c4" />
          <Suspense fallback={null}>
            <Studio />
            {fragrances.map((f, i) => (
              <Bottle key={f.slug} index={i} f={f} />
            ))}
          </Suspense>
          <Particles />
          <Rig />
        </Canvas>
      </GLBoundary>
    </div>
  )
}
