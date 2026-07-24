import { FrostedGlass } from "@/components/Common/FrostedGlass"

export function AiBubble() {
  return (
    <div className="max-w-xs group cursor-help">
      <FrostedGlass className="rounded-3xl p-5 relative border-white/60 shadow-xl transition-all group-hover:translate-y-[-4px]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-[10px] text-primary uppercase tracking-wider">AI 智能助手</p>
              <span className="inline-block w-1 h-1 rounded-full bg-primary/30" />
              <span className="text-[10px] text-on-surface-variant/40">刚才</span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
              检测到室外气温下降，已为您调高卧室温度 1°C。建议保持当前"舒适平衡"模式。
            </p>
          </div>
        </div>
        <div className="absolute -bottom-2 right-8 w-6 h-6 bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] transform rotate-45 border-r border-b border-white/20" />
      </FrostedGlass>
    </div>
  )
}
