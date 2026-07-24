import type { TabId } from "@/types/tab"

interface MobileNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const items: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home_app_logo" },
  { id: "rooms", label: "Rooms", icon: "grid_view" },
  { id: "stats", label: "Stats", icon: "monitoring" },
  { id: "settings", label: "Settings", icon: "settings" },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border-t border-white/40 rounded-t-[2.5rem] shadow-[0_-12px_48px_rgba(114,90,57,0.08)]">
      {items.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${isActive ? "text-primary" : "text-on-surface-variant/40 hover:text-on-surface-variant/70"}`}
          >
            <span
              className="material-symbols-outlined text-[28px] transition-all"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
