import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGoldRibbonCurves, createRibbonGeometry } from '@/lib/three/geometry'
import { sceneState } from '@/lib/sceneState'

/**
 * Brushed-gold swooshes sweeping behind the cup. Each is a Frenet-framed ribbon
 * with a metallic material, so the highlight travels as the group rotates.
 */
export function GoldRibbons({ lowPower = false }: { lowPower?: boolean }) {
  const group = useRef<THREE.Group>(null)

  const ribbons = useMemo(() => {
    const segments = lowPower ? 90 : 220
    return createGoldRibbonCurves().map(({ curve, width, twist }) =>
      createRibbonGeometry(curve, segments, width, twist),
    )
  }, [lowPower])

  useFrame(({ clock }, delta) => {
    const mesh = group.current
    if (!mesh) return

    const time = clock.elapsedTime
    mesh.rotation.y = THREE.MathUtils.damp(
      mesh.rotation.y,
      Math.sin(time * 0.12) * 0.16 + sceneState.pointerX * 0.1 + sceneState.scroll * 0.5,
      2,
      delta,
    )
    mesh.rotation.x = THREE.MathUtils.damp(
      mesh.rotation.x,
      Math.sin(time * 0.09) * 0.06 + sceneState.pointerY * 0.05,
      2,
      delta,
    )
    mesh.position.y = -sceneState.scroll * 1.4
    mesh.scale.setScalar(0.6 + THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1) * 0.4)
  })

  return (
    <group ref={group}>
      {ribbons.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshPhysicalMaterial
            color={index === 2 ? '#eccf94' : '#cfa257'}
            metalness={1}
            roughness={index === 2 ? 0.16 : 0.28}
            clearcoat={0.9}
            clearcoatRoughness={0.22}
            envMapIntensity={2.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
