import { useState } from 'react'
import type { AcCommand } from '@climelens/shared'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { apiService } from '@/services/api.service'
import { rooms } from '@/types/room'

interface DeviceCardProps {
  roomId: string
}

type AcMode = 'cool' | 'heat' | 'fan' | 'auto'
type FanSpeed = 'low' | 'mid' | 'high' | 'auto'

const MODES: { value: AcMode; label: string }[] = [
  { value: 'cool', label: '制冷' },
  { value: 'heat', label: '制热' },
  { value: 'fan', label: '送风' },
  { value: 'auto', label: '自动' },
]

const FAN_SPEEDS: { value: FanSpeed; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'mid', label: '中' },
  { value: 'high', label: '高' },
  { value: 'auto', label: '自动' },
]

/**
 * 将 Slider 回调的标量或数组值归一为单个数值。
 *
 * @param value - Slider 上报的值，可能为数字或数字数组。
 * @returns 归一后的单个数值，空数组时返回 0。
 */
function toSingleValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : value
}

export function DeviceCard({ roomId }: DeviceCardProps) {
  const room = rooms.find((r) => r.id === roomId)
  const [power, setPower] = useState<'on' | 'off'>('on')
  const [mode, setMode] = useState<AcMode>('cool')
  const [targetTemp, setTargetTemp] = useState(24)
  const [fanSpeed, setFanSpeed] = useState<FanSpeed>('auto')
  const [swing, setSwing] = useState(false)

  if (!room || !room.hasAc) {
    return (
      <div className="rounded-2xl bg-white/30 p-4">
        <p className="text-sm text-on-surface-variant">该房间未安装空调设备</p>
      </div>
    )
  }

  /**
   * 将当前控制状态组合为指令并下发给后端。
   *
   * @param command - 空调控制指令。
   * @returns 无返回值。
   */
  const send = (command: AcCommand) => {
    apiService.controlAc(roomId, command).catch(() => undefined)
  }

  const togglePower = (checked: boolean) => {
    const next: 'on' | 'off' = checked ? 'on' : 'off'
    setPower(next)
    send({ power: next, mode, targetTemp, fanSpeed, swing })
  }

  const changeMode = (next: AcMode) => {
    setMode(next)
    send({ power, mode: next, targetTemp, fanSpeed, swing })
  }

  const changeFanSpeed = (next: FanSpeed) => {
    setFanSpeed(next)
    send({ power, mode, targetTemp, fanSpeed: next, swing })
  }

  const commitTemp = (value: number | readonly number[]) => {
    const next = toSingleValue(value)
    setTargetTemp(next)
    send({ power, mode, targetTemp: next, fanSpeed, swing })
  }

  const toggleSwing = (checked: boolean) => {
    setSwing(checked)
    send({ power, mode, targetTemp, fanSpeed, swing: checked })
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">air</span>
          <span className="text-sm font-semibold text-on-surface">空调控制</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${
              power === 'on' ? 'text-tertiary' : 'text-on-surface-variant/60'
            }`}
          >
            {power === 'on' ? '运行中' : '已关闭'}
          </span>
          <Switch checked={power === 'on'} onCheckedChange={togglePower} size="sm" />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">
          工作模式
        </p>
        <div className="grid grid-cols-4 gap-2">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => changeMode(item.value)}
              className={`rounded-full py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                mode === item.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white/50 text-on-surface-variant hover:bg-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
            目标温度
          </p>
          <span className="text-lg font-semibold text-primary">{targetTemp}°C</span>
        </div>
        <Slider
          value={targetTemp}
          min={16}
          max={30}
          step={1}
          onValueChange={(value) => setTargetTemp(toSingleValue(value))}
          onValueCommitted={commitTemp}
        />
      </div>

      <div>
        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">
          风速
        </p>
        <div className="grid grid-cols-4 gap-2">
          {FAN_SPEEDS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => changeFanSpeed(item.value)}
              className={`rounded-full py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                fanSpeed === item.value
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-white/50 text-on-surface-variant hover:bg-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-sm text-on-surface-variant">摆风</span>
        <Switch checked={swing} onCheckedChange={toggleSwing} size="sm" />
      </div>
    </div>
  )
}
