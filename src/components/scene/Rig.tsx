import { useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from '@/lib/sceneState'

// Sits a little above the product so the crema and rosetta stay readable.
const BASE_CAMERA = new THREE.Vector3(0, 1.85, 9.2)

/**
 * Camera parallax + scroll dolly, and a matching counter-rotation on the props
 * group so the composition feels like a real set rather than a flat billboard.
 */
export function Rig({ children, amplitude = 1 }: { children: ReactNode; amplitude?: number }) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useFrame((_, delta) => {
    const scroll = sceneState.scroll
    const entrance = THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1)

    // Push in slightly on scroll, pull back a touch during the intro.
    const targetX = sceneState.pointerX * 0.42 * amplitude
    const targetY = BASE_CAMERA.y + sceneState.pointerY * -0.26 * amplitude + scroll * 0.55
    const targetZ = BASE_CAMERA.z + (1 - entrance) * 1.8 - scroll * 1.2

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.6, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.6, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.2, delta)
    camera.lookAt(0, 0.42 - scroll * 0.4, 0)

    const stage = group.current
    if (!stage) return
    stage.rotation.y = THREE.MathUtils.damp(
      stage.rotation.y,
      sceneState.pointerX * -0.09 * amplitude,
      2.4,
      delta,
    )
    stage.rotation.x = THREE.MathUtils.damp(
      stage.rotation.x,
      sceneState.pointerY * 0.05 * amplitude,
      2.4,
      delta,
    )
  })

  return <group ref={group}>{children}</group>
}
