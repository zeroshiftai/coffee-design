import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBeanGeometry } from '@/lib/three/geometry'
import { sceneState } from '@/lib/sceneState'

type Bean = {
  radius: number
  height: number
  angle: number
  orbitSpeed: number
  scale: number
  bobAmplitude: number
  bobSpeed: number
  spin: THREE.Vector3
  phase: number
  depth: number
}

function createBeans(count: number): Bean[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / count
    return {
      radius: 1.6 + (i % 4) * 0.52 + Math.random() * 0.35,
      height: -1.25 + Math.random() * 2.9,
      angle: t * Math.PI * 2 + Math.random() * 0.7,
      orbitSpeed: (0.07 + Math.random() * 0.11) * (Math.random() > 0.72 ? -1 : 1),
      scale: 0.17 + Math.random() * 0.2,
      bobAmplitude: 0.1 + Math.random() * 0.2,
      bobSpeed: 0.45 + Math.random() * 0.6,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 0.4,
      ),
      phase: Math.random() * Math.PI * 2,
      depth: -1.4 + Math.random() * 2.2,
    }
  })
}

/**
 * Beans orbiting the glass on independent rings. One InstancedMesh, so the
 * whole swarm costs a single draw call.
 */
export function Beans({ count = 16 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => createBeanGeometry(), [])
  const beans = useMemo(() => createBeans(count), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const instanced = mesh.current
    if (!instanced) return

    const time = clock.elapsedTime
    // Beans drift outward and settle lower as the hero scrolls out.
    const disperse = 1 + sceneState.scroll * 0.85
    const reveal = THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1)

    for (let i = 0; i < beans.length; i++) {
      const bean = beans[i]
      const angle = bean.angle + time * bean.orbitSpeed
      const radius = bean.radius * disperse

      dummy.position.set(
        Math.cos(angle) * radius,
        bean.height +
          Math.sin(time * bean.bobSpeed + bean.phase) * bean.bobAmplitude -
          sceneState.scroll * 0.9,
        Math.sin(angle) * radius * 0.62 + bean.depth * 0.35,
      )

      dummy.rotation.set(
        bean.spin.x * time + bean.phase,
        bean.spin.y * time,
        bean.spin.z * time,
      )

      const pop = THREE.MathUtils.clamp(reveal * 1.6 - i / beans.length, 0, 1)
      dummy.scale.setScalar(bean.scale * pop)
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)
    }

    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial vertexColors roughness={0.62} metalness={0.04} envMapIntensity={0.7} />
    </instancedMesh>
  )
}
