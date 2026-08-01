import { useEffect, useRef, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSensorData } from '@/hooks/useSensorData'
import { apiService } from '@/services/api.service'

interface TempChartProps {
  roomId: string
}

interface ChartPoint {
  time: string
  temp: number
  humi: number
}

const MAX_POINTS = 60

/**
 * 将 ISO 时间戳格式化为图表横轴的时分标签。
 *
 * @param timestamp - ISO 8601 时间字符串。
 * @returns 形如 "08:30" 的本地时间标签。
 */
function formatChartTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TempChart({ roomId }: TempChartProps) {
  const [points, setPoints] = useState<ChartPoint[]>([])
  const lastTimestamp = useRef('')
  const sensor = useSensorData(roomId)

  useEffect(() => {
    let active = true
    lastTimestamp.current = ''

    apiService
      .getRoomHistory(roomId, '24h')
      .then((history) => {
        if (!active) return
        setPoints(
          history.map((point) => ({
            time: formatChartTime(point.timestamp),
            temp: point.temp,
            humi: point.humi,
          })),
        )
      })
      .catch(() => {
        if (active) setPoints([])
      })

    return () => {
      active = false
    }
  }, [roomId])

  useEffect(() => {
    if (!sensor) return
    if (sensor.timestamp === lastTimestamp.current) return
    lastTimestamp.current = sensor.timestamp

    setPoints((current) => {
      const next = [
        ...current,
        { time: formatChartTime(sensor.timestamp), temp: sensor.temp, humi: sensor.humi },
      ]
      return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next
    })
  }, [sensor])

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(137,114,109,0.15)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={36}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="temp"
            name="温度"
            stroke="#9f402d"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="humi"
            name="湿度"
            stroke="#00a58e"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
