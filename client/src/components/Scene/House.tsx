import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { rooms, type RoomData } from '@/types/room'
import { useSensorStore } from '@/store/sensorStore'
import { Room, RoomShell } from './Room'
import { getRoomPlacement, HOUSE_AUXILIARY_LAYOUT } from './house-layout'

interface HouseProps {
  activeRoom?: string
  onRoomSelect?: (id: string) => void
}

/**
 * 提供未传入房间选择回调时的空操作实现。
 *
 * @param _id - 被点击的房间标识。
 * @returns undefined。
 */
const noop = (_id: string) => undefined

export function House({ activeRoom = 'living', onRoomSelect = noop }: HouseProps) {
  const sensorRooms = useSensorStore((state) => state.rooms)

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 13, 15], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#F7F1EC']} />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[8, 14, 7]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-8, 7, -6]} intensity={0.3} color="#FFD6C4" />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.04, 0]}
          receiveShadow
          onClick={(event) => {
            event.stopPropagation()
            onRoomSelect('')
          }}
        >
          <planeGeometry args={[15.6, 11.8]} />
          <meshStandardMaterial color="#EFE7E0" roughness={0.95} />
        </mesh>
        <gridHelper args={[15.6, 16, '#D8C3B7', '#E9DDD5']} position={[0, 0, 0]} />

        {HOUSE_AUXILIARY_LAYOUT.map((space) => (
          <group key={space.id} position={space.position}>
            <RoomShell name={space.name} size={space.size} floorColor={space.floorColor} />
          </group>
        ))}

        {rooms.map((room: RoomData) => {
          const placement = getRoomPlacement(room.id)
          if (!placement) return null

          const sensor = sensorRooms.get(room.id)
          return (
            <group key={room.id} position={placement.position}>
              <Room
                room={room}
                size={placement.size}
                temp={sensor?.temp ?? room.temp}
                humi={sensor?.humi ?? room.humi}
                online={sensor?.status === 'online'}
                selected={activeRoom === room.id}
                onSelect={onRoomSelect}
              />
            </group>
          )
        })}

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.22}
          scale={16}
          blur={2.4}
          far={10}
        />

        <OrbitControls
          enablePan
          target={[0, 0.8, 0]}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={8}
          maxDistance={24}
        />
      </Canvas>
    </div>
  )
}
