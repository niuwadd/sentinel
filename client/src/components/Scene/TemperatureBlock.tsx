import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  type Points,
  type ShaderMaterial,
} from 'three'
import { getTemperatureColor } from '@/utils/temperature'

interface TemperatureBlockProps {
  temp: number
  position: [number, number, number]
  size?: number
}

interface GasParticleField {
  positions: Float32Array
  phases: Float32Array
  radii: Float32Array
  speeds: Float32Array
  angles: Float32Array
}

const PARTICLE_COUNT = 140
const GAS_HEIGHT = 1.45

const VERTEX_SHADER = `
  uniform float uPointSize;
  varying float vHeightFade;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uPointSize * (85.0 / -viewPosition.z);
    vHeightFade = 1.0 - smoothstep(0.72, 1.48, position.y);
  }
`

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vHeightFade;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float softParticle = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float alpha = softParticle * uOpacity * vHeightFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`

export function TemperatureBlock({ temp, position, size = 3.35 }: TemperatureBlockProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const targetColor = useRef(new Color(getTemperatureColor(temp)))
  const particleField = useMemo<GasParticleField>(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const phases = new Float32Array(PARTICLE_COUNT)
    const radii = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const angles = new Float32Array(PARTICLE_COUNT)

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const phase = ((index * 47) % PARTICLE_COUNT) / PARTICLE_COUNT
      const radius = 0.18 + (((index * 29) % PARTICLE_COUNT) / PARTICLE_COUNT) * 0.82
      const angle = index * 2.399963
      const offset = index * 3

      phases[index] = phase
      radii[index] = radius
      speeds[index] = 0.045 + ((index * 17) % 11) * 0.004
      angles[index] = angle
      positions[offset] = Math.cos(angle) * radius * size * 0.46
      positions[offset + 1] = phase * GAS_HEIGHT
      positions[offset + 2] = Math.sin(angle) * radius * size * 0.46
    }

    return { positions, phases, radii, speeds, angles }
  }, [size])
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(getTemperatureColor(temp)) },
      uOpacity: { value: 0.22 },
      uPointSize: { value: 2.5 },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const points = pointsRef.current
    const material = materialRef.current
    if (!points || !material) return

    const elapsed = clock.elapsedTime
    const attribute = points.geometry.getAttribute('position') as BufferAttribute
    const positions = attribute.array as Float32Array

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const progress = (particleField.phases[index] + elapsed * particleField.speeds[index]) % 1
      const spiral = particleField.angles[index] + elapsed * 0.22 + progress * Math.PI * 1.4
      const radius = particleField.radii[index] * size * 0.46
      const offset = index * 3

      positions[offset] =
        Math.cos(spiral) * radius + Math.sin(elapsed * 0.38 + index) * size * 0.035
      positions[offset + 1] = progress * GAS_HEIGHT + Math.sin(spiral * 1.7) * 0.06
      positions[offset + 2] =
        Math.sin(spiral) * radius + Math.cos(elapsed * 0.31 + index * 0.7) * size * 0.035
    }

    attribute.needsUpdate = true
    targetColor.current.set(getTemperatureColor(temp))
    material.uniforms.uColor.value.lerp(targetColor.current, 0.06)
    points.rotation.y = Math.sin(elapsed * 0.16) * 0.12
  })

  return (
    <points ref={pointsRef} position={position} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particleField.positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
