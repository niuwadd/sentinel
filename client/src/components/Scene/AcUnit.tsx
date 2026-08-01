import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Mesh } from 'three'

interface AcUnitProps {
  position: [number, number, number]
  on: boolean
}

const VENT_POSITIONS = [-0.28, -0.09, 0.1, 0.29]

export function AcUnit({ position, on }: AcUnitProps) {
  const fan = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (on && fan.current) fan.current.rotation.z += delta * 8
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.42, 0.36]} />
        <meshStandardMaterial color="#FFFDFC" roughness={0.34} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.11, 0.2]}>
        <boxGeometry args={[0.94, 0.045, 0.025]} />
        <meshStandardMaterial color={on ? '#B6E9DD' : '#D2C4BF'} />
      </mesh>
      {VENT_POSITIONS.map((x) => (
        <mesh key={x} position={[x, -0.12, 0.22]}>
          <boxGeometry args={[0.045, 0.08, 0.025]} />
          <meshStandardMaterial color="#9E8B84" roughness={0.72} />
        </mesh>
      ))}
      <mesh ref={fan} position={[0.48, 0.08, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.025, 20]} />
        <meshStandardMaterial
          color={on ? '#70CDBA' : '#BDBDBD'}
          emissive={on ? '#2D8D7A' : '#000000'}
          emissiveIntensity={on ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[0.56, 0.08, 0.21]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          color={on ? '#00A58E' : '#BDBDBD'}
          emissive={on ? '#00A58E' : '#000000'}
          emissiveIntensity={on ? 0.5 : 0}
        />
      </mesh>
    </group>
  )
}
