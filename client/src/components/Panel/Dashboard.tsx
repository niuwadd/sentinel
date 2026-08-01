import { motion } from 'motion/react'
import { FrostedGlass } from '@/components/Common/FrostedGlass'
import { AiBubble } from '@/components/Panel/AiBubble'
import { BrokerStatus } from '@/components/Panel/BrokerStatus'
import { DeviceCard } from '@/components/Panel/DeviceCard'
import { TempChart } from '@/components/Panel/TempChart'
import { useSensorData } from '@/hooks/useSensorData'
import { rooms } from '@/types/room'

interface DashboardProps {
  roomId: string
  onClose: () => void
}

const STATUS_LABEL: Record<'online' | 'offline' | 'fault', string> = {
  online: '在线',
  offline: '离线',
  fault: '故障',
}

export function Dashboard({ roomId, onClose }: DashboardProps) {
  const room = rooms.find((r) => r.id === roomId)
  const sensor = useSensorData(roomId)
  if (!room) return null

  const temp = sensor?.temp ?? room.temp
  const status = sensor?.status ?? 'offline'
  const online = status === 'online'

  return (
    <FrostedGlass className="w-80 rounded-[2rem] p-5 space-y-5 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">{room.icon}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-on-surface">{room.name}</h2>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                online
                  ? 'text-tertiary'
                  : status === 'fault'
                    ? 'text-error'
                    : 'text-on-surface-variant/60'
              }`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭面板"
          className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">close</span>
        </button>
      </div>

      <div className="flex items-end justify-between p-3 rounded-2xl bg-white/40 border border-white/40">
        <span className="text-on-surface-variant text-sm">当前温度</span>
        <motion.span
          key={`temp-${temp}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-4xl font-semibold text-primary"
        >
          {temp.toFixed(1)}°C
        </motion.span>
      </div>

      <DeviceCard roomId={roomId} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              温度趋势
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/40">过去24小时</span>
        </div>
        <TempChart roomId={roomId} />
      </div>

      <div>
        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">
          连接状态
        </p>
        <BrokerStatus />
      </div>

      <AiBubble />
    </FrostedGlass>
  )
}
