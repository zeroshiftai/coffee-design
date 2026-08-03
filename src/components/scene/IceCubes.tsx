import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { sceneState } from '@/lib/sceneState'

type Cube = {
  position: [number, number, number]
  scale: number
  tilt: [number, number, number]
  driftSpeed: number
  driftAmplitude: number
  spin: number
  phase: number
}

const CUBES: Cube[] = [
  { position: [-1.95, 1.32, 0.35], scale: 0.42, tilt: [0.4, 0.7, -0.25], driftSpeed: 0.5, driftAmplitude: 0.19, spin: 0.16, phase: 0.2 },
  { position: [1.72, 1.62, -0.55], scale: 0.34, tilt: [-0.3, 0.35, 0.5], driftSpeed: 0.62, driftAmplitude: 0.15, spin: -0.13, phase: 1.4 },
  { position: [2.15, 0.28, 0.4], scale: 0.46, tilt: [0.15, -0.5, 0.3], driftSpeed: 0.44, driftAmplitude: 0.22, spin: 0.1, phase: 2.6 },
  { position: [-2.3, -0.35, -0.35], scale: 0.36, tilt: [-0.5, 0.2, -0.4], driftSpeed: 0.55, driftAmplitude: 0.17, spin: -0.18, phase: 3.4 },
  { position: [1.15, -1.28, 0.75], scale: 0.3, tilt: [0.6, 0.15, 0.2], driftSpeed: 0.68, driftAmplitude: 0.13, spin: 0.21, phase: 4.7 },
  { position: [-1.15, -1.55, 0.6], scale: 0.28, tilt: [-0.2, 0.6, 0.45], driftSpeed: 0.58, driftAmplitude: 0.16, spin: -0.15, phase: 5.5 },
]

function Cube({ cube, lowPower }: { cube: Cube; lowPower: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return

    const time = clock.elapsedTime
    const reveal = THREE.MathUtils.smoothstep(sceneState.entrance, 0.15, 1)

    mesh.position.set(
      cube.position[0] * (1 + sceneState.scroll * 0.5),
      cube.position[1] +
        Math.sin(time * cube.driftSpeed + cube.phase) * cube.driftAmplitude -
        sceneState.scroll * 1.1,
      cube.position[2],
    )
    mesh.rotation.set(
      cube.tilt[0] + time * cube.spin * 0.5,
      cube.tilt[1] + time * cube.spin,
      cube.tilt[2] + Math.sin(time * 0.3 + cube.phase) * 0.12,
    )
    mesh.scale.setScalar(cube.scale * reveal)
  })

  return (
    <RoundedBox ref={ref} args={[1, 1, 1]} radius={0.16} smoothness={lowPower ? 2 : 4} renderOrder={2}>
      <meshPhysicalMaterial
        transmission={1}
        thickness={lowPower ? 0.3 : 0.6}
        ior={1.31}
        roughness={0.06}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.05}
        attenuationColor="#dceaf2"
        attenuationDistance={2.4}
        envMapIntensity={1.4}
        transparent
        depthWrite={false}
      />
    </RoundedBox>
  )
}

/** Ice suspended around the glass — real refraction, not a sprite. */
export function IceCubes({ lowPower = false }: { lowPower?: boolean }) {
  const cubes = useMemo(() => (lowPower ? CUBES.slice(0, 3) : CUBES), [lowPower])
  return (
    <>
      {cubes.map((cube, index) => (
        <Cube key={index} cube={cube} lowPower={lowPower} />
      ))}
    </>
  )
}
