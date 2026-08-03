import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createSoftSpriteTexture } from '@/lib/three/textures'
import { sceneState } from '@/lib/sceneState'

const VERTEX_SHADER = /* glsl */ `
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aSway;

  uniform float uTime;
  uniform float uPixelScale;
  uniform float uRise;

  varying float vAlpha;
  varying float vLife;

  void main() {
    // Each particle loops independently through its own life window.
    float life = fract(uTime * aSpeed * 0.09 + aSeed);
    float rise = life * uRise;

    vec3 offset = position;
    float spread = 0.05 + life * 0.55;
    offset.x += sin(uTime * 0.55 + aSeed * 31.4 + rise * 2.3) * spread * aSway;
    offset.z += cos(uTime * 0.47 + aSeed * 22.7 + rise * 1.9) * spread * aSway;
    offset.y += rise;

    vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelScale * (0.45 + life * 2.6) / max(-mvPosition.z, 0.001);

    vAlpha = smoothstep(0.0, 0.16, life) * (1.0 - smoothstep(0.38, 1.0, life));
    vLife = life;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uSprite;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vLife;

  void main() {
    float mask = texture2D(uSprite, gl_PointCoord).a;
    if (mask < 0.01) discard;
    // Cool the plume very slightly as it climbs and thins out.
    vec3 tint = mix(uColor, vec3(1.0), vLife * 0.25);
    gl_FragColor = vec4(tint, mask * vAlpha * uOpacity);
  }
`

/**
 * Steam plume as a GPU point cloud. All motion lives in the vertex shader, so
 * the CPU only pushes a time uniform each frame.
 */
export function Steam({ count = 220, lowPower = false }: { count?: number; lowPower?: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()
  const sprite = useMemo(() => createSoftSpriteTexture(), [])

  const geometry = useMemo(() => {
    const total = lowPower ? Math.round(count * 0.45) : count
    const positions = new Float32Array(total * 3)
    const seeds = new Float32Array(total)
    const speeds = new Float32Array(total)
    const sizes = new Float32Array(total)
    const sways = new Float32Array(total)

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * 0.2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 1.57 + Math.random() * 0.06
      positions[i * 3 + 2] = Math.sin(angle) * radius

      seeds[i] = Math.random()
      speeds[i] = 0.6 + Math.random() * 0.9
      sizes[i] = 9 + Math.random() * 26
      sways[i] = 0.5 + Math.random() * 0.9
    }

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    buffer.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    buffer.setAttribute('aSway', new THREE.BufferAttribute(sways, 1))
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 0), 6)
    return buffer
  }, [count, lowPower])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSprite: { value: sprite },
      uColor: { value: new THREE.Color('#fffaf2') },
      uOpacity: { value: 0.13 },
      uPixelScale: { value: 1 },
      uRise: { value: 1.9 },
    }),
    [sprite],
  )

  useFrame(({ clock }) => {
    const mat = material.current
    if (!mat) return
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uPixelScale.value = (size.height / viewport.height) * 0.06
    // Steam thins out and stops rising as the hero scrolls away.
    mat.uniforms.uOpacity.value =
      0.13 * THREE.MathUtils.smoothstep(sceneState.entrance, 0.2, 1) * (1 - sceneState.scroll * 0.85)
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={4}>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest
      />
    </points>
  )
}
