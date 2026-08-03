import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from '@/lib/sceneState'

/** Cream podium the glass hovers over, with a soft painted contact pool. */
export function Pedestal() {
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const mesh = group.current
    if (!mesh) return
    const reveal = THREE.MathUtils.smoothstep(sceneState.entrance, 0.25, 1)
    mesh.position.y = -0.3 + Math.sin(clock.elapsedTime * 0.4) * 0.012 - sceneState.scroll * 1.5
    mesh.scale.set(reveal, reveal, reveal)
  })

  return (
    <group ref={group} position={[0, -0.3, 0]}>
      <mesh position={[0, -0.09, 0]}>
        <cylinderGeometry args={[0.88, 0.92, 0.18, 96]} />
        <meshPhysicalMaterial
          color="#cbaf8d"
          roughness={0.46}
          metalness={0.05}
          clearcoat={0.45}
          clearcoatRoughness={0.38}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Gold inlay ring around the podium edge. */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.81, 0.89, 96]} />
        <meshPhysicalMaterial
          color="#d8ac5c"
          metalness={1}
          roughness={0.26}
          envMapIntensity={2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Faked ambient occlusion pool so the cup reads as grounded. */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 64]} />
        <meshBasicMaterial color="#7d5528" transparent opacity={0.32} depthWrite={false} />
      </mesh>
    </group>
  )
}
