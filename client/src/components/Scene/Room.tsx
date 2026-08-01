import { useState } from 'react'
import { Html, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { RoomData } from '@/types/room'
import { TemperatureBlock } from './TemperatureBlock'
import { AcUnit } from './AcUnit'

interface RoomProps {
  room: RoomData
  size: [number, number]
  temp: number | null
  humi: number | null
  online: boolean
  selected: boolean
  onSelect: (id: string) => void
}

interface RoomShellProps {
  name: string
  size: [number, number]
  floorColor?: string
}

interface RoomArchitectureProps {
  size: [number, number]
  selected?: boolean
  floorColor?: string
}

const WALL_HEIGHT = 1.2
const WALL_THICKNESS = 0.15

function RoomArchitecture({
  size,
  selected = false,
  floorColor = '#FAF3EE',
}: RoomArchitectureProps) {
  const [roomWidth, roomDepth] = size
  const selectedFloorColor = selected ? '#FFE6CC' : floorColor
  const wallColor = selected ? '#FFB74D' : '#EAD9CF'
  const xWalls: [number, number][] = [
    [-roomWidth / 2, 0],
    [roomWidth / 2, 0],
  ]
  const zWalls: [number, number][] = [
    [0, -roomDepth / 2],
    [0, roomDepth / 2],
  ]

  return (
    <>
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[roomWidth, 0.08, roomDepth]} />
        <meshStandardMaterial color={selectedFloorColor} roughness={0.86} />
      </mesh>

      {xWalls.map(([x, z], index) => (
        <mesh key={`x${index}`} position={[x, WALL_HEIGHT / 2, z]} castShadow>
          <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, roomDepth]} />
          <meshStandardMaterial
            color={wallColor}
            emissive={selected ? '#FFB74D' : '#000000'}
            emissiveIntensity={selected ? 0.3 : 0}
          />
        </mesh>
      ))}

      {zWalls.map(([x, z], index) => (
        <mesh key={`z${index}`} position={[x, WALL_HEIGHT / 2, z]} castShadow>
          <boxGeometry args={[roomWidth, WALL_HEIGHT, WALL_THICKNESS]} />
          <meshStandardMaterial
            color={wallColor}
            emissive={selected ? '#FFB74D' : '#000000'}
            emissiveIntensity={selected ? 0.3 : 0}
          />
        </mesh>
      ))}
    </>
  )
}

export function RoomShell({ name, size, floorColor }: RoomShellProps) {
  return (
    <group>
      <RoomArchitecture size={size} floorColor={floorColor} />
      <Html position={[0, WALL_HEIGHT + 0.18, 0]} center style={{ pointerEvents: 'none' }}>
        <span className="whitespace-nowrap text-[10px] font-medium text-on-surface-variant/65 drop-shadow">
          {name}
        </span>
      </Html>
    </group>
  )
}

export function Room({ room, size, temp, humi, online, selected, onSelect }: RoomProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered, 'pointer')

  /**
   * 处理房间模型点击并阻止事件冒泡到其他场景对象。
   *
   * @param event - React Three Fiber 指针事件。
   * @returns 无返回值。
   */
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(room.id)
  }

  const [roomWidth, roomDepth] = size
  const label = temp != null ? `${temp.toFixed(1)}°C` : '--'
  const sub = humi != null ? `湿度 ${humi.toFixed(0)}%` : online ? '在线' : '离线'
  const gasSize = Math.max(1.5, Math.min(roomWidth, roomDepth) * 0.82)

  return (
    <group
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoomArchitecture size={size} selected={selected} />

      <TemperatureBlock temp={temp ?? 22} position={[0, 0.08, 0]} size={gasSize} />

      <Html position={[0, WALL_HEIGHT + 1.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="flex -translate-y-2 select-none flex-col items-center">
          <span className="whitespace-nowrap text-sm font-semibold text-on-surface drop-shadow">
            {room.name}
          </span>
          <span
            className={`whitespace-nowrap text-base font-bold drop-shadow ${online ? 'text-primary' : 'text-on-surface-variant/60'}`}
          >
            {label}
          </span>
          <span className="whitespace-nowrap text-[10px] text-on-surface-variant/70 drop-shadow">
            {sub}
          </span>
        </div>
      </Html>

      {room.hasAc && <AcUnit position={[0, WALL_HEIGHT - 0.1, -roomDepth / 2 + 0.28]} on={online} />}
    </group>
  )
}
