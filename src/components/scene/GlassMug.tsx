import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  LIQUID_SURFACE,
  createGlassGeometry,
  createHandleGeometry,
  createLiquidGeometry,
} from '@/lib/three/geometry'
import { createLatteArtTexture } from '@/lib/three/textures'
import { sceneState } from '@/lib/sceneState'

type GlassMugProps = {
  /** Lower-cost transmission settings for phones. */
  lowPower?: boolean
}

/**
 * Double-wall latte glass: one lathed shell with real transmission, a
 * vertex-coloured latte inside, a painted crema disc, and a glass handle.
 */
export function GlassMug({ lowPower = false }: GlassMugProps) {
  const group = useRef<THREE.Group>(null)

  const glassGeometry = useMemo(() => createGlassGeometry(lowPower ? 64 : 112), [lowPower])
  const liquidGeometry = useMemo(() => createLiquidGeometry(LIQUID_SURFACE), [])
  const latteArt = useMemo(() => createLatteArtTexture(lowPower ? 384 : 768), [lowPower])

  const handleGeometry = useMemo(() => createHandleGeometry(lowPower), [lowPower])

  useFrame((_, delta) => {
    const mesh = group.current
    if (!mesh) return

    // Slow turntable, nudged forward as the hero scrolls away.
    const target = 0.35 + sceneState.scroll * 1.5 + sceneState.pointerX * 0.14
    mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, target, 2.4, delta)
    mesh.rotation.z = THREE.MathUtils.damp(
      mesh.rotation.z,
      sceneState.pointerX * -0.04,
      3,
      delta,
    )
  })

  return (
    <group ref={group}>
      <mesh geometry={glassGeometry} renderOrder={2}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={lowPower ? 0.35 : 0.85}
          ior={1.48}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          attenuationColor="#f6e7d2"
          attenuationDistance={3.2}
          envMapIntensity={1.35}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={liquidGeometry} renderOrder={1}>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.28}
          metalness={0}
          clearcoat={0.35}
          clearcoatRoughness={0.24}
          sheen={0.15}
          sheenColor="#ffd9a8"
          envMapIntensity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crema + rosetta sitting on the liquid surface. */}
      <mesh position={[0, LIQUID_SURFACE + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[0.402, 72]} />
        <meshStandardMaterial map={latteArt} roughness={0.58} metalness={0} envMapIntensity={0.7} />
      </mesh>

      <mesh geometry={handleGeometry} renderOrder={2}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.42}
          ior={1.48}
          roughness={0.05}
          clearcoat={1}
          envMapIntensity={1.2}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
