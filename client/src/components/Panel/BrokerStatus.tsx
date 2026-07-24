import { FrostedGlass } from "@/components/Common/FrostedGlass"

export function BrokerStatus() {
  return (
    <div className="flex flex-col gap-3">
      <FrostedGlass className="rounded-2xl px-5 py-3 flex items-center gap-4 group hover:bg-white/60 transition-all cursor-pointer">
        <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(0,165,142,0.6)] group-hover:scale-125 transition-transform" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Local Node</span>
          <span className="text-sm font-semibold text-on-surface">本地节点：已连接</span>
        </div>
      </FrostedGlass>

      <FrostedGlass className="rounded-2xl px-5 py-3 flex items-center gap-4 group hover:bg-white/60 transition-all cursor-pointer">
        <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse group-hover:scale-125 transition-transform" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">Cloud Sync</span>
          <span className="text-sm font-semibold text-on-surface">云端节点：同步中</span>
        </div>
      </FrostedGlass>
    </div>
  )
}
