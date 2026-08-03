import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createMilkSwirlCurve, createRibbonGeometry } from '@/lib/three/geometry'
import { sceneState } from '@/lib/sceneState'

const DROPLET_COUNT = 22

/**
 * The milk pour: a wide ribbon spiralling around the glass, trailed by a few
 * suspended droplets to sell the frozen-splash moment from the reference.
 */
export function MilkSwirl({ lowPower = false }: { lowPower?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const droplets = useRef<THREE.InstancedMesh>(null)

  const geometry = useMemo(() => {
    const curve = createMilkSwirlCurve()
    return createRibbonGeometry(
      curve,
      lowPower ? 90 : 200,
      (t) => 0.04 + Math.sin(t * Math.PI) ** 0.75 * 0.21,
      (t) => -0.5 + t * Math.PI * 1.6,
    )
  }, [lowPower])

  const dropletData = useMemo(
    () =>
      Array.from({ length: DROPLET_COUNT }, () => ({
        origin: new THREE.Vector3(
          (Math.random() - 0.5) * 4.2,
          -0.5 + Math.random() * 2.6,
          (Math.random() - 0.5) * 1.8,
        ),
        scale: 0.018 + Math.random() * 0.038,
        speed: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime
    const reveal = THREE.MathUtils.smoothstep(sceneState.entrance, 0.1, 0.9)

    const ribbon = group.current
    if (ribbon) {
      ribbon.rotation.y = THREE.MathUtils.damp(
        ribbon.rotation.y,
        -0.3 + Math.sin(time * 0.16) * 0.1 + sceneState.pointerX * 0.12 + sceneState.scroll * 0.7,
        2.2,
        delta,
      )
      ribbon.position.y = Math.sin(time * 0.4) * 0.04 - sceneState.scroll * 1.2
      ribbon.scale.setScalar(0.85 + reveal * 0.25)
    }

    const instanced = droplets.current
    if (instanced) {
      for (let i = 0; i < dropletData.length; i++) {
        const drop = dropletData[i]
        dummy.position.set(
          drop.origin.x + Math.sin(time * drop.speed * 0.6 + drop.phase) * 0.14,
          drop.origin.y + Math.sin(time * drop.speed + drop.phase) * 0.2 - sceneState.scroll * 1.2,
          drop.origin.z + Math.cos(time * drop.speed * 0.5 + drop.phase) * 0.12,
        )
        dummy.scale.setScalar(drop.scale * reveal)
        dummy.updateMatrix()
        instanced.setMatrixAt(i, dummy.matrix)
      }
      instanced.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {/* Nudged behind the glass so the pour reads as depth, not an overlay. */}
      <group ref={group} position={[0, 0, -1.0]}>
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            color="#fbf1e4"
            roughness={0.16}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            sheen={0.6}
            sheenColor="#ffe6c4"
            envMapIntensity={1.1}
            side={THREE.DoubleSide}
            transparent
            opacity={0.72}
          />
        </mesh>
      </group>

      <instancedMesh ref={droplets} args={[undefined, undefined, DROPLET_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshPhysicalMaterial
          color="#f6e8d5"
          roughness={0.2}
          clearcoat={1}
          envMapIntensity={0.9}
          transparent
          opacity={0.72}
        />
      </instancedMesh>
    </>
  )
}
