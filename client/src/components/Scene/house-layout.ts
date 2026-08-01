export interface RoomPlacement {
  roomId: string
  position: [number, number, number]
  size: [number, number]
}

export interface AuxiliaryRoomPlacement {
  id: string
  name: string
  position: [number, number, number]
  size: [number, number]
  floorColor?: string
}

export const HOUSE_ROOM_LAYOUT: readonly RoomPlacement[] = [
  { roomId: 'bedroom-a', position: [-1.56, 0, -0.69], size: [2.86, 3.25] },
  { roomId: 'nursery', position: [-4.49, 0, -0.13], size: [2.99, 3.13] },
  { roomId: 'bedroom', position: [-4.29, 0, 3.19], size: [3.38, 3.5] },
  { roomId: 'living', position: [1.82, 0, -0.13], size: [3.9, 4.38] },
]

export const HOUSE_AUXILIARY_LAYOUT: readonly AuxiliaryRoomPlacement[] = [
  {
    id: 'balcony',
    name: '阳台',
    position: [0, 0, -3.63],
    size: [6.5, 2.63],
    floorColor: '#EEF2E5',
  },
  {
    id: 'corridor',
    name: '过道',
    position: [-2.15, 0, 1.56],
    size: [4.03, 1.25],
    floorColor: '#F3E9DC',
  },
  {
    id: 'bath',
    name: '卫生间',
    position: [-1.3, 0, 3.06],
    size: [2.6, 2],
    floorColor: '#E8ECEB',
  },
  {
    id: 'kitchen',
    name: '厨房',
    position: [1.04, 0, 3.5],
    size: [2.08, 2.88],
    floorColor: '#E8ECEB',
  },
  {
    id: 'foyer',
    name: '门厅',
    position: [4.03, 0, 3.5],
    size: [3.9, 2.88],
    floorColor: '#F3E9DC',
  },
]

/**
 * 根据房间标识获取参考户型中的 3D 布局。
 *
 * @param roomId - MQTT 与前端共用的房间标识。
 * @returns 房间位置和尺寸，不存在时返回 undefined。
 */
export function getRoomPlacement(roomId: string): RoomPlacement | undefined {
  return HOUSE_ROOM_LAYOUT.find((placement) => placement.roomId === roomId)
}
