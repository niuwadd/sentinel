import { FrostedGlass } from "@/components/Common/FrostedGlass"

const navItems = [
  { label: "主控中心", active: true },
  { label: "场景库", active: false },
  { label: "能源统计", active: false },
]

export function Header() {
  return (
    <FrostedGlass
      as="header"
      className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4"
    >
      <div className="flex items-center gap-2 text-primary font-semibold text-lg">
        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          fluid_med
        </span>
        ClimeLens
      </div>

      <nav className="hidden md:flex items-center gap-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={
              item.active
                ? "text-primary font-bold px-6 py-2 bg-primary-container/10 hover:bg-primary-container/20 transition-all rounded-full active:scale-95"
                : "text-on-surface-variant/70 px-6 py-2 hover:bg-primary-container/10 transition-all rounded-full active:scale-95"
            }
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
        </button>
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors relative">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
        </button>
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[20px]">person</span>
          </div>
        </div>
      </div>
    </FrostedGlass>
  )
}
