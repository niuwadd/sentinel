import { motion } from "motion/react"
import { FrostedGlass } from "@/components/Common/FrostedGlass"
import { useSensorStore } from "@/store/sensorStore"
import { rooms } from "@/types/room"

export function GlobalStats() {
  const globalStats = useSensorStore((s) => s.globalStats)
  const totalDevices = rooms.reduce((s, r) => s + r.devices, 0)
  const airQuality = "12"
  const airLabel = "优"
  const outdoorTemp = 15

  return (
    <FrostedGlass className="rounded-[2rem] p-5 w-72 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">全屋状态</h2>
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
            Smart Dashboard
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">analytics</span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-white/40">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">device_thermostat</span>
            <span className="text-on-surface-variant text-sm">平均温度</span>
          </div>
          <motion.span
            key={`temp-${globalStats.avgTemp}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-semibold text-primary"
          >
            {globalStats.avgTemp}°C
          </motion.span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-white/30">
            <p className="text-[10px] text-on-surface-variant/60 mb-1">空气质量</p>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-tertiary">{airQuality}</span>
              <span className="text-[10px] mb-1 font-bold text-tertiary/80">{airLabel}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/30">
            <p className="text-[10px] text-on-surface-variant/60 mb-1">室外温度</p>
            <span className="text-xl font-bold text-secondary">{outdoorTemp}°</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-3">
          <span className="text-on-surface-variant/80 text-sm">在线设备</span>
          <motion.span
            key={`devices-${globalStats.onlineCount}`}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-semibold text-on-surface"
          >
            {globalStats.onlineCount} / {totalDevices}
          </motion.span>
        </div>
        <div className="flex items-center justify-between px-3">
          <span className="text-on-surface-variant/80 text-sm">平均湿度</span>
          <motion.span
            key={`humi-${globalStats.avgHumi}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-semibold text-tertiary"
          >
            {globalStats.avgHumi}%
          </motion.span>
        </div>
      </div>

      <div className="pt-5 border-t border-outline-variant/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">温度趋势</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/40">过去24小时</span>
        </div>
        <svg className="w-full h-12" viewBox="0 0 240 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#e2725b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#9f402d" />
            </linearGradient>
          </defs>
          <path d="M0,35 Q30,15 60,28 T120,10 T180,25 T240,15" fill="none" stroke="url(#lineGrad)" strokeLinecap="round" strokeWidth="3" />
          <circle cx="240" cy="15" fill="#9f402d" r="4" />
        </svg>
      </div>
    </FrostedGlass>
  )
}
