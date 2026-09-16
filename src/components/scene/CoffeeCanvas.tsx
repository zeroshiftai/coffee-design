import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { sceneState } from '@/lib/sceneState'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Backdrop } from './Backdrop'
import { Beans } from './Beans'
import { GlassMug } from './GlassMug'
import { GoldDust } from './GoldDust'
import { GoldRibbons } from './GoldRibbons'
import { IceCubes } from './IceCubes'
import { MilkSwirl } from './MilkSwirl'
import { Pedestal } from './Pedestal'
import { Rig } from './Rig'
import { Steam } from './Steam'

/**
 * Waits for a few drawn frames while the canvas stays at opacity 0.
 * Avoids a sync `gl.compile()` spike — that was a big source of refresh-time cuts.
 */
function WarmUp({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    frames.current += 1
    // Let the first couple of pipeline-building frames finish off-screen.
    if (frames.current < 6) return
    done.current = true
    window.setTimeout(onReady, 0)
  })

  return null
}

/** Local HDRI stand-in: emissive cards captured into a cube map, no network fetch. */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#b58a5e']} />
      {/* Key light, high and slightly front-left. */}
      <Lightformer
        form="rect"
        intensity={5}
        color="#fff4e2"
        position={[-2.4, 3.2, 3]}
        rotation={[0, 0, 0]}
        scale={[7, 5, 1]}
      />
      {/* Warm gold rim from behind right. */}
      <Lightformer
        form="rect"
        intensity={3.4}
        color="#f0c078"
        position={[4, 1.4, -2.4]}
        rotation={[0, -Math.PI / 2.4, 0]}
        scale={[6, 4, 1]}
      />
      {/* Cool separation edge on the left. */}
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#dfe9f5"
        position={[-4.2, 0.4, -1.6]}
        rotation={[0, Math.PI / 2.4, 0]}
        scale={[5, 4, 1]}
      />
      {/* Ground bounce off the cream podium. */}
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#f3ddc0"
        position={[0, -3.2, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 6, 1]}
      />
      <Lightformer form="ring" intensity={2.6} color="#ffd9a0" position={[1.6, 2.4, -3]} scale={2.4} />
    </Environment>
  )
}

function Stage({
  lowPower,
  compact,
  enhanced,
}: {
  lowPower: boolean
  compact: boolean
  /** Heavier extras mount after the first fade-in so refresh compile is smaller. */
  enhanced: boolean
}) {
  return (
    <>
      <ambientLight intensity={0.3} color="#fff1dd" />
      <directionalLight position={[-3, 4.5, 4]} intensity={1.05} color="#fff3e0" />
      <directionalLight position={[4, 1.5, -3]} intensity={0.5} color="#e8b877" />
      <pointLight position={[0, 1.6, 3.4]} intensity={2.2} distance={14} decay={2} color="#ffe9cc" />

      <StudioEnvironment />
      <Backdrop />

      {/* On phones the stage drops into the lower half so the headline above it
          sits on clear background instead of across the glass. */}
      <Rig amplitude={lowPower ? 0.5 : 1}>
        <group position={[0, compact ? -1.85 : -0.62, 0]} scale={compact ? 0.88 : 1}>
          <GoldRibbons lowPower={lowPower} />
          <MilkSwirl lowPower={lowPower} />
          {/* Hero product cluster — scaled as one so steam and podium stay registered. */}
          <group scale={1.12}>
            <Pedestal />
            <GlassMug lowPower={lowPower} />
            <Steam lowPower={lowPower} />
          </group>
          <Beans count={lowPower ? 9 : 16} />
          {enhanced && <IceCubes lowPower={lowPower} />}
        </group>
        <GoldDust lowPower={lowPower} />
      </Rig>
    </>
  )
}

/**
 * The hero's WebGL layer. Everything in it is generated at runtime — geometry,
 * canvas textures, and the environment map — so the scene ships with no assets.
 */
export function CoffeeCanvas() {
  const { isMobile, isTablet } = useBreakpoint()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [degraded, setDegraded] = useState(false)
  const [ready, setReady] = useState(false)
  const [enhanced, setEnhanced] = useState(false)

  const lowPower = isMobile || isTablet || degraded
  // Layout-only flag: a degraded desktop still keeps the wide composition.
  const compact = isMobile

  const handleReady = useCallback(() => setReady(true), [])

  // Entrance only after shaders have warmed — avoids animating through a hitch.
  useEffect(() => {
    if (prefersReducedMotion) {
      sceneState.entrance = 1
      setReady(true)
      setEnhanced(true)
      return
    }

    if (!ready) {
      sceneState.entrance = 0
      return
    }

    sceneState.entrance = 0
    const tween = gsap.to(sceneState, {
      entrance: 1,
      duration: 2.8,
      ease: 'power3.out',
    })
    return () => {
      tween.kill()
    }
  }, [ready, prefersReducedMotion])

  // Ice + bloom after the mug is already fading in — splits the compile hitch.
  useEffect(() => {
    if (!ready || prefersReducedMotion) return
    const id = window.setTimeout(() => setEnhanced(true), 700)
    return () => window.clearTimeout(id)
  }, [ready, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    const onPointerMove = (event: PointerEvent) => {
      sceneState.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      sceneState.pointerY = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onPointerLeave = () => {
      sceneState.pointerX = 0
      sceneState.pointerY = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [prefersReducedMotion])

  return (
    <div
      className={`h-full w-full transition-opacity duration-[1100ms] ease-out ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Canvas
        dpr={[1, lowPower ? 1.25 : 1.6]}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
        camera={{ fov: 34, near: 0.1, far: 60, position: [0, 1.85, 11] }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 0.94,
        }}
      >
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
        <Suspense fallback={null}>
          <Stage lowPower={lowPower} compact={compact} enhanced={enhanced} />
          {enhanced && !lowPower && (
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <Bloom intensity={0.28} luminanceThreshold={0.95} luminanceSmoothing={0.22} mipmapBlur />
              <Vignette offset={0.16} darkness={0.62} />
            </EffectComposer>
          )}
          <WarmUp onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
