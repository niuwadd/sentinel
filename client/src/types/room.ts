export interface RoomData {
  id: string
  name: string
  icon: string
  temp: number
  humi: number
  devices: number
  airQuality: number
  outdoorTemp: number
  hasAc: boolean
}

export const rooms: RoomData[] = [
  {
    id: 'bedroom-a',
    name: '卧室 A',
    icon: 'bed',
    temp: 23,
    humi: 52,
    devices: 2,
    airQuality: 9,
    outdoorTemp: 15,
    hasAc: true,
  },
  {
    id: 'nursery',
    name: '婴儿房',
    icon: 'child_care',
    temp: 23.5,
    humi: 48,
    devices: 5,
    airQuality: 11,
    outdoorTemp: 15,
    hasAc: true,
  },
  {
    id: 'bedroom',
    name: '主卧',
    icon: 'bedroom_parent',
    temp: 22,
    humi: 50,
    devices: 3,
    airQuality: 8,
    outdoorTemp: 15,
    hasAc: true,
  },
  {
    id: 'living',
    name: '客厅',
    icon: 'chair',
    temp: 24,
    humi: 45,
    devices: 6,
    airQuality: 12,
    outdoorTemp: 15,
    hasAc: false,
  },
]
