export function getTemperatureColor(temp: number): string {
  if (temp < 18) return '#2196F3'
  if (temp < 22) return '#4FC3F7'
  if (temp <= 26) return '#4CAF50'
  if (temp <= 30) return '#FF9800'
  return '#F44336'
}
