export interface RoomData {
  id: string
  name: string
  icon: string
  temp: number
  humi: number
  devices: number
  airQuality: number
  outdoorTemp: number
}

export const rooms: RoomData[] = [
  { id: "bedroom", name: "主卧", icon: "bedroom_parent", temp: 22, humi: 50, devices: 3, airQuality: 8, outdoorTemp: 15 },
  { id: "living", name: "客厅", icon: "chair", temp: 24, humi: 45, devices: 6, airQuality: 12, outdoorTemp: 15 },
  { id: "kitchen", name: "厨房", icon: "flatware", temp: 23, humi: 55, devices: 2, airQuality: 10, outdoorTemp: 15 },
  { id: "bath", name: "浴室", icon: "bathtub", temp: 26, humi: 62, devices: 4, airQuality: 9, outdoorTemp: 15 },
  { id: "nursery", name: "婴儿房", icon: "child_care", temp: 23.5, humi: 48, devices: 5, airQuality: 11, outdoorTemp: 15 },
]
