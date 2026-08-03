import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createBackdropTexture } from '@/lib/three/textures'
import { sceneState } from '@/lib/sceneState'

const DISTANCE = 14

/**
 * Warm studio plate sitting behind everything. It gives the transmission pass
 * something real to refract — without it the glass would bend empty alpha.
 *
 * Locked to the camera each frame (billboarded at a fixed depth) so the rig's
 * dolly and look-at tilt can never expose an edge.
 */
export function Backdrop() {
  const mesh = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createBackdropTexture(), [])
  const { camera, size } = useThree()

  const forward = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const plane = mesh.current
    if (!plane) return

    const perspective = camera as THREE.PerspectiveCamera
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(perspective.fov) / 2) * DISTANCE
    plane.scale.set(height * (size.width / size.height) * 1.25, height * 1.25, 1)

    forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)
    up.set(0, 1, 0).applyQuaternion(camera.quaternion)

    plane.quaternion.copy(camera.quaternion)
    plane.position
      .copy(camera.position)
      .addScaledVector(forward, DISTANCE)
      // Counter-drift so the backdrop reads as further away than the props.
      .addScaledVector(right, sceneState.pointerX * -0.55)
      .addScaledVector(up, sceneState.pointerY * 0.35 + sceneState.scroll * 0.9)
  })

  return (
    <mesh ref={mesh} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} depthWrite={false} />
    </mesh>
  )
}
