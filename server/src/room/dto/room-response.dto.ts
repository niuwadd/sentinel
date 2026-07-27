export interface RoomResponse {
  id: string;
  name: string;
  icon: string;
  currentTemp: number | null;
  currentHumi: number | null;
  status: 'online' | 'offline' | 'fault';
  lastUpdate: string | null;
}

export interface RoomDetailResponse extends RoomResponse {
  devices: number;
  airQuality: number | null;
  outdoorTemp: number | null;
}

export interface RoomHistoryPoint {
  timestamp: string;
  temp: number;
  humi: number;
}
