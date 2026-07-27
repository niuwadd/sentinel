import { FrostedGlass } from "@/components/Common/FrostedGlass"
import { useSensorStore } from "@/store/sensorStore"

export function BrokerStatus() {
  const brokerHealth = useSensorStore((s) => s.brokerHealth)
  const activeBroker = useSensorStore((s) => s.globalStats.activeBroker)

  const localOnline = brokerHealth.local
  const cloudOnline = brokerHealth.cloud
  const activeLabel = activeBroker === "local" ? "当前连接" : activeBroker === "cloud" ? "当前连接" : "未连接"

  const localStatus = localOnline ? "已连接" : "已断开"
  const localDotClass = localOnline
    ? "bg-tertiary shadow-[0_0_8px_rgba(0,165,142,0.6)]"
    : "bg-error animate-pulse"
  const localActive = activeBroker === "local" ? activeLabel : ""

  const cloudStatus = cloudOnline ? "已连接" : "已断开"
  const cloudDotClass = cloudOnline
    ? "bg-tertiary shadow-[0_0_8px_rgba(0,165,142,0.6)]"
    : "bg-primary-container animate-pulse"
  const cloudActive = activeBroker === "cloud" ? activeLabel : ""

  return (
    <div className="flex flex-col gap-3">
      <FrostedGlass className="rounded-2xl px-5 py-3 flex items-center gap-4 group hover:bg-white/60 transition-all cursor-pointer">
        <div className={`w-2 h-2 rounded-full ${localDotClass} group-hover:scale-125 transition-transform`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Local Node</span>
          <span className="text-sm font-semibold text-on-surface">
            本地节点：{localStatus}{localActive && ` (${localActive})`}
          </span>
        </div>
      </FrostedGlass>

      <FrostedGlass className="rounded-2xl px-5 py-3 flex items-center gap-4 group hover:bg-white/60 transition-all cursor-pointer">
        <div className={`w-2 h-2 rounded-full ${cloudDotClass} group-hover:scale-125 transition-transform`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Cloud Sync</span>
          <span className="text-sm font-semibold text-on-surface">
            云端节点：{cloudStatus}{cloudActive && ` (${cloudActive})`}
          </span>
        </div>
      </FrostedGlass>
    </div>
  )
}