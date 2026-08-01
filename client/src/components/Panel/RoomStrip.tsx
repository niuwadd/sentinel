import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { rooms } from "@/types/room"
import { useSensorStore } from "@/store/sensorStore"

interface RoomStripProps {
  activeRoom: string
  onRoomSelect: (id: string) => void
}

export function RoomStrip({ activeRoom, onRoomSelect }: RoomStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const indicatorRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  const roomsMap = useSensorStore((s) => s.rooms)

  const moveIndicator = (id: string, instant = false) => {
    const card = id ? cardsRef.current.get(id) : undefined
    const strip = stripRef.current
    const indicator = indicatorRef.current
    if (!card || !strip || !indicator) {
      if (indicator) {
        gsap.to(indicator, {
          opacity: 0,
          duration: instant ? 0 : 0.35,
          ease: "power3.out",
        })
      }
      return
    }

    const stripRect = strip.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const offsetLeft = cardRect.left - stripRect.left + strip.scrollLeft

    gsap.to(indicator, {
      x: offsetLeft,
      width: cardRect.width,
      opacity: 1,
      duration: instant ? 0 : 0.45,
      ease: "power3.out",
    })
  }

  useEffect(() => {
    if (!ready) return
    moveIndicator(activeRoom)
  }, [activeRoom, ready])

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      moveIndicator(activeRoom, true)
      setReady(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!ready) return
    const onResize = () => moveIndicator(activeRoom, true)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [activeRoom, ready])

  const setCardRef = (id: string, el: HTMLButtonElement | null) => {
    if (el) cardsRef.current.set(id, el)
    else cardsRef.current.delete(id)
  }

  return (
    <div ref={stripRef} className="relative flex items-center gap-6 overflow-x-auto pb-6 pt-4 mask-fade-edges scrollbar-none">
      <div
        ref={indicatorRef}
        className="absolute top-4 h-[calc(100%-2rem)] bg-primary rounded-[2rem] z-0 pointer-events-none"
      />

      {rooms.map((room) => {
        const isActive = activeRoom === room.id
        const sensor = roomsMap.get(room.id)
        const temp = sensor?.temp ?? room.temp
        const deviceIcons = room.hasAc ? ['lightbulb', 'air'] : ['lightbulb', 'tv']

        return (
          <button
            key={room.id}
            ref={(el) => setCardRef(room.id, el)}
            onClick={() => onRoomSelect(room.id)}
            className={`flex-shrink-0 w-44 rounded-[2rem] p-5 cursor-pointer transition-colors relative z-10 ${
              isActive ? "bg-transparent" : "bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border border-white/40"
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
              isActive ? "bg-white/20" : "bg-surface-variant/50 group-hover:bg-primary/10"
            }`}>
              <span
                className={`material-symbols-outlined transition-colors ${
                  isActive ? "text-white" : "text-on-surface-variant"
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {room.icon}
              </span>
            </div>
            <span className={`inline-block mt-4 px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
              isActive ? "bg-white/20 text-white" : "bg-primary-container/20 text-primary"
            }`}>
              {temp}°C
            </span>
            <p className={`text-xl font-semibold mt-3 text-left transition-colors ${
              isActive ? "text-white" : "text-on-surface"
            }`}>
              {room.name}
            </p>
            <div className={`flex items-center justify-between mt-4 transition-opacity ${
              isActive ? "" : "opacity-60"
            }`}>
              <div className="flex gap-2">
                {deviceIcons.map((icon) => (
                  <span key={icon} className={`material-symbols-outlined text-[16px] transition-colors ${
                    isActive ? "text-white" : "text-tertiary"
                  }`}>{icon}</span>
                ))}
              </div>
              <span className={`text-[10px] font-bold uppercase transition-colors ${
                isActive ? "text-white/60" : "text-on-surface-variant/40"
              }`}>
                {room.devices} 设备
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
