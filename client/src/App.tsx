import { useState } from "react";
import FadeContent from "@/components/FadeContent";
import { MobileNav } from "@/components/MobileNav";
import { GlobalStats } from "@/components/Panel/GlobalStats";
import { RoomStrip } from "@/components/Panel/RoomStrip";
import { useMqtt } from "@/hooks/useMqtt";
import type { TabId } from "@/types/tab";
import { rooms } from "@/types/room";

function HomeView({
  activeRoom,
  onRoomSelect,
}: {
  activeRoom: string;
  onRoomSelect: (id: string) => void;
}) {
  return (
    <main className="flex-grow relative z-10 flex items-center justify-center">
      <div className="w-full h-full bg-[linear-gradient(rgba(137,114,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(137,114,109,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <FadeContent
        blur
        duration={800}
        threshold={0}
        initialOpacity={0}
        className="absolute top-6 left-6"
      >
        <GlobalStats activeRoom={activeRoom} />
      </FadeContent>

      <FadeContent
        blur
        duration={800}
        delay={200}
        threshold={0}
        initialOpacity={0}
        className="absolute bottom-10 left-0 w-full px-6"
      >
        <RoomStrip activeRoom={activeRoom} onRoomSelect={onRoomSelect} />
      </FadeContent>
    </main>
  );
}

function RoomsView({
  activeRoom,
  onRoomSelect,
}: {
  activeRoom: string;
  onRoomSelect: (id: string) => void;
}) {
  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start pt-20 px-6">
      <h2 className="text-2xl font-semibold text-on-surface mb-6">所有房间</h2>
      <div className="w-full max-w-lg space-y-4">
        {rooms.map(
          (room: {
            id: string;
            name: string;
            temp: number;
            icon: string;
            humi: number;
          }) => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all cursor-pointer
              ${
                activeRoom === room.id
                  ? "bg-primary text-on-primary shadow-2xl shadow-primary/20"
                  : "bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border border-white/40 shadow-[0_12px_48px_rgba(114,90,57,0.12)]"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeRoom === room.id ? "bg-white/20" : "bg-primary-container/20"}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    activeRoom === room.id
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {room.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{room.name}</p>
                <p
                  className={`text-sm ${activeRoom === room.id ? "text-white/70" : "text-on-surface-variant/70"}`}
                >
                  {room.temp}°C · 湿度 {room.humi}%
                </p>
              </div>
              <span
                className={`text-lg font-semibold ${activeRoom === room.id ? "text-white" : "text-primary"}`}
              >
                {room.temp}°
              </span>
            </button>
          ),
        )}
      </div>
    </main>
  );
}

function StatsView() {
  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start pt-20 px-6">
      <h2 className="text-2xl font-semibold text-on-surface mb-6">能源统计</h2>
      <div className="w-full max-w-lg grid grid-cols-2 gap-4">
        {[
          {
            label: "今日用电",
            value: "12.4 kWh",
            icon: "bolt",
            color: "text-primary",
          },
          {
            label: "本月电费",
            value: "¥186",
            icon: "payments",
            color: "text-secondary",
          },
          {
            label: "CO₂ 减排",
            value: "3.2 kg",
            icon: "eco",
            color: "text-tertiary",
          },
          {
            label: "设备效率",
            value: "92%",
            icon: "speed",
            color: "text-primary",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border border-white/40 shadow-[0_12px_48px_rgba(114,90,57,0.12)]"
          >
            <span
              className={`material-symbols-outlined ${stat.color} text-[28px]`}
            >
              {stat.icon}
            </span>
            <p className="text-2xl font-bold text-on-surface mt-2">
              {stat.value}
            </p>
            <p className="text-sm text-on-surface-variant/70">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg mt-6 p-4 rounded-2xl bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border border-white/40">
        <p className="text-sm font-semibold text-on-surface mb-3">
          本周温度趋势
        </p>
        <svg
          className="w-full h-16"
          viewBox="0 0 300 50"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9f402d" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#9f402d" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 Q20,30 40,35 T80,20 T120,25 T160,10 T200,18 T240,8 T280,15 T300,12"
            fill="none"
            stroke="#9f402d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M0,40 Q20,30 40,35 T80,20 T120,25 T160,10 T200,18 T240,8 T280,15 T300,12"
            fill="url(#statsGrad)"
            stroke="none"
          />
        </svg>
      </div>
    </main>
  );
}

function SettingsView() {
  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start pt-20 px-6">
      <h2 className="text-2xl font-semibold text-on-surface mb-6">设置</h2>
      <div className="w-full max-w-lg space-y-3">
        {[
          { label: "温度单位", value: "°C", icon: "device_thermostat" },
          { label: "AI 自动温控", value: "已开启", icon: "auto_awesome" },
          { label: "通知", value: "开启", icon: "notifications" },
          { label: "黑暗模式", value: "跟随系统", icon: "dark_mode" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,248,246,0.45)] backdrop-blur-[32px] border border-white/40 shadow-[0_12px_48px_rgba(114,90,57,0.12)]"
          >
            <span className="material-symbols-outlined text-primary">
              {item.icon}
            </span>
            <span className="flex-1 text-on-surface font-medium">
              {item.label}
            </span>
            <span className="text-sm text-on-surface-variant/70">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activeRoom, setActiveRoom] = useState("living");
  const _ = useMqtt(); void _;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {activeTab === "home" && (
        <HomeView activeRoom={activeRoom} onRoomSelect={setActiveRoom} />
      )}
      {activeTab === "rooms" && (
        <RoomsView activeRoom={activeRoom} onRoomSelect={setActiveRoom} />
      )}
      {activeTab === "stats" && <StatsView />}
      {activeTab === "settings" && <SettingsView />}

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
